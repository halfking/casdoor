import { get, post, qs, idQuery, type ApiResponse, type PaginatedResponse, type ListParams } from "../base";
import type { Adapter } from "../types";

export function getAdapters(params: ListParams) {
  return get<Adapter[]>(qs("/api/get-adapters", params)) as Promise<PaginatedResponse<Adapter>>;
}

export function getAdapter(owner: string, name: string) {
  return get<Adapter>(idQuery("/api/get-adapter", owner, name));
}

export function addAdapter(adapter: Partial<Adapter>) {
  return post("/api/add-adapter", adapter);
}

export function updateAdapter(owner: string, name: string, adapter: Partial<Adapter>) {
  return post(idQuery("/api/update-adapter", owner, name), adapter);
}

export function deleteAdapter(adapter: Partial<Adapter>) {
  return post("/api/delete-adapter", adapter);
}

// Policy management
export function getPolicies(owner: string, name: string, adapterId?: string) {
  return get<string[][]>(qs("/api/get-policies", { owner: undefined, page: undefined, pageSize: undefined }) + `?id=${encodeURIComponent(owner)}/${encodeURIComponent(name)}${adapterId ? `&adapterId=${encodeURIComponent(adapterId)}` : ""}`);
}

export function addPolicy(owner: string, name: string, policy: string[]) {
  return post(idQuery("/api/add-policy", owner, name), policy);
}

export function updatePolicy(owner: string, name: string, policy: string[]) {
  return post(idQuery("/api/update-policy", owner, name), policy);
}

export function removePolicy(owner: string, name: string, policy: string[]) {
  return post(idQuery("/api/remove-policy", owner, name), policy);
}
