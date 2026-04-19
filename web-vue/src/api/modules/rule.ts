import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Rule } from "../types";

export function getRules(params: ListParams) {
  return get<Rule[]>(qs("/api/get-rules", params)) as Promise<PaginatedResponse<Rule>>;
}

export function getRule(owner: string, name: string) {
  return get<Rule>(idQuery("/api/get-rule", owner, name));
}

export function addRule(rule: Partial<Rule>) {
  return post("/api/add-rule", rule);
}

export function updateRule(owner: string, name: string, rule: Partial<Rule>) {
  return post(idQuery("/api/update-rule", owner, name), rule);
}

export function deleteRule(rule: Partial<Rule>) {
  return post("/api/delete-rule", rule);
}
