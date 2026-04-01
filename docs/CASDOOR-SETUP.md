# Casdoor 初始化与接入指南

> 最后更新：2026-03-14
> 版本：v1.1
> 说明：本文档已切换到 Casdoor + PostgreSQL 的当前运行形态，不再引用旧版 `casdoor-db` 或 MySQL 初始化步骤。

补充：来源识别、service API key 与双运行态来源隔离方案见 [docs/AUTH-SOURCE-ACCESS.md](../docs/AUTH-SOURCE-ACCESS.md)。

## 1. 当前部署形态

Casdoor 当前在 deployment-platform 中作为统一认证中心运行：

- 浏览器可见入口：`https://auth.itestu.cn`
- 容器内访问地址：`http://casdoor:8000`
- 数据库存储：PostgreSQL

## 2. 启动 Casdoor

```bash
cd /Volumes/pdisk/workspace/deployment-platform
docker compose up -d casdoor
docker compose ps casdoor
```

如需查看健康状态：

```bash
docker logs casdoor --tail 100
curl -I http://localhost:8000
```

## 3. 首次访问与管理员处理

- 本地访问：`http://localhost:8000`
- 内网正式域名：`https://auth.itestu.cn`

首次登录后，必须立即完成：

1. 修改默认管理员密码
2. 确认组织与应用配置
3. 回填 `.env` 中的 `CASDOOR_*` 配置

## 4. 当前推荐组织与应用

### 4.1 组织

- Organization：`kaixuan`

### 4.2 应用

建议至少维护两类应用：

- `official-portal`
- `agent-control-center`
- `kxmemory-app` 或当前实际使用的 KxMemory 应用名

若实际环境中 Portal 与 KxMemory 暂时共用同一应用，也应在 `.env` 中显式写明，避免文档与运行态分离。
ACC 推荐使用独立应用，避免与官网或其它控制台共享 `client_id` / `client_secret`。

## 5. 回调 URL 口径

### 5.1 Portal

- `https://www.itestu.cn/auth/callback`
- `http://localhost:8080/auth/callback`（Vite 本地开发）
- `http://localhost:8081/auth/callback`（Docker / 本地容器入口）
- `http://<LOCAL_DOMAIN_IP>:8080/auth/callback`（局域网 IP + Vite 本地开发）
- `http://<LOCAL_DOMAIN_IP>:8081/auth/callback`（局域网 IP + Docker / 本地容器入口）

### 5.2 KxMemory

- 根据当前运行应用配置填写 `https://m.itestu.cn` 对应回调
- 若使用独立 Casdoor 应用，必须同步 `.env` 中的 `CASDOOR_KXMEMORY_APP_NAME`

## 6. 当前环境变量口径

deployment-platform 侧至少需要以下配置：

```bash
CASDOOR_PUBLIC_ENDPOINT=https://auth.itestu.cn
CASDOOR_ENDPOINT=http://casdoor:8000
CASDOOR_CLIENT_ID=<client-id>
CASDOOR_CLIENT_SECRET=<client-secret>
CASDOOR_ACC_CLIENT_ID=<acc-client-id>
CASDOOR_ACC_CLIENT_SECRET=<acc-client-secret>
CASDOOR_ORG=kaixuan
CASDOOR_PORTAL_APP_NAME=official-portal
CASDOOR_ACC_APP_NAME=agent-control-center
CASDOOR_KXMEMORY_APP_NAME=<当前实际应用名>
CASDOOR_DB_PASS=<postgres-password>
```

如需脚本化创建或更新 ACC 独立应用，可使用：

```bash
node ./scripts/upsert-casdoor-acc-app.js \
  --endpoint=https://auth.itestu.cn \
  --admin-user=admin \
  --admin-password='<casdoor-admin-password>' \
  --acc-url=https://acc.itestu.cn
```

脚本会输出 ACC 专用 `clientId` / `clientSecret`，再回填到 `.env` 的 `CASDOOR_ACC_CLIENT_ID`、`CASDOOR_ACC_CLIENT_SECRET`。

如需脚本化创建或更新 Portal 应用，可使用：

```bash
node ./scripts/upsert-casdoor-portal-app.js \
  --endpoint=http://192.168.31.28:8000 \
  --admin-user=admin \
  --admin-password='<casdoor-admin-password>' \
  --portal-url=http://192.168.31.28:8081
```

脚本会保留已有 Redirect URL，并自动补齐当前入口对应的 `localhost / 127.0.0.1 / LOCAL_DOMAIN_IP` 的 `8080`、`8081` 回调地址。执行后会输出完整 `redirectUris` 列表以及 Portal 专用 `clientId` / `clientSecret`，再回填到 `.env.local-ip` 或 `.env` 的 `CASDOOR_CLIENT_ID`、`CASDOOR_CLIENT_SECRET`。

如需为服务接入生成来源 API key 哈希，可使用：

```bash
cd /Users/xutaohuang/workspace/official-deploy/services/agent-control-center
npm run auth:source-key -- --source-id=my-service --type=service --scope=service:access --generate
```

## 7. 配置变更后的重建步骤

```bash
./scripts/deploy.sh rebuild official-portal
docker compose restart agent-control
docker compose restart kxmemory-dashboard
docker compose restart casdoor
./scripts/check-services-status.sh
```

## 8. 验证要点

### 8.1 基础可访问性

```bash
curl -I http://localhost:8000
curl -I https://auth.itestu.cn
```

### 8.2 Portal 登录链路

验证：

1. 访问 `https://www.itestu.cn`
2. 跳转到 `https://auth.itestu.cn`
3. 登录后返回 Portal 回调页

### 8.3 KxMemory 登录链路

验证：

1. 访问 `https://m.itestu.cn`
2. 跳转到 Casdoor
3. 登录后返回 KxMemory

## 9. 当前常见问题

### 9.1 Portal 或 KxMemory 不显示 SSO

优先检查：

- `.env` 中 `CASDOOR_CLIENT_ID` 是否为空
- 相关服务是否已重新构建或重启

### 9.2 回调失败

优先检查：

- 应用中的 Redirect URL 是否已注册
- `CASDOOR_PUBLIC_ENDPOINT` 是否仍指向 `https://auth.itestu.cn`

### 9.3 ACC 报 `casdoor_not_configured`

优先检查：

- `CASDOOR_ENDPOINT`
- `CASDOOR_CLIENT_ID`
- `CASDOOR_CLIENT_SECRET`

## 10. 当前结论

Casdoor 当前已经不是单独实验组件，而是运行中的统一认证中心。后续所有部署与文档都应以：

- PostgreSQL 存储
- `auth.itestu.cn` 正式域名
- Portal / KxMemory / ACC 同步接入

作为唯一正确口径。