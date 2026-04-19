import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Syncer } from "../types";

export function getSyncers(params: ListParams & { organization?: string }) {
  return get<Syncer[]>(qs("/api/get-syncers", params)) as Promise<PaginatedResponse<Syncer>>;
}

export function getSyncer(owner: string, name: string) {
  return get<Syncer>(idQuery("/api/get-syncer", owner, name));
}

export function addSyncer(syncer: Partial<Syncer>) {
  return post("/api/add-syncer", syncer);
}

export function updateSyncer(owner: string, name: string, syncer: Partial<Syncer>) {
  return post(idQuery("/api/update-syncer", owner, name), syncer);
}

export function deleteSyncer(syncer: Partial<Syncer>) {
  return post("/api/delete-syncer", syncer);
}

export function testSyncerDb(syncer: Partial<Syncer>) {
  return post("/api/test-syncer-db", syncer);
}

export function runSyncer(owner: string, name: string) {
  return get(idQuery("/api/run-syncer", owner, name));
}
