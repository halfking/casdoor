import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getGlobalSites() {
  return request.get('/api/get-global-sites')
}

export function getSites(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-sites', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getSite(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-site', owner, name))
}

export function updateSite(owner: string, name: string, site: any) {
  return request.post(buildIdUrl('/api/update-site', owner, name), cloneBody(site))
}

export function addSite(site: any) {
  return request.post('/api/add-site', cloneBody(site))
}

export function deleteSite(site: any) {
  return request.post('/api/delete-site', cloneBody(site))
}
