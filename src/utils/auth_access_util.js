import axios from 'axios';
import clientConfig from '../config/client_config.js';
import Cookies from 'js-cookie';

const LJ_TOKEN_KEY = 'lk_token'

/// ---------------- JSAPI鉴权 部分 -------------------------

export async function handleJSAPIAccess() {

    console.log("\n----------[接入方网页JSAPI鉴权处理 BEGIN]----------")
    const url = encodeURIComponent(window.location.href.split("#")[0]);
    console.log("接入方前端[JSAPI鉴权处理]第① 步: 请求JSAPI鉴权参数")
    // 向接入方服务端发起请求，获取鉴权参数
    var desUrl = `${getOrigin(clientConfig.apiPort)}${clientConfig.getSignParametersPath}?url=${url}`
    console.log("desUrl: " + desUrl)
    try {
        const res = await axios.get(desUrl,
            { withCredentials: true }
        )
        if (!res.data) {
            console.error(`${clientConfig.getSignParametersPath} fail`)
            //complete(false)
            return
        }

        const data = res.data
        console.log("接入方前端[JSAPI鉴权处理]第② 步: 获得鉴权参数")
        if (!data) {
            console.error('获取参数失败')
            //complete(false)
            return
        }
        return data
        // configJSAPIAccess(data, complete)
    } catch (error) {
        console.error("JSAPI鉴权请求失败");
        if (error.response) {
            console.error("错误响应数据:", error.response.msg);
        }
        throw error; // 重新抛出错误以便调用方处理
    }
}

//config JSAPI鉴权
export function configJSAPIAccess(data) {
    //配置要使用的jsapi列表
    let jsApiList = [
        "tt.chooseContact",
        "tt.openSchema",
    ]

    // 调用config接口进行鉴权
    window.h5sdk.config({
        appId: data.app_id,
        timestamp: data.timestamp,
        nonceStr: data.noncestr,
        signature: data.signature,
        jsApiList: jsApiList,
        //成功回调
        onSuccess: (res) => {
            console.log(`鉴权成功: ${JSON.stringify(res)}`);
            window.tt.showToast({
                title: "鉴权成功",
                icon: "success",
                duration: 2000
            });
            console.log("\n----------[接入方网页鉴权处理 END]----------")
        },
        //失败回调
        onFail: (err) => {
            window.tt.showToast({
                title: "鉴权失败",
                icon: "error",
                duration: 2000
            });
            console.error(`鉴权失败原因: ${JSON.stringify(err)}`);
        },
    });
}

/// ---------------- 应用免登 部分 -------------------------
//处理用户免登逻辑
export function handleUserAuth(complete) {

    console.log("\n----------[接入方网页免登处理 BEGIN]----------")
    let lj_tokenString = Cookies.get(LJ_TOKEN_KEY) || ""
    if (lj_tokenString.length > 0) {
        console.log("接入方前端[免登处理]第① 步: 用户已登录，请求后端验证...")
        requestUserAccessToken("", complete)
    } else {
        if (!window.h5sdk) {
            console.log('invalid h5sdk')
            complete()
            return
        }
        console.log("接入方前端[免登处理]第① 步: 依据App ID调用JSAPI tt.requestAuthCode 请求免登授权码")
        //依据App ID调用JSAPI tt.requestAuthCode 请求登录预授权码code
        window.h5sdk.ready(() => {
            console.log("window.h5sdk.ready");
            window.tt.requestAuthCode({
                appId: clientConfig.appId,
                success: (info) => {
                    const code = info.code
                    if (code.length <= 0) {
                        console.error('auth code为空')
                        complete()
                    } else {
                        requestUserAccessToken(code, complete)
                    }
                },
                fail: (error) => {
                    complete()
                    console.error("window.tt.requestAuthCode", error)
                }
            });
        });
    }
}

function requestUserAccessToken(code, complete) {

    // 获取user_access_token信息
    console.log("接入方前端[免登处理]第② 步: 去接入方服务端获取user_access_token信息")
    var desUrl = `${getOrigin(clientConfig.apiPort)}${clientConfig.getUserAccessTokenPath}?code=${code}`
    console.log("desUrl: " + desUrl)
    axios.get(desUrl,
        { withCredentials: true }   //调用时设置 请求带上cookie
    ).then(function (response) {  // ignore_security_alert
        if (!response.data) {
            console.error(`${clientConfig.getUserAccessTokenPath} response.data is null`)
            console.error("接口调用返回信息: ", response)
            complete()
            return
        }
        if (!response.data.data) {
            console.error(`${clientConfig.getUserAccessTokenPath} response.data.data is null`)
            console.error("接口调用返回信息: ", response)
            complete()
            return
        }
        const data = response.data.data
        console.log("data: ", data)
        if (data) {
            console.log("接入方前端[免登处理]第③ 步: 获取user_access_token信息")
            localStorage.setItem(LJ_TOKEN_KEY, data.access_token)
            console.log("----------[接入网页方免登处理 END]----------\n")
            complete(data)
        } else {
            console.error("接入方前端[免登处理]第③ 步: 未获取user_access_token信息")
            complete()
            console.log("----------[接入网页方免登处理 END]----------\n")
        }
    }).catch(function (error) {
        console.error(`${clientConfig.getUserAccessTokenPath} error`)
        if (error.response) {
            console.error("错误响应数据: ", error.response.msg)
        }
        console.log("----------[接入网页方免登处理 END]----------\n")
        complete()
    })
}

export function getOrigin(apiPort) {
    // console.log('process.env', process.env)
    if (clientConfig.serverUrl && clientConfig.serverUrl.length > 0) {
        return clientConfig.serverUrl + ":" + apiPort
    } else {
        let hostname = window.location.hostname
        return clientConfig.serverProtocol + `://${hostname}:${apiPort}`
    }
}
