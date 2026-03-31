<template>
  <a-modal
    :open="open"
    :title="title"
    :confirm-loading="submitting"
    :footer="null"
    width="720px"
    @cancel="emit('cancel')"
  >
    <a-form
      ref="formRef"
      :model="localEntity"
      layout="vertical"
      style="margin-top: 8px"
      @finish="emit('submit', localEntity)"
    >
      <a-row :gutter="16">
        <template v-for="field in fields" :key="field.key">
          <a-col :span="12">
            <a-form-item
              :label="field.label"
              :name="field.key"
              :rules="field.required ? [{ required: true, message: `${field.label} is required` }] : []"
            >
              <template v-if="field.type === 'text'">
                <a-input
                  v-model:value="(localEntity as Record<string, unknown>)[field.key] as string"
                  :disabled="resolveDisabled(field)"
                  :placeholder="field.placeholder"
                />
              </template>

              <template v-else-if="field.type === 'number'">
                <a-input-number
                  v-model:value="(localEntity as Record<string, unknown>)[field.key] as number"
                  :disabled="resolveDisabled(field)"
                  style="width: 100%"
                />
              </template>

              <template v-else-if="field.type === 'switch'">
                <a-switch
                  v-model:checked="(localEntity as Record<string, unknown>)[field.key] as boolean"
                  :disabled="resolveDisabled(field)"
                />
              </template>

              <template v-else-if="field.type === 'select'">
                <a-select
                  v-model:value="(localEntity as Record<string, unknown>)[field.key]"
                  :options="field.options"
                  :disabled="resolveDisabled(field)"
                  :placeholder="field.placeholder"
                  style="width: 100%"
                />
              </template>

              <template v-else-if="field.type === 'multiselect'">
                <a-select
                  v-model:value="(localEntity as Record<string, unknown>)[field.key]"
                  :options="field.options"
                  :disabled="resolveDisabled(field)"
                  mode="multiple"
                  style="width: 100%"
                />
              </template>

              <template v-else-if="field.type === 'textarea'">
                <a-textarea
                  v-model:value="(localEntity as Record<string, unknown>)[field.key] as string"
                  :disabled="resolveDisabled(field)"
                  :rows="3"
                />
              </template>

              <template v-else-if="field.type === 'tags'">
                <a-select
                  v-model:value="(localEntity as Record<string, unknown>)[field.key]"
                  mode="tags"
                  :disabled="resolveDisabled(field)"
                  style="width: 100%"
                />
              </template>
            </a-form-item>
          </a-col>
        </template>
      </a-row>

      <a-form-item style="margin-bottom: 0; text-align: right">
        <a-space>
          <a-button @click="emit('cancel')">Cancel</a-button>
          <a-button type="primary" html-type="submit" :loading="submitting">Submit</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { deepClone } from "@/utils/management";
import type { ResourceField } from "@/types/management";

type Entity = Record<string, unknown>;

const props = defineProps<{
  open: boolean;
  title: string;
  entity: Entity | null;
  fields: ResourceField[];
  loading?: boolean;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "cancel"): void;
  (e: "change", entity: Entity): void;
  (e: "submit", entity: Entity): void;
}>();

const localEntity = ref<Entity>({});

function resolveDisabled(field: ResourceField): boolean {
  if (typeof field.disabled === "function") {
    return field.disabled(localEntity.value);
  }
  return !!field.disabled;
}

watch(
  () => props.entity,
  (val) => {
    if (val) {
      localEntity.value = deepClone(val);
    } else {
      localEntity.value = {};
    }
  },
  { immediate: true, deep: true },
);

watch(
  localEntity,
  (val) => {
    emit("change", val);
  },
  { deep: true },
);
</script>
