-- ============================================================================
-- 开轩平台组织扩展表初始化
-- 包含: 组织树结构、岗位详情、工作流定义、智能体映射
-- 设计决策:
--   - 多租户: 每个根组织独立 Casdoor Organization
--   - 菜单: 公共菜单统一 + 部门专属菜单隔离
--   - 工作流: 独立表存储，ACC 执行
--   - 模板: Casdoor 扩展表存储
-- 执行: docker exec -i postgres psql -U casdoor -d casdoor < init-kaixuan-org-extensions.sql
-- ============================================================================

\echo '============================================'
\echo '  开轩平台组织扩展表初始化'
\echo '============================================'

-- ============================================================================
-- PART 1: 创建扩展表
-- ============================================================================

-- 组织树结构（部门/组/岗位层级）
CREATE TABLE IF NOT EXISTS org_tree (
    id SERIAL PRIMARY KEY,
    owner VARCHAR(100) NOT NULL,                    -- Casdoor Organization
    parent_id INTEGER REFERENCES org_tree(id),      -- 父节点
    node_type VARCHAR(20) NOT NULL,                  -- department/group/position/agent
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',                    -- 扩展信息（图标、颜色、设备信息等）
    created_time VARCHAR(100),
    updated_time VARCHAR(100),
    UNIQUE(owner, name)
);

-- 岗位详情（突破 Casdoor role.description 100字限制）
CREATE TABLE IF NOT EXISTS position_detail (
    id SERIAL PRIMARY KEY,
    owner VARCHAR(100) NOT NULL,                    -- Casdoor Organization
    role_name VARCHAR(100) NOT NULL,               -- 关联 Casdoor Role.name
    full_description TEXT,                         -- 完整职责描述
    skills TEXT[],                                 -- 所需技能列表
    requirements TEXT,                             -- 任职要求
    system_prompt TEXT,                            -- 直接可用的 System Prompt
    workflow_names TEXT[],                          -- 关联的工作流
    metadata JSONB DEFAULT '{}',
    created_time VARCHAR(100),
    updated_time VARCHAR(100),
    UNIQUE(owner, role_name)
);

-- 工作流定义（独立于 Casdoor Permission）
CREATE TABLE IF NOT EXISTS workflow (
    id SERIAL PRIMARY KEY,
    owner VARCHAR(100) NOT NULL,                    -- Casdoor Organization
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    description TEXT,
    category VARCHAR(50),                          -- tech/ops/gov/common
    steps JSONB NOT NULL,                          -- [{name, roles[], order, input, output}]
    is_template BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_time VARCHAR(100),
    updated_time VARCHAR(100),
    UNIQUE(owner, name)
);

-- 工作流执行记录
CREATE TABLE IF NOT EXISTS workflow_execution (
    id SERIAL PRIMARY KEY,
    workflow_id INTEGER REFERENCES workflow(id),
    task_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',            -- pending/running/completed/failed
    current_step INTEGER DEFAULT 0,
    context JSONB DEFAULT '{}',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_time VARCHAR(100)
);

-- 智能体映射表
CREATE TABLE IF NOT EXISTS agent_mapping (
    id SERIAL PRIMARY KEY,
    owner VARCHAR(100) NOT NULL,                    -- Casdoor Organization
    agent_name VARCHAR(100) NOT NULL,              -- Casdoor User.name (virtual user)
    device_id INTEGER REFERENCES org_tree(id),     -- 所属设备 (org_tree)
    role_name VARCHAR(100) NOT NULL,               -- 关联 Casdoor Role.name
    supervisor_name VARCHAR(100),                -- 设备主管 (Casdoor User.name)
    agent_config JSONB DEFAULT '{}',                -- LLM配置、技能标签等
    is_active BOOLEAN DEFAULT TRUE,
    created_time VARCHAR(100),
    updated_time VARCHAR(100),
    UNIQUE(owner, agent_name)
);

-- 菜单-组织绑定表
CREATE TABLE IF NOT EXISTS menu_org_binding (
    id SERIAL PRIMARY KEY,
    menu_name VARCHAR(100) NOT NULL,               -- Casdoor Menu.name
    owner VARCHAR(100) NOT NULL,                  -- Casdoor Organization
    is_public BOOLEAN DEFAULT FALSE,              -- 是否公共菜单
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_time VARCHAR(100),
    UNIQUE(menu_name, owner)
);

-- 组织模板表
CREATE TABLE IF NOT EXISTS org_template (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    description TEXT,
    category VARCHAR(50),                          -- ecommerce/xiaohongshu/livestream/dev/content/cs/marketing/data/supply/finance
    org_tree_template JSONB,                       -- 组织树模板
    position_templates JSONB,                      -- 岗位模板列表
    workflow_templates JSONB,                      -- 工作流模板列表
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    created_time VARCHAR(100),
    updated_time VARCHAR(100)
);

\echo '>>> PART 1: 扩展表创建完成'

-- ============================================================================
-- PART 2: 初始化 kaixuan 组织树
-- ============================================================================

-- 清空旧数据（幂等）
DELETE FROM agent_mapping WHERE owner = 'kaixuan';
DELETE FROM menu_org_binding WHERE owner = 'kaixuan';
DELETE FROM workflow WHERE owner = 'kaixuan';
DELETE FROM position_detail WHERE owner = 'kaixuan';
DELETE FROM org_tree WHERE owner = 'kaixuan';

-- 2.1 设备节点（部门级）
INSERT INTO org_tree (owner, node_type, name, display_name, description, sort_order, metadata, created_time) VALUES
('kaixuan', 'department', 'dept-kaixuan-1', '龙一设备', 'kaixuan-1 (192.168.31.28): PostgreSQL, Casdoor, ACC, KxMemory, Doc-Tools, Neo4j', 1, '{"hostname": "kaixuan-1", "ip": "192.168.31.28", "services": ["postgres", "casdoor", "acc", "kxmemory", "doc-tools", "neo4j"]}'::jsonb, NOW()::text),
('kaixuan', 'department', 'dept-kaixuan-2', '龙二设备', 'kaixuan-2 (192.168.31.19): OpenClaw Gateway', 2, '{"hostname": "kaixuan-2", "ip": "192.168.31.19", "services": ["openclaw-gateway"]}'::jsonb, NOW()::text),
('kaixuan', 'department', 'dept-kaixuan-3', '龙三设备', 'kaixuan-3 (192.168.31.30): Ollama, Personal-API, PMS', 3, '{"hostname": "kaixuan-3", "ip": "192.168.31.30", "services": ["ollama", "personal-api", "pms"]}'::jsonb, NOW()::text),
('kaixuan', 'department', 'dept-m4macbookpro', '虾王设备', 'm4macbookpro (192.168.31.44): OpenClaw Gateway, 本地开发', 4, '{"hostname": "m4macbookpro", "ip": "192.168.31.44", "services": ["openclaw-gateway", "local-dev"]}'::jsonb, NOW()::text);

-- 2.2 获取设备ID用于后续关联
DO $$
DECLARE
    dept1_id INTEGER;
    dept2_id INTEGER;
    dept3_id INTEGER;
    dept4_id INTEGER;
BEGIN
    SELECT id INTO dept1_id FROM org_tree WHERE name = 'dept-kaixuan-1';
    SELECT id INTO dept2_id FROM org_tree WHERE name = 'dept-kaixuan-2';
    SELECT id INTO dept3_id FROM org_tree WHERE name = 'dept-kaixuan-3';
    SELECT id INTO dept4_id FROM org_tree WHERE name = 'dept-m4macbookpro';
    
    -- 2.3 设备主管（岗位级，在设备节点下）
    INSERT INTO org_tree (owner, parent_id, node_type, name, display_name, description, sort_order, metadata, created_time) VALUES
    ('kaixuan', dept1_id, 'position', 'dragon-1-supervisor', '龙一主管', '数据库与基础设施负责人', 1, '{"user_type": "supervisor", "parent": "huangxt"}'::jsonb, NOW()::text),
    ('kaixuan', dept2_id, 'position', 'dragon-2-supervisor', '龙二主管', 'Worker节点负责人', 1, '{"user_type": "supervisor", "parent": "huangxt"}'::jsonb, NOW()::text),
    ('kaixuan', dept3_id, 'position', 'dragon-3-supervisor', '龙三主管', 'Ollama+本地服务负责人', 1, '{"user_type": "supervisor", "parent": "huangxt"}'::jsonb, NOW()::text),
    ('kaixuan', dept4_id, 'position', 'shrimp-king-supervisor', '虾王主管', '移动开发节点负责人', 1, '{"user_type": "supervisor", "parent": "huangxt"}'::jsonb, NOW()::text);
END $$;

\echo '>>> PART 2: 组织树初始化完成'

-- ============================================================================
-- PART 3: 初始化岗位详情（System Prompt）
-- ============================================================================

-- 技术研发部岗位
INSERT INTO position_detail (owner, role_name, full_description, skills, system_prompt, created_time) VALUES
('kaixuan', 'dept-tech-cto', '技术总监，负责技术研发部整体技术方向与决策。审批架构方案、评估技术风险、把控代码质量。推动技术选型标准化和技术债务治理。', 
 ARRAY['系统架构', '团队管理', '技术决策', '代码质量'], 
 '# 角色: 技术总监(CTO)

## 职责
- 负责技术研发部整体技术方向与决策
- 审批架构方案、评估技术风险、把控代码质量
- 推动技术选型标准化和技术债务治理

## 能力要求
- 10年以上技术经验
- 精通系统架构和团队管理
- 全局视野和决策能力

## 决策权限
- 技术选型最终审批
- 架构方案审批
- 团队人员晋升决策', NOW()::text),

('kaixuan', 'dept-tech-system-architect', '系统架构师，负责系统架构设计和技术选型，输出架构设计文档(ADR)。设计数据库模型、API契约、微服务边界。评估系统性能和可扩展性。',
 ARRAY['系统设计', '数据库设计', 'API设计', '性能优化'],
 '# 角色: 系统架构师

## 职责
- 负责系统架构设计和技术选型
- 输出架构设计文档(ADR)
- 设计数据库模型、API契约、微服务边界
- 评估系统性能和可扩展性

## 能力要求
- 精通分布式系统和领域驱动设计
- 熟悉微服务架构
- 良好的文档能力', NOW()::text),

('kaixuan', 'dept-tech-frontend-dev', '前端开发工程师，负责Web/移动端前端开发，使用Vue3/React构建用户界面。实现UI设计稿，优化前端性能和用户体验。编写单元测试和E2E测试。',
 ARRAY['Vue3', 'React', 'TypeScript', 'CSS', '性能优化', '单元测试', 'E2E测试'],
 '# 角色: 前端开发工程师

## 职责
- 负责Web/移动端前端开发
- 使用Vue3/React构建用户界面
- 实现UI设计稿
- 优化前端性能和用户体验
- 编写单元测试和E2E测试

## 能力要求
- 精通前端技术栈(Vue3/React/TypeScript)
- 熟悉响应式设计和CSS
- 了解前端安全最佳实践', NOW()::text),

('kaixuan', 'dept-tech-backend-dev', '后端开发工程师，负责服务端API设计和开发，使用Java/Go构建RESTful/gRPC接口。设计数据库表结构，处理并发事务缓存。编写单元测试和集成测试。',
 ARRAY['Java', 'Go', 'RESTful', 'gRPC', '数据库设计', '并发处理'],
 '# 角色: 后端开发工程师

## 职责
- 负责服务端API设计和开发
- 使用Java/Go构建RESTful/gRPC接口
- 设计数据库表结构
- 处理并发事务缓存
- 编写单元测试和集成测试

## 能力要求
- 熟悉微服务架构
- 精通数据库设计
- 了解缓存和消息队列', NOW()::text);

\echo '>>> PART 3: 岗位详情初始化完成'

-- ============================================================================
-- PART 4: 初始化工作流
-- ============================================================================

-- 软件开发工作流
INSERT INTO workflow (owner, name, display_name, description, category, steps, created_time) VALUES
('kaixuan', 'wf-software-dev', '软件开发流程', '标准软件开发流程：需求→设计→开发→测试→部署', 'tech',
 '[{"name": "requirement", "displayName": "需求分析", "roles": ["dept-tech-product-owner", "dept-tech-cto"], "order": 1, "input": "原始需求", "output": "需求文档"}, {"name": "architecture", "displayName": "架构设计", "roles": ["dept-tech-system-architect", "dept-tech-cto"], "order": 2, "input": "需求文档", "output": "架构设计文档"}, {"name": "development", "displayName": "开发实现", "roles": ["dept-tech-frontend-dev", "dept-tech-backend-dev"], "order": 3, "input": "架构设计", "output": "代码+PR"}, {"name": "testing", "displayName": "测试验收", "roles": ["dept-tech-qa-lead"], "order": 4, "input": "代码", "output": "测试报告"}, {"name": "deployment", "displayName": "部署交付", "roles": ["dept-tech-devops"], "order": 5, "input": "测试报告", "output": "上线"}]',
 NOW()::text);

-- 内容创作工作流
INSERT INTO workflow (owner, name, display_name, description, category, steps, created_time) VALUES
('kaixuan', 'wf-content-creation', '内容创作流程', '内容创作：策划→创作→审核→发布→复盘', 'ops',
 '[{"name": "planning", "displayName": "内容策划", "roles": ["dept-ops-content-lead"], "order": 1, "input": "选题", "output": "策划方案"}, {"name": "creation", "displayName": "内容创作", "roles": ["dept-ops-content-writer", "dept-ops-video-creator"], "order": 2, "input": "策划方案", "output": "内容成品"}, {"name": "review", "displayName": "内容审核", "roles": ["dept-ops-content-lead"], "order": 3, "input": "内容成品", "output": "审核意见"}, {"name": "publish", "displayName": "发布推广", "roles": ["dept-ops-kol-manager"], "order": 4, "input": "审核通过", "output": "发布链接"}, {"name": "analysis", "displayName": "复盘优化", "roles": ["dept-ops-content-lead"], "order": 5, "input": "数据反馈", "output": "优化建议"}]',
 NOW()::text);

\echo '>>> PART 4: 工作流初始化完成'

-- ============================================================================
-- PART 5: 初始化菜单-组织绑定
-- ============================================================================

-- 公共菜单（所有组织可见）
INSERT INTO menu_org_binding (menu_name, owner, is_public, sort_order, created_time) VALUES
('公共导航', 'kaixuan', true, 0, NOW()::text),
('公共导航', 'personal', true, 0, NOW()::text);

-- kaixuan 专属菜单
INSERT INTO menu_org_binding (menu_name, owner, is_public, sort_order, created_time) VALUES
('ACC管理', 'kaixuan', false, 1, NOW()::text),
('知识库', 'kaixuan', false, 2, NOW()::text),
('文档工具', 'kaixuan', false, 3, NOW()::text);

-- personal 专属菜单
INSERT INTO menu_org_binding (menu_name, owner, is_public, sort_order, created_time) VALUES
('个人中心', 'personal', false, 1, NOW()::text);

\echo '>>> PART 5: 菜单绑定初始化完成'

-- ============================================================================
-- PART 6: 初始化组织模板
-- ============================================================================

INSERT INTO org_template (name, display_name, description, category, created_time) VALUES
('org-template-ecommerce', '电商运营组织模板', '适用于淘宝/京东/拼多多店铺运营团队', 'ecommerce', NOW()::text),
('org-template-xiaohongshu', '小红书运营模板', '适用于小红书品牌营销、内容种草团队', 'xiaohongshu', NOW()::text),
('org-template-livestream', '抖音直播运营模板', '适用于直播带货团队', 'livestream', NOW()::text),
('org-template-software-dev', '软件开发团队模板', '适用于敏捷开发团队', 'dev', NOW()::text),
('org-template-content', '内容创作模板', '适用于自媒体/内容创作者团队', 'content', NOW()::text),
('org-template-customer-service', '客户服务模板', '适用于客服中心团队', 'cs', NOW()::text),
('org-template-marketing', '市场营销模板', '适用于市场营销团队', 'marketing', NOW()::text),
('org-template-data', '数据分析模板', '适用于数据分析团队', 'data', NOW()::text),
('org-template-supply', '供应链管理模板', '适用于供应链管理团队', 'supply', NOW()::text),
('org-template-finance', '财务行政模板', '适用于财务与行政团队', 'finance', NOW()::text);

\echo '>>> PART 6: 组织模板初始化完成'

-- ============================================================================
-- PART 7: 验证
-- ============================================================================

\echo '--- 组织树 ---'
SELECT node_type, name, display_name FROM org_tree WHERE owner = 'kaixuan' ORDER BY sort_order, name;

\echo '--- 岗位详情 ---'
SELECT role_name, left(full_description, 50) as desc_preview FROM position_detail WHERE owner = 'kaixuan';

\echo '--- 工作流 ---'
SELECT name, display_name, category FROM workflow WHERE owner = 'kaixuan';

\echo '--- 菜单绑定 ---'
SELECT menu_name, owner, is_public FROM menu_org_binding ORDER BY owner, sort_order;

\echo '--- 组织模板 ---'
SELECT name, display_name, category FROM org_template;

\echo '============================================'
\echo '  组织扩展表初始化完成'
\echo '============================================'
