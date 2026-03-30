import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { AuditRecord } from "../types";

export function getRecords(params: ListParams & { organizationName?: string }) {
  const { owner, ...rest } = params;
  return get<AuditRecord[]>(qs("/api/get-records", { organizationName: params.organizationName, ...rest })) as Promise<PaginatedResponse<AuditRecord>>;
}
