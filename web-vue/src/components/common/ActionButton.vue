<template>
  <a-space>
    <a-button
      type="primary"
      size="small"
      :disabled="disableEdit"
      @click="emit('edit')"
    >
      Edit
    </a-button>
    <a-button
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
  }>(),
  {
    disableEdit: false,
    disableDelete: false,
  },
);

const emit = defineEmits<{
  (e: "edit"): void;
  (e: "delete"): void;
}>();
</script>
