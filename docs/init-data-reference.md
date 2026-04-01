# init_data.json 参考

> 本文档说明 `init_data.json` 的结构与各资源类型的 JSON 格式，用于指导应用接入时的初始化数据编写。

## 1. 概述

`init_data.json` 是 Casdoor 的声明式初始化数据文件，服务启动时由 `object.InitFromFile()` 加载。

- **加载时机**：服务启动时（`conf` 中 `initDataFile` 指向该文件）
- **幂等策略**：`initDataNewOnly = true` 时仅创建不存在的记录，不覆盖已有数据
- **加载顺序**：Organizations → Providers → Applications → Users → Certs → Ldaps → Models → ... → Menus → Departments → Posts

## 2. InitData 结构

对应 Go 结构体 `object.InitData`（`object/init_data.go`）：

```go
type InitData struct {
    Organizations    []*Organization
    Applications     []*Application
    Users            []*User
    Certs            []*Cert
    Providers        []*Provider
    Ldaps            []*Ldap
    Models           []*Model
    Permissions      []*Permission
    Payments         []*Payment
    Products         []*Product
    Resources        []*Resource
    Roles            []*Role
    Syncers          []*Syncer
    Tokens           []*Token
    Webhooks         []*Webhook
    Groups           []*Group
    Adapters         []*Adapter
    Enforcers        []*Enforcer
    Plans            []*Plan
    Pricings         []*Pricing
    Invitations      []*Invitation
    Records          []*Record
    Sessions         []*Session
    Subscriptions    []*Subscription
    Transactions     []*Transaction
    Sites            []*Site
    Rules            []*Rule
    Menus            []*Menu
    Departments      []*Department
    Posts            []*Post
    EnforcerPolicies map[string][][]string
}
```

## 3. 顶层 JSON 结构

```json
{
  "organizations": [],
  "providers": [],
  "applications": [],
  "users": [],
  "certs": [],
  "ldaps": [],
  "models": [],
  "permissions": [],
  "roles": [],
  "groups": [],
  "menus": [],
  "departments": [],
  "posts": [],
  "enforcerPolicies": {}
}
```

未使用的字段可省略或设为空数组。

## 4. 各资源 JSON 格式

### 4.1 Organization

```json
{
  "owner": "admin",
  "name": "kaixuan",
  "createdTime": "2026-03-14T00:00:00Z",
  "displayName": "开轩",
  "websiteUrl": "https://itestu.cn",
  "favicon": "https://cdn.example.com/favicon.ico",
  "passwordType": "argon2id",
  "passwordOptions": ["AtLeast6"],
  "countryCodes": ["CN", "US"],
  "defaultAvatar": "",
  "defaultApplication": "agent-control-center",
  "tags": [],
  "languages": ["zh", "en"],
  "initScore": 0,
  "enableSoftDeletion": false,
  "isProfilePublic": false
}
```

### 4.2 Application

```json
{
  "owner": "kaixuan",
  "name": "my-saas-app",
  "createdTime": "2026-04-01T00:00:00Z",
  "displayName": "我的SaaS应用",
  "category": "",
  "type": "",
  "logo": "https://cdn.example.com/logo.png",
  "favicon": "https://cdn.example.com/favicon.ico",
  "homepageUrl": "https://my-app.example.com",
  "description": "示例SaaS应用",
  "organization": "kaixuan",
  "cert": "cert-built-in",
  "enablePassword": true,
  "enableSignUp": false,
  "enableCodeSignin": false,
  "enableAutoSignin": false,
  "enableSigninSession": true,
  "signinMethods": [
    { "name": "Password", "displayName": "密码", "rule": "All" }
  ],
  "signupItems": [
    { "name": "ID", "visible": false, "required": true, "prompted": false, "rule": "Random" },
    { "name": "Username", "visible": true, "required": true, "prompted": false, "rule": "None" },
    { "name": "Display name", "visible": true, "required": true, "prompted": false, "rule": "None" },
    { "name": "Password", "visible": true, "required": true, "prompted": false, "rule": "None" },
    { "name": "Confirm password", "visible": true, "required": true, "prompted": false, "rule": "None" },
    { "name": "Email", "visible": true, "required": true, "prompted": false, "rule": "None" },
    { "name": "Agreement", "visible": true, "required": true, "prompted": false, "rule": "None" }
  ],
  "grantTypes": ["authorization_code", "refresh_token"],
  "redirectUris": ["https://my-app.example.com/callback"],
  "tokenFormat": "JWT-Standard",
  "expireInHours": 24,
  "refreshExpireInHours": 168,
  "providers": [],
  "tags": []
}
```

**关键说明**：
- `name` 是全局唯一标识，Menu 的 `application` 字段必须与此一致
- `clientId` 和 `clientSecret` 由服务端自动生成，无需在 JSON 中指定
- `cert` 引用已存在的证书名称

### 4.3 User

```json
{
  "owner": "kaixuan",
  "name": "admin",
  "createdTime": "2026-03-14T00:00:00Z",
  "displayName": "管理员",
  "type": "normal-user",
  "password": "123456",
  "email": "admin@example.com",
  "phone": "",
  "avatar": "",
  "isAdmin": true,
  "isGlobalAdmin": true,
  "signupApplication": "agent-control-center",
  "properties": {}
}
```

### 4.4 Menu

```json
{
  "owner": "kaixuan",
  "name": "myapp-dashboard",
  "createdTime": "2026-04-01T00:00:00Z",
  "updatedTime": "2026-04-01T00:00:00Z",
  "displayName": "仪表板",
  "description": "",
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

**关键约束**：
- `application` **必须** 与 Application `name` 完全一致
- `parentId` 引用同 application 下的父菜单 `name`，空字符串表示顶级
- `type`: `Menu`（菜单项）或 `Button`（按钮级权限）

### 4.5 Role

```json
{
  "owner": "kaixuan",
  "name": "myapp-admin",
  "createdTime": "2026-04-01T00:00:00Z",
  "displayName": "应用管理员",
  "description": "my-saas-app 的管理员角色",
  "users": ["kaixuan/admin"],
  "roles": [],
  "isEnabled": true
}
```

### 4.6 Permission

```json
{
  "owner": "kaixuan",
  "name": "myapp-menu-access",
  "createdTime": "2026-04-01T00:00:00Z",
  "displayName": "应用菜单访问",
  "description": "允许访问 my-saas-app 的菜单路径",
  "model": "",
  "adapter": "",
  "resources": ["/dashboard", "/users", "/settings"],
  "actions": ["Read"],
  "effect": "Allow",
  "roles": ["kaixuan/myapp-admin"],
  "users": [],
  "isEnabled": true
}
```

### 4.7 Group

```json
{
  "owner": "kaixuan",
  "name": "dev-team",
  "createdTime": "2026-04-01T00:00:00Z",
  "displayName": "开发团队",
  "parentId": "",
  "type": "Virtual",
  "isEnabled": true
}
```

### 4.8 Department

```json
{
  "owner": "kaixuan",
  "name": "dept-tech",
  "createdTime": "2026-04-01T00:00:00Z",
  "updatedTime": "2026-04-01T00:00:00Z",
  "displayName": "技术部",
  "description": "负责平台技术研发",
  "parentId": "",
  "code": "TECH",
  "level": 1,
  "sortOrder": 1,
  "leader": "",
  "isEnabled": true
}
```

### 4.9 Post

```json
{
  "owner": "kaixuan",
  "name": "post-engineer",
  "createdTime": "2026-04-01T00:00:00Z",
  "updatedTime": "2026-04-01T00:00:00Z",
  "displayName": "工程师",
  "description": "软件工程师",
  "code": "ENG",
  "sortOrder": 4,
  "isEnabled": true
}
```

## 5. 接入应用模板

新应用可复制此模板，修改高亮字段后追加到 `init_data.json`：

```json
{
  "applications": [
    {
      "owner": "<组织名>",
      "name": "<应用唯一标识>",
      "displayName": "<显示名称>",
      "organization": "<组织名>",
      "logo": "<Logo URL>",
      "homepageUrl": "<首页地址>",
      "cert": "cert-built-in",
      "redirectUris": ["<回调地址>"],
      "tokenFormat": "JWT-Standard",
      "grantTypes": ["authorization_code", "refresh_token"],
      "expireInHours": 24,
      "enablePassword": true,
      "signinMethods": [{"name": "Password", "displayName": "密码", "rule": "All"}]
    }
  ],
  "menus": [
    {
      "owner": "<组织名>",
      "name": "<appPrefix>-dashboard",
      "displayName": "仪表板",
      "application": "<应用唯一标识>",
      "parentId": "",
      "path": "/dashboard",
      "icon": "DashboardOutlined",
      "type": "Menu",
      "sortOrder": 1,
      "visible": true,
      "isEnabled": true
    }
  ],
  "roles": [
    {
      "owner": "<组织名>",
      "name": "<appPrefix>-admin",
      "displayName": "管理员",
      "users": [],
      "isEnabled": true
    }
  ],
  "permissions": [
    {
      "owner": "<组织名>",
      "name": "<appPrefix>-full-access",
      "displayName": "完整访问",
      "resources": ["/dashboard"],
      "actions": ["Read", "Write"],
      "effect": "Allow",
      "roles": ["<组织名>/<appPrefix>-admin"],
      "isEnabled": true
    }
  ]
}
```

## 6. 现有应用配置参考

当前 `init_data.json` 中已定义的应用：

| 应用 name | 显示名 | 用途 |
|-----------|--------|------|
| `agent-control-center` | Agent Control Center | 统一管控台（ACC） |
| `official-portal` | 开轩官网 | 官方门户 |
| `kxmemory-app` | KxMemory | 知识记忆系统 |
| `stock-trading` | 量化交易 | 股票交易系统 |
| `doc-tools` | 文档工具 | 文档管理 |
| `trendaradar` | TrendRadar | 趋势分析 |
| `aicms` | AI CMS | AI 内容管理 |

## 7. 注意事项

- **加载顺序**：Organization 必须先于 Application，Application 先于依赖它的 Menu
- **幂等行为**：`initDataNewOnly = true` 时，已存在相同主键（`owner` + `name`）的记录会被跳过
- **密码处理**：User 的 `password` 在 JSON 中为明文，加载时自动按 Organization 配置的 `passwordType` 加密存储
- **空数组**：JSON 中未使用的列表字段应设为 `[]` 而非 `null`，避免反序列化问题
