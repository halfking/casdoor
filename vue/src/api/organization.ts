import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getOrganizations(owner: string, organizationName = '', page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-organizations', { owner, organizationName, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getOrganization(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-organization', owner, name))
}

export function updateOrganization(owner: string, name: string, organization: any) {
  return request.post(buildIdUrl('/api/update-organization', owner, name), cloneBody(organization))
}

export function addOrganization(organization: any) {
  return request.post('/api/add-organization', cloneBody(organization))
}

export function deleteOrganization(organization: any) {
  return request.post('/api/delete-organization', cloneBody(organization))
}

export function getDefaultApplication(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-default-application', owner, name))
}

export function getOrganizationNames(owner: string) {
  return request.get(buildUrl('/api/get-organization-names', { owner }))
}
