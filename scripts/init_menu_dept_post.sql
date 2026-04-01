-- ============================================
-- 初始化 menu / department / post 表及 ACC 应用数据
-- 幂等执行：CREATE IF NOT EXISTS + ON CONFLICT DO NOTHING
-- ============================================

CREATE TABLE IF NOT EXISTS menu (
    owner         VARCHAR(100) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    created_time  VARCHAR(100),
    updated_time  VARCHAR(100),
    display_name  VARCHAR(100),
    description   VARCHAR(200),
    application   VARCHAR(100),
    parent_id     VARCHAR(100),
    path          VARCHAR(200),
    icon          VARCHAR(100),
    component     VARCHAR(200),
    type          VARCHAR(20),
    sort_order    INTEGER DEFAULT 0,
    visible       BOOLEAN DEFAULT false,
    is_enabled    BOOLEAN DEFAULT false,
    PRIMARY KEY (owner, name)
);
CREATE INDEX IF NOT EXISTS idx_menu_application ON menu(application);

CREATE TABLE IF NOT EXISTS department (
    owner         VARCHAR(100) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    created_time  VARCHAR(100),
    updated_time  VARCHAR(100),
    display_name  VARCHAR(100),
    description   VARCHAR(200),
    parent_id     VARCHAR(100),
    code          VARCHAR(50),
    level         INTEGER DEFAULT 0,
    sort_order    INTEGER DEFAULT 0,
    leader        VARCHAR(100),
    is_enabled    BOOLEAN DEFAULT false,
    PRIMARY KEY (owner, name)
);

CREATE TABLE IF NOT EXISTS post (
    owner         VARCHAR(100) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    created_time  VARCHAR(100),
    updated_time  VARCHAR(100),
    display_name  VARCHAR(100),
    description   VARCHAR(200),
    code          VARCHAR(50),
    sort_order    INTEGER DEFAULT 0,
    is_enabled    BOOLEAN DEFAULT false,
    PRIMARY KEY (owner, name)
);

-- ========== ACC 菜单 (17条) ==========
INSERT INTO menu (owner, name, created_time, updated_time, display_name, application, parent_id, path, icon, component, type, sort_order, visible, is_enabled) VALUES
('kaixuan','acc-dashboard','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','仪表板','acc','','/dashboard','DashboardOutlined','DashboardPage','Menu',1,true,true),
('kaixuan','acc-apps','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','应用管理','acc','','/management/applications','AppstoreOutlined','ResourceListView','Menu',2,true,true),
('kaixuan','acc-users','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','用户管理','acc','','/management/users','UserOutlined','ResourceListView','Menu',3,true,true),
('kaixuan','acc-orgs','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','组织管理','acc','','/management/organizations','BankOutlined','ResourceListView','Menu',4,true,true),
('kaixuan','acc-rbac','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','权限控制','acc','','','SafetyOutlined','','Menu',5,true,true),
('kaixuan','acc-roles','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','角色管理','acc','acc-rbac','/management/roles','TeamOutlined','ResourceListView','Menu',1,true,true),
('kaixuan','acc-permissions','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','权限管理','acc','acc-rbac','/management/permissions','KeyOutlined','ResourceListView','Menu',2,true,true),
('kaixuan','acc-models','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','权限模型','acc','acc-rbac','/management/models','BlockOutlined','ResourceListView','Menu',3,true,true),
('kaixuan','acc-org-structure','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','组织架构','acc','','','ApartmentOutlined','','Menu',6,true,true),
('kaixuan','acc-departments','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','部门管理','acc','acc-org-structure','/management/departments','ClusterOutlined','ResourceListView','Menu',1,true,true),
('kaixuan','acc-posts','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','岗位管理','acc','acc-org-structure','/management/posts','IdcardOutlined','ResourceListView','Menu',2,true,true),
('kaixuan','acc-groups','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','分组管理','acc','acc-org-structure','/management/groups','GroupOutlined','ResourceListView','Menu',3,true,true),
('kaixuan','acc-menus','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','菜单管理','acc','acc-org-structure','/management/menus','MenuOutlined','ResourceListView','Menu',4,true,true),
('kaixuan','acc-system','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','系统管理','acc','','','SettingOutlined','','Menu',7,true,true),
('kaixuan','acc-providers','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','提供商','acc','acc-system','/management/providers','CloudServerOutlined','ResourceListView','Menu',1,true,true),
('kaixuan','acc-certs','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','证书管理','acc','acc-system','/management/certs','SafetyCertificateOutlined','ResourceListView','Menu',2,true,true),
('kaixuan','acc-rules','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','安全规则','acc','acc-system','/management/permission-rules','FireOutlined','ResourceListView','Menu',3,true,true)
ON CONFLICT (owner, name) DO NOTHING;

-- ========== 部门 (3条) ==========
INSERT INTO department (owner, name, created_time, updated_time, display_name, description, parent_id, code, level, sort_order, leader, is_enabled) VALUES
('kaixuan','dept-tech','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','技术部','负责平台技术研发','','TECH',1,1,'',true),
('kaixuan','dept-product','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','产品部','负责产品规划与设计','','PROD',1,2,'',true),
('kaixuan','dept-ops','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','运营部','负责日常运营与运维','','OPS',1,3,'',true)
ON CONFLICT (owner, name) DO NOTHING;

-- ========== 岗位 (4条) ==========
INSERT INTO post (owner, name, created_time, updated_time, display_name, description, code, sort_order, is_enabled) VALUES
('kaixuan','post-cto','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','CTO','首席技术官','CTO',1,true),
('kaixuan','post-architect','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','架构师','系统架构设计','ARCH',2,true),
('kaixuan','post-senior-eng','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','高级工程师','高级软件工程师','SR-ENG',3,true),
('kaixuan','post-engineer','2026-04-01T00:00:00Z','2026-04-01T00:00:00Z','工程师','软件工程师','ENG',4,true)
ON CONFLICT (owner, name) DO NOTHING;

-- ========== 验证 ==========
SELECT 'menu' AS tbl, count(*) AS cnt FROM menu
UNION ALL SELECT 'department', count(*) FROM department
UNION ALL SELECT 'post', count(*) FROM post;
