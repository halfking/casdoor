import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false)

  function initTheme() {
    const stored = localStorage.getItem('kx-ui-theme')
    if (stored === 'dark') {
      isDark.value = true
    } else if (stored === 'light') {
      isDark.value = false
    } else {
      isDark.value = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
    }
    applyTheme()
  }

  function toggleTheme() {
    isDark.value = !isDark.value
    applyTheme()
  }

  function applyTheme() {
    const value = isDark.value ? 'dark' : 'light'
    localStorage.setItem('kx-ui-theme', value)
    localStorage.setItem('kx-ui-theme-sync', JSON.stringify({ theme: value, at: Date.now() }))
    document.documentElement.dataset.theme = value
    document.documentElement.style.colorScheme = value
  }

  return { isDark, initTheme, toggleTheme }
})
