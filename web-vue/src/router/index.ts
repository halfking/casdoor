import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

// ── Auth / Entry pages (eager-loaded placeholder views for now) ──
const entryRoutes: RouteRecordRaw[] = [
  { path: "/signup", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry", guest: true } },
  { path: "/signup/:applicationName", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry", guest: true } },
  { path: "/login", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry", guest: true } },
  { path: "/login/:owner", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry", guest: true } },
  { path: "/signup/oauth/authorize", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/login/oauth/authorize", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/login/oauth/device/:userCode", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/login/saml/authorize/:owner/:applicationName", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/forget", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/forget/:applicationName", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/prompt", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry", requiresAuth: true } },
  { path: "/prompt/:applicationName", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry", requiresAuth: true } },
  { path: "/consent/:applicationName", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry", requiresAuth: true } },
  { path: "/result", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry", guest: true } },
  { path: "/result/:applicationName", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry", guest: true } },
  { path: "/cas/:owner/:casApplicationName/logout", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry", guest: true } },
  { path: "/cas/:owner/:casApplicationName/login", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/select-plan/:owner/:pricingName", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/buy-plan/:owner/:pricingName", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/buy-plan/:owner/:pricingName/result", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/qrcode/:owner/:paymentName", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/captcha", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  // OAuth callbacks
  { path: "/callback", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/callback/saml", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/callback/telegram", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
];

// ── Management pages (lazy-loaded placeholders) ──
const managementRoutes: RouteRecordRaw[] = [
  // Home
  { path: "/", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/shortcuts", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/apps", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },

  // User Management
  { path: "/organizations", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/organizations/:organizationName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/organizations/:organizationName/users", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/groups", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/groups/:organizationName/:groupName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/users", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/users/:organizationName/:userName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/invitations", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/invitations/:organizationName/:invitationName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },

  // Identity
  { path: "/applications", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/applications/:organizationName/:applicationName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/providers", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/providers/:organizationName/:providerName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/resources", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/certs", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/certs/:organizationName/:certName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },

  // Authorization
  { path: "/roles", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/roles/:organizationName/:roleName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/permissions", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/permissions/:organizationName/:permissionName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/models", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/models/:organizationName/:modelName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/adapters", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/adapters/:organizationName/:adapterName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/enforcers", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/enforcers/:organizationName/:enforcerName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },

  // Logging & Auditing
  { path: "/sessions", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/records", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/tokens", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/tokens/:tokenName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/verifications", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },

  // Business
  { path: "/products", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/products/:organizationName/:productName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/payments", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/payments/:organizationName/:paymentName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/plans", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/plans/:organizationName/:planName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/pricings", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/pricings/:organizationName/:pricingName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/subscriptions", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/subscriptions/:organizationName/:subscriptionName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/transactions", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/transactions/:organizationName/:transactionName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/orders", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },

  // Admin
  { path: "/sysinfo", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/forms", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/syncers", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/syncers/:organizationName/:syncerName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/webhooks", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/webhooks/:organizationName/:webhookName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/tickets", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/swagger", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },

  // MFA setup
  { path: "/mfa/setup", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },

  // Catch-all
  { path: "/:pathMatch(.*)*", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management" } },
];

const router = createRouter({
  history: createWebHistory(),
  routes: [...entryRoutes, ...managementRoutes],
});

// Navigation guard
router.beforeEach((to) => {
  // Pages requiring auth will be guarded once auth store is wired up
  // For now, just pass through (placeholder implementation)
  if (to.meta.requiresAuth) {
    // TODO: check useAuthStore().isAuthenticated and redirect to /login
  }
  return true;
});

export default router;
