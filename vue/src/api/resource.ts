import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getResources(owner: string, user: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-resources', { owner, user, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getResource(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-resource', owner, name))
}

export function updateResource(owner: string, name: string, resource: any) {
  return request.post(buildIdUrl('/api/update-resource', owner, name), cloneBody(resource))
}

export function addResource(resource: any) {
  return request.post('/api/add-resource', cloneBody(resource))
}

export function deleteResource(resource: any, provider = '') {
  return request.post(buildUrl('/api/delete-resource', { provider }), cloneBody(resource))
}

export function uploadResource(owner: string, user: string, tag: string, parent: string, fullFilePath: string, file: File | Blob, provider = '') {
  const application = 'app-built-in'
  const formData = new FormData()
  formData.append('file', file)
  return request.post(buildUrl('/api/upload-resource', {
    owner,
    user,
    application,
    tag,
    parent,
    fullFilePath,
    provider,
  }), formData)
}
