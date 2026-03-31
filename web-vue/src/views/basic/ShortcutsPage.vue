<template>
  <div class="shortcuts-container">
    <a-spin v-if="loading" tip="Loading..." />
    <div v-else class="shortcuts-grid">
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
                  <img :alt="item.name" :src="item.logo" class="card-logo" />
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
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const loading = ref(true);

interface ShortcutItem {
  link: string;
  name: string;
  description: string;
  logo: string;
}

const shortcuts = ref<ShortcutItem[]>([]);

onMounted(() => {
  // Build shortcuts items using i18n
  shortcuts.value = [
    {
      link: "/management/organizations",
      name: t("general:Organizations"),
      description: t("general:User containers"),
      logo: "/img/organizations.png",
    },
    {
      link: "/management/users",
      name: t("general:Users"),
      description: t("general:Users under all organizations"),
      logo: "/img/users.png",
    },
    {
      link: "/management/providers",
      name: t("application:Providers"),
      description: t("general:OAuth providers"),
      logo: "/img/providers.png",
    },
    {
      link: "/management/applications",
      name: t("general:Applications"),
      description: t("general:Applications that require authentication"),
      logo: "/img/applications.png",
    },
    {
      link: "/management/roles",
      name: t("general:Roles"),
      description: t("general:Manage roles for users"),
      logo: "/img/roles.png",
    },
    {
      link: "/management/permissions",
      name: t("general:Permissions"),
      description: t("general:Manage permissions for resources"),
      logo: "/img/permissions.png",
    },
    {
      link: "/management/groups",
      name: t("general:Groups"),
      description: t("general:User groups"),
      logo: "/img/groups.png",
    },
    {
      link: "/management/adapters",
      name: t("general:Adapters"),
      description: t("general:Manage adapters"),
      logo: "/img/adapters.png",
    },
  ];
  loading.value = false;
});
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
  background: #f5f5f5;
}

.card-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
}
</style>
