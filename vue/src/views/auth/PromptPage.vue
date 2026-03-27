<template>
  <div class="prompt-page">
    <div class="prompt-container">
      <div class="prompt-card">
        <div class="prompt-header">
          <img src="/img/kaixuan-platform-logo-light.svg" alt="Logo" class="prompt-logo" />
          <h2>{{ t('Verification Required') }}</h2>
          <p class="prompt-subtitle">{{ application?.displayName || applicationName }}</p>
        </div>

        <!-- Password check form -->
        <a-form v-if="mfaStep === 'password'" :model="passwordForm" @finish="verifyPassword" layout="vertical" size="large">
          <a-form-item :label="t('Password')" name="password" :rules="[{ required: true }]">
            <a-input-password v-model:value="passwordForm.password" :placeholder="t('Enter your password to continue')">
              <template #prefix><LockOutlined /></template>
            </a-input-password>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="loading" block>
              {{ t('Verify') }}
            </a-button>
          </a-form-item>
        </a-form>

        <!-- MFA verification form -->
        <div v-else-if="mfaStep === 'mfa'">
          <a-alert
            v-if="mfaMessage"
            :message="mfaMessage"
            type="info"
            show-icon
            style="margin-bottom: 16px;"
          />

          <a-form :model="mfaForm" @finish="verifyMfa" layout="vertical" size="large">
            <!-- MFA method selector -->
            <a-form-item :label="t('Verification Method')">
              <a-select v-model:value="mfaForm.mfaType">
                <a-select-option value="totp">{{ t('Authenticator App') }}</a-select-option>
                <a-select-option value="sms">{{ t('SMS') }}</a-select-option>
                <a-select-option value="email">{{ t('Email') }}</a-select-option>
                <a-select-option value="password">{{ t('Password') }}</a-select-option>
                <a-select-option value="recovery_code">{{ t('Recovery Code') }}</a-select-option>
              </a-select>
            </a-form-item>

            <!-- TOTP -->
            <a-form-item v-if="mfaForm.mfaType === 'totp'" :label="t('Code')" name="code" :rules="[{ required: true }]">
              <a-input v-model:value="mfaForm.code" :placeholder="t('Enter code from authenticator app')" />
            </a-form-item>

            <!-- SMS -->
            <template v-if="mfaForm.mfaType === 'sms'">
              <a-form-item :label="t('Phone')" name="phone">
                <a-input v-model:value="mfaForm.phone" :placeholder="t('Phone number')" disabled />
              </a-form-item>
              <a-form-item :label="t('Verification Code')" name="code" :rules="[{ required: true }]">
                <a-input-search
                  v-model:value="mfaForm.code"
                  :placeholder="t('Enter SMS code')"
                  :enter-button="countdown > 0 ? `${countdown}s` : t('Send Code')"
                  :search-button="true"
                  @search="sendSmsCode"
                  :button-props="{ disabled: countdown > 0 }"
                />
              </a-form-item>
            </template>

            <!-- Email -->
            <template v-if="mfaForm.mfaType === 'email'">
              <a-form-item :label="t('Email')" name="email">
                <a-input v-model:value="mfaForm.email" disabled />
              </a-form-item>
              <a-form-item :label="t('Verification Code')" name="code" :rules="[{ required: true }]">
                <a-input-search
                  v-model:value="mfaForm.code"
                  :placeholder="t('Enter email code')"
                  :enter-button="countdown > 0 ? `${countdown}s` : t('Send Code')"
                  :search-button="true"
                  @search="sendEmailCode"
                  :button-props="{ disabled: countdown > 0 }"
                />
              </a-form-item>
            </template>

            <!-- Password -->
            <a-form-item v-if="mfaForm.mfaType === 'password'" :label="t('Password')" name="password" :rules="[{ required: true }]">
              <a-input-password v-model:value="mfaForm.password" :placeholder="t('Enter your password')">
                <template #prefix><LockOutlined /></template>
              </a-input-password>
            </a-form-item>

            <!-- Recovery Code -->
            <a-form-item v-if="mfaForm.mfaType === 'recovery_code'" :label="t('Recovery Code')" name="code" :rules="[{ required: true }]">
              <a-input v-model:value="mfaForm.code" :placeholder="t('Enter recovery code')" />
            </a-form-item>

            <a-form-item>
              <a-button type="primary" html-type="submit" :loading="loading" block>
                {{ t('Verify') }}
              </a-button>
            </a-form-item>
          </a-form>
        </div>

        <!-- Done -->
        <div v-else-if="mfaStep === 'done'">
          <a-result status="success" :title="t('Verified successfully')" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { LockOutlined } from '@ant-design/icons-vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const mfaStep = ref<'password' | 'mfa' | 'done'>('password')
const mfaMessage = ref('')
const countdown = ref(0)
const application = ref<any>(null)
const applicationName = (route.params.applicationName as string) || 'app-casdoor'

const passwordForm = reactive({ password: '' })
const mfaForm = reactive({
  mfaType: 'totp',
  code: '',
  phone: '',
  email: '',
  password: '',
})

function startCountdown() {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
}

async function verifyPassword() {
  loading.value = true
  try {
    const res = await fetch('/api/check-user-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application: applicationName,
        user: passwordForm.password,
      }),
    }).then(r => r.json())

    if (res.status === 'ok') {
      // Check if MFA is enabled
      if (res.data?.mfaProps?.enabled) {
        mfaStep.value = 'mfa'
        mfaMessage.value = t('Please complete MFA verification')
        mfaForm.phone = res.data.phone || ''
        mfaForm.email = res.data.email || ''
      } else {
        // No MFA, proceed with stored signin URL
        const signinUrl = sessionStorage.getItem('signinUrl')
        if (signinUrl) {
          window.location.href = signinUrl
        } else {
          router.push('/')
        }
      }
    } else {
      message.error(res.msg || t('Verification failed'))
    }
  } catch (e: any) {
    message.error(e.message)
  } finally {
    loading.value = false
  }
}

async function verifyMfa() {
  loading.value = true
  try {
    const body: Record<string, any> = {
      application: applicationName,
      mfaType: mfaForm.mfaType,
    }
    if (['totp', 'sms', 'email', 'recovery_code'].includes(mfaForm.mfaType)) {
      body.code = mfaForm.code
    }
    if (mfaForm.mfaType === 'password') {
      body.password = mfaForm.password
    }

    const res = await fetch('/api/verify-mfa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(r => r.json())

    if (res.status === 'ok') {
      mfaStep.value = 'done'
      const signinUrl = sessionStorage.getItem('signinUrl')
      setTimeout(() => {
        if (signinUrl) {
          window.location.href = signinUrl
        } else {
          router.push('/')
        }
      }, 1500)
    } else {
      message.error(res.msg || t('MFA verification failed'))
    }
  } catch (e: any) {
    message.error(e.message)
  } finally {
    loading.value = false
  }
}

async function sendSmsCode() {
  startCountdown()
  message.info(t('SMS code sent'))
}

async function sendEmailCode() {
  startCountdown()
  message.info(t('Email code sent'))
}

onMounted(async () => {
  // Load application info
  try {
    const res = await fetch(`/api/get-application?applicationName=${encodeURIComponent(applicationName)}`)
    const data = await res.json()
    if (data.status === 'ok') {
      application.value = data.data
    }
  } catch { /* ignore */ }
})
</script>

<style scoped lang="less">
.prompt-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.prompt-container { width: 440px; max-width: 90vw; }
.prompt-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px 32px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.prompt-header {
  text-align: center; margin-bottom: 24px;
  .prompt-logo { height: 48px; margin-bottom: 12px; }
  h2 { margin: 0 0 4px 0; font-size: 24px; }
  .prompt-subtitle { color: #666; margin: 0; }
}
</style>
