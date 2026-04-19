import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Invitation } from "../types";

export function getInvitations(params: ListParams) {
  return get<Invitation[]>(qs("/api/get-invitations", params)) as Promise<PaginatedResponse<Invitation>>;
}

export function getInvitation(owner: string, name: string) {
  return get<Invitation>(idQuery("/api/get-invitation", owner, name));
}

export function getInvitationCodeInfo(code: string, applicationName: string) {
  return get<Invitation>(qs("/api/get-invitation-info", { code, applicationId: applicationName } as Record<string, string>));
}

export function addInvitation(invitation: Partial<Invitation>) {
  return post("/api/add-invitation", invitation);
}

export function updateInvitation(owner: string, name: string, invitation: Partial<Invitation>) {
  return post(idQuery("/api/update-invitation", owner, name), invitation);
}

export function deleteInvitation(invitation: Partial<Invitation>) {
  return post("/api/delete-invitation", invitation);
}

export function verifyInvitation(owner: string, name: string) {
  return get(idQuery("/api/verify-invitation", owner, name));
}

export function sendInvitation(owner: string, name: string, destinations: string[]) {
  return post(idQuery("/api/send-invitation", owner, name), destinations);
}
