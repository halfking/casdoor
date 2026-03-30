import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Site } from "../types";

export function getGlobalSites() {
  return get<Site[]>("/api/get-global-sites");
}

export function getSites(params: ListParams) {
  return get<Site[]>(qs("/api/get-sites", params)) as Promise<PaginatedResponse<Site>>;
}

export function getSite(owner: string, name: string) {
  return get<Site>(idQuery("/api/get-site", owner, name));
}

export function addSite(site: Partial<Site>) {
  return post("/api/add-site", site);
}

export function updateSite(owner: string, name: string, site: Partial<Site>) {
  return post(idQuery("/api/update-site", owner, name), site);
}

export function deleteSite(site: Partial<Site>) {
  return post("/api/delete-site", site);
}
