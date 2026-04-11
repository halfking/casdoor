import { get, post } from "../base";

export interface OrgTreeNode {
  id: number;
  parentId?: number;
  displayName: string;
  orgType?: string;
  orgName?: string;
  name?: string;
  description?: string;
  sortOrder?: number;
  createdTime?: string;
  updatedTime?: string;
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
