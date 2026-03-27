<template>
  <a-modal
    :open="open"
    :title="$t(title)"
    :confirm-loading="submitting"
    width="820px"
    destroy-on-close
    @cancel="$emit('cancel')"
    @ok="handleSubmit"
  >
    <a-spin :spinning="loading">
      <a-form
        ref="formRef"
        :model="formModel"
        layout="vertical"
      >
        <template v-for="field in fields" :key="field.key">
          <a-form-item
            :name="field.key"
            :label="$t(field.label)"
            :rules="field.required ? [{ required: true, message: $t('general:Please fill in this field') }] : []"
            :extra="field.help ? $t(field.help) : undefined"
          >
            <a-input
              v-if="field.type === 'text'"
              v-model:value="formModel[field.key]"
              :placeholder="field.placeholder ? $t(field.placeholder) : undefined"
              :disabled="isDisabled(field)"
            />

            <a-textarea
              v-else-if="field.type === 'textarea'"
              v-model:value="formModel[field.key]"
              :rows="field.rows || 4"
              :disabled="isDisabled(field)"
            />

            <a-input-number
              v-else-if="field.type === 'number'"
              v-model:value="formModel[field.key]"
              :min="field.min || 0"
              style="width: 100%"
              :disabled="isDisabled(field)"
            />

            <a-switch
              v-else-if="field.type === 'switch'"
              v-model:checked="formModel[field.key]"
              :disabled="isDisabled(field)"
            />

            <a-select
              v-else-if="field.type === 'select'"
              v-model:value="formModel[field.key]"
              :options="field.options || []"
              :disabled="isDisabled(field)"
              show-search
            />

            <a-select
              v-else-if="field.type === 'multiselect'"
              v-model:value="formModel[field.key]"
              mode="multiple"
              :options="field.options || []"
              :disabled="isDisabled(field)"
              show-search
            />

            <a-select
              v-else-if="field.type === 'tags'"
              v-model:value="formModel[field.key]"
              mode="tags"
              :options="field.options || []"
              :disabled="isDisabled(field)"
            />
          </a-form-item>
        </template>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { deepClone } from "@/utils/management";
import type { ResourceField } from "@/types/management";

const props = defineProps<{
  open: boolean;
  title: string;
  entity: Record<string, unknown> | null;
  fields: ResourceField[];
  loading: boolean;
  submitting: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  change: [entity: Record<string, unknown>];
  submit: [entity: Record<string, unknown>];
}>();

const formRef = ref();
const formModel = ref<Record<string, unknown>>({});

watch(
  () => props.entity,
  (value) => {
    formModel.value = deepClone(value || {});
  },
  { deep: true, immediate: true },
);

watch(
  formModel,
  (value) => {
    emit("change", deepClone(value));
  },
  { deep: true },
);

function isDisabled(field: ResourceField) {
  if (typeof field.disabled === "function") {
    return field.disabled(formModel.value);
  }

  return Boolean(field.disabled);
}

async function handleSubmit() {
  await formRef.value?.validate();
  emit("submit", deepClone(formModel.value));
}
</script>
