<template>
  <div v-if="logoUrl" class="app-logo">
    <a :href="orgUrl" target="_blank" rel="noreferrer">
      <img :src="logoUrl" :alt="application?.displayName || application?.name" class="app-logo-img" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Application } from "@/api/types";

const props = defineProps<{
  application: Application | null;
}>();

const logoUrl = computed(() => {
  return props.application?.logo || "";
});

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
}
</style>
