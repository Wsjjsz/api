# API Backend Master

一个基于 Spring Boot + Dubbo + Nacos + Gateway + Ant Design Pro 的 API 开放平台示例项目。

项目包含 4 个核心运行服务：

- `api-backend`：管理后台业务服务（用户、接口管理、统计等）
- `api-interface`：真实接口提供服务（随机姓名、随机数、星座等）
- `api-gateway`：统一网关（鉴权、签名校验、路由转发、调用计数）
- `api-frontend`：前端管理台

## 技术栈

- 后端：Java 8, Spring Boot 2.7.x, MyBatis-Plus, Redis
- 服务治理：Apache Dubbo 3.x, Nacos 2.x
- 网关：Spring Cloud Gateway
- 前端：Ant Design Pro（Umi / React）
- 部署：Docker / Docker Compose

## 项目结构

```text
.
├── src/                      # 主后端（api-backend）源码
├── api-common/               # 公共实体、RPC 接口
├── api-client-sdk/           # 客户端 SDK（签名工具等）
├── api-interface/            # 接口提供服务（8123）
├── api-gateway/              # 网关服务（8090）
├── api-frontend/             # 前端管理台（开发默认 8000）
├── sql/create_table.sql      # 初始化数据库脚本
├── scripts/                  # 本地开发与镜像构建脚本
├── docker-compose.prod.yml   # 生产容器编排
└── doc/                      # 本地开发/生产部署文档
```

## 请求链路

开发环境默认链路如下：

`Browser(8000) -> Gateway(8090) -> Backend(7529) / Interface(8123)`

- 前端开发代理：`api-frontend/config/proxy.ts`
- 网关路由配置：`api-gateway/src/main/resources/application.yml`

## 本地开发

### 1. 环境要求

- JDK 8
- Node.js 16+
- MySQL 8.x
- Redis（可选，开发默认可不启用 session-redis）
- Nacos 2.x（Dubbo 注册推荐）

### 2. 初始化数据库

```bash
mysql -uroot -p < sql/create_table.sql
```

### 3. 设置环境变量（推荐）

```bash
export API_DB_URL='jdbc:mysql://localhost:3306/api'
export API_DB_USERNAME='root'
export API_DB_PASSWORD='your_password'
export API_REDIS_PASSWORD='your_redis_password'
export API_INNER_TOKEN='api-inner-token'
export API_CLIENT_ACCESS_KEY='your_access_key'
export API_CLIENT_SECRET_KEY='your_secret_key'
```

### 4. 一键启动

```bash
./scripts/dev-up.sh
```

脚本启动顺序：

1. `api-backend`（`7529`）
2. `api-interface`（`8123`）
3. `api-gateway`（`8090`）
4. `api-frontend`（`8000`）

日志位置：`.run/*.log`

### 5. 联调检查

```bash
./scripts/dev-check.sh
```

默认会检查：

- `http://localhost:7529/api/user/get/login`
- `http://localhost:8123/api/name/random`
- `http://localhost:8090/api/user/get/login`
- `http://localhost:8000`
- 通过网关发起带签名调用 `/api/random/number`

### 6. 停止服务

```bash
./scripts/dev-down.sh
```

## 生产部署（Docker Compose）

### 1. 配置 `.env`

```bash
cp .env.example .env
```

必须配置以下变量：

- 镜像地址：`IMAGE_API_BACKEND` `IMAGE_API_GATEWAY` `IMAGE_API_INTERFACE` `IMAGE_API_FRONTEND`
- 基础配置：`MYSQL_DATABASE` `MYSQL_ROOT_PASSWORD` `API_REDIS_PASSWORD`
- 业务密钥：`API_INNER_TOKEN` `API_CLIENT_ACCESS_KEY` `API_CLIENT_SECRET_KEY`
- 网关配置：`API_IP_WHITELIST` `API_INTERFACE_HOSTS`

### 2. 启动生产环境

```bash
docker compose --env-file .env -f docker-compose.prod.yml up -d
docker compose --env-file .env -f docker-compose.prod.yml ps
```

## 镜像构建与推送

使用脚本批量构建并推送到镜像仓库：

```bash
export TCR_REGISTRY=ccr.ccs.tencentyun.com
export TCR_NAMESPACE=your-namespace
export BASE_REGISTRY=docker.io
bash scripts/docker-build-push.sh v1.3.0
```

脚本会构建并推送：

- `api-backend`
- `api-gateway`
- `api-interface`
- `api-frontend`

## 常见问题

### `IP_NOT_ALLOWED`

- 检查 `API_IP_WHITELIST` 是否放行来源 IP
- 检查网关容器环境变量是否已生效（必要时重启容器）

### `INTERFACE_NOT_FOUND`

- 检查 `interface_info.url` 是否与实际调用路径匹配
- 检查 `API_INTERFACE_HOSTS` 是否包含数据库 URL 使用的 host

## 参考文档

- 本地开发：`doc/LOCAL_DEV.md`
- 生产部署：`doc/PROD_DEPLOY_CONFIG_GUIDE.md`