#!/bin/bash
# ============================================================================
# 开轩平台 Casdoor 补充初始化脚本
# 用途：初始化组织、用户、角色、设备主管、智能体员工、开发工作流
# 标准入口：通过 scripts/apply-platform-config.sh --with-platform-bootstrap 调用
# 不建议直接手工执行；顶部 host/port 默认值仅用于手工排障时兜底
# ============================================================================
set -euo pipefail

CASDOOR_HOST="${CASDOOR_HOST:-192.168.31.28}"
CASDOOR_PORT="${CASDOOR_PORT:-9035}"
POSTGRES_CONTAINER="${CASDOOR_POSTGRES_CONTAINER:-postgres}"
CASDOOR_DB_USER="${CASDOOR_DB_USER:-casdoor}"
CASDOOR_DB_NAME="${CASDOOR_DB_NAME:-casdoor}"
PSQL="${PSQL:-docker exec -i ${POSTGRES_CONTAINER} psql -U ${CASDOOR_DB_USER} -d ${CASDOOR_DB_NAME}}"

echo "============================================"
echo "  开轩平台 Casdoor 初始化"
echo "  时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "============================================"

# ============================================================================
# PART 1: 组织 (Organizations)
# ============================================================================
echo ""
echo ">>> PART 1: 创建组织"

$PSQL <<'SQL'
-- 确保组织存在
INSERT INTO organization (name, display_name, website_url, owner, created_time)
VALUES ('kaixuan', '开轩', 'https://itestu.cn', 'admin', NOW()::text)
ON CONFLICT (name) DO UPDATE SET display_name = '开轩', website_url = 'https://itestu.cn';

INSERT INTO organization (name, display_name, website_url, owner, created_time)
VALUES ('personal', 'Personal', 'https://itestu.cn', 'admin', NOW()::text)
ON CONFLICT (name) DO NOTHING;

-- 验证
SELECT name, display_name FROM organization ORDER BY name;
SQL

# ============================================================================
# PART 2: 用户 (Users) — 人类成员
# ============================================================================
echo ""
echo ">>> PART 2: 创建用户（人类成员）"

# 密码 hash 生成: bcrypt cost=10, 密码统一为 Veritrans&9527
# $2a$10$YJVw/1lDvT8bF6G4lZQzYe3bXkxH3G6.UlOdHqHCYX/9JyHCYCm6

$PSQL <<'SQL'
-- 2.1 黄旭涛 — CTO / 平台负责人
INSERT INTO "user" (owner, name, display_name, id, password, email, phone, lark, type, 
    is_admin, score, created_time, updated_time, signup_application)
VALUES ('kaixuan', 'huangxt', '黄旭涛', 'user-huangxt-001',
    '$2a$10$YJVw/1lDvT8bF6G4lZQzYe3bXkxH3G6.UlOdHqHCYX/9JyHCYCm6',
    'huangxt@itestu.cn', '', 'ou_6eaefecfe9bd7c8f7f05127e1a0414c5', 'normal-user',
    true, 0, NOW()::text, NOW()::text, 'app-built-in')
ON CONFLICT (owner, name) DO UPDATE SET 
    display_name = '黄旭涛', lark = 'ou_6eaefecfe9bd7c8f7f05127e1a0414c5',
    email = 'huangxt@itestu.cn', is_admin = true;

-- 2.2 龙一主管 — 数据库与基础设施
INSERT INTO "user" (owner, name, display_name, id, password, type,
    is_admin, score, created_time, updated_time, signup_application)
VALUES ('kaixuan', 'dragon-1-supervisor', '龙一主管', 'user-dragon1-001',
    '$2a$10$YJVw/1lDvT8bF6G4lZQzYe3bXkxH3G6.UlOdHqHCYX/9JyHCYCm6', 'normal-user',
    false, 0, NOW()::text, NOW()::text, 'app-built-in')
ON CONFLICT (owner, name) DO NOTHING;

-- 2.3 龙二主管 — Worker 节点
INSERT INTO "user" (owner, name, display_name, id, password, type,
    is_admin, score, created_time, updated_time, signup_application)
VALUES ('kaixuan', 'dragon-2-supervisor', '龙二主管', 'user-dragon2-001',
    '$2a$10$YJVw/1lDvT8bF6G4lZQzYe3bXkxH3G6.UlOdHqHCYX/9JyHCYCm6', 'normal-user',
    false, 0, NOW()::text, NOW()::text, 'app-built-in')
ON CONFLICT (owner, name) DO NOTHING;

-- 2.4 龙三主管 — Ollama + 本地服务
INSERT INTO "user" (owner, name, display_name, id, password, type,
    is_admin, score, created_time, updated_time, signup_application)
VALUES ('kaixuan', 'dragon-3-supervisor', '龙三主管', 'user-dragon3-001',
    '$2a$10$YJVw/1lDvT8bF6G4lZQzYe3bXkxH3G6.UlOdHqHCYX/9JyHCYCm6', 'normal-user',
    false, 0, NOW()::text, NOW()::text, 'app-built-in')
ON CONFLICT (owner, name) DO NOTHING;

-- 2.5 虾王主管 — 移动开发节点
INSERT INTO "user" (owner, name, display_name, id, password, type,
    is_admin, score, created_time, updated_time, signup_application)
VALUES ('kaixuan', 'shrimp-king-supervisor', '虾王主管', 'user-shrimpking-001',
    '$2a$10$YJVw/1lDvT8bF6G4lZQzYe3bXkxH3G6.UlOdHqHCYX/9JyHCYCm6', 'normal-user',
    false, 0, NOW()::text, NOW()::text, 'app-built-in')
ON CONFLICT (owner, name) DO NOTHING;

-- 验证
SELECT owner, name, display_name, lark, is_admin FROM "user" WHERE owner = 'kaixuan' ORDER BY name;
SQL

# ============================================================================
# PART 3: 角色定义 (Roles)
# ============================================================================
echo ""
echo ">>> PART 3: 创建角色"

$PSQL <<'SQL'
-- 清理旧角色（如存在）
DELETE FROM role WHERE owner = 'kaixuan' AND name LIKE 'role-%';

-- 开发系统核心角色
INSERT INTO role (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'role-cto',               'CTO/技术负责人',     '平台整体技术方向与决策', NOW()::text),
('kaixuan', 'role-device-supervisor',  '设备主管',           '管理设备及其旗下智能体', NOW()::text),
('kaixuan', 'role-system-architect',   '系统架构师',         '整体架构与技术选型',     NOW()::text),
('kaixuan', 'role-task-decomposer',    '任务分解专家',       '生成执行计划与子任务',   NOW()::text),
('kaixuan', 'role-project-manager',    '项目经理',           '进度与风险控制',         NOW()::text),
('kaixuan', 'role-vue-frontend',       '前端工程师',         'Vue3/TypeScript开发',   NOW()::text),
('kaixuan', 'role-java-developer',     'Java后端工程师',     'Spring Boot开发',       NOW()::text),
('kaixuan', 'role-go-developer',       'Go研发工程师',       'Gin/gRPC开发',          NOW()::text),
('kaixuan', 'role-db-specialist',      '数据库专家',         'PostgreSQL/MySQL/Redis', NOW()::text),
('kaixuan', 'role-frontend-tester',    '前端测试专家',       '单元/E2E/覆盖率测试',   NOW()::text),
('kaixuan', 'role-backend-tester',     '后端测试专家',       'API/集成/负载测试',      NOW()::text),
('kaixuan', 'role-devops',             'DevOps工程师',       'CI/CD与云原生部署',     NOW()::text),
('kaixuan', 'role-security-manager',   '安全管理员',         '应用安全与合规',         NOW()::text),
('kaixuan', 'role-doc-manager',        '文档管理员',         '规格与调用链文档',       NOW()::text),
('kaixuan', 'role-qa-specialist',      '质量保证专家',       '质量审计与标准',         NOW()::text),
('kaixuan', 'role-ops-messenger',      '运营信使',           '消息推送与运营',         NOW()::text),
('kaixuan', 'role-agent-worker',       '智能体员工',         '被设备主管管理的AI员工', NOW()::text);

SELECT name, display_name FROM role WHERE owner = 'kaixuan' ORDER BY name;
SQL

# ============================================================================
# PART 4: 设备资源注册 (在 properties 字段中)
# ============================================================================
echo ""
echo ">>> PART 4: 注册设备信息"

$PSQL <<'SQL'
-- 更新设备主管的 properties 字段，记录设备信息
UPDATE "user" SET properties = '{"devices": [{"name": "龙一", "hostname": "kaixuan-1", "ip": "192.168.31.28", "role": "数据库+基础设施", "services": ["postgres", "casdoor", "ACC", "KxMemory", "doc-tools", "neo4j"]}]}'
WHERE owner = 'kaixuan' AND name = 'dragon-1-supervisor';

UPDATE "user" SET properties = '{"devices": [{"name": "龙二", "hostname": "kaixuan-2", "ip": "192.168.31.19", "role": "Worker节点", "services": ["OpenClaw Gateway"]}]}'
WHERE owner = 'kaixuan' AND name = 'dragon-2-supervisor';

UPDATE "user" SET properties = '{"devices": [{"name": "龙三", "hostname": "kaixuan-3", "ip": "192.168.31.30", "role": "Ollama+本地服务", "services": ["Ollama", "personal-api", "PMS服务"]}]}'
WHERE owner = 'kaixuan' AND name = 'dragon-3-supervisor';

UPDATE "user" SET properties = '{"devices": [{"name": "虾王", "hostname": "m4macbookpro", "ip": "192.168.31.44", "role": "移动开发节点", "services": ["OpenClaw Gateway", "本地开发"]}]}'
WHERE owner = 'kaixuan' AND name = 'shrimp-king-supervisor';

SELECT name, display_name, properties FROM "user" WHERE owner = 'kaixuan' AND name LIKE '%supervisor%';
SQL

# ============================================================================
# PART 5: 智能体员工注册 (作为虚拟用户)
# ============================================================================
echo ""
echo ">>> PART 5: 注册智能体员工"

$PSQL <<'SQL'
-- 每个设备下的标准开发团队智能体（虚拟用户）
-- 龙一的智能体
INSERT INTO "user" (owner, name, display_name, id, password, type, is_admin, score, created_time, updated_time, signup_application, properties)
VALUES ('kaixuan', 'agent-dragon1-architect', '龙一-架构师', 'agent-d1-arch-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
    '{"device": "kaixuan-1", "role": "system-architect", "parent": "dragon-1-supervisor"}')
ON CONFLICT (owner, name) DO NOTHING;

INSERT INTO "user" (owner, name, display_name, id, password, type, is_admin, score, created_time, updated_time, signup_application, properties)
VALUES ('kaixuan', 'agent-dragon1-java-dev', '龙一-Java工程师', 'agent-d1-java-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
    '{"device": "kaixuan-1", "role": "java-developer", "parent": "dragon-1-supervisor"}')
ON CONFLICT (owner, name) DO NOTHING;

INSERT INTO "user" (owner, name, display_name, id, password, type, is_admin, score, created_time, updated_time, signup_application, properties)
VALUES ('kaixuan', 'agent-dragon1-go-dev', '龙一-Go工程师', 'agent-d1-go-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
    '{"device": "kaixuan-1", "role": "go-developer", "parent": "dragon-1-supervisor"}')
ON CONFLICT (owner, name) DO NOTHING;

INSERT INTO "user" (owner, name, display_name, id, password, type, is_admin, score, created_time, updated_time, signup_application, properties)
VALUES ('kaixuan', 'agent-dragon1-devops', '龙一-DevOps', 'agent-d1-devops-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
    '{"device": "kaixuan-1", "role": "devops", "parent": "dragon-1-supervisor"}')
ON CONFLICT (owner, name) DO NOTHING;

-- 龙二的智能体
INSERT INTO "user" (owner, name, display_name, id, password, type, is_admin, score, created_time, updated_time, signup_application, properties)
VALUES ('kaixuan', 'agent-dragon2-architect', '龙二-架构师', 'agent-d2-arch-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
    '{"device": "kaixuan-2", "role": "system-architect", "parent": "dragon-2-supervisor"}')
ON CONFLICT (owner, name) DO NOTHING;

INSERT INTO "user" (owner, name, display_name, id, password, type, is_admin, score, created_time, updated_time, signup_application, properties)
VALUES ('kaixuan', 'agent-dragon2-vue-frontend', '龙二-前端工程师', 'agent-d2-vue-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
    '{"device": "kaixuan-2", "role": "vue-frontend", "parent": "dragon-2-supervisor"}')
ON CONFLICT (owner, name) DO NOTHING;

-- 龙三的智能体
INSERT INTO "user" (owner, name, display_name, id, password, type, is_admin, score, created_time, updated_time, signup_application, properties)
VALUES ('kaixuan', 'agent-dragon3-architect', '龙三-架构师', 'agent-d3-arch-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
    '{"device": "kaixuan-3", "role": "system-architect", "parent": "dragon-3-supervisor"}')
ON CONFLICT (owner, name) DO NOTHING;

INSERT INTO "user" (owner, name, display_name, id, password, type, is_admin, score, created_time, updated_time, signup_application, properties)
VALUES ('kaixuan', 'agent-dragon3-qa', '龙三-QA专家', 'agent-d3-qa-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
    '{"device": "kaixuan-3", "role": "qa-specialist", "parent": "dragon-3-supervisor"}')
ON CONFLICT (owner, name) DO NOTHING;

-- 虾王的智能体
INSERT INTO "user" (owner, name, display_name, id, password, type, is_admin, score, created_time, updated_time, signup_application, properties)
VALUES ('kaixuan', 'agent-shrimpking-dev', '虾王-本地开发', 'agent-sk-dev-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
    '{"device": "m4macbookpro", "role": "local-dev", "parent": "shrimp-king-supervisor"}')
ON CONFLICT (owner, name) DO NOTHING;

-- 验证
SELECT name, display_name, type, properties->>'device' as device, properties->>'role' as role 
FROM "user" WHERE owner = 'kaixuan' AND type = 'virtual' ORDER BY name;
SQL

# ============================================================================
# PART 6: 开发工作流定义 (存为 Casdoor Permission)
# ============================================================================
echo ""
echo ">>> PART 6: 创建开发工作流"

$PSQL <<'SQL'
-- 主开发工作流（存为 permissions）
DELETE FROM permission WHERE owner = 'kaixuan' AND name LIKE 'workflow-%';

INSERT INTO permission (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'workflow-requirement',    '需求分析阶段',     '收集需求、编写需求文档、评审',          NOW()::text),
('kaixuan', 'workflow-architecture',   '架构设计阶段',     '技术选型、架构设计、API契约定义',       NOW()::text),
('kaixuan', 'workflow-task-split',     '任务分解阶段',     '拆分任务、分配给智能体员工',             NOW()::text),
('kaixuan', 'workflow-development',    '开发实现阶段',     '编码实现、代码审查、单元测试',           NOW()::text),
('kaixuan', 'workflow-testing',        '测试验收阶段',     '集成测试、E2E测试、性能测试',           NOW()::text),
('kaixuan', 'workflow-deployment',     '部署交付阶段',     'CI/CD部署、健康检查、文档更新',          NOW()::text);

-- 工作流-角色关联（通过 permission_rule）
DELETE FROM permission_rule WHERE owner = 'kaixuan' AND permission LIKE 'workflow-%';

INSERT INTO permission_rule (owner, permission, v0, v1, v2, created_time) VALUES
-- 需求分析：CTO + 项目经理 + 文档管理员
('kaixuan', 'workflow-requirement',    'role-cto',             'role-project-manager',     'role-doc-manager',             NOW()::text),
-- 架构设计：CTO + 系统架构师 + DB专家
('kaixuan', 'workflow-architecture',   'role-cto',             'role-system-architect',    'role-db-specialist',           NOW()::text),
-- 任务分解：项目经理 + 任务分解专家
('kaixuan', 'workflow-task-split',     'role-project-manager', 'role-task-decomposer',     'role-device-supervisor',       NOW()::text),
-- 开发实现：前端 + 后端 + Go + DevOps
('kaixuan', 'workflow-development',    'role-vue-frontend',    'role-java-developer',      'role-go-developer',            NOW()::text),
-- 测试验收：前端测试 + 后端测试 + QA
('kaixuan', 'workflow-testing',        'role-frontend-tester', 'role-backend-tester',      'role-qa-specialist',           NOW()::text),
-- 部署交付：DevOps + 安全管理 + 文档
('kaixuan', 'workflow-deployment',     'role-devops',          'role-security-manager',    'role-doc-manager',             NOW()::text);

SELECT p.name, p.display_name, p.description
FROM permission p WHERE p.owner = 'kaixuan' AND p.name LIKE 'workflow-%' ORDER BY p.name;
SQL

# ============================================================================
# PART 7: 验证汇总
# ============================================================================
echo ""
echo "============================================"
echo "  初始化完成 - 验证汇总"
echo "============================================"

$PSQL <<'SQL'
SELECT '--- 组织 ---' as section;
SELECT name, display_name FROM organization ORDER BY name;

SELECT '--- 人类用户 ---' as section;
SELECT name, display_name, lark, is_admin as admin 
FROM "user" WHERE owner = 'kaixuan' AND type != 'virtual' ORDER BY name;

SELECT '--- 智能体员工 ---' as section;
SELECT name, display_name, 
       properties->>'device' as device, 
       properties->>'role' as agent_role,
       properties->>'parent' as supervisor
FROM "user" WHERE owner = 'kaixuan' AND type = 'virtual' ORDER BY name;

SELECT '--- 角色 ---' as section;
SELECT name, display_name FROM role WHERE owner = 'kaixuan' ORDER BY name;

SELECT '--- 工作流 ---' as section;
SELECT name, display_name, description FROM permission WHERE owner = 'kaixuan' AND name LIKE 'workflow-%' ORDER BY name;
SQL

echo ""
echo "✅ 初始化完成！"
