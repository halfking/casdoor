# Casdoor密码和Token问题诊断报告

> 归档说明：本文档保留问题诊断思路，不再作为密码、clientId、clientSecret 的真实值来源。
> 当前唯一标准入口为 `deployment/platform.env` 和 `docs/platform-config-standard.md`。

## 🔍 问题发现

### 配置不一致

**1. init_data.json中的配置（当时观察到的旧样本）**:
```
用户: admin
密码: <masked-admin-password>

ACC应用:
  client_id: <masked-acc-client-id>
  client_secret: <masked-acc-client-secret>
```

**2. .env文件中的配置（当时观察到的旧样本）**:
```
CASDOOR_ACC_CLIENT_ID=<masked-legacy-acc-client-id>
CASDOOR_ACC_CLIENT_SECRET=<masked-legacy-acc-client-secret>
```

**❌ 问题**: 这两个配置完全不匹配！

---

## 📋 当前密码清单

### 数据库密码
- ✅ PostgreSQL主密码: `<masked-postgres-password>`
- ✅ Casdoor数据库密码: `<masked-casdoor-db-password>`

### Casdoor配置（旧样本）
- ✅ admin用户密码: `<masked-admin-password>`
- ✅ ACC client_id: `<masked-acc-client-id>`
- ✅ ACC client_secret: `<masked-acc-client-secret>`

### 其他服务密钥
- Stock client_id: `<masked-stock-client-id>`
- Stock client_secret: `<masked-stock-client-secret>`
- 内部服务密钥: `<masked-internal-service-secret>`

---

## ✅ 统一解决方案

### 方案1: 统一为简单密码（推荐）

**格式**: `Kaixuan2026@{用途}`

| 服务类型 | 建议密码 | 说明 |
|---------|---------|------|
| **用户密码** |
| admin | `Kaixuan2026@Admin` | 管理员 |
| 普通用户 | `Kaixuan2026@User` | 普通用户 |
| **数据库** |
| PostgreSQL | `Kaixuan2026@Pg` | 主数据库 |
| Casdoor DB | `Kaixuan2026@Casdoor` | Casdoor专用 |
| **客户端密钥** |
| ACC | `Kaixuan2026@ACC` | ACC应用 |
| KxMemory | `Kaixuan2026@KxMemory` | KxMemory应用 |
| Stock | `Kaixuan2026@Stock` | Stock应用 |
| **服务密钥** |
| 内部API | `Kaixuan2026@Internal` | 内部服务 |

---

### 方案2: 保持现有密码（兼容性好）

只修改**不一致**的部分，其他保持不变。

**需要修改的**:
1. `.env`文件中的client_id和client_secret
2. 应用配置中引用这些变量的地方

---

## 🚀 修正后的推荐执行步骤

### 步骤1: 更新 deployment/platform.env

```bash
cd ~/workspace/official-deploy/services/casdoor
cp deployment/platform.env.example deployment/platform.env
vi deployment/platform.env
```

修改内容:
```bash
CASDOOR_ADMIN_PASS=<real-admin-password>
CASDOOR_CLIENT_ID=<real-acc-client-id>
CASDOOR_CLIENT_SECRET=<real-acc-client-secret>
CASDOOR_STOCK_CLIENT_ID=<real-stock-client-id>
CASDOOR_STOCK_CLIENT_SECRET=<real-stock-client-secret>
CASDOOR_KXMEMORY_CLIENT_ID=<real-kxmemory-client-id>
CASDOOR_KXMEMORY_CLIENT_SECRET=<real-kxmemory-client-secret>
```

### 步骤2: 渲染并校验 init_data.json

```bash
scripts/render-platform-config.sh --env-file deployment/platform.env
```

### 步骤3: 重启服务

```bash
scripts/apply-platform-config.sh \
  --env-file deployment/platform.env \
  --restart-casdoor \
  --verify-db
```

### 步骤4: 验证登录

```bash
# 测试admin登录
curl -X POST https://auth.itestu.cn/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "organization":"kaixuan",
    "username":"admin",
    "password":"<real-admin-password>"
  }'
```

---

## 📊 密码映射表

### 当前 → 统一后

| 当前值 | 统一后 | 用途 |
|--------|--------|------|
| `<masked-admin-password>` | `<real-admin-password>` | admin用户 |
| `<masked-postgres-password>` | `<real-postgres-password>` | PostgreSQL |
| `<masked-casdoor-db-password>` | `<real-casdoor-db-password>` | Casdoor DB |
| `<masked-acc-client-secret>` | `<real-acc-client-secret>` | ACC密钥 |
| `<masked-stock-client-secret>` | `<real-stock-client-secret>` | Stock密钥 |
| `<masked-internal-service-secret>` | `<real-internal-service-secret>` | 内部API |

---

## ⚠️ 注意事项

1. **备份数据库** - 修改前先备份
2. **同步更新** - .env和init_data.json必须同步
3. **重启服务** - 修改后必须重启
4. **测试验证** - 修改后立即测试登录
5. **通知团队** - 告知所有人新密码

---

## 📝 密码管理建议

1. ✅ 所有密码记录在`.env`文件
2. ✅ `.env`文件不提交Git
3. ✅ 定期更换（每季度）
4. ✅ 使用密码管理器
5. ✅ 生产环境用强密码

---

**报告人**: 龙二（ops-hermes）
**报告时间**: 2026-03-31 10:10
**状态**: 待老板确认方案