import request from './request'
import { buildIdUrl, buildUrl } from './common'

export function getRules(owner: string, page = '', pageSize = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-rules', { owner, p: page, pageSize, sortField, sortOrder }))
}

export function getRule(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-rule', owner, name))
}

export function addRule(rule: any) {
  return request.post('/api/add-rule', rule)
}

export function updateRule(owner: string, name: string, rule: any) {
  return request.post(buildIdUrl('/api/update-rule', owner, name), rule)
}

export function deleteRule(rule: any) {
  return request.post('/api/delete-rule', rule)
}
