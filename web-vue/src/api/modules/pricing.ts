import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Pricing } from "../types";

export function getPricings(params: ListParams) {
  return get<Pricing[]>(qs("/api/get-pricings", params)) as Promise<PaginatedResponse<Pricing>>;
}

export function getPricing(owner: string, name: string) {
  return get<Pricing>(idQuery("/api/get-pricing", owner, name));
}

export function addPricing(pricing: Partial<Pricing>) {
  return post("/api/add-pricing", pricing);
}

export function updatePricing(owner: string, name: string, pricing: Partial<Pricing>) {
  return post(idQuery("/api/update-pricing", owner, name), pricing);
}

export function deletePricing(pricing: Partial<Pricing>) {
  return post("/api/delete-pricing", pricing);
}
