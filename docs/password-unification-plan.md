# Casdoor密码和Token统一配置方案

> 归档说明：本文档中的密码与密钥示例已全部去敏，真实部署只允许写入 `deployment/platform.env`，不要再把真实值留在文档里。

## 当前密码清单

### 1. 数据库密码
- **PostgreSQL主密码**: `<masked-postgres-password>`
- **Casdoor数据库密码**: `<masked-casdoor-db-password>`

### 2. Casdoor Client配置
- **ACC客户端ID**: `<masked-acc-client-id>`
- **ACC客户端密钥**: `<masked-acc-client-secret>`
- **Stock客户端ID**: `<masked-stock-client-id>`
- **Stock客户端密钥**: `<masked-stock-client-secret>`

### 3. OpenClaw相关
- **内部服务密钥**: `<masked-internal-service-secret>`

---

## 统一密码方案

### 建议：统一为简单易记的密码

**格式**: `Kaixuan2026@{服务名}`

| 服务 | 建议密码 | 用途 |
|------|---------|------|
| PostgreSQL | `Kaixuan2026@Pg` | 主数据库密码 |
| Casdoor DB | `Kaixuan2026@Casdoor` | Casdoor数据库密码 |
| ACC Client | `Kaixuan2026@ACC` | ACC客户端密钥 |
| KxMemory Client | `Kaixuan2026@KxMemory` | KxMemory客户端密钥 |
| 内部服务 | `Kaixuan2026@Internal` | 内部服务认证 |

### 用户密码

| 用户 | 建议密码 | 用途 |
|------|---------|------|
| admin | `Kaixuan2026@Admin` | 超级管理员 |
| kaixuan | `Kaixuan2026@User` | 普通用户 |

---

## 实施步骤

### 1. 修改 deployment/platform.env
```bash
cd ~/workspace/official-deploy/services/casdoor
cp deployment/platform.env.example deployment/platform.env
vi deployment/platform.env

# 修改以下值
CASDOOR_ADMIN_PASS=<real-admin-password>
CASDOOR_CLIENT_SECRET=<real-acc-client-secret>
CASDOOR_KXMEMORY_CLIENT_SECRET=<real-kxmemory-client-secret>
```

### 2. 渲染 init_data.json
```bash
scripts/render-platform-config.sh --env-file deployment/platform.env
```

### 3. 重启服务
```bash
scripts/apply-platform-config.sh \
  --env-file deployment/platform.env \
  --restart-casdoor \
  --verify-db
```

### 4. 验证登录
```bash
# 验证Casdoor登录
curl -X POST https://auth.itestu.cn/api/login \
  -H "Content-Type: application/json" \
  -d '{"organization":"kaixuan","username":"admin","password":"<real-admin-password>"}'
```

---

## 密码管理策略

1. **所有真实密码存储在 `deployment/platform.env` 中**
2. **`deployment/platform.env` 不提交到 Git**
3. **密码定期更换（每季度）**
4. **生产环境使用强密码**
5. **开发环境可使用简单密码**

---

## 安全建议

1. ✅ 使用环境变量，不硬编码
2. ✅ 定期更换密码
3. ✅ 不同服务使用不同密码
4. ✅ 记录密码变更历史
5. ⚠️ 生产环境使用更复杂的密码

---

**创建时间**: 2026-03-31
**创建人**: 龙二（ops-hermes）