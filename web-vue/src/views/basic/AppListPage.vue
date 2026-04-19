<template>
  <div class="app-list-container">
    <a-spin v-if="loading" tip="Loading..." />
    <div v-else>
      <!-- Tags filter -->
      <div v-if="allTags.length > 0" class="tags-filter">
        <a-checkbox-group v-model:value="selectedTags" @change="handleTagChange">
          <a-checkbox v-for="tag in allTags" :key="tag" :value="tag">
            <a-tag :color="generateTagColor(tag)">{{ tag }}</a-tag>
          </a-checkbox>
        </a-checkbox-group>
      </div>

      <!-- Applications grid -->
      <a-row :gutter="[24, 24]" justify="center">
        <a-col
          v-for="app in filteredApps"
          :key="app.name"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <router-link :to="`/management/applications/${app.owner}/${app.name}`" class="app-card-link">
            <a-card hoverable class="app-card">
              <template #cover>
                <div class="card-cover">
                  <img v-if="app.logo" :alt="app.name" :src="app.logo" class="card-logo" />
                  <div v-else class="card-logo-placeholder">
                    <span>{{ app.displayName?.charAt(0) || app.name.charAt(0) }}</span>
                  </div>
                </div>
              </template>
              <a-card-meta :title="app.displayName || app.name">
                <template #description>
                  {{ app.description || '' }}
                </template>
              </a-card-meta>
              <template #actions>
                <a-tag v-for="tag in app.tags" :key="tag" :color="generateTagColor(tag)" style="margin-top: 4px">
                  {{ tag }}
                </a-tag>
              </template>
            </a-card>
          </router-link>
        </a-col>
      </a-row>

      <a-empty v-if="filteredApps.length === 0" description="No applications" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import * as ApplicationApi from "@/api/modules/application";
import { useAuthStore } from "@/stores/auth";

const { t } = useI18n();
const authStore = useAuthStore();
const loading = ref(true);
const applications = ref<any[]>([]);
const selectedTags = ref<string[]>([]);
const allTags = ref<string[]>([]);

const filteredApps = computed(() => {
  if (selectedTags.value.length === 0) {
    return applications.value;
  }
  return applications.value.filter((app) => {
    if (!app.tags || !Array.isArray(app.tags)) return false;
    return selectedTags.value.every((tag) => app.tags.includes(tag));
  });
});

function sortApps(apps: any[]) {
  return [...apps].sort((a, b) => (a.order || 0) - (b.order || 0));
}

function extractTags(apps: any[]) {
  const tagsSet = new Set<string>();
  apps.forEach((app) => {
    if (app.tags && Array.isArray(app.tags)) {
      app.tags.forEach((tag: string) => tagsSet.add(tag));
    }
  });
  return Array.from(tagsSet);
}

function generateTagColor(tag: string): string {
  const colors = [
    "#ff4d4f", "#f5222d", "#ff7a45", "#fa541c",
    "#ffa940", "#fa8c16", "#ffc53d", "#faad14",
    "#ffec3d", "#fadb14", "#bae637", "#a0d911",
    "#73d13d", "#52c41a", "#36cfc9", "#13c2c2",
    "#40a9ff", "#1890ff", "#f759ab", "#eb2f96",
  ];
  let hash = 5381;
  for (let i = 0; i < tag.length; i++) {
    hash = ((hash << 5) + hash) + tag.charCodeAt(i);
  }
  return colors[Math.abs(hash) % colors.length];
}

function handleTagChange() {
  // Filtering is done via computed property
}

onMounted(async () => {
  if (!authStore.account) {
    loading.value = false;
    return;
  }

  try {
    const owner = authStore.account.owner;
    const response = await ApplicationApi.getApplicationsByOrganization("admin", owner, {
      page: 1,
      pageSize: 100,
    });
    if (response.status === "ok") {
      const apps = response.data || [];
      applications.value = sortApps(apps);
      allTags.value = extractTags(apps);
    }
  } catch (error) {
    console.error("Failed to load applications:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.app-list-container {
  padding: 24px;
}

.tags-filter {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.app-card-link {
  text-decoration: none;
  display: block;
}

.app-card {
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-cover {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: var(--kx-bg-card, #f5f5f5);
  min-height: 100px;
}

.card-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.card-logo-placeholder {
  width: 64px;
  height: 64px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #5734d3;
  color: white;
  font-size: 24px;
  border-radius: 8px;
}
</style>
