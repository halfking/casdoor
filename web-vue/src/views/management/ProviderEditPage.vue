<template>
  <ResourceEditView :resource="resourceConfigs.providers" />
</template>

<script setup lang="ts">
import ResourceEditView from "@/views/management/ResourceEditView.vue";
import { resourceConfigs } from "@/utils/resource-configs";
</script>
