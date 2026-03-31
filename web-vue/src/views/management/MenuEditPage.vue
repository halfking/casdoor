<template>
  <ResourceEditView :resource="resourceConfigs.menus" />
</template>

<script setup lang="ts">
import { resourceConfigs } from "@/utils/resource-configs";
import ResourceEditView from "./ResourceEditView.vue";
</script>
