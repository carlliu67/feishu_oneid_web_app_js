import serverConfig from '../server_config.js';

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

export {
    genH5AppLinkMeetingCode,
    genH5AppLinkMeetingUrl
};