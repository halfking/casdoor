import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const Placeholder = (name: string) => () => import(`../views/Placeholder.vue`).then(m => ({ default: () => m.default(name) }))

// Entry routes (no auth required)
const entryRoutes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: () => import('../views/auth/LoginPage.vue') },
  { path: '/signup', name: 'Signup', component: () => import('../views/auth/SignupPage.vue') },
  { path: '/forget', name: 'Forget', component: () => import('../views/auth/ForgetPage.vue') },
  { path: '/callback', name: 'AuthCallback', component: () => import('../views/auth/AuthCallback.vue') },
  { path: '/callback/saml', name: 'SamlCallback', component: () => import('../views/auth/SamlCallback.vue') },
  { path: '/consent/:applicationName', name: 'Consent', component: () => import('../views/auth/ConsentPage.vue') },
  { path: '/prompt/:applicationName', name: 'Prompt', component: () => import('../views/auth/PromptPage.vue') },
  { path: '/mfa/setup', name: 'MfaSetup', component: () => import('../views/auth/MfaSetupPage.vue') },
  { path: '/.well-known/openid-configuration', name: 'OidcDiscovery', component: () => import('../views/auth/OidcDiscoveryPage.vue') },
  { path: '/telegram-login', name: 'TelegramLogin', component: () => import('../views/auth/TelegramLoginPage.vue') },
]

// Management routes (auth required)
const managementRoutes: RouteRecordRaw[] = [
  { path: '/', name: 'Dashboard', component: () => import('../views/management/DashboardPage.vue') },
  { path: '/apps', name: 'AppList', component: () => import('../views/management/AppListPage.vue') },
  { path: '/shortcuts', name: 'Shortcuts', component: () => import('../views/management/ShortcutsPage.vue') },
  { path: '/account', name: 'Account', component: () => import('../views/management/AccountPage.vue') },
  // Organizations
  { path: '/organizations', name: 'OrganizationList', component: () => import('../views/management/OrganizationListPage.vue') },
  { path: '/organizations/:organizationName', name: 'OrganizationEdit', component: () => import('../views/management/OrganizationEditPage.vue') },
  { path: '/organizations/:organizationName/users', name: 'OrgUsers', component: () => import('../views/management/UserListPage.vue') },
  // Groups
  { path: '/groups', name: 'GroupList', component: () => import('../views/management/GroupListPage.vue') },
  { path: '/groups/:organizationName/:groupName', name: 'GroupEdit', component: () => import('../views/management/GroupEditPage.vue') },
  // Trees
  { path: '/trees/:organizationName', name: 'GroupTree', component: () => import('../views/management/GroupTreePage.vue') },
  // Users
  { path: '/users', name: 'UserList', component: () => import('../views/management/UserListPage.vue') },
  { path: '/users/:organizationName/:userName', name: 'UserEdit', component: () => import('../views/management/UserEditPage.vue') },
  // Applications
  { path: '/applications', name: 'ApplicationList', component: () => import('../views/management/ApplicationListPage.vue') },
  { path: '/applications/:organizationName/:applicationName', name: 'ApplicationEdit', component: () => import('../views/management/ApplicationEditPage.vue') },
  // Providers
  { path: '/providers', name: 'ProviderList', component: () => import('../views/management/ProviderListPage.vue') },
  { path: '/providers/:organizationName/:providerName', name: 'ProviderEdit', component: () => import('../views/management/ProviderEditPage.vue') },
  // Roles
  { path: '/roles', name: 'RoleList', component: () => import('../views/management/RoleListPage.vue') },
  { path: '/roles/:organizationName/:roleName', name: 'RoleEdit', component: () => import('../views/management/RoleEditPage.vue') },
  // Permissions
  { path: '/permissions', name: 'PermissionList', component: () => import('../views/management/PermissionListPage.vue') },
  { path: '/permissions/:organizationName/:permissionName', name: 'PermissionEdit', component: () => import('../views/management/PermissionEditPage.vue') },
  // Models
  { path: '/models', name: 'ModelList', component: () => import('../views/management/ModelListPage.vue') },
  { path: '/models/:organizationName/:modelName', name: 'ModelEdit', component: () => import('../views/management/ModelEditPage.vue') },
  // Adapters
  { path: '/adapters', name: 'AdapterList', component: () => import('../views/management/AdapterListPage.vue') },
  { path: '/adapters/:organizationName/:adapterName', name: 'AdapterEdit', component: () => import('../views/management/AdapterEditPage.vue') },
  // Enforcers
  { path: '/enforcers', name: 'EnforcerList', component: () => import('../views/management/EnforcerListPage.vue') },
  { path: '/enforcers/:organizationName/:enforcerName', name: 'EnforcerEdit', component: () => import('../views/management/EnforcerEditPage.vue') },
  // Certs
  { path: '/certs', name: 'CertList', component: () => import('../views/management/CertListPage.vue') },
  { path: '/certs/:organizationName/:certName', name: 'CertEdit', component: () => import('../views/management/CertEditPage.vue') },
  // Tokens
  { path: '/tokens', name: 'TokenList', component: () => import('../views/management/TokenListPage.vue') },
  { path: '/tokens/:tokenName', name: 'TokenEdit', component: () => import('../views/management/TokenEditPage.vue') },
  // Sessions
  { path: '/sessions', name: 'SessionList', component: () => import('../views/management/SessionListPage.vue') },
  // Records
  { path: '/records', name: 'RecordList', component: () => import('../views/management/RecordListPage.vue') },
  // Resources
  { path: '/resources', name: 'ResourceList', component: () => import('../views/management/ResourceListPage.vue') },
  // Sites
  { path: '/sites', name: 'SiteList', component: () => import('../views/management/SiteListPage.vue') },
  { path: '/sites/:organizationName/:siteName', name: 'SiteEdit', component: () => import('../views/management/SiteEditPage.vue') },
  // Rules
  { path: '/rules', name: 'RuleList', component: () => import('../views/management/RuleListPage.vue') },
  { path: '/rules/:organizationName/:ruleName', name: 'RuleEdit', component: () => import('../views/management/RuleEditPage.vue') },
  // Verifications
  { path: '/verifications', name: 'VerificationList', component: () => import('../views/management/VerificationListPage.vue') },
  // Invitations
  { path: '/invitations', name: 'InvitationList', component: () => import('../views/management/InvitationListPage.vue') },
  { path: '/invitations/:organizationName/:invitationName', name: 'InvitationEdit', component: () => import('../views/management/InvitationEditPage.vue') },
  // Products
  { path: '/products', name: 'ProductList', component: () => import('../views/management/ProductListPage.vue') },
  { path: '/products/:organizationName/:productName', name: 'ProductEdit', component: () => import('../views/management/ProductEditPage.vue') },
  { path: '/products/:organizationName/:productName/buy', name: 'ProductBuy', component: () => import('../views/management/ProductBuyPage.vue') },
  { path: '/product-store', name: 'ProductStore', component: () => import('../views/management/ProductStorePage.vue') },
  { path: '/cart', name: 'Cart', component: () => import('../views/management/CartListPage.vue') },
  // Pricing / Plans / Orders / Payments
  { path: '/pricings', name: 'PricingList', component: () => import('../views/management/PricingListPage.vue') },
  { path: '/pricings/:organizationName/:pricingName', name: 'PricingEdit', component: () => import('../views/management/PricingEditPage.vue') },
  { path: '/plans', name: 'PlanList', component: () => import('../views/management/PlanListPage.vue') },
  { path: '/plans/:organizationName/:planName', name: 'PlanEdit', component: () => import('../views/management/PlanEditPage.vue') },
  { path: '/orders', name: 'OrderList', component: () => import('../views/management/OrderListPage.vue') },
  { path: '/orders/:organizationName/:orderName', name: 'OrderEdit', component: () => import('../views/management/OrderEditPage.vue') },
  { path: '/orders/:organizationName/:orderName/pay', name: 'OrderPay', component: () => import('../views/management/OrderPayPage.vue') },
  { path: '/payments', name: 'PaymentList', component: () => import('../views/management/PaymentListPage.vue') },
  { path: '/payments/:organizationName/:paymentName', name: 'PaymentEdit', component: () => import('../views/management/PaymentEditPage.vue') },
  { path: '/payments/:organizationName/:paymentName/result', name: 'PaymentResult', component: () => import('../views/management/PaymentResultPage.vue') },
  { path: '/subscriptions', name: 'SubscriptionList', component: () => import('../views/management/SubscriptionListPage.vue') },
  { path: '/subscriptions/:organizationName/:subscriptionName', name: 'SubscriptionEdit', component: () => import('../views/management/SubscriptionEditPage.vue') },
  { path: '/transactions', name: 'TransactionList', component: () => import('../views/management/TransactionListPage.vue') },
  { path: '/transactions/:organizationName/:transactionName', name: 'TransactionEdit', component: () => import('../views/management/TransactionEditPage.vue') },
  // LDAP
  { path: '/ldap/:organizationName/:ldapId', name: 'LdapEdit', component: () => import('../views/management/LdapEditPage.vue') },
  { path: '/ldap/sync/:organizationName/:ldapId', name: 'LdapSync', component: () => import('../views/management/LdapSyncPage.vue') },
  // Forms
  { path: '/forms', name: 'FormList', component: () => import('../views/management/FormListPage.vue') },
  { path: '/forms/:formName', name: 'FormEdit', component: () => import('../views/management/FormEditPage.vue') },
  // Syncers
  { path: '/syncers', name: 'SyncerList', component: () => import('../views/management/SyncerListPage.vue') },
  { path: '/syncers/:syncerName', name: 'SyncerEdit', component: () => import('../views/management/SyncerEditPage.vue') },
  // Webhooks
  { path: '/webhooks', name: 'WebhookList', component: () => import('../views/management/WebhookListPage.vue') },
  { path: '/webhooks/:webhookName', name: 'WebhookEdit', component: () => import('../views/management/WebhookEditPage.vue') },
  // Tickets
  { path: '/tickets', name: 'TicketList', component: () => import('../views/management/TicketListPage.vue') },
  { path: '/tickets/:organizationName/:ticketName', name: 'TicketEdit', component: () => import('../views/management/TicketEditPage.vue') },
  // System
  { path: '/sysinfo', name: 'SystemInfo', component: () => import('../views/management/SystemInfoPage.vue') },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes: [...entryRoutes, ...managementRoutes],
})

export default router
