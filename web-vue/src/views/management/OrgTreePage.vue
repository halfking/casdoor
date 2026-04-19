<template>
  <div class="org-tree-container">
    <a-spin v-if="loading" tip="Loading..." />
    <div v-else class="org-tree-content">
      <!-- Toolbar -->
      <div class="toolbar">
        <a-space>
          <a-button type="primary" @click="handleRefresh">
            <reload-outlined /> {{ t("general.Refresh") }}
          </a-button>
          <a-button type="default" @click="openAddModal(null)">
            <plus-outlined /> {{ t("general.Add root node") }}
          </a-button>
          <a-button type="default" @click="openTemplateModal">
            <appstore-add-outlined /> {{ t("organization.Apply template") || "Apply template" }}
          </a-button>
          <a-select
            v-model:value="selectedTenant"
            :placeholder="t('organization.Select tenant') || 'Select tenant'"
            style="min-width: 180px"
            allow-clear
            @change="handleTenantChange"
          >
            <a-select-option value="">{{ t('organization.All tenants') || 'All tenants' }}</a-select-option>
            <a-select-option v-for="tenant in tenantList" :key="tenant.tenantId" :value="tenant.tenantId">
              {{ tenant.displayName || tenant.name }}
            </a-select-option>
          </a-select>
        </a-space>
      </div>

      <a-row :gutter="16" class="tree-detail-row">
        <!-- Tree panel -->
        <a-col :span="selectedNode ? 8 : 24">
          <a-card :title="t('general.Organization Tree')" size="small">
            <a-tree
              v-if="treeData.length > 0"
              :tree-data="treeData"
              :selected-keys="selectedKeys"
              :expanded-keys="expandedKeys"
              :auto-expand-parent="true"
              @select="handleTreeSelect"
              @expand="handleTreeExpand"
            >
              <template #title="{ key, title, dataRef }">
                <span class="tree-node-title">
                  <span>{{ title }}</span>
                  <span class="node-type-badge">{{ dataRef.orgType }}</span>
                  <span class="node-actions">
                    <plus-outlined class="node-action-btn" @click.stop="openAddModal(dataRef)" />
                    <edit-outlined class="node-action-btn" @click.stop="openEditModal(dataRef)" />
                    <delete-outlined class="node-action-btn" @click.stop="openDeleteModal(dataRef)" />
                  </span>
                </span>
              </template>
            </a-tree>
            <a-empty v-else :description="t('general.No data')" />
          </a-card>
        </a-col>

        <!-- Detail panel -->
        <a-col v-if="selectedNode" :span="16">
          <a-card :title="t('general.Details')" size="small">
            <template #extra>
              <a-button type="text" size="small" @click="selectedNode = null">
                <close-outlined /> {{ t("general.Close") }}
              </a-button>
            </template>
            <a-descriptions :column="1" bordered size="small">
              <a-descriptions-item :label="t('general.Display name')">
                {{ selectedNode.displayName || '-' }}
              </a-descriptions-item>
              <a-descriptions-item :label="t('general.Org type')">
                <a-tag>{{ selectedNode.orgType || '-' }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item :label="t('general.Org name')">
                {{ selectedNode.orgName || '-' }}
              </a-descriptions-item>
              <a-descriptions-item :label="t('organization:Code')">
                {{ selectedNode.code || '-' }}
              </a-descriptions-item>
              <a-descriptions-item :label="t('organization:Level')">
                {{ selectedNode.level || '-' }}
              </a-descriptions-item>
              <a-descriptions-item :label="t('organization:Leader')">
                {{ selectedNode.leader || '-' }}
              </a-descriptions-item>
              <a-descriptions-item :label="t('general.ID')">
                {{ selectedNode.id || '-' }}
              </a-descriptions-item>
              <a-descriptions-item :label="t('organization:Tenant') || 'Tenant'">
                {{ selectedNode.tenantId || '-' }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- Add / Edit Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEditing ? t('general.Edit') : t('general.Add')"
      :confirm-loading="confirmLoading"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      ok-text="OK"
      cancel-text="Cancel"
      width="700px"
    >
      <a-form :model="formData" :label-col="{ span: 6 }" ref="formRef">
        <!-- Template selection for root nodes (parentId === 0) -->
        <a-form-item v-if="formData.parentId === 0">
          <template #label>
            <a-checkbox v-model:checked="useTemplate" @change="handleUseTemplateChange">
              {{ t("organization.Use template") || "从模板创建" }}
            </a-checkbox>
          </template>
          <a-select
            v-if="useTemplate"
            v-model:value="selectedTemplateId"
            :placeholder="t('organization.Select template') || '选择模板'"
            style="width: 100%"
            @change="handleTemplateSelectForForm"
          >
            <a-select-option v-for="tmpl in templateList" :key="tmpl.id" :value="String(tmpl.id)">
              <div>
                <div>{{ tmpl.displayName || tmpl.name }}</div>
                <div style="font-size: 11px; color: #888">{{ tmpl.description }}</div>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>

        <!-- Template preview -->
        <a-form-item v-if="useTemplate && formPreviewTreeData.length > 0" :label="t('organization.Template preview') || '模板预览'">
          <div class="template-preview-box">
            <a-tree
              :tree-data="formPreviewTreeData"
              :show-icon="true"
              default-expand-all
            >
              <template #title="{ title, dataRef }">
                <span>
                  <span>{{ title }}</span>
                  <a-tag size="small" style="margin-left: 4px">{{ dataRef.orgType }}</a-tag>
                </span>
              </template>
            </a-tree>
          </div>
        </a-form-item>

        <a-divider v-if="useTemplate" />

        <!-- Basic info fields -->
        <a-form-item :label="t('general.Display name')" name="displayName" :required="!useTemplate">
          <a-input v-model:value="formData.displayName" :placeholder="t('general.Display name')" />
        </a-form-item>
        <a-form-item :label="t('general.Org type')" name="orgType" required>
          <a-select v-model:value="formData.orgType">
            <a-select-option value="root">Root</a-select-option>
            <a-select-option value="org">Organization</a-select-option>
            <a-select-option value="dept">Department</a-select-option>
            <a-select-option value="team">Team</a-select-option>
            <a-select-option value="group">Group</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('general.Org name')" name="orgName" :required="!useTemplate">
          <a-input v-model:value="formData.orgName" :placeholder="t('general.Org name')" />
        </a-form-item>
        <a-form-item :label="t('organization:Code')" name="code">
          <a-input v-model:value="formData.code" placeholder="编码，用于与 Department.code 匹配" />
        </a-form-item>
        <a-form-item :label="t('organization:Level')" name="level">
          <a-input-number v-model:value="formData.level" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item :label="t('organization:Leader')" name="leader">
          <a-input v-model:value="formData.leader" placeholder="负责人" />
        </a-form-item>
        <a-form-item :label="t('organization:Tenant')" name="tenantId">
          <a-select
            v-model:value="formData.tenantId"
            :placeholder="t('organization.Select tenant') || '选择租户'"
            style="width: 100%"
            allow-clear
          >
            <a-select-option v-for="tenant in tenantList" :key="tenant.tenantId" :value="tenant.tenantId">
              {{ tenant.displayName || tenant.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="formData.parentId !== null && formData.parentId !== 0" :label="t('general.Parent')" name="parentId">
          <a-input v-model:value="formData.parentId" disabled />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- Delete Confirm Modal -->
    <a-modal
      v-model:open="deleteModalVisible"
      :title="t('general.Delete')"
      :confirm-loading="confirmLoading"
      @ok="handleDeleteOk"
      @cancel="deleteModalVisible = false"
      ok-text="OK"
      cancel-text="Cancel"
    >
      <p>{{ t("general.Are you sure you want to delete this node?") }}</p>
    </a-modal>

    <!-- Template Selection Modal -->
    <a-modal
      v-model:open="templateModalVisible"
      :title="t('organization.Apply template') || 'Apply Organization Template'"
      :confirm-loading="confirmLoading"
      width="800px"
      @ok="handleTemplateApply"
      @cancel="templateModalVisible = false"
      ok-text="Apply"
      cancel-text="Cancel"
    >
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card :title="t('organization.Select template') || 'Select Template'" size="small">
            <a-select
              v-model:value="selectedTemplateId"
              style="width: 100%"
              :placeholder="t('organization.Select template') || 'Select a template'"
              @change="handleTemplateSelect"
            >
              <a-select-option v-for="template in templateList" :key="template.id" :value="template.id">
                <div>
                  <div>{{ template.displayName }}</div>
                  <div style="font-size: 11px; color: #888">{{ template.description }}</div>
                </div>
              </a-select-option>
            </a-select>
            <a-divider />
            <a-form :label-col="{ span: 8 }" size="small">
              <a-form-item :label="t('general.Parent')">
                <a-tree-select
                  v-model:value="templateTargetParentId"
                  :tree-data="treeData"
                  placeholder="Select parent node (0 for root)"
                  :dropdown-style="{ maxHeight: '200px', overflow: 'auto' }"
                />
              </a-form-item>
              <a-form-item :label="t('organization:Tenant ID')">
                <a-input v-model:value="templateTenantId" :placeholder="t('organization.Tenant ID')" />
              </a-form-item>
            </a-form>
          </a-card>
        </a-col>
        <a-col :span="16">
          <a-card :title="t('organization.Template preview') || 'Template Preview'" size="small">
            <template v-if="selectedTemplate">
              <a-descriptions :column="1" size="small" bordered>
                <a-descriptions-item :label="t('general.Name')">
                  {{ selectedTemplate.displayName }}
                </a-descriptions-item>
                <a-descriptions-item :label="t('general.Description')">
                  {{ selectedTemplate.description }}
                </a-descriptions-item>
                <a-descriptions-item :label="t('organization.Template type')">
                  <a-tag>{{ selectedTemplate.templateType }}</a-tag>
                </a-descriptions-item>
              </a-descriptions>
              <a-divider />
              <div class="template-tree-preview">
                <a-tree
                  :tree-data="previewTreeData"
                  :show-icon="true"
                  :default-expand-all="true"
                >
                  <template #title="{ title, dataRef }">
                    <span>
                      {{ title }}
                      <a-tag size="small" style="margin-left: 4px">{{ dataRef.orgType }}</a-tag>
                    </span>
                  </template>
                </a-tree>
              </div>
            </template>
            <a-empty v-else :description="t('organization.Select template to preview') || 'Select a template to preview'" />
          </a-card>
        </a-col>
      </a-row>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import {
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons-vue";
import * as OrgTreeApi from "@/api/modules/orgtree";
import type { OrgTreeNode, Tenant, OrgTemplate } from "@/api/modules/orgtree";

const { t } = useI18n();

// State
const loading = ref(false);
const confirmLoading = ref(false);
const treeData = ref<any[]>([]);
const flatNodes = ref<OrgTreeNode[]>([]);
const selectedKeys = ref<string[]>([]);
const expandedKeys = ref<string[]>([]);
const selectedNode = ref<any>(null);
const tenantList = ref<Tenant[]>([]);
const selectedTenant = ref<string>("");

// Modal state
const modalVisible = ref(false);
const deleteModalVisible = ref(false);
const isEditing = ref(false);
const formRef = ref();
const currentEditNode = ref<any>(null);

// Template modal state
const templateModalVisible = ref(false);
const templateList = ref<OrgTemplate[]>([]);
const selectedTemplateId = ref<string>("");
const selectedTemplate = ref<OrgTemplate | null>(null);
const templateTargetParentId = ref<number>(0);
const templateTenantId = ref<string>("");
const previewTreeData = ref<any[]>([]);

// Form template selection state
const useTemplate = ref(false);
const formPreviewTreeData = ref<any[]>([]);

interface TreeNode extends OrgTreeNode {
  key: string;
  title: string;
  children?: TreeNode[];
}

const formData = ref<{
  displayName: string;
  orgType: string;
  orgName: string;
  code: string;
  level: number;
  leader: string;
  tenantId: string;
  parentId: number | null;
  id?: number;
}>({
  displayName: "",
  orgType: "dept",
  orgName: "",
  code: "",
  level: 1,
  leader: "",
  tenantId: "",
  parentId: null,
});

// Convert flat list to Ant Design Tree format
function buildTree(nodes: OrgTreeNode[], parentId: number = 0): TreeNode[] {
  return nodes
    .filter((n) => n.parentId === parentId)
    .map((n) => ({
      ...n,
      key: String(n.id),
      title: n.displayName,
      children: buildTree(nodes, n.id),
    }));
}

async function loadTreeData() {
  loading.value = true;
  try {
    const res = await OrgTreeApi.getOrgTrees(selectedTenant.value || undefined);
    if (res.status === "ok") {
      flatNodes.value = res.data || [];
      treeData.value = buildTree(flatNodes.value);
      // Auto expand first level
      if (treeData.value.length > 0) {
        expandedKeys.value = treeData.value.map((item) => item.key);
      }
    } else {
      message.error(res.msg || "Failed to load org tree");
    }
  } catch (error) {
    message.error((error as Error).message);
  } finally {
    loading.value = false;
  }
}

async function loadTenantList() {
  try {
    const res = await OrgTreeApi.getTenantList();
    if (res.status === "ok") {
      tenantList.value = res.data || [];
    }
  } catch (error) {
    console.error("Failed to load tenant list:", error);
  }
}

function handleTenantChange() {
  selectedKeys.value = [];
  selectedNode.value = null;
  loadTreeData();
}

function handleTreeSelect(keys: string[], info: any) {
  if (keys.length > 0) {
    selectedKeys.value = keys;
    const node = info.node.dataRef;
    selectedNode.value = node || null;
  } else {
    selectedKeys.value = [];
    selectedNode.value = null;
  }
}

function handleTreeExpand(keys: string[]) {
  expandedKeys.value = keys;
}

function handleRefresh() {
  selectedKeys.value = [];
  selectedNode.value = null;
  loadTreeData();
}

function openAddModal(node: any) {
  isEditing.value = false;
  useTemplate.value = false;
  selectedTemplateId.value = "";
  formPreviewTreeData.value = [];
  formData.value = {
    displayName: "",
    orgType: "dept",
    orgName: "",
    code: "",
    level: 1,
    leader: "",
    tenantId: selectedTenant.value || "",
    parentId: node ? node.id : 0,
  };
  currentEditNode.value = null;
  modalVisible.value = true;
  
  // Load templates for root nodes (when parentId === 0)
  if (!node) {
    loadTemplatesForModal();
  }
}

async function loadTemplatesForModal() {
  try {
    const res = await OrgTreeApi.getOrgTreeTemplates();
    if (res.status === "ok") {
      templateList.value = res.data || [];
    }
  } catch (error) {
    console.error("Failed to load templates:", error);
  }
}

function openEditModal(node: any) {
  isEditing.value = true;
  formData.value = {
    displayName: node.displayName || "",
    orgType: node.orgType || "dept",
    orgName: node.orgName || "",
    code: node.code || "",
    level: node.level || 1,
    leader: node.leader || "",
    tenantId: node.tenantId || "",
    parentId: node.parentId,
    id: node.id,
  };
  currentEditNode.value = node;
  modalVisible.value = true;
}

function openDeleteModal(node: any) {
  currentEditNode.value = node;
  deleteModalVisible.value = true;
}

async function handleModalOk() {
  // If using template and creating root node, validate template selection
  if (useTemplate.value && formData.value.parentId === 0 && !selectedTemplateId.value) {
    message.warning("Please select a template");
    return;
  }
  
  if (!useTemplate.value && (!formData.value.displayName || !formData.value.orgType || !formData.value.orgName)) {
    message.warning("Please fill in all required fields");
    return;
  }
  
  confirmLoading.value = true;
  try {
    let res;
    if (isEditing.value) {
      res = await OrgTreeApi.updateOrgTree({
        id: formData.value.id,
        displayName: formData.value.displayName,
        orgType: formData.value.orgType,
        orgName: formData.value.orgName,
        code: formData.value.code,
        level: formData.value.level,
        leader: formData.value.leader,
        parentId: formData.value.parentId ?? undefined,
      });
    } else if (useTemplate.value && formData.value.parentId === 0) {
      // Use template to create root node and its children
      res = await OrgTreeApi.applyOrgTreeTemplate(
        selectedTemplateId.value,
        0, // root node
        formData.value.tenantId || undefined
      );
      if (res.status === "ok") {
        message.success("Template applied successfully");
        modalVisible.value = false;
        loadTreeData();
        return;
      }
    } else {
      res = await OrgTreeApi.addOrgTree({
        displayName: formData.value.displayName,
        orgType: formData.value.orgType,
        orgName: formData.value.orgName,
        code: formData.value.code,
        level: formData.value.level,
        leader: formData.value.leader,
        tenantId: formData.value.tenantId,
        parentId: formData.value.parentId ?? undefined,
      });
    }
    if (res.status === "ok") {
      message.success(isEditing.value ? "Updated successfully" : "Added successfully");
      modalVisible.value = false;
      loadTreeData();
    } else {
      message.error(res.msg || "Operation failed");
    }
  } catch (error) {
    message.error((error as Error).message);
  } finally {
    confirmLoading.value = false;
  }
}

function handleModalCancel() {
  modalVisible.value = false;
}

async function handleDeleteOk() {
  if (!currentEditNode.value) return;
  confirmLoading.value = true;
  try {
    const res = await OrgTreeApi.deleteOrgTree(currentEditNode.value.id);
    if (res.status === "ok") {
      message.success("Deleted successfully");
      deleteModalVisible.value = false;
      selectedKeys.value = [];
      selectedNode.value = null;
      loadTreeData();
    } else {
      message.error(res.msg || "Delete failed");
    }
  } catch (error) {
    message.error((error as Error).message);
  } finally {
    confirmLoading.value = false;
  }
}

// Template functions
async function openTemplateModal() {
  templateModalVisible.value = true;
  templateTenantId.value = selectedTenant.value || "";
  templateTargetParentId.value = 0;
  selectedTemplateId.value = "";
  selectedTemplate.value = null;
  previewTreeData.value = [];
  
  // Load templates
  try {
    const res = await OrgTreeApi.getOrgTreeTemplates();
    if (res.status === "ok") {
      templateList.value = res.data || [];
    } else {
      message.error(res.msg || "Failed to load templates");
    }
  } catch (error) {
    message.error((error as Error).message);
  }
}

function handleTemplateSelect(templateId: string) {
  const template = templateList.value.find(t => String(t.id) === templateId);
  if (template) {
    selectedTemplate.value = template;
    // Build preview tree from template structure (treeStructure is JSON string)
    let nodes: any[] = [];
    if (template.treeStructure) {
      try {
        const parsed = JSON.parse(template.treeStructure);
        nodes = Array.isArray(parsed) ? parsed : parsed.nodes || [];
      } catch (e) {
        console.error("Failed to parse template treeStructure:", e);
      }
    }
    if (nodes.length > 0) {
      previewTreeData.value = buildTemplateTree(nodes[0]);
    } else {
      previewTreeData.value = [];
    }
  }
}

function handleUseTemplateChange() {
  if (!useTemplate.value) {
    // Clear template selection when unchecked
    selectedTemplateId.value = "";
    formPreviewTreeData.value = [];
    // Reset form data
    formData.value.displayName = "";
    formData.value.orgName = "";
    formData.value.orgType = "dept";
    formData.value.code = "";
    formData.value.level = 1;
    formData.value.leader = "";
  }
}

function handleTemplateSelectForForm(templateId: string) {
  const template = templateList.value.find(t => String(t.id) === templateId);
  if (template) {
    selectedTemplate.value = template;
    // Parse tree structure
    let nodes: any[] = [];
    if (template.treeStructure) {
      try {
        const parsed = JSON.parse(template.treeStructure);
        nodes = Array.isArray(parsed) ? parsed : parsed.nodes || [];
      } catch (e) {
        console.error("Failed to parse template treeStructure:", e);
      }
    }
    if (nodes.length > 0) {
      formPreviewTreeData.value = buildTemplateTree(nodes[0]);
      // Auto-fill form with template root node data
      const rootNode = nodes[0];
      if (rootNode) {
        formData.value.displayName = rootNode.displayName || "";
        formData.value.orgName = rootNode.orgName || template.name;
        formData.value.orgType = rootNode.orgType || "org";
        formData.value.code = rootNode.code || "";
        formData.value.level = rootNode.level || 0;
        formData.value.leader = rootNode.leader || "";
      }
    } else {
      formPreviewTreeData.value = [];
    }
  }
}

interface TemplateTreeNode {
  key: string;
  title: string;
  orgType: string;
  children?: TemplateTreeNode[];
}

function buildTemplateTree(node: any): TemplateTreeNode[] {
  const result: TemplateTreeNode[] = [];
  const buildNode = (n: any, index: number): TemplateTreeNode => {
    const children = n.children ? n.children.map((c: any, i: number) => buildNode(c, i)) : undefined;
    return {
      key: `${n.orgName}-${index}`,
      title: n.displayName,
      orgType: n.orgType,
      children,
    };
  };
  
  if (node) {
    result.push(buildNode(node, 0));
  }
  return result;
}

async function handleTemplateApply() {
  if (!selectedTemplateId.value) {
    message.warning("Please select a template");
    return;
  }
  
  confirmLoading.value = true;
  try {
    const res = await OrgTreeApi.applyOrgTreeTemplate(
      selectedTemplateId.value,
      templateTargetParentId.value,
      templateTenantId.value || undefined
    );
    if (res.status === "ok") {
      message.success("Template applied successfully");
      templateModalVisible.value = false;
      loadTreeData();
    } else {
      message.error(res.msg || "Failed to apply template");
    }
  } catch (error) {
    message.error((error as Error).message);
  } finally {
    confirmLoading.value = false;
  }
}

onMounted(() => {
  loadTenantList();
  loadTreeData();
});
</script>

<style scoped>
.org-tree-container {
  padding: 16px;
  height: 100%;
}

.toolbar {
  margin-bottom: 16px;
}

.tree-detail-row {
  height: calc(100vh - 200px);
}

.tree-node-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.node-type-badge {
  font-size: 11px;
  color: #888;
  background: #f0f0f0;
  padding: 1px 6px;
  border-radius: 4px;
}

.node-actions {
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.2s;
}

.tree-node-title:hover .node-actions {
  opacity: 1;
}

.node-action-btn {
  cursor: pointer;
  color: #1890ff;
  margin-left: 4px;
}

.node-action-btn:hover {
  color: #096dd9;
}

:deep(.ant-card) {
  height: 100%;
}

:deep(.ant-tree) {
  background: transparent;
}

.template-tree-preview {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #f0f0f0;
  padding: 8px;
  border-radius: 4px;
}
</style>
