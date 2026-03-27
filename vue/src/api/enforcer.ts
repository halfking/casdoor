import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getEnforcers(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-enforcers', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getEnforcer(owner: string, name: string, loadModelCfg = false) {
  return request.get(buildIdUrl('/api/get-enforcer', owner, name, { loadModelCfg }))
}

export function updateEnforcer(owner: string, name: string, enforcer: any) {
  return request.post(buildIdUrl('/api/update-enforcer', owner, name), cloneBody(enforcer))
}

export function addEnforcer(enforcer: any) {
  return request.post('/api/add-enforcer', cloneBody(enforcer))
}

export function deleteEnforcer(enforcer: any) {
  return request.post('/api/delete-enforcer', cloneBody(enforcer))
}
