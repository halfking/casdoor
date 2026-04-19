<template>
  <div class="shortcuts-container">
    <div class="shortcuts-grid">
      <a-row :gutter="[24, 24]" justify="center">
        <a-col
          v-for="item in shortcuts"
          :key="item.link"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <router-link :to="item.link" class="shortcut-card-link">
            <a-card hoverable class="shortcut-card">
              <template #cover>
                <div class="card-cover">
                  <component :is="item.icon" class="card-icon" />
                </div>
              </template>
              <a-card-meta :title="item.name">
                <template #description>
                  {{ item.description }}
                </template>
              </a-card-meta>
            </a-card>
          </router-link>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import {
  BankOutlined,
  UserOutlined,
  ApiOutlined,
  AppstoreOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  TeamOutlined,
  DatabaseOutlined,
} from "@ant-design/icons-vue";

const { t } = useI18n();

const shortcuts = computed(() => [
  {
    link: "/management/organizations",
    name: t("general:Organizations"),
    description: t("general:User containers"),
    icon: BankOutlined,
  },
  {
    link: "/management/users",
    name: t("general:Users"),
    description: t("general:Users under all organizations"),
    icon: UserOutlined,
  },
  {
    link: "/management/providers",
    name: t("application:Providers"),
    description: t("general:OAuth providers"),
    icon: ApiOutlined,
  },
  {
    link: "/management/applications",
    name: t("general:Applications"),
    description: t("general:Applications that require authentication"),
    icon: AppstoreOutlined,
  },
  {
    link: "/management/roles",
    name: t("general:Roles"),
    description: t("general:Manage roles for users"),
    icon: SafetyCertificateOutlined,
  },
  {
    link: "/management/permissions",
    name: t("general:Permissions"),
    description: t("general:Manage permissions for resources"),
    icon: LockOutlined,
  },
  {
    link: "/management/groups",
    name: t("general:Groups"),
    description: t("general:User groups"),
    icon: TeamOutlined,
  },
  {
    link: "/management/adapters",
    name: t("general:Adapters"),
    description: t("general:Manage adapters"),
    icon: DatabaseOutlined,
  },
]);
</script>

<style scoped>
.shortcuts-container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding: 24px;
}

.shortcuts-grid {
  width: 100%;
  max-width: 1200px;
}

.shortcut-card-link {
  text-decoration: none;
  display: block;
}

.shortcut-card {
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.shortcut-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-cover {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: var(--kx-bg-card, #f5f5f5);
}

.card-icon {
  font-size: 48px;
  color: var(--ant-color-primary, #1677ff);
}
</style>
