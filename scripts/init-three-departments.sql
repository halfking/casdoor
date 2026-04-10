-- ============================================================================
-- 开轩平台 — 三部门组织架构重构
-- 基于 MetaGPT/CrewAI/ChatDev 等高星项目架构设计
-- 执行: docker exec -i postgres psql -U casdoor -d casdoor < init-three-departments.sql
-- ============================================================================

\echo '============================================'
\echo '  开轩平台三部门架构重构'
\echo '  基于: MetaGPT(42K) + ChatDev(25K) + CrewAI(22K)'
\echo '============================================'

-- ============================================================================
-- PART 0: 清理旧的组织模板数据（保留 kaixuan 内部组织）
-- ============================================================================
DELETE FROM permission_rule WHERE v0 LIKE 'wf-org-%';
DELETE FROM permission WHERE owner = 'kaixuan' AND name LIKE 'wf-org-%';
DELETE FROM role WHERE owner = 'kaixuan' AND name LIKE 'dept-%';

-- ============================================================================
-- PART 1: 三大部门定义
-- ============================================================================
-- 部门1: 技术研发部 — 软件开发、基础设施、AI能力
-- 部门2: 业务运营部 — 电商、内容营销、客户服务
-- 部门3: 平台治理部 — 数据、安全、财务行政

INSERT INTO organization (name, display_name, website_url, owner, created_time)
VALUES ('dept-tech', '技术研发部', 'https://itestu.cn', 'admin', NOW()::text)
ON CONFLICT (name) DO NOTHING;

INSERT INTO organization (name, display_name, website_url, owner, created_time)
VALUES ('dept-operations', '业务运营部', 'https://itestu.cn', 'admin', NOW()::text)
ON CONFLICT (name) DO NOTHING;

INSERT INTO organization (name, display_name, website_url, owner, created_time)
VALUES ('dept-governance', '平台治理部', 'https://itestu.cn', 'admin', NOW()::text)
ON CONFLICT (name) DO NOTHING;

\echo '>>> 部门创建完成'

-- ============================================================================
-- PART 2: 技术研发部角色 (dept-tech)
-- 参考: MetaGPT(需求→设计→编码→测试) + ChatDev(CEO/CTO/Programmer/Tester)
-- ============================================================================

INSERT INTO role (owner, name, display_name, description, created_time) VALUES
-- 管理层
('kaixuan', 'dept-tech-cto', '技术总监(CTO)',
'负责技术研发部整体技术方向与决策。审批架构方案、评估技术风险、把控代码质量。推动技术选型标准化和技术债务治理。要求10年以上技术经验，精通系统架构和团队管理。参考MetaGPT的Architect角色，需具备全局视野和决策能力。',
NOW()::text),

('kaixuan', 'dept-tech-tech-lead', '技术组长',
'协助CTO管理技术团队日常工作，负责技术方案评审和Code Review。指导团队成员技术成长，解决技术难题。把控项目技术质量和进度。要求5年以上开发经验，有团队管理经验。参考ChatDev的CTO角色。',
NOW()::text),

-- 产品与需求（参考MetaGPT的ProductManager）
('kaixuan', 'dept-tech-product-owner', '产品负责人',
'负责产品需求分析和优先级排序，维护产品Backlog。编写用户故事和验收标准，参与Sprint Planning。收集用户反馈和业务数据持续优化产品。参考MetaGPT的ProductManager角色，需具备产品思维和需求拆解能力。',
NOW()::text),

('kaixuan', 'dept-tech-system-architect', '系统架构师',
'负责系统架构设计和技术选型，输出架构设计文档(ADR)。设计数据库模型、API契约、微服务边界。评估系统性能和可扩展性。参考MetaGPT的Architect角色，需精通分布式系统和领域驱动设计。',
NOW()::text),

-- 开发组
('kaixuan', 'dept-tech-frontend-dev', '前端开发工程师',
'负责Web/移动端前端开发，使用Vue3/React构建用户界面。实现UI设计稿，优化前端性能和用户体验。编写单元测试和E2E测试。参考ChatDev的Programmer+ArtDesigner角色，需精通前端技术栈。',
NOW()::text),

('kaixuan', 'dept-tech-backend-dev', '后端开发工程师',
'负责服务端API设计和开发，使用Java/Go构建RESTful/gRPC接口。设计数据库表结构，处理并发事务缓存。编写单元测试和集成测试。参考ChatDev的Programmer角色，需熟悉微服务架构。',
NOW()::text),

('kaixuan', 'dept-tech-ai-engineer', 'AI/LLM工程师',
'负责AI能力建设和LLM应用开发，包括Prompt Engineering、RAG、Agent开发。对接OpenAI/Claude/本地模型API，优化模型调用策略。构建AI工具链和SDK。要求精通Python，熟悉LangChain/LlamaIndex等框架。',
NOW()::text),

('kaixuan', 'dept-tech-devops', 'DevOps/SRE工程师',
'负责CI/CD流水线搭建维护，容器化部署(Docker/K8s)。监控系统运行状态(Prometheus/Grafana)，处理告警和故障排查。管理基础设施，优化资源使用和成本。参考SRE最佳实践，需精通Linux和容器技术。',
NOW()::text),

-- 质量保证（参考ChatDev的Reviewer+Tester）
('kaixuan', 'dept-tech-qa-lead', '测试组长',
'负责质量保证体系规划，制定测试策略和标准。管理功能测试、接口测试、性能测试、安全测试。推动自动化测试框架建设。参考ChatDev的Tester角色，需具备质量体系建设和团队管理能力。',
NOW()::text),

('kaixuan', 'dept-tech-ui-designer', 'UI/UX设计师',
'负责产品界面设计和用户体验优化。使用Figma制作高保真设计稿，建立Design System。进行用户研究和可用性测试。参考ChatDev的ArtDesigner角色，需精通UI设计工具和用户研究方法。',
NOW()::text);

\echo '>>> 技术研发部角色创建完成'

-- ============================================================================
-- PART 3: 业务运营部角色 (dept-operations)
-- 参考: 电商运营+内容营销+客服 的实战团队架构
-- ============================================================================

INSERT INTO role (owner, name, display_name, description, created_time) VALUES
-- 管理层
('kaixuan', 'dept-ops-director', '运营总监(COO)',
'负责业务运营部整体管理和战略规划。统筹电商运营、内容营销、客户服务三大业务线。制定年度运营计划和KPI目标。监控各业务线核心指标(GMV、转化率、客户满意度)。要求8年以上运营管理经验。',
NOW()::text),

-- 电商运营组
('kaixuan', 'dept-ops-ecommerce-lead', '电商运营组长',
'负责电商业务整体运营管理，制定店铺运营策略和推广方案。统筹商品运营、推广投放、视觉设计等岗位。监控GMV、转化率、ROI等核心指标。管理大促活动策划(双11/618)。要求5年以上电商运营经验。',
NOW()::text),

('kaixuan', 'dept-ops-store-manager', '店铺运营专员',
'负责店铺日常运营管理，包括商品上架优化、标题关键词、详情页策划。监控流量转化DSR等核心指标。参与活动策划和执行。要求3年以上店铺运营经验，熟练使用生意参谋等分析工具。',
NOW()::text),

('kaixuan', 'dept-ops-promotion', '推广投放专员',
'负责付费推广投放优化，包括直通车、钻展、超级推荐、千川等。制定预算方案优化关键词出价和人群定向。监控ROI和转化成本。要求精通各平台推广工具，具备数据分析能力。',
NOW()::text),

('kaixuan', 'dept-ops-product-specialist', '选品/商品专员',
'负责选品分析和商品全生命周期管理。进行竞品调研、定价策略、库存优化。优化商品SEO和类目选择，制定爆款打造计划。分析销售数据优化SKU结构。要求熟悉选品方法论和数据分析。',
NOW()::text),

-- 内容营销组
('kaixuan', 'dept-ops-content-lead', '内容营销组长',
'负责内容营销整体策略，统筹小红书、抖音、公众号等平台运营。管理内容创作、达人合作、社群运营。制定内容矩阵和达人合作体系。要求5年以上内容营销经验，深度理解各平台算法。',
NOW()::text),

('kaixuan', 'dept-ops-content-writer', '内容策划编辑',
'负责各平台内容策划和文案撰写。掌握不同平台写作风格产出高互动内容。进行选题调研和热点追踪策划系列内容。优化标题封面提升点击率。要求优秀文案功底，有爆款内容创作经验。',
NOW()::text),

('kaixuan', 'dept-ops-video-creator', '视频创作者',
'负责短视频内容策划拍摄和后期制作。撰写分镜脚本，拍摄高质量视频素材。使用剪映/PR等工具剪辑调色加字幕。了解各视频平台推荐算法和内容偏好。要求具备视频制作全流程能力。',
NOW()::text),

('kaixuan', 'dept-ops-kol-manager', '达人商务经理',
'负责KOL/KOC资源开发和合作关系维护。策划达人种草方案筛选匹配度高的达人。谈判价格管理合作流程(寄样→创作→发布→追踪)。分析达人数据评估合作ROI。要求有达人资源和商务谈判能力。',
NOW()::text),

('kaixuan', 'dept-ops-livestream-host', '直播运营/主播',
'负责直播带货执行，包括商品讲解和销售转化。掌握逼单话术和互动留人技巧。配合运营团队执行直播脚本根据数据调整节奏。要求具备镜头表现力和销售能力，有直播带货经验。',
NOW()::text),

-- 客户服务组
('kaixuan', 'dept-ops-cs-lead', '客服组长',
'负责客服团队管理，制定服务标准和SOP流程。监控服务质量指标(响应时间、满意度、解决率)。建立培训体系和知识库。分析客户反馈推动产品服务优化。要求3年以上客服管理经验。',
NOW()::text),

('kaixuan', 'dept-ops-cs-agent', '客服专员',
'负责售前咨询接待和售后问题处理。掌握产品知识准确解答客户疑问引导下单。处理退换货投诉差评等售后问题维护DSR评分。收集客户反馈用于优化。要求沟通能力强打字速度快。',
NOW()::text),

('kaixuan', 'dept-ops-visual-designer', '视觉设计师',
'负责运营视觉设计，包括店铺装修、详情页、活动Banner、短视频封面。策划商品拍摄方案。确保视觉风格统一符合品牌调性。要求精通PS/AI，有电商/新媒体视觉设计经验。',
NOW()::text);

\echo '>>> 业务运营部角色创建完成'

-- ============================================================================
-- PART 4: 平台治理部角色 (dept-governance)
-- 参考: 数据治理(DAMA) + 安全合规 + 财务管理
-- ============================================================================

INSERT INTO role (owner, name, display_name, description, created_time) VALUES
-- 管理层
('kaixuan', 'dept-gov-director', '治理总监',
'负责平台治理部整体管理，统筹数据、安全、财务行政三大模块。制定治理策略和合规体系。推动数字化转型和流程标准化。对接外部审计监管机构。要求8年以上管理经验，具备跨领域知识。',
NOW()::text),

-- 数据组
('kaixuan', 'dept-gov-data-lead', '数据主管',
'负责数据团队管理，统筹数据采集、数仓建设、BI分析、数据科学。制定数据战略和治理体系推动数据驱动决策。监控数据质量和安全合规。要求5年以上数据领域经验，有团队管理能力。',
NOW()::text),

('kaixuan', 'dept-gov-data-engineer', '数据工程师',
'负责数据管道和数仓建设维护。设计ETL流程对接多数据源进行采集清洗加载。优化数据存储和查询性能管理Hive/Spark等组件。保障数据质量建立监控告警。要求精通SQL/Python和大数据技术栈。',
NOW()::text),

('kaixuan', 'dept-gov-bi-analyst', 'BI数据分析师',
'负责业务数据分析报表和看板搭建，使用Tableau/PowerBI等工具可视化。设计指标体系和分析框架。输出经营分析报告发现增长机会和风险预警。要求精通SQL和BI工具，具备业务敏感度。',
NOW()::text),

('kaixuan', 'dept-gov-data-scientist', '数据科学家',
'负责机器学习模型研发和落地，包括推荐系统、用户画像、销售预测。使用Python进行特征工程和模型训练。探索前沿AI技术(NLP/CV/大模型)在业务场景的应用。要求有模型落地经验。',
NOW()::text),

-- 安全合规组
('kaixuan', 'dept-gov-security-lead', '安全合规主管',
'负责平台安全体系建设，包括应用安全、数据安全、基础设施安全。制定安全策略和合规方案(个人信息保护法/GDPR)。管理安全审计和渗透测试。处理安全事件和应急响应。要求5年以上安全管理经验。',
NOW()::text),

('kaixuan', 'dept-gov-legal', '法务合规专员',
'负责合同审核和法律风险防范。处理知识产权(商标/专利/著作权)申请维护。管理法律纠纷和诉讼对接外部律师。进行法律培训提升合规意识。要求法学背景通过司法考试优先。',
NOW()::text),

-- 财务行政组
('kaixuan', 'dept-gov-finance-lead', '财务主管',
'负责财务管理，包括账务处理、税务筹划、资金管理。编制财务报表和预算报告。推动财务数字化转型。对接审计银行税务等外部关系。要求5年以上财务管理经验，有CPA资格优先。',
NOW()::text),

('kaixuan', 'dept-gov-accountant', '会计',
'负责日常账务处理和凭证录入确保准确合规。编制月度/季度/年度财务报表。管理应收应付账款进行往来对账。配合审计提供财务资料。要求3年以上会计经验熟练使用财务软件。',
NOW()::text),

('kaixuan', 'dept-gov-hr', '人力资源专员',
'负责招聘、培训、绩效、薪酬、员工关系等HR工作。管理人事流程确保合规操作。推动企业文化建设提升员工满意度。要求熟悉劳动法律法规，有HR全模块经验。',
NOW()::text),

('kaixuan', 'dept-gov-admin', '行政专员',
'负责行政事务管理，包括办公环境、办公用品、资产管理。策划员工活动和福利方案。管理公司证件印章对接物业和政府。要求执行力强注重细节有行政经验。',
NOW()::text);

\echo '>>> 平台治理部角色创建完成'

-- ============================================================================
-- PART 5: 标准工作流定义（参考 MetaGPT + CrewAI）
-- ============================================================================
-- MetaGPT 工作流: 需求分析→系统设计→任务分解→编码→测试→发布
-- CrewAI 工作流: Sequential(顺序) / Hierarchical(层级)

INSERT INTO permission (owner, name, display_name, description, created_time) VALUES
-- 技术研发部工作流（参考MetaGPT）
('kaixuan', 'wf-org-tech-requirement', '[技术研发] 需求分析',
'收集需求→编写用户故事→需求评审→优先级排序→创建Backlog。参考MetaGPT的ProductManager角色。', NOW()::text),

('kaixuan', 'wf-org-tech-architecture', '[技术研发] 架构设计',
'技术选型→架构设计(ADR)→API契约定义→数据库建模→方案评审。参考MetaGPT的Architect角色。', NOW()::text),

('kaixuan', 'wf-org-tech-development', '[技术研发] 开发实现',
'任务分配(设备主管分配给智能体)→编码实现→Code Review→单元测试→代码合并。参考ChatDev的Programming阶段。', NOW()::text),

('kaixuan', 'wf-org-tech-testing', '[技术研发] 测试验收',
'集成测试→E2E测试→性能测试→安全扫描→验收评审。参考ChatDev的Review+Testing阶段。', NOW()::text),

('kaixuan', 'wf-org-tech-deployment', '[技术研发] 部署交付',
'预发验证→灰度发布→全量发布→健康检查→文档更新→监控确认。参考SRE最佳实践。', NOW()::text),

-- 业务运营部工作流
('kaixuan', 'wf-org-ops-product-launch', '[业务运营] 商品/服务上架',
'选品分析→竞品调研→定价策略→素材制作→上架发布→推广启动。', NOW()::text),

('kaixuan', 'wf-org-ops-content-marketing', '[业务运营] 内容营销',
'选题策划→内容创作(文案/视频)→达人合作→多平台发布→数据监控→优化迭代。', NOW()::text),

('kaixuan', 'wf-org-ops-livestream', '[业务运营] 直播带货',
'选品排品→脚本策划→预热引流→开播→投流配合→复盘优化。', NOW()::text),

('kaixuan', 'wf-org-ops-customer-service', '[业务运营] 客户服务',
'咨询接入→需求识别→问题处理→满意度回访→质检评估→知识沉淀。', NOW()::text),

-- 平台治理部工作流
('kaixuan', 'wf-org-gov-data-pipeline', '[平台治理] 数据采集治理',
'需求分析→数据源对接→ETL开发→质量校验→数仓建模→数据开放。', NOW()::text),

('kaixuan', 'wf-org-gov-compliance', '[平台治理] 合规审计',
'风险评估→策略制定→实施检查→漏洞修复→合规报告→持续监控。', NOW()::text),

('kaixuan', 'wf-org-gov-financial', '[平台治理] 财务核算',
'凭证录入→账务处理→报表编制→税务申报→审计配合→预算管理。', NOW()::text);

\echo '>>> 工作流定义完成'

-- ============================================================================
-- PART 6: 工作-角色关联（参考CrewAI的Task-Agent分配模式）
-- ============================================================================

INSERT INTO permission_rule (ptype, v0, v1, v2) VALUES
-- 技术研发：需求分析
('p', 'wf-org-tech-requirement', 'dept-tech-cto', 'dept-tech-product-owner'),
('p', 'wf-org-tech-requirement', 'dept-tech-tech-lead', ''),
-- 技术研发：架构设计
('p', 'wf-org-tech-architecture', 'dept-tech-cto', 'dept-tech-system-architect'),
('p', 'wf-org-tech-architecture', 'dept-tech-tech-lead', 'dept-tech-ai-engineer'),
-- 技术研发：开发实现
('p', 'wf-org-tech-development', 'dept-tech-frontend-dev', 'dept-tech-backend-dev'),
('p', 'wf-org-tech-development', 'dept-tech-ai-engineer', 'dept-tech-tech-lead'),
-- 技术研发：测试验收
('p', 'wf-org-tech-testing', 'dept-tech-qa-lead', 'dept-tech-tech-lead'),
-- 技术研发：部署交付
('p', 'wf-org-tech-deployment', 'dept-tech-devops', 'dept-tech-qa-lead'),
('p', 'wf-org-tech-deployment', 'dept-tech-tech-lead', ''),

-- 业务运营：商品上架
('p', 'wf-org-ops-product-launch', 'dept-ops-ecommerce-lead', 'dept-ops-product-specialist'),
('p', 'wf-org-ops-product-launch', 'dept-ops-visual-designer', 'dept-ops-promotion'),
-- 业务运营：内容营销
('p', 'wf-org-ops-content-marketing', 'dept-ops-content-lead', 'dept-ops-content-writer'),
('p', 'wf-org-ops-content-marketing', 'dept-ops-video-creator', 'dept-ops-kol-manager'),
-- 业务运营：直播带货
('p', 'wf-org-ops-livestream', 'dept-ops-livestream-host', 'dept-ops-ecommerce-lead'),
('p', 'wf-org-ops-livestream', 'dept-ops-promotion', ''),
-- 业务运营：客户服务
('p', 'wf-org-ops-customer-service', 'dept-ops-cs-lead', 'dept-ops-cs-agent'),

-- 平台治理：数据
('p', 'wf-org-gov-data-pipeline', 'dept-gov-data-lead', 'dept-gov-data-engineer'),
('p', 'wf-org-gov-data-pipeline', 'dept-gov-bi-analyst', 'dept-gov-data-scientist'),
-- 平台治理：合规
('p', 'wf-org-gov-compliance', 'dept-gov-security-lead', 'dept-gov-legal'),
-- 平台治理：财务
('p', 'wf-org-gov-financial', 'dept-gov-finance-lead', 'dept-gov-accountant');

\echo '>>> 工作流-角色关联完成'

-- ============================================================================
-- PART 7: 验证
-- ============================================================================
\echo ''
\echo '============================================'
\echo '  三部门架构初始化完成'
\echo '============================================'

SELECT '--- 部门 ---' as section;
SELECT name, display_name FROM organization WHERE name LIKE 'dept-%' ORDER BY name;

SELECT '--- 技术研发部 ---' as section;
SELECT name, display_name FROM role WHERE owner = 'kaixuan' AND name LIKE 'dept-tech-%' ORDER BY name;

SELECT '--- 业务运营部 ---' as section;
SELECT name, display_name FROM role WHERE owner = 'kaixuan' AND name LIKE 'dept-ops-%' ORDER BY name;

SELECT '--- 平台治理部 ---' as section;
SELECT name, display_name FROM role WHERE owner = 'kaixuan' AND name LIKE 'dept-gov-%' ORDER BY name;

SELECT '--- 工作流 ---' as section;
SELECT name, display_name FROM permission WHERE owner = 'kaixuan' AND name LIKE 'wf-org-%' ORDER BY name;

SELECT '--- 统计 ---' as section;
SELECT
  (SELECT COUNT(*) FROM organization WHERE name LIKE 'dept-%') as departments,
  (SELECT COUNT(*) FROM role WHERE owner = 'kaixuan' AND name LIKE 'dept-%') as roles,
  (SELECT COUNT(*) FROM permission WHERE owner = 'kaixuan' AND name LIKE 'wf-org-%') as workflows;
