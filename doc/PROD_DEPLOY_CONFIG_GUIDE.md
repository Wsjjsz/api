# 腾讯云 Docker 部署配置说明书

## 1. 准备配置文件

在项目根目录执行：

```bash
cp .env.example .env
```

然后编辑 `.env`，将占位符改为真实值。

## 2. `.env` 字段说明

### 镜像地址（必填）

- `IMAGE_API_BACKEND`：后端服务镜像
- `IMAGE_API_GATEWAY`：网关服务镜像
- `IMAGE_API_INTERFACE`：接口服务镜像
- `IMAGE_API_FRONTEND`：前端服务镜像

格式示例：

```text
ccr.ccs.tencentyun.com/<命名空间>/<镜像名>:v1.1.0
```

### 端口与基础组件

- `FRONTEND_PORT`：前端对外端口，通常填 `80`
- `NACOS_PORT`：Nacos 端口，通常填 `8848`
- `MYSQL_DATABASE`：数据库名，建议 `api`
- `MYSQL_ROOT_PASSWORD`：MySQL root 密码（强密码）
- `API_REDIS_PASSWORD`：Redis 密码（强密码）

### 项目密钥（必填）

- `API_INNER_TOKEN`：网关调用后端内部接口鉴权令牌
- `API_CLIENT_ACCESS_KEY`：平台调用 AccessKey
- `API_CLIENT_SECRET_KEY`：平台调用 SecretKey

### 网关新增配置（本次改造）

- `API_IP_WHITELIST`：网关来源 IP 白名单，支持逗号分隔
  - `*`：不限制来源 IP（推荐结合腾讯云安全组限制）
  - 示例：`1.2.3.4,5.6.7.8`
- `API_INTERFACE_HOSTS`：接口 URL 匹配时使用的 host 候选列表（逗号分隔）
  - 推荐：`http://localhost:8123,http://api-interface:8123`

## 3. 推荐生产值模板

```env
IMAGE_API_BACKEND=ccr.ccs.tencentyun.com/your-namespace/api-backend:v1.1.0
IMAGE_API_GATEWAY=ccr.ccs.tencentyun.com/your-namespace/api-gateway:v1.1.0
IMAGE_API_INTERFACE=ccr.ccs.tencentyun.com/your-namespace/api-interface:v1.1.0
IMAGE_API_FRONTEND=ccr.ccs.tencentyun.com/your-namespace/api-frontend:v1.1.0

FRONTEND_PORT=80
NACOS_PORT=8848

MYSQL_DATABASE=api
MYSQL_ROOT_PASSWORD=请替换强密码
API_REDIS_PASSWORD=请替换强密码

API_INNER_TOKEN=请替换32位以上随机串
API_CLIENT_ACCESS_KEY=请替换AK
API_CLIENT_SECRET_KEY=请替换SK

API_IP_WHITELIST=*
API_INTERFACE_HOSTS=http://localhost:8123,http://api-interface:8123
```

## 4. 启动命令

```bash
docker compose --env-file .env -f docker-compose.prod.yml up -d
docker compose --env-file .env -f docker-compose.prod.yml ps
```

## 5. 常见问题

### 5.1 出现 `IP_NOT_ALLOWED`

检查：

1. `.env` 的 `API_IP_WHITELIST` 是否包含调用方 IP
2. 网关容器环境变量是否已生效（重启容器后再测）

### 5.2 出现 `INTERFACE_NOT_FOUND`

检查：

1. `interface_info.url` 是否与请求路径对应
2. `.env` 的 `API_INTERFACE_HOSTS` 是否包含数据库中 URL 所使用的 host
3. 重新导入 SQL 后，再次测试
