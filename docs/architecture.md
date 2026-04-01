# Casdoor 系统架构文档

> 本文档面向平台开发者与运维人员，描述 Casdoor（开轩定制版）的整体架构、核心模型与关键链路。

## 1. 系统定位

Casdoor 是统一身份与访问管理（IAM）平台，为开轩生态的所有应用提供：

- **认证协议**：OAuth 2.1 / OIDC / SAML / CAS / LDAP / SCIM / WebAuthn / TOTP(MFA)
- **授权引擎**：基于 Casbin 的 RBAC / ABAC 策略
- **BFF 增强层**：菜单投影、权限批量解析、数据域控制、租户树
- **多租户隔离**：Organization = 租户，所有资源通过 `owner` 字段隔离

## 2. 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Go 1.21+, Beego v2 |
| 前端 | React (web/) / Vue 3 (web-vue/, 迁移中) |
| 数据库 | PostgreSQL 15 |
| 授权引擎 | Casbin v2 (string-adapter + Xorm adapter) |
| 部署 | Docker Compose, 自定义构建 |
| 域名 | `auth.itestu.cn` |

## 3. 多租户模型

```
Organization (租户)
  ├── Application  (应用/客户端)
  ├── User         (用户)
  ├── Role         (角色)
  ├── Permission   (权限)
  ├── Group        (分组)
  ├── Menu         (菜单, 通过 application 字段关联到 Application)
  ├── Department   (部门)
  └── Post         (岗位)
```

- **隔离维度**：所有资源都有 `owner` 字段，值为 Organization.Name
- **跨租户场景**：`IsShared = true` 的 Application 可被多个 Organization 共享
- **GlobalAdmin**：`built-in` 组织下的管理员拥有全局操作权限

## 4. 授权链路

```
请求 ──→ Beego Router ──→ ApiFilter (middleware)
                              │
                              ▼
                     authz.IsAllowed()
                     ┌──────────────────────────┐
                     │ 1. GlobalAdmin? → allow   │
                     │ 2. IsAdmin + 同org? → allow│
                     │ 3. Casbin Enforce (84 rules)│
                     │ 4. fallback: CheckApiPermission()│
                     └──────────────────────────┘
                              │
                              ▼
                         Controller Handler
```

### 4.1 Casbin 内置策略

`authz/authz.go` 中定义了 84 条内置策略（`InitApi()`），格式：

```
p, <sub_owner>, <sub_name>, <method>, <url_path>, <obj_owner>, <obj_name>
```

典型规则：
- `p, built-in, *, *, *, *, *` — built-in 组织全通
- `p, app, *, *, *, *, *` — 应用级 token 全通
- `p, *, *, POST, /api/login, *, *` — 登录端点公开
- `p, *, *, POST, /api/bff/resolve-permissions, *, *` — BFF 端点允许所有登录用户

### 4.2 CheckApiPermission 回落

当 Casbin Enforce 返回 `false` 时，系统通过 `object.CheckApiPermission()` 查询数据库中的 Permission 对象进行二次判定。Permission 对象可绑定到角色/用户，支持更灵活的 API 级别权限控制。

## 5. BFF 增强层

为前端/外部应用提供 4 个聚合 API（`controllers/authz_bff.go`）：

| 端点 | 方法 | 用途 |
|------|------|------|
| `/api/bff/app-menus` | GET | 按应用获取用户可见菜单树 |
| `/api/bff/resolve-permissions` | POST | 批量检查多个功能权限 |
| `/api/bff/check-data-scope` | POST | 行级数据域权限检查 |
| `/api/bff/tenant-tree` | GET | 获取租户组织树 |

关键设计：
- Admin/GlobalAdmin 用户自动获得全部菜单，不走逐条权限过滤
- 菜单通过 `application` 字段关联（必须精确匹配 Application.Name）
- 所有端点需要登录态（Cookie/Token）

## 6. 数据模型关系

### 6.1 核心模型

| 模型 | 主键 | 关键字段 | 说明 |
|------|------|----------|------|
| Organization | owner + name | displayName, favicon, tags | 租户 |
| Application | owner + name | organization, clientId, clientSecret, logo, redirectUris | 应用/OAuth客户端 |
| User | owner + name | roles[], groups[], isAdmin, isGlobalAdmin | 用户 |
| Role | owner + name | users[], roles[] (子角色) | 角色 |
| Permission | owner + name | roles[], users[], resources[], actions[] | 权限策略 |
| Group | owner + name | parentId, type | 用户分组 |
| Menu | owner + name | application, parentId, path, icon, sortOrder | 菜单节点 |
| Department | owner + name | parentId, code, level | 部门 |
| Post | owner + name | code, sortOrder | 岗位 |

### 6.2 模型关系图

```
Organization ──1:N──→ Application
     │                    │
     │                    └─── Menu (via application field)
     │
     ├──1:N──→ User ──M:N──→ Role ──M:N──→ Permission
     │                                         │
     │                                    resources[] (API paths)
     │                                    actions[] (GET/POST/...)
     │
     ├──1:N──→ Group (树状, parentId)
     ├──1:N──→ Department (树状, parentId)
     └──1:N──→ Post
```

## 7. 初始化流程

启动时由 `object.InitFromFile()` 加载 `init_data.json`，按固定顺序创建资源：

```
Organizations → Providers → Applications → Users → Certs →
Ldaps → Models → Payments → Products → Resources → Roles →
Syncers → Tokens → Webhooks → Groups → Adapters → Enforcers →
Permissions → Plans → Pricings → Invitations → Records →
Sessions → Subscriptions → Transactions → Rules → Sites →
Menus → Departments → Posts
```

- 配置项 `initDataNewOnly = true` 时仅创建不存在的记录（推荐生产环境）
- 详见 [init-data-reference.md](init-data-reference.md)

## 8. 测试体系

### 单元测试

| 模块 | 测试文件 | 说明 |
|------|----------|------|
| BFF 控制器 | `controllers/authz_bff_test.go` | `normalizeActionToMethod`（19 用例）、`normalizeFeaturePath`（7 用例）、请求结构体验证 |
| 菜单树构建 | `object/menu_test.go` | `BuildMenuTree` 6 场景：空列表、平铺、嵌套、孤儿节点、三层树、混合 |

```bash
go test -v ./controllers/ ./object/ -run 'TestNormalize|TestBff|TestBuildMenuTree'
```

### 冒烟测试

`scripts/authz-bff-smoke.sh` 覆盖 4 个 BFF 端点（app-menus、resolve-permissions、check-data-scope、tenant-tree），输出逐条 PASS/FAIL 并以退出码汇总结果。

## 9. 相关文档

- [应用接入指南](app-onboarding.md) — 外部应用接入标准流程
- [BFF API 参考](bff-api-reference.md) — BFF 端点完整参考
- [部署指南](deployment.md) — Docker 部署与配置
- [init_data.json 参考](init-data-reference.md) — 初始化数据格式说明

## 10. 多租户优化路线图

详见 `plans/2026-04-01-casdoor-multi-tenant-optimization-plan.md`，主要规划：

- T1: 请求级租户上下文注入
- T2: 行级数据域控制
- T3: Organization 自定义属性
- T4: 跨租户审计日志
- T5: Quota 配额管理
- T6: 数据导入/导出自动化
- T7: 租户生命周期管理
- T8: BFF 端点增强
