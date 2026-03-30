import { get, qs } from "../base";
import type { DashboardMapItem } from "../types";

export function getDashboard(owner: string) {
  return get<DashboardMapItem[]>(qs("/api/get-dashboard", { owner }));
}
