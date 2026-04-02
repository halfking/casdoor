<template>
  <a-config-provider :theme="themeConfig" :locale="antdLocale">
    <component :is="layoutComponent">
      <router-view />
    </component>
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, type Component } from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "@/stores/app";
import { buildThemeConfigWithAlgorithms } from "@/styles/antd-theme";
import ManagementLayout from "@/layouts/ManagementLayout.vue";
import EntryLayout from "@/layouts/EntryLayout.vue";

// Ant Design Vue locales
import enUS from "ant-design-vue/es/locale/en_US";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import esES from "ant-design-vue/es/locale/es_ES";
import frFR from "ant-design-vue/es/locale/fr_FR";
import deDE from "ant-design-vue/es/locale/de_DE";
import jaJP from "ant-design-vue/es/locale/ja_JP";
import koKR from "ant-design-vue/es/locale/ko_KR";
import ruRU from "ant-design-vue/es/locale/ru_RU";
import viVN from "ant-design-vue/es/locale/vi_VN";
import ptBR from "ant-design-vue/es/locale/pt_BR";
import trTR from "ant-design-vue/es/locale/tr_TR";
import plPL from "ant-design-vue/es/locale/pl_PL";
import ukUA from "ant-design-vue/es/locale/uk_UA";
import type { Locale } from "ant-design-vue/es/locale";

const antdLocaleMap: Record<string, Locale> = {
  en: enUS,
  zh: zhCN,
  es: esES,
  fr: frFR,
  de: deDE,
  ja: jaJP,
  ko: koKR,
  ru: ruRU,
  vi: viVN,
  pt: ptBR,
  tr: trTR,
  pl: plPL,
  uk: ukUA,
};

const appStore = useAppStore();
const route = useRoute();

const themeConfig = computed(() => {
  return buildThemeConfigWithAlgorithms(appStore.themeData, appStore.themeAlgorithm);
});
const antdLocale = computed(() => antdLocaleMap[appStore.language] ?? enUS);

const layoutComponent = computed<Component>(() => {
  return route.meta.layout === "entry" ? EntryLayout : ManagementLayout;
});

// Cross-app theme sync listener
let kxThemeHandler: ((e: StorageEvent) => void) | null = null;

onMounted(() => {
  appStore.syncKxTheme();

  kxThemeHandler = (e: StorageEvent) => {
    if (e.key === "kx-ui-theme" || e.key === "kx-ui-theme-sync") {
      appStore.syncKxTheme();
    }
  };
  window.addEventListener("storage", kxThemeHandler);
});

onUnmounted(() => {
  if (kxThemeHandler) {
    window.removeEventListener("storage", kxThemeHandler);
  }
});
</script>
