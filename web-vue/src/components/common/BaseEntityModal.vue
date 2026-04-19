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
              :name="field.key"
              :label="field.label"
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

              <template v-else-if="field.type === 'password'">
                <a-input-password
                  v-model:value="(localEntity as Record<string, unknown>)[field.key] as string"
                  :disabled="resolveDisabled(field)"
                  :placeholder="field.placeholder"
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

              <template v-else-if="field.type === 'image'">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <a-input
                      v-model:value="(localEntity as Record<string, unknown>)[field.key] as string"
                      :disabled="resolveDisabled(field)"
                      :placeholder="field.placeholder || 'Image URL or upload'"
                      style="flex: 1"
                    />
                    <a-button :disabled="resolveDisabled(field)" @click="triggerUpload(field.key)">
                      Upload
                    </a-button>
                  </div>
                  <input
                    ref="fileInputs"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="(e: Event) => handleImageUpload(e, field.key)"
                  />
                  <div v-if="(localEntity as Record<string, unknown>)[field.key]" style="margin-top: 4px;">
                    <a-image
                      :src="(localEntity as Record<string, unknown>)[field.key] as string"
                      :height="80"
                      :fallback="'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNDAiIHk9IjQwIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZmlsbD0iIzk5OSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'"
                    />
                  </div>
                </div>
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
import { nextTick, ref, watch } from "vue";
import type { FormInstance } from "ant-design-vue";
import { message } from "ant-design-vue";
import { deepClone } from "@/utils/management";
import type { ResourceField } from "@/types/management";
import { uploadResource } from "@/api/modules/resource";

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

const formRef = ref<FormInstance>();
const localEntity = ref<Entity>({});
const syncingFromProps = ref(false);

function resolveDisabled(field: ResourceField): boolean {
  if (typeof field.disabled === "function") {
    return field.disabled(localEntity.value);
  }
  return !!field.disabled;
}

const uploadingKey = ref<string | null>(null);
const fileInputs = ref<HTMLInputElement[] | null>(null);
let activeUploadKey = "";

function triggerUpload(fieldKey: string) {
  activeUploadKey = fieldKey;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e: Event) => handleImageUpload(e, fieldKey);
  input.click();
}

async function handleImageUpload(e: Event, fieldKey: string) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  uploadingKey.value = fieldKey;
  try {
    const owner = String(localEntity.value.owner || "admin");
    const user = String(localEntity.value._accountName || "admin");
    const appName = String(localEntity.value.name || "unknown");
    const ext = file.name.split(".").pop() || "png";
    const fullPath = `logo/${owner}/${appName}.${ext}`;

    const resp = await uploadResource(owner, user, "logo", "ApplicationEdit", fullPath, file);
    if (resp.status === "ok" && resp.data) {
      localEntity.value[fieldKey] = resp.data;
      message.success("Image uploaded successfully");
    } else {
      message.error(resp.msg || "Upload failed");
    }
  } catch {
    message.error("Upload failed");
  } finally {
    uploadingKey.value = null;
  }
}

watch(
  () => props.entity,
  (val) => {
    syncingFromProps.value = true;
    if (val) {
      localEntity.value = deepClone(val);
    } else {
      localEntity.value = {};
    }
    void nextTick(() => {
      (formRef.value as unknown as { setFields?: (v: Array<{ name: string; value: unknown }>) => void } | undefined)
        ?.setFields?.(
          Object.entries(localEntity.value as Record<string, unknown>).map(([key, value]) => ({
            name: key,
            value,
          })),
        );
      syncingFromProps.value = false;
    });
  },
  { immediate: true, deep: true },
);

// Keep this modal purely controlled by props.entity to avoid
// accidentally overriding freshly loaded server data.
</script>
