# 第一阶段：构建前端应用
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 使用中科大 Alpine 镜像源（大陆加速）
RUN sed -i 's#https://dl-cdn.alpinelinux.org#https://mirrors.ustc.edu.cn#g' /etc/apk/repositories

# 安装依赖（sqlite3 需要编译，需先安装构建工具链；py3-setuptools 提供 Python 3.12 移除的 distutils）
RUN apk add --no-cache python3 py3-setuptools make g++ \
    && npm install --registry=https://registry.npmmirror.com

# 复制前端源代码
COPY src/ ./src/
COPY public/ ./public/
COPY .env ./

# 剥离 .env 中的行内注释（react-scripts 内置 dotenv@10 不支持行内注释，会把注释读进值里）
RUN sed -i -E 's/[[:space:]]+#.*$//' .env

# 由示例生成前端配置文件（如需自定义配置，可在本地修改 src/config/client_config_sample.js）
RUN cp src/config/client_config_sample.js src/config/client_config.js

# 构建前端应用（生产环境关闭sourcemap，减小产物体积）
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# 第二阶段：构建后端应用并运行
FROM node:18-alpine

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 复用构建阶段已安装并编译好（含sqlite3原生模块）的依赖，剔除开发依赖
# 避免重复下载依赖和编译sqlite3，无需再安装编译工具链
COPY --from=frontend-builder /app/node_modules ./node_modules
RUN npm prune --omit=dev

# 复制后端源代码
COPY server/ ./server/

# 由示例生成后端配置文件
RUN cp server/config/server_config_sample.js server/config/server_config.js

# 复制构建好的前端应用
COPY --from=frontend-builder /app/build ./build

# 暴露端口（前后端共用9000）
EXPOSE 9000

# 设置环境变量
ENV NODE_ENV=production

# 启动命令（单进程同时提供API和前端页面）
CMD ["node", "./server/server.js"]
