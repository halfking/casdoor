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
              <a-descriptions-item :label="t('general.ID')">
                {{ selectedNode.id || '-' }}
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
    >
      <a-form :model="formData" :label-col="{ span: 6 }" ref="formRef">
        <a-form-item :label="t('general.Display name')" name="displayName" required>
          <a-input v-model:value="formData.displayName" />
        </a-form-item>
        <a-form-item :label="t('general.Org type')" name="orgType" required>
          <a-select v-model:value="formData.orgType">
            <a-select-option value="org">Organization</a-select-option>
            <a-select-option value="dept">Department</a-select-option>
            <a-select-option value="team">Team</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('general.Org name')" name="orgName" required>
          <a-input v-model:value="formData.orgName" />
        </a-form-item>
        <a-form-item v-if="formData.parentId !== null" :label="t('general.Parent')" name="parentId">
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
} from "@ant-design/icons-vue";
import * as OrgTreeApi from "@/api/modules/orgtree";
import type { OrgTreeNode } from "@/api/modules/orgtree";

const { t } = useI18n();

// State
const loading = ref(false);
const confirmLoading = ref(false);
const treeData = ref<any[]>([]);
const flatNodes = ref<OrgTreeNode[]>([]);
const selectedKeys = ref<string[]>([]);
const expandedKeys = ref<string[]>([]);
const selectedNode = ref<any>(null);

// Modal state
const modalVisible = ref(false);
const deleteModalVisible = ref(false);
const isEditing = ref(false);
const formRef = ref();
const currentEditNode = ref<any>(null);

interface TreeNode extends OrgTreeNode {
  key: string;
  title: string;
  children?: TreeNode[];
}

const formData = ref<{
  displayName: string;
  orgType: string;
  orgName: string;
  parentId: number | null;
  id?: number;
}>({
  displayName: "",
  orgType: "dept",
  orgName: "",
  parentId: null,
});

// Convert flat list to Ant Design Tree format
function buildTree(nodes: OrgTreeNode[], parentId: number = 0): TreeNode[] {
  return nodes
    .filter((n) => n.parentId === parentId)
    .map((n) => ({
      key: String(n.id),
      title: n.displayName,
      orgType: n.orgType,
      orgName: n.orgName,
      parentId: n.parentId,
      id: n.id,
      children: buildTree(nodes, n.id),
    }));
}

async function loadTreeData() {
  loading.value = true;
  try {
    const res = await OrgTreeApi.getOrgTrees();
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
  formData.value = {
    displayName: "",
    orgType: "dept",
    orgName: "",
    parentId: node ? node.id : 0,
  };
  currentEditNode.value = null;
  modalVisible.value = true;
}

function openEditModal(node: any) {
  isEditing.value = true;
  formData.value = {
    displayName: node.displayName || "",
    orgType: node.orgType || "dept",
    orgName: node.orgName || "",
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
  if (!formData.value.displayName || !formData.value.orgType || !formData.value.orgName) {
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
        parentId: formData.value.parentId ?? undefined,
      });
    } else {
      res = await OrgTreeApi.addOrgTree({
        displayName: formData.value.displayName,
        orgType: formData.value.orgType,
        orgName: formData.value.orgName,
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

onMounted(() => {
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
</style>
