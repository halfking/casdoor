# 组织架构整合方案

## 一、背景与目标

### 1.1 现状问题
- **旧系统** (`/management/departments`, `/management/posts`)：基于 `owner/name` 复合主键，功能较为简单
- **新系统** (`/management/org-tree`, `/management/positions`)：基于自增 ID，支持树形结构和权限集成，但缺少一些旧系统的特性

### 1.2 整合目标
采用**方案 A**：逐步用新系统替代旧系统

1. **增强 OrgTree**：增加 `code`、`leader`、`level` 属性，匹配 Department 的功能
2. **增强 Position**：增加 `code` 属性，用于与原来的 Post 匹配
3. **数据迁移**：将 Department 数据迁移到 OrgTree，Post 数据迁移到 Position
4. **废弃旧系统**：在确认迁移完成后，将 Department/Post 标记为废弃

---

## 二、数据模型修改

### 2.1 OrgTree 增强

**文件**: `object/org_tree.go`

```go
type OrgTree struct {
    Id              int     `xorm:"int pk autoincr" json:"id"`
    ParentId        int     `xorm:"int" json:"parentId"`         // 父节点 (整数)
    OrgName         string  `xorm:"varchar(100)" json:"orgName"` // 组织标识
    DisplayName     string  `xorm:"varchar(100)" json:"displayName"`
    OrgType         string  `xorm:"varchar(20)" json:"orgType"`  // org/dept/team
    Level           int     `xorm:"int" json:"level"`           // 新增：层级
    SortOrder       int     `xorm:"int" json:"sortOrder"`
    CasdoorOrgName  string  `xorm:"varchar(100)" json:"casdoorOrgName"`
    Code            string  `xorm:"varchar(50)" json:"code"`     // 新增：编码 (对应 Department.code)
    Leader          string  `xorm:"varchar(100)" json:"leader"`  // 新增：负责人
    Metadata        string  `xorm:"-" json:"metadata"`
    CreatedAt       string  `xorm:"-" json:"createdAt"`
    UpdatedAt       string  `xorm:"-" json:"updatedAt"`
}
```

### 2.2 Position 增强

**文件**: `object/position.go`

```go
type Position struct {
    Id              int     `xorm:"int pk autoincr" json:"id"`
    RoleOwner       string  `xorm:"column(role_owner) varchar(100)" json:"roleOwner"`
    RoleName        string  `xorm:"column(role_name) varchar(100)" json:"roleName"`
    Code            string  `xorm:"column(code) varchar(50)" json:"code"`  // 新增：编码
    FullDescription string  `xorm:"column(full_description) text" json:"fullDescription"`
    Skills          string  `xorm:"-" json:"skills"`
    Requirements    string  `xorm:"column(requirements) text" json:"requirements"`
    SystemPrompt    string  `xorm:"column(system_prompt) text" json:"systemPrompt"`
    Department      string  `xorm:"column(department) varchar(100)" json:"department"`
    ReportsTo       string  `xorm:"column(reports_to) varchar(100)" json:"reportsTo"`
    ImpliedRole     string  `xorm:"column(implied_role) varchar(100)" json:"impliedRole"`
    Metadata        string  `xorm:"-" json:"metadata"`
    CreatedAt       string  `xorm:"-" json:"createdAt"`
    UpdatedAt       string  `xorm:"-" json:"updatedAt"`
}
```

---

## 三、数据库迁移

### 3.1 OrgTree 表结构变更

```sql
-- 添加新列到 org_tree 表
ALTER TABLE org_tree ADD COLUMN IF NOT EXISTS code VARCHAR(50);
ALTER TABLE org_tree ADD COLUMN IF NOT EXISTS leader VARCHAR(100);
ALTER TABLE org_tree ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0;
```

### 3.2 Position 表结构变更

```sql
-- 添加 code 列到 position_detail 表
ALTER TABLE position_detail ADD COLUMN IF NOT EXISTS code VARCHAR(50);
```

### 3.3 数据迁移脚本

```sql
-- 1. 将 Department 数据迁移到 OrgTree
INSERT INTO org_tree (parent_id, org_name, display_name, org_type, level, sort_order, casdoor_org_name, code, leader)
SELECT 
    COALESCE((SELECT id FROM org_tree WHERE org_name = d.parent_id), 0) as parent_id,
    d.name as org_name,
    d.display_name,
    'dept' as org_type,
    d.level,
    d.sort_order,
    d.owner as casdoor_org_name,
    d.code,
    d.leader
FROM department d
WHERE NOT EXISTS (SELECT 1 FROM org_tree WHERE org_name = d.name);

-- 2. 将 Post 数据迁移到 Position (通过 code 关联)
INSERT INTO position_detail (role_owner, role_name, code, full_description, department)
SELECT 
    p.owner as role_owner,
    p.name as role_name,
    p.code,
    p.description as full_description,
    '' as department  -- Post 没有部门关联，需手动处理
FROM post p
WHERE NOT EXISTS (SELECT 1 FROM position_detail WHERE role_name = p.name);
```

---

## 四、前端修改

### 4.1 OrgTreePage.vue 增强

**文件**: `web-vue/src/views/management/OrgTreePage.vue`

**新增字段**:
- `code`: 组织编码
- `leader`: 负责人
- `level`: 层级

**UI 更新**:
- 表单增加 code、leader、level 输入框
- 列表展示增加这些列

### 4.2 PositionEditPage.vue 增强

**文件**: `web-vue/src/views/management/PositionEditPage.vue`

**新增字段**:
- `code`: 岗位编码

### 4.3 PositionListPage.vue 增强

**文件**: `web-vue/src/views/management/PositionListPage.vue`

**新增列**:
- `code`: 岗位编码

---

## 五、实施步骤

### 阶段一：数据模型增强

1. [ ] 修改 `object/org_tree.go` - 增加 code, leader, level 字段
2. [ ] 修改 `object/position.go` - 增加 code 字段
3. [ ] 创建数据库迁移 SQL 脚本
4. [ ] 执行数据库结构变更

### 阶段二：API 适配

1. [ ] 更新 OrgTree 的 CRUD API (controllers/org_tree.go)
2. [ ] 更新 Position 的 CRUD API (controllers/position.go)
3. [ ] 更新前端 API 模块 (`web-vue/src/api/modules/orgtree.ts`)
4. [ ] 更新前端 API 模块 (`web-vue/src/api/modules/position.ts`)

### 阶段三：前端 UI 增强

1. [ ] 更新 OrgTreePage.vue - 增加 code, leader, level 字段
2. [ ] 更新 PositionListPage.vue - 增加 code 列
3. [ ] 更新 PositionEditPage.vue - 增加 code 字段
4. [ ] 更新国际化文件 (locales/zh/data.json 等)

### 阶段四：数据迁移

1. [ ] 创建数据迁移脚本
2. [ ] 备份现有数据
3. [ ] 执行数据迁移
4. [ ] 验证迁移完整性

### 阶段五：废弃旧系统 (可选，后续执行)

1. [ ] 将 Department/Post 菜单标记为废弃
2. [ ] 添加废弃提示
3. [ ] 清理旧代码 (如确认无依赖)

---

## 六、依赖关系分析

### 6.1 Workflow 依赖

**当前状态**:
- `workflow` 表有 `department` 字段
- 但初始化数据中该字段均为空，未实际使用

**处理方案**:
- 保持 Workflow 的 department 字段不变
- 如后续需要，可以改为引用 OrgTree 的 code 字段

### 6.2 UserExt 关联

**当前状态**:
- `UserExt.postId` 可能同时关联 Post 和 Position

**处理方案**:
- 迁移完成后，统一使用 Position.id
- 清理时确保 UserExt.postId 指向新的 Position

---

## 七、风险与注意事项

1. **数据一致性**: 迁移过程中需确保原子性，建议事务处理
2. **回滚方案**: 保留旧表数据，迁移失败时可回滚
3. **API 兼容性**: 新增字段需注意 JSON 序列化兼容性
4. **前端适配**: 确保新增字段在前端正确展示和编辑

---

## 八、验证清单

- [ ] OrgTree 新增字段测试 (CRUD)
- [ ] Position 新增字段测试 (CRUD)
- [ ] 数据库迁移脚本执行成功
- [ ] 前端新增字段正确展示
- [ ] 原有 Department/Post 数据完整迁移
- [ ] UserExt.postId 关联正确
- [ ] Workflow 功能正常 (如有使用 department)

