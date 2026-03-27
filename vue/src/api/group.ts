import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getGroups(owner = '', withTree = false, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-groups', { owner, p: page, pageSize, field, value, sortField, sortOrder, withTree }))
}

export function getGroup(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-group', owner, name))
}

export function updateGroup(owner: string, name: string, group: any) {
  return request.post(buildIdUrl('/api/update-group', owner, name), cloneBody(group))
}

export function addGroup(group: any) {
  return request.post('/api/add-group', cloneBody(group))
}

export function deleteGroup(group: any) {
  return request.post('/api/delete-group', cloneBody(group))
}
