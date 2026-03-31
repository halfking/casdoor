import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Webhook } from "../types";

export function getWebhooks(params: ListParams & { organization?: string }) {
  return get<Webhook[]>(qs("/api/get-webhooks", params)) as Promise<PaginatedResponse<Webhook>>;
}

export function getWebhook(owner: string, name: string) {
  return get<Webhook>(idQuery("/api/get-webhook", owner, name));
}

export function addWebhook(webhook: Partial<Webhook>) {
  return post("/api/add-webhook", webhook);
}

export function updateWebhook(owner: string, name: string, webhook: Partial<Webhook>) {
  return post(idQuery("/api/update-webhook", owner, name), webhook);
}

export function deleteWebhook(webhook: Partial<Webhook>) {
  return post("/api/delete-webhook", webhook);
}
