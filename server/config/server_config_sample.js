import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

const config = {
    feishuAppId: process.env.FEISHU_APP_ID || "", //网页应用appId
    feishuAppSecret: process.env.FEISHU_APP_SECRET || "", //网页应用secret
    feishuAppName: process.env.FEISHU_APP_NAME || "腾讯会议", //网页应用名称
    feishuHomeUrl: process.env.FEISHU_HOME_URL || "", //网页应用首页地址
    calendarSwitch: true, //预约普通会议是是否创建钉钉日程，对周期会议不生效，周期会议固定会创建日程

    // server运行参数配置
    apiPort: process.env.API_PORT || "9000",   //服务端口（前后端共用）

    // 腾讯会议对接参数
    wemeetAPPID: process.env.WEMEET_APPID || "",   //腾讯会议应用APPID
    wemeetRestAPISDKID: process.env.WEMEET_REST_API_SDKID || "",   //腾讯会议应用SDKID
    wemeetRestAPISecretID: process.env.WEMEET_REST_API_SECRETID || "",   //腾讯会议API应用SecretID
    wemeetRestAPISecretKey: process.env.WEMEET_REST_API_SECRETKEY || "",   //腾讯会议API应用SecretKey
    wemeetWebhookToken: process.env.WEMEET_WEBHOOK_TOKEN || "",   //腾讯会议webhook回调token
    wemeetWebhookAESKey: process.env.WEMEET_WEBHOOK_AESKEY || "",   //腾讯会议webhook回调AES密钥
    wemeetSSOURL: process.env.WEMEET_SSOURL || "",   //腾讯会议IDaaS/Oneid免登链接前缀地址，需要替换成自己所在环境的地址
    wemeetRestAPIServerUrl: "https://api.meeting.qq.com",   //腾讯会议API应用服务地址，不需要替换
    adminUserid: process.env.ADMIN_USERID || "",   //管理员用户ID，用于调用腾讯会议API

    // app server接口配置，这部分参数不要修改
    getUserAccessTokenPath:  "/api/get_user_access_token", //免登-获取user_access_token的api path
    getSignParametersPath:  "/api/get_sign_parameters", //鉴权-获取鉴权参数的api path
    createMeetingPath:  "/api/create_meeting", //创建会议的api path
    queryUserEndedMeetingListPath:  "/api/query_user_ended_meeting_list", //获取用户已结束会议列表的api path
    queryUserMeetingListPath:  "/api/query_user_meeting_list", //获取用户会议列表的api path
    getUserInfoPath:  "/api/get_user_info", //获取用户信息的api path
    generateJoinSchemePath:  "/api/generateJoinScheme", //获取scheme url的api path
    generateJumpUrlPath:  "/api/generateJumpUrl", //获取免登跳转url的api path
    generateJoinUrlPath:  "/api/generateJoinUrl", //获取免登入会url的api path

    // webhook server接口配置，webhookPath不要修改
    webhookPath:  "/api/webhook", //webhook回调的api path
    webhookRateLimit: 1000, // 每秒处理的请求数
    webhookCapacity: 5000, // 最大并发请求数
    webhookMaxConcurrent: 5, // 最大并发处理数

    // 数据库对接参数
    dbType: process.env.DB_TYPE || "sqlite", // 数据库类型："sqlite" 或 "mysql"
    dbHost: process.env.DB_HOST || "", // MySQL 数据库主机
    dbPort: process.env.DB_PORT || 3306, // MySQL 数据库端口
    dbUser: process.env.DB_USER || "", // MySQL 数据库用户名
    dbPassword: process.env.DB_PASSWORD || "", // MySQL 数据库密码
    dbDatabase: process.env.DB_DATABASE || "", // MySQL 数据库名称
    
    // Redis对接参数
    redisHost: process.env.REDIS_HOST || "localhost", // Redis 主机
    redisPort: process.env.REDIS_PORT || 6379, // Redis 端口
    redisPassword: process.env.REDIS_PASSWORD || "", // Redis 密码
    redisDB: process.env.REDIS_DB || 0, // Redis 数据库索引

    // 服务端日志打印
    logLevel: process.env.LOG_LEVEL || "info", // 日志级别，可选值：debug, info, warn, error
    
    // 保持alive配置
    keepAlivePath: "/keepalive",
    keepAliveResponse: "ok"
};

export default config;
