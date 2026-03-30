<template>
  <div style="padding: 48px; text-align: center; color: var(--kx-text-3)">
    <h2>{{ route.path }}</h2>
    <p>Management page placeholder — to be implemented</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
const route = useRoute();
</script>
