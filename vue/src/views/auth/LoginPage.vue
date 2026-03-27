<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <img src="/img/kaixuan-platform-logo-light.svg" alt="Logo" class="login-logo" />
          <h2>{{ t('Sign In') }}</h2>
        </div>

        <a-form
          :model="formState"
          :rules="rules"
          @finish="handleLogin"
          layout="vertical"
          size="large"
        >
          <!-- Organization selector -->
          <a-form-item v-if="orgChoiceMode === 'select'" :label="t('Organization')" name="organization">
            <a-select
              v-model:value="formState.organization"
              :placeholder="t('Please select organization')"
              @change="loadApplication"
            >
              <a-select-option v-for="org in organizations" :key="org.name" :value="org.name">
                {{ org.displayName || org.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <!-- Username -->
          <a-form-item :label="t('Username')" name="username">
            <a-input
              v-model:value="formState.username"
              :placeholder="t('Please input your username')"
              @pressEnter="$refs.formRef?.submit()"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </a-form-item>

          <!-- Password -->
          <a-form-item :label="t('Password')" name="password">
            <a-input-password
              v-model:value="formState.password"
              :placeholder="t('Please input your password')"
              @pressEnter="$refs.formRef?.submit()"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </a-form-item>

          <!-- Remember + Forgot -->
          <a-form-item>
            <div class="login-actions">
              <a-checkbox v-model:checked="formState.remember">{{ t('Remember me') }}</a-checkbox>
              <a v-if="enablePassword" @click="goToForget">{{ t('Forgot password?') }}</a>
            </div>
          </a-form-item>

          <!-- Submit -->
          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              :loading="loading"
              block
              size="large"
            >
              {{ t('Sign In') }}
            </a-button>
          </a-form-item>
        </a-form>

        <!-- Sign up link -->
        <div v-if="enableSignUp" class="login-footer">
          <span>{{ t("Don't have an account?") }}</span>
          <a @click="goToSignup">{{ t('Sign Up now') }}</a>
        </div>

        <!-- Third-party providers -->
        <div v-if="visibleProviders.length > 0" class="login-providers">
          <a-divider>{{ t('Or sign in with') }}</a-divider>
          <div class="provider-buttons">
            <a-button
              v-for="provider in visibleProviders"
              :key="provider.name"
              class="provider-btn"
              @click="handleProviderLogin(provider)"
            >
              <img v-if="provider.icon" :src="provider.icon" class="provider-icon" />
              <span v-else>{{ provider.displayName || provider.name }}</span>
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { getFromLink, goToLink } from '@/utils/auth-util'
import { saveCodeVerifier, generateCodeVerifier, generateCodeChallenge } from '@/utils/provider'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const formRef = ref()
const application = ref<any>(null)
const organizations = ref<any[]>([])
const providers = ref<any[]>([])
const visibleProviders = computed(() => providers.value.filter(p => p.canSignUp !== false && p.canSignIn !== false))

const formState = reactive({
  organization: '',
  username: '',
  password: '',
  remember: false,
})

const rules = {
  organization: [{ required: true, message: () => t('Please select organization') }],
  username: [{ required: true, message: () => t('Please input your username') }],
  password: [{ required: true, message: () => t('Please input your password') }],
}

const orgChoiceMode = computed(() => application.value?.orgChoiceMode || 'none')
const enablePassword = computed(() => application.value?.enablePassword !== false)
const enableSignUp = computed(() => application.value?.enableSignUp !== false)

async function loadApplication() {
  try {
    const appName = application.value?.name || 'app-casdoor'
    const orgName = formState.organization || 'built-in'
    const res = await fetch(`/api/get-application?applicationName=${encodeURIComponent(appName)}&organizationName=${encodeURIComponent(orgName)}`)
    const data = await res.json()
    if (data.status === 'ok') {
      application.value = data.data
      // Load providers for this application
      const providersRes = await fetch(`/api/get-providers?application=${encodeURIComponent(appName)}`)
      const providersData = await providersRes.json()
      if (providersData.status === 'ok') {
        providers.value = providersData.data || []
      }
    }
  } catch (e) {
    console.error('Failed to load application:', e)
  }
}

function getApplication() {
  const name = route.query.application || 'app-casdoor'
  return String(name)
}

function getDefaultOrg() {
  const lastOrg = localStorage.getItem('lastLoginOrg')
  return lastOrg || 'built-in'
}

async function handleLogin() {
  loading.value = true
  try {
    const body = {
      application: getApplication(),
      organization: formState.organization || getDefaultOrg(),
      username: formState.username,
      password: formState.password,
      autoSignin: formState.remember ? 7 : 0,
    }

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(r => r.json())

    if (res.status === 'ok') {
      // MFA required
      if (res.data2 === 'mfa' || res.msg === 'RequiredMfa') {
        router.push(`/prompt/${getApplication()}`)
        return
      }

      // Password reset required
      if (res.data3) {
        router.push(`/forget/${getApplication()}`)
        return
      }

      if (formState.remember) {
        localStorage.setItem('lastLoginOrg', formState.organization || getDefaultOrg())
      }

      message.success(t('Logged in successfully'))
      goToLink(getFromLink())
    } else {
      message.error(res.msg || t('Login failed'))
    }
  } catch (e: any) {
    message.error(e.message || t('Login failed'))
  } finally {
    loading.value = false
  }
}

async function handleProviderLogin(provider: any) {
  try {
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    const state = `${getApplication()}|${provider.name}|${Date.now()}`

    saveCodeVerifier(state, codeVerifier)

    const params = new URLSearchParams({
      client_id: getApplication(),
      response_type: 'code',
      redirect_uri: `${window.location.origin}/callback`,
      scope: 'profile',
      state: btoa(JSON.stringify({
        application: getApplication(),
        provider: provider.name,
        method: 'signup',
        redirect_uri: `${window.location.origin}/callback`,
      })),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    // Redirect to provider's authorization endpoint
    const authUrl = `/api/get-authorize-url?providerName=${encodeURIComponent(provider.name)}&applicationName=${encodeURIComponent(getApplication())}`
    const authRes = await fetch(authUrl)
    const authData = await authRes.json()
    if (authData.status === 'ok' && authData.data) {
      const sep = authData.data.includes('?') ? '&' : '?'
      window.location.href = `${authData.data}${sep}${params.toString()}`
    } else {
      message.error(t('Failed to get authorization URL'))
    }
  } catch (e: any) {
    message.error(e.message || t('Failed to initiate login'))
  }
}

function goToForget() {
  router.push(`/forget/${getApplication()}`)
}

function goToSignup() {
  router.push(`/signup`)
}

onMounted(async () => {
  formState.organization = getDefaultOrg()

  // Load organizations
  try {
    const res = await fetch('/api/get-organizations')
    const data = await res.json()
    if (data.status === 'ok') {
      organizations.value = data.data || []
    }
  } catch { /* ignore */ }

  await loadApplication()
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

.login-container {
  width: 420px;
  max-width: 90vw;
}

.login-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .login-logo {
    height: 48px;
    margin-bottom: 12px;
  }

  h2 {
    margin: 0;
    font-size: 24px;
    color: #1a1a2e;
  }
}

.login-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-footer {
  text-align: center;
  color: #666;

  a {
    color: #667eea;
    margin-left: 4px;
    cursor: pointer;
  }
}

.login-providers {
  margin-top: 16px;

  .provider-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
  }

  .provider-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    height: 48px;
    border-radius: 8px;
    border: 1px solid #e8e8e8;

    .provider-icon {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
