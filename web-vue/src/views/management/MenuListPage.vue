<template>
  <ResourceListView :resource="resourceConfigs.menus" />
</template>

<script setup lang="ts">
import { resourceConfigs } from "@/utils/resource-configs";
import ResourceListView from "./ResourceListView.vue";
</script>
