-- ============================================================================
-- 开轩平台 Provider 初始化
-- 包含: kaixuan SMS Provider (阿里云) + kaixuan Email Provider (QQ企业邮箱)
-- 执行: docker exec -i postgres psql -U casdoor -d casdoor < init-kaixuan-providers.sql
-- ============================================================================

\echo '============================================'
\echo '  开轩平台 Provider 初始化'
\echo '  SMS: 阿里云短信 | Email: QQ企业邮箱'
\echo '============================================'

-- ============================================================================
-- PART 1: 清理旧的 kaixuan Provider（如果存在）
-- ============================================================================
DELETE FROM provider WHERE owner = 'kaixuan' AND name LIKE 'provider-kaixuan-%';

\echo '>>> PART 1: 清理完成'

-- ============================================================================
-- PART 2: SMS Provider - 阿里云短信
-- ============================================================================
-- 说明: 使用 go-sms-sender 原生支持的 Aliyun SMS 类型
-- 配置项:
--   - Client Id: AccessKey ID
--   - Client Secret: AccessKey Secret
--   - Sign Name: 短信签名（需在阿里云审核通过）
--   - Template Code: 短信模板ID（需在阿里云审核通过，模板中需包含 ${code} 变量）

INSERT INTO provider (
    owner, name, created_time,
    display_name, category, type,
    client_id, client_secret,
    sign_name, template_code,
    host, port
) VALUES (
    'kaixuan', 'provider-kaixuan-sms-aliyun', NOW()::text,
    '开轩平台-阿里云短信', 'SMS', 'Aliyun SMS',
    '${ALIBABA_CLOUD_ACCESS_KEY_ID}', '${ALIBABA_CLOUD_ACCESS_KEY_SECRET}',
    '开轩科技', 'SMS_${YOUR_TEMPLATE_CODE}',
    '', 0
);

\echo '>>> PART 2: 阿里云短信 Provider 创建完成'

-- ============================================================================
-- PART 3: Email Provider - QQ企业邮箱
-- ============================================================================
-- 说明: 使用标准 SMTP 协议
-- 配置项:
--   - Client Id: 发件人邮箱地址
--   - Client Secret: QQ邮箱授权码（不是登录密码）
--   - Host: smtp.exmail.qq.com
--   - Port: 465 (SSL)
--   - Ssl Mode: Enable

INSERT INTO provider (
    owner, name, created_time,
    display_name, category, type,
    client_id, client_secret,
    host, port, ssl_mode,
    disable_ssl
) VALUES (
    'kaixuan', 'provider-kaixuan-email-qqent', NOW()::text,
    '开轩平台-QQ企业邮箱', 'Email', 'Default',
    '${QQ_ENTERPRISE_EMAIL}', '${QQ_ENTERPRISE_AUTH_CODE}',
    'smtp.exmail.qq.com', 465, 'Enable',
    false
);

\echo '>>> PART 3: QQ企业邮箱 Provider 创建完成'

-- ============================================================================
-- PART 4: 验证 Provider
-- ============================================================================
SELECT owner, name, display_name, category, type, sign_name, template_code, host, port, ssl_mode
FROM provider 
WHERE owner = 'kaixuan' 
ORDER BY category, name;

\echo '============================================'
\echo '  Provider 初始化完成'
\echo '============================================'

-- ============================================================================
-- 使用说明:
-- ============================================================================
-- 1. 阿里云短信配置:
--    - 登录 https://dysms.console.aliyun.com/
--    - 创建短信签名（需审核）
--    - 创建短信模板（需审核），模板内容: 您的验证码是：${code}，5分钟内有效。
--    - 获取 AccessKey ID 和 AccessKey Secret
--    - 将 ${ALIBABA_CLOUD_ACCESS_KEY_ID} 等替换为实际值
--
-- 2. QQ企业邮箱配置:
--    - 登录 https://exmail.qq.com/
--    - 开通 SMTP 服务
--    - 设置授权码（不是登录密码）
--    - 将 ${QQ_ENTERPRISE_EMAIL} 等替换为实际值
-- ============================================================================
