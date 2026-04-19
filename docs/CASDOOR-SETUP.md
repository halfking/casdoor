# Casdoor 初始化与接入指南

> 最后更新：2026-04-12
> 版本：v1.2
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
3. 回填 `deployment/platform.env` 中的配置

## 4. 标准配置入口

从 2026-04-12 起，本仓库的 Casdoor 配置只允许走以下链路：

1. `deployment/platform-app-registry.json`
2. `deployment/platform.env`
3. `init_data.json.template`
4. `scripts/render-platform-config.sh`
5. `scripts/apply-platform-config.sh`

详细规范见 `docs/platform-config-standard.md`。

### 4.1 标准执行命令

```bash
cp deployment/platform.env.example deployment/platform.env
vi deployment/platform.env
scripts/apply-platform-config.sh --env-file deployment/platform.env --verify-db
```

如需在部署后立即刷新运行态并校验 PostgreSQL 中的 application 记录：

```bash
scripts/apply-platform-config.sh \
  --env-file deployment/platform.env \
  --restart-casdoor \
  --verify-db
```

### 4.2 禁止继续使用的旧入口

以下入口已经退出标准流程，不允许再作为部署主路径：

1. `.env.example` 作为部署真相源
2. 任意历史 SQL 初始化脚本或手工 SQL 导入路径
3. 手工回填多份 clientId / clientSecret 到不同文件

旧入口的弃用说明统一以 `docs/platform-config-standard.md` 为准，不再在本页重复枚举具体脚本名。

## 5. 当前推荐组织与应用

### 5.1 组织

- Organization：`kaixuan`

### 5.2 应用

建议至少维护两类应用：

- `official-portal`
- `agent-control-center`
- `kxmemory-app` 或当前实际使用的 KxMemory 应用名

若实际环境中 Portal 与 KxMemory 暂时共用同一应用，也应在 `deployment/platform.env` 中显式写明，避免文档与运行态分离。
ACC 推荐使用独立应用，避免与官网或其它控制台共享 `client_id` / `client_secret`。

## 6. 回调 URL 口径

### 6.1 Portal

- `https://www.itestu.cn/auth/callback`
- `http://localhost:8080/auth/callback`（Vite 本地开发）
- `http://localhost:8081/auth/callback`（Docker / 本地容器入口）
- `http://<LOCAL_DOMAIN_IP>:8080/auth/callback`（局域网 IP + Vite 本地开发）
- `http://<LOCAL_DOMAIN_IP>:8081/auth/callback`（局域网 IP + Docker / 本地容器入口）

### 6.2 KxMemory

- 根据当前运行应用配置填写 `https://m.itestu.cn` 对应回调
- 若使用独立 Casdoor 应用，必须同步 `deployment/platform.env` 中的应用变量

### 6.3 ACC

- `https://acc.itestu.cn/auth/callback`
- `https://acc.itestu.cn/app/oauth-callback`（历史兼容）
- `http://localhost:4100/auth/callback`
- `http://localhost:4100/app/oauth-callback`（本地兼容）

## 7. 当前环境变量口径

标准部署文件使用 `deployment/platform.env`，至少需要以下配置：

```bash
CASDOOR_POSTGRES_CONTAINER=postgres
CASDOOR_DB_USER=casdoor
CASDOOR_DB_NAME=casdoor
CASDOOR_COMPOSE_SERVICE=casdoor
CASDOOR_ADMIN_PASS=<admin-password>
CASDOOR_CLIENT_ID=<acc-client-id>
CASDOOR_CLIENT_SECRET=<acc-client-secret>
PORTAL_CASDOOR_CLIENT_ID=<portal-client-id>
PORTAL_CASDOOR_CLIENT_SECRET=<portal-client-secret>
CASDOOR_KXMEMORY_CLIENT_ID=<kxmemory-client-id>
CASDOOR_KXMEMORY_CLIENT_SECRET=<kxmemory-client-secret>
```

业务域名变量也必须在 `deployment/platform.env` 中维护，例如：

```bash
ACC_PUBLIC_URL=https://acc.itestu.cn
PORTAL_URL=https://www.itestu.cn
KXMEMORY_URL=https://memora.itestu.cn
```

不再建议通过单独 upsert 脚本回填到 `.env`，而是先维护 `deployment/platform.env`，再统一渲染和校验。

## 8. 配置变更后的标准步骤

```bash
scripts/apply-platform-config.sh \
  --env-file deployment/platform.env \
  --restart-casdoor \
  --verify-db
```

如需补平台扩展数据，再附加：

```bash
scripts/apply-platform-config.sh \
  --env-file deployment/platform.env \
  --restart-casdoor \
  --verify-db \
  --with-platform-bootstrap
```

如需为服务接入生成来源 API key 哈希，可使用：

```bash
cd /Users/xutaohuang/workspace/official-deploy/services/agent-control-center
npm run auth:source-key -- --source-id=my-service --type=service --scope=service:access --generate
```

## 9. 验证要点

### 9.1 基础可访问性

```bash
curl -I http://localhost:8000
curl -I https://auth.itestu.cn
```

### 9.2 Portal 登录链路

验证：

1. 访问 `https://www.itestu.cn`
2. 跳转到 `https://auth.itestu.cn`
3. 登录后返回 Portal 回调页

### 9.3 KxMemory 登录链路

验证：

1. 访问 `https://m.itestu.cn`
2. 跳转到 Casdoor
3. 登录后返回 KxMemory

### 9.4 ACC 登录链路

验证：

1. 访问 `https://acc.itestu.cn`
2. 跳转到 `https://auth.itestu.cn`
3. 登录后返回 ACC 回调页
4. `https://acc.itestu.cn/api/auth/session` 不应再返回 401

## 10. 当前常见问题

### 10.1 Portal 或 KxMemory 不显示 SSO

优先检查：

- `deployment/platform.env` 中对应 clientId / clientSecret 是否为空
- 是否执行了 `scripts/apply-platform-config.sh --env-file deployment/platform.env --verify-db`

### 10.2 回调失败

优先检查：

- registry 中是否保留了当前业务仍在使用的 compatCallbackPaths
- `init_data.json` 和 PostgreSQL `application.redirect_uris` 是否一致

### 10.3 ACC 报 `casdoor_not_configured`

优先检查：

- ACC 侧环境变量是否与 `deployment/platform.env` 中的 ACC client 配置一致
- 登录回调是否命中了 `https://acc.itestu.cn/auth/callback` 或兼容路径 `https://acc.itestu.cn/app/oauth-callback`

## 11. 当前结论

Casdoor 当前已经不是单独实验组件，而是运行中的统一认证中心。后续所有部署与文档都应以：

- PostgreSQL 存储
- `auth.itestu.cn` 正式域名
- Portal / KxMemory / ACC 同步接入

作为唯一正确口径。