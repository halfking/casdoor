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
    />

    <a-layout>
      <!-- Sidebar (desktop) -->
      <a-layout-sider
        v-if="!isMobile"
        v-model:collapsed="collapsed"
        :width="220"
        :collapsed-width="64"
        collapsible
        theme="light"
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
} from "@ant-design/icons-vue";
import SharedNavbar from "@kx/shared/components/SharedNavbar.vue";
import { useAuthStore } from "@/stores/auth";
import { useAppStore } from "@/stores/app";
import * as Conf from "@/Conf";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const authStore = useAuthStore();
const appStore = useAppStore();

const collapsed = ref(false);
const drawerVisible = ref(false);
const isMobile = ref(false);

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
      { key: "/", label: h("router-link", { to: "/" }, () => t("general.Dashboard")) },
      { key: "/shortcuts", label: h("router-link", { to: "/shortcuts" }, () => t("general.Shortcuts")) },
      { key: "/apps", label: h("router-link", { to: "/apps" }, () => t("general.Apps")) },
    ],
  });

  // User Management
  res.push({
    key: "/orgs",
    label: t("general.User Management"),
    icon: () => h(AppstoreOutlined, { style: { color } }),
    children: [
      { key: "/organizations", label: h("router-link", { to: "/organizations" }, () => t("general.Organizations")) },
      { key: "/groups", label: h("router-link", { to: "/groups" }, () => t("general.Groups")) },
      { key: "/users", label: h("router-link", { to: "/users" }, () => t("general.Users")) },
      { key: "/invitations", label: h("router-link", { to: "/invitations" }, () => t("general.Invitations")) },
    ],
  });

  // Identity
  res.push({
    key: "/identity",
    label: t("general.Identity"),
    icon: () => h(LockOutlined, { style: { color } }),
    children: [
      { key: "/applications", label: h("router-link", { to: "/applications" }, () => t("general.Applications")) },
      { key: "/providers", label: h("router-link", { to: "/providers" }, () => t("application.Providers")) },
      { key: "/resources", label: h("router-link", { to: "/resources" }, () => t("general.Resources")) },
      { key: "/certs", label: h("router-link", { to: "/certs" }, () => t("general.Certs")) },
      { key: "/sites", label: h("router-link", { to: "/sites" }, () => t("general.Sites")) },
      { key: "/rules", label: h("router-link", { to: "/rules" }, () => t("general.Rules")) },
    ],
  });

  // Authorization
  const authChildren: MenuItem[] = [
    { key: "/roles", label: h("router-link", { to: "/roles" }, () => t("general.Roles")) },
    { key: "/permissions", label: h("router-link", { to: "/permissions" }, () => t("general.Permissions")) },
  ];
  if (authStore.isAdmin) {
    authChildren.push(
      { key: "/models", label: h("router-link", { to: "/models" }, () => t("general.Models")) },
      { key: "/adapters", label: h("router-link", { to: "/adapters" }, () => t("general.Adapters")) },
      { key: "/enforcers", label: h("router-link", { to: "/enforcers" }, () => t("general.Enforcers")) },
    );
  }
  res.push({
    key: "/auth",
    label: t("general.Authorization"),
    icon: () => h(SafetyCertificateOutlined, { style: { color } }),
    children: authChildren,
  });

  // Gateway
  res.push({
    key: "/gateway",
    label: t("general.Gateway"),
    icon: () => h(CheckCircleOutlined, { style: { color } }),
    children: [
      { key: "/sites", label: h("router-link", { to: "/sites" }, () => t("general.Sites")) },
      { key: "/certs", label: h("router-link", { to: "/certs" }, () => t("general.Certs")) },
      { key: "/rules", label: h("router-link", { to: "/rules" }, () => t("general.Rules")) },
    ],
  });

  // Logging & Auditing
  res.push({
    key: "/logs",
    label: t("general.Logging & Auditing"),
    icon: () => h(WalletOutlined, { style: { color } }),
    children: [
      { key: "/sessions", label: h("router-link", { to: "/sessions" }, () => t("general.Sessions")) },
      { key: "/records", label: h("router-link", { to: "/records" }, () => t("general.Records")) },
      { key: "/tokens", label: h("router-link", { to: "/tokens" }, () => t("general.Tokens")) },
      { key: "/verifications", label: h("router-link", { to: "/verifications" }, () => t("general.Verifications")) },
    ],
  });

  // Business & Payments
  res.push({
    key: "/business",
    label: t("general.Business & Payments"),
    icon: () => h(DollarOutlined, { style: { color } }),
    children: [
      { key: "/product-store", label: h("router-link", { to: "/product-store" }, () => t("general.Product Store")) },
      { key: "/products", label: h("router-link", { to: "/products" }, () => t("general.Products")) },
      { key: "/cart", label: h("router-link", { to: "/cart" }, () => t("general.Cart")) },
      { key: "/orders", label: h("router-link", { to: "/orders" }, () => t("general.Orders")) },
      { key: "/payments", label: h("router-link", { to: "/payments" }, () => t("general.Payments")) },
      { key: "/plans", label: h("router-link", { to: "/plans" }, () => t("general.Plans")) },
      { key: "/pricings", label: h("router-link", { to: "/pricings" }, () => t("general.Pricings")) },
      { key: "/subscriptions", label: h("router-link", { to: "/subscriptions" }, () => t("general.Subscriptions")) },
      { key: "/transactions", label: h("router-link", { to: "/transactions" }, () => t("general.Transactions")) },
    ],
  });

  // Admin
  const adminChildren: MenuItem[] = [];
  if (authStore.isAdmin) {
    adminChildren.push({ key: "/sysinfo", label: h("router-link", { to: "/sysinfo" }, () => t("general.System Info")) });
  }
  adminChildren.push(
    { key: "/forms", label: h("router-link", { to: "/forms" }, () => t("general.Forms")) },
    { key: "/syncers", label: h("router-link", { to: "/syncers" }, () => t("general.Syncers")) },
    { key: "/webhooks", label: h("router-link", { to: "/webhooks" }, () => t("general.Webhooks")) },
    { key: "/tickets", label: h("router-link", { to: "/tickets" }, () => t("general.Tickets")) },
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
      return { ...item, children: item.children.filter((c) => ni.includes(c.key)) };
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
  // External links handled by <a> href; internal by <router-link>
  drawerVisible.value = false;
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
</style>
