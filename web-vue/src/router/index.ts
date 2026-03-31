import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getAccount } from "@/api/modules/auth";

// ── Auth / Entry pages ──
const entryRoutes: RouteRecordRaw[] = [
  { path: "/account", component: () => import("@/views/user/AccountPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/signup", component: () => import("@/views/auth/SignupPage.vue"), meta: { layout: "entry", guest: true } },
  { path: "/signup/:applicationName", component: () => import("@/views/auth/SignupPage.vue"), meta: { layout: "entry", guest: true } },
  { path: "/login", component: () => import("@/views/auth/LoginPage.vue"), meta: { layout: "entry", guest: true } },
  { path: "/login/:owner", component: () => import("@/views/auth/LoginPage.vue"), meta: { layout: "entry", guest: true } },
  { path: "/signup/oauth/authorize", component: () => import("@/views/auth/SignupPage.vue"), meta: { layout: "entry" } },
  { path: "/login/oauth/authorize", component: () => import("@/views/auth/LoginPage.vue"), meta: { layout: "entry" } },
  { path: "/login/oauth/device/:userCode", component: () => import("@/views/auth/LoginPage.vue"), meta: { layout: "entry" } },
  { path: "/login/saml/authorize/:owner/:applicationName", component: () => import("@/views/auth/LoginPage.vue"), meta: { layout: "entry" } },
  { path: "/forget", component: () => import("@/views/auth/ForgetPage.vue"), meta: { layout: "entry" } },
  { path: "/forget/:applicationName", component: () => import("@/views/auth/ForgetPage.vue"), meta: { layout: "entry" } },
  { path: "/prompt", component: () => import("@/views/auth/PromptPage.vue"), meta: { layout: "entry", requiresAuth: true } },
  { path: "/prompt/:applicationName", component: () => import("@/views/auth/PromptPage.vue"), meta: { layout: "entry", requiresAuth: true } },
  { path: "/consent/:applicationName", component: () => import("@/views/auth/ConsentPage.vue"), meta: { layout: "entry", requiresAuth: true } },
  { path: "/result", component: () => import("@/views/auth/ResultPage.vue"), meta: { layout: "entry", guest: true } },
  { path: "/result/:applicationName", component: () => import("@/views/auth/ResultPage.vue"), meta: { layout: "entry", guest: true } },
  { path: "/cas/:owner/:casApplicationName/logout", component: () => import("@/views/auth/CasLogoutPage.vue"), meta: { layout: "entry", guest: true } },
  { path: "/cas/:owner/:casApplicationName/login", component: () => import("@/views/auth/LoginPage.vue"), meta: { layout: "entry" } },
  { path: "/select-plan/:owner/:pricingName", component: () => import("@/views/auth/SelectPlanPage.vue"), meta: { layout: "entry" } },
  { path: "/buy-plan/:owner/:pricingName", component: () => import("@/views/auth/BuyPlanPage.vue"), meta: { layout: "entry" } },
  { path: "/buy-plan/:owner/:pricingName/result", component: () => import("@/views/auth/PaymentResultPage.vue"), meta: { layout: "entry" } },
  { path: "/qrcode/:owner/:paymentName", component: () => import("@/views/auth/QrcodePage.vue"), meta: { layout: "entry" } },
  { path: "/captcha", component: () => import("@/views/auth/CaptchaPage.vue"), meta: { layout: "entry" } },
  // OAuth callbacks
  { path: "/callback", component: () => import("@/views/auth/AuthCallback.vue"), meta: { layout: "entry" } },
  { path: "/callback/saml", component: () => import("@/views/auth/AuthCallback.vue"), meta: { layout: "entry" } },
  { path: "/callback/telegram", component: () => import("@/views/auth/TelegramLoginPage.vue"), meta: { layout: "entry" } },
  { path: "/oidc/discovery", component: () => import("@/views/auth/OidcDiscoveryPage.vue"), meta: { layout: "entry" } },
];

// ── Management pages (lazy-loaded placeholders) ──
const managementRoutes: RouteRecordRaw[] = [
  // Home
  { path: "/", component: () => import("@/views/basic/DashboardPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/shortcuts", component: () => import("@/views/basic/ShortcutsPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/apps", component: () => import("@/views/basic/AppListPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/shortcuts", redirect: "/" },
  { path: "/apps", component: () => import("@/views/basic/AppListPage.vue"), meta: { layout: "management", requiresAuth: true } },

  // User Management
  { path: "/organizations", redirect: "/management/organizations" },
  { path: "/organizations/:organizationName", redirect: (to) => ({ name: "management-organizations-edit", params: { name: to.params.organizationName } }) },
  { path: "/organizations/:organizationName/users", redirect: "/management/users" },
  { path: "/groups", redirect: "/management/groups" },
  { path: "/trees/:organizationName", component: () => import("@/views/management/GroupTreePage.vue"), meta: { layout: "management", requiresAuth: true, isWithoutCard: true } },
  { path: "/trees/:organizationName/:groupName", component: () => import("@/views/management/GroupTreePage.vue"), meta: { layout: "management", requiresAuth: true, isWithoutCard: true } },
  { path: "/groups/:organizationName/:groupName", redirect: (to) => ({ name: "management-groups-edit", params: { owner: to.params.organizationName, name: to.params.groupName } }) },
  { path: "/users", redirect: "/management/users" },
  { path: "/users/:organizationName/:userName", redirect: (to) => ({ name: "management-users-edit", params: { owner: to.params.organizationName, name: to.params.userName } }) },
  { path: "/invitations", redirect: "/management/invitations" },
  { path: "/invitations/:organizationName/:invitationName", redirect: (to) => ({ name: "management-invitations-edit", params: { owner: to.params.organizationName, name: to.params.invitationName } }) },

  // Identity
  { path: "/applications", redirect: "/management/applications" },
  { path: "/applications/:organizationName/:applicationName", redirect: (to) => ({ name: "management-applications-edit", params: { organization: to.params.organizationName, name: to.params.applicationName } }) },
  { path: "/providers", redirect: "/management/providers" },
  { path: "/providers/:organizationName/:providerName", redirect: (to) => ({ name: "management-providers-edit", params: { owner: to.params.organizationName, name: to.params.providerName } }) },
  { path: "/resources", redirect: "/management/resources" },
  { path: "/certs", redirect: "/management/certs" },
  { path: "/certs/:organizationName/:certName", redirect: (to) => ({ name: "management-certs-edit", params: { owner: to.params.organizationName, name: to.params.certName } }) },

  // Authorization
  { path: "/roles", redirect: "/management/roles" },
  { path: "/roles/:organizationName/:roleName", redirect: (to) => ({ name: "management-roles-edit", params: { owner: to.params.organizationName, name: to.params.roleName } }) },
  { path: "/permissions", redirect: "/management/permissions" },
  { path: "/permissions/:organizationName/:permissionName", redirect: (to) => ({ name: "management-permissions-edit", params: { owner: to.params.organizationName, name: to.params.permissionName } }) },
  { path: "/models", redirect: "/management/models" },
  { path: "/models/:organizationName/:modelName", redirect: (to) => ({ name: "management-models-edit", params: { owner: to.params.organizationName, name: to.params.modelName } }) },
  { path: "/adapters", redirect: "/management/adapters" },
  { path: "/adapters/:organizationName/:adapterName", redirect: (to) => ({ name: "management-adapters-edit", params: { owner: to.params.organizationName, name: to.params.adapterName } }) },
  { path: "/enforcers", redirect: "/management/enforcers" },
  { path: "/enforcers/:organizationName/:enforcerName", redirect: (to) => ({ name: "management-enforcers-edit", params: { owner: to.params.organizationName, name: to.params.enforcerName } }) },

  // Logging & Auditing
  { path: "/sessions", redirect: "/management/sessions" },
  { path: "/records", redirect: "/management/records" },
  { path: "/tokens", redirect: "/management/tokens" },
  { path: "/tokens/:tokenName", redirect: (to) => ({ name: "management-tokens-edit", params: { name: to.params.tokenName } }) },
  { path: "/verifications", redirect: "/management/verifications" },

  // Business
  { path: "/products", redirect: "/management/products" },
  { path: "/products/:organizationName/:productName", redirect: (to) => ({ name: "management-products-edit", params: { owner: to.params.organizationName, name: to.params.productName } }) },
  { path: "/product-store", component: () => import("@/views/management/ProductStorePage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/cart", component: () => import("@/views/management/CartListPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/buy", component: () => import("@/views/management/ProductBuyPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/order-pay", component: () => import("@/views/management/OrderPayPage.vue"), meta: { layout: "management", requiresAuth: true } },

  // LDAP
  { path: "/ldap", redirect: "/management/ldaps" },
  { path: "/management/ldaps", name: "management-ldaps", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "ldaps" } },
  { path: "/management/ldaps/new", name: "management-ldaps-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "ldaps" } },
  { path: "/management/ldaps/:owner/:name", name: "management-ldaps-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "ldaps" } },
  { path: "/ldap/:organizationName/:ldapId", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "ldaps" } },
  { path: "/ldap/sync/:organizationName/:ldapId", component: () => import("@/views/management/LdapSyncPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/payments", redirect: "/management/payments" },
  { path: "/payments/:organizationName/:paymentName", redirect: (to) => ({ name: "management-payments-edit", params: { owner: to.params.organizationName, name: to.params.paymentName } }) },
  { path: "/plans", redirect: "/management/plans" },
  { path: "/plans/:organizationName/:planName", redirect: (to) => ({ name: "management-plans-edit", params: { owner: to.params.organizationName, name: to.params.planName } }) },
  { path: "/pricings", redirect: "/management/pricings" },
  { path: "/pricings/:organizationName/:pricingName", redirect: (to) => ({ name: "management-pricings-edit", params: { owner: to.params.organizationName, name: to.params.pricingName } }) },
  { path: "/subscriptions", redirect: "/management/subscriptions" },
  { path: "/subscriptions/:organizationName/:subscriptionName", redirect: (to) => ({ name: "management-subscriptions-edit", params: { owner: to.params.organizationName, name: to.params.subscriptionName } }) },
  { path: "/transactions", redirect: "/management/transactions" },
  { path: "/transactions/:organizationName/:transactionName", redirect: "/management/transactions" },
  { path: "/orders", redirect: "/management/orders" },

  // Admin
  { path: "/sysinfo", redirect: "/management/sysinfo" },
  { path: "/forms", redirect: "/management/forms" },
  { path: "/syncers", redirect: "/management/syncers" },
  { path: "/syncers/:organizationName/:syncerName", redirect: (to) => ({ name: "management-syncers-edit", params: { owner: to.params.organizationName, name: to.params.syncerName } }) },
  { path: "/webhooks", redirect: "/management/webhooks" },
  { path: "/webhooks/:organizationName/:webhookName", redirect: (to) => ({ name: "management-webhooks-edit", params: { owner: to.params.organizationName, name: to.params.webhookName } }) },
  { path: "/tickets", redirect: "/management/tickets" },
  { path: "/swagger", component: () => import("@/views/basic/SwaggerPage.vue"), meta: { layout: "management", requiresAuth: true } },

  // MFA setup
  { path: "/mfa/setup", component: () => import("@/views/auth/MfaSetupPage.vue"), meta: { layout: "management", requiresAuth: true } },

  // Catch-all
  // ── Management resource routes ──
  { path: "/management/users", name: "management-users", component: () => import("@/views/management/UserListPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/users/new", name: "management-users-new", component: () => import("@/views/management/UserEditPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/users/:owner/:name", name: "management-users-edit", component: () => import("@/views/management/UserEditPage.vue"), meta: { layout: "management", requiresAuth: true } },

  { path: "/management/organizations", name: "management-organizations", component: () => import("@/views/management/OrganizationListPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/organizations/new", name: "management-organizations-new", component: () => import("@/views/management/OrganizationEditPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/organizations/:name", name: "management-organizations-edit", component: () => import("@/views/management/OrganizationEditPage.vue"), meta: { layout: "management", requiresAuth: true } },

  { path: "/management/applications", name: "management-applications", component: () => import("@/views/management/ApplicationListPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/applications/new", name: "management-applications-new", component: () => import("@/views/management/ApplicationEditPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/applications/:organization/:name", name: "management-applications-edit", component: () => import("@/views/management/ApplicationEditPage.vue"), meta: { layout: "management", requiresAuth: true } },

  { path: "/management/roles", name: "management-roles", component: () => import("@/views/management/RoleListPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/roles/new", name: "management-roles-new", component: () => import("@/views/management/RoleEditPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/roles/:owner/:name", name: "management-roles-edit", component: () => import("@/views/management/RoleEditPage.vue"), meta: { layout: "management", requiresAuth: true } },

  { path: "/management/permissions", name: "management-permissions", component: () => import("@/views/management/PermissionListPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/permissions/new", name: "management-permissions-new", component: () => import("@/views/management/PermissionEditPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/permissions/:owner/:name", name: "management-permissions-edit", component: () => import("@/views/management/PermissionEditPage.vue"), meta: { layout: "management", requiresAuth: true } },

  { path: "/management/models", name: "management-models", component: () => import("@/views/management/ModelListPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/models/new", name: "management-models-new", component: () => import("@/views/management/ModelEditPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/models/:owner/:name", name: "management-models-edit", component: () => import("@/views/management/ModelEditPage.vue"), meta: { layout: "management", requiresAuth: true } },

  { path: "/management/providers", name: "management-providers", component: () => import("@/views/management/ProviderListPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/providers/new", name: "management-providers-new", component: () => import("@/views/management/ProviderEditPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/providers/:owner/:name", name: "management-providers-edit", component: () => import("@/views/management/ProviderEditPage.vue"), meta: { layout: "management", requiresAuth: true } },

  { path: "/management/groups", name: "management-groups", component: () => import("@/views/management/GroupListPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/groups/new", name: "management-groups-new", component: () => import("@/views/management/GroupEditPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/groups/:owner/:name", name: "management-groups-edit", component: () => import("@/views/management/GroupEditPage.vue"), meta: { layout: "management", requiresAuth: true } },

  { path: "/management/departments", name: "management-departments", component: () => import("@/views/management/DepartmentListPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/departments/new", name: "management-departments-new", component: () => import("@/views/management/DepartmentEditPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/departments/:owner/:name", name: "management-departments-edit", component: () => import("@/views/management/DepartmentEditPage.vue"), meta: { layout: "management", requiresAuth: true } },

  { path: "/management/posts", name: "management-posts", component: () => import("@/views/management/PostListPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/posts/new", name: "management-posts-new", component: () => import("@/views/management/PostEditPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/posts/:owner/:name", name: "management-posts-edit", component: () => import("@/views/management/PostEditPage.vue"), meta: { layout: "management", requiresAuth: true } },

  { path: "/management/menus", name: "management-menus", component: () => import("@/views/management/MenuListPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/menus/new", name: "management-menus-new", component: () => import("@/views/management/MenuEditPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/menus/:owner/:name", name: "management-menus-edit", component: () => import("@/views/management/MenuEditPage.vue"), meta: { layout: "management", requiresAuth: true } },

  { path: "/management/permission-rules", name: "management-permission-rules", component: () => import("@/views/management/PermissionRuleListPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/permission-rules/new", name: "management-permission-rules-new", component: () => import("@/views/management/PermissionRuleEditPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/management/permission-rules/:owner/:name", name: "management-permission-rules-edit", component: () => import("@/views/management/PermissionRuleEditPage.vue"), meta: { layout: "management", requiresAuth: true } },

  { path: "/management/invitations", name: "management-invitations", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "invitations" } },
  { path: "/management/invitations/new", name: "management-invitations-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "invitations" } },
  { path: "/management/invitations/:owner/:name", name: "management-invitations-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "invitations" } },

  { path: "/management/resources", name: "management-resources", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "resources" } },
  { path: "/management/resources/new", name: "management-resources-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "resources" } },
  { path: "/management/resources/:owner/:name", name: "management-resources-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "resources" } },

  { path: "/management/certs", name: "management-certs", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "certs" } },
  { path: "/management/certs/new", name: "management-certs-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "certs" } },
  { path: "/management/certs/:owner/:name", name: "management-certs-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "certs" } },

  { path: "/management/adapters", name: "management-adapters", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "adapters" } },
  { path: "/management/adapters/new", name: "management-adapters-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "adapters" } },
  { path: "/management/adapters/:owner/:name", name: "management-adapters-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "adapters" } },

  { path: "/management/enforcers", name: "management-enforcers", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "enforcers" } },
  { path: "/management/enforcers/new", name: "management-enforcers-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "enforcers" } },
  { path: "/management/enforcers/:owner/:name", name: "management-enforcers-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "enforcers" } },

  { path: "/management/sessions", name: "management-sessions", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "sessions" } },
  { path: "/management/records", name: "management-records", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "records" } },
  { path: "/management/tokens", name: "management-tokens", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "tokens" } },
  { path: "/management/tokens/new", name: "management-tokens-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "tokens" } },
  { path: "/management/tokens/:name", name: "management-tokens-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "tokens" } },
  { path: "/management/verifications", name: "management-verifications", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "verifications" } },

  { path: "/management/products", name: "management-products", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "products" } },
  { path: "/management/products/new", name: "management-products-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "products" } },
  { path: "/management/products/:owner/:name", name: "management-products-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "products" } },
  { path: "/management/payments", name: "management-payments", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "payments" } },
  { path: "/management/payments/new", name: "management-payments-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "payments" } },
  { path: "/management/payments/:owner/:name", name: "management-payments-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "payments" } },
  { path: "/management/plans", name: "management-plans", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "plans" } },
  { path: "/management/plans/new", name: "management-plans-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "plans" } },
  { path: "/management/plans/:owner/:name", name: "management-plans-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "plans" } },
  { path: "/management/pricings", name: "management-pricings", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "pricings" } },
  { path: "/management/pricings/new", name: "management-pricings-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "pricings" } },
  { path: "/management/pricings/:owner/:name", name: "management-pricings-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "pricings" } },
  { path: "/management/subscriptions", name: "management-subscriptions", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "subscriptions" } },
  { path: "/management/subscriptions/new", name: "management-subscriptions-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "subscriptions" } },
  { path: "/management/subscriptions/:owner/:name", name: "management-subscriptions-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "subscriptions" } },
  { path: "/management/transactions", name: "management-transactions", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "transactions" } },
  { path: "/management/orders", name: "management-orders", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "orders" } },
  { path: "/management/sysinfo", name: "management-sysinfo", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "systemInfo" } },
  { path: "/management/forms", name: "management-forms", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "forms" } },
  { path: "/management/forms/new", name: "management-forms-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "forms" } },
  { path: "/management/forms/:owner/:name", name: "management-forms-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "forms" } },
  { path: "/management/syncers", name: "management-syncers", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "syncers" } },
  { path: "/management/syncers/new", name: "management-syncers-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "syncers" } },
  { path: "/management/syncers/:owner/:name", name: "management-syncers-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "syncers" } },
  { path: "/management/webhooks", name: "management-webhooks", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "webhooks" } },
  { path: "/management/webhooks/new", name: "management-webhooks-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "webhooks" } },
  { path: "/management/webhooks/:owner/:name", name: "management-webhooks-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "webhooks" } },
  { path: "/management/tickets", name: "management-tickets", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "tickets" } },
  { path: "/management/tickets/new", name: "management-tickets-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "tickets" } },
  { path: "/management/tickets/:owner/:name", name: "management-tickets-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "tickets" } },

  { path: "/management/sites", name: "management-sites", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "sites" } },
  { path: "/management/sites/new", name: "management-sites-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "sites" } },
  { path: "/management/sites/:owner/:name", name: "management-sites-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "sites" } },

  { path: "/management/rules", name: "management-rules", component: () => import("@/views/management/GenericResourceListPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "rules" } },
  { path: "/management/rules/new", name: "management-rules-new", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "rules" } },
  { path: "/management/rules/:owner/:name", name: "management-rules-edit", component: () => import("@/views/management/GenericResourceEditPage.vue"), meta: { layout: "management", requiresAuth: true, resourceKey: "rules" } },

  { path: "/:pathMatch(.*)*", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management" } },
];

const router = createRouter({
  history: createWebHistory(),
  routes: [...entryRoutes, ...managementRoutes],
});

// Navigation guard — restore auth state from session cookie on first protected navigation
let fetchingAccount: Promise<boolean> | null = null;

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      // Deduplicate concurrent getAccount calls
      if (!fetchingAccount) {
        fetchingAccount = getAccount("")
          .then((res) => {
            if (res.status === "ok" && res.data) {
              const acc = res.data as Record<string, unknown>;
              if (res.data2) {
                acc.organization = res.data2;
              }
              authStore.setAccount(acc as import("@/stores/auth").Account);
              if (typeof acc.accessToken === "string") {
                authStore.setAccessToken(acc.accessToken);
              }
              return true;
            }
            return false;
          })
          .catch(() => false)
          .finally(() => {
            fetchingAccount = null;
          });
      }

      const ok = await fetchingAccount;
      if (!ok) {
        return { path: "/login", query: { redirect: to.fullPath } };
      }
    }
  }
  return true;
});

export default router;
