import request from './request'

export function MfaSetupInitiate(values: any) {
  const formData = new FormData()
  formData.append('owner', values.owner)
  formData.append('name', values.name)
  formData.append('mfaType', values.mfaType)
  return request.post('/api/mfa/setup/initiate', formData)
}

export function MfaSetupVerify(values: any) {
  const formData = new FormData()
  formData.append('owner', values.owner)
  formData.append('name', values.name)
  formData.append('mfaType', values.mfaType)
  formData.append('passcode', values.passcode)
  formData.append('secret', values.secret)
  formData.append('dest', values.dest)
  formData.append('countryCode', values.countryCode)
  return request.post('/api/mfa/setup/verify', formData)
}

export function MfaSetupEnable(values: any) {
  const formData = new FormData()
  formData.append('mfaType', values.mfaType)
  formData.append('owner', values.owner)
  formData.append('name', values.name)
  formData.append('secret', values.secret)
  formData.append('recoveryCodes', values.recoveryCodes)
  formData.append('dest', values.dest)
  formData.append('countryCode', values.countryCode)
  return request.post('/api/mfa/setup/enable', formData)
}

export function DeleteMfa(values: any) {
  const formData = new FormData()
  formData.append('owner', values.owner)
  formData.append('name', values.name)
  return request.post('/api/delete-mfa', formData)
}

export function SetPreferredMfa(values: any) {
  const formData = new FormData()
  formData.append('mfaType', values.mfaType)
  formData.append('owner', values.owner)
  formData.append('name', values.name)
  return request.post('/api/set-preferred-mfa', formData)
}
