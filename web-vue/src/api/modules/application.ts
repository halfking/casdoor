import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Application, Organization } from "../types";

export function getApplications(params: ListParams) {
  return get<Application[]>(qs("/api/get-applications", params)) as Promise<PaginatedResponse<Application>>;
}

export function getApplicationsByOrganization(
  owner: string,
  organization: string,
  params: Omit<ListParams, "owner">
) {
  return get<Application[]>(qs("/api/get-organization-applications", { owner, organization, ...params })) as Promise<PaginatedResponse<Application>>;
}

export function getApplication(owner: string, name: string) {
  return get<Application>(idQuery("/api/get-application", owner, name));
}

export function getUserApplication(owner: string, name: string) {
  return get<Application>(idQuery("/api/get-user-application", owner, name));
}

export function addApplication(application: Partial<Application>) {
  return post("/api/add-application", application);
}

export function updateApplication(owner: string, name: string, application: Partial<Application>) {
  return post(idQuery("/api/update-application", owner, name), application);
}

export function deleteApplication(application: Partial<Application>) {
  return post("/api/delete-application", application);
}

export function getDefaultApplication(owner: string, name: string) {
  return get<Application>(idQuery("/api/get-default-application", owner, name));
}

/** Returns SAML metadata as plain text */
export function getSamlMetadata(owner: string, name: string, enablePostBinding?: boolean) {
  const url = `/api/saml/metadata?application=${encodeURIComponent(owner)}/${encodeURIComponent(name)}${enablePostBinding ? "&enablePostBinding=true" : ""}`;
  return get<string>(url);
}
