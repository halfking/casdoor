import { get } from "../base";

export function getSystemInfo() {
  return get("/api/get-system-info");
}

export function getVersionInfo() {
  return get("/api/get-version-info");
}

export function getPrometheusInfo() {
  return get("/api/get-prometheus-info");
}
