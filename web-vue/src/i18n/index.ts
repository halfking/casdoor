import { createI18n } from "vue-i18n";
import * as Conf from "../Conf";
import en from "../../../web-old/src/locales/en/data.json";

// Flatten one level: { account: { k: v }, ... } → { "account:k": v, "account.k": v, ... }
// Registers both ":" (i18next convention) and "." separators for compatibility.
function flattenNamespaces(data: Record<string, Record<string, string>>): Record<string, string> {
  const flat: Record<string, string> = {};
  for (const ns of Object.keys(data)) {
    const entries = data[ns];
    if (typeof entries === "object" && entries !== null) {
      for (const key of Object.keys(entries)) {
        flat[`${ns}:${key}`] = entries[key];
        flat[`${ns}.${key}`] = entries[key];
      }
    }
  }
  return flat;
}

function initLanguage(): string {
  let language = localStorage.getItem("language");
  if (language) return language;

  if (Conf.ForceLanguage !== "") return Conf.ForceLanguage;

  const userLang = navigator.language;
  const map: Record<string, string> = {
    "en": "en", "en-US": "en",
    "zh-CN": "zh", "zh": "zh",
    "es": "es", "fr": "fr", "de": "de", "id": "id",
    "ja": "ja", "ko": "ko", "ru": "ru", "vi": "vi",
    "pt": "pt", "it": "it", "ms": "ms", "tr": "tr",
    "ar": "ar", "he": "he", "nl": "nl", "pl": "pl",
    "fi": "fi", "sv": "sv", "uk": "uk", "kk": "kk",
    "fa": "fa", "cs": "cs", "cs-CZ": "cs",
    "sk": "sk", "sk-SK": "sk", "az": "az",
  };
  return map[userLang] ?? Conf.DefaultLanguage;
}

const i18n = createI18n<false>({
  legacy: false,
  locale: initLanguage(),
  fallbackLocale: "en",
  messages: {
    en: flattenNamespaces(en as Record<string, Record<string, string>>),
  },
  missing: (_locale, key) => {
    // silent missing in production
    if (import.meta.env.DEV) {
      console.warn(`[i18n] missing: ${key}`);
    }
    // Strip namespace prefix (e.g. "login:Back" → "Back", "signup.Username" → "Username") like i18next does
    const idx = key.indexOf(":") >= 0 ? key.indexOf(":") : key.indexOf(".");
    return idx >= 0 ? key.slice(idx + 1) : key;
  },
});

// Lazy-load locale on demand
const loadedLocales = new Set<string>(["en"]);

export async function loadLocale(lang: string) {
  if (loadedLocales.has(lang)) return;
  try {
    const data = await import(`../../../web-old/src/locales/${lang}/data.json`);
    const messages = flattenNamespaces(data.default ?? data);
    i18n.global.setLocaleMessage(lang, messages);
    loadedLocales.add(lang);
  } catch (err) {
    console.error(`[i18n] failed to load locale "${lang}":`, err);
  }
}

export async function setLanguage(lang: string) {
  await loadLocale(lang);
  i18n.global.locale.value = lang;
  localStorage.setItem("language", lang);
  document.documentElement.setAttribute("lang", lang);
}

export default i18n;
