import CryptoJS from 'crypto-js';
import axios from 'axios';

import { logger } from '../util/logger.js';
import serverConfig from '../config/server_config.js'; // 根据实际路径调整
import { configAccessControl, okResponse, failResponse, setCookie } from '../server_util.js';
import { setAuthInfo, getAuthInfo } from '../util/redisManager.js';

const LJ_JSTICKET_KEY = 'lk_jsticket'
const LJ_TOKEN_KEY = 'lk_token'
const REDIS_PREFIX = 'feishu_auth:'

// 判断是否已登录
async function isLogin(ctx) {
    // 首先尝试从Session获取
    const lkToken = ctx.cookies.get(LJ_TOKEN_KEY) || '';
    const sessionAccessToken = ctx.session.userinfo;
    if (sessionAccessToken && sessionAccessToken.access_token && lkToken.length > 0 && sessionAccessToken.access_token === lkToken) {
        return true;
    }
    
    // 回退到使用Redis
    if (lkToken) {
        const accessToken = await getAuthInfo(`${REDIS_PREFIX}user_${lkToken}`);
        if (accessToken && accessToken.access_token === lkToken) {
            return true;
        }
    }
    
    return false;
}

// 获取userid
async function getUserid(ctx) {
    // 首先尝试从Session获取
    const sessionAccessToken = ctx.session.userinfo;
    if (sessionAccessToken) {
        return sessionAccessToken.user_id || '';
    }
    
    // 回退到使用Redis
    const lkToken = ctx.cookies.get(LJ_TOKEN_KEY) || '';
    if (lkToken) {
        const accessToken = await getAuthInfo(`${REDIS_PREFIX}user_${lkToken}`);
        if (accessToken) {
            return accessToken.user_id || '';
        }
    }
    
    return '';
}

//处理免登请求，返回用户的user_access_token
async function getUserAccessToken(ctx) {

    logger.info("\n-------------------[接入服务端免登处理 BEGIN]-----------------------------")
    configAccessControl(ctx)
    logger.info(`接入服务方第① 步: 接收到前端免登请求`)
    const lkToken = ctx.cookies.get(LJ_TOKEN_KEY) || ''
    
    // 首先尝试从Session获取
    const sessionAccessToken = ctx.session.userinfo
    if (sessionAccessToken && sessionAccessToken.access_token && lkToken.length > 0 && sessionAccessToken.access_token == lkToken) {
        logger.info("接入服务方第② 步: 从Session中获取user_access_token信息，用户已登录")
        ctx.body = okResponse(sessionAccessToken)
        logger.info("-------------------[接入服务端免登处理 END]-----------------------------\n")
        return
    }
    
    // 回退到使用Redis
    if (lkToken) {
        const redisAccessToken = await getAuthInfo(`${REDIS_PREFIX}user_${lkToken}`);
        if (redisAccessToken && redisAccessToken.access_token === lkToken) {
            logger.info("接入服务方第② 步: 从Redis中获取user_access_token信息，用户已登录")
            ctx.body = okResponse(redisAccessToken)
            logger.info("-------------------[接入服务端免登处理 END]-----------------------------\n")
            return
        }
    }

    let code = ctx.query["code"] || ""
    logger.info("接入服务方第② 步: 获取登录预授权码code")
    if (code.length == 0) { //code不存在
        ctx.body = failResponse("登录预授权码code is empty, please retry!!!")
        return
    }

    //【请求】app_access_token：https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/app_access_token_internal
    logger.info("接入服务方第③ 步: 根据AppID和App Secret请求应用授权凭证app_access_token")
    const internalRes = await axios.post("https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal", {
        "app_id": serverConfig.feishuAppId,
        "app_secret": serverConfig.feishuAppSecret
    }, { headers: { "Content-Type": "application/json" } })

    if (!internalRes.data) {
        ctx.body = failResponse("app_access_token request error")
        return
    }
    if (internalRes.data.code != 0) { //非0表示失败
        ctx.body = failResponse(`app_access_token request error: ${internalRes.data.msg}`)
        return
    }

    logger.info("接入服务方第④ 步: 获得颁发的应用授权凭证app_access_token")
    const app_access_token = internalRes.data.app_access_token || ""

    logger.info("接入服务方第⑤ 步: 根据登录预授权码code和app_access_token请求用户授权凭证user_access_token")
    //【请求】user_access_token: https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/authen-v1/access_token/create
    const authenv1Res = await axios.post("https://open.feishu.cn/open-apis/authen/v1/access_token", { "grant_type": "authorization_code", "code": code }, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Bearer " + app_access_token
        }
    })

    if (!authenv1Res.data) {
        ctx.body = failResponse("access_token request error")
        return
    }
    if (authenv1Res.data.code != 0) {  //非0表示失败
        ctx.body = failResponse(`access_token request error: ${authenv1Res.data.msg}`)
        return
    }

    logger.info("接入服务方第⑥ 步: 获取颁发的用户授权码凭证的user_access_token, 更新到Session和Redis，返回给前端")
    const newAccessToken = authenv1Res.data.data
    if (newAccessToken) {
        ctx.session.userinfo = newAccessToken
        const accessToken = newAccessToken.access_token || ''
        setCookie(ctx, LJ_TOKEN_KEY, accessToken)
        
        // 存储到Redis，过期时间设置为与access_token相同
        const expiration = newAccessToken.expires_in || 7200 // 默认2小时
        await setAuthInfo(`${REDIS_PREFIX}user_${accessToken}`, newAccessToken, expiration)
    } else {
        setCookie(ctx, LJ_TOKEN_KEY, '')
    }

    ctx.body = okResponse(newAccessToken)
    logger.info("-------------------[接入服务端免登处理 END]-----------------------------\n")
}

//处理鉴权参数请求，返回鉴权参数
async function getSignParameters(ctx) {

    logger.info("\n-------------------[接入方服务端鉴权处理 BEGIN]-----------------------------")
    //console.log(ctx)
    configAccessControl(ctx)
    logger.info(`接入服务方第① 步: 接收到前端鉴权请求`)

    const url = ctx.query["url"] || ""
    let tickeString = ctx.cookies.get(LJ_JSTICKET_KEY) || ""
    
    // 首先尝试从Cookie获取，本地不存在时再从Redis获取
    if (!tickeString) {
        const redisTicket = await getAuthInfo(`${REDIS_PREFIX}jsapi_ticket`);
        if (redisTicket) {
            tickeString = redisTicket;
            setCookie(ctx, LJ_JSTICKET_KEY, tickeString);
        }
    }
    
    if (tickeString.length > 0) {
        logger.info(`接入服务方第② 步: 获取jsapi_ticket，计算JSAPI鉴权参数，返回`)
        const signParam = calculateSignParam(tickeString, url)
        ctx.body = okResponse(signParam)
        logger.info("-------------------[接入方服务端鉴权处理 END]-----------------------------\n")
        return
    }

    logger.info(`接入服务方第② 步: 未检测到jsapi_ticket，根据AppID和App Secret请求自建应用授权凭证tenant_access_token`)
    //【请求】tenant_access_token：https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal
    const internalRes = await axios.post("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
        "app_id": serverConfig.feishuAppId,
        "app_secret": serverConfig.feishuAppSecret
    }, { headers: { "Content-Type": "application/json" } })

    if (!internalRes.data) {
        ctx.body = failResponse('tenant_access_token request error')
        return
    }
    if (internalRes.data.code != 0) {
        ctx.body = failResponse(`tenant_access_token request error: ${internalRes.data.msg}`)
        return
    }

    logger.info(`接入服务方第③ 步: 获得颁发的自建应用授权凭证tenant_access_token`)
    const tenant_access_token = internalRes.data.tenant_access_token || ""

    logger.info(`接入服务方第④ 步: 请求JSAPI临时授权凭证`)
    //【请求】jsapi_ticket：https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/h5_js_sdk/authorization
    const ticketRes = await axios.post("https://open.feishu.cn/open-apis/jssdk/ticket/get", {}, {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Bearer " + tenant_access_token
        }
    })

    if (!ticketRes.data) {
        ctx.body = failResponse('get jssdk ticket request error')
        return
    }
    if (ticketRes.data.code != 0) { //非0表示失败
        ctx.body = failResponse(`get jssdk ticket request error: ${ticketRes.data.msg}`)
        return
    }

    logger.info(`接入服务方第⑤ 步: 获得颁发的JSAPI临时授权凭证，更新到Cookie和Redis`)
    const newTicketString = ticketRes.data.data.ticket || ""
    if (newTicketString.length > 0) {
        setCookie(ctx, LJ_JSTICKET_KEY, newTicketString)
        // 存储到Redis，jsapi_ticket的有效期通常为7200秒
        await setAuthInfo(`${REDIS_PREFIX}jsapi_ticket`, newTicketString, 7200)
    }

    logger.info(`接入服务方第⑥ 步: 计算出JSAPI鉴权参数，并返回给前端`)
    const signParam = calculateSignParam(newTicketString, url)
    ctx.body = okResponse(signParam)
    logger.info("-------------------[接入方服务端鉴权处理 END]-----------------------------\n")
}

//计算鉴权参数
function calculateSignParam(tickeString, url) {
    const timestamp = (new Date()).getTime()
    const verifyStr = `jsapi_ticket=${tickeString}&noncestr=${serverConfig.wemeetAPPID}&timestamp=${timestamp}&url=${url}`
    let signature = CryptoJS.SHA1(verifyStr).toString(CryptoJS.enc.Hex)
    const signParam = {
        "app_id": serverConfig.feishuAppId,
        "signature": signature,
        "noncestr": serverConfig.wemeetAPPID,
        "timestamp": timestamp,
    }
    return signParam
}

export {
    getUserAccessToken,
    getSignParameters,
    isLogin,
    getUserid
};