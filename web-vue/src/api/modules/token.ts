import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Token } from "../types";

export function getTokens(params: ListParams & { organization?: string }) {
  return get<Token[]>(qs("/api/get-tokens", params)) as Promise<PaginatedResponse<Token>>;
}

export function getToken(owner: string, name: string) {
  return get<Token>(idQuery("/api/get-token", owner, name));
}

export function addToken(token: Partial<Token>) {
  return post("/api/add-token", token);
}

export function updateToken(owner: string, name: string, token: Partial<Token>) {
  return post(idQuery("/api/update-token", owner, name), token);
}

export function deleteToken(token: Partial<Token>) {
  return post("/api/delete-token", token);
}
