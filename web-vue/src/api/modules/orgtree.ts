import { get, post, put } from "@/api/base";

export interface OrgTreeNode {
  id: number;
  parentId: number;
  displayName: string;
  orgType: string;
  orgName: string;
}

export async function getOrgTrees() {
  return get<OrgTreeNode[]>("/api/get-org-trees");
}

export async function addOrgTree(data: Partial<OrgTreeNode>) {
  return post("/api/add-org-tree", data);
}

export async function updateOrgTree(data: Partial<OrgTreeNode>) {
  return put("/api/update-org-tree", data);
}

export async function deleteOrgTree(id: number) {
  return post(`/api/delete-org-tree?id=${id}`, null);
}
