<template>
  <a-config-provider :theme="{ algorithm: themeAlgorithm }">
    <a-layout class="management-layout">
      <a-layout-sider
        v-if="!isMobile"
        v-model:collapsed="collapsed"
        collapsible
        width="260"
      >
        <div class="management-layout__logo">Casdoor</div>
        <a-menu
          mode="inline"
          theme="dark"
          :selected-keys="selectedKeys"
          :open-keys="openKeys"
          :items="menuItems"
          @openChange="handleOpenChange"
          @click="handleMenuClick"
        />
      </a-layout-sider>

      <a-drawer
        v-model:open="drawerOpen"
        placement="left"
        width="260"
        :closable="false"
        body-style="padding: 0"
      >
        <a-menu
          mode="inline"
          :selected-keys="selectedKeys"
          :open-keys="openKeys"
          :items="menuItems"
          @openChange="handleOpenChange"
          @click="handleDrawerMenuClick"
        />
      </a-drawer>

      <a-layout>
        <a-layout-header class="management-layout__header">
          <SharedNavbar @toggle-menu="toggleMenu" />
        </a-layout-header>

        <a-layout-content class="management-layout__content">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed, h, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { AppstoreOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons-vue";
import { theme } from "ant-design-vue";
import SharedNavbar from "@/components/common/SharedNavbar.vue";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const collapsed = ref(false);
const drawerOpen = ref(false);
const openKeys = ref<string[]>(["/management/user-management"]);
const isMobile = ref(false);
const isDarkMode = ref(false);

const menuItems = computed(() => [
  {
    key: "/management/user-management",
    icon: () => h(AppstoreOutlined),
    label: t("general:User Management"),
    children: [
      { key: "/management/organizations", label: t("general:Organizations") },
      { key: "/management/groups", label: t("general:Groups") },
      { key: "/management/groups/tree", label: t("group:Group Tree") },
      { key: "/management/users", label: t("general:Users") },
    ],
  },
  {
    key: "/management/identity",
    icon: () => h(LockOutlined),
    label: t("general:Identity"),
    children: [
      { key: "/management/applications", label: t("general:Applications") },
      { key: "/management/providers", label: t("application:Providers") },
    ],
  },
  {
    key: "/management/authorization",
    icon: () => h(SafetyOutlined),
    label: t("general:Authorization"),
    children: [
      { key: "/management/roles", label: t("general:Roles") },
      { key: "/management/permissions", label: t("general:Permissions") },
      { key: "/management/models", label: t("general:Models") },
    ],
  },
]);

const selectedKeys = computed(() => {
  if (route.path.startsWith("/management/groups/tree")) {
    return ["/management/groups/tree"];
  }

  const groups = [
    "/management/organizations",
    "/management/groups",
    "/management/users",
    "/management/applications",
    "/management/providers",
    "/management/roles",
    "/management/permissions",
    "/management/models",
  ];

  const matched = groups.find((item) => route.path.startsWith(item));
  return [matched || "/management/users"];
});

const themeAlgorithm = computed(() => (isDarkMode.value ? theme.darkAlgorithm : theme.defaultAlgorithm));
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

function syncViewport() {
  isMobile.value = window.innerWidth < 992;
}

function syncTheme() {
  isDarkMode.value = mediaQuery.matches;
}

function toggleMenu() {
  if (isMobile.value) {
    drawerOpen.value = !drawerOpen.value;
    return;
  }

  collapsed.value = !collapsed.value;
}

function handleOpenChange(keys: string[]) {
  openKeys.value = keys;
}

function handleMenuClick({ key }: { key: string }) {
  void router.push(key);
}

function handleDrawerMenuClick({ key }: { key: string }) {
  drawerOpen.value = false;
  void router.push(key);
}

onMounted(() => {
  syncViewport();
  syncTheme();
  window.addEventListener("resize", syncViewport);
  mediaQuery.addEventListener("change", syncTheme);
});

onUnmounted(() => {
  window.removeEventListener("resize", syncViewport);
  mediaQuery.removeEventListener("change", syncTheme);
});
</script>

<style scoped>
.management-layout {
  min-height: 100vh;
}

.management-layout__logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}

.management-layout__header {
  display: flex;
  align-items: center;
  padding: 0 16px;
  background: var(--ant-color-bg-container);
  border-bottom: 1px solid var(--ant-color-border-secondary);
}

.management-layout__content {
  padding: 24px;
  overflow: auto;
}

@media (max-width: 991px) {
  .management-layout__content {
    padding: 16px;
  }
}
</style>
