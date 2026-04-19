<template>
  <a-table
    :columns="columns"
    :data-source="dataSource"
    :loading="loading"
    :pagination="pagination"
    :row-key="rowKey"
    :scroll="{ x: 'max-content' }"
    bordered
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import type { TableColumnType } from "ant-design-vue";

type Entity = Record<string, unknown>;

defineProps<{
  columns: TableColumnType[];
  dataSource: Entity[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    showTotal?: (total: number) => string;
    showSizeChanger?: boolean;
  };
  rowKey: string | ((record: Entity) => string);
}>();

const emit = defineEmits<{
  (e: "change", pagination: { current?: number; pageSize?: number }, filters: unknown, sorter: { field?: string; order?: string }): void;
}>();

function handleChange(
  pagination: { current?: number; pageSize?: number },
  filters: unknown,
  sorter: { field?: string; order?: string },
) {
  emit("change", pagination, filters, sorter);
}
</script>
