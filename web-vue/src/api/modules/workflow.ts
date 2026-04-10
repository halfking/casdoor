import { get, post, qs, idQuery, type PaginatedResponse, type ListParams } from "../base";

export interface WorkflowStep {
  order: number;
  role: string;
  action: string;
  timeout_hours: number;
}

export interface Workflow {
  owner: string;
  name: string;
  displayName?: string;
  description?: string;
  department?: string;
  steps?: WorkflowStep[];
  createdTime?: string;
  updatedTime?: string;
}

export interface WorkflowExecution {
  owner: string;
  name: string;
  workflow: string;
  workflowDisplayName?: string;
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

export function getWorkflow(owner: string, name: string) {
  return get<Workflow>(idQuery("/api/get-workflow", owner, name));
}

export function addWorkflow(workflow: Partial<Workflow>) {
  return post("/api/add-workflow", workflow);
}

export function updateWorkflow(owner: string, name: string, workflow: Partial<Workflow>) {
  return post(idQuery("/api/update-workflow", owner, name), workflow);
}

export function deleteWorkflow(workflow: Partial<Workflow>) {
  return post("/api/delete-workflow", workflow);
}

export function getWorkflowExecutions(params: ListParams) {
  return get<WorkflowExecution[]>(qs("/api/get-workflow-executions", params)) as Promise<PaginatedResponse<WorkflowExecution>>;
}

export function addWorkflowExecution(execution: Partial<WorkflowExecution>) {
  return post("/api/add-workflow-execution", execution);
}

export function updateWorkflowExecution(owner: string, name: string, execution: Partial<WorkflowExecution>) {
  return post(idQuery("/api/update-workflow-execution", owner, name), execution);
}
