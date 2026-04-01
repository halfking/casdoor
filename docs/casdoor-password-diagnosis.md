# Casdoor密码和Token问题诊断报告

## 🔍 问题发现

### 配置不一致

**1. init_data.json中的配置（实际使用的）**:
```
用户: admin
密码: Veritrans&9527*#

ACC应用:
  client_id: a7e2fa70893f8552a602
  client_secret: dfd7a5b184496fd6938a1db3a386b053358d4c9e
```

**2. .env文件中的配置（环境变量）**:
```
CASDOOR_ACC_CLIENT_ID=321293c1a247e3bb6ab1
CASDOOR_ACC_CLIENT_SECRET=a5a70e6c3da6f2d62b342842381ae598e0cad544
```

**❌ 问题**: 这两个配置完全不匹配！

---

## 📋 当前密码清单

### 数据库密码
- ✅ PostgreSQL主密码: `KxDB2026@89dc29916136`
- ✅ Casdoor数据库密码: `KxCASDB2026@19272ac109f0`

### Casdoor配置（实际值）
- ✅ admin用户密码: `Veritrans&9527*#`
- ✅ ACC client_id: `a7e2fa70893f8552a602`
- ✅ ACC client_secret: `dfd7a5b184496fd6938a1db3a386b053358d4c9e`

### 其他服务密钥
- Stock client_id: `6fd1b9bbf2dd64ae0c7d`
- Stock client_secret: `24bfed8728c64c01d115f5128978271f48115b38`
- 内部服务密钥: `internal_2026_secret`（临时API）

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

## 🚀 推荐执行步骤（方案1）

### 步骤1: 更新.env文件

```bash
cd ~/workspace/official-deploy
vi .env
```

修改内容:
```bash
# 统一密码方案
DB_PASSWORD=Kaixuan2026@Pg
CASDOOR_DB_PASS=Kaixuan2026@Casdoor

CASDOOR_ACC_CLIENT_ID=acc_client_2026
CASDOOR_ACC_CLIENT_SECRET=Kaixuan2026@ACC
CASDOOR_STOCK_CLIENT_ID=stock_client_2026
CASDOOR_STOCK_CLIENT_SECRET=Kaixuan2026@Stock
CASDOOR_KXMEMORY_CLIENT_ID=kxmemory_client_2026
CASDOOR_KXMEMORY_CLIENT_SECRET=Kaixuan2026@KxMemory

INTERNAL_SERVICE_SECRET=Kaixuan2026@Internal
```

### 步骤2: 更新init_data.json

```bash
cd ~/workspace/official-deploy/services/casdoor
vi init_data.json
```

修改内容:
1. 用户密码: `Veritrans&9527*#` → `Kaixuan2026@Admin`
2. 客户端ID和密钥: 改为与.env一致

### 步骤3: 重启服务

```bash
cd ~/workspace/official-deploy
docker-compose down
docker-compose up -d
```

### 步骤4: 验证登录

```bash
# 测试admin登录
curl -X POST https://auth.itestu.cn/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "organization":"kaixuan",
    "username":"admin",
    "password":"Kaixuan2026@Admin"
  }'
```

---

## 📊 密码映射表

### 当前 → 统一后

| 当前值 | 统一后 | 用途 |
|--------|--------|------|
| `Veritrans&9527*#` | `Kaixuan2026@Admin` | admin用户 |
| `KxDB2026@89dc29916136` | `Kaixuan2026@Pg` | PostgreSQL |
| `KxCASDB2026@19272ac109f0` | `Kaixuan2026@Casdoor` | Casdoor DB |
| `dfd7a5b184496fd6938a1db3a386b053358d4c9e` | `Kaixuan2026@ACC` | ACC密钥 |
| `24bfed8728c64c01d115f5128978271f48115b38` | `Kaixuan2026@Stock` | Stock密钥 |
| `internal_2026_secret` | `Kaixuan2026@Internal` | 内部API |

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