import { get, post, put } from "@/api/request";
import type { Tenant } from "./tenant";
import type { OrgTemplate } from "./orgTemplate";

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
  tenantId?: string; // 租户ID
}

export interface TenantInfo {
  tenantId: string;
  displayName: string;
}

export interface OrgTreeTemplateNode {
  displayName: string;
  orgType: string;
  code: string;
  leader: string;
  children?: OrgTreeTemplateNode[];
}

export interface OrgTreeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodes: OrgTreeTemplateNode[];
}

// Re-export types for external use
export type { Tenant, OrgTemplate };

export async function getOrgTrees(tenantId?: string) {
  const params = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
  return get<OrgTreeNode[]>(`/api/get-org-trees${params}`);
}

export async function getTenantList() {
  // Returns Tenant[] from tenant table, with tenantId as value
  return get<Tenant[]>("/api/get-tenants");
}

export async function getOrgTreeTemplates() {
  // Returns OrgTemplate[] from database
  return get<OrgTemplate[]>("/api/get-org-templates");
}

export async function applyOrgTreeTemplate(templateId: string, targetParentId: number, tenantId?: string) {
  let url = `/api/apply-org-tree-template?templateId=${encodeURIComponent(templateId)}&targetParentId=${targetParentId}`;
  if (tenantId) {
    url += `&tenantId=${encodeURIComponent(tenantId)}`;
  }
  return post<number[]>(url, null);
}

export async function copyOrgTreeSubtree(sourceNodeId: number, targetParentId: number, tenantId?: string) {
  let url = `/api/copy-org-tree-subtree?sourceNodeId=${sourceNodeId}&targetParentId=${targetParentId}`;
  if (tenantId) {
    url += `&tenantId=${encodeURIComponent(tenantId)}`;
  }
  return post<number[]>(url, null);
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
