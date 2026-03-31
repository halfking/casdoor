import { get, post, idQuery } from "../base";
import type { Ldap } from "../types";

export function getLdaps(owner: string) {
  return get<Ldap[]>(`/api/get-ldaps?owner=${encodeURIComponent(owner)}`);
}

export function getLdap(owner: string, name: string) {
  return get<Ldap>(idQuery("/api/get-ldap", owner, name));
}

export function addLdap(ldap: Partial<Ldap>) {
  return post("/api/add-ldap", ldap);
}

export function updateLdap(ldap: Partial<Ldap>) {
  return post("/api/update-ldap", ldap);
}

export function deleteLdap(ldap: Partial<Ldap>) {
  return post("/api/delete-ldap", ldap);
}

export function getLdapUsers(owner: string, name: string) {
  return get<unknown[]>(idQuery("/api/get-ldap-users", owner, name));
}

export function syncLdapUsers(owner: string, name: string, users: unknown[]) {
  return post(idQuery("/api/sync-ldap-users", owner, name), users);
}
