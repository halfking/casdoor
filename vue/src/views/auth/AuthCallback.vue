<template>
  <div style="display:flex;justify-content:center;align-items:center;">
    <a-spin v-if="!errorMsg" size="large" :tip="t('Signing in...')" style="padding-top:10%" />
    <a-result v-else status="error" :title="errorMsg" />
  </div>

  <!-- SAML POST response -->
  <form v-if="samlResponse" ref="samlFormRef" :action="redirectUrl" method="POST" style="display:none;">
    <input type="hidden" name="SAMLResponse" :value="samlResponse" />
    <input type="hidden" name="RelayState" :value="relayState" />
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { message } from 'ant-design-vue'
import * as Util from '@/utils/auth-util'
import * as Provider from '@/utils/provider'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const errorMsg = ref<string | null>(null)
const samlResponse = ref('')
const redirectUrl = ref('')
const relayState = ref('')
const samlFormRef = ref<HTMLFormElement | null>(null)

const authServerUrl = window.__authConfig__?.serverUrl || `${window.location.origin}`

function getFromLink(search?: string): string {
  const url = new URL(window.location.href)
  const redirectUri = url.searchParams.get('redirect_uri') || url.searchParams.get('redirect_url')
  if (redirectUri) return redirectUri
  const from = search ? new URLSearchParams(search).get('from') : new URLSearchParams(window.location.search).get('from')
  if (from) return from
  const stored = sessionStorage.getItem('from')
  if (stored) return stored
  return 'https://www.itestu.cn'
}

function goToLink(url: string) {
  window.location.href = url
}

function createFormAndSubmit(url: string, params: Record<string, any>) {
  const form = document.createElement('form')
  form.action = url
  form.method = 'POST'
  for (const [key, value] of Object.entries(params)) {
    if (value != null) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = String(value)
      form.appendChild(input)
    }
  }
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

function getInnerParams(): URLSearchParams {
  const params = new URLSearchParams(window.location.search)
  const state = params.get('state')
  const queryString = Util.getQueryParamsFromState(state)
  return new URLSearchParams(queryString)
}

function getResponseType(): string {
  const innerParams = getInnerParams()
  const method = innerParams.get('method')
  if (method === 'signup') {
    const realRedirectUri = innerParams.get('redirect_uri')
    if (realRedirectUri === null) {
      const samlRequest = innerParams.get('SAMLRequest')
      const casService = innerParams.get('service')
      if (samlRequest) return 'saml'
      if (casService) return 'cas'
      return 'login'
    }
    const realRedirectUrl = new URL(realRedirectUri).origin
    if (authServerUrl === realRedirectUrl) return 'login'
    const responseType = innerParams.get('response_type')
    return responseType || 'code'
  } else if (method === 'link') {
    return 'link'
  }
  return 'unknown'
}

function handleCasLoginResult(res: any, body: any, casService: string) {
  let msg = 'Logged in successfully.'
  if (casService === '') {
    msg += ' Now you can visit apps protected by Casdoor.'
  }
  message.success(msg)
  if (casService !== '') {
    const st = res.data
    const newUrl = new URL(casService)
    newUrl.searchParams.append('ticket', st)
    window.location.href = newUrl.toString()
  }
}

function handleOAuthLoginResult(res: any, body: any, innerParams: URLSearchParams, queryString: string, applicationName: string, responseType: string) {
  const oAuthParams = Util.getOAuthGetParameters(innerParams)
  const concatChar = oAuthParams?.redirectUri?.includes('?') ? '&' : '?'
  const responseMode = oAuthParams?.responseMode || 'query'
  const signinUrl = localStorage.getItem('signinUrl')
  const responseTypes = responseType.split(' ')

  // MFA check
  if (res.data2 === 'mfa' || res.data === 'RequiredMfa' || res.msg === 'RequiredMfa') {
    sessionStorage.setItem('signinUrl', signinUrl || window.location.href)
    router.push(`/prompt/${applicationName}`)
    return
  }

  if (responseType === 'login') {
    if (res.data3) {
      sessionStorage.setItem('signinUrl', signinUrl || '')
      router.push(`/forget/${applicationName}`)
      return
    }
    message.success('Logged in successfully')
    goToLink(getFromLink(queryString))
  } else if (responseType === 'code') {
    if (res.data3) {
      sessionStorage.setItem('signinUrl', signinUrl || '')
      router.push(`/forget/${applicationName}`)
      return
    }
    if (responseMode === 'form_post') {
      createFormAndSubmit(oAuthParams?.redirectUri, { code: res.data, state: oAuthParams?.state })
    } else {
      goToLink(`${oAuthParams.redirectUri}${concatChar}code=${res.data}&state=${oAuthParams.state}`)
    }
  } else if (responseTypes.includes('token') || responseTypes.includes('id_token')) {
    if (res.data3) {
      sessionStorage.setItem('signinUrl', signinUrl || '')
      router.push(`/forget/${applicationName}`)
      return
    }
    if (responseMode === 'form_post') {
      createFormAndSubmit(oAuthParams?.redirectUri, {
        token: responseTypes.includes('token') ? res.data : null,
        id_token: responseTypes.includes('id_token') ? res.data : null,
        token_type: 'bearer',
        state: oAuthParams?.state,
      })
    } else {
      goToLink(`${oAuthParams.redirectUri}${concatChar}${responseType}=${res.data}&state=${oAuthParams.state}&token_type=bearer`)
    }
  } else if (responseType === 'link') {
    let from = innerParams.get('from') || ''
    const oauth = innerParams.get('oauth')
    if (oauth) from += `?oauth=${oauth}`
    window.location.href = from
  } else if (responseType === 'saml') {
    if (res.data2?.method === 'POST') {
      samlResponse.value = res.data
      redirectUrl.value = res.data2.redirectUrl
      relayState.value = oAuthParams.relayState
      onMounted(() => {
        samlFormRef.value?.submit()
      })
    } else {
      if (res.data3) {
        sessionStorage.setItem('signinUrl', signinUrl || '')
        router.push(`/forget/${applicationName}`)
        return
      }
      const SAMLResponse = res.data
      const redirectUri = res.data2.redirectUrl
      goToLink(`${redirectUri}${redirectUri.includes('?') ? '&' : '?'}SAMLResponse=${encodeURIComponent(SAMLResponse)}&RelayState=${oAuthParams.relayState}`)
    }
  }
}

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const queryString = Util.getQueryParamsFromState(params.get('state'))
  const isSteam = params.get('openid.mode')

  let code = params.get('code')
  if (!code) code = params.get('auth_code')
  if (!code) code = params.get('authCode')
  if (!code) {
    const web3Key = params.get('web3AuthTokenKey')
    if (web3Key) code = localStorage.getItem(web3Key) || undefined
  }
  if (isSteam && !code) code = window.location.search

  const innerParams = getInnerParams()
  const applicationName = innerParams.get('application')
  const providerName = innerParams.get('provider')
  const method = innerParams.get('method')
  const samlRequest = innerParams.get('SAMLRequest')
  const casService = innerParams.get('service')

  // Telegram auth
  const telegramId = params.get('id')
  if (telegramId && !code) {
    const telegramAuthData: Record<string, any> = { id: parseInt(telegramId, 10) }
    const hash = params.get('hash')
    const authDate = params.get('auth_date')
    if (hash) telegramAuthData.hash = hash
    if (authDate) telegramAuthData.auth_date = authDate
    for (const field of ['first_name', 'last_name', 'username', 'photo_url']) {
      const v = params.get(field)
      if (v) telegramAuthData[field] = v
    }
    code = JSON.stringify(telegramAuthData)
  }

  const redirectUri = `${window.location.origin}/callback`
  const codeVerifier = Provider.getCodeVerifier(params.get('state'))

  const body: Record<string, any> = {
    type: getResponseType(),
    application: applicationName,
    provider: providerName,
    code: code,
    samlRequest: samlRequest,
    state: applicationName,
    invitationCode: innerParams.get('invitationCode') || '',
    redirectUri: redirectUri,
    method: method,
    codeVerifier: codeVerifier,
  }

  if (codeVerifier) Provider.clearCodeVerifier(params.get('state'))

  const responseType = getResponseType()

  try {
    if (responseType === 'cas') {
      const res = await fetch('/api/login/cas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, service: casService }),
      }).then(r => r.json())
      if (res.status === 'ok') {
        handleCasLoginResult(res, body, casService || '')
      } else {
        errorMsg.value = `${t('Failed to sign in')}: ${res.msg}`
      }
      return
    }

    // OAuth login
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then(r => r.json())

    if (res.status === 'ok') {
      handleOAuthLoginResult(res, body, innerParams, queryString, applicationName || '', responseType)
    } else {
      errorMsg.value = res.msg
    }
  } catch (e: any) {
    errorMsg.value = e.message || 'Authentication failed'
  }

  // Auto-submit SAML form if set
  if (samlResponse.value && samlFormRef.value) {
    samlFormRef.value.submit()
  }
})
</script>
