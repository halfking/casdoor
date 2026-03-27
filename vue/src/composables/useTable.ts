import { computed, ref } from "vue";
import { Modal } from "ant-design-vue";
import type { TablePaginationConfig } from "ant-design-vue";
import { showMessage } from "@/utils/management";

interface FetchResult<T> {
  data: T[];
  data2?: number;
}

interface UseTableOptions<T> {
  fetchFn: (params: Record<string, unknown>) => Promise<FetchResult<T>>;
  deleteFn?: (id: string) => Promise<unknown>;
  pageSize?: number;
}

export function useTable<T>(options: UseTableOptions<T>) {
  const data = ref<T[]>([]);
  const loading = ref(false);
  const searchText = ref("");
  const searchedColumn = ref("name");
  const filters = ref<Record<string, unknown>>({});
  const sorter = ref<{ field?: string; order?: string }>({});
  const pagination = ref<TablePaginationConfig>({
    current: 1,
    pageSize: options.pageSize ?? 10,
    total: 0,
    showQuickJumper: true,
    showSizeChanger: true,
  });

  async function fetch(extra: Record<string, unknown> = {}) {
    loading.value = true;

    try {
      const response = await options.fetchFn({
        page: pagination.value.current,
        pageSize: pagination.value.pageSize,
        searchText: searchText.value,
        searchedColumn: searchedColumn.value,
        sortField: sorter.value.field,
        sortOrder: sorter.value.order,
        ...filters.value,
        ...extra,
      });

      data.value = response.data;
      pagination.value = {
        ...pagination.value,
        total: response.data2 ?? response.data.length,
      };
    } finally {
      loading.value = false;
    }
  }

  async function refresh() {
    await fetch();
  }

  async function confirmDelete(id: string) {
    if (!options.deleteFn) {
      return;
    }

    Modal.confirm({
      title: "Confirm delete",
      content: id,
      async onOk() {
        try {
          await options.deleteFn?.(id);
          showMessage("success", "Successfully deleted");

          if (pagination.value.current && data.value.length === 1 && pagination.value.current > 1) {
            pagination.value.current -= 1;
          }

          await fetch();
        } catch (error) {
          showMessage("error", (error as Error).message);
        }
      },
    });
  }

  async function handleSearch(value: string, column = "name") {
    searchText.value = value;
    searchedColumn.value = column;
    pagination.value.current = 1;
    await fetch();
  }

  async function resetSearch() {
    searchText.value = "";
    pagination.value.current = 1;
    await fetch();
  }

  async function setFilter(key: string, value: unknown) {
    if (value === undefined || value === null || value === "") {
      delete filters.value[key];
      filters.value = { ...filters.value };
    } else {
      filters.value = {
        ...filters.value,
        [key]: value,
      };
    }

    pagination.value.current = 1;
    await fetch();
  }

  async function handleTableChange(nextPagination: TablePaginationConfig, nextFilters: Record<string, unknown>, nextSorter: Record<string, unknown>) {
    pagination.value = {
      ...pagination.value,
      current: nextPagination.current,
      pageSize: nextPagination.pageSize,
    };

    sorter.value = {
      field: typeof nextSorter.field === "string" ? nextSorter.field : undefined,
      order: typeof nextSorter.order === "string" ? nextSorter.order : undefined,
    };

    filters.value = {
      ...filters.value,
      ...nextFilters,
    };

    await fetch();
  }

  const hasFilters = computed(() => Object.keys(filters.value).length > 0 || searchText.value.length > 0);

  return {
    data,
    loading,
    pagination,
    searchText,
    searchedColumn,
    filters,
    hasFilters,
    fetch,
    refresh,
    confirmDelete,
    handleSearch,
    resetSearch,
    setFilter,
    handleTableChange,
  };
}
