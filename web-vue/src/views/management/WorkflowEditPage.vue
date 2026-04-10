<template>
  <div class="workflow-edit-container">
    <a-spin v-if="loading" tip="Loading..." />
    <div v-else class="workflow-edit-content">
      <a-form
        ref="formRef"
        :model="formState"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 18 }"
        layout="horizontal"
      >
        <!-- Basic Info -->
        <a-card :title="t('workflow.Basic Info')" class="section-card">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item
                :label="t('workflow.Workflow ID')"
                name="name"
                :rules="[{ required: true, message: t('general.This field is required') }]"
              >
                <a-input
                  v-model:value="formState.name"
                  :disabled="isEdit"
                  :placeholder="t('workflow.Workflow ID')"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                :label="t('workflow.Workflow Name')"
                name="displayName"
                :rules="[{ required: true, message: t('general.This field is required') }]"
              >
                <a-input
                  v-model:value="formState.displayName"
                  :placeholder="t('workflow.Workflow Name')"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item :label="t('workflow.Department')" name="department">
                <a-select v-model:value="formState.department" :placeholder="t('workflow.Select Department')">
                  <a-select-option value="dept-tech">{{ t('workflow.Dept Tech') }}</a-select-option>
                  <a-select-option value="dept-ops">{{ t('workflow.Dept Ops') }}</a-select-option>
                  <a-select-option value="dept-gov">{{ t('workflow.Dept Gov') }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="16">
            <a-col :span="24">
              <a-form-item :label="t('workflow.Description')" name="description">
                <a-textarea
                  v-model:value="formState.description"
                  :rows="3"
                  :placeholder="t('workflow.Description')"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <!-- Step Editor -->
        <a-card :title="t('workflow.Step Editor')" class="section-card">
          <template #extra>
            <a-button type="primary" @click="handleAddStep">
              <plus-outlined />
              {{ t('workflow.Add Step') }}
            </a-button>
          </template>

          <a-table
            :columns="stepColumns"
            :data-source="formState.steps"
            :pagination="false"
            :row-key="(record: StepItem, index: number) => index"
            size="small"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'order'">
                <span class="step-order">{{ index + 1 }}</span>
              </template>
              <template v-else-if="column.key === 'role'">
                <a-select
                  v-model:value="record.role"
                  :placeholder="t('workflow.Select Role')"
                  style="width: 100%"
                  @change="() => updatePreview()"
                >
                  <a-select-option value="dept-tech-cto">{{ t('workflow.Role CTO') }}</a-select-option>
                  <a-select-option value="dept-tech-tl">{{ t('workflow.Role Tech Lead') }}</a-select-option>
                  <a-select-option value="dept-ops-manager">{{ t('workflow.Role Ops Manager') }}</a-select-option>
                  <a-select-option value="dept-gov-director">{{ t('workflow.Role Gov Director') }}</a-select-option>
                </a-select>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-input
                  v-model:value="record.action"
                  :placeholder="t('workflow.Action Name')"
                  @change="() => updatePreview()"
                />
              </template>
              <template v-else-if="column.key === 'timeout_hours'">
                <a-input-number
                  v-model:value="record.timeout_hours"
                  :min="1"
                  :max="720"
                  :placeholder="t('workflow.Hours')"
                  style="width: 100%"
                  @change="() => updatePreview()"
                />
              </template>
              <template v-else-if="column.key === 'operation'">
                <a-button type="link" danger size="small" @click="handleRemoveStep(index)">
                  <delete-outlined />
                </a-button>
              </template>
            </template>
          </a-table>

          <a-empty v-if="formState.steps.length === 0" :description="t('workflow.No steps added')" />
        </a-card>

        <!-- JSON Preview -->
        <a-card :title="t('workflow.JSON Preview')" class="section-card">
          <pre class="json-preview">{{ jsonPreview }}</pre>
        </a-card>

        <!-- Actions -->
        <div class="form-actions">
          <a-space>
            <a-button type="primary" :loading="saving" @click="handleSave">
              {{ t("general.Submit") }}
            </a-button>
            <a-button @click="handleCancel">
              {{ t("general.Cancel") }}
            </a-button>
          </a-space>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import * as WorkflowApi from "@/api/modules/workflow";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const loading = ref(false);
const saving = ref(false);
const isEdit = ref(false);
const formRef = ref(null);

interface StepItem {
  order: number;
  role: string;
  action: string;
  timeout_hours: number;
}

const formState = reactive({
  owner: "",
  name: "",
  displayName: "",
  department: undefined,
  description: "",
  steps: [] as StepItem[],
});

const stepColumns = [
  {
    title: "#",
    key: "order",
    width: 60,
  },
  {
    title: t("workflow.Role"),
    key: "role",
    width: 200,
  },
  {
    title: t("workflow.Action"),
    key: "action",
  },
  {
    title: t("workflow.Timeout (hours)"),
    key: "timeout_hours",
    width: 150,
  },
  {
    title: t("general.Action"),
    key: "operation",
    width: 80,
  },
];

const jsonPreview = computed(() => {
  const steps = formState.steps.map((step, idx) => ({
    order: idx + 1,
    role: step.role,
    action: step.action,
    timeout_hours: step.timeout_hours,
  }));
  return JSON.stringify(steps, null, 2);
});

function updatePreview() {
  // Trigger computed recalc by reassigning steps
}

function handleAddStep() {
  formState.steps.push({
    order: formState.steps.length + 1,
    role: "",
    action: "",
    timeout_hours: 48,
  });
}

function handleRemoveStep(index) {
  formState.steps.splice(index, 1);
}

function parseSteps(stepsData) {
  if (!stepsData) return [];
  try {
    const arr = typeof stepsData === 'string' ? JSON.parse(stepsData) : stepsData;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function fetchWorkflow() {
  const owner = route.params.organizationName;
  const name = route.params.workflowName;

  if (!owner || owner === "-" || !name || name === "-") {
    isEdit.value = false;
    loading.value = false;
    return;
  }

  isEdit.value = true;
  loading.value = true;

  try {
    const res = await WorkflowApi.getWorkflow(owner, name);
    if (res) {
      formState.owner = res.owner;
      formState.name = res.name;
      formState.displayName = res.displayName || "";
      formState.department = res.department;
      formState.description = res.description || "";
      formState.steps = parseSteps(res.steps);
    }
  } catch (error) {
    message.error(t("general.Failed to load data"));
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  saving.value = true;
  try {
    // Validate
    if (!formState.name) {
      message.error(t("workflow.Workflow ID is required"));
      saving.value = false;
      return;
    }
    if (!formState.displayName) {
      message.error(t("workflow.Workflow Name is required"));
      saving.value = false;
      return;
    }

    const payload = {
      owner: formState.owner || "admin",
      name: formState.name,
      displayName: formState.displayName,
      department: formState.department,
      description: formState.description,
      steps: jsonPreview.value,
    };

    let res;
    if (isEdit.value) {
      res = await WorkflowApi.updateWorkflow(formState.owner, formState.name, payload);
    } else {
      res = await WorkflowApi.addWorkflow(payload);
    }

    if (res.status === "ok") {
      message.success(t("general.Successfully saved"));
      router.push("/management/workflows");
    } else {
      message.error(res.msg || t("general.Failed to save"));
    }
  } catch (error) {
    message.error(t("general.Failed to save"));
  } finally {
    saving.value = false;
  }
}

function handleCancel() {
  router.push("/management/workflows");
}

onMounted(() => {
  fetchWorkflow();
});
</script>

<style scoped lang="less">
.workflow-edit-container {
  padding: 24px;
  background: var(--kx-bg-card, #fff);
  border-radius: 8px;
}

.workflow-edit-content {
  max-width: 1000px;
}

.section-card {
  margin-bottom: 16px;
}

.step-order {
  font-weight: 600;
  color: #1890ff;
}

.json-preview {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  font-size: 13px;
  max-height: 300px;
  overflow: auto;
  font-family: 'Monaco', 'Menlo', monospace;
}

.form-actions {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}
</style>
