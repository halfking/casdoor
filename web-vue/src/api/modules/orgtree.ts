import { get, post } from "@/api/request";

export interface OrgTreeNode {
  id: number;
  parentId: number;
  displayName: string;
  orgType: string;
  orgName: string;
  casdoorOrgName?: string;
  level?: number;
  sortOrder?: number;
  code?: string;   // 编码，用于与 Department.code 匹配
  leader?: string; // 负责人
}

export async function getOrgTrees() {
  return get<OrgTreeNode[]>("/api/get-org-trees");
}

export async function addOrgTree(data: Partial<OrgTreeNode>) {
  return post("/api/add-org-tree", data);
}

export async function updateOrgTree(data: Partial<OrgTreeNode>) {
  return post("/api/update-org-tree", data);
}

export async function deleteOrgTree(id: number) {
  return post(`/api/delete-org-tree?id=${id}`, null);
}
