import request from './request'
import { buildUrl } from './common'

export function getRecords(organizationName: string, page: string, pageSize: string, field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-records', { organizationName, pageSize, p: page, field, value, sortField, sortOrder }))
}
