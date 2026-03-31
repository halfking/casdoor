<template>
  <div class="entry-shell">
    <a-card class="entry-card">
      <a-spin v-if="loading" size="large" tip="Loading captcha..." />
      <a-result
        v-else-if="errorMessage"
        status="error"
        title="Failed to load captcha"
        :sub-title="errorMessage"
      />
      <a-result
        v-else
        status="info"
        title="Captcha Verification"
        sub-title="Complete the captcha challenge to continue."
      />
    </a-card>
    <CaptchaModal
      v-if="provider"
      :owner="provider.owner"
      :name="provider.name"
      :visible="modalVisible"
      :is-current-provider="true"
      @ok="handleOk"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { Application, Provider, ProviderItem } from "@/api/types";
import { getApplication } from "@/api/modules/application";
import CaptchaModal from "@/components/CaptchaModal.vue";
import * as Setting from "@/utils/Setting";

const route = useRoute();
const loading = ref(true);
const modalVisible = ref(false);
const errorMessage = ref("");
const application = ref<Application | null>(null);

const applicationName = computed(() => String(route.query.state || ""));
const redirectUri = computed(() => String(route.query.redirect_uri || ""));

const provider = computed<Provider | null>(() => {
  const providers = application.value?.providers || [];
  const captchaProviders = providers.filter((item: ProviderItem) => item.provider?.category === "Captcha");
  if (captchaProviders.length === 0) {
    return null;
  }

  const alwaysProvider = captchaProviders.find((item) => item.rule === "Always")?.provider;
  return alwaysProvider || captchaProviders[0].provider || null;
});

function buildCallbackUrl(values: { captchaType: string; captchaToken: string; clientSecret: string; applicationId: string }) {
  const url = new URL(redirectUri.value, window.location.origin);
  url.searchParams.set("code", values.captchaToken);
  url.searchParams.set("type", values.captchaType);
  url.searchParams.set("secret", values.clientSecret);
  url.searchParams.set("applicationId", values.applicationId);
  return url.toString();
}

function handleOk(captchaType: string, captchaToken: string, clientSecret: string) {
  if (!provider.value) {
    return;
  }

  Setting.goToLink(buildCallbackUrl({
    captchaType,
    captchaToken,
    clientSecret,
    applicationId: `${provider.value.owner}/${provider.value.name}`,
  }));
}

function handleCancel() {
  Setting.goToLink(buildCallbackUrl({
    captchaType: "none",
    captchaToken: "",
    clientSecret: "",
    applicationId: provider.value ? `${provider.value.owner}/${provider.value.name}` : "",
  }));
}

onMounted(async () => {
  if (!applicationName.value || !redirectUri.value) {
    errorMessage.value = "Missing application or redirectUri query parameters.";
    loading.value = false;
    return;
  }

  try {
    const res = await getApplication("admin", applicationName.value);
    if (res.status !== "ok" || !res.data) {
      errorMessage.value = res.msg || "Application not found.";
      return;
    }

    application.value = res.data;
    if (!provider.value) {
      errorMessage.value = "No captcha provider is configured for this application.";
      return;
    }

    modalVisible.value = true;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to load captcha.";
  } finally {
    loading.value = false;
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
  width: min(520px, 92vw);
  text-align: center;
}
</style>
