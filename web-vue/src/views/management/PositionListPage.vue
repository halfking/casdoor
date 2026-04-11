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
          {{ record.impliedRole || "-" }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">
              {{ $t("general.Edit") }}
            </a-button>
            <a-popconfirm
              title="确定删除该岗位？"
              ok-text="确定"
              cancel-text="取消"
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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import type { TableProps } from "ant-design-vue";
import PageHeader from "@/components/common/PageHeader.vue";
import * as PositionApi from "@/api/modules/position";
import type { Position } from "@/api/modules/position";

const { t } = useI18n();
const router = useRouter();

const positions = ref<Position[]>([]);
const filterDepartment = ref<string | undefined>(undefined);

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
});

const departmentOptions = [
  { label: "技术研发部", value: "技术研发部" },
  { label: "业务运营部", value: "业务运营部" },
  { label: "平台治理部", value: "平台治理部" },
];

const columns = [
  {
    title: "ID",
    key: "id",
    dataIndex: "id",
    width: 80,
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
    const params: Record<string, any> = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
    };
    if (filterDepartment.value) {
      params.department = filterDepartment.value;
    }
    const res: any = await PositionApi.getPositions(params);
    positions.value = res.data || [];
    if (res.data2 !== undefined) {
      pagination.value.total = res.data2;
    } else {
      pagination.value.total = positions.value.length;
    }
  } catch {
    message.error(t("general.Failed to load positions"));
  } finally {
    loading.value = false;
  }
};

const loading = ref(false);

const handleRefresh = () => {
  void fetchPositions();
};

const handleFilterChange = () => {
  pagination.value.current = 1;
  void fetchPositions();
};

const handleTableChange: TableProps["onChange"] = (pag) => {
  pagination.value.current = pag.current || 1;
  pagination.value.pageSize = pag.pageSize || 20;
  void fetchPositions();
};

const handleCreate = () => {
  void router.push("/management/positions/new");
};

const handleEdit = (record: Position) => {
  void router.push(`/management/positions/${record.id}`);
};

const handleDelete = async (record: Position) => {
  try {
    await PositionApi.deletePosition(record.id!);
    message.success(t("general.Success"));
    void fetchPositions();
  } catch {
    message.error(t("general.Failed"));
  }
};

onMounted(() => {
  void fetchPositions();
});
</script>
