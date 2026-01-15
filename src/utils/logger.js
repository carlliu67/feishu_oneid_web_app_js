import clientConfig from '../config/client_config.js';

class FrontendLogger {
  constructor() {
    // 从配置文件中读取参数
    this.isEnabled = clientConfig.enableFrontendLog !== false;
    
    // 生产环境下禁用详细日志
    if (process.env.NODE_ENV === 'production') {
      // 生产环境默认禁用，除非明确启用
      this.isEnabled = clientConfig.enableFrontendLog === true;
      
      // 生产环境日志级别控制
      this.prodLogLevel = clientConfig.productionLogConfig?.logLevel || 'error';
      this.enableErrorOnly = clientConfig.productionLogConfig?.enableErrorLogOnly !== false;
      this.enableStackTrace = clientConfig.productionLogConfig?.enableStackTrace === true;
    } else {
      // 开发环境默认启用所有日志
      this.prodLogLevel = 'debug';
      this.enableErrorOnly = false;
      this.enableStackTrace = true;
    }
  }
  
  // 获取北京时区的时间戳
  getBeijingTimestamp() {
    const now = new Date();
    // 获取UTC时间
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    // 北京时间是UTC+8，所以加上8小时
    const beijingTime = new Date(utcTime + (8 * 3600000));
    
    // 格式化为北京时间字符串，不使用toISOString()
    const year = beijingTime.getFullYear();
    const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
    const day = String(beijingTime.getDate()).padStart(2, '0');
    const hours = String(beijingTime.getHours()).padStart(2, '0');
    const minutes = String(beijingTime.getMinutes()).padStart(2, '0');
    const seconds = String(beijingTime.getSeconds()).padStart(2, '0');
    const milliseconds = String(beijingTime.getMilliseconds()).padStart(3, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+08:00`;
  }
  
  // 提取DingTalk部分userAgent
  extractDingTalkUserAgent(userAgent) {
    const dingTalkMatch = userAgent.match(/DingTalk\([^)]+\)/);
    return dingTalkMatch ? dingTalkMatch[0] : '';
  }
  
  // 获取调用栈信息，提取文件名和行号
  getCallerInfo() {
    // 如果调用栈被禁用，返回基本信息
    if (!this.enableStackTrace) {
      return {
        file: 'unknown',
        line: 0,
        function: 'anonymous'
      };
    }
    
    try {
      // 创建一个新的错误对象来获取调用栈
      const error = new Error();
      const stack = error.stack;
      
      if (!stack) {
        return {
          file: 'unknown',
          line: 0,
          function: 'anonymous'
        };
      }
      
      // 解析调用栈
      const stackLines = stack.split('\n');
      
      // 找到真正的调用者（非logger.js和frontendLogger的函数）
      let callerIndex = -1;
      let functionName = 'anonymous';
      let fileName = 'unknown';
      let lineNumber = 0;
      
      for (let i = 3; i < Math.min(stackLines.length, 10); i++) {
        const line = stackLines[i];
        
        // 跳过logger.js和frontendLogger相关的栈帧
        if (!line || line.includes('logger.js') || line.includes('frontendLogger')) {
          continue;
        }
        
        // 解析当前栈帧
        const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):\d+\)|at\s+(.+?):(\d+):\d+/);
        
        if (match) {
          if (match[1] && match[2] && match[3]) {
            // 格式: at functionName (filename:line:column)
            functionName = match[1];
            fileName = match[2];
            lineNumber = parseInt(match[3]);
          } else {
            // 格式: at filename:line:column
            functionName = 'anonymous';
            fileName = match[4];
            lineNumber = parseInt(match[5]);
          }
          
          callerIndex = i;
          break;
        }
      }
      
      // 如果没有找到有效的调用者，返回默认值
      if (callerIndex === -1) {
        return {
          file: 'unknown',
          line: 0,
          function: 'anonymous'
        };
      }
      
      // 清理函数名
      if (functionName && functionName !== 'anonymous') {
        // 如果函数名看起来像是代码片段而不是函数名，则标记为匿名函数
        if (functionName.includes('.') || functionName.includes('(') || functionName.includes('[')) {
          // 检查是否是方法调用
          if (functionName.includes('.')) {
            const parts = functionName.split('.');
            const lastPart = parts[parts.length - 1];
            // 如果最后一部分看起来像函数名，则使用它
            if (lastPart && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(lastPart)) {
              functionName = lastPart;
            } else {
              functionName = 'anonymous';
            }
          } else {
            functionName = 'anonymous';
          }
        }
        
        // 如果函数名太长，可能是表达式，标记为匿名函数
        if (functionName.length > 30) {
          functionName = 'anonymous';
        }
      }
      
      // 提取文件名（去掉路径）
      const justFileName = fileName ? fileName.split('/').pop() : 'unknown';
      
      const callerInfo = {
        file: fileName,
        line: lineNumber || 0,
        function: functionName || 'anonymous'
      };
      
      // 如果是打包文件，添加标记
      if (justFileName && (justFileName.includes('bundle') || justFileName.includes('chunk'))) {
        callerInfo.bundle = true;
      } else {
        callerInfo.bundle = false;
      }
      
      return callerInfo;
    } catch (error) {
      console.error('获取调用栈信息失败:', error);
    }
    
    return {
      file: 'unknown',
      line: 0,
      function: 'anonymous'
    };
  }
  
  // 检查日志级别是否应该记录
  shouldLog(level) {
    // 如果日志功能被禁用，则不记录
    if (!this.isEnabled) {
      return false;
    }
    
    // 生产环境下，如果只记录错误日志
    if (process.env.NODE_ENV === 'production' && this.enableErrorOnly && level !== 'error') {
      return false;
    }
    
    // 检查日志级别
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.prodLogLevel);
    const logLevelIndex = levels.indexOf(level);
    
    return logLevelIndex >= currentLevelIndex;
  }

  // 深度清理对象，移除函数和非可克隆值
  sanitizeObject(obj) {
    if (obj === null || typeof obj !== 'object') {
      // 移除函数
      if (typeof obj === 'function') {
        return '[Function]';
      }
      return obj;
    }
    
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    
    if (obj instanceof Array) {
      return obj.map(item => this.sanitizeObject(item)).filter(item => item !== '[Function]');
    }
    
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value !== 'function') {
          try {
            // 尝试克隆值，检测是否可序列化
            JSON.stringify(value);
            sanitized[key] = this.sanitizeObject(value);
          } catch (e) {
            // 如果不可序列化，使用字符串表示
            sanitized[key] = String(value);
          }
        }
      }
    }
    return sanitized;
  }

  // 添加日志到队列
  addLog(level, message, extra = {}) {
    // 检查是否应该记录此日志
    if (!this.shouldLog(level)) {
      return;
    }
    
    // 只有warn和error级别才获取调用栈信息，优化性能
    let callerInfo;
    if (level === 'warn' || level === 'error') {
      callerInfo = this.getCallerInfo();
    } else {
      // 其他级别提供默认信息
      callerInfo = {
        file: 'unknown',
        line: 0,
        function: 'anonymous',
        bundle: false
      };
    }
    
    // 清理额外数据，移除函数和不可克隆值
    const sanitizedExtra = this.sanitizeObject(extra);
    
    // 构建日志对象（仅用于调试）
    const logEntry = {
      timestamp: this.getBeijingTimestamp(),
      level: level,
      message: message,
      url: window.location.href,
      userAgent: this.extractDingTalkUserAgent(navigator.userAgent),
      ...callerInfo,
      ...sanitizedExtra
    };
    
    // 开发环境下，可以在控制台显示完整日志对象
    if (process.env.NODE_ENV !== 'production' && level === 'debug') {
      console.debug('完整日志对象:', logEntry);
    }
  }
  
  // 调试日志
  debug(message, extra = {}) {
    this.addLog('debug', message, extra);
    console.debug(message, extra);
  }
  
  // 信息日志
  info(message, extra = {}) {
    this.addLog('info', message, extra);
    console.info(message, extra);
  }
  
  // 警告日志
  warn(message, extra = {}) {
    this.addLog('warn', message, extra);
    console.warn(message, extra);
  }
  
  // 错误日志
  error(message, extra = {}) {
    this.addLog('error', message, extra);
    console.error(message, extra);
  }
}

// 创建单例实例
export const frontendLogger = new FrontendLogger();