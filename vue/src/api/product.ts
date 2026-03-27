import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getProducts(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-products', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getProduct(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-product', owner, name))
}

export function updateProduct(owner: string, name: string, product: any) {
  return request.post(buildIdUrl('/api/update-product', owner, name), cloneBody(product))
}

export function addProduct(product: any) {
  return request.post('/api/add-product', cloneBody(product))
}

export function deleteProduct(product: any) {
  return request.post('/api/delete-product', cloneBody(product))
}
