<template>
  <div v-if="resolvedLogoUrl" class="app-logo">
    <a :href="orgUrl" target="_blank" rel="noreferrer">
      <img
        :src="resolvedLogoUrl"
        :alt="application?.displayName || application?.name"
        class="app-logo-img"
        @error="onImgError"
      />
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Application } from "@/api/types";

const props = defineProps<{
  application: Application | null;
}>();

const logoUrl = computed(() => {
  const application = props.application;
  if (!application) return "";

  const name = String(application.name || "").toLowerCase();
  if (name.includes("casdoor") || name === "acc" || name === "personal-app") {
    return "/img/kx-brand-mark.svg";
  }
  if (name === "stock-trading") {
    return "/img/kx-stock-logo-light.svg";
  }
  if (name === "trendaradar") {
    return "/img/kx-trendaradar-logo-light.svg";
  }

  if (application.logo) {
    return application.logo;
  }
  return "/img/kx-brand-mark.svg";
});

const resolvedLogoUrl = ref("");

watch(
  logoUrl,
  (val) => {
    resolvedLogoUrl.value = val || "/img/kx-brand-mark.svg";
  },
  { immediate: true },
);

function onImgError() {
  // Keep login/signup header stable even when app-specific logo URL is invalid.
  if (resolvedLogoUrl.value !== "/img/kx-brand-mark.svg") {
    resolvedLogoUrl.value = "/img/kx-brand-mark.svg";
  }
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
