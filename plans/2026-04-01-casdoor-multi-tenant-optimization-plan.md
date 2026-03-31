# Casdoor 认证中心优化方案（多租户/组织树/群组/权限树/数据权限）

## 0. 起点与备份

- 时间：2026-04-01
- 备份基线：`backup/pre-plan-20260401-001343`（分支）
- 备份标签：`pre-plan-20260401-001343`
- 当前分支：`master`
- 当前基线提交：`ea81b197`
- 发现未跟踪文件：`web-vue/src/views/management/ProductStorePage.vue`

## 1. 当前能力盘点（已实现）

### 1.1 PostgreSQL 独立库

- 已启用 PostgreSQL：`conf/app.conf` 中 `driverName = postgres`
- 独立数据库：`docker-compose.yml` 中 `postgres` 服务，默认库 `casdoor`

### 1.2 多租户（组织隔离）

- 以 `Organization` 作为租户隔离基本单位（`owner` 维度）
- 组织相关 API 已存在：`/api/get-organizations`、`/api/get-organization` 等

### 1.3 多级组织树与群组结构

- 群组实体支持父子关系：`object/group.go` 的 `ParentId`、`Children`
- 已有群组树前端页面：`web-vue/src/views/management/GroupTreePage.vue`

### 1.4 权限模型

- 基于 Casbin（RBAC/ABAC）能力已具备：`object/enforcer.go`、`object/permission.go`
- 统一授权判定链路：`authz/authz.go`

## 2. 关键缺口（必须补齐）

1. 多租户边界规则未显式制度化（当前偏“约定式 owner 过滤”）
2. 组织树与群组树关联关系缺少统一模型约束（跨组织节点防护不足）
3. 菜单/按钮级权限在 web-vue 仍以静态菜单构造为主，缺“权限点动态投影”
4. 数据权限缺少标准验证 API（应用系统难以统一接入）
5. 对 pms-gg 的对接契约未定义（仓库内无 auth-bff/system 参考实现）
6. 审计标准、截图核对流程、并行执行策略未形成工程化模板

## 3. 目标架构（不破坏现有协议适配）

在保留 OAuth 2.1 / OIDC / SAML / CAS / LDAP / SCIM / WebAuthn 现有链路的前提下，新增“授权中台增强层”：

- 租户域：Tenant（组织）
- 组织域：OrgNode（多级树）
- 群组域：GroupNode（同租户树状/网状）
- 功能权限域：FeatureNode（菜单/按钮/API action）
- 数据权限域：DataPolicy（资源范围 + 字段级策略）

## 4. API 规划（先验证后落地）

### 4.1 功能权限验证 API（给前端与 BFF）

- `POST /api/authz/check-feature`
- 入参：`tenant`, `subject`, `resource`, `action`, `context`
- 出参：`allowed`, `reason`, `matchedPolicy`, `traceId`

### 4.2 批量权限预取 API（给菜单/按钮渲染）

- `POST /api/authz/check-feature-batch`
- 入参：`tenant`, `subject`, `checks[]`
- 出参：`results[]`（每项包含 `allowed`）

### 4.3 数据权限验证 API（本期重点）

- `POST /api/authz/check-data-scope`
- 入参：`tenant`, `subject`, `resourceType`, `operation`, `recordContext`
- 出参：
  - `allowed`
  - `scopeFilter`（结构化过滤表达式，供业务系统执行）
  - `fieldRules`（字段可见/可改）
  - `obligations`（脱敏/审计动作）

### 4.4 pms-gg 对接 API（兼容预留）

- `POST /api/bff/resolve-permissions`
- `POST /api/bff/check-data-scope`
- `GET /api/bff/tenant-tree`

说明：仓库内暂未找到 pms-gg 的 auth-bff/system 代码，先按契约驱动设计，待外部仓库联调时补齐适配器。

## 5. Plan 模式输出（本轮）

### 5.1 可行方案（3选1）

- 方案 A：增量 Casbin 扩展（推荐）
  - 优点：改动小、风险低、复用现有策略
  - 缺点：数据权限表达能力需额外 DSL
- 方案 B：引入 Policy Engine 双轨（Casbin + OPA）
  - 优点：数据策略表达强
  - 缺点：复杂度和运维成本上升
- 方案 C：自研统一授权引擎
  - 优点：高度定制
  - 缺点：研发和维护成本最高

推荐：先 A 后 B（分期演进）。

### 5.2 任务拆分（可并行）

- T1：租户边界治理（后端）
- T2：组织树/群组树一致性校验（后端）
- T3：功能权限验证 API（后端）
- T4：数据权限验证 API（后端）
- T5：菜单/按钮权限投影（web-vue）
- T6：审计日志与追踪（后端）
- T7：联调适配层（面向 pms-gg）
- T8：E2E 测试与截图审计

并行建议：`T2 + T3 + T5 + T6` 可并行；`T4` 在 `T3` 稳定后并行推进。

### 5.3 审计标准（DoD）

- 安全：
  - 任一跨租户访问均被拒绝并记录审计
  - 菜单可见 ≠ 接口可调；后端必须二次鉴权
- 正确性：
  - 组织树/群组树无跨租户脏关联
  - 权限树可追溯到策略 ID
- 兼容性：
  - 现有 OAuth/OIDC/SAML/CAS/LDAP/SCIM 回归测试通过
- 可观测性：
  - 每次鉴权返回 `traceId`，日志可回放
- 前端验收：
  - 页面截图与设计规范逐页比对，无高优先级偏差

## 6. Agent 模式执行编排

### 6.1 执行顺序

1. A0：启动检查与冒烟（服务全启动）
2. A1：实现 T1/T2（后端数据边界）
3. A2：实现 T3（功能权限 API）
4. A3：实现 T5（前端菜单/按钮鉴权接入）
5. A4：实现 T4（数据权限 API）
6. A5：实现 T6/T7（审计追踪 + pms-gg 兼容层）
7. A6：全量测试 + 页面截图审计 + 修复闭环

### 6.2 并行子代理策略

- 子代理 P1：后端模型与控制器改造（T1/T2）
- 子代理 P2：授权 API 与审计（T3/T4/T6）
- 子代理 P3：前端权限投影（T5）
- 子代理 P4：测试与截图核验（T8）

每个任务完成后必须执行“实现结果 vs 审计标准”核对，不合格立即返工。

## 7. 服务启动与测试前置清单

1. `docker compose ps` 所有核心服务为 `running/healthy`
2. PostgreSQL 连接与迁移检查通过
3. Casdoor 鉴权基础 API 冒烟通过（登录、获取账户、enforce）
4. 前端可访问且静态资源版本正确

## 8. 行业标准参考（不侵入现有协议）

- Keycloak：Realm/Tenant 边界与组织隔离实践
- Auth0 / Okta：细粒度授权 + BFF 模式
- Casbin 社区最佳实践：RBAC with domains + ABAC 条件
- Kubernetes RBAC 思路：最小权限、显式拒绝优先

## 9. 风险与回滚

- 风险：策略配置复杂度上升、前端与后端权限不一致
- 对策：
  - 引入策略版本化与灰度开关
  - 批量校验接口支持“预演模式”
  - 任一高风险变更可回滚至 `pre-plan-20260401-001343`
