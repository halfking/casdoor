-- ============================================================================
-- 开轩平台智能体映射初始化
-- 设计理念:
--   - 智能体 = 人员（虚拟用户 type='virtual'）
--   - 智能体类型 = 岗位（Role）
--   - 设备 = 部门（org_tree.department）
--   - 设备主管 = 部门负责人（normal-user）
-- 执行: docker exec -i postgres psql -U casdoor -d casdoor < init-kaixuan-agents.sql
-- ============================================================================

\echo '============================================'
\echo '  开轩平台智能体映射初始化'
\echo '============================================'

-- ============================================================================
-- PART 1: 获取 org_tree 中的设备ID
-- ============================================================================

DO $$
DECLARE
    dept1_id INTEGER;
    dept2_id INTEGER;
    dept3_id INTEGER;
    dept4_id INTEGER;
    pos1_id INTEGER;
    pos2_id INTEGER;
    pos3_id INTEGER;
    pos4_id INTEGER;
BEGIN
    -- 获取设备节点ID
    SELECT id INTO dept1_id FROM org_tree WHERE name = 'dept-kaixuan-1';
    SELECT id INTO dept2_id FROM org_tree WHERE name = 'dept-kaixuan-2';
    SELECT id INTO dept3_id FROM org_tree WHERE name = 'dept-kaixuan-3';
    SELECT id INTO dept4_id FROM org_tree WHERE name = 'dept-m4macbookpro';
    
    -- 获取设备主管岗位ID
    SELECT id INTO pos1_id FROM org_tree WHERE name = 'dragon-1-supervisor';
    SELECT id INTO pos2_id FROM org_tree WHERE name = 'dragon-2-supervisor';
    SELECT id INTO pos3_id FROM org_tree WHERE name = 'dragon-3-supervisor';
    SELECT id INTO pos4_id FROM org_tree WHERE name = 'shrimp-king-supervisor';
    
    -- ============================================================================
    -- PART 2: 创建智能体虚拟用户（在 Casdoor User 表中）
    -- ============================================================================
    
    -- 清理旧数据
    DELETE FROM agent_mapping WHERE owner = 'kaixuan';
    DELETE FROM "user" WHERE owner = 'kaixuan' AND type = 'virtual';
    
    -- 2.1 龙一的智能体团队
    INSERT INTO "user" (owner, name, display_name, id, password, type, is_admin, score, created_time, updated_time, signup_application, properties)
    VALUES 
    ('kaixuan', 'agent-dragon1-architect', '龙一-架构师', 'agent-d1-arch-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
     '{"device": "kaixuan-1", "device_id": ' || dept1_id || ', "role": "dept-tech-system-architect", "parent": "dragon-1-supervisor", "parent_id": ' || pos1_id || ', "skills": ["系统设计", "ADR", "数据库设计"]}'),
    ('kaixuan', 'agent-dragon1-java-dev', '龙一-Java工程师', 'agent-d1-java-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
     '{"device": "kaixuan-1", "device_id": ' || dept1_id || ', "role": "dept-tech-backend-dev", "parent": "dragon-1-supervisor", "parent_id": ' || pos1_id || ', "skills": ["Java", "Spring Boot", "MySQL"]}'),
    ('kaixuan', 'agent-dragon1-go-dev', '龙一-Go工程师', 'agent-d1-go-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
     '{"device": "kaixuan-1", "device_id": ' || dept1_id || ', "role": "dept-tech-backend-dev", "parent": "dragon-1-supervisor", "parent_id": ' || pos1_id || ', "skills": ["Go", "Gin", "gRPC"]}'),
    ('kaixuan', 'agent-dragon1-devops', '龙一-DevOps', 'agent-d1-devops-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
     '{"device": "kaixuan-1", "device_id": ' || dept1_id || ', "role": "dept-tech-devops", "parent": "dragon-1-supervisor", "parent_id": ' || pos1_id || ', "skills": ["Docker", "K8s", "CI/CD"]}'),
    ('kaixuan', 'agent-dragon1-qa', '龙一-QA专家', 'agent-d1-qa-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
     '{"device": "kaixuan-1", "device_id": ' || dept1_id || ', "role": "dept-tech-qa-lead", "parent": "dragon-1-supervisor", "parent_id": ' || pos1_id || ', "skills": ["测试策略", "自动化测试", "性能测试"]}');
    
    -- 2.2 龙二的智能体团队
    INSERT INTO "user" (owner, name, display_name, id, password, type, is_admin, score, created_time, updated_time, signup_application, properties)
    VALUES 
    ('kaixuan', 'agent-dragon2-architect', '龙二-架构师', 'agent-d2-arch-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
     '{"device": "kaixuan-2", "device_id": ' || dept2_id || ', "role": "dept-tech-system-architect", "parent": "dragon-2-supervisor", "parent_id": ' || pos2_id || ', "skills": ["系统设计", "微服务"]}'),
    ('kaixuan', 'agent-dragon2-vue-frontend', '龙二-前端工程师', 'agent-d2-vue-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
     '{"device": "kaixuan-2", "device_id": ' || dept2_id || ', "role": "dept-tech-frontend-dev", "parent": "dragon-2-supervisor", "parent_id": ' || pos2_id || ', "skills": ["Vue3", "TypeScript", "CSS"]}'),
    ('kaixuan', 'agent-dragon2-product', '龙二-产品经理', 'agent-d2-pm-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
     '{"device": "kaixuan-2", "device_id": ' || dept2_id || ', "role": "dept-tech-product-owner", "parent": "dragon-2-supervisor", "parent_id": ' || pos2_id || ', "skills": ["需求分析", "产品设计", "数据分析"]}');
    
    -- 2.3 龙三的智能体团队
    INSERT INTO "user" (owner, name, display_name, id, password, type, is_admin, score, created_time, updated_time, signup_application, properties)
    VALUES 
    ('kaixuan', 'agent-dragon3-architect', '龙三-架构师', 'agent-d3-arch-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
     '{"device": "kaixuan-3", "device_id": ' || dept3_id || ', "role": "dept-tech-system-architect", "parent": "dragon-3-supervisor", "parent_id": ' || pos3_id || ', "skills": ["系统设计", "AI应用"]}'),
    ('kaixuan', 'agent-dragon3-qa', '龙三-QA专家', 'agent-d3-qa-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
     '{"device": "kaixuan-3", "device_id": ' || dept3_id || ', "role": "dept-tech-qa-lead", "parent": "dragon-3-supervisor", "parent_id": ' || pos3_id || ', "skills": ["测试策略", "AI测试"]}'),
    ('kaixuan', 'agent-dragon3-ai', '龙三-AI工程师', 'agent-d3-ai-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
     '{"device": "kaixuan-3", "device_id": ' || dept3_id || ', "role": "dept-tech-ai-engineer", "parent": "dragon-3-supervisor", "parent_id": ' || pos3_id || ', "skills": ["Prompt Engineering", "RAG", "LangChain"]}');
    
    -- 2.4 虾王的智能体
    INSERT INTO "user" (owner, name, display_name, id, password, type, is_admin, score, created_time, updated_time, signup_application, properties)
    VALUES 
    ('kaixuan', 'agent-shrimpking-dev', '虾王-本地开发', 'agent-sk-dev-001', '', 'virtual', false, 0, NOW()::text, NOW()::text, 'app-built-in',
     '{"device": "m4macbookpro", "device_id": ' || dept4_id || ', "role": "dept-tech-frontend-dev", "parent": "shrimp-king-supervisor", "parent_id": ' || pos4_id || ', "skills": ["移动开发", "React Native", "iOS", "Android"]}');
    
    -- ============================================================================
    -- PART 3: 创建智能体映射记录
    -- ============================================================================
    
    -- 龙一的智能体映射
    INSERT INTO agent_mapping (owner, agent_name, device_id, role_name, supervisor_name, agent_config, is_active, created_time)
    SELECT 'kaixuan', name, (properties->>'device_id')::INTEGER, properties->>'role', properties->>'parent', 
           '{"llm_model": "default", "temperature": 0.7}'::jsonb, true, NOW()::text
    FROM "user" WHERE owner = 'kaixuan' AND name LIKE 'agent-dragon1-%';
    
    -- 龙二的智能体映射
    INSERT INTO agent_mapping (owner, agent_name, device_id, role_name, supervisor_name, agent_config, is_active, created_time)
    SELECT 'kaixuan', name, (properties->>'device_id')::INTEGER, properties->>'role', properties->>'parent', 
           '{"llm_model": "default", "temperature": 0.7}'::jsonb, true, NOW()::text
    FROM "user" WHERE owner = 'kaixuan' AND name LIKE 'agent-dragon2-%';
    
    -- 龙三的智能体映射
    INSERT INTO agent_mapping (owner, agent_name, device_id, role_name, supervisor_name, agent_config, is_active, created_time)
    SELECT 'kaixuan', name, (properties->>'device_id')::INTEGER, properties->>'role', properties->>'parent', 
           '{"llm_model": "ollama-local", "temperature": 0.7}'::jsonb, true, NOW()::text
    FROM "user" WHERE owner = 'kaixuan' AND name LIKE 'agent-dragon3-%';
    
    -- 虾王的智能体映射
    INSERT INTO agent_mapping (owner, agent_name, device_id, role_name, supervisor_name, agent_config, is_active, created_time)
    SELECT 'kaixuan', name, (properties->>'device_id')::INTEGER, properties->>'role', properties->>'parent', 
           '{"llm_model": "default", "temperature": 0.7}'::jsonb, true, NOW()::text
    FROM "user" WHERE owner = 'kaixuan' AND name LIKE 'agent-shrimpking-%';
    
    RAISE NOTICE '智能体初始化完成';
END $$;

\echo '>>> PART 1-3: 智能体和映射创建完成'

-- ============================================================================
-- PART 4: 验证
-- ============================================================================

\echo '--- 智能体列表 ---'
SELECT name, display_name, type, properties->>'device' as device, properties->>'role' as role
FROM "user" 
WHERE owner = 'kaixuan' AND type = 'virtual' 
ORDER BY name;

\echo '--- 智能体映射 ---'
SELECT am.agent_name, ot.display_name as device, am.role_name, am.supervisor_name, am.is_active
FROM agent_mapping am
JOIN org_tree ot ON am.device_id = ot.id
WHERE am.owner = 'kaixuan'
ORDER BY am.agent_name;

\echo '============================================'
\echo '  智能体映射初始化完成'
\echo '============================================'

-- ============================================================================
-- 智能体映射关系说明:
-- ============================================================================
-- 
-- 设备 (org_tree.department) → 部门
--   dept-kaixuan-1 (龙一设备) → kaixuan-1 (192.168.31.28)
--   dept-kaixuan-2 (龙二设备) → kaixuan-2 (192.168.31.19)
--   dept-kaixuan-3 (龙三设备) → kaixuan-3 (192.168.31.30)
--   dept-m4macbookpro (虾王设备) → m4macbookpro (192.168.31.44)
--
-- 设备主管 (org_tree.position) → 岗位
--   dragon-1-supervisor → 龙一主管
--   dragon-2-supervisor → 龙二主管
--   dragon-3-supervisor → 龙三主管
--   shrimp-king-supervisor → 虾王主管
--
-- 智能体 (user.type='virtual') → 人员
--   agent-dragon1-* → 龙一的AI员工团队
--   agent-dragon2-* → 龙二的AI员工团队
--   agent-dragon3-* → 龙三的AI员工团队
--   agent-shrimpking-* → 虾王的AI员工团队
--
-- 智能体类型 → Casdoor Role
--   system-architect → dept-tech-system-architect
--   frontend-dev → dept-tech-frontend-dev
--   backend-dev → dept-tech-backend-dev
--   etc.
--
-- 映射表 (agent_mapping) 连接:
--   agent_name (虚拟用户) → device_id (设备) → role_name (岗位)
-- ============================================================================
