import request from './request'
import { buildIdUrl, buildUrl } from './common'

export function getLdaps(owner: string) {
  return request.get(buildUrl('/api/get-ldaps', { owner }))
}

export function getLdap(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-ldap', owner, name))
}

export function addLdap(body: any) {
  return request.post('/api/add-ldap', body)
}

export function deleteLdap(body: any) {
  return request.post('/api/delete-ldap', body)
}

export function updateLdap(body: any) {
  return request.post('/api/update-ldap', body)
}

export function getLdapUser(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-ldap-users', owner, name))
}

export function syncUsers(owner: string, name: string, body: any) {
  return request.post(buildIdUrl('/api/sync-ldap-users', owner, name), body)
}
