import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Subscription } from "../types";

export function getSubscriptions(params: ListParams) {
  return get<Subscription[]>(qs("/api/get-subscriptions", params)) as Promise<PaginatedResponse<Subscription>>;
}

export function getSubscription(owner: string, name: string) {
  return get<Subscription>(idQuery("/api/get-subscription", owner, name));
}

export function addSubscription(subscription: Partial<Subscription>) {
  return post("/api/add-subscription", subscription);
}

export function updateSubscription(owner: string, name: string, subscription: Partial<Subscription>) {
  return post(idQuery("/api/update-subscription", owner, name), subscription);
}

export function deleteSubscription(subscription: Partial<Subscription>) {
  return post("/api/delete-subscription", subscription);
}
