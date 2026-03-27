import { createI18n } from "vue-i18n";

const messages = {
  en: {},
  zh: {},
};

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem("language") || "en",
  fallbackLocale: "en",
  globalInjection: true,
  messages,
  missing: (_locale, key) => key.split(":").pop() || key,
});

export default i18n;
