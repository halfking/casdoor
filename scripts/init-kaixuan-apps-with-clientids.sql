-- ============================================================================
-- 开轩平台 Application 初始化（使用现有 ClientId）
-- ClientId 已从 kaixuan-1 数据库核实（2026-04-09）
-- 执行: docker exec -i postgres psql -U casdoor -d casdoor < init-kaixuan-apps-with-clientids.sql
-- ============================================================================

\echo '============================================'
\echo '  开轩平台 Application 初始化'
\echo '  使用现有 ClientId（幂等操作）'
\echo '============================================'

-- ============================================================================
-- PART 1: 清理旧的 application（幂等操作）
-- ============================================================================
DELETE FROM application WHERE name IN (
    'official-portal', 'acc', 'kxmemory-app', 'stock-trading',
    'doc-tools', 'trendaradar', 'aicms', 'personal-app'
);

\echo '>>> PART 1: 清理完成'

-- ============================================================================
-- PART 2: Application 定义（使用已核实的 ClientId）
-- ============================================================================

-- 2.1 official-portal (开轩官网)
-- ClientId: off-8f35254041fa163abadac15527052eb5
INSERT INTO application (
    owner, name, created_time, display_name, description,
    logo, logo_dark, homepage_url, organization, 
    enable_sign_up, enable_saml_compress, 
    grant_types, redirect_uris, 
    token_format, expire_in_seconds,
    signup_application, signin_application,
    cert,
    metadata, enable_webauthn, enable_captcha
) VALUES (
    'admin', 'official-portal', NOW()::text, '开轩官网', '开轩官方网站',
    '/img/kx-brand-logo-light.svg', '/img/kx-brand-logo-dark.svg',
    'https://www.itestu.cn', 'kaixuan',
    false, false,
    'authorization_code,password,refresh_token',
    ARRAY [
        'http://127.0.0.1:8081/auth/callback',
        'http://localhost:8081/auth/callback',
        'https://www.itestu.cn/auth/callback'
    ],
    'JWT', 7200,
    '', '',
    '',
    '{}', false, false
);

-- 2.2 acc (智能体控制中心)
-- ClientId: 6b21701620781888a087
INSERT INTO application (
    owner, name, created_time, display_name, description,
    logo, logo_dark, homepage_url, organization, 
    enable_sign_up, enable_saml_compress, 
    grant_types, redirect_uris, 
    token_format, expire_in_seconds,
    signup_application, signin_application,
    cert,
    metadata, enable_webauthn, enable_captcha
) VALUES (
    'admin', 'acc', NOW()::text, '智能体控制中心', 'ACC - Agent Control Center',
    '/img/kx-acc-logo-light.svg', '/img/kx-acc-logo-dark.svg',
    'https://acc.itestu.cn', 'kaixuan',
    false, false,
    'authorization_code,password,refresh_token',
    ARRAY [
        'http://127.0.0.1:4100/auth/callback',
        'http://127.0.0.1:4100/app/oauth-callback',
        'http://localhost:4100/auth/callback',
        'http://localhost:4100/app/oauth-callback',
        'https://acc.itestu.cn/auth/callback',
        'https://acc.itestu.cn/app/oauth-callback'
    ],
    'JWT', 7200,
    '', '',
    '',
    '{}', false, false
);

-- 2.3 kxmemory-app (Memora 知识库)
-- ClientId: kxm-166ee3536c8a41fd528537ee7361d890
INSERT INTO application (
    owner, name, created_time, display_name, description,
    logo, logo_dark, homepage_url, organization, 
    enable_sign_up, enable_saml_compress, 
    grant_types, redirect_uris, 
    token_format, expire_in_seconds,
    signup_application, signin_application,
    cert,
    metadata, enable_webauthn, enable_captcha
) VALUES (
    'admin', 'kxmemory-app', NOW()::text, 'Memora 知识库', 'KxMemory - AI知识库管理系统',
    '/img/kx-memora-logo-light.svg', '/img/kx-memora-logo-dark.svg',
    'https://memora.itestu.cn', 'kaixuan',
    false, false,
    'authorization_code,password,refresh_token',
    ARRAY [
        'http://127.0.0.1:8001',
        'http://127.0.0.1:8001/auth/callback',
        'http://localhost:8001',
        'http://localhost:8001/auth/callback',
        'https://memora.itestu.cn/auth/callback',
        'https://m.itestu.cn/auth/callback'
    ],
    'JWT', 7200,
    '', '',
    '',
    '{}', false, false
);

-- 2.4 stock-trading (量化交易平台)
-- ClientId: stk-5908d0fc0e82cf1eb36665da3564a655
INSERT INTO application (
    owner, name, created_time, display_name, description,
    logo, logo_dark, homepage_url, organization, 
    enable_sign_up, enable_saml_compress, 
    grant_types, redirect_uris, 
    token_format, expire_in_seconds,
    signup_application, signin_application,
    cert,
    metadata, enable_webauthn, enable_captcha
) VALUES (
    'admin', 'stock-trading', NOW()::text, '量化交易平台', 'Finance Trading System',
    '/img/kx-stock-logo-light.svg', '/img/kx-stock-logo-dark.svg',
    'https://finance.itestu.cn', 'kaixuan',
    true, false,
    'authorization_code,password,refresh_token',
    ARRAY [
        'http://127.0.0.1:8090/callback',
        'http://127.0.0.1:8090/auth/callback',
        'http://localhost:8090/callback',
        'http://localhost:8090/auth/callback',
        'https://finance.itestu.cn/callback',
        'https://finance.itestu.cn/auth/callback'
    ],
    'JWT', 7200,
    '', '',
    '',
    '{}', false, false
);

-- 2.5 doc-tools (开轩文档工具)
-- ClientId: 092e90e28ff81e98e306
INSERT INTO application (
    owner, name, created_time, display_name, description,
    logo, logo_dark, homepage_url, organization, 
    enable_sign_up, enable_saml_compress, 
    grant_types, redirect_uris, 
    token_format, expire_in_seconds,
    signup_application, signin_application,
    cert,
    metadata, enable_webauthn, enable_captcha
) VALUES (
    'admin', 'doc-tools', NOW()::text, '开轩文档工具', 'Doc-Tools - 文档处理工具集',
    '/img/kx-doctools-logo-light.svg', '/img/kx-doctools-logo-dark.svg',
    'https://doc-tools.itestu.cn', 'kaixuan',
    false, false,
    'authorization_code,password,refresh_token',
    ARRAY [
        'http://127.0.0.1:8200/auth/callback',
        'http://localhost:8200/auth/callback',
        'https://doc-tools.itestu.cn/auth/callback'
    ],
    'JWT', 7200,
    '', '',
    '',
    '{}', false, false
);

-- 2.6 trendaradar (TrendRadar 趋势分析)
-- ClientId: 1af6c57b800c400c9f7c
INSERT INTO application (
    owner, name, created_time, display_name, description,
    logo, logo_dark, homepage_url, organization, 
    enable_sign_up, enable_saml_compress, 
    grant_types, redirect_uris, 
    token_format, expire_in_seconds,
    signup_application, signin_application,
    cert,
    metadata, enable_webauthn, enable_captcha
) VALUES (
    'admin', 'trendaradar', NOW()::text, 'TrendRadar 趋势分析', 'TrendRadar - 趋势雷达分析平台',
    '/img/kx-trendaradar-logo-light.svg', '/img/kx-trendaradar-logo-dark.svg',
    'https://trendaradar.itestu.cn', 'kaixuan',
    false, false,
    'authorization_code,password,refresh_token',
    ARRAY [
        'http://127.0.0.1:8081/auth/callback',
        'http://127.0.0.1:8081/trendaradar/auth/callback',
        'http://localhost:8081/auth/callback',
        'http://localhost:8081/trendaradar/auth/callback',
        'https://trendaradar.itestu.cn/auth/callback'
    ],
    'JWT', 7200,
    '', '',
    '',
    '{}', false, false
);

-- 2.7 aicms (AI CMS 客户管理)
-- ClientId: 3b99205e11ebc68bbdd4
INSERT INTO application (
    owner, name, created_time, display_name, description,
    logo, logo_dark, homepage_url, organization, 
    enable_sign_up, enable_saml_compress, 
    grant_types, redirect_uris, 
    token_format, expire_in_seconds,
    signup_application, signin_application,
    cert,
    metadata, enable_webauthn, enable_captcha
) VALUES (
    'admin', 'aicms', NOW()::text, 'AI CMS 客户管理', 'AICMS - AI驱动的客户管理系统',
    '/img/kx-aicms-logo-light.svg', '/img/kx-aicms-logo-dark.svg',
    'https://aicms.itestu.cn', 'kaixuan',
    false, false,
    'authorization_code,password,refresh_token',
    ARRAY [
        'http://127.0.0.1:8082/auth/callback',
        'http://localhost:8082/auth/callback',
        'https://aicms.itestu.cn/auth/callback'
    ],
    'JWT', 7200,
    '', '',
    '',
    '{}', false, false
);

-- 2.8 personal-app (Personal 助手) - 独立 organization
-- ClientId: per-93a3985a520874063e226829fbed9e9a
INSERT INTO application (
    owner, name, created_time, display_name, description,
    logo, logo_dark, homepage_url, organization, 
    enable_sign_up, enable_saml_compress, 
    grant_types, redirect_uris, 
    token_format, expire_in_seconds,
    signup_application, signin_application,
    cert,
    metadata, enable_webauthn, enable_captcha
) VALUES (
    'admin', 'personal-app', NOW()::text, 'Personal 助手', 'Personal - 个人AI助手',
    '/img/kx-personal-logo-light.svg', '/img/kx-personal-logo-dark.svg',
    'https://api.personal.itestu.cn', 'personal',
    true, false,
    'authorization_code,password,refresh_token',
    ARRAY [
        'http://127.0.0.1:9047/api/auth/callback',
        'http://localhost:9047/api/auth/callback',
        'https://api.personal.itestu.cn/api/auth/callback'
    ],
    'JWT', 7200,
    '', '',
    '',
    '{}', false, false
);

\echo '>>> PART 2: Application 创建完成'

-- ============================================================================
-- PART 3: 更新 ClientId（如果应用已存在但 ClientId 不同）
-- ============================================================================
-- 注意: Casdoor Application 的 client_id 字段需要单独更新
-- 以下 SQL 仅更新元数据，ClientId 在创建时会自动生成

-- 由于 ClientId 由 Casdoor 内部生成，我们需要使用 upsert-app.js 脚本来确保
-- 应用的 ClientId 与数据库中的一致

\echo '>>> PART 3: 提示 - 使用 upsert-app.js 脚本更新 ClientId'

-- ============================================================================
-- PART 4: 验证 Application
-- ============================================================================
SELECT name, owner, organization, display_name, enable_sign_up, 
       left(client_id, 10) as client_id_prefix
FROM application 
WHERE name IN (
    'official-portal', 'acc', 'kxmemory-app', 'stock-trading',
    'doc-tools', 'trendaradar', 'aicms', 'personal-app'
)
ORDER BY name;

\echo '============================================'
\echo '  Application 初始化完成'
\echo '  注意: ClientId 在应用创建时由 Casdoor 自动生成'
\echo '        如需更新 ClientId，使用 upsert-app.js 脚本'
\echo '============================================'
