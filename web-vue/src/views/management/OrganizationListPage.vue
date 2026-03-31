<template>
  <ResourceListView :resource="resourceConfigs.organizations" />
</template>

<script setup lang="ts">
import ResourceListView from "@/views/management/ResourceListView.vue";
import { resourceConfigs } from "@/utils/resource-configs";
</script>
