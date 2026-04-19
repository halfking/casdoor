<template>
  <ResourceEditView v-if="resource" :resource="resource" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import ResourceEditView from "@/views/management/ResourceEditView.vue";
import { resourceConfigs } from "@/utils/resource-configs";

const route = useRoute();
const resource = computed(() => resourceConfigs[String(route.meta.resourceKey || "")]);
</script>
