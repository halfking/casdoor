<template>
  <div class="group-tree-container">
    <a-spin v-if="loading" tip="Loading..." />
    <div v-else class="group-tree-content">
      <!-- Organization selector -->
      <div class="org-selector">
        <a-select
          v-model:value="organizationName"
          style="width: 200px"
          @change="handleOrgChange"
        >
          <a-select-option v-for="org in organizations" :key="org.name" :value="org.name">
            {{ org.displayName || org.name }}
          </a-select-option>
        </a-select>
      </div>

      <a-row :gutter="16" class="tree-user-row">
        <!-- Tree panel -->
        <a-col :span="selectedUser ? 8 : 24">
          <a-card title="Groups" size="small">
            <template #extra>
              <a-button type="text" size="small" @click="addGroup">
                <plus-outlined /> Add
              </a-button>
            </template>
            <a-tree
              v-if="treeData.length > 0"
              :tree-data="treeData"
              :selected-keys="selectedKeys"
              :expanded-keys="expandedKeys"
              :auto-expand-parent="true"
              @select="handleTreeSelect"
              @expand="handleTreeExpand"
            >
              <template #title="{ title, key, isLeaf }">
                <span class="tree-node-title">
                  <usergroup-add-outlined v-if="!isLeaf" />
                  <holder-outlined v-else />
                  <span>{{ title }}</span>
                </span>
              </template>
            </a-tree>
            <a-empty v-else description="No groups" />
          </a-card>
        </a-col>

        <!-- User list panel (when a group is selected) -->
        <a-col v-if="selectedUser" :span="16">
          <a-card :title="selectedGroupTitle" size="small">
            <template #extra>
              <a-button type="text" size="small" @click="selectedUser = false">
                <close-outlined /> Close
              </a-button>
            </template>
            <a-table
              :columns="userColumns"
              :data-source="groupUsers"
              :loading="usersLoading"
              :pagination="false"
              size="small"
              row-key="name"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <router-link :to="`/management/users/${record.owner}/${record.name}`">
                    {{ record.displayName || record.name }}
                  </router-link>
                </template>
                <template v-if="column.key === 'email'">
                  {{ record.email }}
                </template>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import {
  PlusOutlined,
  CloseOutlined,
  UsergroupAddOutlined,
  HolderOutlined,
} from "@ant-design/icons-vue";
import * as GroupApi from "@/api/modules/group";
import * as OrganizationApi from "@/api/modules/organization";
import * as UserApi from "@/api/modules/user";
import { useAuthStore } from "@/stores/auth";

const { t } = useI18n();
const route = useRoute();
const authStore = useAuthStore();
const loading = ref(true);
const usersLoading = ref(false);

// State
const organizations = ref<any[]>([]);
const organizationName = ref("");
const treeData = ref<any[]>([]);
const selectedKeys = ref<string[]>([]);
const expandedKeys = ref<string[]>([]);
const selectedUser = ref(false);
const selectedGroupTitle = ref("");
const groupUsers = ref<any[]>([]);

// Table columns
const userColumns = [
  { title: t("general.Name"), dataIndex: "name", key: "name" },
  { title: t("general.Email"), dataIndex: "email", key: "email" },
];

function handleOrgChange(value: string) {
  organizationName.value = value;
  selectedKeys.value = [];
  selectedUser.value = false;
  loadTreeData();
}

function handleTreeSelect(keys: string[], info: any) {
  if (keys.length > 0) {
    selectedKeys.value = keys;
    selectedGroupTitle.value = info.node.title;
    selectedUser.value = true;
    loadGroupUsers(keys[0]);
  }
}

function handleTreeExpand(keys: string[]) {
  expandedKeys.value = keys;
}

function addGroup() {
  message.info("Add group - redirect to group edit page");
}

async function loadOrganizations() {
  try {
    const response = await OrganizationApi.getOrganizations({ owner: "admin", pageSize: 100 });
    if (response.status === "ok") {
      organizations.value = response.data || [];
      if (organizations.value.length > 0) {
        organizationName.value = organizations.value[0].name;
      }
    }
  } catch (error) {
    message.error((error as Error).message);
  }
}

async function loadTreeData() {
  if (!organizationName.value) return;
  loading.value = true;
  try {
    const response = await GroupApi.getGroups({
      owner: organizationName.value,
      withTree: true,
      page: 1,
      pageSize: 100,
    });
    if (response.status === "ok") {
      treeData.value = response.data || [];
      // Auto expand first level
      if (treeData.value.length > 0) {
        expandedKeys.value = treeData.value.map((item: any) => item.key);
      }
    }
  } catch (error) {
    message.error((error as Error).message);
  } finally {
    loading.value = false;
  }
}

async function loadGroupUsers(groupKey: string) {
  usersLoading.value = true;
  try {
    // Extract owner and group name from key (format: "owner/groupName")
    const [owner, groupName] = groupKey.split("/");
    const response = await UserApi.getUsers({ owner, page: 1, pageSize: 100 });
    if (response.status === "ok") {
      groupUsers.value = response.data || [];
    }
  } catch (error) {
    message.error((error as Error).message);
  } finally {
    usersLoading.value = false;
  }
}

onMounted(async () => {
  // Get organization from route params or use current user
  const orgParam = route.params.organizationName as string;
  if (orgParam) {
    organizationName.value = orgParam;
  } else if (authStore.account) {
    organizationName.value = authStore.account.owner;
  }

  await loadOrganizations();
  await loadTreeData();
  loading.value = false;
});
</script>

<style scoped>
.group-tree-container {
  padding: 16px;
  height: 100%;
}

.org-selector {
  margin-bottom: 16px;
}

.tree-user-row {
  height: calc(100vh - 200px);
}

.tree-node-title {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

:deep(.ant-card) {
  height: 100%;
}

:deep(.ant-tree) {
  background: transparent;
}
</style>
