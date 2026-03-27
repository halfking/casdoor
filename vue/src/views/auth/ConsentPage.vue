<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h2>{{ t('Authorize Application') }}</h2>
          <p class="prompt-subtitle">{{ applicationName }} {{ t('wants to access your account') }}</p>
        </div>

        <div class="scope-list">
          <h4>{{ t('This application will be able to') }}:</h4>
          <ul>
            <li v-for="scope in scopes" :key="scope">{{ scope }}</li>
          </ul>
        </div>

        <div class="consent-actions">
          <a-button size="large" @click="handleDeny">{{ t('Deny') }}</a-button>
          <a-button type="primary" size="large" :loading="loading" @click="handleAllow">
            {{ t('Allow') }}
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'

const { t } = useI18n()
const route = useRoute()

const loading = ref(false)
const applicationName = (route.params.applicationName as string) || ''
const scopes = ref<string[]>([
  'Read your profile information',
  'Read your email address',
  'Read your organization membership',
])

function getRedirectUri(): string {
  const params = new URLSearchParams(window.location.search)
  const state = params.get('state')
  if (state) {
    try {
      const decoded = JSON.parse(atob(state))
      return decoded.redirect_uri || decoded.redirect_url || ''
    } catch { /* ignore */ }
  }
  return ''
}

async function handleAllow() {
  loading.value = true
  try {
    const res = await fetch('/api/grant-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application: applicationName,
        code: new URLSearchParams(window.location.search).get('code'),
      }),
    }).then(r => r.json())

    if (res.status === 'ok') {
      // Redirect back to the application
      const redirectUri = getRedirectUri()
      if (redirectUri) {
        window.location.href = redirectUri
      } else {
        window.location.href = '/'
      }
    } else {
      message.error(res.msg || t('Failed to grant consent'))
    }
  } catch (e: any) {
    message.error(e.message)
  } finally {
    loading.value = false
  }
}

function handleDeny() {
  const redirectUri = getRedirectUri()
  if (redirectUri) {
    const sep = redirectUri.includes('?') ? '&' : '?'
    window.location.href = `${redirectUri}${sep}error=access_denied&error_description=User denied consent`
  } else {
    window.location.href = '/'
  }
}

onMounted(() => {
  // Load scopes from application config if available
  const params = new URLSearchParams(window.location.search)
  const scopeStr = params.get('scope')
  if (scopeStr) {
    scopes.value = scopeStr.split(' ')
  }
})
</script>

<style scoped lang="less">
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-container { width: 480px; max-width: 90vw; }
.login-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px 32px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.login-header {
  text-align: center; margin-bottom: 24px;
  h2 { margin: 0 0 4px 0; font-size: 24px; }
  .prompt-subtitle { color: #666; margin: 0; }
}
.scope-list {
  margin-bottom: 24px;
  h4 { margin-bottom: 12px; }
  ul { padding-left: 20px; color: #555; }
  li { margin-bottom: 4px; }
}
.consent-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
