import { get, post, type ListParams } from "@/api/base";

export interface PositionRecord {
  id: number;
  roleOwner: string;
  roleName: string;
  code?: string; // 编码，用于与 Post.code 匹配
  fullDescription: string;
  department?: string;
  systemPrompt: string;
  requirements: string;
  skills: string;
  reportsTo: string;
  impliedRole?: string;
}

export type PositionPayload = Omit<PositionRecord, "id" | "impliedRole"> & { id?: number | string };
export type PositionListParams = ListParams & { department?: string };

function normalizeParams(params?: PositionListParams): Record<string, string | number | boolean> | undefined {
  if (!params) {
    return undefined;
  }

  const normalized: Record<string, string | number | boolean> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      normalized[key] = value;
    }
  });

  return normalized;
}

export function getPositions(params?: PositionListParams) {
  return get<PositionRecord[]>("/api/get-positions", normalizeParams(params));
}

export function getPosition(id: number | string) {
  return get<PositionRecord>("/api/get-position", { id: Number(id) });
}

export function addPosition(data: PositionPayload) {
  return post<boolean>("/api/add-position", data);
}

export function updatePosition(data: PositionPayload) {
  return post<boolean>("/api/update-position", data);
}

export function deletePosition(id: number | string) {
  return post<boolean>(`/api/delete-position?id=${id}`, null);
}
