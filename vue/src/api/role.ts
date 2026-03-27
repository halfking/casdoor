import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getRoles(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-roles', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getRole(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-role', owner, name))
}

export function updateRole(owner: string, name: string, role: any) {
  return request.post(buildIdUrl('/api/update-role', owner, name), cloneBody(role))
}

export function addRole(role: any) {
  return request.post('/api/add-role', cloneBody(role))
}

export function deleteRole(role: any) {
  return request.post('/api/delete-role', cloneBody(role))
}
