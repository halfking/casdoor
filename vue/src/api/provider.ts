import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getProviders(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-providers', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getGlobalProviders(page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-global-providers', { p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getProvider(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-provider', owner, name))
}

export function updateProvider(owner: string, name: string, provider: any) {
  return request.post(buildIdUrl('/api/update-provider', owner, name), cloneBody(provider))
}

export function addProvider(provider: any) {
  return request.post('/api/add-provider', cloneBody(provider))
}

export function deleteProvider(provider: any) {
  return request.post('/api/delete-provider', cloneBody(provider))
}
