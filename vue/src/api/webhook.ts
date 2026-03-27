import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getWebhooks(owner: string, organization: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-webhooks', { owner, organization, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getWebhook(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-webhook', owner, name))
}

export function updateWebhook(owner: string, name: string, webhook: any) {
  return request.post(buildIdUrl('/api/update-webhook', owner, name), cloneBody(webhook))
}

export function addWebhook(webhook: any) {
  return request.post('/api/add-webhook', cloneBody(webhook))
}

export function deleteWebhook(webhook: any) {
  return request.post('/api/delete-webhook', cloneBody(webhook))
}
