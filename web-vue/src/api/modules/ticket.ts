import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Ticket, TicketMessage } from "../types";

export function getTickets(params: ListParams) {
  return get<Ticket[]>(qs("/api/get-tickets", params)) as Promise<PaginatedResponse<Ticket>>;
}

export function getTicket(owner: string, name: string) {
  return get<Ticket>(idQuery("/api/get-ticket", owner, name));
}

export function addTicket(ticket: Partial<Ticket>) {
  return post("/api/add-ticket", ticket);
}

export function updateTicket(owner: string, name: string, ticket: Partial<Ticket>) {
  return post(idQuery("/api/update-ticket", owner, name), ticket);
}

export function deleteTicket(ticket: Partial<Ticket>) {
  return post("/api/delete-ticket", ticket);
}

export function addTicketMessage(owner: string, name: string, message: TicketMessage) {
  return post(idQuery("/api/add-ticket-message", owner, name), message);
}
