# BFF API 参考

> BFF (Backend For Frontend) 增强层提供 4 个聚合端点，供前端与外部应用获取菜单树、批量权限、数据域和租户信息。

## 通用说明

| 项目 | 说明 |
|------|------|
| 基础地址 | `https://auth.itestu.cn` |
| 认证方式 | Cookie（登录后 Session）或 Bearer Token |
| 响应格式 | JSON，统一包装 `{"status": "ok", "data": {...}}` |
| 错误响应 | `{"status": "error", "msg": "错误信息"}` |
| 授权策略 | 所有 BFF 端点已在 Casbin 内置策略中开放，登录用户即可访问 |

## 1. 获取应用菜单树

### `GET /api/bff/app-menus`

根据当前用户权限返回指定应用的菜单树。

**请求参数**

| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| `application` | query | string | ✅ | Application `name`（非 displayName） |

**响应**

```json
{
  "status": "ok",
  "data": {
    "application": "agent-control-center",
    "menus": [
      {
        "owner": "kaixuan",
        "name": "acc-dashboard",
        "displayName": "仪表板",
        "application": "agent-control-center",
        "parentId": "",
        "path": "/dashboard",
        "icon": "DashboardOutlined",
        "component": "DashboardPage",
        "type": "Menu",
        "sortOrder": 1,
        "visible": true,
        "isEnabled": true,
        "children": []
      },
      {
        "owner": "kaixuan",
        "name": "acc-rbac",
        "displayName": "权限控制",
        "path": "",
        "children": [
          { "name": "acc-roles", "displayName": "角色管理", "path": "/management/roles", "children": [] },
          { "name": "acc-permissions", "displayName": "权限管理", "path": "/management/permissions", "children": [] }
        ]
      }
    ],
    "traceId": "random-trace-id"
  }
}
```

**权限规则**
- Admin / GlobalAdmin 用户：返回全部菜单
- 普通用户：仅返回 `CheckApiPermission()` 允许的叶子菜单 + 无 path 的容器菜单

**错误场景**

| HTTP 状态 | msg | 原因 |
|-----------|-----|------|
| 200 | `application is required` | 缺少 application 参数 |
| 200 | menus 为空数组 | application 不匹配或无菜单数据 |
| 401 | 未登录 | 无有效 Session/Token |

---

## 2. 批量权限解析

### `POST /api/bff/resolve-permissions`

一次请求检查当前用户对多个功能路径的访问权限。

**请求体**

```json
{
  "tenant": "kaixuan",
  "subject": "kaixuan/admin",
  "checks": [
    "/dashboard",
    "/management/users",
    "/management/roles",
    "/api/get-users"
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tenant` | string | — | 租户名称，缺省使用当前用户 Owner |
| `subject` | string | — | 目标用户 ID `org/name`，缺省使用当前登录用户 |
| `checks` | string[] | ✅ | 待检查的功能路径列表 |

**响应**

```json
{
  "status": "ok",
  "data": {
    "tenant": "kaixuan",
    "subject": "kaixuan/admin",
    "results": [
      { "resource": "/dashboard", "allowed": true, "matchedPolicy": "api-permission" },
      { "resource": "/management/users", "allowed": true, "matchedPolicy": "api-permission" },
      { "resource": "/management/roles", "allowed": false, "matchedPolicy": "api-permission" }
    ],
    "traceId": "random-trace-id"
  }
}
```

**安全约束**
- 非 GlobalAdmin 用户不可跨租户查询（`tenant` 必须是自己所属 org）
- 非 GlobalAdmin 用户不可查询其他租户的用户（`subject` 必须同 org）

---

## 3. 数据域检查

### `POST /api/bff/check-data-scope`

检查用户对特定资源类型的行级数据访问范围。

**请求体**

```json
{
  "tenant": "kaixuan",
  "subject": "kaixuan/admin",
  "resourceType": "User",
  "operation": "Read",
  "recordContext": {}
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tenant` | string | — | 租户名称 |
| `subject` | string | — | 目标用户 ID |
| `resourceType` | string | ✅ | 资源类型名 |
| `operation` | string | — | 操作: `Read` / `Write` / `Delete` / `Admin` |
| `recordContext` | object | — | 额外上下文（预留扩展） |

**响应**

```json
{
  "status": "ok",
  "data": {
    "allowed": true,
    "scopeFilter": { "tenant": "kaixuan" },
    "fieldRules": [],
    "obligations": [],
    "matchedPolicy": "api-permission",
    "traceId": "random-trace-id"
  }
}
```

| 字段 | 说明 |
|------|------|
| `allowed` | 是否允许访问 |
| `scopeFilter` | 数据过滤条件（客户端应追加为查询条件） |
| `fieldRules` | 字段级规则（预留） |
| `obligations` | 附加义务（预留） |

---

## 4. 租户树

### `GET /api/bff/tenant-tree`

获取当前用户可见的组织/租户列表。

**请求参数**

| 参数 | 位置 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| `owner` | query | string | — | Organization 的 owner，默认 `built-in` |

**响应**

```json
{
  "status": "ok",
  "data": {
    "items": [
      {
        "tenant": "kaixuan",
        "displayName": "开轩",
        "owner": "built-in"
      }
    ],
    "traceId": "random-trace-id"
  }
}
```

**权限规则**
- GlobalAdmin：返回所有 Organization
- 普通用户：仅返回自己所属的 Organization

---

## 5. 冒烟测试脚本

参见 `scripts/authz-bff-smoke.sh`，覆盖全部 4 个端点的自动化冒烟验证。

```bash
# 基本用法（需先在 kaixuan-1 上登录获取 cookie）
ssh kaixuan-1 "bash /path/to/authz-bff-smoke.sh"
```

测试步骤：
1. 登录获取会话 Cookie
2. `GET /api/bff/app-menus?application=agent-control-center` — 验证菜单树非空
3. `POST /api/bff/resolve-permissions` — 验证权限批量解析
4. `POST /api/bff/check-data-scope` — 验证数据域检查
5. `GET /api/bff/tenant-tree` — 验证租户列表

## 6. 客户端集成示例

### 前端获取菜单（Vue/React）

```typescript
async function fetchAppMenus(application: string): Promise<MenuTree[]> {
  const res = await fetch(`/api/bff/app-menus?application=${application}`, {
    credentials: 'include',  // 携带 Cookie
  });
  const json = await res.json();
  if (json.status !== 'ok') throw new Error(json.msg);
  return json.data.menus;
}
```

### 前端批量权限检查

```typescript
async function resolvePermissions(checks: string[]): Promise<Record<string, boolean>> {
  const res = await fetch('/api/bff/resolve-permissions', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checks }),
  });
  const json = await res.json();
  if (json.status !== 'ok') throw new Error(json.msg);

  const perms: Record<string, boolean> = {};
  for (const r of json.data.results) {
    perms[r.resource] = r.allowed;
  }
  return perms;
}
```
