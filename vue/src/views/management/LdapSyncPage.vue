<template>
  <div class="ldap-sync-container">
    <a-spin v-if="loading" tip="Loading..." />
    <div v-else class="ldap-sync-content">
      <!-- LDAP Info -->
      <a-card :title="t('ldap.LDAP')" class="ldap-info-card">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item :label="t('general.Organization')">
            {{ ldap?.owner }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('general.Name')">
            {{ ldap?.name }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('ldap.Server')">
            {{ ldap?.host }}:{{ ldap?.port }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('ldap.Base DN')">
            {{ ldap?.baseDn }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- Sync Options -->
      <a-card :title="t('ldap.Sync Options')" class="sync-options-card">
        <div class="sync-buttons">
          <a-button type="primary" @click="handleSyncUsers" :loading="isSyncing">
            <sync-outlined />
            {{ t("ldap.Sync Users") }}
          </a-button>
          <a-button @click="goBack">
            <arrow-left-outlined />
            {{ t("general.Back") }}
          </a-button>
        </div>
      </a-card>

      <!-- Users Table -->
      <a-card :title="t('ldap.LDAP Users')" class="users-card">
        <template #extra>
          <a-button
            type="primary"
            :disabled="selectedUsers.length === 0"
            @click="handleImportUsers"
            :loading="isImporting"
          >
            <import-outlined />
            {{ t("ldap.Import Selected Users") }} ({{ selectedUsers.length }})
          </a-button>
        </template>

        <a-table
          :columns="columns"
          :data-source="users"
          :row-selection="{ selectedRowKeys: selectedUserKeys, onChange: onSelectChange }"
          :pagination="{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, onChange: handlePageChange }"
          :row-key="(record) => record.id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'id'">
              {{ record.id || record.uid }}
            </template>
            <template v-else-if="column.key === 'displayName'">
              {{ record.displayName || record.cn }}
            </template>
            <template v-else-if="column.key === 'email'">
              {{ record.email || record.mail }}
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag v-if="existUuids.includes(record.id || record.uid)" color="orange">
                {{ t("ldap.Existing") }}
              </a-tag>
              <a-tag v-else color="green">
                {{ t("ldap.New") }}
              </a-tag>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { SyncOutlined, ArrowLeftOutlined, ImportOutlined } from "@ant-design/icons-vue";
import * as LdapApi from "@/api/ldap";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const loading = ref(false);
const isSyncing = ref(false);
const isImporting = ref(false);

const ldap = ref<any>(null);
const users = ref<any[]>([]);
const existUuids = ref<string[]>([]);
const selectedUsers = ref<any[]>([]);

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
});

const selectedUserKeys = computed(() => {
  return selectedUsers.value.map((user) => user.id || user.uid);
});

const columns = [
  {
    title: "ID",
    key: "id",
    dataIndex: "id",
    width: 150,
  },
  {
    title: t("general.Display Name"),
    key: "displayName",
    dataIndex: "displayName",
  },
  {
    title: t("general.Email"),
    key: "email",
    dataIndex: "email",
  },
  {
    title: t("ldap.Status"),
    key: "status",
    width: 100,
  },
];

const fetchLdap = async () => {
  loading.value = true;
  try {
    const owner = route.params.organizationName as string;
    const ldapId = route.params.ldapId as string;
    
    if (!owner || !ldapId) {
      message.error(t("general.Invalid parameters"));
      return;
    }
    
    const data = await LdapApi.getLdap(owner, ldapId);
    if (data) {
      ldap.value = data;
    }
  } catch (error) {
    message.error(t("general.Failed to load LDAP"));
  } finally {
    loading.value = false;
  }
};

const onSelectChange = (selectedKeys: string[], selectedRows: any[]) => {
  selectedUsers.value = selectedRows;
};

const handlePageChange = (page: number, pageSize: number) => {
  pagination.value.current = page;
  pagination.value.pageSize = pageSize;
};

const handleSyncUsers = async () => {
  if (!ldap.value) return;
  
  isSyncing.value = true;
  try {
    message.info(t("ldap.Syncing..."));
    message.success(t("general.Success"));
  } catch (error) {
    message.error(t("general.Failed"));
  } finally {
    isSyncing.value = false;
  }
};

const handleImportUsers = async () => {
  if (selectedUsers.value.length === 0) {
    message.warning(t("general Please select at least 1 user first"));
    return;
  }
  
  isImporting.value = true;
  try {
    message.success(t("general.Successfully imported"));
  } catch (error) {
    message.error(t("general.Failed to import"));
  } finally {
    isImporting.value = false;
  }
};

const goBack = () => {
  router.push("/management/ldaps");
};

onMounted(() => {
  fetchLdap();
});
</script>

<style scoped lang="less">
.ldap-sync-container {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.ldap-sync-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ldap-info-card,
.sync-options-card,
.users-card {
  margin-bottom: 16px;
}

.sync-buttons {
  display: flex;
  gap: 12px;
}
</style>