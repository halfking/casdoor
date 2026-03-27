<template>
  <div class="shared-navbar">
    <div class="shared-navbar__left">
      <a-button type="text" @click="$emit('toggle-menu')">
        <MenuOutlined />
      </a-button>
      <div class="shared-navbar__brand">
        <div class="shared-navbar__title">Casdoor</div>
        <div class="shared-navbar__subtitle">{{ $t("general:Management") }}</div>
      </div>
    </div>

    <div class="shared-navbar__right">
      <a-select
        v-if="context.isAdmin"
        :value="organization"
        :options="organizationOptions"
        style="width: 220px"
        @change="handleOrganizationChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { MenuOutlined } from "@ant-design/icons-vue";
import { organizationApi } from "@/api/management";
import { getResourceContext, getStoredOrganization, setStoredOrganization, showMessage } from "@/utils/management";
import type { SelectOption } from "@/types/management";

defineEmits<{
  "toggle-menu": [];
}>();

const organization = ref(getStoredOrganization());
const organizationOptions = ref<SelectOption[]>([{ label: "All", value: "All" }]);
const context = getResourceContext();

async function loadOrganizations() {
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

function handleOrganizationChange(value: string) {
  organization.value = value;
  setStoredOrganization(value);
}

onMounted(() => {
  if (context.isAdmin) {
    void loadOrganizations();
  }
});
</script>

<style scoped>
.shared-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.shared-navbar__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shared-navbar__brand {
  display: flex;
  flex-direction: column;
}

.shared-navbar__title {
  font-size: 18px;
  font-weight: 600;
}

.shared-navbar__subtitle {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.shared-navbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
