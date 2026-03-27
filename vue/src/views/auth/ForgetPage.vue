<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <img src="/img/kaixuan-platform-logo-light.svg" alt="Logo" class="login-logo" />
          <h2>{{ t('Reset Password') }}</h2>
        </div>

        <a-steps :current="step" style="margin-bottom: 32px;">
          <a-step :title="t('Verify')" />
          <a-step :title="t('Reset')" />
          <a-step :title="t('Done')" />
        </a-steps>

        <!-- Step 1: Verify identity -->
        <div v-if="step === 0">
          <a-form :model="formState" @finish="sendCode" layout="vertical" size="large">
            <a-form-item :label="t('Username')" name="username" :rules="[{ required: true, message: t('Required') }]">
              <a-input v-model:value="formState.username" :placeholder="t('Username')">
                <template #prefix><UserOutlined /></template>
              </a-input>
            </a-form-item>
            <a-form-item :label="t('Email')" name="email" :rules="[{ required: true, type: 'email', message: t('Invalid email') }]">
              <a-input v-model:value="formState.email" :placeholder="t('Email')">
                <template #prefix><MailOutlined /></template>
              </a-input>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" html-type="submit" :loading="sendingCode" block>
                {{ t('Send verification code') }}
              </a-button>
            </a-form-item>
          </a-form>
        </div>

        <!-- Step 2: Enter code + new password -->
        <div v-if="step === 1">
          <a-form :model="formState" @finish="resetPassword" layout="vertical" size="large">
            <a-form-item :label="t('Verification Code')" name="code" :rules="[{ required: true, message: t('Required') }]">
              <a-input v-model:value="formState.code" :placeholder="t('Enter code from email')" />
            </a-form-item>
            <a-form-item :label="t('New Password')" name="newPassword" :rules="[{ required: true, min: 6, message: t('Min 6 chars') }]">
              <a-input-password v-model:value="formState.newPassword" :placeholder="t('New password')">
                <template #prefix><LockOutlined /></template>
              </a-input-password>
            </a-form-item>
            <a-form-item :label="t('Confirm Password')" name="confirmPassword" :rules="[{ required: true, validator: validateConfirm }]">
              <a-input-password v-model:value="formState.confirmPassword" :placeholder="t('Confirm password')">
                <template #prefix><LockOutlined /></template>
              </a-input-password>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" html-type="submit" :loading="resetting" block>
                {{ t('Reset Password') }}
              </a-button>
            </a-form-item>
          </a-form>
        </div>

        <!-- Step 3: Done -->
        <div v-if="step === 2" style="text-align: center;">
          <a-result status="success" :title="t('Password reset successfully')" :sub-title="t('You can now sign in with your new password')">
            <template #extra>
              <a-button type="primary" @click="router.push('/login')">{{ t('Sign In') }}</a-button>
            </template>
          </a-result>
        </div>

        <div class="login-footer">
          <a @click="router.push('/login')">{{ t('Back to Sign In') }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons-vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const step = ref(0)
const sendingCode = ref(false)
const resetting = ref(false)

const applicationName = (route.params.applicationName as string) || 'app-casdoor'

const formState = reactive({
  username: '',
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirm = async (_rule: any, value: string) => {
  if (value && value !== formState.newPassword) {
    throw new Error(t('Passwords do not match'))
  }
}

async function sendCode() {
  sendingCode.value = true
  try {
    const res = await fetch('/api/send-verification-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application: applicationName,
        username: formState.username,
        email: formState.email,
        type: 'reset',
      }),
    }).then(r => r.json())
    if (res.status === 'ok') {
      message.success(t('Verification code sent'))
      step.value = 1
    } else {
      message.error(res.msg || t('Failed to send code'))
    }
  } catch (e: any) {
    message.error(e.message)
  } finally {
    sendingCode.value = false
  }
}

async function resetPassword() {
  resetting.value = true
  try {
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application: applicationName,
        username: formState.username,
        code: formState.code,
        newPassword: formState.newPassword,
      }),
    }).then(r => r.json())
    if (res.status === 'ok') {
      step.value = 2
    } else {
      message.error(res.msg || t('Failed to reset password'))
    }
  } catch (e: any) {
    message.error(e.message)
  } finally {
    resetting.value = false
  }
}
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
  .login-logo { height: 48px; margin-bottom: 12px; }
  h2 { margin: 0; font-size: 24px; }
}
.login-footer { text-align: center; margin-top: 16px;
  a { color: #667eea; cursor: pointer; }
}
</style>
