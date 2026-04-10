import { doGet, doPost, doPut } from "@/api/request";

export async function getPositions(params) {
  return doGet("/api/get-positions", { params });
}

export async function getPosition(id) {
  return doGet("/api/get-position", { params: { id } });
}

export async function addPosition(data) {
  return doPost("/api/add-position", data);
}

export async function updatePosition(data) {
  return doPut("/api/update-position", data);
}

export async function deletePosition(id) {
  return doPost("/api/delete-position", null, { params: { id } });
}
