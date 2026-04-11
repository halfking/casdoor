import { get, post } from "../base";
import type { ListParams } from "../base";

export interface Position {
  id: number;
  roleOwner?: string;
  roleName?: string;
  fullDescription?: string;
  skills?: string;
  requirements?: string;
  systemPrompt?: string;
  department?: string;
  reportsTo?: string;
  impliedRole?: string;
  metadata?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getPositions(params?: ListParams) {
  return get<Position[]>("/api/get-positions", params);
}

export async function getPosition(id: number) {
  return get<Position>(`/api/get-position?id=${id}`);
}

export async function addPosition(data: Partial<Position>) {
  return post("/api/add-position", data);
}

export async function updatePosition(data: Partial<Position>) {
  return post("/api/update-position", data);
}

export async function deletePosition(id: number) {
  return post(`/api/delete-position?id=${id}`, null);
}
