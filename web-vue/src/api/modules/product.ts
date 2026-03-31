import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Product } from "../types";

export function getProducts(params: ListParams) {
  return get<Product[]>(qs("/api/get-products", params)) as Promise<PaginatedResponse<Product>>;
}

export function getProduct(owner: string, name: string) {
  return get<Product>(idQuery("/api/get-product", owner, name));
}

export function addProduct(product: Partial<Product>) {
  return post("/api/add-product", product);
}

export function updateProduct(owner: string, name: string, product: Partial<Product>) {
  return post(idQuery("/api/update-product", owner, name), product);
}

export function deleteProduct(product: Partial<Product>) {
  return post("/api/delete-product", product);
}
