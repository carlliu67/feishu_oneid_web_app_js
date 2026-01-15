import serverConfig from '../config/server_config.js';
import axios from 'axios';
import { logger } from '../util/logger.js';

// 生成Applink
function genH5AppLinkMeetingCode(meetingCode) {
    // 使用 const 声明变量
    const url = `${serverConfig.feishuHomeUrl}?meetingCode=${meetingCode}`;
    return `https://applink.feishu.cn/client/web_app/open?appId=${serverConfig.feishuAppId}&mode=appCenter&reload=false&lk_target_url=${encodeURIComponent(url)}`;
}

// 生成Applink
function genH5AppLinkMeetingUrl(targetUrl) {
    // 使用 const 声明变量
    const base64EncodedTargetUrl = Buffer.from(targetUrl).toString('base64');
    const url = `${serverConfig.feishuHomeUrl}?targetUrl=${base64EncodedTargetUrl}`;
    return `https://applink.feishu.cn/client/web_app/open?appId=${serverConfig.feishuAppId}&mode=appCenter&reload=false&lk_target_url=${encodeURIComponent(url)}`;
}

// 获取 tenant_access_token
async function getTenantAccessToken() {
    try {
        const response = await axios.post("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
            "app_id": serverConfig.feishuAppId,
            "app_secret": serverConfig.feishuAppSecret
        }, { headers: { "Content-Type": "application/json" } });

        if (response.data.code === 0) {
            return response.data.tenant_access_token;
        } else {
            logger.error('获取 tenant_access_token 失败:', response.data.msg);
            return null;
        }
    } catch (error) {
        logger.error('请求 tenant_access_token 时出错:', error);
        return null;
    }
}

export {
    genH5AppLinkMeetingCode,
    genH5AppLinkMeetingUrl,
    getTenantAccessToken
};