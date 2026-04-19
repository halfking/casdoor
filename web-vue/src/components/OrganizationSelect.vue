<template>
  <div>
    <!-- Organization select / input stub -->
    <a-select
      v-if="mode === 'Select'"
      v-model:value="selected"
      :placeholder="t('general:Please select an organization')"
      style="width: 100%"
      @change="handleChange"
    >
      <a-select-option v-for="org in organizations" :key="org.name" :value="org.name">
        {{ org.displayName || org.name }}
      </a-select-option>
    </a-select>
    <a-input
      v-else
      v-model:value="inputValue"
      :placeholder="t('general:Please input your organization')"
      @change="handleInputChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { getOrganizations } from "@/api/modules/organization";
import type { Organization } from "@/api/types";

const props = withDefaults(
  defineProps<{
    mode?: string;
    initValue?: string;
  }>(),
  { mode: "Select", initValue: "" }
);

const emit = defineEmits<{
  (e: "change", value: string): void;
}>();

const { t } = useI18n();
const organizations = ref<Organization[]>([]);
const selected = ref(props.initValue || "");
const inputValue = ref(props.initValue || "");

onMounted(async () => {
  if (props.mode === "Select") {
    try {
      const res = await getOrganizations({ owner: "admin" } as any);
      if (res?.status === "ok" && Array.isArray(res.data)) {
        organizations.value = res.data;
      }
    } catch {
      // silent
    }
  }
});

function handleChange(val: string) {
  emit("change", val);
}

function handleInputChange() {
  emit("change", inputValue.value);
}
</script>
