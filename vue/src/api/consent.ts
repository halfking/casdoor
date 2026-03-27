import request from './request'

export function grantConsent(consent: any, oAuthParams: any) {
  const body = {
    ...consent,
    clientId: oAuthParams.clientId,
    provider: '',
    signinMethod: '',
    responseType: oAuthParams.responseType || 'code',
    redirectUri: oAuthParams.redirectUri,
    scope: oAuthParams.scope,
    state: oAuthParams.state,
    nonce: oAuthParams.nonce || '',
    challenge: oAuthParams.codeChallenge || '',
    resource: '',
  }
  return request.post('/api/grant-consent', body)
}

export function revokeConsent(consent: any) {
  return request.post('/api/revoke-consent', consent)
}
