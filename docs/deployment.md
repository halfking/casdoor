# 部署指南

> 本文档描述 Casdoor（开轩定制版）的 Docker 部署流程与配置说明。

## 1. 部署架构

```
┌──────────────────────────────────────┐
│ kaixuan-1 (Mac Mini)                 │
│                                      │
│  ┌──────────────┐  ┌─────────────┐  │
│  │   casdoor     │  │  postgres   │  │
│  │  (Go + Web)   │──│  (PG 15)   │  │
│  │  :8000        │  │  :5432      │  │
│  └──────────────┘  └─────────────┘  │
│         │                            │
│    Reverse Proxy                     │
│    auth.itestu.cn → :8000            │
└──────────────────────────────────────┘
```

## 2. 前置条件

- Docker & Docker Compose
- PostgreSQL 容器（名称: `postgres`）
- 域名 `auth.itestu.cn` 已配置 DNS 与 TLS 证书

## 3. Docker Compose 配置

核心 `docker-compose.yml` 配置要点：

```yaml
services:
  casdoor:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: casdoor
    ports:
      - "8000:8000"
    environment:
      - CASDOOR_DB_PASS=<数据库密码>
    volumes:
      - ./init_data.json:/init_data.json
      - ./conf/app.conf:/conf/app.conf
    depends_on:
      - postgres
    restart: unless-stopped
```

## 4. 关键配置文件

### 4.1 conf/app.conf

| 配置项 | 说明 | 示例值 |
|--------|------|--------|
| `appname` | 应用名称 | `开轩认证` |
| `httpport` | HTTP 端口 | `8000` |
| `runmode` | 运行模式 | `prod` |
| `driverName` | 数据库驱动 | `postgres` |
| `dataSourceName` | 数据库连接串 | `postgres://casdoor:${CASDOOR_DB_PASS}@postgres:5432/casdoor?sslmode=disable` |
| `origin` | 服务外部地址 | `https://auth.itestu.cn` |
| `originFrontend` | 前端地址 | `https://auth.itestu.cn` |
| `staticBaseUrl` | 静态资源地址 | `https://auth.itestu.cn` |
| `initDataFile` | 初始化数据文件路径 | `init_data.json`（相对于工作目录） |
| `initDataNewOnly` | 仅创建新记录 | `true`（生产环境推荐） |
| `verificationCodeTimeout` | 验证码超时(分钟) | `10` |
| `batchSize` | 批量操作大小 | `100` |

### 4.2 init_data.json

初始化数据文件，服务首次启动时自动加载。详见 [init-data-reference.md](init-data-reference.md)。

### 4.3 conf/waf.conf

Web 应用防火墙规则配置。

## 5. 数据库初始化

### 5.1 自动初始化

Casdoor 启动时通过 XORM 自动创建表结构（AutoMigrate），无需手动建表。`InitFromFile()` 加载 `init_data.json` 自动填充初始数据。

### 5.2 手动 SQL 补充

对于 `init_data.json` 不便管理的数据（如大批量菜单），使用 SQL 脚本：

```bash
# 执行菜单/部门/岗位初始化
docker exec -i postgres psql -U casdoor -d casdoor < scripts/init_menu_dept_post.sql
```

## 6. 构建与部署

### 6.0 前端发布结构（重新规划）

统一采用「**双模式**」结构，避免混用导致“页面未更新”：

- **模式 A：镜像内静态资源（生产默认）**  
  - 入口：根目录 `docker-compose.yml` 的 `casdoor` 服务。  
  - 行为：不挂载宿主机 `web/build`；`Dockerfile` 的 `FRONT` 阶段编译 `services/casdoor/web-vue`，并复制到镜像 `/web/build`。  
  - 数据库主机通过 `CASDOOR_DB_HOST` 注入（默认 `pms-postgres`），避免写死 `postgres` 导致跨网络解析失败。  
  - 发布命令：`./scripts/deploy-kx-casdoor.sh`（或 `--no-cache`）。  
  - 强校验：脚本会注入 `CASDOOR_WEB_RELEASE`，并校验运行态 `/release.json` 是否为本次 release。

- **模式 B：宿主机覆盖静态资源（仅调试/本地联调）**  
  - 入口：`docker-compose.yml + docker-compose.casdoor-bind-web.yml`。  
  - 行为：挂载 `./services/casdoor/web/build:/web/build:ro` 覆盖镜像。  
  - 前置：必须先执行 `bash services/casdoor/scripts/build-web-vue-release.sh` 生成宿主机 `web/build`。  
  - 风险：若漏构建会出现空白或旧页面；**禁止生产使用**。

> 约束：`services/casdoor/web/` 已在 `.gitignore`，不作为发布真相源。生产只认镜像内构建产物。

### 6.1 标准部署流程（模式 A）

```bash
# 在 deployment-platform（或 official-deploy）仓库根目录，而非仅 services/casdoor 子目录
cd /path/to/deployment-platform

# 1. 拉取最新代码
git pull origin master

# 2-3. 构建并重建（推荐一键脚本，含 release 校验）
./scripts/deploy-kx-casdoor.sh
# 若怀疑缓存:
# ./scripts/deploy-kx-casdoor.sh --no-cache

# 4. 查看日志
docker compose logs -f casdoor --tail=50
```

### 6.2 验证部署

```bash
# 健康检查
curl -sk https://auth.itestu.cn/api/health

# 版本校验（应返回本次 release 标识）
curl -sS http://127.0.0.1:${CASDOOR_PORT:-9035}/release.json

# 检查版本
curl -sk https://auth.itestu.cn/api/get-release

# 检查进程
docker compose ps casdoor
```

### 6.3 调试模式（模式 B）示例

```bash
# 1) 先在宿主机编译 web-vue 并同步到 services/casdoor/web/build
bash services/casdoor/scripts/build-web-vue-release.sh

# 2) 启动 casdoor（叠加 bind-web 覆盖文件）
docker compose -f docker-compose.yml -f docker-compose.casdoor-bind-web.yml up -d casdoor

# 3) 验证静态目录已挂载
docker compose exec casdoor ls /web/build
```

## 7. 运维常用命令

```bash
# 查看实时日志
docker compose logs -f casdoor --tail=100

# 重启服务
docker compose restart casdoor

# 进入容器
docker compose exec casdoor sh

# 数据库直连
docker exec -it postgres psql -U casdoor -d casdoor

# 备份数据库
docker exec postgres pg_dump -U casdoor casdoor > backup_$(date +%Y%m%d).sql
```

## 8. 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `CASDOOR_DB_PASS` | PostgreSQL 数据库密码 | ✅ |

## 9. 注意事项

- **initDataNewOnly**：生产环境务必设为 `true`，避免重启时覆盖已修改的数据
- **HTTPS**：生产环境必须通过反向代理配置 TLS，`origin` 使用 `https://` 前缀
- **数据库密码**：通过环境变量注入，不要硬编码在配置文件中
- **日志**：`logPostOnly = true` 仅记录 POST 请求日志，减少噪音
