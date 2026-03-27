<template>
  <a-config-provider :theme="{ algorithm: isDark ? darkAlgorithm : defaultAlgorithm }">
    <SharedNavbar
      app-name="认证中心"
      :is-authenticated="userStore.isAuthenticated"
      :auth-token="userStore.token"
      @login="handleLogin"
      @logout="userStore.logout()"
    />
    <router-view />
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { theme } from 'ant-design-vue'
import SharedNavbar from '@kx/shared/components/SharedNavbar.vue'
import { useThemeStore } from './stores/theme'
import { useUserStore } from './stores/user'

const themeStore = useThemeStore()
const userStore = useUserStore()

const isDark = computed(() => themeStore.isDark)
const { darkAlgorithm, defaultAlgorithm } = theme

onMounted(() => {
  themeStore.initTheme()
  userStore.initUser()
})

function handleLogin() {
  window.location.href = '/login'
}
</script>
