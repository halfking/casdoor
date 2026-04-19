import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Menu } from "../types";

export function getMenus(params: ListParams & { withTree?: boolean; application?: string }) {
  return get<Menu[]>(qs("/api/get-menus", params)) as Promise<PaginatedResponse<Menu>>;
}

export function getMenu(owner: string, name: string) {
  return get<Menu>(idQuery("/api/get-menu", owner, name));
}

export function addMenu(menu: Partial<Menu>) {
  return post("/api/add-menu", menu);
}

export function updateMenu(owner: string, name: string, menu: Partial<Menu>) {
  return post(idQuery("/api/update-menu", owner, name), menu);
}

export function deleteMenu(menu: Partial<Menu>) {
  return post("/api/delete-menu", menu);
}
