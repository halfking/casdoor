import { h } from "vue";
import { RouterLink } from "vue-router";
import { Tag } from "ant-design-vue";
import type { ApiResponse, ResourceConfig, ResourceContext, SelectOption } from "@/types/management";
import * as AdapterApi from "@/api/modules/adapter";
import * as ApplicationApi from "@/api/modules/application";
import * as CertApi from "@/api/modules/cert";
import * as EnforcerApi from "@/api/modules/enforcer";
import * as FormApi from "@/api/modules/form";
import * as InvitationApi from "@/api/modules/invitation";
import * as OrderApi from "@/api/modules/order";
import * as OrganizationApi from "@/api/modules/organization";
import * as PaymentApi from "@/api/modules/payment";
import * as PlanApi from "@/api/modules/plan";
import * as PricingApi from "@/api/modules/pricing";
import * as ProductApi from "@/api/modules/product";
import * as ProviderApi from "@/api/modules/provider";
import * as RecordApi from "@/api/modules/record";
import * as ResourceApi from "@/api/modules/resource";
import * as RoleApi from "@/api/modules/role";
import * as SessionApi from "@/api/modules/session";
import * as SubscriptionApi from "@/api/modules/subscription";
import * as SyncerApi from "@/api/modules/syncer";
import * as SystemApi from "@/api/modules/system";
import * as TicketApi from "@/api/modules/ticket";
import * as TokenApi from "@/api/modules/token";
import * as TransactionApi from "@/api/modules/transaction";
import * as UserApi from "@/api/modules/user";
import * as VerificationApi from "@/api/modules/verification";
import * as WebhookApi from "@/api/modules/webhook";
import * as LdapApi from "@/api/modules/ldap";
import * as SiteApi from "@/api/modules/site";
import * as RuleApi from "@/api/modules/rule";
import {
  findRecordByKey,
  formatDate,
  getRuntimeAccount,
  getStoredOrganization,
  randomName,
  renderBoolean,
  renderTagList,
  stringifyValue,
  toOptions,
} from "@/utils/management";

type Entity = Record<string, unknown>;
type AnyResponse = ApiResponse<unknown>;

function unwrap<T>(response: ApiResponse<T>): ApiResponse<T> {
  if (response.status !== "ok") {
    throw new Error(response.msg || "Request failed");
  }

  return response;
}

function unwrapList(response: AnyResponse) {
  const result = unwrap(response);
  const data = (result.data as Entity[]) || [];
  return {
    data,
    data2: result.data2 ?? data.length,
  };
}

function ownerFromContext(context: ResourceContext): string {
  return context.organization === "All" ? "" : context.organization;
}

function currentOrganization(context: ResourceContext): string {
  return context.organization === "All" ? context.accountOwner : context.organization;
}

function tag(text: string, color = "processing") {
  return h(Tag, { color }, () => text);
}

function renderTextLink(to: string, text: string) {
  return h(RouterLink, { to }, () => text);
}

function decodeRouteValue(value: unknown): string {
  return decodeURIComponent(String(value || ""));
}

function okResponse<T>(data: T): ApiResponse<T> {
  return { status: "ok", data, msg: "" };
}

function runtimeUserName(): string {
  return String(getRuntimeAccount().name || "");
}

function currentOrganizationFromStorage(): string {
  const organization = getStoredOrganization();
  if (organization && organization !== "All") {
    return organization;
  }

  return String(getRuntimeAccount().owner || "built-in");
}

async function loadOrganizationOptions(): Promise<SelectOption[]> {
  const response = unwrap(await OrganizationApi.getOrganizations({ owner: "admin", pageSize: 100 }) as AnyResponse);
  return ((response.data as Entity[]) || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: String(item.name),
  }));
}

async function loadApplicationOptions(organization: string): Promise<SelectOption[]> {
  if (!organization || organization === "All") {
    return [];
  }

  const response = unwrap(await ApplicationApi.getApplicationsByOrganization("admin", organization, { pageSize: 100 }) as AnyResponse);
  return ((response.data as Entity[]) || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: String(item.name),
  }));
}

async function loadUserOptions(organization: string): Promise<SelectOption[]> {
  if (!organization || organization === "All") {
    return [];
  }

  const response = unwrap(await UserApi.getUsers({ owner: organization, pageSize: 100 }) as AnyResponse);
  return ((response.data as Entity[]) || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: String(item.name),
  }));
}

async function loadRoleOptions(organization: string): Promise<SelectOption[]> {
  if (!organization || organization === "All") {
    return [];
  }

  const response = unwrap(await RoleApi.getRoles({ owner: organization, pageSize: 100 }) as AnyResponse);
  return ((response.data as Entity[]) || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: String(item.name),
  }));
}

async function loadProviderOptions(organization: string): Promise<SelectOption[]> {
  if (!organization || organization === "All") {
    return [];
  }

  const response = unwrap(await ProviderApi.getProviders({ owner: organization, pageSize: 100 }) as AnyResponse);
  return ((response.data as Entity[]) || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: String(item.name),
  }));
}

async function loadProductOptions(organization: string): Promise<SelectOption[]> {
  if (!organization || organization === "All") {
    return [];
  }

  const response = unwrap(await ProductApi.getProducts({ owner: organization, pageSize: 100 }) as AnyResponse);
  return ((response.data as Entity[]) || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: String(item.name),
  }));
}

async function loadPlanOptions(organization: string): Promise<SelectOption[]> {
  if (!organization || organization === "All") {
    return [];
  }

  const response = unwrap(await PlanApi.getPlans({ owner: organization, pageSize: 100 }) as AnyResponse);
  return ((response.data as Entity[]) || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: String(item.name),
  }));
}

async function loadPaymentOptions(organization: string): Promise<SelectOption[]> {
  if (!organization || organization === "All") {
    return [];
  }

  const response = unwrap(await PaymentApi.getPayments({ owner: organization, pageSize: 100 }) as AnyResponse);
  return ((response.data as Entity[]) || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: String(item.name),
  }));
}

export const extraResourceConfigs: Record<string, ResourceConfig> = {
  invitations: {
    key: "invitations",
    routeBase: "/management/invitations",
    listTitle: "general:Invitations",
    createTitle: "invitation:New Invitation",
    editTitle: "invitation:Edit Invitation",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-invitations" }),
    createRoute: () => ({ name: "management-invitations-new" }),
    editRoute: (record) => ({ name: "management-invitations-edit", params: { owner: String(record.owner), name: String(record.name) } }),
    list: async (params, context) => unwrapList(await InvitationApi.getInvitations({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await InvitationApi.getInvitation(decodeRouteValue(params.owner), decodeRouteValue(params.name)) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await InvitationApi.addInvitation(entity) as AnyResponse),
    update: async (params, entity) => unwrap(await InvitationApi.updateInvitation(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await InvitationApi.deleteInvitation(record || {}) as AnyResponse);
    },
    createDefault: (context) => {
      const owner = currentOrganization(context);
      const suffix = randomName();
      return {
        owner,
        name: `invitation_${suffix}`,
        displayName: `New Invitation - ${suffix}`,
        application: "",
        email: "",
        phone: "",
        code: suffix.toUpperCase(),
        quota: 1,
        usedCount: 0,
        state: "Pending",
      };
    },
    loadOptions: async (entity) => ({
      organizations: await loadOrganizationOptions(),
      applications: await loadApplicationOptions(String(entity.owner || "")),
    }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/invitations/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "updatedTime", title: "general:Updated time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true, ellipsis: true },
      { key: "code", title: "invitation:Code", width: 140, ellipsis: true },
      { key: "quota", title: "invitation:Quota", width: 100, sorter: true },
      { key: "usedCount", title: "invitation:Used count", width: 120, sorter: true },
      { key: "application", title: "general:Application", ellipsis: true },
      { key: "email", title: "general:Email", ellipsis: true },
      { key: "phone", title: "general:Phone", width: 150 },
      { key: "state", title: "general:State", width: 120, render: (value) => tag(String(value || "Pending"), String(value || "") === "Accepted" ? "success" : "warning") },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text" },
      { key: "application", label: "general:Application", type: "select", optionSource: "applications" },
      { key: "email", label: "general:Email", type: "text" },
      { key: "phone", label: "general:Phone", type: "text" },
      { key: "code", label: "invitation:Code", type: "text" },
      { key: "quota", label: "invitation:Quota", type: "number", min: 1 },
      { key: "state", label: "general:State", type: "select", options: toOptions(["Pending", "Accepted", "Expired"]) },
    ],
  },
  resources: {
    key: "resources",
    routeBase: "/management/resources",
    listTitle: "general:Resources",
    createTitle: "resource:New Resource",
    editTitle: "resource:Edit Resource",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-resources" }),
    createRoute: () => ({ name: "management-resources-new" }),
    editRoute: (record) => ({ name: "management-resources-edit", params: { owner: String(record.owner), name: String(record.name) } }),
    list: async (params, context) => unwrapList(await ResourceApi.getResources(ownerFromContext(context), runtimeUserName(), {
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await ResourceApi.getResource(decodeRouteValue(params.owner), decodeRouteValue(params.name)) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await ResourceApi.addResource(entity) as AnyResponse),
    update: async (params, entity) => unwrap(await ResourceApi.updateResource(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await ResourceApi.deleteResource(record || {}, String((record || {}).provider || "") || undefined) as AnyResponse);
    },
    createDefault: (context) => ({
      owner: currentOrganization(context),
      name: `resource_${randomName()}`,
      provider: "",
      application: "",
      user: runtimeUserName(),
      parent: "/",
      tag: "",
      fileType: "custom",
      fileFormat: "",
      fileSize: 0,
      url: "",
    }),
    loadOptions: async (entity) => ({
      organizations: await loadOrganizationOptions(),
      applications: await loadApplicationOptions(String(entity.owner || "")),
      providers: await loadProviderOptions(String(entity.owner || "")),
      users: await loadUserOptions(String(entity.owner || "")),
    }),
    columns: [
      { key: "provider", title: "general:Provider", width: 140, sorter: true },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "application", title: "general:Application", width: 150, sorter: true },
      { key: "user", title: "general:User", width: 150, sorter: true },
      { key: "parent", title: "resource:Parent", width: 160, ellipsis: true },
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/resources/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "tag", title: "user:Tag", width: 120 },
      { key: "fileType", title: "general:Type", width: 120 },
      { key: "fileFormat", title: "resource:Format", width: 120 },
      { key: "fileSize", title: "resource:File size", width: 120 },
      { key: "url", title: "general:URL", ellipsis: true },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "provider", label: "general:Provider", type: "select", optionSource: "providers" },
      { key: "application", label: "general:Application", type: "select", optionSource: "applications" },
      { key: "user", label: "general:User", type: "select", optionSource: "users" },
      { key: "parent", label: "resource:Parent", type: "text" },
      { key: "tag", label: "user:Tag", type: "text" },
      { key: "fileType", label: "general:Type", type: "text" },
      { key: "fileFormat", label: "resource:Format", type: "text" },
      { key: "url", label: "general:URL", type: "text" },
    ],
  },
  certs: {
    key: "certs",
    routeBase: "/management/certs",
    listTitle: "general:Certs",
    createTitle: "cert:New Cert",
    editTitle: "cert:Edit Cert",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-certs" }),
    createRoute: () => ({ name: "management-certs-new" }),
    editRoute: (record) => ({ name: "management-certs-edit", params: { owner: String(record.owner), name: String(record.name) } }),
    list: async (params, context) => {
      const field = String(params.searchedColumn || "name");
      const value = String(params.searchText || "");
      const response = context.organization === "All"
        ? await CertApi.getGlobalCerts({ page: Number(params.page || 1), pageSize: Number(params.pageSize || 10), field, value, sortField: String(params.sortField || ""), sortOrder: String(params.sortOrder || "") })
        : await CertApi.getCerts({ owner: currentOrganization(context), page: Number(params.page || 1), pageSize: Number(params.pageSize || 10), field, value, sortField: String(params.sortField || ""), sortOrder: String(params.sortOrder || "") });
      return unwrapList(response as AnyResponse);
    },
    get: async (params) => unwrap(await CertApi.getCert(decodeRouteValue(params.owner), decodeRouteValue(params.name)) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await CertApi.addCert(entity) as AnyResponse),
    update: async (params, entity) => unwrap(await CertApi.updateCert(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await CertApi.deleteCert(record || {}) as AnyResponse);
    },
    createDefault: (context) => ({
      owner: currentOrganization(context),
      name: `cert_${randomName()}`,
      displayName: "",
      scope: "",
      type: "RSA",
      cryptoAlgorithm: "RSA",
      bitSize: 2048,
      expireInYears: 1,
    }),
    loadOptions: async () => ({ organizations: await loadOrganizationOptions() }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/certs/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true, ellipsis: true },
      { key: "scope", title: "provider:Scope", width: 140 },
      { key: "type", title: "general:Type", width: 120 },
      { key: "cryptoAlgorithm", title: "cert:Crypto algorithm", width: 160 },
      { key: "bitSize", title: "cert:Bit size", width: 110, sorter: true },
      { key: "expireInYears", title: "cert:Expire in years", width: 140, sorter: true },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text" },
      { key: "scope", label: "provider:Scope", type: "text" },
      { key: "type", label: "general:Type", type: "select", options: toOptions(["RSA", "ECC"]) },
      { key: "cryptoAlgorithm", label: "cert:Crypto algorithm", type: "text" },
      { key: "bitSize", label: "cert:Bit size", type: "number", min: 0 },
      { key: "expireInYears", label: "cert:Expire in years", type: "number", min: 1 },
    ],
  },
  adapters: {
    key: "adapters",
    routeBase: "/management/adapters",
    listTitle: "general:Adapters",
    createTitle: "adapter:New Adapter",
    editTitle: "adapter:Edit Adapter",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-adapters" }),
    createRoute: () => ({ name: "management-adapters-new" }),
    editRoute: (record) => ({ name: "management-adapters-edit", params: { owner: String(record.owner), name: String(record.name) } }),
    list: async (params, context) => unwrapList(await AdapterApi.getAdapters({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await AdapterApi.getAdapter(decodeRouteValue(params.owner), decodeRouteValue(params.name)) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await AdapterApi.addAdapter(entity) as AnyResponse),
    update: async (params, entity) => unwrap(await AdapterApi.updateAdapter(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await AdapterApi.deleteAdapter(record || {}) as AnyResponse);
    },
    createDefault: (context) => ({
      owner: currentOrganization(context),
      name: `adapter_${randomName()}`,
      table: "casbin_rule",
      useSameDb: true,
      type: "Database",
      databaseType: "mysql",
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
      database: "casdoor",
    }),
    loadOptions: async () => ({ organizations: await loadOrganizationOptions() }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/adapters/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "table", title: "syncer:Table", width: 140 },
      { key: "useSameDb", title: "adapter:Use same DB", width: 140, render: (value) => renderBoolean(value) },
      { key: "type", title: "general:Type", width: 120 },
      { key: "databaseType", title: "syncer:Database type", width: 140 },
      { key: "host", title: "provider:Host", width: 150 },
      { key: "port", title: "provider:Port", width: 100 },
      { key: "user", title: "general:User", width: 140 },
      { key: "database", title: "syncer:Database", width: 140 },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "table", label: "syncer:Table", type: "text" },
      { key: "useSameDb", label: "adapter:Use same DB", type: "switch" },
      { key: "type", label: "general:Type", type: "text" },
      { key: "databaseType", label: "syncer:Database type", type: "text" },
      { key: "host", label: "provider:Host", type: "text" },
      { key: "port", label: "provider:Port", type: "number", min: 0 },
      { key: "user", label: "general:User", type: "text" },
      { key: "password", label: "general:Password", type: "text" },
      { key: "database", label: "syncer:Database", type: "text" },
    ],
  },
  enforcers: {
    key: "enforcers",
    routeBase: "/management/enforcers",
    listTitle: "general:Enforcers",
    createTitle: "enforcer:New Enforcer",
    editTitle: "enforcer:Edit Enforcer",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-enforcers" }),
    createRoute: () => ({ name: "management-enforcers-new" }),
    editRoute: (record) => ({ name: "management-enforcers-edit", params: { owner: String(record.owner), name: String(record.name) } }),
    list: async (params, context) => unwrapList(await EnforcerApi.getEnforcers({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await EnforcerApi.getEnforcer(decodeRouteValue(params.owner), decodeRouteValue(params.name), true) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await EnforcerApi.addEnforcer(entity) as AnyResponse),
    update: async (params, entity) => unwrap(await EnforcerApi.updateEnforcer(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await EnforcerApi.deleteEnforcer(record || {}) as AnyResponse);
    },
    createDefault: (context) => ({
      owner: currentOrganization(context),
      name: `enforcer_${randomName()}`,
      displayName: "",
      model: "",
      adapter: "",
    }),
    loadOptions: async () => ({ organizations: await loadOrganizationOptions() }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/enforcers/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true, ellipsis: true },
      { key: "model", title: "general:Model", ellipsis: true },
      { key: "adapter", title: "general:Adapter", ellipsis: true },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text" },
      { key: "model", label: "general:Model", type: "text" },
      { key: "adapter", label: "general:Adapter", type: "text" },
    ],
  },
  sessions: {
    key: "sessions",
    routeBase: "/management/sessions",
    listTitle: "general:Sessions",
    createTitle: "general:Sessions",
    editTitle: "general:Sessions",
    searchField: "sessionId",
    allowCreate: false,
    showEditAction: false,
    rowKey: (record) => String(record.sessionId || record.name || ""),
    listRoute: () => ({ name: "management-sessions" }),
    createRoute: () => ({ name: "management-sessions" }),
    editRoute: () => ({ name: "management-sessions" }),
    list: async (params, context) => unwrapList(await SessionApi.getSessions({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "sessionId"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async () => okResponse({}),
    create: async () => okResponse(null),
    update: async () => okResponse(null),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => String(item.sessionId || item.name || ""));
      return unwrap(await SessionApi.deleteSession(record || {}, String((record || {}).sessionId || "") || undefined) as AnyResponse);
    },
    createDefault: () => ({}),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "sessionId", title: "general:Session ID", ellipsis: true },
    ],
    fields: [],
  },
  records: {
    key: "records",
    routeBase: "/management/records",
    listTitle: "general:Records",
    createTitle: "general:Records",
    editTitle: "general:Records",
    searchField: "requestUri",
    allowCreate: false,
    showActions: false,
    rowKey: (record) => String(record.id || record.name || record.createdTime || ""),
    listRoute: () => ({ name: "management-records" }),
    createRoute: () => ({ name: "management-records" }),
    editRoute: () => ({ name: "management-records" }),
    list: async (params, context) => unwrapList(await RecordApi.getRecords({
      organizationName: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "requestUri"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async () => okResponse({}),
    create: async () => okResponse(null),
    update: async () => okResponse(null),
    removeByKey: async () => okResponse(null),
    createDefault: () => ({}),
    columns: [
      { key: "name", title: "general:Name", width: 160, sorter: true },
      { key: "id", title: "general:ID", width: 120, sorter: true },
      { key: "clientIp", title: "general:Client IP", width: 140 },
      { key: "createdTime", title: "general:Timestamp", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "organization", title: "general:Organization", width: 150, sorter: true },
      { key: "user", title: "general:User", width: 150, sorter: true },
      { key: "method", title: "general:Method", width: 120 },
      { key: "requestUri", title: "general:Request URI", ellipsis: true },
      { key: "statusCode", title: "record:Status code", width: 120 },
      { key: "response", title: "record:Response", ellipsis: true, render: (value) => stringifyValue(value).slice(0, 80) || "-" },
      { key: "object", title: "record:Object", ellipsis: true },
      { key: "action", title: "general:Action", width: 120 },
      { key: "isTriggered", title: "record:Is triggered", width: 120, render: (value) => renderBoolean(value) },
    ],
    fields: [],
  },
  tokens: {
    key: "tokens",
    routeBase: "/management/tokens",
    listTitle: "general:Tokens",
    createTitle: "token:New Token",
    editTitle: "token:Edit Token",
    searchField: "name",
    rowKey: (record) => String(record.name),
    listRoute: () => ({ name: "management-tokens" }),
    createRoute: () => ({ name: "management-tokens-new" }),
    editRoute: (record) => ({ name: "management-tokens-edit", params: { name: String(record.name) } }),
    list: async (params, context) => unwrapList(await TokenApi.getTokens({
      organization: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await TokenApi.getToken(currentOrganizationFromStorage(), decodeRouteValue(params.name)) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await TokenApi.addToken({ ...entity, owner: currentOrganizationFromStorage() }) as AnyResponse),
    update: async (params, entity) => unwrap(await TokenApi.updateToken(currentOrganizationFromStorage(), decodeRouteValue(params.name), entity) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => String(item.name));
      return unwrap(await TokenApi.deleteToken(record || {}) as AnyResponse);
    },
    createDefault: () => ({
      owner: currentOrganizationFromStorage(),
      name: `token_${randomName()}`,
      application: "",
      organization: currentOrganizationFromStorage(),
      user: runtimeUserName(),
      code: "",
      accessToken: "",
      expiresIn: 3600,
      scope: "",
    }),
    loadOptions: async () => ({ applications: await loadApplicationOptions(currentOrganizationFromStorage()) }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/tokens/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "application", title: "general:Application", width: 150, sorter: true },
      { key: "organization", title: "general:Organization", width: 150, sorter: true, render: (value, record) => String(value || record.owner || "") },
      { key: "user", title: "general:User", width: 150, sorter: true },
      { key: "code", title: "token:Authorization code", ellipsis: true },
      { key: "accessToken", title: "token:Access token", ellipsis: true },
      { key: "expiresIn", title: "token:Expires in", width: 120, sorter: true },
      { key: "scope", title: "provider:Scope", ellipsis: true },
    ],
    fields: [
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "application", label: "general:Application", type: "select", optionSource: "applications" },
      { key: "user", label: "general:User", type: "text" },
      { key: "code", label: "token:Authorization code", type: "text" },
      { key: "accessToken", label: "token:Access token", type: "text" },
      { key: "expiresIn", label: "token:Expires in", type: "number", min: 0 },
      { key: "scope", label: "provider:Scope", type: "text" },
    ],
  },
  verifications: {
    key: "verifications",
    routeBase: "/management/verifications",
    listTitle: "general:Verifications",
    createTitle: "general:Verifications",
    editTitle: "general:Verifications",
    searchField: "name",
    allowCreate: false,
    showActions: false,
    rowKey: (record) => String(record.name || record.id || randomName()),
    listRoute: () => ({ name: "management-verifications" }),
    createRoute: () => ({ name: "management-verifications" }),
    editRoute: () => ({ name: "management-verifications" }),
    list: async (params, context) => unwrapList(await VerificationApi.getVerifications({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async () => okResponse({}),
    create: async () => okResponse(null),
    update: async () => okResponse(null),
    removeByKey: async () => okResponse(null),
    createDefault: () => ({}),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "type", title: "general:Type", width: 120, sorter: true },
      { key: "target", title: "general:Target", ellipsis: true },
      { key: "application", title: "general:Application", width: 150, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "isUsed", title: "general:Used", width: 100, render: (value) => renderBoolean(value) },
    ],
    fields: [],
  },
  products: {
    key: "products",
    routeBase: "/management/products",
    listTitle: "general:Products",
    createTitle: "product:New Product",
    editTitle: "product:Edit Product",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-products" }),
    createRoute: () => ({ name: "management-products-new" }),
    editRoute: (record) => ({ name: "management-products-edit", params: { owner: String(record.owner), name: String(record.name) } }),
    list: async (params, context) => unwrapList(await ProductApi.getProducts({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await ProductApi.getProduct(decodeRouteValue(params.owner), decodeRouteValue(params.name)) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await ProductApi.addProduct(entity) as AnyResponse),
    update: async (params, entity) => unwrap(await ProductApi.updateProduct(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await ProductApi.deleteProduct(record || {}) as AnyResponse);
    },
    createDefault: (context) => ({
      owner: currentOrganization(context),
      name: `product_${randomName()}`,
      displayName: "",
      image: "",
      tag: "",
      price: 0,
      quantity: 0,
      sold: 0,
      state: "Published",
      providers: [],
    }),
    loadOptions: async (entity) => ({
      organizations: await loadOrganizationOptions(),
      providers: await loadProviderOptions(String(entity.owner || "")),
    }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/products/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true, ellipsis: true },
      { key: "image", title: "product:Image", ellipsis: true },
      { key: "tag", title: "user:Tag", width: 120 },
      { key: "price", title: "order:Price", width: 120, sorter: true },
      { key: "quantity", title: "product:Quantity", width: 110, sorter: true },
      { key: "sold", title: "product:Sold", width: 100, sorter: true },
      { key: "state", title: "general:State", width: 120, render: (value) => tag(String(value || "Published")) },
      { key: "providers", title: "product:Payment providers", render: (value) => renderTagList(value) },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text" },
      { key: "image", label: "product:Image", type: "text" },
      { key: "tag", label: "user:Tag", type: "text" },
      { key: "price", label: "order:Price", type: "number", min: 0 },
      { key: "quantity", label: "product:Quantity", type: "number", min: 0 },
      { key: "state", label: "general:State", type: "select", options: toOptions(["Draft", "Published", "Archived"]) },
      { key: "providers", label: "product:Payment providers", type: "multiselect", optionSource: "providers" },
    ],
  },
  payments: {
    key: "payments",
    routeBase: "/management/payments",
    listTitle: "general:Payments",
    createTitle: "payment:New Payment",
    editTitle: "payment:Edit Payment",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-payments" }),
    createRoute: () => ({ name: "management-payments-new" }),
    editRoute: (record) => ({ name: "management-payments-edit", params: { owner: String(record.owner), name: String(record.name) } }),
    list: async (params, context) => unwrapList(await PaymentApi.getPayments({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await PaymentApi.getPayment(decodeRouteValue(params.owner), decodeRouteValue(params.name)) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await PaymentApi.addPayment(entity) as AnyResponse),
    update: async (params, entity) => unwrap(await PaymentApi.updatePayment(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await PaymentApi.deletePayment(record || {}) as AnyResponse);
    },
    createDefault: (context) => ({
      owner: currentOrganization(context),
      name: `payment_${randomName()}`,
      provider: "",
      user: runtimeUserName(),
      type: "payment",
      products: [],
      price: 0,
      state: "Created",
    }),
    loadOptions: async (entity) => ({
      organizations: await loadOrganizationOptions(),
      providers: await loadProviderOptions(String(entity.owner || "")),
      users: await loadUserOptions(String(entity.owner || "")),
      products: await loadProductOptions(String(entity.owner || "")),
    }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/payments/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "provider", title: "general:Provider", width: 140, sorter: true },
      { key: "user", title: "general:User", width: 140, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "type", title: "general:Type", width: 120 },
      { key: "products", title: "general:Products", render: (value) => renderTagList(value) },
      { key: "price", title: "order:Price", width: 120, sorter: true },
      { key: "state", title: "general:State", width: 120, render: (value) => tag(String(value || "Created")) },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "provider", label: "general:Provider", type: "select", optionSource: "providers" },
      { key: "user", label: "general:User", type: "select", optionSource: "users" },
      { key: "type", label: "general:Type", type: "text" },
      { key: "products", label: "general:Products", type: "multiselect", optionSource: "products" },
      { key: "price", label: "order:Price", type: "number", min: 0 },
      { key: "state", label: "general:State", type: "select", options: toOptions(["Created", "Paid", "Closed"]) },
    ],
  },
  plans: {
    key: "plans",
    routeBase: "/management/plans",
    listTitle: "general:Plans",
    createTitle: "plan:New Plan",
    editTitle: "plan:Edit Plan",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-plans" }),
    createRoute: () => ({ name: "management-plans-new" }),
    editRoute: (record) => ({ name: "management-plans-edit", params: { owner: String(record.owner), name: String(record.name) } }),
    list: async (params, context) => unwrapList(await PlanApi.getPlans({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await PlanApi.getPlan(decodeRouteValue(params.owner), decodeRouteValue(params.name), true) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await PlanApi.addPlan(entity) as AnyResponse),
    update: async (params, entity) => unwrap(await PlanApi.updatePlan(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await PlanApi.deletePlan(record || {}) as AnyResponse);
    },
    createDefault: (context) => ({
      owner: currentOrganization(context),
      name: `plan_${randomName()}`,
      displayName: "",
      price: 0,
      period: "month",
      role: "",
      product: "",
      isEnabled: true,
    }),
    loadOptions: async (entity) => ({
      organizations: await loadOrganizationOptions(),
      roles: await loadRoleOptions(String(entity.owner || "")),
      products: await loadProductOptions(String(entity.owner || "")),
    }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/plans/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true, ellipsis: true },
      { key: "price", title: "order:Price", width: 120, sorter: true },
      { key: "period", title: "plan:Period", width: 120 },
      { key: "role", title: "general:Role", width: 140 },
      { key: "product", title: "plan:Related product", width: 150 },
      { key: "isEnabled", title: "general:Is enabled", width: 120, render: (value) => renderBoolean(value) },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text" },
      { key: "price", label: "order:Price", type: "number", min: 0 },
      { key: "period", label: "plan:Period", type: "select", options: toOptions(["day", "week", "month", "year"]) },
      { key: "role", label: "general:Role", type: "select", optionSource: "roles" },
      { key: "product", label: "plan:Related product", type: "select", optionSource: "products" },
      { key: "isEnabled", label: "general:Is enabled", type: "switch" },
    ],
  },
  pricings: {
    key: "pricings",
    routeBase: "/management/pricings",
    listTitle: "general:Pricings",
    createTitle: "pricing:New Pricing",
    editTitle: "pricing:Edit Pricing",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-pricings" }),
    createRoute: () => ({ name: "management-pricings-new" }),
    editRoute: (record) => ({ name: "management-pricings-edit", params: { owner: String(record.owner), name: String(record.name) } }),
    list: async (params, context) => unwrapList(await PricingApi.getPricings({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await PricingApi.getPricing(decodeRouteValue(params.owner), decodeRouteValue(params.name)) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await PricingApi.addPricing(entity) as AnyResponse),
    update: async (params, entity) => unwrap(await PricingApi.updatePricing(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await PricingApi.deletePricing(record || {}) as AnyResponse);
    },
    createDefault: (context) => ({
      owner: currentOrganization(context),
      name: `pricing_${randomName()}`,
      displayName: "",
      application: "",
      plans: [],
      isEnabled: true,
    }),
    loadOptions: async (entity) => ({
      organizations: await loadOrganizationOptions(),
      applications: await loadApplicationOptions(String(entity.owner || "")),
      plans: await loadPlanOptions(String(entity.owner || "")),
    }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/pricings/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true, ellipsis: true },
      { key: "application", title: "general:Application", width: 150 },
      { key: "plans", title: "general:Plans", render: (value) => renderTagList(value) },
      { key: "isEnabled", title: "general:Is enabled", width: 120, render: (value) => renderBoolean(value) },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text" },
      { key: "application", label: "general:Application", type: "select", optionSource: "applications" },
      { key: "plans", label: "general:Plans", type: "multiselect", optionSource: "plans" },
      { key: "isEnabled", label: "general:Is enabled", type: "switch" },
    ],
  },
  subscriptions: {
    key: "subscriptions",
    routeBase: "/management/subscriptions",
    listTitle: "general:Subscriptions",
    createTitle: "subscription:New Subscription",
    editTitle: "subscription:Edit Subscription",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-subscriptions" }),
    createRoute: () => ({ name: "management-subscriptions-new" }),
    editRoute: (record) => ({ name: "management-subscriptions-edit", params: { owner: String(record.owner), name: String(record.name) } }),
    list: async (params, context) => unwrapList(await SubscriptionApi.getSubscriptions({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await SubscriptionApi.getSubscription(decodeRouteValue(params.owner), decodeRouteValue(params.name)) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await SubscriptionApi.addSubscription(entity) as AnyResponse),
    update: async (params, entity) => unwrap(await SubscriptionApi.updateSubscription(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await SubscriptionApi.deleteSubscription(record || {}) as AnyResponse);
    },
    createDefault: (context) => ({
      owner: currentOrganization(context),
      name: `subscription_${randomName()}`,
      displayName: "",
      period: "month",
      startTime: "",
      endTime: "",
      plan: "",
      user: runtimeUserName(),
      payment: "",
      state: "Created",
    }),
    loadOptions: async (entity) => ({
      organizations: await loadOrganizationOptions(),
      plans: await loadPlanOptions(String(entity.owner || "")),
      users: await loadUserOptions(String(entity.owner || "")),
      payments: await loadPaymentOptions(String(entity.owner || "")),
    }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/subscriptions/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true, ellipsis: true },
      { key: "period", title: "plan:Period", width: 120 },
      { key: "startTime", title: "subscription:Start time", width: 180, render: (value) => formatDate(String(value || "")) },
      { key: "endTime", title: "subscription:End time", width: 180, render: (value) => formatDate(String(value || "")) },
      { key: "plan", title: "general:Plan", width: 150 },
      { key: "user", title: "general:User", width: 150 },
      { key: "payment", title: "general:Payment", width: 150 },
      { key: "state", title: "general:State", width: 120, render: (value) => tag(String(value || "Created")) },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text" },
      { key: "period", label: "plan:Period", type: "select", options: toOptions(["day", "week", "month", "year"]) },
      { key: "startTime", label: "subscription:Start time", type: "text" },
      { key: "endTime", label: "subscription:End time", type: "text" },
      { key: "plan", label: "general:Plan", type: "select", optionSource: "plans" },
      { key: "user", label: "general:User", type: "select", optionSource: "users" },
      { key: "payment", label: "general:Payment", type: "select", optionSource: "payments" },
      { key: "state", label: "general:State", type: "select", options: toOptions(["Created", "Active", "Cancelled", "Expired"]) },
    ],
  },
  transactions: {
    key: "transactions",
    routeBase: "/management/transactions",
    listTitle: "general:Transactions",
    createTitle: "general:Transactions",
    editTitle: "general:Transactions",
    searchField: "name",
    allowCreate: false,
    showActions: false,
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-transactions" }),
    createRoute: () => ({ name: "management-transactions" }),
    editRoute: () => ({ name: "management-transactions" }),
    list: async (params, context) => unwrapList(await TransactionApi.getTransactions({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async () => okResponse({}),
    create: async () => okResponse(null),
    update: async () => okResponse(null),
    removeByKey: async () => okResponse(null),
    createDefault: () => ({}),
    columns: [
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "name", title: "general:Name", width: 180, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "tag", title: "user:Tag", width: 120 },
      { key: "user", title: "general:User", width: 140 },
      { key: "application", title: "general:Application", width: 150 },
      { key: "domain", title: "provider:Domain", width: 140 },
      { key: "category", title: "general:Category", width: 120 },
      { key: "type", title: "general:Type", width: 120 },
      { key: "subtype", title: "provider:Subtype", width: 140 },
      { key: "provider", title: "general:Provider", width: 140 },
      { key: "payment", title: "general:Payment", width: 140 },
      { key: "state", title: "general:State", width: 120, render: (value) => tag(String(value || "Created")) },
      { key: "amount", title: "product:Amount", width: 120, sorter: true },
    ],
    fields: [],
  },
  orders: {
    key: "orders",
    routeBase: "/management/orders",
    listTitle: "general:Orders",
    createTitle: "general:Orders",
    editTitle: "general:Orders",
    searchField: "name",
    allowCreate: false,
    showActions: false,
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-orders" }),
    createRoute: () => ({ name: "management-orders" }),
    editRoute: () => ({ name: "management-orders" }),
    list: async (params, context) => unwrapList(await OrderApi.getOrders({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async () => okResponse({}),
    create: async () => okResponse(null),
    update: async () => okResponse(null),
    removeByKey: async () => okResponse(null),
    createDefault: () => ({}),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "user", title: "general:User", width: 140 },
      { key: "product", title: "general:Product", width: 150 },
      { key: "payment", title: "general:Payment", width: 150 },
      { key: "price", title: "order:Price", width: 120 },
      { key: "state", title: "general:State", width: 120, render: (value) => tag(String(value || "Created")) },
    ],
    fields: [],
  },
  forms: {
    key: "forms",
    routeBase: "/management/forms",
    listTitle: "general:Forms",
    createTitle: "form:New Form",
    editTitle: "form:Edit Form",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-forms" }),
    createRoute: () => ({ name: "management-forms-new" }),
    editRoute: (record) => ({ name: "management-forms-edit", params: { owner: String(record.owner), name: String(record.name) } }),
    list: async (params, context) => unwrapList(await FormApi.getForms({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await FormApi.getForm(decodeRouteValue(params.owner), decodeRouteValue(params.name)) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await FormApi.addForm(entity) as AnyResponse),
    update: async (params, entity) => unwrap(await FormApi.updateForm(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await FormApi.deleteForm(record || {}) as AnyResponse);
    },
    createDefault: (context) => ({
      owner: currentOrganization(context),
      name: `form_${randomName()}`,
      displayName: "",
      type: "login",
      title: "",
      description: "",
      css: "",
      html: "",
    }),
    loadOptions: async () => ({ organizations: await loadOrganizationOptions() }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/forms/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true, ellipsis: true },
      { key: "type", title: "general:Type", width: 120 },
      { key: "title", title: "general:Title", ellipsis: true },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text" },
      { key: "type", label: "general:Type", type: "text" },
      { key: "title", label: "general:Title", type: "text" },
      { key: "description", label: "general:Description", type: "textarea", rows: 3 },
      { key: "css", label: "general:CSS", type: "textarea", rows: 6 },
      { key: "html", label: "general:HTML", type: "textarea", rows: 8 },
    ],
  },
  syncers: {
    key: "syncers",
    routeBase: "/management/syncers",
    listTitle: "general:Syncers",
    createTitle: "syncer:New Syncer",
    editTitle: "syncer:Edit Syncer",
    searchField: "name",
    rowKey: (record) => `${record.owner || record.organization}/${record.name}`,
    listRoute: () => ({ name: "management-syncers" }),
    createRoute: () => ({ name: "management-syncers-new" }),
    editRoute: (record) => ({ name: "management-syncers-edit", params: { owner: String(record.owner || record.organization), name: String(record.name) } }),
    list: async (params, context) => unwrapList(await SyncerApi.getSyncers({
      organization: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await SyncerApi.getSyncer(decodeRouteValue(params.owner), decodeRouteValue(params.name)) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await SyncerApi.addSyncer({ ...entity, owner: String(entity.owner || entity.organization || "") }) as AnyResponse),
    update: async (params, entity) => unwrap(await SyncerApi.updateSyncer(decodeRouteValue(params.owner), decodeRouteValue(params.name), { ...entity, owner: String(entity.owner || entity.organization || "") }) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner || item.organization}/${item.name}`);
      return unwrap(await SyncerApi.deleteSyncer(record || {}) as AnyResponse);
    },
    createDefault: (context) => ({
      owner: currentOrganization(context),
      organization: currentOrganization(context),
      name: `syncer_${randomName()}`,
      type: "db",
      databaseType: "mysql",
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: "",
      database: "casdoor",
      table: "users",
      syncInterval: 60,
      isEnabled: true,
    }),
    loadOptions: async () => ({ organizations: await loadOrganizationOptions() }),
    normalize: (entity) => ({ ...entity, owner: entity.owner || entity.organization, organization: entity.organization || entity.owner }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/syncers/${record.owner || record.organization}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "organization", title: "general:Organization", width: 150, sorter: true, render: (value, record) => String(value || record.owner || "") },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "type", title: "general:Type", width: 120 },
      { key: "databaseType", title: "syncer:Database type", width: 140 },
      { key: "host", title: "provider:Host", width: 150 },
      { key: "port", title: "provider:Port", width: 100 },
      { key: "user", title: "general:User", width: 120 },
      { key: "database", title: "syncer:Database", width: 140 },
      { key: "table", title: "syncer:Table", width: 140 },
      { key: "syncInterval", title: "syncer:Sync interval", width: 130 },
      { key: "isEnabled", title: "general:Is enabled", width: 120, render: (value) => renderBoolean(value) },
    ],
    fields: [
      { key: "organization", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "type", label: "general:Type", type: "text" },
      { key: "databaseType", label: "syncer:Database type", type: "text" },
      { key: "host", label: "provider:Host", type: "text" },
      { key: "port", label: "provider:Port", type: "number", min: 0 },
      { key: "user", label: "general:User", type: "text" },
      { key: "password", label: "general:Password", type: "text" },
      { key: "database", label: "syncer:Database", type: "text" },
      { key: "table", label: "syncer:Table", type: "text" },
      { key: "syncInterval", label: "syncer:Sync interval", type: "number", min: 0 },
      { key: "isEnabled", label: "general:Is enabled", type: "switch" },
    ],
  },
  webhooks: {
    key: "webhooks",
    routeBase: "/management/webhooks",
    listTitle: "general:Webhooks",
    createTitle: "webhook:New Webhook",
    editTitle: "webhook:Edit Webhook",
    searchField: "name",
    rowKey: (record) => `${record.owner || record.organization}/${record.name}`,
    listRoute: () => ({ name: "management-webhooks" }),
    createRoute: () => ({ name: "management-webhooks-new" }),
    editRoute: (record) => ({ name: "management-webhooks-edit", params: { owner: String(record.owner || record.organization), name: String(record.name) } }),
    list: async (params, context) => unwrapList(await WebhookApi.getWebhooks({
      organization: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await WebhookApi.getWebhook(decodeRouteValue(params.owner), decodeRouteValue(params.name)) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await WebhookApi.addWebhook({ ...entity, owner: String(entity.owner || entity.organization || "") }) as AnyResponse),
    update: async (params, entity) => unwrap(await WebhookApi.updateWebhook(decodeRouteValue(params.owner), decodeRouteValue(params.name), { ...entity, owner: String(entity.owner || entity.organization || "") }) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner || item.organization}/${item.name}`);
      return unwrap(await WebhookApi.deleteWebhook(record || {}) as AnyResponse);
    },
    createDefault: (context) => ({
      owner: currentOrganization(context),
      organization: currentOrganization(context),
      name: `webhook_${randomName()}`,
      url: "",
      method: "POST",
      contentType: "application/json",
      events: [],
      isUserExtended: false,
      singleOrgOnly: false,
      isEnabled: true,
    }),
    loadOptions: async () => ({ organizations: await loadOrganizationOptions() }),
    normalize: (entity) => ({ ...entity, owner: entity.owner || entity.organization, organization: entity.organization || entity.owner }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/webhooks/${record.owner || record.organization}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "organization", title: "general:Organization", width: 150, sorter: true, render: (value, record) => String(value || record.owner || "") },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "url", title: "general:URL", ellipsis: true },
      { key: "method", title: "general:Method", width: 110 },
      { key: "contentType", title: "webhook:Content type", width: 160 },
      { key: "events", title: "webhook:Events", render: (value) => renderTagList(value) },
      { key: "isUserExtended", title: "webhook:Is user extended", width: 140, render: (value) => renderBoolean(value) },
      { key: "singleOrgOnly", title: "webhook:Single org only", width: 140, render: (value) => renderBoolean(value) },
      { key: "isEnabled", title: "general:Is enabled", width: 120, render: (value) => renderBoolean(value) },
    ],
    fields: [
      { key: "organization", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "url", label: "general:URL", type: "text" },
      { key: "method", label: "general:Method", type: "select", options: toOptions(["GET", "POST", "PUT", "DELETE"]) },
      { key: "contentType", label: "webhook:Content type", type: "text" },
      { key: "events", label: "webhook:Events", type: "tags" },
      { key: "isUserExtended", label: "webhook:Is user extended", type: "switch" },
      { key: "singleOrgOnly", label: "webhook:Single org only", type: "switch" },
      { key: "isEnabled", label: "general:Is enabled", type: "switch" },
    ],
  },
  tickets: {
    key: "tickets",
    routeBase: "/management/tickets",
    listTitle: "general:Tickets",
    createTitle: "ticket:New Ticket",
    editTitle: "ticket:Edit Ticket",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-tickets" }),
    createRoute: () => ({ name: "management-tickets-new" }),
    editRoute: (record) => ({ name: "management-tickets-edit", params: { owner: String(record.owner), name: String(record.name) } }),
    list: async (params, context) => unwrapList(await TicketApi.getTickets({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await TicketApi.getTicket(decodeRouteValue(params.owner), decodeRouteValue(params.name)) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await TicketApi.addTicket(entity) as AnyResponse),
    update: async (params, entity) => unwrap(await TicketApi.updateTicket(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await TicketApi.deleteTicket(record || {}) as AnyResponse);
    },
    createDefault: (context) => ({
      owner: currentOrganization(context),
      name: `ticket_${randomName()}`,
      displayName: "",
      user: runtimeUserName(),
      title: "",
      content: "",
      state: "Open",
    }),
    loadOptions: async (entity) => ({
      organizations: await loadOrganizationOptions(),
      users: await loadUserOptions(String(entity.owner || "")),
    }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/tickets/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "user", title: "general:User", width: 150 },
      { key: "title", title: "general:Title", ellipsis: true },
      { key: "state", title: "general:State", width: 120, render: (value) => tag(String(value || "Open")) },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text" },
      { key: "user", label: "general:User", type: "select", optionSource: "users" },
      { key: "title", label: "general:Title", type: "text" },
      { key: "content", label: "general:Content", type: "textarea", rows: 6 },
      { key: "state", label: "general:State", type: "select", options: toOptions(["Open", "Pending", "Closed"]) },
    ],
  },
  systemInfo: {
    key: "systemInfo",
    routeBase: "/management/sysinfo",
    listTitle: "general:System Info",
    createTitle: "general:System Info",
    editTitle: "general:System Info",
    searchField: "name",
    allowCreate: false,
    showActions: false,
    rowKey: (record) => String(record.name || record.key || randomName()),
    listRoute: () => ({ name: "management-sysinfo" }),
    createRoute: () => ({ name: "management-sysinfo" }),
    editRoute: () => ({ name: "management-sysinfo" }),
    list: async () => {
      const [systemInfo, versionInfo, prometheusInfo] = await Promise.all([
        SystemApi.getSystemInfo(),
        SystemApi.getVersionInfo(),
        SystemApi.getPrometheusInfo(),
      ]);
      return {
        data: [
          { name: "System", value: stringifyValue((systemInfo as ApiResponse<unknown>).data || systemInfo) },
          { name: "Version", value: stringifyValue((versionInfo as ApiResponse<unknown>).data || versionInfo) },
          { name: "Prometheus", value: stringifyValue((prometheusInfo as ApiResponse<unknown>).data || prometheusInfo) },
        ],
        data2: 3,
      };
    },
    get: async () => okResponse({}),
    create: async () => okResponse(null),
    update: async () => okResponse(null),
    removeByKey: async () => okResponse(null),
    createDefault: () => ({}),
    columns: [
      { key: "name", title: "general:Name", width: 180 },
      { key: "value", title: "general:Value", ellipsis: true },
    ],
    fields: [],
  },
  sites: {
    key: "sites",
    routeBase: "/management/sites",
    listTitle: "general:Sites",
    createTitle: "site:New Site",
    editTitle: "site:Edit Site",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-sites" }),
    createRoute: () => ({ name: "management-sites-new" }),
    editRoute: (record) => ({ name: "management-sites-edit", params: { owner: String(record.owner), name: String(record.name) } }),
    list: async (params, context) => unwrapList(await SiteApi.getSites({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await SiteApi.getSite(decodeRouteValue(params.owner), decodeRouteValue(params.name)) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await SiteApi.addSite(entity) as AnyResponse),
    update: async (params, entity) => unwrap(await SiteApi.updateSite(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await SiteApi.deleteSite(record || {}) as AnyResponse);
    },
    createDefault: (context) => ({
      owner: currentOrganization(context),
      name: `site_${randomName()}`,
      createdTime: new Date().toISOString(),
      displayName: `New Site - ${randomName()}`,
      domain: "door.casdoor.com",
      otherDomains: [],
      needRedirect: false,
      disableVerbose: false,
      rules: [],
      enableAlert: false,
      alertInterval: 60,
      alertTryTimes: 3,
      alertProviders: [],
      challenges: [],
      host: "",
      port: 8000,
      hosts: [],
      sslMode: "HTTPS Only",
      sslCert: "",
      publicIp: "",
      node: "",
      isSelf: false,
      nodes: [],
      casdoorApplication: "",
      organizations: [],
    }),
    loadOptions: async (_entity) => ({
      organizations: await loadOrganizationOptions(),
    }),
    columns: [
      { key: "owner", title: "general:Owner", width: 120, sorter: true },
      { key: "name", title: "general:Name", width: 150, sorter: true, render: (_value, record) => renderTextLink(`/management/sites/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "displayName", title: "general:Display name", ellipsis: true },
      { key: "domain", title: "site:Domain", width: 180 },
      { key: "host", title: "site:Host", width: 150 },
      { key: "port", title: "site:Port", width: 100 },
      { key: "isSelf", title: "site:Is self", width: 100, render: (value) => renderBoolean(Boolean(value)) },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text" },
      { key: "domain", label: "site:Domain", type: "text" },
      { key: "host", label: "site:Host", type: "text" },
      { key: "port", label: "site:Port", type: "number" },
      { key: "publicIp", label: "site:Public IP", type: "text" },
      { key: "isSelf", label: "site:Is self", type: "switch" },
      { key: "enableAlert", label: "site:Enable alert", type: "switch" },
    ],
  },
  rules: {
    key: "rules",
    routeBase: "/management/rules",
    listTitle: "general:Rules",
    createTitle: "rule:New Rule",
    editTitle: "rule:Edit Rule",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-rules" }),
    createRoute: () => ({ name: "management-rules-new" }),
    editRoute: (record) => ({ name: "management-rules-edit", params: { owner: String(record.owner), name: String(record.name) } }),
    list: async (params, context) => unwrapList(await RuleApi.getRules({
      owner: ownerFromContext(context),
      page: Number(params.page || 1),
      pageSize: Number(params.pageSize || 10),
      field: String(params.searchedColumn || "name"),
      value: String(params.searchText || ""),
      sortField: String(params.sortField || ""),
      sortOrder: String(params.sortOrder || ""),
    }) as AnyResponse),
    get: async (params) => unwrap(await RuleApi.getRule(decodeRouteValue(params.owner), decodeRouteValue(params.name)) as AnyResponse) as ApiResponse<Entity>,
    create: async (entity) => unwrap(await RuleApi.addRule(entity) as AnyResponse),
    update: async (params, entity) => unwrap(await RuleApi.updateRule(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity) as AnyResponse),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await RuleApi.deleteRule(record || {}) as AnyResponse);
    },
    createDefault: (context) => ({
      owner: currentOrganization(context),
      name: `rule_${randomName()}`,
      displayName: "",
      priority: 1,
      forceSelf: false,
      submitState: "Allow",
      executeState: "Allow",
      action: "",
      resource: "",
    }),
    loadOptions: async (_entity) => ({
      organizations: await loadOrganizationOptions(),
    }),
    columns: [
      { key: "owner", title: "general:Owner", width: 120, sorter: true },
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/rules/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "displayName", title: "general:Display name", ellipsis: true },
      { key: "priority", title: "rule:Priority", width: 100 },
      { key: "action", title: "rule:Action", width: 150 },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text" },
      { key: "priority", label: "rule:Priority", type: "number" },
      { key: "action", label: "rule:Action", type: "text" },
      { key: "resource", label: "rule:Resource", type: "text" },
    ],
  },
  // LDAP
  ldaps: ({
    list: async (_params: Record<string, unknown>, context: ResourceContext) => unwrapList(await LdapApi.getLdaps(ownerFromContext(context)) as AnyResponse),
    get: async (params: Record<string, unknown>) => unwrap(await LdapApi.getLdap(decodeRouteValue(params.owner as string), decodeRouteValue(params.name as string)) as AnyResponse) as ApiResponse<Record<string, unknown>>,
    create: async (entity: Record<string, unknown>) => unwrap(await LdapApi.addLdap(entity as Parameters<typeof LdapApi.addLdap>[0]) as AnyResponse),
    update: async (_params: Record<string, unknown>, entity: Record<string, unknown>) => unwrap(await LdapApi.updateLdap(entity as Parameters<typeof LdapApi.updateLdap>[0]) as AnyResponse),
    removeByKey: async (key: string, records: Record<string, unknown>[]) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.id}`);
      return unwrap(await LdapApi.deleteLdap(record as Parameters<typeof LdapApi.deleteLdap>[0] || {}) as AnyResponse);
    },
    createDefault: (context: ResourceContext) => ({
      owner: context.organization || getStoredOrganization(),
      name: "",
      serverName: "",
      host: "",
      port: 389,
      useSSL: false,
      baseDn: "",
      bindDn: "",
      bindPassword: "",
      filters: {
        user: "(objectClass=person)",
        group: "(objectClass=group)",
      },
      attributeMapping: {
        user: {
          id: "uid",
          displayName: "cn",
          email: "mail",
          phone: "telephoneNumber",
          photo: "jpegPhoto",
        },
        group: {
          id: "cn",
          name: "cn",
          members: "member",
        },
      },
      syncUsers: false,
      syncGroups: false,
      autoSync: false,
      syncInterval: 0,
      interval: 0,
      isEnabled: true,
    }),
    loadOptions: async (_entity: Record<string, unknown>) => ({
      organizations: await loadOrganizationOptions(),
    }),
    columns: [
      { key: "owner", title: "general:Owner", width: 120, sorter: true },
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value: unknown, record: Record<string, unknown>) => renderTextLink(`/ldap/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "serverName", title: "ldap:Server Name", ellipsis: true },
      { key: "host", title: "ldap:Host", ellipsis: true },
      { key: "port", title: "ldap:Port", width: 80 },
      { key: "isEnabled", title: "general:Enabled", width: 80, render: (value: unknown) => renderBoolean(value) },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "serverName", label: "ldap:Server Name", type: "text", required: true },
      { key: "host", label: "ldap:Host", type: "text", required: true },
      { key: "port", label: "ldap:Port", type: "number", required: true },
      { key: "useSSL", label: "ldap:Use SSL", type: "switch" },
      { key: "baseDn", label: "ldap:Base DN", type: "text" },
      { key: "bindDn", label: "ldap:Bind DN", type: "text" },
      { key: "bindPassword", label: "ldap:Bind Password", type: "text" },
      { key: "syncUsers", label: "ldap:Sync Users", type: "switch" },
      { key: "syncGroups", label: "ldap:Sync Groups", type: "switch" },
      { key: "autoSync", label: "ldap:Auto Sync", type: "switch" },
      { key: "syncInterval", label: "ldap:Sync Interval (minutes)", type: "number" },
      { key: "isEnabled", label: "general:Enabled", type: "switch" },
    ],
  }) as unknown as ResourceConfig,
};