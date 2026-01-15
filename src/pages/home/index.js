import { useState, useEffect } from 'react';
import MeetingList from './meeting/index.js';
import { handleJSAPIAccess, handleUserAuth, configJSAPIAccess } from '../../utils/auth_access_util.js';
import { handleGenerateJoinScheme, handleGenerateJumpUrl } from '../../components/wemeetapi/wemeetApi.js';
import './index.css';
import clientConfig from '../../config/client_config.js';

export default function Home() {
    const [userInfo, setUserInfo] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // 获取 URL 中的查询参数
        const searchParams = new URLSearchParams(window.location.search);
        const params = {};
        for (const [key, value] of searchParams.entries()) {
            params[key] = value;
        }

        // 处理流程：先处理 JSAPI 鉴权，再处理用户免登
        const initApp = async () => {
            try {
                // 1. 先处理 JSAPI 鉴权（如果是 schedule 模式）
                if (clientConfig.mode === 'schedule') {
                    const jsapiData = await handleJSAPIAccess();
                    if (jsapiData) {
                        console.log('JSAPI鉴权参数获取成功');
                        configJSAPIAccess(jsapiData.data);
                    }
                }

                // 2. 再处理用户免登
                handleUserAuth((userInfo) => {
                    setUserInfo(userInfo);
                    console.log('userInfo: ', userInfo);
                    if (params.meetingCode) {
                        // 处理 code 参数
                        console.log('meetingCode:', params.meetingCode);
                        setIsLoaded(false);
                        handleGenerateJoinScheme(params.meetingCode, true)
                    } else if (params.targetUrl) {
                        // 处理 targetUrl 参数
                        console.log('targetUrl:', params.targetUrl);
                        setIsLoaded(false);
                        handleGenerateJumpUrl(params.targetUrl, true)
                    } else if (userInfo) {
                        // 只有获取到用户信息时才设置为 true
                        setIsLoaded(true);
                    }
                });
            } catch (error) {
                console.error('初始化应用失败:', error);
                // 即使初始化失败，也设置 isLoaded 为 true，避免页面一直加载
                // setIsLoaded(true);
            }
        };

        initApp();
    }, []);

    if (clientConfig.mode === 'app') {
        // 当isLoaded为true 时唤起腾讯会议客户端
        if (isLoaded) {
            handleGenerateJoinScheme('', true);
        }

        return (
            <div>正在打开腾讯会议客户端，请稍后...</div>
        );
    } else {
        return (
            // 只有当 userInfo 已经获取到才渲染页面
            isLoaded ? (
                <div className="home">
                    {/* <UserInfo userInfo={userInfo} /> */}
                    <MeetingList userInfo={userInfo} />
                    {/* <pre>{JSON.stringify(uriParams, null, 2)}</pre> */}
                </div>
            ) : (
                // 在 userInfo 未获取到之前，可以显示加载提示
                <div>正在打开中...</div>
            )
        )
    }


}