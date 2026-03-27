import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getInvitations(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-invitations', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getInvitation(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-invitation', owner, name))
}

export function getInvitationCodeInfo(code: string, applicationName: string) {
  return request.get(buildUrl('/api/get-invitation-info', { code, applicationId: applicationName }))
}

export function updateInvitation(owner: string, name: string, invitation: any) {
  return request.post(buildIdUrl('/api/update-invitation', owner, name), cloneBody(invitation))
}

export function addInvitation(invitation: any) {
  return request.post('/api/add-invitation', cloneBody(invitation))
}

export function deleteInvitation(invitation: any) {
  return request.post('/api/delete-invitation', cloneBody(invitation))
}

export function verifyInvitation(owner: string, name: string) {
  return request.get(buildIdUrl('/api/verify-invitation', owner, name))
}

export function sendInvitation(invitation: any, destinations: any) {
  return request.post(buildIdUrl('/api/send-invitation', invitation.owner, invitation.name), destinations)
}
