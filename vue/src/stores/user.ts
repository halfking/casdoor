import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const account = ref<any>(null)
  const accessToken = ref<string | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)
  const token = computed(() => accessToken.value)

  function initUser() {
    // Try to get account from session
    fetchAccount()
  }

  async function fetchAccount() {
    try {
      const res = await fetch('/api/account/get-account')
      const data = await res.json()
      if (data.status === 'ok') {
        account.value = data.data
        account.value.organization = data.data2
      }
    } catch {
      account.value = null
    }
  }

  function logout() {
    accessToken.value = null
    account.value = null
    fetch('/api/logout', { method: 'POST' }).catch(() => {})
    window.location.href = '/login'
  }

  return { account, accessToken, isAuthenticated, token, initUser, fetchAccount, logout }
})
