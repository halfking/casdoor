<template>
  <div style="display: flex; flex: 1; justify-content: center">
    <a-card v-if="application">
      <div style="margin-top: 30px; margin-bottom: 30px; text-align: center">
        <CustomHelmet :application="application" />
        <AppLogo :application="application" />
        <a-result
          status="success"
          :title="t('signup.Your account has been created!')"
          :sub-title="t('signup.Please click the below button to sign in')"
        >
          <template #extra>
            <a-button type="primary" @click="handleSignIn">
              {{ t("login.Sign In") }}
            </a-button>
          </template>
        </a-result>
      </div>
    </a-card>
    <a-spin
      v-else
      size="large"
      :tip="t('login.Loading')"
      style="padding-top: 10%"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { getApplication } from "@/api/modules/application";
import { getAccount } from "@/api/modules/auth";
import * as Setting from "@/utils/Setting";
import type { Application } from "@/api/types";
import CustomHelmet from "@/components/CustomHelmet.vue";
import AppLogo from "@/components/AppLogo.vue";

const { t } = useI18n();
const route = useRoute();

const application = ref<Application | null>(null);

const applicationName =
  (route.params.applicationName as string) || "app-built-in";

onMounted(async () => {
  if (!applicationName) {
    Setting.showMessage("error", `${t("general.Unknown application name")}: ${applicationName}`);
    return;
  }
  try {
    const res = await getApplication("admin", applicationName);
    if (res.status === "error") {
      Setting.showMessage("error", res.msg);
      return;
    }
    application.value = res.data ?? null;
  } catch {
    Setting.showMessage("error", "Failed to load application");
  }
});

async function handleSignIn() {
  try {
    const res = await getAccount();
    if (res.status === "ok" && res.data) {
      const linkInStorage = sessionStorage.getItem("signinUrl");
      if (linkInStorage) {
        window.location.href = linkInStorage;
      } else {
        Setting.goToLink("/");
      }
    } else {
      // Redirect to login page
      const loginLink = Setting.getLoginLink(application.value);
      if (loginLink.startsWith("http://") || loginLink.startsWith("https://")) {
        Setting.goToLink(loginLink);
      } else {
        Setting.goToLink(loginLink);
      }
    }
  } catch {
    Setting.goToLink("/login");
  }
}
</script>
