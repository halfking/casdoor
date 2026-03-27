import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getPermissions(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-permissions', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getPermissionsBySubmitter() {
  return request.get('/api/get-permissions-by-submitter')
}

export function getPermission(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-permission', owner, name))
}

export function updatePermission(owner: string, name: string, permission: any) {
  return request.post(buildIdUrl('/api/update-permission', owner, name), cloneBody(permission))
}

export function addPermission(permission: any) {
  return request.post('/api/add-permission', cloneBody(permission))
}

export function deletePermission(permission: any) {
  return request.post('/api/delete-permission', cloneBody(permission))
}
