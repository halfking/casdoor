import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getModels(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-models', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getModel(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-model', owner, name))
}

export function updateModel(owner: string, name: string, model: any) {
  return request.post(buildIdUrl('/api/update-model', owner, name), cloneBody(model))
}

export function addModel(model: any) {
  return request.post('/api/add-model', cloneBody(model))
}

export function deleteModel(model: any) {
  return request.post('/api/delete-model', cloneBody(model))
}
