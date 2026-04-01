# Casdoor密码和Token统一配置方案

## 当前密码清单

### 1. 数据库密码
- **PostgreSQL主密码**: `KxDB2026@89dc29916136`
- **Casdoor数据库密码**: `KxCASDB2026@19272ac109f0`

### 2. Casdoor Client配置
- **ACC客户端ID**: `321293c1a247e3bb6ab1`
- **ACC客户端密钥**: `a5a70e6c3da6f2d62b342842381ae598e0cad544`
- **Stock客户端ID**: `6fd1b9bbf2dd64ae0c7d`
- **Stock客户端密钥**: `24bfed8728c64c01d115f5128978271f48115b38`

### 3. OpenClaw相关
- **内部服务密钥**: `internal_2026_secret`

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

### 1. 修改.env文件
```bash
cd ~/workspace/official-deploy
vi .env

# 修改以下值
DB_PASSWORD=Kaixuan2026@Pg
CASDOOR_DB_PASS=Kaixuan2026@Casdoor
CASDOOR_ACC_CLIENT_SECRET=Kaixuan2026@ACC
CASDOOR_KXMEMORY_CLIENT_SECRET=Kaixuan2026@KxMemory
INTERNAL_SERVICE_SECRET=Kaixuan2026@Internal
```

### 2. 修改init_data.json
```bash
cd ~/workspace/official-deploy/services/casdoor
# 修改用户密码和应用密钥
```

### 3. 重启服务
```bash
cd ~/workspace/official-deploy
docker-compose down
docker-compose up -d
```

### 4. 验证登录
```bash
# 验证Casdoor登录
curl -X POST https://auth.itestu.cn/api/login \
  -H "Content-Type: application/json" \
  -d '{"organization":"kaixuan","username":"admin","password":"Kaixuan2026@Admin"}'
```

---

## 密码管理策略

1. **所有密码存储在`.env`文件中**
2. **`.env`文件不提交到Git**
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