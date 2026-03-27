<template>
  <div>
    <PageHeader :title="$t('general:Groups')">
      <a-space wrap>
        <a-select
          v-if="context.isAdmin"
          :value="organization"
          :options="organizationOptions"
          style="width: 220px"
          @change="handleOrganizationChange"
        />
        <a-button type="primary" @click="handleAddRoot">
          {{ $t("group:Add root group") }}
        </a-button>
        <a-button @click="loadTreeData">
          {{ $t("general:Refresh") }}
        </a-button>
      </a-space>
    </PageHeader>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="8">
        <a-card>
          <a-tree
            v-if="treeData.length"
            block-node
            :tree-data="treeData"
            :selected-keys="selectedKeys"
            default-expand-all
            @select="handleSelect"
          />
          <a-empty v-else />
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="16">
        <a-card v-if="selectedGroup" :title="selectedGroup.displayName || selectedGroup.name">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item :label="$t('general:Name')">
              {{ selectedGroup.name }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('general:Organization')">
              {{ selectedGroup.owner }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('general:Type')">
              {{ selectedGroup.type }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('group:Parent group')">
              {{ selectedGroup.parentId }}
            </a-descriptions-item>
            <a-descriptions-item :label="$t('general:Users')">
              <a-space wrap>
                <a-tag v-for="user in selectedGroup.users || []" :key="user">
                  {{ user }}
                </a-tag>
              </a-space>
            </a-descriptions-item>
          </a-descriptions>

          <a-space style="margin-top: 16px" wrap>
            <a-button type="primary" @click="handleAddChild">
              {{ $t("group:Add subgroup") }}
            </a-button>
            <a-button @click="handleEdit">
              {{ $t("general:Edit") }}
            </a-button>
            <a-button
              danger
              :disabled="Boolean(selectedGroup.haveChildren)"
              @click="handleDelete"
            >
              {{ $t("general:Delete") }}
            </a-button>
          </a-space>
        </a-card>

        <a-empty v-else />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { Modal } from "ant-design-vue";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import PageHeader from "@/components/common/PageHeader.vue";
import { groupApi, organizationApi } from "@/api/management";
import { getResourceContext, getStoredOrganization, setStoredOrganization, showMessage } from "@/utils/management";

type TreeNode = Record<string, unknown> & { children?: TreeNode[] };

const router = useRouter();
const context = getResourceContext();
const organization = ref(getStoredOrganization());
const organizationOptions = ref<{ label: string; value: string }[]>([{ label: "All", value: "All" }]);
const rawTree = ref<TreeNode[]>([]);
const treeData = ref<Record<string, unknown>[]>([]);
const selectedKeys = ref<string[]>([]);
const selectedGroup = ref<TreeNode | null>(null);

const effectiveOrganization = computed(() => (organization.value === "All" ? context.accountOwner : organization.value));

function formatTree(nodes: TreeNode[]): Record<string, unknown>[] {
  return nodes.map((node) => ({
    key: String(node.key || node.name),
    title: String(node.title || node.displayName || node.name),
    children: node.children ? formatTree(node.children) : [],
  }));
}

function findNode(nodes: TreeNode[], key: string): TreeNode | null {
  for (const node of nodes) {
    const nodeKey = String(node.key || node.name);
    if (nodeKey === key) {
      return node;
    }

    if (Array.isArray(node.children)) {
      const child = findNode(node.children, key);
      if (child) {
        return child;
      }
    }
  }

  return null;
}

async function loadOrganizations() {
  if (!context.isAdmin) {
    return;
  }

  try {
    const response = await organizationApi.list("admin");
    if (response.status !== "ok") {
      throw new Error(response.msg || "Failed to load organizations");
    }

    organizationOptions.value = [
      { label: "All", value: "All" },
      ...(response.data || []).map((item) => ({
        label: String(item.displayName || item.name),
        value: String(item.name),
      })),
    ];
  } catch (error) {
    showMessage("error", (error as Error).message);
  }
}

async function loadTreeData() {
  try {
    const response = await groupApi.list(effectiveOrganization.value, true);
    if (response.status !== "ok") {
      throw new Error(response.msg || "Failed to load groups");
    }

    rawTree.value = (response.data || []) as TreeNode[];
    treeData.value = formatTree(rawTree.value);
    selectedGroup.value = null;
    selectedKeys.value = [];
  } catch (error) {
    showMessage("error", (error as Error).message);
  }
}

function handleSelect(keys: string[]) {
  selectedKeys.value = keys;
  selectedGroup.value = keys[0] ? findNode(rawTree.value, keys[0]) : null;
}

function handleOrganizationChange(value: string) {
  organization.value = value;
  setStoredOrganization(value);
  void loadTreeData();
}

function handleAddRoot() {
  void router.push({ name: "management-groups-new", query: { parentId: effectiveOrganization.value } });
}

function handleAddChild() {
  if (!selectedGroup.value) {
    return;
  }

  void router.push({ name: "management-groups-new", query: { parentId: selectedGroup.value.name } });
}

function handleEdit() {
  if (!selectedGroup.value) {
    return;
  }

  void router.push({
    name: "management-groups-edit",
    params: {
      owner: selectedGroup.value.owner,
      name: selectedGroup.value.name,
    },
  });
}

function handleDelete() {
  if (!selectedGroup.value || selectedGroup.value.haveChildren) {
    return;
  }

  Modal.confirm({
    title: "Confirm delete",
    content: String(selectedGroup.value.name),
    async onOk() {
      try {
        const response = await groupApi.remove({
          owner: selectedGroup.value?.owner,
          name: selectedGroup.value?.name,
        });

        if (response.status !== "ok") {
          throw new Error(response.msg || "Delete failed");
        }

        showMessage("success", "Successfully deleted");
        await loadTreeData();
      } catch (error) {
        showMessage("error", (error as Error).message);
      }
    },
  });
}

onMounted(() => {
  void loadOrganizations();
  void loadTreeData();
});
</script>
