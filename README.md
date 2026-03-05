# 飞书腾讯会议集成应用

## 项目介绍

这是一个集成飞书和腾讯会议的Web应用，提供会议预约、管理和监控功能。

## 技术栈

- **前端**：React 18, Ant Design 5
- **后端**：Koa 2, Node.js 18
- **数据库**：MySQL / SQLite
- **集成**：飞书API, 腾讯会议API

## 快速开始

### 环境要求

- Node.js 18+
- npm 8+
- Docker (可选，用于容器化部署)

### 本地开发

1. **安装依赖**

```bash
npm install
```

2. **配置环境变量**

复制 `.env.example` 文件为 `.env` 并填写相关配置：

```bash
cp .env.example .env
# 编辑 .env 文件，填写必要的配置信息
```

3. **启动开发服务器**

```bash
npm start
```

前端应用将运行在 `http://localhost:9000`，后端服务将运行在 `http://localhost:9001`。

## Docker部署

### 环境要求

- Docker
- Docker Compose

### 部署步骤

1. **配置环境变量**

复制 `.env.example` 文件为 `.env` 并填写相关配置：

```bash
cp .env.example .env
# 编辑 .env 文件，填写必要的配置信息
```

2. **构建和启动服务**

```bash
docker compose up -d
```

3. **访问应用**

应用将运行在 `http://localhost:9000`，后端API将运行在 `http://localhost:9001`。

### 服务管理

- **查看服务状态**

```bash
docker compose ps
```

- **查看服务日志**

```bash
docker compose logs
```

- **停止服务**

```bash
docker compose down
```

- **重启服务**

```bash
docker compose restart
```

## 项目结构

```
├── data/             # 数据目录
├── public/           # 前端静态资源
├── server/           # 后端代码
│   ├── config/       # 服务器配置
│   ├── db/           # 数据库适配器
│   ├── feishuapi/    # 飞书API集成
│   ├── util/         # 工具函数
│   ├── wemeet/       # 腾讯会议API集成
│   └── server.js     # 服务器入口
├── src/              # 前端代码
│   ├── components/   # 前端组件
│   ├── config/       # 前端配置
│   ├── pages/        # 前端页面
│   ├── utils/        # 前端工具函数
│   ├── App.js        # 前端应用入口
│   └── index.js      # 前端渲染入口
├── .env.example      # 环境变量示例
├── Dockerfile        # Docker构建文件
├── docker-compose.yml # Docker Compose配置
├── package.json      # 项目依赖
└── README.md         # 项目文档
```

## 配置说明

### 前端配置

- `APPID`：应用ID
- `APP_NAME`：应用名称
- `SERVER_URL`：服务器URL
- `SERVER_PROTOCOL`：服务器协议（http/https）
- `API_PORT`：API端口

### 后端配置

- `FEISHU_APP_ID`：飞书应用ID
- `FEISHU_APP_SECRET`：飞书应用密钥
- `WEMEET_APPID`：腾讯会议应用ID
- `WEMEET_REST_API_SDKID`：腾讯会议SDKID
- `WEMEET_REST_API_SECRETID`：腾讯会议SecretID
- `WEMEET_REST_API_SECRETKEY`：腾讯会议SecretKey

### 数据库配置

- `DB_TYPE`：数据库类型（mysql/sqlite）
- `DB_HOST`：数据库主机
- `DB_PORT`：数据库端口
- `DB_USER`：数据库用户
- `DB_PASSWORD`：数据库密码
- `DB_DATABASE`：数据库名称

## 注意事项

1. **飞书应用配置**：需要在飞书开放平台创建应用并获取App ID和App Secret。

2. **腾讯会议配置**：需要在腾讯会议开放平台创建应用并获取相关配置。

3. **数据库配置**：使用Docker部署时，默认使用外部MySQL数据库服务，需要在 `.env` 文件中配置数据库连接信息。

4. **端口配置**：默认使用以下端口：
   - 前端应用：9000
   - 后端API：9001
   - MySQL数据库：3306

## 故障排查

### 常见问题

1. **服务启动失败**：检查环境变量配置是否正确，特别是数据库连接信息。

2. **API调用失败**：检查飞书和腾讯会议的API配置是否正确，确保App ID和Secret有效。

3. **数据库连接失败**：检查数据库服务是否正常运行，连接信息是否正确。

### 日志查看

```bash
docker compose logs app
```

## 许可证

MIT License
