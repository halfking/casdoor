import request from './request'
import { buildIdUrl, buildUrl, cloneBody } from './common'

export function getTickets(owner: string, page = '', pageSize = '', field = '', value = '', sortField = '', sortOrder = '') {
  return request.get(buildUrl('/api/get-tickets', { owner, p: page, pageSize, field, value, sortField, sortOrder }))
}

export function getTicket(owner: string, name: string) {
  return request.get(buildIdUrl('/api/get-ticket', owner, name))
}

export function updateTicket(owner: string, name: string, ticket: any) {
  return request.post(buildIdUrl('/api/update-ticket', owner, name), cloneBody(ticket))
}

export function addTicket(ticket: any) {
  return request.post('/api/add-ticket', cloneBody(ticket))
}

export function deleteTicket(ticket: any) {
  return request.post('/api/delete-ticket', cloneBody(ticket))
}

export function addTicketMessage(owner: string, name: string, message: any) {
  return request.post(buildIdUrl('/api/add-ticket-message', owner, name), message)
}
