import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getAdapters(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-adapters', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getAdapter(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-adapter', owner, name))
}

export function updateAdapter(owner: string, name: string, Adapter: any) {
  return request.post(buildIdUrl('/api/update-adapter', owner, name), cloneBody(Adapter))
}

export function addAdapter(Adapter: any) {
  return request.post('/api/add-adapter', cloneBody(Adapter))
}

export function deleteAdapter(Adapter: any) {
  return request.post('/api/delete-adapter', cloneBody(Adapter))
}

export function UpdatePolicy(owner: string, name: string, policy: any) {
  return request.post(buildIdUrl('/api/update-policy', owner, name), policy)
}

export function AddPolicy(owner: string, name: string, policy: any) {
  return request.post(buildIdUrl('/api/add-policy', owner, name), policy)
}

export function RemovePolicy(owner: string, name: string, policy: any) {
  return request.post(buildIdUrl('/api/remove-policy', owner, name), policy)
}

export function getPolicies(owner: string, name: string, adapterId = '') {
  return request.get(buildIdUrl('/api/get-policies', owner, name, { adapterId }))
}
