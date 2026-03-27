import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getSyncers(owner: string, organization: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-syncers', { owner, organization, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getSyncer(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-syncer', owner, name))
}

export function updateSyncer(owner: string, name: string, syncer: any) {
  return request.post(buildIdUrl('/api/update-syncer', owner, name), cloneBody(syncer))
}

export function addSyncer(syncer: any) {
  return request.post('/api/add-syncer', cloneBody(syncer))
}

export function testSyncerDb(syncer: any) {
  return request.post('/api/test-syncer-db', cloneBody(syncer))
}

export function deleteSyncer(syncer: any) {
  return request.post('/api/delete-syncer', cloneBody(syncer))
}

export function runSyncer(owner: string, name: string) {
  return request.get(buildIdUrl('/api/run-syncer', owner, name))
}
