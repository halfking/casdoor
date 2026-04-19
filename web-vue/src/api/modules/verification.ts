import { get, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";

export function getVerifications(params: ListParams) {
  return get(qs("/api/get-verifications", params)) as Promise<PaginatedResponse<unknown>>;
}

export function getVerification(owner: string, name: string) {
  return get(idQuery("/api/get-verification", owner, name));
}
