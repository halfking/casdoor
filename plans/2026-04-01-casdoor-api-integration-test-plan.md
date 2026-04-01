# Casdoor API 集成测试方案

## 一、项目概述

### 1.1 测试目标
对Casdoor项目中所有REST API进行完整的集成测试，验证各API端点的功能正确性、数据完整性和错误处理能力。

### 1.2 项目技术栈
- **后端框架**: Go + Beego v2
- **数据库**: PostgreSQL 15
- **认证方式**: JWT Token / OAuth2 / SAML / CAS
- **服务端口**: 8000
- **API版本**: v1.503.0

### 1.3 部署环境
```
服务地址: http://localhost:8000 或 http://127.0.0.1:8000
数据库: postgres://casdoor:casdoor2024secure@pms-postgres:5432/casdoor
模式: prod
```

### 1.4 现有测试资源分析
- 已有测试文件: `controllers/authz_bff_test.go`
- 测试框架: Go原生testing + httpx

## 二、API清单与分类（按业务域聚合）

### 2.1 认证域 (Authentication) - 25个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P0 | /api/health | GET | 健康检查 | 无 |
| P0 | /api/login | POST | 用户登录 | 无 |
| P0 | /api/logout | GET/POST | 登出 | 登录 |
| P1 | /api/signup | POST | 用户注册 | 无 |
| P1 | /api/get-account | GET | 获取账户信息 | 登录 |
| P1 | /api/userinfo | GET | 获取用户信息 | 登录 |
| P1 | /api/set-password | POST | 设置密码 | 登录 |
| P1 | /api/check-user-password | POST | 验证密码 | 登录 |
| P1 | /api/send-verification-code | POST | 发送验证码 | 无 |
| P1 | /api/verify-code | POST | 验证验证码 | 无 |
| P1 | /api/verify-captcha | POST | 验证图形验证码 | 无 |
| P1 | /api/get-captcha | GET | 获取图形验证码 | 无 |
| P1 | /api/get-email-and-phone | GET | 获取邮箱和手机号 | 登录 |
| P1 | /api/reset-email-or-phone | POST | 重置邮箱或手机 | 登录 |
| P2 | /api/sso-logout | GET/POST | 单点登出 | 登录 |
| P2 | /api/impersonate-user | POST | 模拟用户 | 登录 |
| P2 | /api/exit-impersonate-user | POST | 退出模拟 | 登录 |
| P2 | /api/webauthn/signup/begin | GET | WebAuthn注册开始 | 无 |
| P2 | /api/webauthn/signup/finish | POST | WebAuthn注册完成 | 上一步 |
| P2 | /api/webauthn/signin/begin | GET | WebAuthn登录开始 | 无 |
| P2 | /api/webauthn/signin/finish | POST | WebAuthn登录完成 | 上一步 |
| P2 | /api/mfa/setup/initiate | POST | MFA设置初始化 | 登录 |
| P2 | /api/mfa/setup/verify | POST | MFA设置验证 | 上一步 |
| P2 | /api/mfa/setup/enable | POST | MFA启用 | 上一步 |
| P2 | /api/delete-mfa | POST | 删除MFA | 登录 |
| P2 | /api/set-preferred-mfa | POST | 设置首选MFA | 登录 |

### 2.2 组织与用户域 (Organization & User) - 20个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P0 | /api/get-organizations | GET | 获取组织列表 | 登录 |
| P0 | /api/get-organization | GET | 获取组织详情 | 登录 |
| P0 | /api/get-users | GET | 获取用户列表 | 登录 |
| P0 | /api/get-user | GET | 获取用户详情 | 登录 |
| P1 | /api/update-organization | POST | 更新组织 | 登录 |
| P1 | /api/add-organization | POST | 添加组织 | 登录 |
| P1 | /api/delete-organization | POST | 删除组织 | 登录 |
| P1 | /api/update-user | POST | 更新用户 | 登录 |
| P1 | /api/add-user | POST | 添加用户 | 登录 |
| P1 | /api/delete-user | POST | 删除用户 | 登录 |
| P1 | /api/get-sorted-users | GET | 获取排序用户列表 | 登录 |
| P1 | /api/get-user-count | GET | 获取用户数量 | 登录 |
| P1 | /api/get-user-application | GET | 获取用户应用 | 登录 |
| P2 | /api/upload-users | POST | 批量上传用户 | 登录 |
| P2 | /api/get-global-users | GET | 获取全局用户 | 登录 |
| P2 | /api/verify-identification | POST | 验证身份 | 登录 |
| P2 | /api/add-user-keys | POST | 添加用户密钥 | 登录 |
| P2 | /api/remove-user-from-group | POST | 从组移除用户 | 登录 |

### 2.3 组织架构域 (Structure) - 20个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P1 | /api/get-departments | GET | 获取部门列表 | 登录 |
| P1 | /api/get-department | GET | 获取部门详情 | 登录 |
| P1 | /api/update-department | POST | 更新部门 | 登录 |
| P1 | /api/add-department | POST | 添加部门 | 登录 |
| P1 | /api/delete-department | POST | 删除部门 | 登录 |
| P1 | /api/get-posts | GET | 获取岗位列表 | 登录 |
| P1 | /api/get-post | GET | 获取岗位详情 | 登录 |
| P1 | /api/update-post | POST | 更新岗位 | 登录 |
| P1 | /api/add-post | POST | 添加岗位 | 登录 |
| P1 | /api/delete-post | POST | 删除岗位 | 登录 |
| P1 | /api/get-groups | GET | 获取组列表 | 登录 |
| P1 | /api/get-group | GET | 获取组详情 | 登录 |
| P1 | /api/update-group | POST | 更新组 | 登录 |
| P1 | /api/add-group | POST | 添加组 | 登录 |
| P1 | /api/delete-group | POST | 删除组 | 登录 |
| P2 | /api/upload-groups | POST | 批量上传组 | 登录 |
| P1 | /api/get-roles | GET | 获取角色列表 | 登录 |
| P1 | /api/get-role | GET | 获取角色详情 | 登录 |
| P1 | /api/update-role | POST | 更新角色 | 登录 |
| P1 | /api/add-role | POST | 添加角色 | 登录 |
| P1 | /api/delete-role | POST | 删除角色 | 登录 |
| P2 | /api/upload-roles | POST | 批量上传角色 | 登录 |

### 2.4 权限与授权域 (Permission & Authorization) - 25个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P0 | /api/enforce | POST | 执行权限检查 | 登录 |
| P0 | /api/authz/check-feature | POST | 检查特性权限 | 登录 |
| P0 | /api/authz/check-data-scope | POST | 检查数据范围 | 登录 |
| P1 | /api/get-permissions | GET | 获取权限列表 | 登录 |
| P1 | /api/get-permission | GET | 获取权限详情 | 登录 |
| P1 | /api/update-permission | POST | 更新权限 | 登录 |
| P1 | /api/add-permission | POST | 添加权限 | 登录 |
| P1 | /api/delete-permission | POST | 删除权限 | 登录 |
| P1 | /api/get-permissions-by-submitter | GET | 按提交者获取权限 | 登录 |
| P1 | /api/get-permissions-by-role | GET | 按角色获取权限 | 登录 |
| P1 | /api/authz/check-feature-batch | POST | 批量检查特性权限 | 登录 |
| P1 | /api/batch-enforce | POST | 批量执行权限检查 | 登录 |
| P2 | /api/upload-permissions | POST | 批量上传权限 | 登录 |
| P1 | /api/get-models | GET | 获取模型列表 | 登录 |
| P1 | /api/get-model | GET | 获取模型详情 | 登录 |
| P1 | /api/update-model | POST | 更新模型 | 登录 |
| P1 | /api/add-model | POST | 添加模型 | 登录 |
| P1 | /api/delete-model | POST | 删除模型 | 登录 |
| P1 | /api/get-adapters | GET | 获取适配器列表 | 登录 |
| P1 | /api/get-adapter | GET | 获取适配器详情 | 登录 |
| P1 | /api/update-adapter | POST | 更新适配器 | 登录 |
| P1 | /api/add-adapter | POST | 添加适配器 | 登录 |
| P1 | /api/delete-adapter | POST | 删除适配器 | 登录 |
| P1 | /api/get-policies | GET | 获取策略列表 | 登录 |
| P1 | /api/get-filtered-policies | POST | 获取过滤策略 | 登录 |
| P1 | /api/update-policy | POST | 更新策略 | 登录 |
| P1 | /api/add-policy | POST | 添加策略 | 登录 |
| P1 | /api/remove-policy | POST | 删除策略 | 登录 |

### 2.5 菜单与资源域 (Menu & Resource) - 11个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P1 | /api/get-menus | GET | 获取菜单列表 | 登录 |
| P1 | /api/get-menu | GET | 获取菜单详情 | 登录 |
| P1 | /api/update-menu | POST | 更新菜单 | 登录 |
| P1 | /api/add-menu | POST | 添加菜单 | 登录 |
| P1 | /api/delete-menu | POST | 删除菜单 | 登录 |
| P1 | /api/get-resources | GET | 获取资源列表 | 登录 |
| P1 | /api/get-resource | GET | 获取资源详情 | 登录 |
| P1 | /api/update-resource | POST | 更新资源 | 登录 |
| P1 | /api/add-resource | POST | 添加资源 | 登录 |
| P1 | /api/delete-resource | POST | 删除资源 | 登录 |
| P2 | /api/upload-resource | POST | 上传资源 | 登录 |

### 2.6 应用与提供商域 (Application & Provider) - 12个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P0 | /api/get-application | GET | 获取应用详情 | 登录 |
| P1 | /api/get-applications | GET | 获取应用列表 | 登录 |
| P1 | /api/get-organization-applications | GET | 获取组织应用 | 登录 |
| P1 | /api/update-application | POST | 更新应用 | 登录 |
| P1 | /api/add-application | POST | 添加应用 | 登录 |
| P1 | /api/delete-application | POST | 删除应用 | 登录 |
| P1 | /api/get-providers | GET | 获取提供商列表 | 登录 |
| P1 | /api/get-provider | GET | 获取提供商详情 | 登录 |
| P1 | /api/get-global-providers | GET | 获取全局提供商 | 登录 |
| P1 | /api/update-provider | POST | 更新提供商 | 登录 |
| P1 | /api/add-provider | POST | 添加提供商 | 登录 |
| P1 | /api/delete-provider | POST | 删除提供商 | 登录 |

### 2.7 会话与令牌域 (Session & Token) - 15个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P1 | /api/get-sessions | GET | 获取会话列表 | 登录 |
| P1 | /api/get-session | GET | 获取会话详情 | 登录 |
| P1 | /api/update-session | POST | 更新会话 | 登录 |
| P1 | /api/add-session | POST | 添加会话 | 登录 |
| P1 | /api/delete-session | POST | 删除会话 | 登录 |
| P2 | /api/is-session-duplicated | GET | 检查会话是否重复 | 登录 |
| P1 | /api/get-tokens | GET | 获取令牌列表 | 登录 |
| P1 | /api/get-token | GET | 获取令牌详情 | 登录 |
| P1 | /api/update-token | POST | 更新令牌 | 登录 |
| P1 | /api/add-token | POST | 添加令牌 | 登录 |
| P1 | /api/delete-token | POST | 删除令牌 | 登录 |
| P1 | /api/login/oauth/access_token | POST | OAuth获取令牌 | 无 |
| P1 | /api/login/oauth/refresh_token | POST | OAuth刷新令牌 | 无 |
| P1 | /api/login/oauth/introspect | POST | OAuth验证令牌 | 无 |
| P2 | /api/oauth/register | POST | 动态客户端注册 | 无 |

### 2.8 商业域 (Commerce) - 38个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P1 | /api/get-products | GET | 获取产品列表 | 登录 |
| P1 | /api/get-product | GET | 获取产品详情 | 登录 |
| P1 | /api/update-product | POST | 更新产品 | 登录 |
| P1 | /api/add-product | POST | 添加产品 | 登录 |
| P1 | /api/delete-product | POST | 删除产品 | 登录 |
| P1 | /api/get-orders | GET | 获取订单列表 | 登录 |
| P1 | /api/get-user-orders | GET | 获取用户订单 | 登录 |
| P1 | /api/get-order | GET | 获取订单详情 | 登录 |
| P1 | /api/update-order | POST | 更新订单 | 登录 |
| P1 | /api/add-order | POST | 添加订单 | 登录 |
| P1 | /api/place-order | POST | 下单 | 登录 |
| P1 | /api/cancel-order | POST | 取消订单 | 登录 |
| P1 | /api/pay-order | POST | 支付订单 | 登录 |
| P1 | /api/get-payments | GET | 获取支付列表 | 登录 |
| P1 | /api/get-user-payments | GET | 获取用户支付 | 登录 |
| P1 | /api/get-payment | GET | 获取支付详情 | 登录 |
| P1 | /api/update-payment | POST | 更新支付 | 登录 |
| P1 | /api/add-payment | POST | 添加支付 | 登录 |
| P2 | /api/notify-payment | POST | 支付通知 | 无 |
| P2 | /api/invoice-payment | POST | 支付开票 | 登录 |
| P1 | /api/get-plans | GET | 获取套餐列表 | 登录 |
| P1 | /api/get-plan | GET | 获取套餐详情 | 登录 |
| P1 | /api/update-plan | POST | 更新套餐 | 登录 |
| P1 | /api/add-plan | POST | 添加套餐 | 登录 |
| P1 | /api/delete-plan | POST | 删除套餐 | 登录 |
| P1 | /api/get-pricings | GET | 获取定价列表 | 登录 |
| P1 | /api/get-pricing | GET | 获取定价详情 | 登录 |
| P1 | /api/update-pricing | POST | 更新定价 | 登录 |
| P1 | /api/add-pricing | POST | 添加定价 | 登录 |
| P1 | /api/delete-pricing | POST | 删除定价 | 登录 |
| P1 | /api/get-subscriptions | GET | 获取订阅列表 | 登录 |
| P1 | /api/get-subscription | GET | 获取订阅详情 | 登录 |
| P1 | /api/update-subscription | POST | 更新订阅 | 登录 |
| P1 | /api/add-subscription | POST | 添加订阅 | 登录 |
| P1 | /api/delete-subscription | POST | 删除订阅 | 登录 |
| P1 | /api/get-transactions | GET | 获取事务列表 | 登录 |
| P1 | /api/get-transaction | GET | 获取事务详情 | 登录 |
| P1 | /api/update-transaction | POST | 更新事务 | 登录 |
| P1 | /api/add-transaction | POST | 添加事务 | 登录 |
| P1 | /api/delete-transaction | POST | 删除事务 | 登录 |

### 2.9 证书与规则域 (Cert & Rule) - 11个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P1 | /api/get-certs | GET | 获取证书列表 | 登录 |
| P1 | /api/get-global-certs | GET | 获取全局证书 | 登录 |
| P1 | /api/get-cert | GET | 获取证书详情 | 登录 |
| P1 | /api/update-cert | POST | 更新证书 | 登录 |
| P1 | /api/add-cert | POST | 添加证书 | 登录 |
| P1 | /api/delete-cert | POST | 删除证书 | 登录 |
| P2 | /api/update-cert-domain-expire | POST | 更新证书域名过期时间 | 登录 |
| P1 | /api/get-rules | GET | 获取规则列表 | 登录 |
| P1 | /api/get-rule | GET | 获取规则详情 | 登录 |
| P1 | /api/add-rule | POST | 添加规则 | 登录 |
| P1 | /api/update-rule | POST | 更新规则 | 登录 |
| P1 | /api/delete-rule | POST | 删除规则 | 登录 |

### 2.10 同步与集成域 (Sync & Integration) - 14个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P2 | /api/get-ldaps | GET | 获取LDAP列表 | 登录 |
| P2 | /api/get-ldap | GET | 获取LDAP详情 | 登录 |
| P2 | /api/add-ldap | POST | 添加LDAP | 登录 |
| P2 | /api/update-ldap | POST | 更新LDAP | 登录 |
| P2 | /api/delete-ldap | POST | 删除LDAP | 登录 |
| P2 | /api/sync-ldap-users | POST | 同步LDAP用户 | 登录 |
| P2 | /api/get-ldap-users | GET | 获取LDAP用户 | 登录 |
| P2 | /api/get-syncers | GET | 获取同步器列表 | 登录 |
| P2 | /api/get-syncer | GET | 获取同步器详情 | 登录 |
| P2 | /api/update-syncer | POST | 更新同步器 | 登录 |
| P2 | /api/add-syncer | POST | 添加同步器 | 登录 |
| P2 | /api/delete-syncer | POST | 删除同步器 | 登录 |
| P2 | /api/run-syncer | GET | 运行同步器 | 登录 |
| P2 | /api/test-syncer-db | POST | 测试同步器数据库 | 登录 |

### 2.11 通知域 (Notification) - 9个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P1 | /api/get-webhooks | GET | 获取Webhook列表 | 登录 |
| P1 | /api/get-webhook | GET | 获取Webhook详情 | 登录 |
| P1 | /api/update-webhook | POST | 更新Webhook | 登录 |
| P1 | /api/add-webhook | POST | 添加Webhook | 登录 |
| P1 | /api/delete-webhook | POST | 删除Webhook | 登录 |
| P2 | /api/send-email | POST | 发送邮件 | 登录 |
| P2 | /api/send-sms | POST | 发送短信 | 登录 |
| P2 | /api/send-notification | POST | 发送通知 | 登录 |
| P2 | /api/get-qrcode | GET | 获取二维码 | 登录 |

### 2.12 工单与邀请域 (Ticket & Invitation) - 14个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P1 | /api/get-tickets | GET | 获取工单列表 | 登录 |
| P1 | /api/get-ticket | GET | 获取工单详情 | 登录 |
| P1 | /api/update-ticket | POST | 更新工单 | 登录 |
| P1 | /api/add-ticket | POST | 添加工单 | 登录 |
| P1 | /api/delete-ticket | POST | 删除工单 | 登录 |
| P2 | /api/add-ticket-message | POST | 添加工单消息 | 登录 |
| P1 | /api/get-invitations | GET | 获取邀请列表 | 登录 |
| P1 | /api/get-invitation | GET | 获取邀请详情 | 登录 |
| P1 | /api/get-invitation-info | GET | 获取邀请码信息 | 登录 |
| P1 | /api/update-invitation | POST | 更新邀请 | 登录 |
| P1 | /api/add-invitation | POST | 添加邀请 | 登录 |
| P1 | /api/delete-invitation | POST | 删除邀请 | 登录 |
| P2 | /api/verify-invitation | GET | 验证邀请 | 无 |
| P2 | /api/send-invitation | POST | 发送邀请 | 登录 |
| P2 | /api/get-verifications | GET | 获取验证列表 | 登录 |

### 2.13 系统与监控域 (System & Monitor) - 12个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P0 | /api/health | GET | 健康检查 | 无 |
| P0 | /api/get-version-info | GET | 获取版本信息 | 无 |
| P1 | /api/get-system-info | GET | 获取系统信息 | 登录 |
| P1 | /api/get-prometheus-info | GET | 获取Prometheus信息 | 登录 |
| P2 | /api/metrics | GET | 获取指标 | 登录 |
| P1 | /api/get-records | GET | 获取记录列表 | 登录 |
| P1 | /api/get-records-filter | POST | 获取过滤记录 | 登录 |
| P2 | /api/add-record | POST | 添加记录 | 登录 |

### 2.14 表单与站点域 (Form & Site) - 13个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P1 | /api/get-forms | GET | 获取表单列表 | 登录 |
| P1 | /api/get-form | GET | 获取表单详情 | 登录 |
| P1 | /api/update-form | POST | 更新表单 | 登录 |
| P1 | /api/add-form | POST | 添加表单 | 登录 |
| P1 | /api/delete-form | POST | 删除表单 | 登录 |
| P1 | /api/get-global-forms | GET | 获取全局表单 | 登录 |
| P1 | /api/get-sites | GET | 获取站点列表 | 登录 |
| P1 | /api/get-site | GET | 获取站点详情 | 登录 |
| P1 | /api/update-site | POST | 更新站点 | 登录 |
| P1 | /api/add-site | POST | 添加站点 | 登录 |
| P1 | /api/delete-site | POST | 删除站点 | 登录 |
| P1 | /api/get-global-sites | GET | 获取全局站点 | 登录 |

### 2.15 BFF专用域 (BFF APIs) - 6个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P0 | /api/bff/resolve-permissions | POST | 解析权限 | 登录 |
| P1 | /api/bff/check-data-scope | POST | 检查数据范围 | 登录 |
| P1 | /api/bff/tenant-tree | GET | 获取租户树 | 登录 |
| P1 | /api/bff/app-menus | GET | 获取应用菜单 | 登录 |
| P1 | /api/get-app-login | GET | 获取应用登录信息 | 无 |
| P1 | /api/get-dashboard | GET | 获取仪表盘信息 | 登录 |

### 2.16 协议域 (Protocol APIs) - 30个API
| 优先级 | API路径 | 方法 | 功能描述 | 依赖 |
|--------|---------|------|----------|------|
| P1 | /.well-known/openid-configuration | GET | OIDC发现配置 | 无 |
| P1 | /.well-known/:application/openid-configuration | GET | 应用OIDC发现配置 | 无 |
| P1 | /.well-known/oauth-authorization-server | GET | OAuth授权服务器元数据 | 无 |
| P1 | /.well-known/:application/oauth-authorization-server | GET | 应用OAuth授权服务器元数据 | 无 |
| P1 | /.well-known/jwks | * | 获取JWKS | 无 |
| P1 | /.well-known/:application/jwks | * | 应用获取JWKS | 无 |
| P1 | /.well-known/webfinger | GET | WebFinger | 无 |
| P1 | /.well-known/:application/webfinger | GET | 应用WebFinger | 无 |
| P1 | /.well-known/oauth-protected-resource | GET | 受保护资源元数据 | 无 |
| P1 | /.well-known/:application/oauth-protected-resource | GET | 应用受保护资源元数据 | 无 |
| P1 | /cas/:organization/:application/serviceValidate | GET | CAS服务验证 | 无 |
| P1 | /cas/:organization/:application/proxyValidate | GET | CAS代理验证 | 无 |
| P1 | /cas/:organization/:application/proxy | GET | CAS代理 | 无 |
| P1 | /cas/:organization/:application/validate | GET | CAS验证 | 无 |
| P1 | /cas/:organization/:application/p3/serviceValidate | GET | CAS3服务验证 | 无 |
| P1 | /cas/:organization/:application/p3/proxyValidate | GET | CAS3代理验证 | 无 |
| P2 | /cas/:organization/:application/samlValidate | POST | CAS SAML验证 | 无 |
| P2 | /scim/* | * | SCIM处理 | 登录 |
| P2 | /api/mcp | POST | MCP处理 | 无 |
| P2 | /api/faceid-signin-begin | GET | FaceID登录开始 | 无 |
| P2 | /api/get-saml-login | GET | 获取SAML登录 | 无 |
| P2 | /api/saml/metadata | GET | 获取SAML元数据 | 无 |
| P2 | /api/saml/redirect/:owner/:application | * | SAML重定向 | 无 |
| P2 | /api/webhook | * | 处理公众号事件 | 无 |
| P2 | /api/get-webhook-event | GET | 获取Webhook事件类型 | 无 |
| P2 | /api/callback | POST | OAuth回调 | 无 |
| P2 | /api/device-auth | POST | 设备认证 | 无 |
| P2 | /api/kerberos-login | GET | Kerberos登录 | 无 |
| P2 | /api/get-enforcers | GET | 获取执行器列表 | 登录 |
| P2 | /api/get-enforcer | GET | 获取执行器详情 | 登录 |
| P2 | /api/update-enforcer | POST | 更新执行器 | 登录 |
| P2 | /api/add-enforcer | POST | 添加执行器 | 登录 |
| P2 | /api/delete-enforcer | POST | 删除执行器 | 登录 |
| P2 | /api/run-casbin-command | GET | 运行Casbin命令 | 登录 |
| P2 | /api/refresh-engines | POST | 刷新引擎 | 登录 |
| P2 | /api/get-all-objects | GET | 获取所有对象 | 登录 |
| P2 | /api/get-all-actions | GET | 获取所有动作 | 登录 |
| P2 | /api/get-all-roles | GET | 获取所有角色 | 登录 |
| P2 | /api/onboard-application | POST | 应用初始化 | 登录 |

## 三、测试策略

### 3.1 测试分层
| 层级 | 优先级 | 描述 | API数量 | 测试方法 |
|------|--------|------|---------|----------|
| L1 冒烟 | P0 | 核心功能API健康检查 | ~30个 | 快速验证 |
| L2 功能 | P1 | 各API功能正确性验证 | ~150个 | 功能测试 |
| L3 集成 | P1 | API间数据流转验证 | ~50个 | 流程测试 |
| L4 安全 | P2 | 认证授权、越权访问测试 | ~30个 | 安全测试 |
| L5 性能 | P2 | 响应时间、并发能力 | 全量 | 性能测试 |

### 3.2 测试环境配置
```yaml
测试环境:
  服务地址: http://127.0.0.1:8000
  数据库:
    主机: pms-postgres
    端口: 5432
    数据库名: casdoor
    用户: casdoor
    密码: casdoor2024secure
  模式: prod (测试时创建独立测试库或使用测试模式)
  
前置条件:
  - 服务已启动 (docker-compose up -d 或本地运行)
  - 数据库已初始化
  - 可用测试账户 (admin/xxxxx)
```

### 3.3 测试框架规格
| 组件 | 选型 | 版本 | 说明 |
|------|------|------|------|
| 测试框架 | testing | Go原生 | 标准Go测试框架 |
| HTTP客户端 | httpx | ^0.27.0 | 替代requests的Go选择 |
| 断言库 | testify | ^1.9.0 | 增强断言能力 |
| 并发测试 | errgroup | - | 标准库并发控制 |
| 报告生成 | built-in | - | Go test原生 |

### 3.4 测试数据策略
```go
// 测试数据准备示例
type TestDataSetup struct {
    Organization *object.Organization
    User         *object.User
    Application  *object.Application
    Permission   *object.Permission
}

// 数据准备规则
// 1. 每个测试用例使用唯一前缀: test_{timestamp}_{random}
// 2. 测试完成后清理: defer cleanup()
// 3. 共享数据放在 TestMain 中初始化
// 4. 使用事务回滚保证测试隔离性
```

## 四、执行计划

### 4.1 第一阶段：P0核心冒烟测试 (~30个API)
```
执行顺序:
1. /api/health - 健康检查
2. /api/get-version-info - 版本信息
3. /api/login - 登录 (获取token)
4. /api/get-organizations - 获取组织列表
5. /api/get-users - 获取用户列表
6. /api/get-user - 获取用户详情
7. /api/get-application - 获取应用详情
8. /api/get-permissions - 获取权限列表
9. /api/enforce - 权限检查
10. /api/authz/check-feature - 特性权限检查
11. /api/authz/check-data-scope - 数据范围检查
12. /api/get-account - 获取账户信息
13. /api/userinfo - 获取用户信息
14. /api/get-menus - 获取菜单列表
15. /api/get-resources - 获取资源列表
16. /api/bff/resolve-permissions - 解析权限
17. /api/logout - 登出

验证标准: 17个API全部通过即可进入下一阶段
```

### 4.2 第二阶段：P1功能CRUD测试 (~150个API)
- 按业务域分组执行
- 每个域独立执行和清理
- 验证所有CRUD操作

### 4.3 第三阶段：P1业务流测试 (~50个API)
- 用户注册登录完整流程
- 权限验证完整流程
- OAuth授权流程
- CAS验证流程

### 4.4 第四阶段：P2边界与安全测试 (~30个API)
- 异常输入测试
- 并发测试
- 越权访问测试
- 外部依赖Mock测试

## 五、测试用例实现规范

### 5.1 基础测试结构
```go
package controllers

import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/go-resty/resty/v2"
)

var (
    baseURL    = "http://127.0.0.1:8000"
    testClient = resty.New().SetBaseURL(baseURL)
    testToken  = ""
)

func TestMain(m *testing.M) {
    // 测试前准备
    // 1. 确保服务运行
    // 2. 获取测试token
    // 3. 初始化测试数据
    defer m.Run()
}

// TestHealth 健康检查
func TestHealth(t *testing.T) {
    resp, err := testClient.R().Get("/api/health")
    assert.NoError(t, err)
    assert.Equal(t, 200, resp.StatusCode())
}

// TestLogin 用户登录
func TestLogin(t *testing.T) {
    resp, err := testClient.R().
        SetBody(map[string]interface{}{
            "owner":       "built-in",
            "organization": "built-in",
            "username":    "admin",
            "password":    "admin",
        }).
        Post("/api/login")
    
    assert.NoError(t, err)
    assert.Equal(t, 200, resp.StatusCode())
    
    // 解析token
    var result map[string]interface{}
    err = json.Unmarshal(resp.Body(), &result)
    assert.NoError(t, err)
    
    if token, ok := result["accessToken"].(string); ok {
        testToken = token
        testClient.SetAuthToken(token)
    }
}
```

### 5.2 CRUD测试模板
```go
// TestOrganizationCRUD 组织CRUD测试
func TestOrganizationCRUD(t *testing.T) {
    // Create
    org := map[string]interface{}{
        "owner":        "test",
        "name":         "test-org-001",
        "displayName":  "测试组织",
        "websiteUrl":   "https://test.com",
    }
    
    resp, err := testClient.R().
        SetBody(org).
        Post("/api/add-organization")
    assert.NoError(t, err)
    assert.Equal(t, 200, resp.StatusCode())
    
    // Read
    resp, err = testClient.R().
        SetQueryParam("owner", "test").
        SetQueryParam("name", "test-org-001").
        Get("/api/get-organization")
    assert.NoError(t, err)
    assert.Equal(t, 200, resp.StatusCode())
    
    // Update
    updateOrg := map[string]interface{}{
        "owner":        "test",
        "name":         "test-org-001",
        "displayName":  "测试组织-已更新",
    }
    resp, err = testClient.R().
        SetBody(updateOrg).
        Post("/api/update-organization")
    assert.NoError(t, err)
    assert.Equal(t, 200, resp.StatusCode())
    
    // Delete
    resp, err = testClient.R().
        SetBody(map[string]interface{}{
            "owner": "test",
            "name":  "test-org-001",
        }).
        Post("/api/delete-organization")
    assert.NoError(t, err)
    assert.Equal(t, 200, resp.StatusCode())
}
```

## 六、验收标准

### 6.1 P0核心冒烟验收
| 指标 | 标准 | 说明 |
|------|------|------|
| 通过率 | ≥100% (17/17) | 17个P0 API全部通过 |
| 平均响应时间 | ≤200ms | 不含网络延迟 |
| 错误返回 | 正确的错误码和消息 | 验证错误处理 |

### 6.2 P1功能测试验收
| 指标 | 标准 | 说明 |
|------|------|------|
| 通过率 | ≥95% | 允许5%与环境相关失败 |
| CRUD完整性 | 100% | 每个实体CRUD都验证 |
| 数据一致性 | 100% | 写入数据与返回数据一致 |

### 6.3 P2安全测试验收
| 指标 | 标准 | 说明 |
|------|------|------|
| 认证绕过 | 0次 | 无未授权访问 |
| 越权访问 | 0次 | 无法访问非授权资源 |
| 注入攻击 | 0次 | SQL/XSS注入测试通过 |

## 七、错误码参考

| 错误码 | 含义 | 常见原因 |
|--------|------|----------|
| 200 | 成功 | 正常 |
| 401 | 未授权 | token无效或过期 |
| 403 | 禁止访问 | 无权限 |
| 404 | 未找到 | 资源不存在 |
| 500 | 服务器错误 | 后端异常 |
| 429 | 请求过多 | 触发限流 |

## 八、注意事项

1. **测试隔离**: 每个测试用例应独立，使用唯一标识符避免冲突
2. **Token管理**: 登录获取的token应在测试间共享，但需处理过期情况
3. **资源清理**: 使用defer确保测试后清理创建的资源
4. **并发安全**: 并发测试时注意共享资源的竞争问题
5. **超时设置**: 根据API复杂度设置合理的超时时间(建议5-30s)