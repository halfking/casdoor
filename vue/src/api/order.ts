import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getOrders(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-orders', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function payOrder(owner: string, name: string, providerName: string, paymentEnv = '') {
  return request.post(buildIdUrl('/api/pay-order', owner, name, { providerName, paymentEnv }))
}

export function getUserOrders(owner: string, user: string) {
  return request.get(buildUrl('/api/get-user-orders', { owner, user }))
}

export function getOrder(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-order', owner, name))
}

export function updateOrder(owner: string, name: string, order: any) {
  return request.post(buildIdUrl('/api/update-order', owner, name), cloneBody(order))
}

export function addOrder(order: any) {
  return request.post('/api/add-order', cloneBody(order))
}

export function deleteOrder(order: any) {
  return request.post('/api/delete-order', cloneBody(order))
}

export function placeOrder(owner: string, productInfos: any, userName = '') {
  return request.post(buildUrl('/api/place-order', { owner, userName }), { productInfos })
}

export function cancelOrder(owner: string, name: string) {
  return request.post(buildIdUrl('/api/cancel-order', owner, name))
}
