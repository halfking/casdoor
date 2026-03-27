import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getPlans(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-plans', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getPlan(owner: string, name: string, includeOption = false) {
  return request.get(buildIdUrl('/api/get-plan', owner, name, { includeOption }))
}

export function updatePlan(owner: string, name: string, plan: any) {
  return request.post(buildIdUrl('/api/update-plan', owner, name), cloneBody(plan))
}

export function addPlan(plan: any) {
  return request.post('/api/add-plan', cloneBody(plan))
}

export function deletePlan(plan: any) {
  return request.post('/api/delete-plan', cloneBody(plan))
}
