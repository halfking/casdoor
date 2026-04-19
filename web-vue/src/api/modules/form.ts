import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";
import type { Form } from "../types";

export function getGlobalForms() {
  return get<Form[]>("/api/get-global-forms");
}

export function getForms(params: ListParams) {
  return get<Form[]>(qs("/api/get-forms", params)) as Promise<PaginatedResponse<Form>>;
}

export function getForm(owner: string, name: string) {
  return get<Form>(idQuery("/api/get-form", owner, name));
}

export function addForm(form: Partial<Form>) {
  return post("/api/add-form", form);
}

export function updateForm(owner: string, name: string, form: Partial<Form>) {
  return post(idQuery("/api/update-form", owner, name), form);
}

export function deleteForm(form: Partial<Form>) {
  return post("/api/delete-form", form);
}
