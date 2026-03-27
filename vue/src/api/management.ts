import type { ApiResponse } from "@/types/management";
import { buildQuery, requestJson } from "@/api/client";
import { deepClone } from "@/utils/management";

type Entity = Record<string, unknown>;

function getJson<T>(path: string, params: Record<string, unknown>) {
  return requestJson<T>(`${path}?${buildQuery(params)}`);
}

function postJson<T>(path: string, body?: Entity) {
  return requestJson<T>(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export const organizationApi = {
  list: (owner: string, organizationName = "", p = 1, pageSize = 10, field = "", value = "", sortField = "", sortOrder = "") =>
    getJson<ApiResponse<Entity[]>>("/api/get-organizations", { owner, organizationName, p, pageSize, field, value, sortField, sortOrder }),
  names: (owner: string) => getJson<ApiResponse<Entity[]>>("/api/get-organization-names", { owner }),
  get: (owner: string, name: string) => getJson<ApiResponse<Entity>>("/api/get-organization", { id: `${owner}/${encodeURIComponent(name)}` }),
  add: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/add-organization", deepClone(entity)),
  update: (owner: string, name: string, entity: Entity) =>
    requestJson<ApiResponse<unknown>>(`/api/update-organization?${buildQuery({ id: `${owner}/${encodeURIComponent(name)}` })}`, {
      method: "POST",
      body: JSON.stringify(deepClone(entity)),
    }),
  remove: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/delete-organization", deepClone(entity)),
};

export const userApi = {
  list: (owner: string, p = 1, pageSize = 10, field = "", value = "", sortField = "", sortOrder = "", groupName = "") =>
    getJson<ApiResponse<Entity[]>>("/api/get-users", { owner, p, pageSize, field, value, sortField, sortOrder, groupName }),
  global: (p = 1, pageSize = 10, field = "", value = "", sortField = "", sortOrder = "") =>
    getJson<ApiResponse<Entity[]>>("/api/get-global-users", { p, pageSize, field, value, sortField, sortOrder }),
  get: (owner: string, name: string) => getJson<ApiResponse<Entity>>("/api/get-user", { id: `${owner}/${encodeURIComponent(name)}` }),
  add: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/add-user", deepClone(entity)),
  update: (owner: string, name: string, entity: Entity) =>
    requestJson<ApiResponse<unknown>>(`/api/update-user?${buildQuery({ id: `${owner}/${encodeURIComponent(name)}` })}`, {
      method: "POST",
      body: JSON.stringify(deepClone(entity)),
    }),
  remove: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/delete-user", deepClone(entity)),
};

export const applicationApi = {
  list: (owner: string, p = 1, pageSize = 10, field = "", value = "", sortField = "", sortOrder = "") =>
    getJson<ApiResponse<Entity[]>>("/api/get-applications", { owner, p, pageSize, field, value, sortField, sortOrder }),
  byOrganization: (owner: string, organization: string, p = 1, pageSize = 10, field = "", value = "", sortField = "", sortOrder = "") =>
    getJson<ApiResponse<Entity[]>>("/api/get-organization-applications", { owner, organization, p, pageSize, field, value, sortField, sortOrder }),
  get: (owner: string, name: string) => getJson<ApiResponse<Entity>>("/api/get-application", { id: `${owner}/${encodeURIComponent(name)}` }),
  add: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/add-application", deepClone(entity)),
  update: (owner: string, name: string, entity: Entity) =>
    requestJson<ApiResponse<unknown>>(`/api/update-application?${buildQuery({ id: `${owner}/${encodeURIComponent(name)}` })}`, {
      method: "POST",
      body: JSON.stringify(deepClone(entity)),
    }),
  remove: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/delete-application", deepClone(entity)),
};

export const roleApi = {
  list: (owner: string, p = 1, pageSize = 10, field = "", value = "", sortField = "", sortOrder = "") =>
    getJson<ApiResponse<Entity[]>>("/api/get-roles", { owner, p, pageSize, field, value, sortField, sortOrder }),
  get: (owner: string, name: string) => getJson<ApiResponse<Entity>>("/api/get-role", { id: `${owner}/${encodeURIComponent(name)}` }),
  add: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/add-role", deepClone(entity)),
  update: (owner: string, name: string, entity: Entity) =>
    requestJson<ApiResponse<unknown>>(`/api/update-role?${buildQuery({ id: `${owner}/${encodeURIComponent(name)}` })}`, {
      method: "POST",
      body: JSON.stringify(deepClone(entity)),
    }),
  remove: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/delete-role", deepClone(entity)),
};

export const permissionApi = {
  list: (owner: string, p = 1, pageSize = 10, field = "", value = "", sortField = "", sortOrder = "") =>
    getJson<ApiResponse<Entity[]>>("/api/get-permissions", { owner, p, pageSize, field, value, sortField, sortOrder }),
  get: (owner: string, name: string) => getJson<ApiResponse<Entity>>("/api/get-permission", { id: `${owner}/${encodeURIComponent(name)}` }),
  add: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/add-permission", deepClone(entity)),
  update: (owner: string, name: string, entity: Entity) =>
    requestJson<ApiResponse<unknown>>(`/api/update-permission?${buildQuery({ id: `${owner}/${encodeURIComponent(name)}` })}`, {
      method: "POST",
      body: JSON.stringify(deepClone(entity)),
    }),
  remove: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/delete-permission", deepClone(entity)),
};

export const modelApi = {
  list: (owner: string, p = 1, pageSize = 10, field = "", value = "", sortField = "", sortOrder = "") =>
    getJson<ApiResponse<Entity[]>>("/api/get-models", { owner, p, pageSize, field, value, sortField, sortOrder }),
  get: (owner: string, name: string) => getJson<ApiResponse<Entity>>("/api/get-model", { id: `${owner}/${encodeURIComponent(name)}` }),
  add: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/add-model", deepClone(entity)),
  update: (owner: string, name: string, entity: Entity) =>
    requestJson<ApiResponse<unknown>>(`/api/update-model?${buildQuery({ id: `${owner}/${encodeURIComponent(name)}` })}`, {
      method: "POST",
      body: JSON.stringify(deepClone(entity)),
    }),
  remove: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/delete-model", deepClone(entity)),
};

export const providerApi = {
  list: (owner: string, p = 1, pageSize = 10, field = "", value = "", sortField = "", sortOrder = "") =>
    getJson<ApiResponse<Entity[]>>("/api/get-providers", { owner, p, pageSize, field, value, sortField, sortOrder }),
  global: (p = 1, pageSize = 10, field = "", value = "", sortField = "", sortOrder = "") =>
    getJson<ApiResponse<Entity[]>>("/api/get-global-providers", { p, pageSize, field, value, sortField, sortOrder }),
  get: (owner: string, name: string) => getJson<ApiResponse<Entity>>("/api/get-provider", { id: `${owner}/${encodeURIComponent(name)}` }),
  add: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/add-provider", deepClone(entity)),
  update: (owner: string, name: string, entity: Entity) =>
    requestJson<ApiResponse<unknown>>(`/api/update-provider?${buildQuery({ id: `${owner}/${encodeURIComponent(name)}` })}`, {
      method: "POST",
      body: JSON.stringify(deepClone(entity)),
    }),
  remove: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/delete-provider", deepClone(entity)),
};

export const groupApi = {
  list: (owner = "", withTree = false, p = 1, pageSize = 10, field = "", value = "", sortField = "", sortOrder = "") =>
    getJson<ApiResponse<Entity[]>>("/api/get-groups", { owner, withTree, p, pageSize, field, value, sortField, sortOrder }),
  get: (owner: string, name: string) => getJson<ApiResponse<Entity>>("/api/get-group", { id: `${owner}/${encodeURIComponent(name)}` }),
  add: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/add-group", deepClone(entity)),
  update: (owner: string, name: string, entity: Entity) =>
    requestJson<ApiResponse<unknown>>(`/api/update-group?${buildQuery({ id: `${owner}/${encodeURIComponent(name)}` })}`, {
      method: "POST",
      body: JSON.stringify(deepClone(entity)),
    }),
  remove: (entity: Entity) => postJson<ApiResponse<unknown>>("/api/delete-group", deepClone(entity)),
};
