# Casdoor 前端 Vue 3 整体重写方案

> 创建时间: 2026-03-28 03:05
> 状态: 方案讨论中
> 约束: 后端不动，仅重写前端

## 一、现状

| 指标 | 数据 |
|------|------|
| 框架 | React 18 Class Components |
| UI | Ant Design 5 |
| 文件数 | 273 JS 文件 |
| 代码量 | 57,240 行 |
| 路由 | react-router-dom v5 |
| 构建 | CRA + craco |
| 国际化 | i18next（200+ 语言） |

## 二、代码分布

```
root/      81 files, 32,435 lines  ← 核心页面 + Setting/Conf/Util 工具
table/     34 files,  6,536 lines  ← 通用表格组件（BaseListPage 等）
auth/      58 files,  8,532 lines  ← 认证（登录/OAuth/MFA/30+第三方按钮）
common/    40 files,  4,529 lines  ← 通用组件（Modal/Select/Theme/Editor）
backend/   37 files,  2,937 lines  ← API 调用层（纯 fetch）
provider/  12 files,  1,307 lines  ← 第三方登录 Provider 逻辑
basic/      6 files,    621 lines  ← 基础页面
pricing/    2 files,    308 lines  ← 定价页面
account/    2 files,     72 lines  ← 账户页面
security/   1 file,      54 lines  ← 安全工具
```

## 三、批评与诊断

### 严重问题

1. **技术栈不统一** — Casdoor 是唯一的 React 项目，Memora/Portal 全是 Vue 3，维护两套体系成本高
2. **Class Components 95%+** — 无法与 Vue Composition API 做渐进式迁移，必须整体重写
3. **Ant Design API 差异大** — `Form.create()`、`Table columns render`、`Modal.method()` 在 React 和 Vue 版完全不同

### 风险点

4. **OAuth 回调逻辑复杂** — AuthCallback.js 处理 6 种 responseType（code/token/id_token/saml/cas/link），是整个认证体系的核心
5. **MFA 流程** — 7 种 MFA 验证方式（Totp/Sms/Radius/Push/Password/WebAuthn/Email）
6. **30+ 第三方登录按钮** — 数量多但模式重复

### 可复用部分

7. **backend/*.js** — 纯 fetch 调用，可 1:1 转为 axios，工作量最小
8. **国际化 JSON** — 200+ 语言文件可直接用 vue-i18n
9. **@kaixuan/shared** — SharedNavbar、auth-service、unified-links 已有，直接复用

## 四、改写计划

### 技术选型

| 项目 | React 版 | Vue 版 |
|------|---------|--------|
| 框架 | React 18 | Vue 3 + TypeScript |
| 构建 | CRA + craco | Vite |
| UI | Ant Design 5 | Ant Design Vue 4 |
| 路由 | react-router-dom v5 | Vue Router 4 |
| 状态管理 | setState (class) | Pinia |
| 国际化 | i18next | vue-i18n |
| HTTP | fetch | axios |

### Phase 1：基础设施（1-2天）

- [ ] Vue 3 + Vite + TypeScript 项目初始化
- [ ] Ant Design Vue + Vue Router + Pinia + vue-i18n 配置
- [ ] 复用 @kaixuan/shared（SharedNavbar + auth-service + unified-links）
- [ ] API 层移植：backend/*.js → composables/useApi.ts
- [ ] 通用 Composables：useTheme、useAuth、useOrganization
- [ ] 路由配置（与原 React 版路由 1:1 对应）
- [ ] 暗色主题 + 浅色主题配置
- [ ] Dockerfile 适配（Go 后端 embed Vue build）

### Phase 2：认证流程（2-3天）⚠️ 最高优先级

- [ ] LoginPage（登录表单 + 组织选择 + 验证码）
- [ ] SignupPage（注册）
- [ ] ForgetPage / SelfForgetPage（忘记密码）
- [ ] AuthCallback（6 种 responseType）← 核心难点
- [ ] SamlCallback
- [ ] ConsentPage（OAuth 同意页）
- [ ] PromptPage（OAuth 提示页）
- [ ] MFA 流程（7 种验证方式）
- [ ] 30+ 第三方登录按钮（可用脚本批量生成）
- [ ] 登录回跳逻辑（redirect_uri/from 参数传递）

### Phase 3：管理页面 — 核心模块（3-4天）

- [ ] useTable Composable（通用 CRUD 表格）
- [ ] ManagementPage 布局（侧边栏 + 内容区）
- [ ] UserListPage / UserEditPage
- [ ] ApplicationListPage / ApplicationEditPage
- [ ] OrganizationListPage / OrganizationEditPage
- [ ] RoleListPage / RoleEditPage
- [ ] PermissionListPage / PermissionEditPage
- [ ] ModelListPage / ModelEditPage
- [ ] ProviderListPage / ProviderEditPage
- [ ] GroupListPage / GroupEditPage / GroupTreePage

### Phase 4：管理页面 — 扩展模块（2-3天）

- [ ] Cert / Enforcer / Syncer / Ldap
- [ ] Product / Pricing / Order / Payment / Subscription
- [ ] Token / Session / Record / Webhook
- [ ] Ticket / Resource / Verification
- [ ] Account / Basic / Pricing 页面
- [ ] Dashboard 统计

### Phase 5：收尾验证（1天）

- [ ] 路由守卫 + 权限控制
- [ ] 残余页面清理
- [ ] 响应式 / 移动端适配
- [ ] Docker 构建部署
- [ ] E2E 测试：登录→管理→切换主题→退出
- [ ] 删除旧 React web/ 目录

## 五、执行策略

### 使用 ACP / Copilot CLI

每个 Phase 用 `copilot -p` 执行，配合人工验收：

```bash
# Phase 1 示例
cd ~/workspace/official-deploy/services/casdoor
copilot -p "$(cat docs/vue-rewrite-phase1.md)" --allow-all-paths --allow-tool='write' --allow-tool='shell(*)'
```

### 质量保证

- 每个 Phase 完成后必须 `yarn build` 通过
- 每个 Phase 完成后提交 Git，标记 tag（v-vue-phase1 等）
- 认证流程（Phase 2）完成后必须做登录/回调/MFA 手动测试
- 后端零改动，所有 API 接口保持不变

## 六、预估

| Phase | 天数 | 风险 |
|-------|------|------|
| 基础设施 | 1-2 | 低 |
| 认证流程 | 2-3 | **高** |
| 核心模块 | 3-4 | 中 |
| 扩展模块 | 2-3 | 中 |
| 收尾验证 | 1 | 低 |
| **总计** | **9-13 天** | |

## 七、Docker 部署适配

改造完成后，Dockerfile 需要更新：
- 前端阶段：从 React CRA 改为 Vue Vite
- Go 后端 embed：需要更新 embed 路径
- 构建：`npm run build` 替代 `yarn run build`

```dockerfile
FROM node:20-alpine AS FRONT
WORKDIR /web
COPY web/package.json web/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY shared /shared
COPY web .
RUN npx vite build

# Go 后端 embed 前端产物（路径不变）