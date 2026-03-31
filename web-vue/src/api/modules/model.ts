import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { CasbinModel } from "../types";

export function getModels(params: ListParams) {
  return get<CasbinModel[]>(qs("/api/get-models", params)) as Promise<PaginatedResponse<CasbinModel>>;
}

export function getModel(owner: string, name: string) {
  return get<CasbinModel>(idQuery("/api/get-model", owner, name));
}

export function addModel(model: Partial<CasbinModel>) {
  return post("/api/add-model", model);
}

export function updateModel(owner: string, name: string, model: Partial<CasbinModel>) {
  return post(idQuery("/api/update-model", owner, name), model);
}

export function deleteModel(model: Partial<CasbinModel>) {
  return post("/api/delete-model", model);
}
