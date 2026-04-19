import { get, post, put, qs, type PaginatedResponse, type ListParams } from "../base";

export interface WorkflowStep {
  order: number;
  role: string;
  action: string;
  timeout_hours: number;
}

export interface Workflow {
  id?: number;
  name: string;
  displayName?: string;
  description?: string;
  department?: string;
  steps?: WorkflowStep[];
  createdTime?: string;
  updatedTime?: string;
}

export interface WorkflowExecution {
  id?: number;
  workflowId: number;
  taskId?: string;
  applicant?: string;
  status?: "pending" | "approved" | "rejected";
  currentStep?: number;
  context?: Record<string, unknown>;
  createdTime?: string;
  updatedTime?: string;
}

export function getWorkflows(params: ListParams) {
  return get<Workflow[]>(qs("/api/get-workflows", params)) as Promise<PaginatedResponse<Workflow>>;
}

export function getWorkflow(id: number | string) {
  return get<Workflow>(`/api/get-workflow?id=${Number(id)}`);
}

export function addWorkflow(workflow: Partial<Workflow>) {
  return post("/api/add-workflow", workflow);
}

export function updateWorkflow(workflow: Partial<Workflow>) {
  return put("/api/update-workflow", workflow);
}

export function deleteWorkflow(id: number | string) {
  return post(`/api/delete-workflow?id=${Number(id)}`, null);
}

export function getWorkflowExecutions(params: ListParams) {
  return get<WorkflowExecution[]>(qs("/api/get-workflow-executions", params)) as Promise<PaginatedResponse<WorkflowExecution>>;
}

export function addWorkflowExecution(execution: Partial<WorkflowExecution>) {
  return post("/api/add-workflow-execution", execution);
}

export function updateWorkflowExecution(execution: Partial<WorkflowExecution>) {
  return put("/api/update-workflow-execution", execution);
}
