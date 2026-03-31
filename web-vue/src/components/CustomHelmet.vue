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
  if (!app) return "Casdoor";
  return app.displayName || app.name || "Casdoor";
});

const favicon = computed(() => {
  return props.application?.favicon || "";
});
</script>
