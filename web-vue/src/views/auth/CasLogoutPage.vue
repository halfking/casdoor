<template>
  <div class="entry-shell">
    <a-card class="entry-card">
      <a-spin size="large" tip="Logging out..." />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getAccount, logout } from "@/api/modules/auth";
import * as Setting from "@/utils/Setting";

const route = useRoute();
const authStore = useAuthStore();

function nextLocation(redirectUri?: string) {
  if (redirectUri) {
    return redirectUri;
  }

  const service = String(route.query.service || "");
  if (service) {
    return service;
  }

  return `/cas/${route.params.owner}/${route.params.casApplicationName}/login`;
}

async function waitUntilLoggedOut(initialRedirect?: string, attempts = 0): Promise<void> {
  if (attempts > 20) {
    authStore.logout();
    Setting.goToLink(nextLocation(initialRedirect));
    return;
  }

  try {
    const accountRes = await getAccount("");
    if (accountRes.status === "ok" && accountRes.data) {
      const logoutRes = await logout();
      if (logoutRes.status === "ok") {
        window.setTimeout(() => {
          void waitUntilLoggedOut(String(logoutRes.data2 || initialRedirect || ""), attempts + 1);
        }, 100);
        return;
      }

      Setting.showMessage("error", logoutRes.msg || "Failed to log out");
      return;
    }
  } catch {
    // Treat request failure as already logged out and continue.
  }

  authStore.logout();
  Setting.showMessage("success", "Logged out successfully");
  Setting.goToLink(nextLocation(initialRedirect));
}

onMounted(async () => {
  try {
    const res = await logout();
    if (res.status !== "ok") {
      Setting.showMessage("error", res.msg || "Failed to log out");
      return;
    }

    await waitUntilLoggedOut(String(res.data2 || ""));
  } catch (error) {
    Setting.showMessage("error", error instanceof Error ? error.message : "Failed to log out");
  }
});
</script>

<style scoped>
.entry-shell {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.entry-card {
  width: min(420px, 92vw);
  text-align: center;
}
</style>
