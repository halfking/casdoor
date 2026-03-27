import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getTransactions(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-transactions', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getTransaction(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-transaction', owner, name))
}

export function updateTransaction(owner: string, name: string, transaction: any) {
  return request.post(buildIdUrl('/api/update-transaction', owner, name), cloneBody(transaction))
}

export function addTransaction(transaction: any) {
  return request.post('/api/add-transaction', cloneBody(transaction))
}

export function deleteTransaction(transaction: any) {
  return request.post('/api/delete-transaction', cloneBody(transaction))
}
