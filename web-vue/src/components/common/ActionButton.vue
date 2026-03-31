<template>
  <a-space>
    <a-button
      v-if="!hideEdit"
      type="primary"
      size="small"
      :disabled="disableEdit"
      @click="emit('edit')"
    >
      Edit
    </a-button>
    <a-button
      v-if="!hideDelete"
      danger
      size="small"
      :disabled="disableDelete"
      @click="emit('delete')"
    >
      Delete
    </a-button>
  </a-space>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    disableEdit?: boolean;
    disableDelete?: boolean;
    hideEdit?: boolean;
    hideDelete?: boolean;
  }>(),
  {
    disableEdit: false,
    disableDelete: false,
    hideEdit: false,
    hideDelete: false,
  },
);

const emit = defineEmits<{
  (e: "edit"): void;
  (e: "delete"): void;
}>();
</script>
