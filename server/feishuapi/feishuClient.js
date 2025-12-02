import lark from '@larksuiteoapi/node-sdk';
import serverConfig from '../config/server_config.js'; // 导入 serverConfig

const client = new lark.Client({
    appId: serverConfig.feishuAppId,
    appSecret: serverConfig.feishuAppSecret,
    // disableTokenCache为true时，SDK不会主动拉取并缓存token，这时需要在发起请求时，调用lark.withTenantToken("token")手动传递
    // disableTokenCache为false时，SDK会自动管理租户token的获取与刷新，无需使用lark.withTenantToken("token")手动传递token
    disableTokenCache: true
});

export {
    client
};