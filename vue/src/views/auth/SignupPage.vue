<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <img src="/img/kaixuan-platform-logo-light.svg" alt="Logo" class="login-logo" />
          <h2>{{ t('Sign Up') }}</h2>
        </div>

        <a-form :model="formState" :rules="rules" @finish="handleSignup" layout="vertical" size="large">
          <!-- Organization -->
          <a-form-item :label="t('Organization')" name="organization">
            <a-select v-model:value="formState.organization" :placeholder="t('Please select organization')">
              <a-select-option v-for="org in organizations" :key="org.name" :value="org.name">
                {{ org.displayName || org.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <!-- Username -->
          <a-form-item :label="t('Username')" name="username">
            <a-input v-model:value="formState.username" :placeholder="t('Please input username')">
              <template #prefix><UserOutlined /></template>
            </a-input>
          </a-form-item>

          <!-- Email -->
          <a-form-item :label="t('Email')" name="email">
            <a-input v-model:value="formState.email" :placeholder="t('Please input email')">
              <template #prefix><MailOutlined /></template>
            </a-input>
          </a-form-item>

          <!-- Phone (optional) -->
          <a-form-item v-if="enablePhone" :label="t('Phone')" name="phone">
            <a-input v-model:value="formState.phone" :placeholder="t('Please input phone')">
              <template #prefix><PhoneOutlined /></template>
            </a-input>
          </a-form-item>

          <!-- Password -->
          <a-form-item :label="t('Password')" name="password">
            <a-input-password v-model:value="formState.password" :placeholder="t('Please input password')">
              <template #prefix><LockOutlined /></template>
            </a-input-password>
          </a-form-item>

          <!-- Confirm Password -->
          <a-form-item :label="t('Confirm Password')" name="confirmPassword">
            <a-input-password v-model:value="formState.confirmPassword" :placeholder="t('Please confirm password')">
              <template #prefix><LockOutlined /></template>
            </a-input-password>
          </a-form-item>

          <!-- Terms -->
          <a-form-item>
            <a-checkbox v-model:checked="formState.agreeTerms">
              {{ t('I agree to the Terms of Service and Privacy Policy') }}
            </a-checkbox>
          </a-form-item>

          <!-- Submit -->
          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="loading" block size="large">
              {{ t('Sign Up') }}
            </a-button>
          </a-form-item>
        </a-form>

        <div class="login-footer">
          <span>{{ t('Already have an account?') }}</span>
          <a @click="router.push('/login')">{{ t('Sign In') }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons-vue'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const organizations = ref<any[]>([])
const enablePhone = ref(true)

const formState = reactive({
  organization: 'built-in',
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false,
})

const validateConfirmPassword = async (_rule: any, value: string) => {
  if (value && value !== formState.password) {
    throw new Error(t('Passwords do not match'))
  }
}

const rules = {
  organization: [{ required: true, message: () => t('Please select organization') }],
  username: [{ required: true, message: () => t('Please input username') }],
  email: [
    { required: true, message: () => t('Please input email') },
    { type: 'email' as const, message: () => t('Invalid email') },
  ],
  password: [
    { required: true, message: () => t('Please input password') },
    { min: 6, message: () => t('Password must be at least 6 characters') },
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'change' as const }],
}

async function handleSignup() {
  if (!formState.agreeTerms) {
    message.warning(t('Please agree to the Terms of Service'))
    return
  }
  loading.value = true
  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organization: formState.organization,
        username: formState.username,
        email: formState.email,
        phone: formState.phone,
        password: formState.password,
      }),
    }).then(r => r.json())

    if (res.status === 'ok') {
      message.success(t('Sign up successfully'))
      router.push('/login')
    } else {
      message.error(res.msg || t('Sign up failed'))
    }
  } catch (e: any) {
    message.error(e.message || t('Sign up failed'))
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await fetch('/api/get-organizations')
    const data = await res.json()
    if (data.status === 'ok') {
      organizations.value = data.data || []
    }
  } catch { /* ignore */ }
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
.login-container { width: 420px; max-width: 90vw; }
.login-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px 32px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.login-header {
  text-align: center;
  margin-bottom: 32px;
  .login-logo { height: 48px; margin-bottom: 12px; }
  h2 { margin: 0; font-size: 24px; }
}
.login-footer {
  text-align: center; color: #666;
  a { color: #667eea; margin-left: 4px; cursor: pointer; }
}
</style>
