<template>
  <ResourceEditView :resource="resourceConfigs.permissionRules" />
</template>

<script setup lang="ts">
import { resourceConfigs } from "@/utils/resource-configs";
import ResourceEditView from "./ResourceEditView.vue";
</script>
