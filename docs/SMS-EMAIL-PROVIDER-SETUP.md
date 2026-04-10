# 验证码发送服务配置指南

Casdoor 原生支持阿里云短信和 QQ 企业邮箱，无需编写额外代码。

---

## 1. 阿里云短信配置

### 1.1 阿里云控制台准备

1. 登录 [阿里云短信服务](https://dysms.console.aliyun.com/)
2. 创建短信签名（需要审核）
3. 创建短信模板（需要审核）
4. 获取 AccessKey ID 和 AccessKey Secret

### 1.2 参数说明

| 字段 | 值 | 说明 |
|------|-----|------|
| Category | `SMS` | Provider 类别 |
| Type | `Aliyun SMS` | 使用 go-sms-sender 原生支持 |
| Client Id | 你的 AccessKey ID | 阿里云 AccessKey ID |
| Client Secret | 你的 AccessKey Secret | 阿里云 AccessKey Secret |
| Sign Name | `你的短信签名` | 必须在阿里云审核通过 |
| Template Code | `SMS_xxxxxxxxx` | 阿里云审核通过的模板ID |
| Region Id | `cn-hangzhou` | 默认值（可省略）|

### 1.3 短信模板要求

模板内容必须包含验证码变量，格式示例：
```
您的验证码是：${code}，5分钟内有效。
```

Casdoor 发送时会将 `${code}` 或 `code` 替换为实际验证码。

---

## 2. QQ 企业邮箱配置

### 2.1 QQ 企业邮箱控制台准备

1. 登录 [QQ 邮箱管理后台](https://exmail.qq.com/)
2. 开通 SMTP 服务
3. 设置授权码（不是登录密码）

### 2.2 参数说明

| 字段 | 值 | 说明 |
|------|-----|------|
| Category | `Email` | Provider 类别 |
| Type | `Default` 或留空 | 使用标准 SMTP |
| Client Id | `your-email@domain.com` | 发件人邮箱地址 |
| Client Secret | `your-auth-code` | QQ 邮箱授权码（不是密码）|
| Host | `smtp.exmail.qq.com` | QQ 企业邮箱 SMTP 服务器 |
| Port | `465` | SMTP 端口（SSL）|
| Ssl Mode | `Enable` | 启用 SSL 加密 |

### 2.3 授权码获取

1. 登录 QQ 邮箱网页版
2. 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务
3. 开启 SMTP 服务
4. 生成授权码

---

## 3. Casdoor Provider 创建步骤

### 3.1 创建阿里云短信 Provider

```bash
# 通过 Casdoor UI:
# 1. 进入 "Providers" 页面
# 2. 点击 "Add Provider"
# 3. 选择 Category: "SMS"
# 4. 填写上述参数
```

### 3.2 创建 QQ 企业邮箱 Provider

```bash
# 通过 Casdoor UI:
# 1. 进入 "Providers" 页面
# 2. 点击 "Add Provider"
# 3. 选择 Category: "Email"
# 4. 填写上述参数
```

---

## 4. 应用绑定 Provider

创建 Provider 后，需要将其绑定到 Application：

1. 进入 Application 管理页面
2. 编辑目标 Application
3. 在 "Providers" 配置中添加已创建的 Provider
4. 保存

---

## 5. 测试验证

### 5.1 测试短信发送

```bash
curl -X POST "http://localhost:9000/api/send-verification-code" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sms",
    "provider": "provider-name",
    "phone": "13800138000"
  }'
```

### 5.2 测试邮件发送

```bash
curl -X POST "http://localhost:9000/api/send-email" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "provider-name",
    "receiver": "test@example.com",
    "title": "Test",
    "content": "Your code is: 123456"
  }'
```

---

## 6. 故障排查

### 短信问题

| 问题 | 解决方案 |
|------|----------|
| 签名未审核 | 阿里云控制台完成签名审核 |
| 模板未审核 | 阿里云控制台完成模板审核 |
| AccessKey 无权限 | 检查 RAM 用户权限策略 |

### 邮件问题

| 问题 | 解决方案 |
|------|----------|
| 连接失败 | 检查 Host/Port/SslMode 配置 |
| 认证失败 | 确认使用授权码而非登录密码 |
| 端口被禁 | 尝试 587 端口（TLS）|

---

## 7. 相关代码

- 短信发送: [`object/sms.go`](object/sms.go)
- 邮件发送: [`email/smtp.go`](email/smtp.go)
- Provider 管理: [`object/provider.go`](object/provider.go)
