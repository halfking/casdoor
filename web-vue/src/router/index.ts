import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getAccount } from "@/api/modules/auth";

// ── Auth / Entry pages (eager-loaded placeholder views for now) ──
const entryRoutes: RouteRecordRaw[] = [
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
  { path: "/cas/:owner/:casApplicationName/logout", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry", guest: true } },
  { path: "/cas/:owner/:casApplicationName/login", component: () => import("@/views/auth/LoginPage.vue"), meta: { layout: "entry" } },
  { path: "/select-plan/:owner/:pricingName", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/buy-plan/:owner/:pricingName", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/buy-plan/:owner/:pricingName/result", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/qrcode/:owner/:paymentName", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
  { path: "/captcha", component: () => import("@/views/auth/PlaceholderPage.vue"), meta: { layout: "entry" } },
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
  { path: "/shortcuts", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/apps", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },

  // User Management
  { path: "/organizations", redirect: "/management/organizations" },
  { path: "/organizations/:organizationName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/organizations/:organizationName/users", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/groups", redirect: "/management/groups" },
  { path: "/groups/:organizationName/:groupName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/users", redirect: "/management/users" },
  { path: "/users/:organizationName/:userName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/invitations", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/invitations/:organizationName/:invitationName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },

  // Identity
  { path: "/applications", redirect: "/management/applications" },
  { path: "/applications/:organizationName/:applicationName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/providers", redirect: "/management/providers" },
  { path: "/providers/:organizationName/:providerName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/resources", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/certs", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/certs/:organizationName/:certName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },

  // Authorization
  { path: "/roles", redirect: "/management/roles" },
  { path: "/roles/:organizationName/:roleName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/permissions", redirect: "/management/permissions" },
  { path: "/permissions/:organizationName/:permissionName", component: () => import("@/views/basic/PlaceholderPage.vue"), meta: { layout: "management", requiresAuth: true } },
  { path: "/models", redirect: "/management/models" },
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
