import { get, post, qs, type PaginatedResponse, type ListParams } from "../base";
import type { Session } from "../types";

export function getSessions(params: ListParams) {
  return get<Session[]>(qs("/api/get-sessions", params)) as Promise<PaginatedResponse<Session>>;
}

export function deleteSession(session: Partial<Session>, sessionId?: string) {
  const url = sessionId ? `/api/delete-session?sessionId=${encodeURIComponent(sessionId)}` : "/api/delete-session";
  return post(url, session);
}
