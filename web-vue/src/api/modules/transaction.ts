import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Transaction } from "../types";

export function getTransactions(params: ListParams) {
  return get<Transaction[]>(qs("/api/get-transactions", params)) as Promise<PaginatedResponse<Transaction>>;
}

export function getTransaction(owner: string, name: string) {
  return get<Transaction>(idQuery("/api/get-transaction", owner, name));
}

export function addTransaction(transaction: Partial<Transaction>) {
  return post("/api/add-transaction", transaction);
}

export function updateTransaction(owner: string, name: string, transaction: Partial<Transaction>) {
  return post(idQuery("/api/update-transaction", owner, name), transaction);
}

export function deleteTransaction(transaction: Partial<Transaction>) {
  return post("/api/delete-transaction", transaction);
}
