import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getSubscriptions(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-subscriptions', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getSubscription(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-subscription', owner, name))
}

export function updateSubscription(owner: string, name: string, subscription: any) {
  return request.post(buildIdUrl('/api/update-subscription', owner, name), cloneBody(subscription))
}

export function addSubscription(subscription: any) {
  return request.post('/api/add-subscription', cloneBody(subscription))
}

export function deleteSubscription(subscription: any) {
  return request.post('/api/delete-subscription', cloneBody(subscription))
}
