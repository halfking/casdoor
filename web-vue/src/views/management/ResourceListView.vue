<template>
  <div>
    <PageHeader :title="$t(resource.listTitle)">
      <a-space wrap>
        <SearchBox
          :model-value="table.searchText.value"
          :loading="table.loading.value"
          @update:model-value="table.searchText.value = $event"
          @search="(value) => table.handleSearch(resource.searchField, value)"
        />
        <a-button @click="table.resetSearch()">{{ $t("forget:Reset") }}</a-button>
        <a-select
          v-for="filter in resource.filters || []"
          :key="filter.key"
          :placeholder="$t(filter.label)"
          :options="filter.options"
          allow-clear
          style="min-width: 180px"
          @change="table.setFilter(filter.key, $event)"
        />
        <a-button type="primary" @click="handleCreate">
          {{ $t("general:Add") }}
        </a-button>
        <a-button @click="table.refresh()">
          {{ $t("general:Refresh") }}
        </a-button>
      </a-space>
    </PageHeader>

    <CustomTable
      :columns="columns"
      :data-source="table.data.value"
      :loading="table.loading.value"
      :pagination="table.pagination"
      :row-key="resource.rowKey"
      @change="table.handleTableChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import PageHeader from "@/components/common/PageHeader.vue";
import SearchBox from "@/components/common/SearchBox.vue";
import ActionButton from "@/components/common/ActionButton.vue";
import CustomTable from "@/components/common/CustomTable.vue";
import { useTable } from "@/composables/useTable";
import type { ResourceConfig } from "@/types/management";
import type { TableColumnType } from "ant-design-vue";
import { getResourceContext, showMessage } from "@/utils/management";

const props = defineProps<{
  resource: ResourceConfig;
}>();

const router = useRouter();
const { t } = useI18n();
const context = computed(() => getResourceContext());

let table!: ReturnType<typeof useTable<Record<string, unknown>>>;
const handleOrganizationChanged = () => {
  void table.refresh();
};

table = useTable<Record<string, unknown>>({
  fetchFn: async (params) => {
    try {
      return await props.resource.list(params, context.value);
    } catch (error) {
      showMessage("error", (error as Error).message);
      return { data: [], data2: 0 };
    }
  },
  deleteFn: async (key) => {
    const response = await props.resource.removeByKey(props.resource.rowKey(key), table.data.value);
    if (response.status !== "ok") {
      throw new Error(response.msg || "Delete failed");
    }
    return response;
  },
});

const columns = computed<TableColumnType[]>(() => {
  const baseColumns = props.resource.columns.map((column) => ({
    key: column.key,
    dataIndex: column.dataIndex || column.key,
    title: t(column.title),
    width: column.width,
    sorter: column.sorter,
    ellipsis: column.ellipsis,
    customRender: column.render
      ? ({ text, record }: { text: unknown; record: Record<string, unknown> }) => column.render?.(text, record)
      : undefined,
  }));

  return [
    ...baseColumns,
    {
      key: "actions",
      title: t("general:Action"),
      width: 140,
      fixed: "right" as const,
      customRender: ({ record }: { record: Record<string, unknown> }) =>
        h(ActionButton, {
          disableEdit: props.resource.canEdit ? !props.resource.canEdit(record) : false,
          disableDelete: props.resource.canDelete ? !props.resource.canDelete(record) : false,
          onEdit: () => handleEdit(record),
          onDelete: () => table.confirmDelete(record),
        }),
    },
  ];
});

function handleCreate() {
  void router.push(props.resource.createRoute(context.value));
}

function handleEdit(record: Record<string, unknown>) {
  void router.push(props.resource.editRoute(record));
}

onMounted(() => {
  void table.fetch();
  window.addEventListener("storageOrganizationChanged", handleOrganizationChanged);
});

onUnmounted(() => {
  window.removeEventListener("storageOrganizationChanged", handleOrganizationChanged);
});
</script>
