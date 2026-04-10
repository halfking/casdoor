import { get, post } from "@/api/request";

export async function getPositions(params) {
  return get("/api/get-positions", { params });
}

export async function getPosition(id) {
  return get("/api/get-position", { params: { id } });
}

export async function addPosition(data) {
  return post("/api/add-position", data);
}

export async function updatePosition(data) {
  return post("/api/update-position", data);
}

export async function deletePosition(id) {
  return post(`/api/delete-position?id=${id}`, null);
}
