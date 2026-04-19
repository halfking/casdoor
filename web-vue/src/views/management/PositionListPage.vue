<template>
  <div class="position-list-container">
    <PageHeader title="岗位管理">
      <a-space wrap>
        <a-button @click="handleRefresh">
          {{ $t("general.Refresh") }}
        </a-button>
        <a-select
          v-model:value="filterDepartment"
          :placeholder="$t('position.Department')"
          :options="departmentOptions"
          allow-clear
          style="min-width: 180px"
          @change="handleFilterChange"
        />
        <a-button type="primary" @click="handleCreate">
          {{ $t("general.Add") }}
        </a-button>
      </a-space>
    </PageHeader>

    <a-table
      :columns="columns"
      :data-source="positions"
      :loading="loading"
      :pagination="pagination"
      :row-key="(record: any) => record.id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'id'">
          {{ record.id }}
        </template>
        <template v-else-if="column.key === 'roleName'">
          {{ record.roleName }}
        </template>
        <template v-else-if="column.key === 'fullDescription'">
          {{ truncateText(record.fullDescription, 50) }}
        </template>
        <template v-else-if="column.key === 'department'">
          {{ record.department }}
        </template>
        <template v-else-if="column.key === 'impliedRole'">
          {{ record.impliedRole || '-' }}
        </template>
        <template v-else-if="column.key === 'orgTreeCode'">
          {{ record.orgTreeCode || '-' }}
        </template>
        <template v-else-if="column.key === 'agentProvider'">
          {{ record.agentProvider || '-' }}
        </template>
        <template v-else-if="column.key === 'agentModel'">
          {{ record.agentModel || '-' }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">
              {{ $t("general.Edit") }}
            </a-button>
            <a-popconfirm
              :title="$t('general.Delete confirm')"
              :ok-text="$t('general.Confirm')"
              :cancel-text="$t('general.Cancel')"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" size="small" danger>
                {{ $t("general.Delete") }}
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import PageHeader from "@/components/common/PageHeader.vue";
import * as PositionApi from "@/api/modules/position";
import type { PositionRecord } from "@/api/modules/position";

const { t } = useI18n();
const router = useRouter();

const loading = ref(false);
const positions = ref<PositionRecord[]>([]);
const filterDepartment = ref<string | undefined>(undefined);

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
});

const departmentOptions = [
  { label: "Platform Governance", value: "dept-built-in-platform" },
  { label: "Security Operations", value: "dept-built-in-security" },
  { label: "Operations Enablement", value: "dept-built-in-operations" },
];

const columns = [
  {
    title: "ID",
    key: "id",
    dataIndex: "id",
    width: 80,
  },
  {
    title: "岗位编码",
    key: "code",
    dataIndex: "code",
    width: 120,
  },
  {
    title: "岗位名称",
    key: "roleName",
    dataIndex: "roleName",
    width: 150,
  },
  {
    title: "所属部门",
    key: "department",
    dataIndex: "department",
    width: 120,
  },
  {
    title: "引用Role",
    key: "impliedRole",
    dataIndex: "impliedRole",
    width: 150,
  },
  {
    title: "组织树编码",
    key: "orgTreeCode",
    dataIndex: "orgTreeCode",
    width: 120,
  },
  {
    title: "AI智能体",
    key: "agentProvider",
    dataIndex: "agentProvider",
    width: 120,
  },
  {
    title: "AI模型",
    key: "agentModel",
    dataIndex: "agentModel",
    width: 120,
  },
  {
    title: "描述",
    key: "fullDescription",
    dataIndex: "fullDescription",
    ellipsis: true,
  },
  {
    title: "操作",
    key: "actions",
    width: 150,
    fixed: "right" as const,
  },
];

const truncateText = (text: string | undefined, maxLength: number) => {
  if (!text) return "-";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const fetchPositions = async () => {
  loading.value = true;
  try {
    const params: PositionApi.PositionListParams = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
    };
    if (filterDepartment.value) {
      params.department = filterDepartment.value;
    }
    const res = await PositionApi.getPositions(params);
    if (res.status === "ok") {
      positions.value = res.data || [];
      if (res.data2 !== undefined) {
        pagination.value.total = Number(res.data2) || 0;
      } else {
        pagination.value.total = positions.value.length;
      }
    }
  } catch (error) {
    message.error(t("general.Failed to load positions"));
  } finally {
    loading.value = false;
  }
};

const handleRefresh = () => {
  void fetchPositions();
};

const handleFilterChange = () => {
  pagination.value.current = 1;
  void fetchPositions();
};

const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  void fetchPositions();
};

const handleCreate = () => {
  void router.push("/management/positions/new");
};

const handleEdit = (record: PositionRecord) => {
  void router.push(`/management/positions/${record.id}`);
};

const handleDelete = async (record: PositionRecord) => {
  try {
    await PositionApi.deletePosition(record.id);
    message.success(t("general.Success"));
    void fetchPositions();
  } catch (error) {
    message.error(t("general.Failed to delete"));
  }
};

onMounted(() => {
  void fetchPositions();
});
</script>

<style scoped lang="less">
.position-list-container {
  padding: 24px;
  background: var(--kx-bg-card, #fff);
  border-radius: 8px;
}
</style>
