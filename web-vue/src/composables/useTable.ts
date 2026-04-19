import { ref, reactive, computed } from "vue";
import { Modal } from "ant-design-vue";

type Entity = Record<string, unknown>;

export interface TableParams {
  page: number;
  pageSize: number;
  searchText: string;
  searchedColumn: string;
  sortField?: string;
  sortOrder?: string;
  [key: string]: unknown;
}

export interface UseTableOptions<T extends Entity> {
  fetchFn: (params: TableParams) => Promise<{ data: T[]; data2?: number }>;
  deleteFn?: (record: T) => Promise<unknown>;
  pageSize?: number;
}

export function useTable<T extends Entity>(options: UseTableOptions<T>) {
  const { fetchFn, deleteFn, pageSize: defaultPageSize = 10 } = options;

  const data = ref<T[]>([]) as unknown as { value: T[] };
  const loading = ref(false);
  const searchText = ref("");
  const searchedColumn = ref("");
  const filters = reactive<Record<string, unknown>>({});

  const pagination = reactive({
    current: 1,
    pageSize: defaultPageSize,
    total: 0,
    showTotal: (total: number) => `Total ${total} items`,
    showSizeChanger: true,
  });

  const hasFilters = computed(() => {
    return searchText.value !== "" || Object.values(filters).some((v) => v !== undefined && v !== "");
  });

  async function fetch(extra?: Record<string, unknown>) {
    loading.value = true;
    try {
      const params: TableParams = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        searchText: searchText.value,
        searchedColumn: searchedColumn.value,
        ...filters,
        ...(extra || {}),
      };
      const result = await fetchFn(params);
      (data as unknown as { value: T[] }).value = result.data;
      pagination.total = result.data2 ?? 0;
    } catch {
      // error handled externally
    } finally {
      loading.value = false;
    }
  }

  async function refresh() {
    await fetch();
  }

  async function confirmDelete(record: T) {
    if (!deleteFn) {
      return;
    }

    Modal.confirm({
      title: "Confirm Delete",
      content: "Are you sure you want to delete this item?",
      okType: "danger",
      onOk: async () => {
        loading.value = true;
        try {
          await deleteFn(record);
          await fetch();
        } finally {
          loading.value = false;
        }
      },
    });
  }

  function handleSearch(column: string, value: string) {
    searchedColumn.value = column;
    searchText.value = value;
    pagination.current = 1;
    fetch();
  }

  function resetSearch() {
    searchText.value = "";
    searchedColumn.value = "";
    pagination.current = 1;
    fetch();
  }

  function setFilter(key: string, value: unknown) {
    filters[key] = value;
    pagination.current = 1;
    fetch();
  }

  function handleTableChange(pag: { current?: number; pageSize?: number }, _filters: unknown, sorter: { field?: string; order?: string }) {
    pagination.current = pag.current || 1;
    pagination.pageSize = pag.pageSize || defaultPageSize;
    const params: Record<string, unknown> = {};
    if (sorter.field) {
      params.sortField = sorter.field;
      params.sortOrder = sorter.order;
    }
    fetch(params);
  }

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
