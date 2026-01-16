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

// 缓存tenant_access_token
let tenantAccessTokenCache = {
  token: '',
  expiresAt: 0
};

// 获取 tenant_access_token
async function getTenantAccessToken() {
    // 检查缓存是否有效
    if (tenantAccessTokenCache.token && Date.now() < tenantAccessTokenCache.expiresAt) {
        return tenantAccessTokenCache.token;
    }
    
    try {
        const response = await axios.post("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
            "app_id": serverConfig.feishuAppId,
            "app_secret": serverConfig.feishuAppSecret
        }, { headers: { "Content-Type": "application/json" } });

        if (response.data.code === 0) {
            // 缓存token，设置过期时间为1小时（比实际过期时间少10分钟）
            tenantAccessTokenCache.token = response.data.tenant_access_token;
            tenantAccessTokenCache.expiresAt = Date.now() + (3500 * 1000);
            return response.data.tenant_access_token;
        } else {
            logger.error('获取 tenant_access_token 失败:', response.data);
            return null;
        }
    } catch (error) {
        logger.error('请求 tenant_access_token 时出错:', error);
        return null;
    }
}

/**
 * 批量获取用户信息，将openid转换为userid
 * @param {string[]} openIds - openid数组
 * @returns {Promise<Object>} openid到userid的映射
 */
async function batchGetUserInfo(openIds) {
  logger.debug('批量获取用户信息 - 输入openIds:', openIds);
  
  if (!openIds || openIds.length === 0) {
    logger.debug('批量获取用户信息 - openIds为空，返回空对象');
    return {};
  }

  try {
    const tenantAccessToken = await getTenantAccessToken();
    logger.debug('批量获取用户信息 - tenantAccessToken获取成功');
    
    const userMap = {};
    const batchSize = 50; // 飞书API限制一次最多50个
    
    // 分批处理，每次最多50个
    for (let i = 0; i < openIds.length; i += batchSize) {
      const batchOpenIds = openIds.slice(i, i + batchSize);
      logger.debug(`批量获取用户信息 - 处理批次 ${Math.floor(i/batchSize) + 1}，openIds数量: ${batchOpenIds.length}`);
      
      // 构建当前批次的URL，处理user_ids参数
      let url = 'https://open.feishu.cn/open-apis/contact/v3/users/batch?user_id_type=open_id';
      batchOpenIds.forEach(openId => {
        url += `&user_ids=${encodeURIComponent(openId)}`;
      });
      logger.debug(`批量获取用户信息 - 批次 ${Math.floor(i/batchSize) + 1} 请求URL: ${url}`);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${tenantAccessToken}`,
          'Content-Type': 'application/json; charset=utf-8'
        }
      });
      
      logger.debug(`批量获取用户信息 - 批次 ${Math.floor(i/batchSize) + 1} 响应数据:`, response.data);

      if (response.data.code === 0) {
        // 合并当前批次的结果到userMap
        logger.debug(`批量获取用户信息 - 批次 ${Math.floor(i/batchSize) + 1} 响应data:`, response.data.data);
        const userList = response.data.data?.items || [];
        logger.debug(`批量获取用户信息 - 批次 ${Math.floor(i/batchSize) + 1} items:`, userList);
        
        if (Array.isArray(userList)) {
          logger.debug(`批量获取用户信息 - 批次 ${Math.floor(i/batchSize) + 1} items长度: ${userList.length}`);
          userList.forEach(user => {
            logger.debug(`批量获取用户信息 - 处理用户:`, user);
            if (user.open_id && user.user_id) {
              userMap[user.open_id] = user.user_id;
              logger.debug(`批量获取用户信息 - 添加映射: ${user.open_id} -> ${user.user_id}`);
            } else {
              logger.warn(`批量获取用户信息 - 用户缺少必要字段:`, user);
            }
          });
        } else {
          logger.warn(`批量获取用户信息 - 批次 ${Math.floor(i/batchSize) + 1} items不是数组:`, userList);
        }
      } else {
        logger.error(`批量获取用户信息失败(批次 ${Math.floor(i/batchSize) + 1}):`, response.data);
        throw new Error(`批量获取用户信息失败: ${response.data.msg}`);
      }
    }
    
    logger.debug('批量获取用户信息 - 最终映射结果:', userMap);
    return userMap;
  } catch (error) {
    logger.error('批量获取用户信息请求错误:', error.response?.data || error);
    throw error;
  }
}

export {
    genH5AppLinkMeetingCode,
    genH5AppLinkMeetingUrl,
    getTenantAccessToken,
    batchGetUserInfo
};