<template>
  <a-select
    :virtual="false"
    show-search
    option-filter-prop="label"
    style="width: 100%"
    :value="currentValue"
    placeholder="Please select country/region"
    :filter-option="filterOption"
    @change="(val: string) => emit('change', val)"
  >
    <a-select-option
      v-for="item in regions"
      :key="item.code"
      :value="item.code"
      :label="`${item.name} (${item.code})`"
    >
      <img
        :src="`${StaticBaseUrl}/flag-icons/${item.code}.svg`"
        :alt="item.name"
        :height="20"
        style="margin-right: 10px"
      />
      {{ item.name }} ({{ item.code }})
    </a-select-option>
  </a-select>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { StaticBaseUrl } from '../utils/Setting';

interface RegionItem {
  code: string;
  name: string;
}

const props = defineProps<{
  modelValue?: string;
  defaultValue?: string;
}>();

const emit = defineEmits<{
  (e: 'change', value: string): void;
}>();

const currentValue = computed(() => {
  if (props.modelValue) return props.modelValue;
  if (props.defaultValue) return props.defaultValue;
  return undefined;
});

const regions = ref<RegionItem[]>([]);

function filterOption(input: string, option: any) {
  return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
}

onMounted(async () => {
  // Dynamically load country list from i18n-iso-countries if available
  try {
    const mod = await import('i18n-iso-countries');
    const en = (await import('i18n-iso-countries/langs/en.json')).default;
    mod.registerLocale(en);
    const countries = mod.getNames('en', { select: 'official' });
    regions.value = Object.entries(countries)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    // Fallback: empty list, will be populated when dependency is installed
    regions.value = [];
  }
});
</script>
