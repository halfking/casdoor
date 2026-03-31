# Web-Vue 功能迁移计划

## 概述

本文档详细描述了从 web-old (React) 向 web-vue (Vue 3) 迁移缺失功能的计划。

## 当前状态分析

### Web-Vue 已完成的自定义页面

这些页面已经用 Vue 框架完整实现，无需处理：

| 模块 | 列表页面 | 编辑页面 |
|------|----------|----------|
| Users | UserListPage.vue | UserEditPage.vue |
| Organizations | OrganizationListPage.vue | OrganizationEditPage.vue |
| Applications | ApplicationListPage.vue | ApplicationEditPage.vue |
| Roles | RoleListPage.vue | RoleEditPage.vue |
| Permissions | PermissionListPage.vue | PermissionEditPage.vue |
| Models | ModelListPage.vue | ModelEditPage.vue |
| Providers | ProviderListPage.vue | ProviderEditPage.vue |
| Groups | GroupListPage.vue | GroupEditPage.vue |
| Departments | DepartmentListPage.vue | DepartmentEditPage.vue |
| Posts | PostListPage.vue | PostEditPage.vue |
| Menus | MenuListPage.vue | MenuEditPage.vue |
| Permission Rules | PermissionRuleListPage.vue | PermissionRuleEditPage.vue |
| Resources | ResourceListView.vue | ResourceEditView.vue |

### Web-Vue 使用通用组件的页面

这些页面使用 GenericResourceListPage 和 GenericResourceEditPage，配置在 resource-configs-extra.ts 中：

- invitations, resources, certs, adapters, enforcers
- sessions, records, tokens, verifications
- products, payments, plans, pricings, subscriptions, transactions, orders
- systemInfo, forms, syncers, webhooks, tickets

---

## 需要迁移的功能页面

### 1. 首页模块

| 页面 | web-old 路径 | web-vue 状态 | 优先级 |
|------|-------------|-------------|--------|
| ShortcutsPage | /shortcuts | 缺失 | 中 |
| AppListPage | /apps | 缺失 | 中 |

### 2. 账户模块

| 页面 | web-old 路径 | web-vue 状态 | 优先级 |
|------|-------------|-------------|--------|
| AccountPage | /account | 缺失 | 高 |

### 3. 组织架构模块

| 页面 | web-old 路径 | web-vue 状态 | 优先级 |
|------|-------------|-------------|--------|
| GroupTreePage | /trees/:organizationName | 缺失 | 中 |

### 4. 网关/站点模块

| 页面 | web-old 路径 | web-vue 状态 | 优先级 |
|------|-------------|-------------|--------|
| SiteListPage | /sites | 缺失 | 高 |
| SiteEditPage | /sites/:organizationName/:siteName | 缺失 | 高 |
| RuleListPage | /rules | 缺失 | 高 |
| RuleEditPage | /rules/:organizationName/:ruleName | 缺失 | 高 |

### 5. 商业/支付模块

| 页面 | web-old 路径 | web-vue 状态 | 优先级 |
|------|-------------|-------------|--------|
| ProductStorePage | /product-store | 缺失 | 中 |
| CartListPage | /cart | 缺失 | 中 |
| ProductBuyPage | /products/:org/:name/buy | 缺失 | 中 |
| OrderPayPage | /orders/:org/:name/pay | 缺失 | 中 |

### 6. LDAP 模块

| 页面 | web-old 路径 | web-vue 状态 | 优先级 |
|------|-------------|-------------|--------|
| LdapEditPage | /ldap/:organizationName/:ldapId | 缺失 | 低 |
| LdapSyncPage | /ldap/sync/:organizationName/:ldapId | 缺失 | 低 |

---

## 多语言支持现状

### Web-Old 支持的语言

web-old/src/locales/ 目录包含以下语言：
- en (英语) - 默认
- zh (中文)
- de (德语)
- es (西班牙语)
- fr (法语)
- ja (日语)
- pl (波兰语)
- pt (葡萄牙语)
- tr (土耳其语)
- uk (乌克兰语)
- vi (越南语)

### Web-Vue i18n 配置

当前 web-vue 的 i18n 配置：
- 默认只加载英文
- 支持懒加载其他语言
- 语言文件从 web-old/src/locales 目录引用

### 需要完善的多语言功能

1. 确保所有菜单项支持多语言
2. 添加语言切换组件的完整支持
3. 验证所有页面文本都已国际化

---

## 迁移任务分解

### 阶段一：高优先级页面

#### 任务 1.1：AccountPage 账户页面
- 创建 `web-vue/src/views/account/AccountPage.vue`
- 参考web-old/src/account/AccountPage.js
- 包含用户信息展示、头像上传、密码修改等功能

#### 任务 1.2：Site 站点管理
- 创建 `web-vue/src/views/management/SiteListPage.vue`
- 创建 `web-vue/src/views/management/SiteEditPage.vue`
- 添加路由配置
- 添加 resource-configs 配置

#### 任务 1.3：Rule 规则管理
- 创建 `web-vue/src/views/management/RuleListPage.vue`
- 创建 `web-vue/src/views/management/RuleEditPage.vue`
- 添加路由配置
- 添加 resource-configs 配置

### 阶段二：中优先级页面

#### 任务 2.1：ShortcutsPage 快捷方式
- 创建 `web-vue/src/views/basic/ShortcutsPage.vue`
- 参考web-old/src/basic/ShortcutsPage.js

#### 任务 2.2：AppListPage 应用列表
- 创建 `web-vue/src/views/basic/AppListPage.vue`
- 参考web-old/src/basic/AppListPage.js

#### 任务 2.3：GroupTreePage 组织树
- 创建 `web-vue/src/views/management/GroupTreePage.vue`
- 参考web-old/src/GroupTreePage.js
- 实现树形组织结构展示

#### 任务 2.4：商业模块页面
- ProductStorePage - 产品商店
- CartListPage - 购物车
- ProductBuyPage - 产品购买
- OrderPayPage - 订单支付

### 阶段三：低优先级页面

#### 任务 3.1：LDAP 模块
- LdapEditPage - LDAP 编辑
- LdapSyncPage - LDAP 同步

### 阶段四：多语言完善

#### 任务 4.1：菜单国际化
- 确保所有菜单项使用 i18n 键
- 验证语言切换功能

#### 任务 4.2：页面文本国际化
- 检查所有页面的硬编码文本
- 转换为 i18n 调用

#### 任务 4.3：语言文件完整性
- 验证所有语言文件的键值完整性
- 补充缺失的翻译

---

## 技术实现指南

### Vue 组件转换模式

```vue
<!-- React 组件转换示例 -->
<template>
  <!-- JSX 转换为 template -->
</template>

<script setup lang="ts">
// React hooks 转换为 Vue composables
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();
</script>
```

### API 调用模式

```typescript
// 使用现有的 API 模块
import * as SiteApi from '@/api/modules/site';

// 或添加新的 API 模块
// web-vue/src/api/modules/site.ts
```

### 路由配置模式

```typescript
// router/index.ts
{ 
  path: '/management/sites', 
  name: 'management-sites', 
  component: () => import('@/views/management/SiteListPage.vue'), 
  meta: { layout: 'management', requiresAuth: true } 
}
```

---

## 文件结构规划

```
web-vue/src/
├── views/
│   ├── account/
│   │   └── AccountPage.vue          # 新增
│   ├── basic/
│   │   ├── ShortcutsPage.vue        # 新增
│   │   └── AppListPage.vue          # 新增
│   └── management/
│       ├── GroupTreePage.vue        # 新增
│       ├── SiteListPage.vue         # 新增
│       ├── SiteEditPage.vue         # 新增
│       ├── RuleListPage.vue         # 新增
│       ├── RuleEditPage.vue         # 新增
│       ├── ProductStorePage.vue     # 新增
│       ├── CartListPage.vue         # 新增
│       ├── ProductBuyPage.vue       # 新增
│       ├── OrderPayPage.vue         # 新增
│       ├── LdapEditPage.vue         # 新增
│       └── LdapSyncPage.vue         # 新增
├── api/modules/
│   ├── site.ts                       # 新增
│   └── rule.ts                       # 新增
└── utils/
    └── resource-configs-extra.ts     # 更新配置
```

---

## 验收标准

1. 所有页面功能与 web-old 对等
2. 所有文本支持多语言
3. 路由配置正确，支持直接访问和内部跳转
4. 表单验证和错误处理完善
5. 响应式布局适配移动端

---

## 执行顺序建议

1. 先完成高优先级页面（Account、Site、Rule）
2. 完善多语言支持
3. 完成中优先级页面
4. 最后完成低优先级页面（LDAP）
