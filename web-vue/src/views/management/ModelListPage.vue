<template>
  <ResourceListView :resource="resourceConfigs.models" />
</template>

<script setup lang="ts">
import ResourceListView from "@/views/management/ResourceListView.vue";
import { resourceConfigs } from "@/utils/resource-configs";
</script>
