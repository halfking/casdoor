-- ============================================================================
-- 已弃用：此脚本不再作为 Casdoor Application 初始化入口
-- 请改用 scripts/apply-platform-config.sh --env-file deployment/platform.env
-- 原因：真相源已统一到 deployment/platform-app-registry.json + deployment/platform.env + init_data.json.template
-- ============================================================================

\echo 'ERROR: scripts/init-kaixuan-applications.sql 已弃用，禁止继续执行。'
\echo '请执行: scripts/apply-platform-config.sh --env-file deployment/platform.env --verify-db'
\quit 1
