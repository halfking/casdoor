<template>
  <div class="workflow-execution-list-container">
    <!-- Toolbar -->
    <div class="execution-toolbar">
      <a-space wrap>
        <a-button @click="handleRefresh">
          <reload-outlined />
          {{ t("general.Refresh") }}
        </a-button>
        <a-select
          v-model:value="filterStatus"
          :placeholder="t('workflow.Status')"
          allow-clear
          style="min-width: 150px"
          @change="handleFilterChange"
        >
          <a-select-option value="pending">{{ t('workflow.Pending') }}</a-select-option>
          <a-select-option value="approved">{{ t('workflow.Approved') }}</a-select-option>
          <a-select-option value="rejected">{{ t('workflow.Rejected') }}</a-select-option>
        </a-select>
      </a-space>
    </div>

    <!-- Table -->
    <a-table
      :columns="columns"
      :data-source="executions"
      :loading="loading"
      :pagination="pagination"
      :row-key="(record: WorkflowExecution) => `${record.owner}/${record.name}`"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'workflow'">
          {{ record.workflowDisplayName || record.workflow || '-' }}
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="getStatusColor(record.status)">
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'currentStep'">
          <span>{{ record.currentStep || 1 }} / {{ countSteps(record.context?.steps) }}</span>
        </template>
        <template v-else-if="column.key === 'createdTime'">
          {{ formatDate(record.createdTime) }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="handleViewDetail(record)">
              {{ t("general.Details") }}
            </a-button>
            <template v-if="record.status === 'pending'">
              <a-button type="link" size="small" success @click="handleApprove(record)">
                {{ t("workflow.Approve") }}
              </a-button>
              <a-button type="link" danger size="small" @click="handleReject(record)">
                {{ t("workflow.Reject") }}
              </a-button>
            </template>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- Detail Modal -->
    <a-modal
      v-model:open="detailModalVisible"
      :title="t('workflow.Execution Detail')"
      :footer="null"
      width="600px"
    >
      <a-descriptions :column="2" bordered size="small">
        <a-descriptions-item :label="t('workflow.Execution ID')">
          {{ currentExecution?.name }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('workflow.Workflow')">
          {{ currentExecution?.workflowDisplayName || currentExecution?.workflow }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('workflow.Applicant')">
          {{ currentExecution?.applicant || '-' }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('workflow.Status')">
          <a-tag :color="getStatusColor(currentExecution?.status)">
            {{ getStatusText(currentExecution?.status) }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item :label="t('workflow.Current Step')">
          {{ currentExecution?.currentStep || 1 }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('general.Created Time')">
          {{ formatDate(currentExecution?.createdTime) }}
        </a-descriptions-item>
        <a-descriptions-item :label="t('workflow.Context')" :span="2">
          <pre class="context-preview">{{ formatContext(currentExecution?.context) }}</pre>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>

    <!-- Approve/Reject Modal -->
    <a-modal
      v-model:open="actionModalVisible"
      :title="actionType === 'approve' ? t('workflow.Approve') : t('workflow.Reject')"
      @ok="handleActionConfirm"
      :confirmLoading="actionLoading"
    >
      <a-form :model="actionForm" :label-col="{ span: 6 }" layout="horizontal">
        <a-form-item :label="t('workflow.Comment')">
          <a-textarea v-model:value="actionForm.comment" :rows="4" :placeholder="t('workflow.Enter comment')" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, reactive, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { ReloadOutlined } from "@ant-design/icons-vue";
import dayjs from "dayjs";
import * as WorkflowApi from "@/api/modules/workflow";
import type { WorkflowExecution } from "@/api/modules/workflow";

const { t } = useI18n();

const loading = ref(false);
const executions = ref<WorkflowExecution[]>([]);
const filterStatus = ref(undefined);
const detailModalVisible = ref(false);
const actionModalVisible = ref(false);
const actionLoading = ref(false);
const actionType = ref<"approve" | "reject">("approve");
const currentExecution = ref<WorkflowExecution | null>(null);

const actionForm = reactive({
  comment: "",
});

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
    title: t("workflow.Workflow"),
    key: "workflow",
    dataIndex: "workflow",
    width: 150,
  },
  {
    title: t("workflow.Applicant"),
    key: "applicant",
    dataIndex: "applicant",
    width: 150,
  },
  {
    title: t("workflow.Status"),
    key: "status",
    dataIndex: "status",
    width: 120,
  },
  {
    title: t("workflow.Current Step"),
    key: "currentStep",
    width: 120,
  },
  {
    title: t("general.Created Time"),
    key: "createdTime",
    dataIndex: "createdTime",
    width: 180,
  },
  {
    title: t("general.Action"),
    key: "actions",
    width: 220,
    fixed: "right",
  },
];

function getStatusColor(status) {
  const map = {
    pending: "processing",
    approved: "success",
    rejected: "error",
  };
  return map[status] || "default";
}

function getStatusText(status) {
  const map = {
    pending: t("workflow.Pending"),
    approved: t("workflow.Approved"),
    rejected: t("workflow.Rejected"),
  };
  return map[status] || status;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    return dayjs(dateStr).format("YYYY-MM-DD HH:mm:ss");
  } catch {
    return dateStr;
  }
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

function formatContext(context) {
  if (!context) return "{}";
  try {
    return JSON.stringify(context, null, 2);
  } catch {
    return "{}";
  }
}

async function fetchExecutions() {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
    };
    if (filterStatus.value) {
      params.field = "status";
      params.value = filterStatus.value;
    }
    const res = await WorkflowApi.getWorkflowExecutions(params);
    if (res.status === "ok") {
      executions.value = res.data || [];
      pagination.value.total = res.data2 || 0;
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
  fetchExecutions();
}

function handleFilterChange() {
  pagination.value.current = 1;
  fetchExecutions();
}

function handleRefresh() {
  fetchExecutions();
}

function handleViewDetail(record) {
  currentExecution.value = record;
  detailModalVisible.value = true;
}

function handleApprove(record) {
  currentExecution.value = record;
  actionType.value = "approve";
  actionForm.comment = "";
  actionModalVisible.value = true;
}

function handleReject(record) {
  currentExecution.value = record;
  actionType.value = "reject";
  actionForm.comment = "";
  actionModalVisible.value = true;
}

async function handleActionConfirm() {
  if (!currentExecution.value) return;

  actionLoading.value = true;
  try {
    const newStatus = actionType.value === "approve" ? "approved" : "rejected";
    const res = await WorkflowApi.updateWorkflowExecution(
      currentExecution.value.owner,
      currentExecution.value.name,
      {
        status: newStatus,
        comment: actionForm.comment,
      }
    );

    if (res.status === "ok") {
      message.success(t("general.Successfully saved"));
      actionModalVisible.value = false;
      fetchExecutions();
    } else {
      message.error(res.msg || t("general.Failed to save"));
    }
  } catch (error) {
    message.error(t("general.Failed to save"));
  } finally {
    actionLoading.value = false;
  }
}

onMounted(() => {
  fetchExecutions();
});
</script>

<style scoped lang="less">
.workflow-execution-list-container {
  padding: 24px;
  background: var(--kx-bg-card, #fff);
  border-radius: 8px;
}

.execution-toolbar {
  margin-bottom: 16px;
}

.context-preview {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow: auto;
}
</style>
