<h1 align="center" style="border-bottom: none;">📦⚡️ Casdoor</h1>

<h3 align="center">开源的 AI 优先身份管理和访问控制 (IAM) 平台 / AI MCP 网关及认证服务器，支持 Web UI，集成 MCP、A2A、OAuth 2.1、OIDC、SAML、CAS、LDAP、SCIM、WebAuthn、TOTP、MFA、人脸识别、Google Workspace、Azure AD</h3>

<p align="center">
  <a href="#badge">
    <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
  </a>
  <a href="https://hub.docker.com/r/casbin/casdoor">
    <img alt="docker pull casbin/casdoor" src="https://img.shields.io/docker/pulls/casbin/casdoor.svg">
  </a>
  <a href="https://github.com/casdoor/casdoor/actions/workflows/build.yml">
    <img alt="GitHub Workflow Status (branch)" src="https://github.com/casdoor/casdoor/workflows/Build/badge.svg?style=flat-square">
  </a>
  <a href="https://github.com/casdoor/casdoor/releases/latest">
    <img alt="GitHub Release" src="https://img.shields.io/github/v/release/casdoor/casdoor.svg">
  </a>
  <a href="https://hub.docker.com/r/casbin/casdoor">
    <img alt="Docker Image Version (latest semver)" src="https://img.shields.io/badge/Docker%20Hub-latest-brightgreen">
  </a>
</p>

<p align="center">
  <a href="https://goreportcard.com/report/github.com/casdoor/casdoor">
    <img alt="Go Report Card" src="https://goreportcard.com/badge/github.com/casdoor/casdoor?style=flat-square">
  </a>
  <a href="https://github.com/casdoor/casdoor/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/casdoor/casdoor?style=flat-square" alt="license">
  </a>
  <a href="https://github.com/casdoor/casdoor/issues">
    <img alt="GitHub issues" src="https://img.shields.io/github/issues/casdoor/casdoor?style=flat-square">
  </a>
  <a href="#">
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/casdoor/casdoor?style=flat-square">
  </a>
  <a href="https://github.com/casdoor/casdoor/network">
    <img alt="GitHub forks" src="https://img.shields.io/github/forks/casdoor/casdoor?style=flat-square">
  </a>
  <a href="https://crowdin.com/project/casdoor-site">
    <img alt="Crowdin" src="https://badges.crowdin.net/casdoor-site/localized.svg">
  </a>
  <a href="https://discord.gg/5rPsrAzK7S">
    <img alt="Discord" src="https://img.shields.io/discord/1022748306096537660?style=flat-square&logo=discord&label=discord&color=5865F2">
  </a>
</p>

## 在线演示

- 只读站点: https://door.casdoor.com (任何修改操作将会失败)
- 可写站点: https://demo.casdoor.com (每5分钟会重置原始数据)

## 文档

https://casdoor.org/zh

## 安装

- 源码安装: https://casdoor.org/zh/docs/basic/server-installation
- Docker 安装: https://casdoor.org/zh/docs/basic/try-with-docker
- Kubernetes Helm 安装: https://casdoor.org/zh/docs/basic/try-with-helm

## 核心特性

### 认证协议

| 协议 | 描述 |
|------|------|
| **OAuth 2.1** | 最新一代 OAuth 协议，支持 PKCE 授权码流程 |
| **OIDC** | OpenID Connect 身份认证，支持发现和动态客户端注册 |
| **SAML 2.0** | 企业级单点登录协议，支持 IdP 和 SP 模式 |
| **CAS** | Central Authentication Service 协议，支持代理认证 |
| **LDAP/AD** | 目录服务集成，支持 Active Directory 自动同步 |
| **SCIM 2.0** | 用户 provisioning 标准，支持跨系统同步 |

### 多因素认证 (MFA)

| 类型 | 描述 |
|------|------|
| **TOTP** | 基于时间的一次性密码 (Google Authenticator, Authy 等) |
| **短信验证码** | 手机短信验证码认证 |
| **邮件验证码** | 邮箱验证码认证 |
| **推送通知** | 移动端推送确认 (基于 Plextrac, Tencent Cloud) |
| **WebAuthn/FIDO2** | 硬件密钥认证 (YubiKey,指纹等) |
| **人脸识别** | 阿里云人脸识别集成 |
| **RADIUS** | 远程用户拨号认证系统集成 |

### 第三方登录

支持主流 OAuth/OIDC 提供商: Google、GitHub、Facebook、Twitter、LinkedIn、QQ、微信、企业微信、钉钉、支付宝、Bilibili、百度、小红书、Discord、Telegram、MetaMask、Web3 等

### 支付集成

支持 Stripe、PayPal、Alipay、微信支付、Paddle、LemonSqueezy、Adyen、Airwallex、FastSpring、Polar、GC 等

### 用户同步

支持从以下系统同步用户: Active Directory、LDAP、Keycloak、Okta、Google Workspace、企业微信、钉钉、飞书、AWS IAM、数据库、SCIM 2.0

## 新增特性

### 企业级功能扩展

| 特性 | 描述 |
|------|------|
| **多租户支持** | 支持组织层级管理、条块管理和多租户架构 |
| **岗位管理** | 精细化的岗位和部门管理 |
| **数据权限** | 基于角色的行级数据权限控制 |
| **菜单权限** | 精细化的菜单和页面访问控制 |
| **条块归属** | 支持用户的多维度组织归属 |

### 安全增强

| 特性 | 描述 |
|------|------|
| **密码复杂度检查** | 自定义密码强度规则 |
| **密码过期策略** | 自动密码过期和强制更改 |
| **IP 黑/白名单** | 基于 IP 的访问控制 |
| **WAF 防护** | Web 应用防火墙规则 |
| **用户代理过滤** | 基于浏览器/设备的访问控制 |
| **速率限制** | 基于 IP 和用户的请求限流 |

### 通知与集成

| 特性 | 描述 |
|------|------|
| **Webhook** | 事件驱动的 HTTP 回调集成 |
| **Prometheus 监控** | API 性能指标导出 |
| **邮件通知** | SMTP、SendGrid、Resend、阿里云邮件推送 |
| **短信通知** | 多渠道短信服务集成 |
| **证书管理** | 自定义 X.509 证书和自动续期 |

### 扩展能力

| 特性 | 描述 |
|------|------|
| **动态客户端注册 (DCR)** | RFC 7591 动态客户端注册 |
| **设备授权流程** | RFC 8628 设备授权码流 |
| **Kerberos 认证** | Windows 域集成 |
| **服务账号** | 支持程序化 API 访问 |
| **邀请注册** | 邮件邀请用户注册 |
| **订阅管理** | 产品定价和订阅周期管理 |

## 如何连接 Casdoor?

https://casdoor.org/zh/docs/how-to-connect/overview

## Casdoor 公共 API

- 文档: https://casdoor.org/zh/docs/basic/public-api
- Swagger: https://door.casdoor.com/swagger

## 集成

https://casdoor.org/zh/docs/category/integrations

## 联系方式

- Discord: https://discord.gg/5rPsrAzK7S
- 帮助: https://casdoor.org/help

## 贡献指南

对于 Casdoor 项目，如果您有任何问题，可以提交 Issue，也可以直接提交 Pull Request（但我们建议先提交 Issue 以便与社区沟通）。

### 国际化翻译

如果您为 Casdoor 做贡献，请注意我们使用 [Crowdin](https://crowdin.com/project/casdoor-site) 作为翻译平台，使用 i18next 作为翻译工具。当您在 `web/` 目录下使用 i18next 添加词汇时，请记得将添加的内容同步到 `web/src/locales/en/data.json` 文件。

## 许可证

[Apache-2.0](https://github.com/casdoor/casdoor/blob/master/LICENSE)