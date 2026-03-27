import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getPricings(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-pricings', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getPricing(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-pricing', owner, name))
}

export function updatePricing(owner: string, name: string, pricing: any) {
  return request.post(buildIdUrl('/api/update-pricing', owner, name), cloneBody(pricing))
}

export function addPricing(pricing: any) {
  return request.post('/api/add-pricing', cloneBody(pricing))
}

export function deletePricing(pricing: any) {
  return request.post('/api/delete-pricing', cloneBody(pricing))
}
