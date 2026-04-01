# 外部应用接入指南

> 本文档定义了外部应用接入开轩 Casdoor IAM 平台的完整标准流程，包括应用注册、资源导入、权限配置与验收检查。

## 1. 接入前置条件

| 条件 | 说明 |
|------|------|
| Casdoor 实例可用 | `https://auth.itestu.cn` 运行正常 |
| 管理员账号 | 拥有目标 Organization 的 Admin 权限 |
| 应用信息准备 | 应用名、显示名、Logo、Favicon、回调地址等（见下方字段清单） |
| 资源清单 | 菜单、角色、权限、部门、岗位、分组等定义 |

## 2. 接入流程总览

```
步骤1: 注册 Application
        ↓
步骤2: 导入菜单 (Menu)
        ↓
步骤3: 导入角色 (Role)
        ↓
步骤4: 导入权限 (Permission)
        ↓
步骤5: 导入部门/岗位/分组 (Department / Post / Group)
        ↓
步骤6: 配置 Provider (可选, 如第三方登录)
        ↓
步骤7: 配置 Casbin Model (可选, 自定义权限模型)
        ↓
步骤8: 验收检查
```

## 3. 应用注册

### 3.1 Application 核心字段

接入应用需要提供以下信息：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `owner` | string | ✅ | 所属 Organization（租户），如 `kaixuan` |
| `name` | string | ✅ | **应用唯一标识**，全局唯一，如 `my-saas-app` |
| `displayName` | string | ✅ | 显示名称，如 `我的SaaS应用` |
| `organization` | string | ✅ | 绑定的 Organization 名称 |
| `logo` | string | ✅ | 应用 Logo URL（建议 200x200 PNG） |
| `favicon` | string | 推荐 | Favicon URL |
| `homepageUrl` | string | ✅ | 应用首页地址 |
| `description` | string | 推荐 | 应用描述 |
| `redirectUris` | string[] | ✅ | OAuth 回调地址列表 |
| `cert` | string | ✅ | 绑定的证书名称（用于 JWT 签名） |
| `tokenFormat` | string | ✅ | Token 格式: `JWT-Standard` / `JWT-Empty` |
| `grantTypes` | string[] | ✅ | 授权类型: `authorization_code`, `client_credentials` 等 |
| `expireInHours` | number | ✅ | Access Token 过期时间(小时) |
| `refreshExpireInHours` | number | 推荐 | Refresh Token 过期时间(小时) |
| `enablePassword` | bool | — | 是否启用密码登录 |
| `enableSignUp` | bool | — | 是否允许注册 |
| `signinMethods` | SigninMethod[] | — | 登录方式配置 |
| `signupItems` | SignupItem[] | — | 注册表单项 |
| `providers` | ProviderItem[] | — | 绑定的第三方登录 Provider |
| `themeData` | ThemeData | — | 主题外观配置 |
| `category` | string | — | 应用分类 |
| `tags` | string[] | — | 标签 |

### 3.2 注册方式

#### 方式一：REST API

```http
POST /api/add-application
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "owner": "kaixuan",
  "name": "my-saas-app",
  "displayName": "我的SaaS应用",
  "organization": "kaixuan",
  "logo": "https://cdn.example.com/logo.png",
  "favicon": "https://cdn.example.com/favicon.ico",
  "homepageUrl": "https://my-app.example.com",
  "description": "示例SaaS应用",
  "cert": "cert-built-in",
  "redirectUris": ["https://my-app.example.com/callback"],
  "tokenFormat": "JWT-Standard",
  "grantTypes": ["authorization_code", "refresh_token"],
  "expireInHours": 24,
  "refreshExpireInHours": 168,
  "enablePassword": true,
  "enableSignUp": false,
  "signinMethods": [
    {"name": "Password", "displayName": "密码", "rule": "All"}
  ]
}
```

成功响应：
```json
{
  "status": "ok",
  "data": "Affected"
}
```

注册成功后系统自动生成 `clientId` 和 `clientSecret`，用于 OAuth 流程。

#### 方式二：init_data.json

在 `init_data.json` 的 `applications` 数组中添加应用定义（详见 [init-data-reference.md](init-data-reference.md)）。服务重启时自动创建。

### 3.3 ACC 参考示例

ACC（Agent Control Center）的应用注册配置可参考 `init_data.json` 中 `name: "agent-control-center"` 的定义。

## 4. 资源导入标准

### 4.1 资源导入方式汇总

| 资源 | 单条 API | 批量导入 | init_data.json | SQL 脚本 |
|------|----------|----------|----------------|----------|
| Menu | `POST /api/add-menu` | — | `menus[]` | ✅ 推荐 |
| Role | `POST /api/add-role` | `POST /api/upload-roles` (XLSX) | `roles[]` | — |
| Permission | `POST /api/add-permission` | `POST /api/upload-permissions` (XLSX) | `permissions[]` | — |
| Group | `POST /api/add-group` | `POST /api/upload-groups` (XLSX) | `groups[]` | — |
| Department | `POST /api/add-department` | — | `departments[]` | ✅ 推荐 |
| Post | `POST /api/add-post` | — | `posts[]` | ✅ 推荐 |
| Provider | `POST /api/add-provider` | — | `providers[]` | — |
| Model | `POST /api/add-model` | — | `models[]` | — |

### 4.2 菜单 (Menu)

#### 字段规范

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `owner` | string | ✅ | Organization 名称 |
| `name` | string | ✅ | 菜单唯一标识，建议格式 `{appPrefix}-{功能}`，如 `myapp-dashboard` |
| `displayName` | string | ✅ | 显示名称 |
| `application` | string | ✅ | **必须精确匹配 Application.Name**（非 displayName） |
| `parentId` | string | — | 父菜单 name（空为顶级菜单） |
| `path` | string | — | 路由路径，如 `/dashboard`（容器菜单可为空） |
| `icon` | string | — | 图标名称（Ant Design 图标名） |
| `component` | string | — | 前端组件名 |
| `type` | string | ✅ | `Menu` 或 `Button` |
| `sortOrder` | int | ✅ | 排序权重（同级内升序） |
| `visible` | bool | ✅ | 是否可见 |
| `isEnabled` | bool | ✅ | 是否启用 |

> **关键约束**：`application` 字段必须与注册的 Application `name` 完全一致。BFF `/api/bff/app-menus` 通过此字段查询菜单，不匹配将导致菜单为空。

#### 菜单树结构规范

```
顶级菜单 (parentId = "")
  ├── 子菜单 (parentId = 顶级菜单的 name)
  │     ├── 叶子菜单 (parentId = 子菜单的 name)
  │     └── ...
  └── ...
```

- **容器菜单**：`path` 为空，仅作为分组容器，如 "权限控制"、"组织架构"
- **叶子菜单**：`path` 非空，对应实际页面路由
- **sortOrder**：同级内按升序排列

#### 菜单 API 示例

```http
POST /api/add-menu
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "owner": "kaixuan",
  "name": "myapp-dashboard",
  "displayName": "仪表板",
  "application": "my-saas-app",
  "parentId": "",
  "path": "/dashboard",
  "icon": "DashboardOutlined",
  "component": "DashboardPage",
  "type": "Menu",
  "sortOrder": 1,
  "visible": true,
  "isEnabled": true
}
```

#### 菜单 SQL 导入（推荐批量）

参考 `scripts/init_menu_dept_post.sql`，使用 `ON CONFLICT DO NOTHING` 实现幂等：

```sql
INSERT INTO menu (owner, name, created_time, updated_time, display_name,
  application, parent_id, path, icon, component, type, sort_order, visible, is_enabled)
VALUES
  ('kaixuan','myapp-dashboard','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z',
   '仪表板','my-saas-app','','/dashboard','DashboardOutlined','DashboardPage','Menu',1,true,true),
  ('kaixuan','myapp-users','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z',
   '用户管理','my-saas-app','','/users','UserOutlined','ResourceListView','Menu',2,true,true)
ON CONFLICT (owner, name) DO NOTHING;
```

### 4.3 角色 (Role)

#### 字段规范

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `owner` | string | ✅ | Organization 名称 |
| `name` | string | ✅ | 角色唯一标识 |
| `displayName` | string | ✅ | 显示名称 |
| `description` | string | 推荐 | 描述 |
| `users` | string[] | — | 绑定的用户列表 `["org/username"]` |
| `roles` | string[] | — | 子角色列表（角色继承） |
| `isEnabled` | bool | ✅ | 是否启用 |

#### API 示例

```http
POST /api/add-role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "owner": "kaixuan",
  "name": "myapp-admin",
  "displayName": "应用管理员",
  "description": "my-saas-app 的管理员角色",
  "users": [],
  "roles": [],
  "isEnabled": true
}
```

#### XLSX 批量导入

```http
POST /api/upload-roles
Content-Type: multipart/form-data
Authorization: Bearer <admin-token>

file: roles.xlsx
```

XLSX 列格式需与 Role 字段对应。

### 4.4 权限 (Permission)

#### 字段规范

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `owner` | string | ✅ | Organization 名称 |
| `name` | string | ✅ | 权限唯一标识 |
| `displayName` | string | ✅ | 显示名称 |
| `description` | string | 推荐 | 描述 |
| `model` | string | — | Casbin Model 名称 |
| `adapter` | string | — | Casbin Adapter 名称 |
| `resources` | string[] | ✅ | 资源路径列表，如 `["/dashboard", "/users"]` |
| `actions` | string[] | ✅ | 操作列表: `["Read", "Write", "Admin"]` |
| `effect` | string | ✅ | `Allow` / `Deny` |
| `roles` | string[] | — | 绑定角色 `["org/role-name"]` |
| `users` | string[] | — | 绑定用户 `["org/username"]` |
| `isEnabled` | bool | ✅ | 是否启用 |

#### API 示例

```http
POST /api/add-permission
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "owner": "kaixuan",
  "name": "myapp-read-dashboard",
  "displayName": "仪表板只读",
  "resources": ["/dashboard"],
  "actions": ["Read"],
  "effect": "Allow",
  "roles": ["kaixuan/myapp-admin"],
  "isEnabled": true
}
```

权限通过 `CheckApiPermission()` 在运行时生效，当 Casbin 内置策略不匹配时自动回落到此检查。

### 4.5 分组 (Group)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `owner` | string | ✅ | Organization 名称 |
| `name` | string | ✅ | 唯一标识 |
| `displayName` | string | ✅ | 显示名称 |
| `parentId` | string | — | 父分组（树状结构） |
| `type` | string | — | 分组类型 |
| `isEnabled` | bool | ✅ | 是否启用 |

API: `POST /api/add-group` | 批量: `POST /api/upload-groups` (XLSX)

### 4.6 部门 (Department)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `owner` | string | ✅ | Organization 名称 |
| `name` | string | ✅ | 唯一标识 |
| `displayName` | string | ✅ | 显示名称 |
| `parentId` | string | — | 父部门 |
| `code` | string | 推荐 | 部门编码 |
| `level` | int | — | 层级 |
| `sortOrder` | int | ✅ | 排序 |
| `leader` | string | — | 部门负责人 |
| `isEnabled` | bool | ✅ | 是否启用 |

API: `POST /api/add-department` | SQL 推荐批量导入

### 4.7 岗位 (Post)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `owner` | string | ✅ | Organization 名称 |
| `name` | string | ✅ | 唯一标识 |
| `displayName` | string | ✅ | 显示名称 |
| `code` | string | 推荐 | 岗位编码 |
| `sortOrder` | int | ✅ | 排序 |
| `isEnabled` | bool | ✅ | 是否启用 |

API: `POST /api/add-post` | SQL 推荐批量导入

### 4.8 Provider（可选）

用于配置第三方登录（GitHub、WeChat、Google 等）或短信/邮件服务。

API: `POST /api/add-provider`

### 4.9 Model（可选）

自定义 Casbin 权限模型，如需实现 ABAC 等高级策略。

API: `POST /api/add-model`

## 5. 权限配置

### 5.1 授权层级

```
层级1: Casbin 内置策略 (authz/authz.go, 84条)
  ↓ 不匹配时
层级2: Permission 对象 (object.CheckApiPermission)
  ↓ 不匹配时
层级3: 拒绝
```

### 5.2 为应用配置权限的步骤

1. **确认内置策略覆盖**：查看 `authz/authz.go`，BFF 端点和常用 API 已有内置策略

2. **创建 Permission 对象**（如需细粒度控制）：
   ```json
   {
     "owner": "kaixuan",
     "name": "myapp-menu-access",
     "resources": ["/dashboard", "/users", "/settings"],
     "actions": ["Read"],
     "effect": "Allow",
     "roles": ["kaixuan/myapp-user"],
     "isEnabled": true
   }
   ```

3. **绑定角色到用户**：
   ```http
   POST /api/update-user
   {
     "owner": "kaixuan",
     "name": "john",
     "roles": [{"owner": "kaixuan", "name": "myapp-user"}]
   }
   ```

### 5.3 BFF 权限投影

前端应用可通过 BFF 端点按需获取权限数据：

- **菜单**：`GET /api/bff/app-menus?application=my-saas-app` → 返回当前用户可见的菜单树
- **功能权限**：`POST /api/bff/resolve-permissions` → 批量检查多个功能路径的权限
- **数据域**：`POST /api/bff/check-data-scope` → 检查用户对特定资源类型的访问范围

详见 [BFF API 参考](bff-api-reference.md)。

## 6. 自动化初始化

### 6.1 三条初始化路径

| 路径 | 适用场景 | 优势 | 说明 |
|------|----------|------|------|
| **init_data.json** | 新部署/标准环境 | 声明式、版本可控、一次全量 | 推荐首选 |
| **REST API** | 运行时动态创建 | 灵活、可编程 | 适合 CI/CD 与脚本 |
| **SQL 脚本** | 菜单/部门/岗位批量 | 极快、幂等 | 适合大批量固定数据 |

### 6.2 init_data.json 路径（推荐）

在 `init_data.json` 中追加应用的全部资源定义：

```json
{
  "applications": [
    { /* 现有应用... */ },
    {
      "owner": "kaixuan",
      "name": "my-saas-app",
      "displayName": "我的SaaS应用",
      "organization": "kaixuan",
      "logo": "https://cdn.example.com/logo.png",
      "cert": "cert-built-in",
      "redirectUris": ["https://my-app.example.com/callback"],
      "tokenFormat": "JWT-Standard",
      "grantTypes": ["authorization_code", "refresh_token"],
      "expireInHours": 24
    }
  ],
  "menus": [
    { /* 现有菜单... */ },
    {
      "owner": "kaixuan",
      "name": "myapp-dashboard",
      "displayName": "仪表板",
      "application": "my-saas-app",
      "parentId": "",
      "path": "/dashboard",
      "icon": "DashboardOutlined",
      "type": "Menu",
      "sortOrder": 1,
      "visible": true,
      "isEnabled": true
    }
  ],
  "roles": [ /* 角色定义 */ ],
  "permissions": [ /* 权限定义 */ ],
  "departments": [ /* 部门定义 */ ],
  "posts": [ /* 岗位定义 */ ],
  "groups": [ /* 分组定义 */ ]
}
```

服务重启时 `InitFromFile()` 自动加载创建。配置 `initDataNewOnly = true` 时仅新增不覆盖。

### 6.3 REST API 路径

编写初始化脚本依次调用：

```bash
#!/bin/bash
BASE_URL="https://auth.itestu.cn"
TOKEN="<admin-access-token>"

# 1. 创建应用
curl -X POST "$BASE_URL/api/add-application" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @application.json

# 2. 导入菜单
for menu in menus/*.json; do
  curl -X POST "$BASE_URL/api/add-menu" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d @"$menu"
done

# 3. 导入角色
curl -X POST "$BASE_URL/api/upload-roles" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@roles.xlsx"

# 4. 导入权限
curl -X POST "$BASE_URL/api/add-permission" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @permission.json
```

### 6.4 SQL 脚本路径

参考 `scripts/init_menu_dept_post.sql`，使用 `ON CONFLICT DO NOTHING` 确保幂等。

执行方式：
```bash
# 通过 Docker exec
docker exec -i postgres psql -U casdoor -d casdoor < scripts/init_my_app.sql
```

## 7. 验收检查清单

接入应用上线前，需通过以下验收项：

### 7.1 应用注册

- [ ] Application 已创建，`clientId`、`clientSecret` 已生成
- [ ] Logo、Favicon 正确显示
- [ ] RedirectUris 配置正确
- [ ] TokenFormat 与 GrantTypes 符合需求

### 7.2 菜单

- [ ] 所有菜单的 `application` 字段与 Application `name` 完全一致
- [ ] 菜单树结构完整（parentId 引用正确）
- [ ] BFF 端点返回正确菜单树: `GET /api/bff/app-menus?application=<name>`
- [ ] Admin 用户可看到全部菜单
- [ ] sortOrder 排序正确

### 7.3 角色与权限

- [ ] 所有角色已创建
- [ ] Permission 对象正确绑定 resources + actions + roles
- [ ] `POST /api/bff/resolve-permissions` 能正确解析权限
- [ ] 非 Admin 用户仅看到已授权菜单

### 7.4 组织资源

- [ ] 部门/岗位/分组数据已导入
- [ ] 数据在 Casdoor 管理后台可见

### 7.5 OAuth 流程

- [ ] 应用可通过 OAuth 授权码流程登录
- [ ] Access Token 解析正确
- [ ] Token 过期时间符合预期

### 7.6 冒烟测试

使用 BFF 冒烟脚本验证（参考 `scripts/authz-bff-smoke.sh`）：

```bash
# 1. 登录获取 Cookie
curl -sk -c cookies.txt -X POST "https://auth.itestu.cn/api/login" \
  -H "Content-Type: application/json" \
  -d '{"application":"my-saas-app","organization":"kaixuan","username":"admin","password":"xxx","type":"code"}'

# 2. 获取应用菜单
curl -sk -b cookies.txt "https://auth.itestu.cn/api/bff/app-menus?application=my-saas-app"

# 3. 批量权限检查
curl -sk -b cookies.txt -X POST "https://auth.itestu.cn/api/bff/resolve-permissions" \
  -H "Content-Type: application/json" \
  -d '{"checks":["/dashboard","/users"]}'

# 4. 数据域检查
curl -sk -b cookies.txt -X POST "https://auth.itestu.cn/api/bff/check-data-scope" \
  -H "Content-Type: application/json" \
  -d '{"resourceType":"User","operation":"Read"}'
```

## 8. ACC 接入参考

Agent Control Center (ACC) 是第一个接入的应用，可作为完整参考：

- **Application 定义**: `init_data.json` → `applications` → `name: "agent-control-center"`
- **菜单 (17项)**: `scripts/init_menu_dept_post.sql`，包含 7 个顶级/容器菜单 + 10 个叶子菜单
- **部门 (3项)**: 技术部、产品部、运营部
- **岗位 (4项)**: CTO、架构师、高级工程师、工程师
- **菜单树结构**:
  ```
  仪表板 (/dashboard)
  应用管理 (/management/applications)
  用户管理 (/management/users)
  组织管理 (/management/organizations)
  权限控制
    ├── 角色管理 (/management/roles)
    ├── 权限管理 (/management/permissions)
    └── 权限模型 (/management/models)
  组织架构
    ├── 部门管理 (/management/departments)
    ├── 岗位管理 (/management/posts)
    ├── 分组管理 (/management/groups)
    └── 菜单管理 (/management/menus)
  系统管理
    ├── 提供商 (/management/providers)
    ├── 证书管理 (/management/certs)
    └── 安全规则 (/management/permission-rules)
  ```

## 9. 常见问题

### Q: 菜单接口返回空数据？
A: 检查 `menu.application` 字段是否与 Application `name` 完全一致（大小写敏感）。

### Q: 非 Admin 用户看不到任何菜单？
A: 需要创建 Permission 对象，将菜单 `path` 添加到 `resources`，并绑定用户角色。

### Q: init_data.json 更新后不生效？
A: 默认 `initDataNewOnly = true`，已存在的记录不会被覆盖。如需强制更新，需先删除旧记录或通过 API 更新。

### Q: 如何为新应用添加 Casbin 内置策略？
A: 修改 `authz/authz.go` 中的 `ruleText`，添加新的策略行，重新构建部署。仅在需要公开访问（无需登录）的端点才需要添加内置策略。
