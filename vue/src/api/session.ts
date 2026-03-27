import request from './request'
import { buildUrl } from './common'

export function getSessions(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-sessions', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function deleteSession(session: any, sessionId = '') {
  const url = sessionId === undefined || sessionId === null || sessionId === ''
    ? '/api/delete-session'
    : buildUrl('/api/delete-session', { sessionId })
  return request.post(url, session)
}
