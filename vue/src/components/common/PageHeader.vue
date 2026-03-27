<template>
  <div class="page-header">
    <div>
      <h2>{{ title }}</h2>
      <div v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</div>
    </div>
    <div class="page-header__actions">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.page-header h2 {
  margin: 0;
}

.page-header__subtitle {
  margin-top: 4px;
  color: rgba(0, 0, 0, 0.45);
}

.page-header__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
