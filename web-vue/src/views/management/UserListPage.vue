<template>
  <div class="user-list-container">
    <PageHeader :title="$t('general:Users')">
      <a-space wrap>
        <a-input
          v-model:value="searchText"
          :placeholder="$t('general:Search')"
          style="min-width: 200px"
          allow-clear
          @pressEnter="handleSearch"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
        <a-button type="primary" @click="handleSearch">
          {{ $t("general:Search") }}
        </a-button>
        <a-button @click="handleReset">
          {{ $t("forget:Reset") }}
        </a-button>
        <a-button type="primary" @click="handleCreate">
          {{ $t("general:Add") }}
        </a-button>
        <a-button @click="handleRefresh">
          <ReloadOutlined /> {{ $t("general:Refresh") }}
        </a-button>
      </a-space>
    </PageHeader>

    <a-table
      :columns="columns"
      :data-source="users"
      :loading="loading"
      :pagination="pagination"
      :row-key="(record: User) => `${record.owner}/${record.name}`"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'name'">
          <a :href="`/management/users/${record.owner}/${encodeURIComponent(String(record.name))}`">
            {{ record.name }}
          </a>
        </template>
        <template v-else-if="column.key === 'createdTime'">
          {{ formatDate(String(record.createdTime || "")) }}
        </template>
        <template v-else-if="column.key === 'isAdmin'">
          <a-tag :color="record.isAdmin ? 'blue' : 'default'">
            {{ record.isAdmin ? $t("general:Yes") : $t("general:No") }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'isForbidden'">
          <a-tag :color="record.isForbidden ? 'red' : 'green'">
            {{ record.isForbidden ? $t("general:Yes") : $t("general:No") }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">
              {{ $t("general:Edit") }}
            </a-button>
            <a-button type="link" size="small" @click="handleResetPassword(record)">
              {{ $t("user:Reset Password") }}
            </a-button>
            <a-popconfirm
              :title="$t('general:Delete confirm')"
              :ok-text="$t('general:Confirm')"
              :cancel-text="$t('general:Cancel')"
              @confirm="handleDelete(record)"
            >
              <a-button type="link" size="small" danger>
                {{ $t("general:Delete") }}
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- Reset Password Modal -->
    <a-modal
      v-model:open="resetPasswordModalVisible"
      :title="$t('user:Reset Password')"
      @ok="handleResetPasswordSubmit"
      :confirmLoading="resetPasswordLoading"
    >
      <a-form :model="resetPasswordForm" :label-col="{ span: 6 }" layout="horizontal">
        <a-form-item :label="$t('general:User')">
          <a-input :value="`${resetPasswordForm.owner} / ${resetPasswordForm.name}`" disabled />
        </a-form-item>
        <a-form-item :label="$t('user:New Password')" name="newPassword">
          <a-input-password
            v-model:value="resetPasswordForm.newPassword"
            :placeholder="$t('user:Enter new password')"
          />
        </a-form-item>
        <a-form-item :label="$t('user:Confirm Password')" name="confirmPassword">
          <a-input-password
            v-model:value="resetPasswordForm.confirmPassword"
            :placeholder="$t('user:Confirm new password')"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons-vue";
import PageHeader from "@/components/common/PageHeader.vue";
import * as UserApi from "@/api/modules/user";
import type { User } from "@/api/types";
const { t } = useI18n();
const router = useRouter();

const loading = ref(false);
const users = ref<User[]>([]);
const searchText = ref("");
const searchedColumn = ref("name");

const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
});

const resetPasswordModalVisible = ref(false);
const resetPasswordLoading = ref(false);
const resetPasswordForm = reactive({
  owner: "",
  name: "",
  newPassword: "",
  confirmPassword: "",
});

const columns = [
  {
    title: "general:Name",
    key: "name",
    dataIndex: "name",
    width: 180,
    sorter: true,
  },
  {
    title: "general:Created time",
    key: "createdTime",
    dataIndex: "createdTime",
    width: 180,
    sorter: true,
  },
  {
    title: "general:Display name",
    key: "displayName",
    dataIndex: "displayName",
    sorter: true,
    ellipsis: true,
  },
  {
    title: "general:Email",
    key: "email",
    dataIndex: "email",
    sorter: true,
    ellipsis: true,
  },
  {
    title: "general:Phone",
    key: "phone",
    dataIndex: "phone",
    sorter: true,
  },
  {
    title: "general:Is admin",
    key: "isAdmin",
    dataIndex: "isAdmin",
    sorter: true,
    width: 120,
  },
  {
    title: "general:Is forbidden",
    key: "isForbidden",
    dataIndex: "isForbidden",
    sorter: true,
    width: 140,
  },
  {
    title: "general:Action",
    key: "actions",
    width: 280,
    fixed: "right" as const,
  },
];

function formatDate(dateStr: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleString();
}

const fetchUsers = async () => {
  loading.value = true;
  try {
    const params: {
      owner?: string;
      page: number;
      pageSize: number;
      field: string;
      value: string;
      sortField?: string;
      sortOrder?: string;
    } = {
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
      field: searchedColumn.value,
      value: searchText.value,
    };

    // Check if current organization is "All" for global users
    const currentOrg = localStorage.getItem("currentOrganization") || "";
    let res;
    if (currentOrg === "All") {
      res = await UserApi.getGlobalUsers({
        page: params.page,
        pageSize: params.pageSize,
        field: params.field,
        value: params.value,
        sortField: params.sortField,
        sortOrder: params.sortOrder,
      });
    } else {
      params.owner = currentOrg;
      res = await UserApi.getUsers(params);
    }

    if (res.status === "ok") {
      users.value = res.data || [];
      pagination.value.total = Number(res.data2) || 0;
    }
  } catch (error) {
    message.error(t("general:Failed to load users"));
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.value.current = 1;
  void fetchUsers();
};

const handleReset = () => {
  searchText.value = "";
  searchedColumn.value = "name";
  pagination.value.current = 1;
  void fetchUsers();
};

const handleRefresh = () => {
  void fetchUsers();
};

const handleCreate = () => {
  void router.push({ name: "management-users-new" });
};

const handleEdit = (record: User) => {
  void router.push({
    name: "management-users-edit",
    params: { owner: String(record.owner), name: String(record.name) },
  });
};

const handleDelete = async (record: User) => {
  try {
    const res = await UserApi.deleteUser({ owner: record.owner, name: record.name } as User);
    if (res.status === "ok") {
      message.success(t("general:Successfully deleted"));
      void fetchUsers();
    } else {
      message.error(res.msg || t("general:Failed to delete"));
    }
  } catch (error) {
    message.error(t("general:Failed to delete"));
  }
};

const handleResetPassword = (record: User) => {
  resetPasswordForm.owner = record.owner;
  resetPasswordForm.name = record.name;
  resetPasswordForm.newPassword = "";
  resetPasswordForm.confirmPassword = "";
  resetPasswordModalVisible.value = true;
};

const handleResetPasswordSubmit = async () => {
  if (!resetPasswordForm.newPassword) {
    message.error(t("user:Please enter new password"));
    return;
  }

  if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
    message.error(t("user:Passwords do not match"));
    return;
  }

  resetPasswordLoading.value = true;
  try {
    // As admin, oldPassword can be empty
    const res = await UserApi.setPassword(
      resetPasswordForm.owner,
      resetPasswordForm.name,
      "", // oldPassword - empty for admin
      resetPasswordForm.newPassword
    );

    if (res.status === "ok") {
      message.success(t("user:Password reset successfully"));
      resetPasswordModalVisible.value = false;
    } else {
      message.error(res.msg || t("user:Failed to reset password"));
    }
  } catch (error) {
    message.error(t("user:Failed to reset password"));
  } finally {
    resetPasswordLoading.value = false;
  }
};

const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current || 1;
  pagination.value.pageSize = pag.pageSize || 20;
  if (pag.sortField) {
    const sortOrder = pag.sortOrder === "ascend" ? "asc" : "desc";
    // Note: pagination ref doesn't have sortField/sortOrder but we handle it via fetch
  }
  void fetchUsers();
};

onMounted(() => {
  void fetchUsers();
});
</script>

<style scoped>
.user-list-container {
  padding: 24px;
}
</style>
