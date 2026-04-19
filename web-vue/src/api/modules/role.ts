import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Role } from "../types";

export function getRoles(params: ListParams) {
  return get<Role[]>(qs("/api/get-roles", params)) as Promise<PaginatedResponse<Role>>;
}

export function getRole(owner: string, name: string) {
  return get<Role>(idQuery("/api/get-role", owner, name));
}

export function addRole(role: Partial<Role>) {
  return post("/api/add-role", role);
}

export function updateRole(owner: string, name: string, role: Partial<Role>) {
  return post(idQuery("/api/update-role", owner, name), role);
}

export function deleteRole(role: Partial<Role>) {
  return post("/api/delete-role", role);
}
