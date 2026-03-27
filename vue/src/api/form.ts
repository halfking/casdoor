import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getGlobalForms() {
  return request.get('/api/get-global-forms')
}

export function getForms(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-forms', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getForm(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-form', owner, name))
}

export function updateForm(owner: string, name: string, form: any) {
  return request.post(buildIdUrl('/api/update-form', owner, name), cloneBody(form))
}

export function addForm(form: any) {
  return request.post('/api/add-form', cloneBody(form))
}

export function deleteForm(form: any) {
  return request.post('/api/delete-form', cloneBody(form))
}
