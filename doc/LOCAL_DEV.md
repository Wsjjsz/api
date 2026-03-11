# Local Dev Quickstart

## 1. Prerequisites

- JDK 8
- Maven wrapper from module directories (`api-interface/mvnw`, `api-gateway/mvnw`, `api-client-sdk/mvnw`)
- Node.js 16+ and npm
- MySQL 8.x (default db name: `api`)
- Redis (optional when `spring.session.store-type=none`)
- Nacos 2.x (recommended for Dubbo registration)

## 2. Init Database

Run:

```bash
mysql -uroot -p < sql/create_table.sql
```

## 3. Configure Secrets (recommended)

Do not hardcode credentials in files. Use env vars:

```bash
export API_DB_URL='jdbc:mysql://localhost:3306/api'
export API_DB_USERNAME='root'
export API_DB_PASSWORD='your_password'
export API_REDIS_PASSWORD='your_redis_password'
export API_INNER_TOKEN='api-inner-token'
export API_CLIENT_ACCESS_KEY='your_access_key'
export API_CLIENT_SECRET_KEY='your_secret_key'
```

## 4. One-click Start (ordered)

From repo root:

```bash
./scripts/dev-up.sh
```

Startup order in script:

1. `api-backend` (port `7529`)
2. `api-interface` (port `8123`)
3. `api-gateway` (port `8090`)
4. `api-frontend` (port `8000`)

Logs are written to `.run/*.log`.

## 5. Linkage Checklist

Run:

```bash
./scripts/dev-check.sh
```

What it verifies:

1. Backend reachable: `http://localhost:7529/api/user/get/login`
2. Interface service reachable: `http://localhost:8123/api/name/random`
3. Gateway reachable: `http://localhost:8090/api/user/get/login`
4. Frontend reachable: `http://localhost:8000`
5. Signed invoke through gateway: `/api/random/number`

If signed invoke fails, set:

```bash
export API_ACCESS_KEY='your_access_key'
export API_SECRET_KEY='your_secret_key'
```

Then rerun `./scripts/dev-check.sh`.

## 6. Stop All Local Services

```bash
./scripts/dev-down.sh
```
