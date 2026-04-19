import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Provider } from "../types";

export function getProviders(params: ListParams) {
  return get<Provider[]>(qs("/api/get-providers", params)) as Promise<PaginatedResponse<Provider>>;
}

export function getGlobalProviders(params: Omit<ListParams, "owner">) {
  return get<Provider[]>(qs("/api/get-global-providers", params)) as Promise<PaginatedResponse<Provider>>;
}

export function getProvider(owner: string, name: string) {
  return get<Provider>(idQuery("/api/get-provider", owner, name));
}

export function addProvider(provider: Partial<Provider>) {
  return post("/api/add-provider", provider);
}

export function updateProvider(owner: string, name: string, provider: Partial<Provider>) {
  return post(idQuery("/api/update-provider", owner, name), provider);
}

export function deleteProvider(provider: Partial<Provider>) {
  return post("/api/delete-provider", provider);
}
