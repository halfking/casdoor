<template>
  <ResourceEditView :resource="resourceConfigs.groups" />
</template>

<script setup lang="ts">
import ResourceEditView from "@/views/management/ResourceEditView.vue";
import { resourceConfigs } from "@/utils/resource-configs";
</script>
