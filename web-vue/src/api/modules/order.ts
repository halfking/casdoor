import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Order, ProductInfo } from "../types";

export function getOrders(params: ListParams) {
  return get<Order[]>(qs("/api/get-orders", params)) as Promise<PaginatedResponse<Order>>;
}

export function getUserOrders(owner: string, user: string) {
  return get<Order[]>(qs("/api/get-user-orders", { owner, user } as Record<string, string>));
}

export function getOrder(owner: string, name: string) {
  return get<Order>(idQuery("/api/get-order", owner, name));
}

export function addOrder(order: Partial<Order>) {
  return post("/api/add-order", order);
}

export function updateOrder(owner: string, name: string, order: Partial<Order>) {
  return post(idQuery("/api/update-order", owner, name), order);
}

export function deleteOrder(order: Partial<Order>) {
  return post("/api/delete-order", order);
}

export function payOrder(owner: string, name: string, providerName: string, paymentEnv: string) {
  return post(`${idQuery("/api/pay-order", owner, name)}&providerName=${encodeURIComponent(providerName)}&paymentEnv=${encodeURIComponent(paymentEnv)}`);
}

export function placeOrder(owner: string, productInfos: ProductInfo[], userName: string) {
  return post(
    `/api/place-order?owner=${encodeURIComponent(owner)}&userName=${encodeURIComponent(userName)}`,
    { productInfos }
  );
}

export function cancelOrder(owner: string, name: string) {
  return post(idQuery("/api/cancel-order", owner, name));
}
