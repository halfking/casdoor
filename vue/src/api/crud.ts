import request from "./request";
import {buildIdUrl, buildUrl, cloneBody, type QueryValue} from "./common";
import type {ApiResponse} from "./types";

export function getList<T>(path: string, params: Record<string, QueryValue> = {}) {
  return request.get<ApiResponse<T[]>>(buildUrl(path, params));
}

export function getOne<T>(path: string, owner: string, name: string, params: Record<string, QueryValue> = {}) {
  return request.get<ApiResponse<T>>(buildIdUrl(path, owner, name, params));
}

export function postJson<T = unknown>(path: string, body?: unknown, params: Record<string, QueryValue> = {}) {
  return request.post<ApiResponse<T>>(buildUrl(path, params), body);
}

export function updateEntity<T>(path: string, owner: string, name: string, body: T) {
  return request.post<ApiResponse>(buildIdUrl(path, owner, name), cloneBody(body));
}

export function addEntity<T>(path: string, body: T) {
  return request.post<ApiResponse>(path, cloneBody(body));
}

export function deleteEntity<T>(path: string, body: T, params: Record<string, QueryValue> = {}) {
  return request.post<ApiResponse>(buildUrl(path, params), cloneBody(body));
}
