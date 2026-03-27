import i18n from '@/i18n'
import { showMessage } from '@/utils/management'
import request from './request'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function getAccount(query = '') {
  return request.get(`/api/get-account${query}`)
}

export function signup(values: any, oAuthParams: any) {
  return request.post(`/api/signup${oAuthParamsToQuery(oAuthParams)}`, values)
}

export function getEmailAndPhone(organization: string, username: string) {
  return request.get(`/api/get-email-and-phone?organization=${organization}&username=${encodeURIComponent(username)}`)
}

export function casLoginParamsToQuery(casParams: any) {
  return `?type=${casParams?.type}&id=${casParams?.id}&redirectUri=${casParams?.service}`
}

export function oAuthParamsToQuery(oAuthParams: any) {
  if (oAuthParams === null || oAuthParams === undefined) {
    return ''
  }

  return `?clientId=${oAuthParams.clientId}&responseType=${oAuthParams.responseType}&redirectUri=${encodeURIComponent(oAuthParams.redirectUri)}&type=${oAuthParams.type}&scope=${oAuthParams.scope}&state=${oAuthParams.state}&nonce=${oAuthParams.nonce}&code_challenge_method=${oAuthParams.challengeMethod}&code_challenge=${oAuthParams.codeChallenge}`
}

export function getApplicationLogin(params: any) {
  let queryParams = ''
  if (params?.type === 'cas') {
    queryParams = casLoginParamsToQuery(params)
  } else if (params?.type === 'device') {
    queryParams = `?userCode=${params.userCode}&type=device`
  } else {
    queryParams = oAuthParamsToQuery(params)
  }
  return request.get(`/api/get-app-login${queryParams}`)
}

export function login(values: any, oAuthParams: any) {
  return request.post(`/api/login${oAuthParamsToQuery(oAuthParams)}`, values)
}

export function loginCas(values: any, params: any) {
  return request.post(`/api/login?service=${params.service}`, values)
}

export function logout() {
  return request.post('/api/logout')
}

export function unlink(values: any) {
  return request.post('/api/unlink', values)
}

export function getSamlLogin(providerId: string, relayState: string) {
  return request.get(`/api/get-saml-login?id=${providerId}&relayState=${relayState}`)
}

export function loginWithSaml(values: any, param: string) {
  return request.post(`/api/login${param}`, values)
}

export function getWechatMessageEvent(ticket: string) {
  return request.get(`/api/get-webhook-event?ticket=${ticket}`)
}

export function getWechatQRCode(providerId: string) {
  return request.get(`/api/get-qrcode?id=${providerId}`)
}

export function getCaptchaStatus(values: any) {
  return request.get(`/api/get-captcha-status?organization=${values.organization}&userId=${values.username}&application=${values.application}`)
}

export async function sendCode(captchaType: string, captchaToken: string, clientSecret: string, method: string, countryCode: string | undefined, dest: string, type: string, applicationId: string, checkUser?: string): Promise<boolean>
export async function sendCode(captchaType: string, captchaToken: string, clientSecret: string, method: string, countryCode = '', dest = '', type = '', applicationId = '', checkUser = '') {
  if (isValidEmail(dest) && type !== 'email') {
    type = 'email'
  }

  const formData = new FormData()
  formData.append('captchaType', captchaType)
  formData.append('captchaToken', captchaToken)
  formData.append('clientSecret', clientSecret)
  formData.append('method', method)
  formData.append('countryCode', countryCode)
  formData.append('dest', dest)
  formData.append('type', type)
  formData.append('applicationId', applicationId)
  formData.append('checkUser', checkUser)

  const res = await request.post('/api/send-verification-code', formData)
  if (res.status === 'ok') {
    showMessage('success', i18n.global.t('user:Verification code sent') as string)
    return true
  }

  showMessage('error', String(res.msg ?? ''))
  return false
}

export async function verifyCaptcha(owner: string, name: string, captchaType: string, captchaToken: string, clientSecret: string) {
  const formData = new FormData()
  formData.append('captchaType', captchaType)
  formData.append('captchaToken', captchaToken)
  formData.append('clientSecret', clientSecret)
  formData.append('applicationId', `${owner}/${name}`)

  const res = await request.post('/api/verify-captcha', formData)
  if (res.status === 'ok') {
    if (res.data) {
      showMessage('success', i18n.global.t('user:Captcha Verify Success') as string)
    } else {
      showMessage('error', i18n.global.t('user:Captcha Verify Failed') as string)
    }
    return true
  }

  showMessage('error', i18n.global.t(`user:${String(res.msg ?? '')}`) as string)
  return false
}

