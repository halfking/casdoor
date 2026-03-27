import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getTokens(owner: string, organization = '', page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-tokens', { owner, organization, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getToken(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-token', owner, name))
}

export function updateToken(owner: string, name: string, token: any) {
  return request.post(buildIdUrl('/api/update-token', owner, name), cloneBody(token))
}

export function addToken(token: any) {
  return request.post('/api/add-token', cloneBody(token))
}

export function deleteToken(token: any) {
  return request.post('/api/delete-token', cloneBody(token))
}
