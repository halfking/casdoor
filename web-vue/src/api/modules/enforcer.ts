import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Enforcer } from "../types";

export function getEnforcers(params: ListParams) {
  return get<Enforcer[]>(qs("/api/get-enforcers", params)) as Promise<PaginatedResponse<Enforcer>>;
}

export function getEnforcer(owner: string, name: string, loadModelCfg?: boolean) {
  const url = idQuery("/api/get-enforcer", owner, name) + (loadModelCfg ? "&loadModelCfg=true" : "");
  return get<Enforcer>(url);
}

export function addEnforcer(enforcer: Partial<Enforcer>) {
  return post("/api/add-enforcer", enforcer);
}

export function updateEnforcer(owner: string, name: string, enforcer: Partial<Enforcer>) {
  return post(idQuery("/api/update-enforcer", owner, name), enforcer);
}

export function deleteEnforcer(enforcer: Partial<Enforcer>) {
  return post("/api/delete-enforcer", enforcer);
}
