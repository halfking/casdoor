<template>
  <a-space>
    <a-button type="link" :disabled="disableEdit" @click="$emit('edit')">
      {{ $t("general:Edit") }}
    </a-button>
    <a-button type="link" danger :disabled="disableDelete" @click="$emit('delete')">
      {{ $t("general:Delete") }}
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

defineEmits<{
  edit: [];
  delete: [];
}>();
</script>
