# Casdoor 增强方案：将 PMS-GG 认证授权能力集成到 Casdoor

## 一、背景与目标

### 1.1 项目背景

**当前部署现状**:
- Casdoor 已部署于 `services/casdoor`
- 使用 PostgreSQL 数据库，配置于 `conf/app.conf`
- 已与 official-portal 通过 OAuth2 集成
- 服务运行在 Docker 容器中，端口 8000

**PMS-GG 现有能力**:
- auth-bff: 认证入口层 (登录、验证码、租户匹配、第三方登录)
- system: 核心权限管理 (用户、组织、角色、菜单、数据权限、权限模板、权限审计)

### 1.2 目标定义

将 PMS-GG 的以下能力**集成**到 Casdoor 代码库中：

| 能力 | 集成方式 | 优先级 |
|------|----------|--------|
| 数据权限 | 插件化扩展 | P0 |
| 列级权限 | 权限模型扩展 | P0 |
| 权限模板 | 插件化扩展 | P1 |
| 权限审计 | 插件化扩展 | P1 |
| 租户匹配 | 认证流程扩展 | P1 |
| 服务账号 | 用户模型扩展 | P2 |

---

## 二、系统架构设计

### 2.1 总体架构

```mermaid
graph TD
    subgraph "Casdoor Core (修改后)"
        A[认证入口] --> B[认证服务]
        B --> C[Token服务]
        C --> D[权限服务]
        D --> E[插件管理器]
    end
    
    subgraph "插件层"
        E --> F[数据权限插件]
        E --> G[权限模板插件]
        E --> H[权限审计插件]
        E --> I[租户匹配插件]
    end
    
    subgraph "存储层"
        J[(PostgreSQL)]
        F -.-> J
        G -.-> J
        H -.-> J
        I -.-> J
    end
    
    J ==原有Casdoor表== K
    J ==新增表== L
```

### 2.2 插件化架构

```go
// 权限插件接口定义
type PermissionPlugin interface {
    // 获取插件名称
    GetName() string
    
    // 权限检查 - 返回是否允许访问
    CheckPermission(ctx *PermissionContext) (bool, error)
    
    // 获取用户可访问的数据范围
    GetDataScope(ctx *PermissionContext) []string
    
    // 权限变更回调
    OnPermissionChanged(event *PermissionEvent)
}

// 数据权限插件接口
type DataScopePlugin interface {
    GetName() string
    
    // 获取行级数据权限规则
    GetRowRules(userId string, resource string) []RowRule
    
    // 获取列级权限规则
    GetColumnRules(userId string, resource string) []ColumnRule
    
    // 数据脱敏规则
    GetMaskRules(userId string, resource string) []MaskRule
}

// 插件注册
type PluginRegistry struct {
    permissionPlugins map[string]PermissionPlugin
    dataScopePlugins  map[string]DataScopePlugin
}

func (r *PluginRegistry) Register(p PermissionPlugin) {
    r.permissionPlugins[p.GetName()] = p
}
```

---

## 三、功能增强设计

### 3.1 数据权限模型 (P0)

**新增数据库表**:

```sql
-- 数据权限配置表
CREATE TABLE IF NOT EXISTS data_permission_config (
    id VARCHAR(100) PRIMARY KEY,
    owner VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL COMMENT '资源标识',
    permission_type VARCHAR(20) NOT NULL COMMENT 'row/column',
    rule_type VARCHAR(20) NOT NULL COMMENT 'dept/role/user/custom',
    rule_value TEXT COMMENT '规则值(JSON)',
    created_time VARCHAR(100),
    updated_time VARCHAR(100)
);

-- 列权限配置表
CREATE TABLE IF NOT EXISTS column_permission (
    id VARCHAR(100) PRIMARY KEY,
    owner VARCHAR(100) NOT NULL,
    role_id VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    permission VARCHAR(20) NOT NULL COMMENT 'read/write/hide',
    mask_rule VARCHAR(200) COMMENT '脱敏规则',
    created_time VARCHAR(100)
);

-- 权限模板表
CREATE TABLE IF NOT EXISTS permission_template (
    id VARCHAR(100) PRIMARY KEY,
    owner VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions TEXT NOT NULL COMMENT '权限列表(JSON)',
    scope VARCHAR(50) NOT NULL COMMENT '应用范围',
    created_time VARCHAR(100),
    updated_time VARCHAR(100)
);

-- 权限审计日志表
CREATE TABLE IF NOT EXISTS permission_audit_log (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL COMMENT 'grant/revoke/query',
    target_type VARCHAR(50) NOT NULL COMMENT 'user/role/dept',
    target_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(50),
    created_time VARCHAR(100) NOT NULL
);
```

**核心实现**:

```go
// 扩展 Permission 结构
type PermissionExt struct {
    // 原有字段
    *Permission
    
    // 扩展字段
    DataScopeRules  []DataScopeRule `json:"dataScopeRules"`
    ColumnRules     []ColumnRule    `json:"columnRules"`
    TemplateId      string          `json:"templateId"`
}

// 数据权限检查服务
type DataPermissionService struct {
    pluginRegistry *PluginRegistry
}

func (s *DataPermissionService) CheckDataPermission(ctx *PermissionContext, resource string) (bool, []string) {
    // 1. 获取用户角色
    roles := s.getUserRoles(ctx.UserId)
    
    // 2. 遍历角色查询数据权限
    var allowedDepts []string
    for _, role := range roles {
        rules := s.getDataScopeRules(role.Id, resource)
        for _, rule := range rules {
            allowedDepts = append(allowedDepts, rule.AllowedDepts...)
        }
    }
    
    return len(allowedDepts) > 0, allowedDepts
}
```

### 3.2 租户匹配增强 (P1)

```go
// 租户匹配服务
type TenantMatchService struct {
    matchers []TenantMatcher
}

type TenantMatcher interface {
    Match(ctx *MatchContext) (string, error)
}

// 应用信息匹配器
type AppInfoMatcher struct{}

func (m *AppInfoMatcher) Match(ctx *MatchContext) (string, error) {
    appId := ctx.Request.Header.Get("X-App-Id")
    if appId == "" {
        return "", errors.New("app_id_required")
    }
    
    // 查询应用对应的租户
    app, err := object.GetApplication(appId)
    if err != nil {
        return "", err
    }
    
    return app.Organization, nil
}

// 手机号匹配器
type PhoneMatcher struct{}

func (m *PhoneMatcher) Match(ctx *MatchContext) (string, error) {
    phone := ctx.Request.Form.Get("phone")
    if phone == "" {
        return "", nil
    }
    
    // 查询用户所属租户
    user, err := object.GetUserByPhone(phone)
    if err != nil {
        return "", err
    }
    
    return user.Owner, nil
}
```

### 3.3 权限模板 (P1)

```go
// 权限模板服务
type PermissionTemplateService struct {
    templateMap map[string]*PermissionTemplate
}

func (s *PermissionTemplateService) ApplyTemplate(userId, templateId string) error {
    template := s.GetTemplate(templateId)
    if template == nil {
        return errors.New("template_not_found")
    }
    
    // 解析权限列表
    var permissions []string
    json.Unmarshal([]byte(template.Permissions), &permissions)
    
    // 为用户批量添加权限
    for _, perm := range permissions {
        err := s.AddPermission(userId, perm)
        if err != nil {
            return err
        }
    }
    
    // 记录审计日志
    s.recordAudit(userId, "apply_template", templateId)
    
    return nil
}
```

---

## 四、实施计划

### 阶段一: 插件框架搭建 (3周)

| 周次 | 任务 | 交付物 |
|------|------|--------|
| 1 | 设计并实现插件接口 | `plugin/permission.go`, `plugin/datascope.go` |
| 2 | 实现插件注册与加载机制 | `plugin/registry.go`, 配置文件加载 |
| 3 | 搭建插件单元测试框架 | 测试用例覆盖 |

### 阶段二: 数据权限插件 (4周)

| 周次 | 任务 | 交付物 |
|------|------|--------|
| 4 | 数据库表设计与创建 | SQL 迁移脚本 |
| 5 | 数据权限检查逻辑实现 | `service/data_permission.go` |
| 6 | 列权限与脱敏功能实现 | `service/column_permission.go` |
| 7 | 管理界面开发 | 数据权限配置页面 |

### 阶段三: 权限模板与审计 (3周)

| 周次 | 任务 | 交付物 |
|------|------|--------|
| 8 | 权限模板 CRUD 实现 | `service/template.go` |
| 9 | 权限审计日志实现 | `service/audit.go` |
| 10 | 管理界面开发 | 模板管理、审计查看页面 |

### 阶段四: 租户匹配与集成 (2周)

| 周次 | 任务 | 交付物 |
|------|------|--------|
| 11 | 租户匹配服务重构 | `service/tenant_match.go` |
| 12 | 与现有认证流程集成 | 登录/注册流程改造 |

### 阶段五: 测试与部署 (2周)

| 周次 | 任务 | 交付物 |
|------|------|--------|
| 13 | 集成测试与性能测试 | 测试报告 |
| 14 | 部署配置更新 | Docker 配置、部署文档 |

---

## 五、风险与挑战

### 5.1 技术风险

| 风险 | 概率 | 影响 | 应对 |
|------|------|------|------|
| 插件版本兼容性问题 | 中 | 高 | 设计向前兼容接口 |
| 大规模权限检查性能 | 高 | 中 | 实现缓存与异步处理 |
| 数据迁移失败 | 低 | 高 | 完整备份与回滚脚本 |

### 5.2 业务风险

| 风险 | 概率 | 影响 | 应对 |
|------|------|------|------|
| 权限配置复杂度提升 | 中 | 中 | 提供默认模板与引导 |
| 原有功能回归 | 中 | 高 | 完整回归测试 |

---

## 六、收益分析

| 能力 | 当前状态 | 增强后 | 业务价值 |
|------|----------|--------|----------|
| 数据权限 | 无 | 行/列级 | 精细化数据管控 |
| 权限模板 | 无 | 完整支持 | 快速权限分配 |
| 权限审计 | 无 | 完整记录 | 安全合规 |
| 租户匹配 | 无 | 多策略 | 多租户场景支持 |

---

## 七、结论

本方案通过**插件化架构**将 PMS-GG 的核心能力集成到 Casdoor 中，保持 Casdoor 核心代码简洁性的同时，实现业务权限管理的灵活性。

**推荐实施路径**:
1. 优先实现数据权限 (P0) - 业务刚需
2. 逐步完善权限模板与审计 (P1) - 提升效率
3. 最后实现租户匹配增强 (P1) - 优化体验

---

## 附录: 文件位置

| 内容 | 路径 |
|------|------|
| Casdoor 代码库 | `./services/casdoor` |
| 当前部署配置 | `../docker-compose.yml` |
| PMS-GG 参考代码 | `/Users/xutaohuang/workspace/pms-gg/modules/system` |

---

## 版本信息

- 文档版本: v2.0
- 创建日期: 2026-04-01
- 作者: Architecture Team
- 更新说明: 插件化架构设计，替代原有外部集成方案