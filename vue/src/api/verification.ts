import request from './request'
import { buildIdUrl, buildUrl } from './common'

export function getVerifications(owner: string, organization: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-verifications', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getVerification(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-verification', owner, name))
}
