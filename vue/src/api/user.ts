import request from './request'

export function getGlobalUsers(page: string, pageSize: string, field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(`/api/get-global-users?p=${page}&pageSize=${pageSize}&field=${field}&value=${value}&sortField=${sortField}&sortOrder=${sortOrder}`)
}

export function getUsers(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '', groupName = '') {
  return request.get(`/api/get-users?owner=${owner}&p=${page}&pageSize=${pageSize}&field=${field}&value=${value}&sortField=${sortField}&sortOrder=${sortOrder}&groupName=${groupName}`)
}

export function getUser(owner: string, name: string) {
  return request.get(`/api/get-user?id=${owner}/${encodeURIComponent(name)}`)
}

export function addUserKeys(user: any) {
  return request.post('/api/add-user-keys', user)
}

export function updateUser(owner: string, name: string, user: any) {
  return request.post(`/api/update-user?id=${owner}/${encodeURIComponent(name)}`, user)
}

export function addUser(user: any) {
  return request.post('/api/add-user', user)
}

export function deleteUser(user: any) {
  return request.post('/api/delete-user', user)
}

export function getAddressOptions(url: string) {
  return request.get(url)
}

export function getAffiliationOptions(url: string, code: string) {
  return request.get(`${url}/${code}`)
}

export function setPassword(userOwner: string, userName: string, oldPassword: string, newPassword: string, code = '') {
  const formData = new FormData()
  formData.append('userOwner', userOwner)
  formData.append('userName', userName)
  formData.append('oldPassword', oldPassword)
  formData.append('newPassword', newPassword)
  if (code) {
    formData.append('code', code)
  }

  return request.post('/api/set-password', formData)
}

export function resetEmailOrPhone(dest: string, type: string, code: string) {
  const formData = new FormData()
  formData.append('dest', dest)
  formData.append('type', type)
  formData.append('code', code)
  return request.post('/api/reset-email-or-phone', formData)
}

export function impersonateUser(username: string) {
  const formData = new FormData()
  formData.append('username', username)
  return request.post('/api/impersonate-user', formData)
}

export function exitImpersonateUser() {
  return request.post('/api/exit-impersonate-user')
}

export async function getCaptcha(owner: string, name: string, isCurrentProvider: boolean) {
  const res = await request.get(`/api/get-captcha?applicationId=${owner}/${encodeURIComponent(name)}&isCurrentProvider=${isCurrentProvider}`)
  return res.data
}

export function verifyCode(values: any) {
  return request.post('/api/verify-code', values)
}

export function checkUserPassword(values: any) {
  return request.post('/api/check-user-password', values)
}

export function removeUserFromGroup({ owner, name, groupName }: { owner: string, name: string, groupName: string }) {
  const formData = new FormData()
  formData.append('owner', owner)
  formData.append('name', name)
  formData.append('groupName', groupName)
  return request.post('/api/remove-user-from-group', formData)
}

export function verifyIdentification(owner: string, name: string, provider: string) {
  let url = '/api/verify-identification'
  const params: string[] = []

  if (owner && name) {
    params.push(`owner=${owner}`)
    params.push(`name=${name}`)
  }

  if (provider) {
    params.push(`provider=${encodeURIComponent(provider)}`)
  }

  if (params.length > 0) {
    url += `?${params.join('&')}`
  }

  return request.post(url)
}
