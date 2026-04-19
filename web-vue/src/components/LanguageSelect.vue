<template>
  <a-select
    v-model:value="selected"
    :placeholder="t('general:Select a language')"
    style="width: 120px"
    size="small"
    @change="handleChange"
  >
    <a-select-option v-for="lang in languages" :key="lang.key" :value="lang.key">
      {{ lang.label }}
    </a-select-option>
  </a-select>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { DefaultLanguage } from "@/Conf";
import { setLanguage } from "@/i18n/index";

const { t } = useI18n();

const languages = [
  { key: "en", label: "English" },
  { key: "zh", label: "中文" },
  { key: "es", label: "Español" },
  { key: "fr", label: "Français" },
  { key: "de", label: "Deutsch" },
  { key: "ja", label: "日本語" },
  { key: "ko", label: "한국어" },
  { key: "ru", label: "Русский" },
];

const selected = ref(localStorage.getItem("language") || DefaultLanguage);

async function handleChange(val: string) {
  await setLanguage(val);
}

onMounted(() => {
  selected.value = localStorage.getItem("language") || DefaultLanguage;
});
</script>
