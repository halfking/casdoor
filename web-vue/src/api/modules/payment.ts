import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Payment } from "../types";

export function getPayments(params: ListParams) {
  return get<Payment[]>(qs("/api/get-payments", params)) as Promise<PaginatedResponse<Payment>>;
}

export function getPayment(owner: string, name: string) {
  return get<Payment>(idQuery("/api/get-payment", owner, name));
}

export function addPayment(payment: Partial<Payment>) {
  return post("/api/add-payment", payment);
}

export function updatePayment(owner: string, name: string, payment: Partial<Payment>) {
  return post(idQuery("/api/update-payment", owner, name), payment);
}

export function deletePayment(payment: Partial<Payment>) {
  return post("/api/delete-payment", payment);
}

export function invoicePayment(owner: string, name: string) {
  return post(idQuery("/api/invoice-payment", owner, name));
}

export function notifyPayment(owner: string, name: string) {
  return post(`/api/notify-payment/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`);
}
