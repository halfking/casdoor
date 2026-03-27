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
import type { TablePaginationConfig } from "ant-design-vue";

defineProps<{
  columns: Record<string, unknown>[];
  dataSource: Record<string, unknown>[];
  loading: boolean;
  pagination: TablePaginationConfig;
  rowKey: string | ((record: Record<string, unknown>) => string);
}>();

const emit = defineEmits<{
  change: [pagination: TablePaginationConfig, filters: Record<string, unknown>, sorter: Record<string, unknown>];
}>();

function handleChange(pagination: TablePaginationConfig, filters: Record<string, unknown>, sorter: Record<string, unknown>) {
  emit("change", pagination, filters, sorter);
}
</script>
