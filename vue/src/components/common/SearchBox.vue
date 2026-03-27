<template>
  <a-input-search
    :value="modelValue"
    :placeholder="placeholder || $t('general:Please input your search')"
    :loading="loading"
    allow-clear
    @search="$emit('search', $event)"
    @update:value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder?: string;
  loading?: boolean;
}>();

defineEmits<{
  "update:modelValue": [value: string];
  search: [value: string];
}>();
</script>
