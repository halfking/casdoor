import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Department } from "../types";

export function getDepartments(params: ListParams & { withTree?: boolean }) {
  return get<Department[]>(qs("/api/get-departments", params)) as Promise<PaginatedResponse<Department>>;
}

export function getDepartment(owner: string, name: string) {
  return get<Department>(idQuery("/api/get-department", owner, name));
}

export function addDepartment(department: Partial<Department>) {
  return post("/api/add-department", department);
}

export function updateDepartment(owner: string, name: string, department: Partial<Department>) {
  return post(idQuery("/api/update-department", owner, name), department);
}

export function deleteDepartment(department: Partial<Department>) {
  return post("/api/delete-department", department);
}
