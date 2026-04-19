import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Organization } from "../types";

export function getOrganizations(params: ListParams & { organizationName?: string }) {
  return get<Organization[]>(qs("/api/get-organizations", params)) as Promise<PaginatedResponse<Organization>>;
}

export function getOrganization(owner: string, name: string) {
  return get<Organization>(idQuery("/api/get-organization", owner, name));
}

export function addOrganization(org: Partial<Organization>) {
  return post("/api/add-organization", org);
}

export function updateOrganization(owner: string, name: string, org: Partial<Organization>) {
  return post(idQuery("/api/update-organization", owner, name), org);
}

export function deleteOrganization(org: Partial<Organization>) {
  return post("/api/delete-organization", org);
}

export function getDefaultApplication(owner: string, name: string) {
  return get(idQuery("/api/get-default-application", owner, name));
}

export function getOrganizationNames(owner: string) {
  return get<Organization[]>(`/api/get-organization-names?owner=${encodeURIComponent(owner)}`);
}
