import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Permission } from "../types";

export function getPermissions(params: ListParams) {
  return get<Permission[]>(qs("/api/get-permissions", params)) as Promise<PaginatedResponse<Permission>>;
}

export function getPermissionsBySubmitter() {
  return get<Permission[]>("/api/get-permissions-by-submitter");
}

export function getPermission(owner: string, name: string) {
  return get<Permission>(idQuery("/api/get-permission", owner, name));
}

export function addPermission(permission: Partial<Permission>) {
  return post("/api/add-permission", permission);
}

export function updatePermission(owner: string, name: string, permission: Partial<Permission>) {
  return post(idQuery("/api/update-permission", owner, name), permission);
}

export function deletePermission(permission: Partial<Permission>) {
  return post("/api/delete-permission", permission);
}
