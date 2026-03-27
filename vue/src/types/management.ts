import type { RouteLocationRaw } from "vue-router";
import type { VNodeChild } from "vue";

export interface ApiResponse<T = unknown> {
  status: string;
  msg?: string;
  data: T;
  data2?: number;
}

export interface ListResult<T> {
  data: T[];
  data2?: number;
}

export interface SelectOption {
  label: string;
  value: string | number | boolean;
}

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "switch"
  | "select"
  | "multiselect"
  | "tags";

export interface ResourceField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  optionSource?: string;
  min?: number;
  rows?: number;
  help?: string;
  disabled?: boolean | ((entity: Record<string, unknown>) => boolean);
}

export interface ResourceColumn {
  key: string;
  title: string;
  dataIndex?: string;
  width?: string | number;
  sorter?: boolean;
  ellipsis?: boolean;
  render?: (value: unknown, record: Record<string, unknown>) => VNodeChild;
}

export interface ResourceFilter {
  key: string;
  label: string;
  options: SelectOption[];
  placeholder?: string;
}

export interface ResourceContext {
  organization: string;
  accountOwner: string;
  isAdmin: boolean;
}

export interface ResourceConfig {
  key: string;
  listTitle: string;
  createTitle: string;
  editTitle: string;
  routeBase: string;
  searchField: string;
  filters?: ResourceFilter[];
  columns: ResourceColumn[];
  fields: ResourceField[];
  rowKey: (record: Record<string, unknown>) => string;
  listRoute: (context: ResourceContext) => RouteLocationRaw;
  createRoute: (context: ResourceContext) => RouteLocationRaw;
  editRoute: (record: Record<string, unknown>) => RouteLocationRaw;
  list: (params: Record<string, unknown>, context: ResourceContext) => Promise<ListResult<Record<string, unknown>>>;
  get: (params: Record<string, unknown>) => Promise<ApiResponse<Record<string, unknown>>>;
  create: (entity: Record<string, unknown>) => Promise<ApiResponse<unknown>>;
  update: (params: Record<string, unknown>, entity: Record<string, unknown>) => Promise<ApiResponse<unknown>>;
  removeByKey: (key: string, records: Record<string, unknown>[]) => Promise<ApiResponse<unknown>>;
  createDefault: (context: ResourceContext, routeState?: { query: Record<string, unknown>; params: Record<string, unknown> }) => Record<string, unknown>;
  loadOptions?: (
    entity: Record<string, unknown>,
    context: ResourceContext,
    routeState?: { query: Record<string, unknown>; params: Record<string, unknown> },
  ) => Promise<Record<string, SelectOption[]>>;
  transformLoaded?: (entity: Record<string, unknown>) => Record<string, unknown>;
  normalize?: (entity: Record<string, unknown>) => Record<string, unknown>;
  canDelete?: (record: Record<string, unknown>) => boolean;
  canEdit?: (record: Record<string, unknown>) => boolean;
}
