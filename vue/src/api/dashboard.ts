import request from './request'
import { buildUrl } from './common'

export function getDashboard(owner: string) {
  return request.get(buildUrl('/api/get-dashboard', { owner }))
}
