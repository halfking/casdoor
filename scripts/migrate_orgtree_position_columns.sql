-- ============================================
-- 组织架构整合迁移脚本
-- 将 Department/Post 的字段迁移到 OrgTree/Position
-- 幂等执行：先检查列是否存在
-- ============================================

-- 1. OrgTree 表：添加 code, leader 列 (level 已存在)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_tree' AND column_name = 'code') THEN
        ALTER TABLE org_tree ADD COLUMN code VARCHAR(50);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'org_tree' AND column_name = 'leader') THEN
        ALTER TABLE org_tree ADD COLUMN leader VARCHAR(100);
    END IF;
END $$;

-- 2. position_detail 表：添加 code 列
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'position_detail' AND column_name = 'code') THEN
        ALTER TABLE position_detail ADD COLUMN code VARCHAR(50);
    END IF;
END $$;

-- ============================================
-- 数据迁移 (可选，仅当需要迁移现有数据时执行)
-- ============================================

-- 3. 将 Department 数据迁移到 OrgTree
-- 注意：此迁移假设 Department.name 对应 OrgTree.org_name
-- 执行前请确保已备份数据

/*
-- 迁移示例 (根据实际情况调整):
INSERT INTO org_tree (parent_id, org_name, display_name, org_type, level, sort_order, casdoor_org_name, code, leader)
SELECT 
    COALESCE(
        (SELECT id FROM org_tree WHERE org_name = d.parent_id AND casdoor_org_name = d.owner), 
        0
    ) as parent_id,
    d.name as org_name,
    d.display_name,
    'dept' as org_type,
    COALESCE(d.level, 1) as level,
    COALESCE(d.sort_order, 0) as sort_order,
    d.owner as casdoor_org_name,
    d.code,
    d.leader
FROM department d
WHERE NOT EXISTS (SELECT 1 FROM org_tree WHERE org_name = d.name AND casdoor_org_name = d.owner)
ON CONFLICT DO NOTHING;
*/

-- 4. 将 Post 数据迁移到 Position
-- 注意：此迁移假设需要手动处理 department 关联
/*
INSERT INTO position_detail (role_owner, role_name, code, full_description)
SELECT 
    p.owner as role_owner,
    p.name as role_name,
    p.code,
    COALESCE(p.description, '') as full_description
FROM post p
WHERE NOT EXISTS (SELECT 1 FROM position_detail WHERE role_name = p.name AND role_owner = p.owner)
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- 验证
-- ============================================
SELECT 'org_tree columns:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'org_tree' ORDER BY ordinal_position;

SELECT 'position_detail columns:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'position_detail' ORDER BY ordinal_position;

\echo 'Migration completed successfully!'
