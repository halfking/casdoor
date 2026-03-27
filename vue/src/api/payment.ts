import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getPayments(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-payments', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getPayment(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-payment', owner, name))
}

export function updatePayment(owner: string, name: string, payment: any) {
  return request.post(buildIdUrl('/api/update-payment', owner, name), cloneBody(payment))
}

export function addPayment(payment: any) {
  return request.post('/api/add-payment', cloneBody(payment))
}

export function deletePayment(payment: any) {
  return request.post('/api/delete-payment', cloneBody(payment))
}

export function invoicePayment(owner: string, name: string) {
  return request.post(buildIdUrl('/api/invoice-payment', owner, name))
}

export function notifyPayment(owner: string, name: string) {
  return request.post(`/api/notify-payment/${owner}/${name}`)
}
