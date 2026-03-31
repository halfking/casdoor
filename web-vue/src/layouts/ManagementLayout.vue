<template>
  <a-layout class="management-layout">
    <!-- SharedNavbar across top -->
    <SharedNavbar
      app-name="认证中心"
      :is-authenticated="authStore.isAuthenticated"
      :auth-token="authStore.accessToken"
      :hide-portal-nav="true"
      @login="handleLogin"
      @logout="handleLogout"
    >
      <LanguageSelect />
      <button
        type="button"
        class="kx-shared-navbar__btn-link kx-shared-navbar__theme-toggle"
        :title="appStore.isDark ? '浅色模式' : '暗色模式'"
        @click="toggleTheme"
      >
        <span class="kx-shared-navbar__theme-toggle-label">{{ appStore.isDark ? '浅色' : '暗色' }}</span>
      </button>
    </SharedNavbar>

    <a-layout>
      <!-- Sidebar (desktop) -->
      <a-layout-sider
        v-if="!isMobile"
        v-model:collapsed="collapsed"
        :width="220"
        :collapsed-width="64"
        collapsible
        :theme="siderTheme"
        class="management-sider"
      >
        <!-- Logo -->
        <div class="sider-logo">
          <router-link to="/">
            <img :src="logoSrc" alt="logo" class="logo-img" />
          </router-link>
        </div>

        <a-menu
          v-model:selectedKeys="selectedKeys"
          v-model:openKeys="openKeys"
          mode="inline"
          :items="menuItems"
          @click="handleMenuClick"
        />

        <!-- Sidebar bottom: AI chat quick entry -->
        <div class="sider-ai-entry">
          <a-tooltip :title="collapsed ? 'AI 会话' : ''" placement="right">
            <button type="button" class="sider-ai-btn" @click="handleAiChat">
              <img src="/assets/icon-ai-chat.svg" alt="AI会话" class="sider-ai-icon" />
              <span v-if="!collapsed" class="sider-ai-label">AI 会话</span>
            </button>
          </a-tooltip>
        </div>
      </a-layout-sider>

      <!-- Mobile drawer -->
      <a-drawer
        v-if="isMobile"
        :open="drawerVisible"
        placement="left"
        :title="t('general.Close')"
        @close="drawerVisible = false"
      >
        <a-menu
          v-model:selectedKeys="selectedKeys"
          v-model:openKeys="openKeys"
          mode="inline"
          :items="menuItems"
          @click="drawerVisible = false"
        />
      </a-drawer>

      <a-layout-content class="management-content">
        <!-- Mobile menu trigger -->
        <a-button
          v-if="isMobile"
          type="text"
          class="mobile-menu-btn"
          @click="drawerVisible = true"
        >
          <bars-outlined />
          {{ t("general.Menu") }}
        </a-button>

        <a-card v-if="!isWithoutCard" class="content-warp-card">
          <router-view />
        </a-card>
        <router-view v-else />
      </a-layout-content>
    </a-layout>

    <!-- Bottom status bar -->
    <footer class="kx-status-bar">
      <div class="kx-status-left">
        <span class="kx-status-item">版本 v{{ appVersion }}</span>
        <span class="kx-status-divider">|</span>
        <span class="kx-status-item">
          <span class="kx-status-indicator" :class="serviceStatus"></span>
          服务状态: {{ serviceStatus === 'healthy' ? '正常' : '异常' }}
        </span>
      </div>
      <div class="kx-status-right">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          class="kx-icp-link"
        >京ICP备XXXXXXXX号-X</a>
        <span class="kx-status-divider">|</span>
        <span class="kx-status-copyright">© 2026 开轩启圭</span>
      </div>
    </footer>
  </a-layout>
</template>

<script setup lang="ts">
import { computed, h, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  BarsOutlined,
  HomeOutlined,
  AppstoreOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  WalletOutlined,
  DollarOutlined,
  SettingOutlined,
  FolderOutlined,
} from "@ant-design/icons-vue";
import SharedNavbar from "@/shared/components/SharedNavbar.vue";
import LanguageSelect from "@/components/LanguageSelect.vue";
import { useAuthStore } from "@/stores/auth";
import { useAppStore } from "@/stores/app";
import * as Conf from "@/Conf";
import appPkg from "../../package.json";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const authStore = useAuthStore();
const appStore = useAppStore();

const collapsed = ref(false);
const drawerVisible = ref(false);
const isMobile = ref(false);
const appVersion = appPkg.version;
const serviceStatus = ref<'healthy' | 'error'>('healthy');

// Sidebar theme follows dark mode
const siderTheme = computed(() => (appStore.isDark ? "dark" : "light"));

// Theme toggle
function toggleTheme() {
  if (appStore.isDark) {
    const next = appStore.themeAlgorithm.filter((a: string) => a !== "dark");
    if (!next.includes("default")) next.push("default");
    appStore.setThemeAlgorithm(next);
  } else {
    const next = [...appStore.themeAlgorithm.filter((a: string) => a !== "default"), "dark"];
    appStore.setThemeAlgorithm(next);
  }
}

// Detect mobile
function checkMobile() {
  isMobile.value = window.innerWidth < 768;
}
checkMobile();
window.addEventListener("resize", checkMobile);

// Logo
const logoSrc = computed(() => {
  const org = authStore.account?.organization;
  const isDark = appStore.themeAlgorithm.includes("dark");
  if (isDark && org?.logoDark) return String(org.logoDark);
  if (org?.logo) return String(org.logo);
  return isDark ? "/img/kaixuan-platform-logo-dark.svg" : "/img/kaixuan-platform-logo-light.svg";
});

// Current path → selected menu key
const selectedKeys = computed({
  get: () => [route.path],
  set: () => {},
});

const openKeys = ref<string[]>([]);

// Card / no-card logic
const isWithoutCard = computed(() => {
  return isMobile.value || route.path.startsWith("/trees");
});

// Theme color for TwoTone icons
const twoToneColor = computed(() => appStore.themeData.colorPrimary ?? "#5734d3");

// ── Menu Items (mirrors ManagementPage.js getMenuItems) ──
const navItems = computed(() => {
  const org = authStore.account?.organization;
  if (!org) return null;
  const isAdmin = authStore.isAdmin;
  return isAdmin ? org.navItems : (org.userNavItems ?? []);
});

function navItemsIsAll() {
  const ni = navItems.value;
  return !Array.isArray(ni) || ni.includes("all");
}

function isSpecialMenuItem(item: any) {
  return item.key === "#" || item.key === "logo";
}

const legacyToManagementRouteMap: Record<string, string> = {
  "/organizations": "/management/organizations",
  "/groups": "/management/groups",
  "/users": "/management/users",
  "/applications": "/management/applications",
  "/providers": "/management/providers",
  "/roles": "/management/roles",
  "/permissions": "/management/permissions",
  "/models": "/management/models",
  "/departments": "/management/departments",
  "/posts": "/management/posts",
  "/menus": "/management/menus",
  "/permission-rules": "/management/permission-rules",
};

function resolveMenuRoute(key: string): string {
  return legacyToManagementRouteMap[key] || key;
}

function isNavItemAllowed(navItems: string[], key: string): boolean {
  if (navItems.includes(key)) {
    return true;
  }
  const legacyEntry = Object.entries(legacyToManagementRouteMap).find(([, mapped]) => mapped === key);
  return !!legacyEntry && navItems.includes(legacyEntry[0]);
}

type MenuItem = {
  key: string;
  label?: any;
  icon?: any;
  children?: MenuItem[];
  type?: string;
};

const menuItems = computed(() => {
  if (!authStore.account) return [];

  const color = twoToneColor.value;
  const res: MenuItem[] = [];

  // Home
  res.push({
    key: "/home",
    label: t("general.Home"),
    icon: () => h(HomeOutlined, { style: { color } }),
    children: [
      { key: "/", label: t("general.Dashboard") },
      { key: "/shortcuts", label: t("general.Shortcuts") },
      { key: "/apps", label: t("general.Apps") },
    ],
  });

  // User Management
  res.push({
    key: "/orgs",
    label: t("general.User Management"),
    icon: () => h(AppstoreOutlined, { style: { color } }),
    children: [
      { key: resolveMenuRoute("/organizations"), label: t("general.Organizations") },
      { key: resolveMenuRoute("/groups"), label: t("general.Groups") },
      { key: resolveMenuRoute("/users"), label: t("general.Users") },
      { key: "/invitations", label: t("general.Invitations") },
    ],
  });

  // Identity
  res.push({
    key: "/identity",
    label: t("general.Identity"),
    icon: () => h(LockOutlined, { style: { color } }),
    children: [
      { key: resolveMenuRoute("/applications"), label: t("general.Applications") },
      { key: resolveMenuRoute("/providers"), label: t("application.Providers") },
      { key: "/resources", label: t("general.Resources") },
      { key: "/certs", label: t("general.Certs") },
      { key: "/sites", label: t("general.Sites") },
      { key: "/rules", label: t("general.Rules") },
    ],
  });

  // Authorization
  const authChildren: MenuItem[] = [
    { key: resolveMenuRoute("/roles"), label: t("general.Roles") },
    { key: resolveMenuRoute("/permissions"), label: t("general.Permissions") },
  ];
  if (authStore.isAdmin) {
    authChildren.push(
      { key: resolveMenuRoute("/models"), label: t("general.Models") },
      { key: "/adapters", label: t("general.Adapters") },
      { key: "/enforcers", label: t("general.Enforcers") },
    );
  }
  res.push({
    key: "/auth",
    label: t("general.Authorization"),
    icon: () => h(SafetyCertificateOutlined, { style: { color } }),
    children: authChildren,
    });

    // Organization
    res.push({
      key: "/organization",
      label: t("general:Organization"),
      icon: () => h(FolderOutlined, { style: { color } }),
      children: [
        { key: resolveMenuRoute("/departments"), label: t("organization:Departments") },
        { key: resolveMenuRoute("/posts"), label: t("organization:Posts") },
        { key: resolveMenuRoute("/menus"), label: t("organization:Menus") },
        { key: resolveMenuRoute("/permission-rules"), label: t("permission:Permission Rules") },
      ],
  });

  // Gateway
  res.push({
    key: "/gateway",
    label: t("general.Gateway"),
    icon: () => h(CheckCircleOutlined, { style: { color } }),
    children: [
      { key: "/sites", label: t("general.Sites") },
      { key: "/certs", label: t("general.Certs") },
      { key: "/rules", label: t("general.Rules") },
    ],
  });

  // Logging & Auditing
  res.push({
    key: "/logs",
    label: t("general.Logging & Auditing"),
    icon: () => h(WalletOutlined, { style: { color } }),
    children: [
      { key: "/sessions", label: t("general.Sessions") },
      { key: "/records", label: t("general.Records") },
      { key: "/tokens", label: t("general.Tokens") },
      { key: "/verifications", label: t("general.Verifications") },
    ],
  });

  // Business & Payments
  res.push({
    key: "/business",
    label: t("general.Business & Payments"),
    icon: () => h(DollarOutlined, { style: { color } }),
    children: [
      { key: "/product-store", label: t("general.Product Store") },
      { key: "/products", label: t("general.Products") },
      { key: "/cart", label: t("general.Cart") },
      { key: "/orders", label: t("general.Orders") },
      { key: "/payments", label: t("general.Payments") },
      { key: "/plans", label: t("general.Plans") },
      { key: "/pricings", label: t("general.Pricings") },
      { key: "/subscriptions", label: t("general.Subscriptions") },
      { key: "/transactions", label: t("general.Transactions") },
    ],
  });

  // Admin
  const adminChildren: MenuItem[] = [];
  if (authStore.isAdmin) {
    adminChildren.push({ key: "/sysinfo", label: t("general.System Info") });
  }
  adminChildren.push(
    { key: "/forms", label: t("general.Forms") },
    { key: "/syncers", label: t("general.Syncers") },
    { key: "/webhooks", label: t("general.Webhooks") },
    { key: "/tickets", label: t("general.Tickets") },
  );
  if (authStore.isAdmin) {
    adminChildren.push({
      key: "/swagger",
      label: h("a", { href: "/swagger", target: "_blank", rel: "noreferrer" }, t("general.Swagger")),
    });
  }
  res.push({
    key: "/admin",
    label: t("general.Admin"),
    icon: () => h(SettingOutlined, { style: { color } }),
    children: adminChildren,
  });

  // Filter by org navItems
  if (navItemsIsAll()) {
    return maybeFlat(res);
  }

  const ni = navItems.value as string[];
  const filtered = res
    .map((item) => {
      if (!item.children) return item;
      return { ...item, children: item.children.filter((c) => isNavItemAllowed(ni, c.key)) };
    })
    .filter((item) => isSpecialMenuItem(item) || (item.children && item.children.length > 0));

  return maybeFlat(filtered);
});

function maybeFlat(items: MenuItem[]): MenuItem[] {
  let totalLeaves = 0;
  items.forEach((item) => {
    if (item.children) totalLeaves += item.children.length;
  });
  if (totalLeaves <= Conf.MaxItemsForFlatMenu) {
    const flat: MenuItem[] = [];
    items.forEach((item) => {
      if (isSpecialMenuItem(item)) {
        flat.push(item);
      } else if (item.children) {
        flat.push(...item.children);
      }
    });
    return flat;
  }
  return items;
}

function handleMenuClick(info: { key: string }) {
  drawerVisible.value = false;
  // External links (Swagger) handled by <a> href; internal routes via router.push
  if (info.key && !info.key.startsWith("http")) {
    router.push(info.key);
  }
}

function handleAiChat() {
  window.open('/', '_blank');
}

function handleLogin() {
  router.push("/login");
}

function handleLogout() {
  authStore.logout();
  router.push("/login");
}

// Auto-expand menu based on current route
watch(
  () => route.path,
  (path) => {
    for (const item of menuItems.value) {
      if (item.children?.some((c) => c.key === path || path.startsWith(c.key + "/"))) {
        if (!openKeys.value.includes(item.key)) {
          openKeys.value = [...openKeys.value, item.key];
        }
        break;
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.management-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.management-sider {
  border-right: 1px solid var(--kx-border, #d9e1ea);
}

.management-sider .sider-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 8px;
}

.sider-logo .logo-img {
  height: 32px;
  max-width: 100%;
  object-fit: contain;
}

.management-content {
  display: flex;
  flex-direction: column;
  padding: 12px;
  min-height: calc(100vh - 62px);
}

.content-warp-card {
  flex: 1;
  border-radius: var(--kx-radius-card, 10px);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.mobile-menu-btn {
  margin-bottom: 8px;
}

/* Sidebar bottom AI entry */
.sider-ai-entry {
  position: sticky;
  bottom: 0;
  padding: 8px;
  border-top: 1px solid var(--kx-border, rgba(0, 0, 0, 0.06));
  background: inherit;
}

.sider-ai-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: var(--kx-radius, 6px);
  background: transparent;
  cursor: pointer;
  color: inherit;
  transition: background 0.2s;
}

.sider-ai-btn:hover {
  background: rgba(59, 130, 246, 0.08);
}

.sider-ai-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sider-ai-label {
  font-size: 13px;
  color: var(--kx-text-2, #374151);
  white-space: nowrap;
  overflow: hidden;
}

/* Bottom status bar */
.kx-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--kx-status-bar-height, 32px);
  padding: 0 16px;
  font-size: 11px;
  background: var(--kx-status-bar-bg, #f3f4f6);
  border-top: 1px solid var(--kx-status-bar-border, #e5e7eb);
  color: var(--kx-status-bar-text, #6b7280);
  flex-shrink: 0;
}

.kx-status-left,
.kx-status-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kx-status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.kx-status-divider {
  opacity: 0.4;
}

.kx-status-indicator {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.kx-status-indicator.healthy {
  background: #22c55e;
}

.kx-status-indicator.error {
  background: #ef4444;
}

.kx-icp-link {
  color: var(--kx-status-bar-text, #6b7280);
  text-decoration: none;
  font-size: 11px;
  transition: color 0.2s;
}

.kx-icp-link:hover {
  color: var(--kx-status-bar-text-highlight, #374151);
  text-decoration: underline;
}

.kx-status-copyright {
  font-size: 11px;
  color: var(--kx-status-bar-text, #6b7280);
}

@media (max-width: 767px) {
  .kx-status-bar {
    font-size: 10px;
    padding: 0 8px;
    gap: 4px;
  }

  .kx-status-left .kx-status-item:nth-child(5),
  .kx-status-left .kx-status-item:nth-child(6) {
    display: none;
  }
}
</style>
