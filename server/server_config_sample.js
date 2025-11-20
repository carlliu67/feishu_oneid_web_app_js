const config = {
    feishuAppId: "", //网页应用appId
    feishuAppSecret: "", //网页应用secret
    feishuAppName: "腾讯会议", //网页应用名称
    feishuHomeUrl: "http://ss.liuqi92.cn:9001", //网页应用首页地址
    noncestr: "NHAE8YseTyB2sMjxdwhRiTWmaSbAWhny",   //随机字符串，用于鉴权签名用
    apiPort: "9000",   //后端指定端口
    wemeetAPPID: "",   //腾讯会议应用APPID
    wemeetRestAPISDKID: "",   //腾讯会议应用SDKID
    wemeetRestAPISecretID: "",   //腾讯会议API应用SecretID
    wemeetRestAPISecretKey: "",   //腾讯会议API应用SecretKey
    wemeetRestAPIServerUrl: "https://api.meeting.qq.com",   //腾讯会议API应用服务地址
    wemmetWebhookToken: "",   //腾讯会议webhook回调token
    wemeetWebhookAESKey: "",   //腾讯会议webhook回调AES密钥
    wemeetSSOURL: "",   //腾讯会议免登链接前缀地址
    getUserAccessTokenPath:  "/api/get_user_access_token", //免登-获取user_access_token的api path
    getSignParametersPath:  "/api/get_sign_parameters", //鉴权-获取鉴权参数的api path
    createMeetingPath:  "/api/create_meeting", //创建会议的api path
    queryUserEndedMeetingListPath:  "/api/query_user_ended_meeting_list", //获取用户已结束会议列表的api path
    queryUserMeetingListPath:  "/api/query_user_meeting_list", //获取用户会议列表的api path
    generateJoinSchemePath:  "/api/generateJoinScheme", //获取scheme url的api path
    generateJumpUrlPath:  "/api/generateJumpUrl", //获取免登跳转url的api path
    generateJoinUrlPath:  "/api/generateJoinUrl", //获取免登入会url的api path
    webhookPath:  "/api/webhook", //webhook回调的api path
    logLevel: "info", // 日志级别，可选值：debug, info, warn, error
};

export default config;