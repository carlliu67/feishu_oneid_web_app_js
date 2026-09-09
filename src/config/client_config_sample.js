const clientConfig = {
    appId: process.env.REACT_APP_APPID || "", //网页应用appId
    feishuAppName: process.env.REACT_APP_APP_NAME || "腾讯会议", //网页应用名称
    // 后端服务配置（前后端同端口部署时无需设置，前端会自动使用相对路径请求）
    serverUrl: process.env.REACT_APP_SERVER_URL || "", //后端服务地址，仅前后端分离部署时设置
    serverProtocol: process.env.REACT_APP_SERVER_PROTOCOL || "http", //后端服务协议类型，http或https，仅配合 serverUrl 使用
    apiPort: process.env.REACT_APP_API_PORT || "9000",   //后端指定端口，仅配合 serverUrl 使用

    // 调试模式开关
    debugSwitch: process.env.REACT_APP_DEBUG_SWITCH === "true", //是否开启调试模式

    // 工作台应用打开模式
    mode: process.env.REACT_APP_MODE || 'upcoming', // 工作台应用打开模式，可选值：'app'（免登跳转腾讯会议客户端）、'upcoming'（展示待参加会议页面）、'schedule'（支持创建会议）

    // 会议默认参数配置
    only_user_join_type: parseInt(process.env.REACT_APP_ONLY_USER_JOIN_TYPE) || 1, // 成员入会限制类型，1：所有成员可入会，2：仅受邀成员可入会，3：仅企业内部成员可入会
    isShowWatermarkSwitch: process.env.REACT_APP_IS_SHOW_WATERMARK_SWITCH === "true", // 是否展示水印设置选项，true：展示，false：不展示，默认值为false
    allow_screen_shared_watermark: process.env.REACT_APP_ALLOW_SCREEN_SHARED_WATERMARK !== "false", // 是否开启水印，true：开启，false：不开启，默认值为true
    water_mark_type: parseInt(process.env.REACT_APP_WATER_MARK_TYPE) || 0, // 水印样式，0：单排，1：多排，默认值为0
    audio_watermark: process.env.REACT_APP_AUDIO_WATERMARK !== "false", // 是否开启音频水印，true：开启，false：不开启，默认值为true

    // 后端服务API路径，这部分参数不要修改
    getUserAccessTokenPath:  "/api/get_user_access_token", //免登api path
    getSignParametersPath:  "/api/get_sign_parameters", //鉴权api path;
    generateJoinSchemePath:  "/api/generateJoinScheme", //获取scheme url的api path
    generateJumpUrlPath:  "/api/generateJumpUrl", //获取免登跳转url的api path
    generateJoinUrlPath:  "/api/generateJoinUrl", //获取免登入会url的api path
    createMeetingPath:  "/api/create_meeting", //创建会议的api path
    queryUserEndedMeetingListPath:  "/api/query_user_ended_meeting_list", //获取用户已结束会议列表的api path
    queryUserMeetingListPath:  "/api/query_user_meeting_list", //获取用户会议列表的api path
    getUserInfoPath:  "/api/get_user_info", //获取用户信息的api path

    // 保活响应配置
    keepAlivePath: "/api/keep_alive", // 保活api path
    keepAliveResponse: {
        code: 0,
        message: "OK",
        data: {},
    },
    
    // 前端日志配置
    enableFrontendLog: process.env.REACT_APP_ENABLE_FRONTEND_LOG !== "false", // 是否启用前端日志收集
    logQueueSize: parseInt(process.env.REACT_APP_LOG_QUEUE_SIZE) || 100, // 日志队列最大大小
    logFlushInterval: parseInt(process.env.REACT_APP_LOG_FLUSH_INTERVAL) || 10000, // 日志刷新间隔(毫秒)
    
    // Web Worker 日志处理配置
    enableLogWorker: process.env.REACT_APP_ENABLE_LOG_WORKER !== "false", // 是否启用 Web Worker 处理日志
    logWorkerMaxRetryCount: parseInt(process.env.REACT_APP_LOG_WORKER_MAX_RETRY_COUNT) || 3, // 日志发送最大重试次数
    logWorkerBatchSize: parseInt(process.env.REACT_APP_LOG_WORKER_BATCH_SIZE) || 50, // 每批发送的最大日志数量
    
    // 生产环境日志配置
    productionLogConfig: {
        enableErrorLogOnly: process.env.REACT_APP_PROD_ENABLE_ERROR_ONLY !== "false", // 生产环境是否只记录错误日志
        enableStackTrace: process.env.REACT_APP_PROD_ENABLE_STACK_TRACE === "true", // 生产环境是否记录调用栈
        logLevel: process.env.REACT_APP_PROD_LOG_LEVEL || "error", // 生产环境日志级别: debug, info, warn, error
    }
}
    
export default clientConfig;