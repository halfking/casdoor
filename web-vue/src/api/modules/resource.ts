import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Resource } from "../types";

export function getResources(owner: string, user: string, params?: Omit<ListParams, "owner">) {
  return get<Resource[]>(qs("/api/get-resources", { owner, user, ...params })) as Promise<PaginatedResponse<Resource>>;
}

export function getResource(owner: string, name: string) {
  return get<Resource>(idQuery("/api/get-resource", owner, name));
}

export function addResource(resource: Partial<Resource>) {
  return post("/api/add-resource", resource);
}

export function updateResource(owner: string, name: string, resource: Partial<Resource>) {
  return post(idQuery("/api/update-resource", owner, name), resource);
}

export function deleteResource(resource: Partial<Resource>, provider?: string) {
  const url = provider ? `/api/delete-resource?provider=${encodeURIComponent(provider)}` : "/api/delete-resource";
  return post(url, resource);
}

export function uploadResource(
  owner: string,
  user: string,
  tag: string,
  parent: string,
  fullFilePath: string,
  file: File,
  provider?: string
) {
  const params = new URLSearchParams({
    owner,
    user,
    application: "app-built-in",
    tag,
    parent,
    fullFilePath,
  });
  if (provider) params.set("provider", provider);

  const fd = new FormData();
  fd.append("file", file);

  return post(`/api/upload-resource?${params.toString()}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
