<template>
  <ResourceEditView :resource="resourceConfigs.posts" />
</template>

<script setup lang="ts">
import { resourceConfigs } from "@/utils/resource-configs";
import ResourceEditView from "./ResourceEditView.vue";
</script>
