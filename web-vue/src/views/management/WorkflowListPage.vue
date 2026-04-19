<template>
  <div class="workflow-list-container">
    <!-- Toolbar -->
    <div class="workflow-toolbar">
      <a-space wrap>
        <a-button type="primary" @click="handleCreate">
          <plus-outlined />
          {{ t("general.Add") }}
        </a-button>
        <a-button @click="handleRefresh">
          <reload-outlined />
          {{ t("general.Refresh") }}
        </a-button>
        <a-select
          v-model:value="filterDepartment"
          :placeholder="t('workflow.Department')"
          allow-clear
          style="min-width: 180px"
          @change="handleFilterChange"
        >
          <a-select-option value="dept-built-in-platform">Platform Governance</a-select-option>
          <a-select-option value="dept-built-in-security">Security Operations</a-select-option>
          <a-select-option value="dept-built-in-operations">Operations Enablement</a-select-option>
        </a-select>
      </a-space>
    </div>

    <!-- Table -->
    <a-table
      :columns="columns"
      :data-source="workflows"
      :loading="loading"
      :pagination="pagination"
      :row-key="(record: Workflow) => record.id || record.name"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'displayName'">
          <router-link :to="`/management/workflows/${record.id}`">
            {{ record.displayName || record.name }}
          </router-link>
        </template>
        <template v-else-if="column.key === 'description'">
          <span :title="record.description">
            {{ truncate(record.description || '-', 50) }}
          </span>
        </template>
        <template v-else-if="column.key === 'steps'">
          <a-popover title="Steps Preview" trigger="hover">
            <template #content>
              <pre class="steps-preview">{{ formatSteps(record.steps) }}</pre>
            </template>
            <a-tag>
              {{ countSteps(record.steps) }} {{ t('workflow.steps') }}
            </a-tag>
          </a-popover>
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">
              {{ t("general.Edit") }}
            </a-button>
            <a-button type="link" size="small" @click="handleViewSteps(record)">
              {{ t('workflow.View Steps') }}
            </a-button>
            <a-popconfirm
              :title="t('general.Are you sure to delete?')"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" danger size="small">
                {{ t("general.Delete") }}
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- Steps Detail Modal -->
    <a-modal
      v-model:open="stepsModalVisible"
      :title="t('workflow.Steps Detail')"
      :footer="null"
      width="600px"
    >
      <a-descriptions :column="1" bordered size="small">
        <a-descriptions-item :label="t('workflow.Workflow Name')">
          {{ currentWorkflow?.displayName || currentWorkflow?.name }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('workflow.Steps')">
          <a-table
            :columns="stepColumns"
            :data-source="currentWorkflow?.steps || []"
            :pagination="false"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'role'">
                <a-tag>{{ record.role }}</a-tag>
              </template>
            </template>
          </a-table>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons-vue";
import * as WorkflowApi from "@/api/modules/workflow";
import type { Workflow, WorkflowStep } from "@/api/modules/workflow";

const { t } = useI18n();
const router = useRouter();

const loading = ref(false);
const workflows = ref<Workflow[]>([]);
const filterDepartment = ref(undefined);
const stepsModalVisible = ref(false);
const currentWorkflow = ref<Workflow | null>(null);

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
});

const columns = [
  {
    title: "ID",
    key: "name",
    dataIndex: "name",
    width: 200,
    ellipsis: true,
  },
  {
    title: t("workflow.Workflow Name"),
    key: "displayName",
    dataIndex: "displayName",
    width: 180,
  },
  {
    title: t("workflow.Department"),
    key: "department",
    dataIndex: "department",
    width: 120,
  },
  {
    title: t("workflow.Description"),
    key: "description",
    dataIndex: "description",
    ellipsis: true,
  },
  {
    title: t("workflow.Steps"),
    key: "steps",
    width: 120,
  },
  {
    title: t("general.Action"),
    key: "actions",
    width: 220,
    fixed: "right",
  },
];

const stepColumns = [
  {
    title: "#",
    key: "order",
    dataIndex: "order",
    width: 60,
  },
  {
    title: t("workflow.Role"),
    key: "role",
    dataIndex: "role",
  },
  {
    title: t("workflow.Action"),
    key: "action",
    dataIndex: "action",
  },
  {
    title: t("workflow.Timeout Hours"),
    key: "timeout_hours",
    dataIndex: "timeout_hours",
    width: 120,
  },
];

function truncate(str, maxLen) {
  if (!str) return '-';
  return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
}

function countSteps(steps) {
  if (!steps) return 0;
  try {
    const arr = typeof steps === 'string' ? JSON.parse(steps) : steps;
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

function formatSteps(steps) {
  if (!steps) return '[]';
  try {
    const arr = typeof steps === 'string' ? JSON.parse(steps) : steps;
    return JSON.stringify(arr, null, 2);
  } catch {
    return '[]';
  }
}

async function fetchWorkflows() {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
    };
    if (filterDepartment.value) {
      params.field = 'department';
      params.value = filterDepartment.value;
    }
    const res = await WorkflowApi.getWorkflows(params);
    if (res.status === 'ok') {
      workflows.value = res.data || [];
      pagination.value.total = Number(res.data2 || workflows.value.length || 0);
    }
  } catch (error) {
    message.error(t("general.Failed to load data"));
  } finally {
    loading.value = false;
  }
}

function handleTableChange(pag) {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  fetchWorkflows();
}

function handleFilterChange() {
  pagination.value.current = 1;
  fetchWorkflows();
}

function handleRefresh() {
  fetchWorkflows();
}

function handleCreate() {
  router.push("/management/workflows/new");
}

function handleEdit(record) {
  router.push(`/management/workflows/${record.id}`);
}

function handleViewSteps(record) {
  currentWorkflow.value = record;
  stepsModalVisible.value = true;
}

async function handleDelete(record) {
  try {
    const res = await WorkflowApi.deleteWorkflow(record.id);
    if (res.status === 'ok') {
      message.success(t("general.Successfully deleted"));
      fetchWorkflows();
    } else {
      message.error(res.msg || t("general.Failed to delete"));
    }
  } catch (error) {
    message.error(t("general.Failed to delete"));
  }
}

onMounted(() => {
  fetchWorkflows();
});
</script>

<style scoped lang="less">
.workflow-list-container {
  padding: 24px;
  background: var(--kx-bg-card, #fff);
  border-radius: 8px;
}

.workflow-toolbar {
  margin-bottom: 16px;
}

.steps-preview {
  max-height: 300px;
  overflow: auto;
  font-size: 12px;
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
}
</style>
