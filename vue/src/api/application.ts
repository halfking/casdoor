import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getApplications(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-applications', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getApplicationsByOrganization(owner: string, organization: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-organization-applications', { owner, organization, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getApplication(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-application', owner, name))
}

export function getUserApplication(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-user-application', owner, name))
}

export function updateApplication(owner: string, name: string, application: any) {
  return request.post(buildIdUrl('/api/update-application', owner, name), cloneBody(application))
}

export function addApplication(application: any) {
  return request.post('/api/add-application', cloneBody(application))
}

export function deleteApplication(application: any) {
  return request.post('/api/delete-application', cloneBody(application))
}

export function getSamlMetadata(owner: string, name: string, enablePostBinding: boolean) {
  return request.get(`/api/saml/metadata?application=${owner}/${encodeURIComponent(name)}&enablePostBinding=${enablePostBinding}`, { responseType: 'text' })
}
