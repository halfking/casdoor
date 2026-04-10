<template>
  <div v-if="resolvedLogoUrl" class="app-logo">
    <a :href="orgUrl" target="_blank" rel="noreferrer">
      <img :src="resolvedLogoUrl" :alt="application?.displayName || application?.name" class="app-logo-img" @error="onLogoError" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import * as Setting from "@/utils/Setting";
import type { Application } from "@/api/types";

const props = defineProps<{
  application: Application | null;
}>();

const logoUrl = computed(() => {
  const application = props.application;
  if (!application) return "";

  // Prefer per-application dark/light logo when provided by application config.
  const appAny = application as Application & { logoDark?: string };
  if (Setting.isDarkTheme() && appAny.logoDark) {
    return appAny.logoDark;
  }
  return application.logo || "";
});

const resolvedLogoUrl = ref("");
watchEffect(() => {
  resolvedLogoUrl.value = logoUrl.value;
});

function onLogoError() {
  resolvedLogoUrl.value = Setting.isDarkTheme()
    ? "/img/kaixuan-platform-logo-dark.svg"
    : "/img/kaixuan-platform-logo-light.svg";
}

const orgUrl = computed(() => {
  if (!props.application?.homepageUrl) return "/";
  return props.application.homepageUrl;
});
</script>

<style scoped>
.app-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
.app-logo-img {
  max-width: 250px;
  max-height: 80px;
  object-fit: contain;
  opacity: 0.96;
}
</style>
