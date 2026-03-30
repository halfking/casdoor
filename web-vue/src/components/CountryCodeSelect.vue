<template>
  <a-select
    v-model:value="selected"
    show-search
    :placeholder="t('general:Please select a country code')"
    :filter-option="filterOption"
    :style="{ width: width + 'px' }"
    @change="$emit('update:modelValue', $event)"
  >
    <a-select-option v-for="item in countryCodes" :key="item.code" :value="item.code">
      {{ item.code }} ({{ item.name }})
    </a-select-option>
  </a-select>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getCountryCodeData } from "@/utils/Setting";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    width?: number;
  }>(),
  { modelValue: "+1", width: 90 }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const { t } = useI18n();
const selected = ref(props.modelValue);
const countryCodes = ref(getCountryCodeData() ?? []);

watch(
  () => props.modelValue,
  (val) => {
    selected.value = val;
  }
);

function filterOption(input: string, option: any) {
  const item = countryCodes.value.find((c: any) => c.code === option.value);
  if (!item) return false;
  return (
    item.code.toLowerCase().includes(input.toLowerCase()) ||
    item.name.toLowerCase().includes(input.toLowerCase())
  );
}
</script>
