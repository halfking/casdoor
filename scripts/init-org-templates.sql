-- ============================================
-- 组织模板初始化数据
-- ============================================

-- 模板1: 互联网科技公司标准模板
INSERT INTO org_template (owner, name, display_name, description, template_type, tree_structure, default_roles, created_time, updated_time) VALUES
('kaixuan', 'internet_tech_company', '互联网科技公司标准模板', '标准互联网科技公司组织架构，包含研发、产品、运营、管理等完整部门体系', 'standard', 
'{"nodes": [
  {"orgName": "root", "displayName": "公司总部", "orgType": "root", "level": 0, "sortOrder": 0, "children": [
    {"orgName": "tech-rd", "displayName": "技术研发部", "orgType": "department", "level": 1, "sortOrder": 1, "children": [
      {"orgName": "tech-mgmt", "displayName": "管理层", "orgType": "group", "level": 2, "sortOrder": 1},
      {"orgName": "tech-arch", "displayName": "架构组", "orgType": "group", "level": 2, "sortOrder": 2},
      {"orgName": "tech-backend", "displayName": "后端开发组", "orgType": "group", "level": 2, "sortOrder": 3},
      {"orgName": "tech-frontend", "displayName": "前端开发组", "orgType": "group", "level": 2, "sortOrder": 4},
      {"orgName": "tech-mobile", "displayName": "移动开发组", "orgType": "group", "level": 2, "sortOrder": 5},
      {"orgName": "tech-infra", "displayName": "基础架构组", "orgType": "group", "level": 2, "sortOrder": 6},
      {"orgName": "tech-qa", "displayName": "质量保障组", "orgType": "group", "level": 2, "sortOrder": 7},
      {"orgName": "tech-dba", "displayName": "数据库组", "orgType": "group", "level": 2, "sortOrder": 8}
    ]},
    {"orgName": "tech-product", "displayName": "产品部", "orgType": "department", "level": 1, "sortOrder": 2, "children": [
      {"orgName": "product-mgmt", "displayName": "产品管理组", "orgType": "group", "level": 2, "sortOrder": 1},
      {"orgName": "product-ux", "displayName": "UX设计组", "orgType": "group", "level": 2, "sortOrder": 2},
      {"orgName": "product-ai", "displayName": "AI产品组", "orgType": "group", "level": 2, "sortOrder": 3}
    ]},
    {"orgName": "tech-ops", "displayName": "业务运营部", "orgType": "department", "level": 1, "sortOrder": 3, "children": [
      {"orgName": "ops-ecommerce", "displayName": "电商运营组", "orgType": "group", "level": 2, "sortOrder": 1},
      {"orgName": "ops-content", "displayName": "内容营销组", "orgType": "group", "level": 2, "sortOrder": 2},
      {"orgName": "ops-cs", "displayName": "客户服务组", "orgType": "group", "level": 2, "sortOrder": 3},
      {"orgName": "ops-data", "displayName": "数据运营组", "orgType": "group", "level": 2, "sortOrder": 4}
    ]},
    {"orgName": "tech-gov", "displayName": "平台治理部", "orgType": "department", "level": 1, "sortOrder": 4, "children": [
      {"orgName": "gov-hr", "displayName": "人力资源组", "orgType": "group", "level": 2, "sortOrder": 1},
      {"orgName": "gov-finance", "displayName": "财务行政组", "orgType": "group", "level": 2, "sortOrder": 2},
      {"orgName": "gov-security", "displayName": "安全合规组", "orgType": "group", "level": 2, "sortOrder": 3},
      {"orgName": "gov-legal", "displayName": "法务组", "orgType": "group", "level": 2, "sortOrder": 4}
    ]},
    {"orgName": "tech-bd", "displayName": "商务发展部", "orgType": "department", "level": 1, "sortOrder": 5, "children": [
      {"orgName": "bd-sales", "displayName": "销售组", "orgType": "group", "level": 2, "sortOrder": 1},
      {"orgName": "bd-partner", "displayName": "合作伙伴组", "orgType": "group", "level": 2, "sortOrder": 2}
    ]}
  ]}
]}',
ARRAY[]::varchar[],
'2026-04-11 00:00:00',
'2026-04-11 00:00:00');

-- 模板2: AI研究院模板
INSERT INTO org_template (owner, name, display_name, description, template_type, tree_structure, default_roles, created_time, updated_time) VALUES
('kaixuan', 'ai_research_institute', 'AI研究院模板', '专注于AI研究的组织架构，包含研究院、实验室、工程化团队', 'research',
'{"nodes": [
  {"orgName": "root", "displayName": "研究院总部", "orgType": "root", "level": 0, "sortOrder": 0, "children": [
    {"orgName": "ai-research", "displayName": "AI研究院", "orgType": "department", "level": 1, "sortOrder": 1, "children": [
      {"orgName": "research-mgmt", "displayName": "研究院管理层", "orgType": "group", "level": 2, "sortOrder": 1},
      {"orgName": "lab-nlp", "displayName": "NLP实验室", "orgType": "group", "level": 2, "sortOrder": 2},
      {"orgName": "lab-cv", "displayName": "计算机视觉实验室", "orgType": "group", "level": 2, "sortOrder": 3},
      {"orgName": "lab-speech", "displayName": "语音实验室", "orgType": "group", "level": 2, "sortOrder": 4},
      {"orgName": "lab-robotics", "displayName": "机器人实验室", "orgType": "group", "level": 2, "sortOrder": 5},
      {"orgName": "lab-safety", "displayName": "AI安全实验室", "orgType": "group", "level": 2, "sortOrder": 6}
    ]},
    {"orgName": "ai-engineering", "displayName": "AI工程化部", "orgType": "department", "level": 1, "sortOrder": 2, "children": [
      {"orgName": "eng-mgmt", "displayName": "工程化管理组", "orgType": "group", "level": 2, "sortOrder": 1},
      {"orgName": "eng-platform", "displayName": "AI平台组", "orgType": "group", "level": 2, "sortOrder": 2},
      {"orgName": "eng-inference", "displayName": "推理优化组", "orgType": "group", "level": 2, "sortOrder": 3},
      {"orgName": "eng-data", "displayName": "数据工程组", "orgType": "group", "level": 2, "sortOrder": 4}
    ]},
    {"orgName": "ai-product", "displayName": "AI产品部", "orgType": "department", "level": 1, "sortOrder": 3, "children": [
      {"orgName": "product-mgmt", "displayName": "产品管理组", "orgType": "group", "level": 2, "sortOrder": 1},
      {"orgName": "product-biz", "displayName": "商务产品组", "orgType": "group", "level": 2, "sortOrder": 2}
    ]},
    {"orgName": "ai-ops", "displayName": "运营支持部", "orgType": "department", "level": 1, "sortOrder": 4, "children": [
      {"orgName": "ops-hr", "displayName": "人力资源组", "orgType": "group", "level": 2, "sortOrder": 1},
      {"orgName": "ops-finance", "displayName": "财务组", "orgType": "group", "level": 2, "sortOrder": 2}
    ]}
  ]}
]}',
ARRAY[]::varchar[],
'2026-04-11 00:00:00',
'2026-04-11 00:00:00');

-- 模板3: 集团公司模板
INSERT INTO org_template (owner, name, display_name, description, template_type, tree_structure, default_roles, created_time, updated_time) VALUES
('kaixuan', 'corporate_group', '集团公司标准模板', '大型集团公司组织架构，包含总部、事业部、子公司管理体系', 'enterprise',
'{"nodes": [
  {"orgName": "root", "displayName": "集团总部", "orgType": "root", "level": 0, "sortOrder": 0, "children": [
    {"orgName": "group-board", "displayName": "董事会", "orgType": "department", "level": 1, "sortOrder": 1},
    {"orgName": "group-strategy", "displayName": "战略发展部", "orgType": "department", "level": 1, "sortOrder": 2},
    {"orgName": "group-finance", "displayName": "财务管理中心", "orgType": "department", "level": 1, "sortOrder": 3, "children": [
      {"orgName": "fin-accounting", "displayName": "会计核算组", "orgType": "group", "level": 2, "sortOrder": 1},
      {"orgName": "fin-budget", "displayName": "预算管理组", "orgType": "group", "level": 2, "sortOrder": 2},
      {"orgName": "fin-treasury", "displayName": "资金管理组", "orgType": "group", "level": 2, "sortOrder": 3}
    ]},
    {"orgName": "group-hr", "displayName": "人力资源中心", "orgType": "department", "level": 1, "sortOrder": 4, "children": [
      {"orgName": "hr-recruit", "displayName": "招聘组", "orgType": "group", "level": 2, "sortOrder": 1},
      {"orgName": "hr-train", "displayName": "培训组", "orgType": "group", "level": 2, "sortOrder": 2},
      {"orgName": "hr-payroll", "displayName": "薪酬福利组", "orgType": "group", "level": 2, "sortOrder": 3}
    ]},
    {"orgName": "group-tech", "displayName": "科技管理部", "orgType": "department", "level": 1, "sortOrder": 5},
    {"orgName": "group-legal", "displayName": "法务合规部", "orgType": "department", "level": 1, "sortOrder": 6},
    {"orgName": "biz-unit-1", "displayName": "事业部一", "orgType": "department", "level": 1, "sortOrder": 7},
    {"orgName": "biz-unit-2", "displayName": "事业部二", "orgType": "department", "level": 1, "sortOrder": 8},
    {"orgName": "biz-unit-3", "displayName": "事业部三", "orgType": "department", "level": 1, "sortOrder": 9}
  ]}
]}',
ARRAY[]::varchar[],
'2026-04-11 00:00:00',
'2026-04-11 00:00:00');

-- 模板4: 初创公司模板
INSERT INTO org_template (owner, name, display_name, description, template_type, tree_structure, default_roles, created_time, updated_time) VALUES
('kaixuan', 'startup_company', '初创公司精简模板', '适合20人以下初创公司的精简组织架构', 'startup',
'{"nodes": [
  {"orgName": "root", "displayName": "公司", "orgType": "root", "level": 0, "sortOrder": 0, "children": [
    {"orgName": "ceo-office", "displayName": "CEO办公室", "orgType": "department", "level": 1, "sortOrder": 1},
    {"orgName": "tech-team", "displayName": "技术团队", "orgType": "department", "level": 1, "sortOrder": 2, "children": [
      {"orgName": "tech-lead", "displayName": "技术负责人", "orgType": "group", "level": 2, "sortOrder": 1},
      {"orgName": "tech-dev", "displayName": "开发组", "orgType": "group", "level": 2, "sortOrder": 2},
      {"orgName": "tech-qa", "displayName": "测试组", "orgType": "group", "level": 2, "sortOrder": 3}
    ]},
    {"orgName": "product-team", "displayName": "产品团队", "orgType": "department", "level": 1, "sortOrder": 3, "children": [
      {"orgName": "product-lead", "displayName": "产品负责人", "orgType": "group", "level": 2, "sortOrder": 1},
      {"orgName": "product-designer", "displayName": "设计组", "orgType": "group", "level": 2, "sortOrder": 2}
    ]},
    {"orgName": "ops-team", "displayName": "运营团队", "orgType": "department", "level": 1, "sortOrder": 4, "children": [
      {"orgName": "ops-lead", "displayName": "运营负责人", "orgType": "group", "level": 2, "sortOrder": 1},
      {"orgName": "ops-cs", "displayName": "客服组", "orgType": "group", "level": 2, "sortOrder": 2}
    ]},
    {"orgName": "admin-team", "displayName": "行政财务", "orgType": "department", "level": 1, "sortOrder": 5}
  ]}
]}',
ARRAY[]::varchar[],
'2026-04-11 00:00:00',
'2026-04-11 00:00:00');

-- 验证插入
SELECT id, name, display_name, template_type FROM org_template;
