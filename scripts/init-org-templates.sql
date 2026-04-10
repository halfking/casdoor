-- ============================================================================
-- 开轩平台 — 组织架构模板初始化
-- 包含 10 种典型企业组织的岗位角色、工作流、岗位职责
-- 执行: docker exec -i postgres psql -U casdoor -d casdoor < init-org-templates.sql
-- ============================================================================

\echo '>>> 初始化组织模板...'

-- ============================================================================
-- 1. 电商运营组织 (org-ecommerce)
-- ============================================================================
INSERT INTO organization (name, display_name, website_url, owner, created_time)
VALUES ('org-ecommerce', '电商运营组织', 'https://itestu.cn', 'admin', NOW()::text)
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'role-ecommerce-director', '电商运营总监',
'全面负责电商业务战略规划与执行，制定年度销售目标与运营策略。统筹各电商平台（淘宝、京东、拼多多）的整体运营方向，监控核心业务指标（GMV、转化率、客单价、ROI），协调运营、推广、客服、供应链等团队高效协作。负责团队建设与人才培养，推动业务持续增长。要求具备5年以上电商运营经验，精通平台规则与算法机制，具备数据驱动决策能力和跨部门协调能力。',
NOW()::text),

('kaixuan', 'role-ecommerce-store-manager', '店铺运营经理',
'负责单个或多个电商店铺的日常运营管理，包括商品上架优化、标题关键词优化、主图详情页策划、价格策略制定。监控店铺流量、转化率、DSR评分等核心指标，制定并执行提升方案。参与平台大促活动策划（双11、618、年货节），管理活动报名、优惠方案、库存备货。要求3年以上店铺运营经验，熟练使用生意参谋、数据银行等分析工具。',
NOW()::text),

('kaixuan', 'role-ecommerce-product-specialist', '商品运营专员',
'负责商品全生命周期管理，包括选品分析、竞品调研、商品定价策略、库存周转优化。优化商品标题SEO、属性完善、类目选择，提升自然搜索排名。管理商品评价与口碑维护，策划买家秀征集、好评返现等活动。分析商品销售数据，优化SKU结构，制定爆款打造计划。要求熟悉电商选品方法论，具备基本数据分析能力。',
NOW()::text),

('kaixuan', 'role-ecommerce-promotion', '推广投放专员',
'负责店铺付费推广投放与优化，包括直通车、钻展、超级推荐、品销宝等工具的日常操作。制定推广预算分配方案，优化关键词出价、人群定向、创意素材。监控推广ROI、点击率、转化成本等指标，持续优化投放策略。分析竞品推广策略，挖掘流量增长机会。要求精通淘宝/京东推广工具，具备SEM投放经验，擅长数据分析和报表制作。',
NOW()::text),

('kaixuan', 'role-ecommerce-content', '内容运营专员',
'负责店铺内容营销矩阵搭建，包括微淘/逛逛内容发布、直播脚本策划、短视频内容制作。策划买家种草内容、搭配推荐、使用教程等优质内容，提升粉丝粘性和复购率。与达人/KOL合作进行内容推广，管理达人合作流程和效果追踪。要求具备文案策划能力，了解各内容平台推荐算法，有短视频或直播运营经验优先。',
NOW()::text),

('kaixuan', 'role-ecommerce-cs', '电商客服专员',
'负责售前咨询接待、售中订单跟踪、售后问题处理。熟练掌握产品知识，准确解答客户疑问，引导下单提升转化率。处理退换货、投诉、差评等售后问题，维护店铺DSR评分。使用客服话术模板和快捷回复提升响应效率，收集客户反馈用于产品和服务优化。要求打字速度快（80字/分钟以上），熟悉电商平台客服规则，具备良好的沟通能力和耐心。',
NOW()::text),

('kaixuan', 'role-ecommerce-visual', '视觉设计师',
'负责店铺整体视觉风格设计，包括首页装修、详情页设计、活动Banner、主图优化。策划商品拍摄方案，与摄影师协作完成产品图片拍摄和后期精修。设计营销活动页面、优惠券、促销海报等物料，确保视觉风格统一且符合品牌调性。要求精通Photoshop、Illustrator等设计软件，具备电商视觉设计经验，了解用户视觉动线和点击热力图原理。',
NOW()::text),

('kaixuan', 'role-ecommerce-data-analyst', '电商数据分析师',
'负责电商业务数据体系建设，包括销售数据、流量数据、用户行为数据的采集、清洗和分析。制作日报、周报、月报等经营分析报告，发现业务增长点和风险预警。构建用户画像和RFM模型，支撑精准营销决策。搭建数据看板，实现核心指标实时监控。要求熟练使用SQL、Excel、Python进行数据分析，了解数据可视化工具（Tableau/PowerBI）。',
NOW()::text);

INSERT INTO permission (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'wf-ecommerce-planning', '选品策划阶段', '市场调研→竞品分析→选品决策→定价策略', NOW()::text),
('kaixuan', 'wf-ecommerce-listing', '商品上架阶段', '商品拍摄→详情页设计→标题优化→上架发布', NOW()::text),
('kaixuan', 'wf-ecommerce-promotion', '推广运营阶段', '推广投放→活动策划→内容种草→直播带货', NOW()::text),
('kaixuan', 'wf-ecommerce-fulfillment', '订单履约阶段', '客服接待→订单处理→物流跟踪→售后维护', NOW()::text);

INSERT INTO permission_rule (ptype, v0, v1, v2) VALUES
('p', 'wf-ecommerce-planning', 'role-ecommerce-director', 'role-ecommerce-product-specialist'),
('p', 'wf-ecommerce-planning', 'role-ecommerce-data-analyst', ''),
('p', 'wf-ecommerce-listing', 'role-ecommerce-product-specialist', 'role-ecommerce-visual'),
('p', 'wf-ecommerce-listing', 'role-ecommerce-store-manager', ''),
('p', 'wf-ecommerce-promotion', 'role-ecommerce-promotion', 'role-ecommerce-content'),
('p', 'wf-ecommerce-promotion', 'role-ecommerce-store-manager', ''),
('p', 'wf-ecommerce-fulfillment', 'role-ecommerce-cs', 'role-ecommerce-store-manager'),
('p', 'wf-ecommerce-fulfillment', 'role-ecommerce-data-analyst', '');

-- ============================================================================
-- 2. 小红书运营组织 (org-xiaohongshu)
-- ============================================================================
INSERT INTO organization (name, display_name, website_url, owner, created_time)
VALUES ('org-xiaohongshu', '小红书运营组织', 'https://itestu.cn', 'admin', NOW()::text)
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'role-xhs-operation-director', '小红书运营总监',
'制定小红书品牌营销整体策略，规划内容矩阵和达人合作体系。负责品牌在小红书的口碑建设和用户增长，监控品牌曝光量、互动率、种草转化等核心KPI。统筹内容团队、达人商务、社群运营等子团队，建立标准化SOP流程。要求5年以上社交营销经验，深度理解小红书算法推荐机制和社区文化，具备优秀的创意策划和团队管理能力。',
NOW()::text),

('kaixuan', 'role-xhs-content-planner', '内容策划编辑',
'负责小红书账号内容规划与选题策划，制定月度/季度内容日历。撰写种草笔记、品牌故事、产品测评等原创内容，掌握标题党技巧和封面设计原则提升点击率。分析热门话题和趋势标签，策划借势营销内容。管理内容发布节奏，优化发布时间、频率和标签策略。要求具备优秀文案功底，了解小红书内容审核规则，有爆款笔记创作经验。',
NOW()::text),

('kaixuan', 'role-xhs-kol-manager', '达人商务经理',
'负责小红书KOL/KOC资源开发与合作关系维护，建立品牌达人库。策划达人种草方案，筛选匹配度高的达人进行产品体验和内容创作合作。谈判合作价格，管理合作流程（寄样→创作→发布→数据追踪）。分析达人账号数据（粉丝画像、互动率、历史带货数据），评估合作ROI。要求具备达人资源积累，了解小红书达人报价体系，擅长商务谈判。',
NOW()::text),

('kaixuan', 'role-xhs-visual-creator', '图文视频创作者',
'负责小红书笔记的图片拍摄/设计和短视频拍摄/剪辑。掌握手机摄影技巧，能够拍摄高质量的产品使用场景图、对比图、教程图。使用剪映/PR等工具剪辑种草短视频，添加字幕、音乐、特效。了解小红书视觉风格偏好（ins风、日系风、国潮风等），产出符合平台审美的视觉内容。要求熟练使用手机拍摄和基础修图软件，有短视频创作经验。',
NOW()::text),

('kaixuan', 'role-xhs-community-operator', '社群运营专员',
'负责小红书品牌私域社群搭建与运营，包括粉丝群管理、话题互动、福利发放。策划社群专属活动（新品试用、限时折扣、抽奖），提升社群活跃度和用户粘性。收集用户反馈和UGC内容，反哺产品优化和内容创作。管理品牌口碑，及时回应负面评价和用户投诉。要求具备社群运营经验，了解用户心理和社群裂变玩法，有良好的服务意识。',
NOW()::text),

('kaixuan', 'role-xhs-data-analyst', '小红书数据分析师',
'负责小红书运营数据监测与分析，包括笔记阅读量、点赞收藏评论数、粉丝增长、品牌声量等指标。分析竞品账号和行业标杆，挖掘内容优化方向和流量增长机会。搭建数据看板，实现核心指标自动化追踪。输出周期性运营报告，为策略调整提供数据支撑。要求熟练使用小红书创作者中心、千瓜数据、新红数据等分析工具。',
NOW()::text);

INSERT INTO permission (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'wf-xhs-content', '内容生产阶段', '选题策划→文案撰写→视觉制作→发布优化', NOW()::text),
('kaixuan', 'wf-xhs-kol', '达人合作阶段', '达人筛选→商务洽谈→内容共创→效果追踪', NOW()::text),
('kaixuan', 'wf-xhs-community', '社群运营阶段', '社群维护→活动策划→口碑管理→用户转化', NOW()::text);

INSERT INTO permission_rule (ptype, v0, v1, v2) VALUES
('p', 'wf-xhs-content', 'role-xhs-content-planner', 'role-xhs-visual-creator'),
('p', 'wf-xhs-content', 'role-xhs-operation-director', ''),
('p', 'wf-xhs-kol', 'role-xhs-kol-manager', 'role-xhs-operation-director'),
('p', 'wf-xhs-kol', 'role-xhs-data-analyst', ''),
('p', 'wf-xhs-community', 'role-xhs-community-operator', 'role-xhs-content-planner');

-- ============================================================================
-- 3. 抖音直播运营组织 (org-livestream)
-- ============================================================================
INSERT INTO organization (name, display_name, website_url, owner, created_time)
VALUES ('org-livestream', '抖音直播运营组织', 'https://itestu.cn', 'admin', NOW()::text)
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'role-live-director', '直播运营总监',
'全面负责直播业务规划和团队管理，制定直播GMV目标和排期策略。统筹主播管理、选品排品、场控运营、投流投放等模块，建立标准化直播SOP。分析直播数据（场观、停留时长、转化率、UV价值），持续优化直播效率。负责与品牌方、供应链对接，争取独家资源和优惠政策。要求3年以上直播运营经验，操盘过月GMV千万级直播间。',
NOW()::text),

('kaixuan', 'role-live-host', '直播主播',
'负责直播间商品讲解和销售转化，具备良好的镜头表现力和语言感染力。熟练掌握产品卖点提炼、逼单话术、互动留人技巧。配合运营团队执行直播脚本，根据实时数据调整讲解节奏和促单策略。维护粉丝关系，引导关注和加粉丝团，提升复购率。要求形象气质佳，口齿清晰，抗压能力强，有带货主播经验优先。',
NOW()::text),

('kaixuan', 'role-live-assistant', '直播场控/副播',
'协助主播进行直播控场，负责商品上架改价、库存管理、优惠券发放。实时监控直播间数据和弹幕互动，提醒主播调整节奏。处理直播中的突发状况（断网、投诉、违规提醒），确保直播顺利进行。管理直播后台操作（福袋、抽奖、红包），营造直播间氛围。要求反应敏捷，熟悉抖音/快手直播后台操作，能承受高强度工作。',
NOW()::text),

('kaixuan', 'role-live-product-manager', '直播选品经理',
'负责直播间的选品和排品策略，筛选高转化、高毛利的商品组合。对接供应商和品牌方，谈判直播专属价格和机制。制定每场直播的排品计划（引流款、利润款、形象款的搭配），优化客单价和转化率。跟踪直播间退货率和售后数据，淘汰低效商品。要求具备选品经验，了解直播爆款逻辑，有供应链资源优先。',
NOW()::text),

('kaixuan', 'role-live-ad-buyer', '直播投流师',
'负责直播间的付费流量投放，包括千川、Dou+等投流工具的实时操作和优化。根据直播间实时数据调整出价、定向、创意，最大化ROI。制定投流预算方案，平衡自然流量和付费流量的比例。分析投流数据报表，持续优化投放策略和人群包。要求精通千川投放后台，有月消耗50万+的投放经验，擅长实时数据分析和决策。',
NOW()::text),

('kaixuan', 'role-live-content-ops', '短视频内容运营',
'负责直播切片短视频的策划、剪辑和发布，为直播间持续引流。分析短视频播放数据，优化封面、标题、BGM等元素提升完播率。策划直播间预热内容和日常种草视频，维护账号活跃度和粉丝增长。跟踪抖音热点话题，策划借势营销内容。要求熟练使用剪映等短视频工具，了解抖音算法推荐机制，有短视频爆款经验优先。',
NOW()::text);

INSERT INTO permission (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'wf-live-preparation', '直播筹备阶段', '选品排品→脚本策划→预热引流→设备调试', NOW()::text),
('kaixuan', 'wf-live-broadcasting', '直播执行阶段', '开播→商品讲解→互动促单→投流配合', NOW()::text),
('kaixuan', 'wf-live-review', '复盘优化阶段', '数据复盘→问题分析→策略优化→切片分发', NOW()::text);

INSERT INTO permission_rule (ptype, v0, v1, v2) VALUES
('p', 'wf-live-preparation', 'role-live-director', 'role-live-product-manager'),
('p', 'wf-live-preparation', 'role-live-content-ops', ''),
('p', 'wf-live-broadcasting', 'role-live-host', 'role-live-assistant'),
('p', 'wf-live-broadcasting', 'role-live-ad-buyer', ''),
('p', 'wf-live-review', 'role-live-director', 'role-live-ad-buyer'),
('p', 'wf-live-review', 'role-live-content-ops', '');

-- ============================================================================
-- 4. 软件开发团队 (org-software-dev)
-- ============================================================================
INSERT INTO organization (name, display_name, website_url, owner, created_time)
VALUES ('org-software-dev', '软件开发团队', 'https://itestu.cn', 'admin', NOW()::text)
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'role-dev-tech-lead', '技术负责人',
'负责项目技术架构设计和关键技术决策，制定技术规范和编码标准。评估技术方案可行性，把控技术风险。参与核心模块代码编写和Code Review，确保代码质量。指导团队成员技术成长，解决技术难题。推动技术债务治理和系统重构，确保系统可维护性和可扩展性。要求8年以上开发经验，精通系统架构设计，具备技术团队管理经验。',
NOW()::text),

('kaixuan', 'role-dev-product-owner', '产品负责人',
'负责产品需求分析和优先级排序，维护产品需求池（Backlog）。编写用户故事和验收标准，确保研发团队对需求理解一致。参与Sprint Planning和Sprint Review，把控产品交付节奏。收集用户反馈和业务数据，持续优化产品功能。要求具备产品思维和业务理解能力，擅长需求拆解和优先级判断，有Scrum/敏捷开发经验。',
NOW()::text),

('kaixuan', 'role-dev-frontend', '前端开发工程师',
'负责Web/移动端前端开发，使用Vue3/React框架构建用户界面。实现UI设计师提供的视觉稿，确保跨浏览器和跨设备兼容性。优化前端性能（首屏加载、动画流畅度、打包体积），提升用户体验。编写单元测试和E2E测试，保证代码质量。要求精通HTML/CSS/JavaScript，熟练使用Vue3或React，了解前端工程化工具链（Vite/Webpack/CI）。',
NOW()::text),

('kaixuan', 'role-dev-backend', '后端开发工程师',
'负责服务端API设计和开发，使用Java(Spring Boot)/Go(Gin)构建RESTful/gRPC接口。设计数据库表结构和索引方案，编写高效SQL查询。实现业务逻辑和数据校验，处理并发、事务、缓存等后端技术问题。编写单元测试和集成测试，保证接口稳定性和数据一致性。要求3年以上后端开发经验，熟悉数据库设计和微服务架构。',
NOW()::text),

('kaixuan', 'role-dev-qa', '测试工程师',
'负责软件质量保证，制定测试计划和测试策略。编写测试用例，执行功能测试、接口测试、性能测试、安全测试。管理Bug生命周期（发现→分配→修复→验证），跟踪Bug修复进度。搭建和维护自动化测试框架，提升测试效率。要求掌握软件测试方法论，熟练使用测试工具（JMeter/Postman/Selenium），有自动化测试经验。',
NOW()::text),

('kaixuan', 'role-dev-devops', 'DevOps工程师',
'负责CI/CD流水线搭建和维护，实现代码提交到部署的自动化流程。管理容器化部署（Docker/Kubernetes），确保服务高可用和弹性伸缩。监控系统运行状态（Prometheus/Grafana），处理告警和故障排查。管理基础设施（云服务器、数据库、缓存、消息队列），优化资源使用和成本。要求精通Linux运维和容器技术，熟悉主流云平台（阿里云/AWS）。',
NOW()::text),

('kaixuan', 'role-dev-ui-designer', 'UI/UX设计师',
'负责产品界面设计和用户体验优化。根据产品需求设计页面原型和交互方案，使用Figma/Sketch制作高保真设计稿。建立和维护设计规范（Design System），确保产品视觉风格统一。进行用户研究和可用性测试，持续优化交互流程。要求精通UI设计工具，了解前端实现原理，具备良好的审美和用户体验意识。',
NOW()::text);

INSERT INTO permission (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'wf-dev-sprint', '迭代规划', '需求梳理→优先级排序→Sprint计划→任务分配', NOW()::text),
('kaixuan', 'wf-dev-develop', '开发实现', '技术设计→编码实现→代码审查→单元测试', NOW()::text),
('kaixuan', 'wf-dev-release', '发布交付', '集成测试→预发验证→灰度发布→线上监控', NOW()::text);

INSERT INTO permission_rule (ptype, v0, v1, v2) VALUES
('p', 'wf-dev-sprint', 'role-dev-product-owner', 'role-dev-tech-lead'),
('p', 'wf-dev-develop', 'role-dev-frontend', 'role-dev-backend'),
('p', 'wf-dev-develop', 'role-dev-tech-lead', ''),
('p', 'wf-dev-release', 'role-dev-qa', 'role-dev-devops'),
('p', 'wf-dev-release', 'role-dev-tech-lead', '');

-- ============================================================================
-- 5. 内容创作/自媒体组织 (org-selfmedia)
-- ============================================================================
INSERT INTO organization (name, display_name, website_url, owner, created_time)
VALUES ('org-selfmedia', '内容创作自媒体组织', 'https://itestu.cn', 'admin', NOW()::text)
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'role-media-chief-editor', '主编/内容总监',
'负责自媒体矩阵整体内容策略规划，确定内容定位、风格调性和受众画像。统筹微信公众号、视频号、B站、抖音等平台的内容分发策略。审核核心内容质量，把控内容调性和品牌一致性。管理内容团队（编辑、视频、设计），制定内容生产SOP和排期。分析各平台数据表现，优化内容策略和增长路径。要求5年以上内容运营经验，具备优秀的内容策划和团队管理能力。',
NOW()::text),

('kaixuan', 'role-media-writer', '资深文案编辑',
'负责公众号长文、视频脚本、品牌文案等各类文字内容的撰写和编辑。掌握不同平台的写作风格（公众号深度文、小红书种草文、抖音脚本），产出高阅读量和高互动的内容。进行选题调研和热点追踪，策划系列内容和专题报道。优化标题和摘要，提升内容点击率和完读率。要求具备优秀文字功底，了解SEO写作技巧，有10万+阅读量爆款文章经验。',
NOW()::text),

('kaixuan', 'role-media-video-producer', '视频编导/剪辑师',
'负责视频内容的策划、拍摄和后期制作。撰写视频分镜脚本，规划镜头语言和叙事节奏。使用专业设备或手机完成视频拍摄，把控画面构图、灯光和收音质量。使用PR/FCPX/剪映等工具进行视频剪辑、调色、添加字幕和音效。优化视频封面和标题，提升视频点击率。要求具备视频制作全流程能力，了解各视频平台的推荐算法和内容偏好。',
NOW()::text),

('kaixuan', 'role-media-graphic-designer', '平面设计师',
'负责自媒体内容的视觉设计，包括公众号封面图、视频封面、信息图、长图等内容物料。设计品牌VI元素，统一各平台视觉风格。制作营销海报、活动Banner、H5页面等推广物料。要求精通Photoshop、Illustrator、Canva等设计工具，具备信息可视化设计能力，了解各平台图片规格要求。',
NOW()::text),

('kaixuan', 'role-media-data-operator', '数据增长运营',
'负责自媒体账号的数据监测和增长策略。分析各平台内容数据（阅读量、互动率、涨粉率、完播率），发现增长机会和优化方向。制定涨粉策略，策划裂变活动、互推合作、投放引流等增长手段。管理平台投放工具（广点通、粉丝头条），优化投放ROI。搭建数据看板，实现核心指标自动化追踪。要求具备数据分析和增长黑客经验。',
NOW()::text);

INSERT INTO permission (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'wf-media-plan', '内容策划阶段', '选题调研→热点追踪→内容策划→排期制定', NOW()::text),
('kaixuan', 'wf-media-produce', '内容制作阶段', '文案撰写→视觉设计→视频拍摄→后期制作', NOW()::text),
('kaixuan', 'wf-media-distribute', '内容分发阶段', '多平台发布→数据监控→互动维护→增长优化', NOW()::text);

INSERT INTO permission_rule (ptype, v0, v1, v2) VALUES
('p', 'wf-media-plan', 'role-media-chief-editor', 'role-media-data-operator'),
('p', 'wf-media-produce', 'role-media-writer', 'role-media-video-producer'),
('p', 'wf-media-produce', 'role-media-graphic-designer', ''),
('p', 'wf-media-distribute', 'role-media-data-operator', 'role-media-chief-editor');

-- ============================================================================
-- 6. 客户服务中心 (org-customer-service)
-- ============================================================================
INSERT INTO organization (name, display_name, website_url, owner, created_time)
VALUES ('org-customer-service', '客户服务中心', 'https://itestu.cn', 'admin', NOW()::text)
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'role-cs-director', '客服总监',
'全面负责客户服务体系的规划和管理，制定客服标准和SOP流程。管理客服团队日常运营，监控服务质量指标（响应时间、满意度、解决率）。建立客服培训体系和知识库，提升团队专业能力。统筹售前、售后、投诉处理等各环节，推动跨部门协作解决客户问题。分析客户反馈数据，推动产品和服务持续优化。要求5年以上客服管理经验，具备优秀的团队建设和流程优化能力。',
NOW()::text),

('kaixuan', 'role-cs-pre-sales', '售前咨询顾问',
'负责客户咨询接待和需求分析，提供专业的产品介绍和解决方案推荐。通过电话、在线客服、社交媒体等多渠道响应客户咨询，引导客户完成购买决策。建立客户档案，跟踪意向客户转化过程。收集客户需求和反馈，为产品优化和市场策略提供参考。要求熟悉公司产品线，具备优秀的沟通能力和销售技巧，能快速理解客户需求。',
NOW()::text),

('kaixuan', 'role-cs-after-sales', '售后服务专员',
'负责客户售后问题处理，包括退换货、维修、投诉、赔偿等问题。按照售后政策处理客户诉求，平衡客户满意度和公司利益。跟踪售后工单处理进度，确保问题及时闭环。分析售后问题根因，推动产品和服务改进。要求熟悉消费者权益保护法和电商售后规则，具备良好的问题解决能力和同理心。',
NOW()::text),

('kaixuan', 'role-cs-quality', '质检培训专员',
'负责客服服务质量监控和评估，通过录音/聊天记录抽查进行质检评分。制定质检标准和评分表，定期输出质检报告和改进建议。根据质检发现的问题，制定针对性的培训计划和提升方案。组织新员工入职培训和在岗技能提升培训，建设客服知识库。要求具备客服质检经验，擅长培训课件设计和授课。',
NOW()::text),

('kaixuan', 'role-cs-tech-support', '技术支持工程师',
'负责处理客户的技术类问题，包括产品使用指导、故障排查、系统配置等。编写技术文档和FAQ，完善自助服务知识库。收集和整理客户反馈的技术问题，反馈给研发团队进行产品优化。参与产品新功能的测试和验证，提前准备客服应对方案。要求具备技术背景，逻辑思维清晰，擅长问题分析和文档编写。',
NOW()::text);

INSERT INTO permission (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'wf-cs-inbound', '客户接入', '渠道分配→咨询接待→需求识别→分级处理', NOW()::text),
('kaixuan', 'wf-cs-resolution', '问题解决', '工单创建→问题排查→方案提供→客户确认', NOW()::text),
('kaixuan', 'wf-cs-followup', '跟进闭环', '满意度回访→质检评估→问题归档→知识沉淀', NOW()::text);

INSERT INTO permission_rule (ptype, v0, v1, v2) VALUES
('p', 'wf-cs-inbound', 'role-cs-pre-sales', 'role-cs-tech-support'),
('p', 'wf-cs-resolution', 'role-cs-after-sales', 'role-cs-tech-support'),
('p', 'wf-cs-followup', 'role-cs-quality', 'role-cs-director');

-- ============================================================================
-- 7. 市场营销团队 (org-marketing)
-- ============================================================================
INSERT INTO organization (name, display_name, website_url, owner, created_time)
VALUES ('org-marketing', '市场营销团队', 'https://itestu.cn', 'admin', NOW()::text)
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'role-mkt-cmo', '首席营销官/营销总监',
'制定品牌营销整体战略和年度营销计划，统筹品牌建设、数字营销、公关传播等工作。管理营销预算分配，监控各渠道营销ROI。推动品牌定位和传播策略升级，提升品牌知名度和美誉度。建设和管理营销团队，推动营销创新和数字化转型。要求8年以上市场营销经验，具备品牌管理、数字营销、团队管理等综合能力。',
NOW()::text),

('kaixuan', 'role-mkt-brand', '品牌经理',
'负责品牌定位、品牌视觉体系和品牌传播策略的制定和执行。管理品牌资产（Logo、VI、品牌故事），确保各触点品牌形象统一。策划品牌活动（发布会、赞助、联名），提升品牌影响力。监测品牌声量和口碑，管理品牌危机公关。要求具备品牌策划和管理经验，擅长品牌故事讲述，有成功品牌案例优先。',
NOW()::text),

('kaixuan', 'role-mkt-sem', 'SEO/SEM专员',
'负责搜索引擎优化和付费搜索广告投放管理。优化网站SEO（站内结构、关键词布局、外链建设），提升自然搜索排名。管理百度/Google Ads等付费搜索账户，优化关键词、出价、创意，提升转化率降低CPC。分析搜索数据和竞争对手策略，持续优化投放效果。要求精通SEO/SEM，熟悉百度统计/Google Analytics等分析工具。',
NOW()::text),

('kaixuan', 'role-mkt-event', '活动策划经理',
'负责线上线下营销活动的策划和执行，包括产品发布会、行业峰会、促销活动、展览展会等。制定活动方案（主题、流程、预算、物料、嘉宾），协调各部门推进活动落地。管理活动供应商（场地、搭建、设备、餐饮），控制活动成本。评估活动效果，收集参与者反馈，持续优化活动质量。要求具备活动策划和项目管理经验，执行力强。',
NOW()::text),

('kaixuan', 'role-mkt-social', '社交媒体运营',
'负责品牌社交媒体账号矩阵运营（微博、抖音、小红书、微信等）。策划社交媒体内容和互动活动，提升粉丝量和互动率。管理社交媒体投放（信息流广告、KOL合作），优化投放效果。监测品牌舆情和行业动态，及时响应和处理。要求熟悉各社交媒体平台特点和运营规则，具备内容策划和数据分析能力。',
NOW()::text),

('kaixuan', 'role-mkt-pr', '公关传播专员',
'负责品牌公关策略制定和执行，维护媒体关系和行业KOL关系。撰写新闻稿、公关稿件、行业白皮书等传播内容。管理媒体投放和软文发布，提升品牌曝光度和公信力。处理品牌危机公关，制定应急预案和响应策略。要求具备媒体资源积累，优秀的新闻写作能力，有危机公关处理经验优先。',
NOW()::text);

INSERT INTO permission (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'wf-mkt-strategy', '营销策划', '市场洞察→品牌策略→预算规划→渠道选择', NOW()::text),
('kaixuan', 'wf-mkt-execution', '营销执行', '内容制作→投放管理→活动执行→KOL合作', NOW()::text),
('kaixuan', 'wf-mkt-evaluation', '效果评估', '数据收集→ROI分析→策略优化→报告输出', NOW()::text);

INSERT INTO permission_rule (ptype, v0, v1, v2) VALUES
('p', 'wf-mkt-strategy', 'role-mkt-cmo', 'role-mkt-brand'),
('p', 'wf-mkt-execution', 'role-mkt-sem', 'role-mkt-social'),
('p', 'wf-mkt-execution', 'role-mkt-event', 'role-mkt-pr'),
('p', 'wf-mkt-evaluation', 'role-mkt-cmo', 'role-mkt-sem');

-- ============================================================================
-- 8. 数据分析团队 (org-data-team)
-- ============================================================================
INSERT INTO organization (name, display_name, website_url, owner, created_time)
VALUES ('org-data-team', '数据分析团队', 'https://itestu.cn', 'admin', NOW()::text)
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'role-data-director', '数据总监/首席数据官',
'制定企业数据战略和数据治理体系，推动数据驱动决策文化。管理数据团队，统筹数据采集、数据仓库建设、BI分析、数据科学等模块。制定数据安全策略和隐私合规方案，确保数据使用合法合规。评估数据技术选型，推动数据平台建设和工具链优化。要求8年以上数据领域经验，具备战略思维和技术深度。',
NOW()::text),

('kaixuan', 'role-data-engineer', '数据工程师',
'负责数据管道和数据仓库的建设和维护。设计ETL/ELT流程，对接多数据源（MySQL、日志、API）进行数据采集、清洗和加载。优化数据存储和查询性能，管理Hive/Spark/Flink等大数据组件。保障数据质量和数据及时性，建立数据质量监控和告警体系。要求精通SQL和Python，熟悉大数据技术栈，有数据仓库建模经验。',
NOW()::text),

('kaixuan', 'role-data-bi-analyst', 'BI分析师',
'负责业务数据分析报表和看板的搭建，使用Tableau/PowerBI/Superset等BI工具进行数据可视化。与业务团队沟通需求，设计指标体系和分析框架。编写SQL查询和数据分析脚本，输出经营分析报告。发现业务异常和增长机会，提供数据支撑的决策建议。要求精通SQL，熟练使用BI工具，具备业务敏感度和数据故事讲述能力。',
NOW()::text),

('kaixuan', 'role-data-scientist', '数据科学家',
'负责机器学习模型的研发和落地应用，包括推荐系统、用户画像、销售预测、异常检测等场景。使用Python进行特征工程、模型训练和效果评估，将模型部署到生产环境。探索前沿AI技术（NLP、CV、大模型）在业务场景的应用可能。要求具备扎实的统计学和机器学习基础，精通Python/scikit-learn/PyTorch，有模型落地经验。',
NOW()::text),

('kaixuan', 'role-data-governance', '数据治理专员',
'负责企业数据治理体系的建设和落地，制定数据标准和数据质量规则。管理元数据目录和数据血缘，确保数据可追溯。推进数据安全策略实施，管理数据权限和脱敏规则。推动数据合规（个人信息保护法、GDPR），建立数据审计机制。要求了解数据治理框架（DAMA），具备数据管理和合规经验。',
NOW()::text);

INSERT INTO permission (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'wf-data-collect', '数据采集', '需求分析→数据源对接→ETL开发→质量校验', NOW()::text),
('kaixuan', 'wf-data-analyze', '数据分析', '指标定义→报表开发→洞察发现→决策建议', NOW()::text),
('kaixuan', 'wf-data-model', '数据建模', '场景定义→特征工程→模型训练→效果评估→上线部署', NOW()::text);

INSERT INTO permission_rule (ptype, v0, v1, v2) VALUES
('p', 'wf-data-collect', 'role-data-engineer', 'role-data-governance'),
('p', 'wf-data-analyze', 'role-data-bi-analyst', 'role-data-director'),
('p', 'wf-data-model', 'role-data-scientist', 'role-data-engineer'),
('p', 'wf-data-model', 'role-data-director', '');

-- ============================================================================
-- 9. 供应链管理组织 (org-supply-chain)
-- ============================================================================
INSERT INTO organization (name, display_name, website_url, owner, created_time)
VALUES ('org-supply-chain', '供应链管理组织', 'https://itestu.cn', 'admin', NOW()::text)
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'role-sc-director', '供应链总监',
'全面负责供应链体系规划和管理，包括采购、仓储、物流、计划等模块。制定供应链战略和成本优化方案，推动供应链数字化转型。管理供应商关系，建立供应商评估和淘汰机制。监控供应链KPI（库存周转率、订单履约率、供应链成本占比），持续优化供应链效率。要求10年以上供应链管理经验，具备战略规划和跨部门协调能力。',
NOW()::text),

('kaixuan', 'role-sc-procurement', '采购经理',
'负责供应商开发和采购谈判，建立稳定的供应体系。制定采购计划和预算，进行比价议价降低采购成本。管理采购合同和供应商绩效考核，确保交期和质量达标。进行市场行情调研，预判原材料价格波动，制定采购策略。要求3年以上采购经验，具备谈判技巧和成本分析能力，有相关行业供应商资源。',
NOW()::text),

('kaixuan', 'role-sc-warehouse', '仓储管理经理',
'负责仓库日常运营管理，包括收货、存储、拣货、打包、发货等全流程。优化仓库布局和动线设计，提升仓储效率和空间利用率。管理WMS系统，确保库存数据准确性。制定仓储SOP和安全规范，减少差错率和损耗率。要求3年以上仓储管理经验，熟悉WMS/ERP系统，具备团队管理和流程优化能力。',
NOW()::text),

('kaixuan', 'role-sc-logistics', '物流调度专员',
'负责物流快递的日常对接和调度管理，优化配送路线和时效。管理多家快递/物流供应商，谈判合作协议和价格。处理物流异常（延迟、破损、丢失），协调解决方案。监控物流数据（时效达成率、破损率、物流成本），持续优化配送效率。要求熟悉电商物流体系，了解各快递公司的服务特点和价格体系。',
NOW()::text),

('kaixuan', 'role-sc-planner', '需求计划专员',
'负责销售需求预测和库存计划制定，使用历史数据和市场趋势进行需求分析。制定安全库存策略和补货计划，平衡库存成本和缺货风险。协调销售、采购、仓储团队，确保供应链各环节信息同步。监控库存周转和滞销品，推动库存优化。要求具备数据分析能力和计划管理经验，了解MRP/ERP系统。',
NOW()::text);

INSERT INTO permission (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'wf-sc-plan', '需求计划阶段', '需求预测→库存计划→采购计划→排产协调', NOW()::text),
('kaixuan', 'wf-sc-source', '采购执行阶段', '供应商筛选→询价比价→合同签订→到货验收', NOW()::text),
('kaixuan', 'wf-sc-deliver', '仓储配送阶段', '入库管理→库存管理→拣货打包→物流配送', NOW()::text);

INSERT INTO permission_rule (ptype, v0, v1, v2) VALUES
('p', 'wf-sc-plan', 'role-sc-planner', 'role-sc-director'),
('p', 'wf-sc-source', 'role-sc-procurement', 'role-sc-director'),
('p', 'wf-sc-deliver', 'role-sc-warehouse', 'role-sc-logistics');

-- ============================================================================
-- 10. 财务与行政组织 (org-finance-admin)
-- ============================================================================
INSERT INTO organization (name, display_name, website_url, owner, created_time)
VALUES ('org-finance-admin', '财务与行政组织', 'https://itestu.cn', 'admin', NOW()::text)
ON CONFLICT (name) DO NOTHING;

INSERT INTO role (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'role-fa-cfo', '首席财务官/财务总监',
'全面负责企业财务管理和战略规划，制定财务政策和内控制度。管理财务报表编制、税务筹划、资金管理、投融资决策。推动财务数字化转型，建设财务分析和预算管理系统。对接审计机构、银行、税务等外部关系。要求10年以上财务管理经验，具备CPA/CMA等专业资格，有上市公司财务经验优先。',
NOW()::text),

('kaixuan', 'role-fa-accountant', '总账会计',
'负责日常账务处理和凭证录入，确保账务准确合规。编制月度/季度/年度财务报表（资产负债表、利润表、现金流量表）。管理应收应付账款，进行往来对账和账龄分析。配合审计工作，提供所需的财务资料和说明。要求3年以上会计经验，熟悉企业会计准则，熟练使用财务软件（用友/金蝶/SAP）。',
NOW()::text),

('kaixuan', 'role-fa-tax-specialist', '税务专员',
'负责企业税务申报和税务筹划，包括增值税、企业所得税、个人所得税等各类税种。研究税收政策和优惠条款，制定合法合规的税务优化方案。管理发票开具和进项认证，确保税务合规。对接税务机关，处理税务检查和咨询。要求熟悉中国税法，具备税务筹划经验，有税务师资格优先。',
NOW()::text),

('kaixuan', 'role-fa-hr-manager', '人力资源经理',
'负责企业人力资源全面管理，包括招聘、培训、绩效、薪酬、员工关系等模块。制定人力资源规划和人才梯队建设方案，支撑业务发展需求。管理员工入职、离职、转正、调岗等人事流程，确保合规操作。推动企业文化建设，提升员工满意度和归属感。要求5年以上HR经验，熟悉劳动法律法规，具备OD/TD经验优先。',
NOW()::text),

('kaixuan', 'role-fa-admin', '行政主管',
'负责公司行政事务管理，包括办公环境维护、办公用品采购、资产管理等。管理行政团队（前台、保洁、保安、司机），保障公司日常运营。策划员工活动和福利方案，提升员工体验。管理公司证件和印章，对接物业和政府相关部门。要求2年以上行政管理经验，执行力强，注重细节。',
NOW()::text),

('kaixuan', 'role-fa-legal', '法务专员',
'负责企业合同审核和法律风险防范，审核各类业务合同、协议和法律文件。处理知识产权（商标、专利、著作权）的申请和维护。管理企业法律纠纷和诉讼事务，对接外部律师团队。进行法律培训和合规宣传，提升全员法律意识。要求法学专业背景，通过司法考试优先，有企业法务经验。',
NOW()::text);

INSERT INTO permission (owner, name, display_name, description, created_time) VALUES
('kaixuan', 'wf-fa-accounting', '财务核算', '凭证录入→账务处理→报表编制→审计配合', NOW()::text),
('kaixuan', 'wf-fa-budget', '预算管理', '预算编制→执行监控→差异分析→预算调整', NOW()::text),
('kaixuan', 'wf-fa-hr', '人事管理', '招聘需求→候选人筛选→入职培训→绩效评估', NOW()::text);

INSERT INTO permission_rule (ptype, v0, v1, v2) VALUES
('p', 'wf-fa-accounting', 'role-fa-accountant', 'role-fa-tax-specialist'),
('p', 'wf-fa-accounting', 'role-fa-cfo', ''),
('p', 'wf-fa-budget', 'role-fa-cfo', 'role-fa-accountant'),
('p', 'wf-fa-hr', 'role-fa-hr-manager', 'role-fa-admin');

-- ============================================================================
-- 验证汇总
-- ============================================================================
\echo ''
\echo '============================================'
\echo '  组织模板初始化完成'
\echo '============================================'

SELECT '--- 组织 ---' as section;
SELECT name, display_name FROM organization WHERE name LIKE 'org-%' ORDER BY name;

SELECT '--- 角色总数 ---' as section;
SELECT COUNT(*) as total_roles FROM role WHERE owner = 'kaixuan' AND name LIKE 'role-%' AND name NOT LIKE 'role-dev-%' AND name NOT LIKE 'role-cto%' AND name NOT LIKE 'role-device%' AND name NOT LIKE 'role-task%' AND name NOT LIKE 'role-project%' AND name NOT LIKE 'role-vue%' AND name NOT LIKE 'role-java%' AND name NOT LIKE 'role-go%' AND name NOT LIKE 'role-db-spec%' AND name NOT LIKE 'role-frontend-test%' AND name NOT LIKE 'role-backend-test%' AND name NOT LIKE 'role-devops-arch%' AND name NOT LIKE 'role-security%' AND name NOT LIKE 'role-doc-req%' AND name NOT LIKE 'role-qa-spec%' AND name NOT LIKE 'role-ops%' AND name NOT LIKE 'role-agent%' AND name NOT LIKE 'role-news%' AND name NOT LIKE 'role-mail%';

SELECT '--- 工作流 ---' as section;
SELECT name, display_name FROM permission WHERE owner = 'kaixuan' AND name LIKE 'wf-%' ORDER BY name;
