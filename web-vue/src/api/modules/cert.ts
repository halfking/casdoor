import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Cert } from "../types";

export function getCerts(params: ListParams) {
  return get<Cert[]>(qs("/api/get-certs", params)) as Promise<PaginatedResponse<Cert>>;
}

export function getGlobalCerts(params: Omit<ListParams, "owner">) {
  return get<Cert[]>(qs("/api/get-global-certs", params)) as Promise<PaginatedResponse<Cert>>;
}

export function getCert(owner: string, name: string) {
  return get<Cert>(idQuery("/api/get-cert", owner, name));
}

export function addCert(cert: Partial<Cert>) {
  return post("/api/add-cert", cert);
}

export function updateCert(owner: string, name: string, cert: Partial<Cert>) {
  return post(idQuery("/api/update-cert", owner, name), cert);
}

export function deleteCert(cert: Partial<Cert>) {
  return post("/api/delete-cert", cert);
}

export function refreshDomainExpire(owner: string, name: string) {
  return post(idQuery("/api/update-cert-domain-expire", owner, name));
}
