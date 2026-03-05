import Redis from 'ioredis';
import { logger } from './logger.js';
import serverConfig from '../config/server_config.js';

// Redis连接配置
const redisConfig = {
  host: process.env.REDIS_HOST || serverConfig.redisHost || 'localhost',
  port: process.env.REDIS_PORT || serverConfig.redisPort || 6379,
  password: process.env.REDIS_PASSWORD || serverConfig.redisPassword || '',
  db: process.env.REDIS_DB || serverConfig.redisDB || 0,
};

// Redis客户端实例
let redisClient = null;

// 初始化Redis连接
async function initRedis() {
  try {
    // 设置最大重连次数为3次
    const redisOptions = {
      ...redisConfig,
      retryStrategy: (times) => {
        // 最多重连3次
        if (times > 3) {
          logger.error('Redis connection failed after 3 attempts, giving up');
          return null; // 停止重连
        }
        // 每次重连间隔1秒
        return 1000;
      },
      maxRetriesPerRequest: 1
    };
    
    redisClient = new Redis(redisOptions);
    
    redisClient.on('error', (err) => {
      logger.error('Redis connection error:', err);
    });
    
    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });
    
    redisClient.on('end', () => {
      logger.info('Redis connection closed');
    });
    
    // 测试连接
    await redisClient.ping();
    logger.info('Redis initialization successful');
    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    // 如果Redis连接失败，不影响应用启动，只是会回退到使用Session和Cookie
    return null;
  }
}

// 获取Redis客户端
function getRedisClient() {
  return redisClient;
}

// 设置鉴权信息到Redis
async function setAuthInfo(key, value, expiration = 7200) { // 默认2小时过期
  try {
    if (!redisClient) {
      return false;
    }
    await redisClient.setex(key, expiration, JSON.stringify(value));
    logger.debug(`Auth info set to Redis: ${key}`);
    return true;
  } catch (error) {
    logger.error('Error setting auth info to Redis:', error);
    return false;
  }
}

// 从Redis获取鉴权信息
async function getAuthInfo(key) {
  try {
    if (!redisClient) {
      return null;
    }
    const value = await redisClient.get(key);
    if (value) {
      logger.debug(`Auth info retrieved from Redis: ${key}`);
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    logger.error('Error getting auth info from Redis:', error);
    return null;
  }
}

// 从Redis删除鉴权信息
async function deleteAuthInfo(key) {
  try {
    if (!redisClient) {
      return false;
    }
    await redisClient.del(key);
    logger.debug(`Auth info deleted from Redis: ${key}`);
    return true;
  } catch (error) {
    logger.error('Error deleting auth info from Redis:', error);
    return false;
  }
}

export {
  initRedis,
  getRedisClient,
  setAuthInfo,
  getAuthInfo,
  deleteAuthInfo
};
