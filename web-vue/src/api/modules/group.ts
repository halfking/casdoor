import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Group } from "../types";

export function getGroups(params: ListParams & { withTree?: boolean }) {
  return get<Group[]>(qs("/api/get-groups", params)) as Promise<PaginatedResponse<Group>>;
}

export function getGroup(owner: string, name: string) {
  return get<Group>(idQuery("/api/get-group", owner, name));
}

export function addGroup(group: Partial<Group>) {
  return post("/api/add-group", group);
}

export function updateGroup(owner: string, name: string, group: Partial<Group>) {
  return post(idQuery("/api/update-group", owner, name), group);
}

export function deleteGroup(group: Partial<Group>) {
  return post("/api/delete-group", group);
}
