import { get, post, type ApiResponse, type PaginatedResponse } from "./request";

// ---------- Common query-param interfaces ----------

export interface ListParams {
  owner?: string;
  page?: number;
  pageSize?: number;
  field?: string;
  value?: string;
  sortField?: string;
  sortOrder?: string;
  [key: string]: string | number | boolean | undefined;
}

/** Build query string from ListParams + optional extras. Maps `page` → `p` to match Go backend. */
export function qs(
  path: string,
  params: ListParams & Record<string, string | number | boolean | undefined>
): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    const key = k === "page" ? "p" : k;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? `${path}?${parts.join("&")}` : path;
}

/** Shortcut for id=owner/name query */
export function idQuery(path: string, owner: string, name: string): string {
  return `${path}?id=${encodeURIComponent(`${owner}/${name}`)}`;
}

export { get, post, type ApiResponse, type PaginatedResponse };
