import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as Conf from "../Conf";
import type { CasdoorThemeData } from "../styles/antd-theme";

export const useAppStore = defineStore("app", () => {
  const serverUrl = ref("");
  const themeData = ref<CasdoorThemeData>({ ...Conf.ThemeDefault });
  const SHARED_THEME_MAP: Record<string, "light" | "dark"> = {
    daylight: "light",
    light: "light",
    night: "dark",
    dark: "dark",
  };

  // Theme algorithm names: ["default"] or ["dark"] or ["default","compact"] etc.
  const themeAlgorithm = ref<string[]>(getStoredThemeAlgorithm());
  const language = ref(localStorage.getItem("language") ?? Conf.DefaultLanguage);

  const isDark = computed(() => themeAlgorithm.value.includes("dark"));

  function syncDocumentTheme(isDarkTheme: boolean) {
    document.documentElement.setAttribute("data-theme", isDarkTheme ? "night" : "daylight");
    document.documentElement.style.colorScheme = isDarkTheme ? "dark" : "light";
  }

  function getStoredThemeAlgorithm(): string[] {
    try {
      const stored = localStorage.getItem("themeAlgorithm");
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return ["default"];
  }

  function setThemeAlgorithm(algorithms: string[]) {
    themeAlgorithm.value = algorithms;
    localStorage.setItem("themeAlgorithm", JSON.stringify(algorithms));

    const isDarkTheme = algorithms.includes("dark");
    syncDocumentTheme(isDarkTheme);

    // Cross-app sync
    localStorage.setItem("kx-ui-theme", isDarkTheme ? "night" : "daylight");
  }

  function syncKxTheme() {
    try {
      const kxTheme = localStorage.getItem("kx-ui-theme");
      const normalizedTheme = SHARED_THEME_MAP[kxTheme ?? ""];
      if (normalizedTheme === "dark" && !themeAlgorithm.value.includes("dark")) {
        const next = [...themeAlgorithm.value.filter((a) => a !== "default"), "dark"];
        setThemeAlgorithm(next);
      } else if (normalizedTheme === "light" && themeAlgorithm.value.includes("dark")) {
        const next = themeAlgorithm.value.filter((a) => a !== "dark");
        if (!next.includes("default")) next.push("default");
        setThemeAlgorithm(next);
      }
    } catch {
      // ignore
    }
  }

  function setLanguage(lang: string) {
    language.value = lang;
    localStorage.setItem("language", lang);
  }

  function setThemeData(data: CasdoorThemeData) {
    themeData.value = data;
  }

  syncDocumentTheme(themeAlgorithm.value.includes("dark"));

  return {
    serverUrl,
    themeData,
    themeAlgorithm,
    language,
    isDark,
    setThemeAlgorithm,
    syncKxTheme,
    setLanguage,
    setThemeData,
  };
});
