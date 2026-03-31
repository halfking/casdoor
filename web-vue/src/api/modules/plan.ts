import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Plan } from "../types";

export function getPlans(params: ListParams) {
  return get<Plan[]>(qs("/api/get-plans", params)) as Promise<PaginatedResponse<Plan>>;
}

export function getPlan(owner: string, name: string, includeOption?: boolean) {
  const url = idQuery("/api/get-plan", owner, name) + (includeOption ? "&includeOption=true" : "");
  return get<Plan>(url);
}

export function addPlan(plan: Partial<Plan>) {
  return post("/api/add-plan", plan);
}

export function updatePlan(owner: string, name: string, plan: Partial<Plan>) {
  return post(idQuery("/api/update-plan", owner, name), plan);
}

export function deletePlan(plan: Partial<Plan>) {
  return post("/api/delete-plan", plan);
}
