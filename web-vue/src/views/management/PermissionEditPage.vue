<template>
  <ResourceEditView :resource="resourceConfigs.permissions" />
</template>

<script setup lang="ts">
import ResourceEditView from "@/views/management/ResourceEditView.vue";
import { resourceConfigs } from "@/utils/resource-configs";
</script>
