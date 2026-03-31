<template>
  <a-input-search
    :value="modelValue"
    :placeholder="placeholder || 'Search...'"
    :loading="loading"
    allow-clear
    style="width: 280px"
    @update:value="(v: string) => emit('update:modelValue', v)"
    @search="(v: string) => emit('search', v)"
  />
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "search", value: string): void;
}>();
</script>
