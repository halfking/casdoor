import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getCerts(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-certs', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getGlobalCerts(page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-global-certs', { p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getCert(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-cert', owner, name))
}

export function updateCert(owner: string, name: string, cert: any) {
  return request.post(buildIdUrl('/api/update-cert', owner, name), cloneBody(cert))
}

export function addCert(cert: any) {
  return request.post('/api/add-cert', cloneBody(cert))
}

export function deleteCert(cert: any) {
  return request.post('/api/delete-cert', cloneBody(cert))
}

export function refreshDomainExpire(owner: string, name: string) {
  return request.post(buildIdUrl('/api/update-cert-domain-expire', owner, name))
}
