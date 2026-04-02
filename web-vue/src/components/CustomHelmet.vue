<template>
  <teleport to="head">
    <title>{{ title }}</title>
    <link v-if="favicon" rel="icon" :href="favicon" />
  </teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Application } from "@/api/types";

const props = defineProps<{
  application: Application | null;
}>();

const title = computed(() => {
  const app = props.application;
  if (!app) return "开轩认证";
  const displayName = app.displayName || app.name || "开轩认证";
  if (displayName === "Casdoor" || displayName === "Built-in Organization") {
    return "开轩认证";
  }
  return displayName;
});

const favicon = computed(() => {
  return props.application?.favicon || "/img/kx-favicon.svg";
});
</script>
