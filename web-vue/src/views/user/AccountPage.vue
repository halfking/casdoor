<template>
  <ResourceEditView
    :resource="userResourceConfig"
    :account-page="true"
    v-if="!loading"
  />
  <div v-else class="loading-container">
    <a-spin size="large" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ResourceEditView from "@/views/management/ResourceEditView.vue";
import { resourceConfigs } from "@/utils/resource-configs";
import { useAuthStore } from "@/stores/auth";
import * as UserApi from "@/api/modules/user";
import { message } from "ant-design-vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);

const userResourceConfig = computed(() => resourceConfigs.users);

// 获取当前用户数据并设置到路由参数
onMounted(async () => {
  if (!authStore.account) {
    message.error("Please login first");
    router.push("/login");
    return;
  }

  const account = authStore.account;
  const owner = account.owner;
  const name = account.name;

  try {
    const response = await UserApi.getUser(owner, name);
    if (response.status === "ok") {
      // 修改路由参数以加载当前用户的数据
      route.params.owner = owner;
      route.params.name = name;
    } else {
      message.error(response.msg || "Failed to load account data");
    }
  } catch (error) {
    message.error((error as Error).message);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
