import { h } from "vue";
import { RouterLink } from "vue-router";
import { Tag } from "ant-design-vue";
import type { ApiResponse, ResourceConfig, ResourceContext, SelectOption } from "@/types/management";
import {
  applicationApi,
  groupApi,
  modelApi,
  organizationApi,
  permissionApi,
  providerApi,
  roleApi,
  userApi,
} from "@/api/management";
import {
  RBAC_MODEL,
  builtInObject,
  findRecordByKey,
  formatDate,
  getStoredOrganization,
  randomName,
  renderBoolean,
  renderTagList,
  stringifyValue,
  toOptions,
} from "@/utils/management";

type Entity = Record<string, unknown>;

const providerCategoryOptions = toOptions([
  "Captcha",
  "Email",
  "Notification",
  "OAuth",
  "Payment",
  "SAML",
  "SMS",
  "Storage",
  "Web3",
]);

const providerTypeMap: Record<string, string[]> = {
  Captcha: ["Default"],
  Email: ["Default", "SendGrid", "Resend", "Custom HTTP Email"],
  Notification: ["Default"],
  OAuth: ["GitHub", "Google", "WeChat", "DingTalk"],
  Payment: ["Dummy", "Balance", "Alipay"],
  SAML: ["Keycloak", "Custom"],
  SMS: ["Twilio SMS", "Mock SMS", "Custom HTTP SMS"],
  Storage: ["Local File System", "AWS S3", "MinIO"],
  Web3: ["MetaMask", "WalletConnect"],
};

function unwrap<T>(response: ApiResponse<T>): ApiResponse<T> {
  if (response.status !== "ok") {
    throw new Error(response.msg || "Request failed");
  }

  return response;
}

function unwrapList(response: ApiResponse<Entity[]>) {
  const result = unwrap(response);
  return {
    data: result.data || [],
    data2: result.data2 ?? result.data?.length ?? 0,
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

async function loadOrganizationOptions(): Promise<SelectOption[]> {
  const response = unwrap(await organizationApi.list("admin"));
  return (response.data || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: String(item.name),
  }));
}

async function loadOrganizationNameOptions(): Promise<SelectOption[]> {
  const response = unwrap(await organizationApi.names("admin"));
  return (response.data || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: String(item.name),
  }));
}

async function loadApplicationOptions(organization: string): Promise<SelectOption[]> {
  if (!organization || organization === "All") {
    return [];
  }

  const response = unwrap(await applicationApi.byOrganization("admin", organization, 1, 100));
  return (response.data || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: String(item.name),
  }));
}

async function loadUserOptions(organization: string): Promise<SelectOption[]> {
  if (!organization || organization === "All") {
    return [];
  }

  const response = unwrap(await userApi.list(organization, 1, 100));
  return (response.data || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: `${item.owner}/${item.name}`,
  }));
}

async function loadGroupOptions(organization: string): Promise<SelectOption[]> {
  if (!organization || organization === "All") {
    return [];
  }

  const response = unwrap(await groupApi.list(organization, false, 1, 100));
  return (response.data || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: `${item.owner}/${item.name}`,
  }));
}

async function loadRoleOptions(organization: string): Promise<SelectOption[]> {
  if (!organization || organization === "All") {
    return [];
  }

  const response = unwrap(await roleApi.list(organization, 1, 100));
  return (response.data || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: `${item.owner}/${item.name}`,
  }));
}

async function loadPermissionOptions(organization: string): Promise<SelectOption[]> {
  if (!organization || organization === "All") {
    return [];
  }

  const response = unwrap(await permissionApi.list(organization, 1, 100));
  return (response.data || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: `${item.owner}/${item.name}`,
  }));
}

async function loadModelOptions(organization: string): Promise<SelectOption[]> {
  if (!organization || organization === "All") {
    return [];
  }

  const response = unwrap(await modelApi.list(organization, 1, 100));
  return (response.data || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: `${item.owner}/${item.name}`,
  }));
}

async function loadProviderOptions(organization: string): Promise<SelectOption[]> {
  if (!organization || organization === "All") {
    return [];
  }

  const response = unwrap(await providerApi.list(organization, 1, 100));
  return (response.data || []).map((item) => ({
    label: String(item.displayName || item.name),
    value: String(item.name),
  }));
}

function decodeRouteValue(value: unknown): string {
  return decodeURIComponent(String(value || ""));
}

export const resourceConfigs: Record<string, ResourceConfig> = {
  users: {
    key: "users",
    routeBase: "/management/users",
    listTitle: "general:Users",
    createTitle: "user:New User",
    editTitle: "user:Edit User",
    searchField: "name",
    filters: [],
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-users" }),
    createRoute: () => ({ name: "management-users-new" }),
    editRoute: (record) => ({ name: "management-users-edit", params: { owner: record.owner, name: record.name } }),
    list: async (params, context) => {
      const response = context.organization === "All"
        ? await userApi.global(Number(params.page || 1), Number(params.pageSize || 10), String(params.searchedColumn || "name"), String(params.searchText || ""), String(params.sortField || ""), String(params.sortOrder || ""))
        : await userApi.list(currentOrganization(context), Number(params.page || 1), Number(params.pageSize || 10), String(params.searchedColumn || "name"), String(params.searchText || ""), String(params.sortField || ""), String(params.sortOrder || ""));
      return unwrapList(response);
    },
    get: async (params) => unwrap(await userApi.get(decodeRouteValue(params.owner), decodeRouteValue(params.name))),
    create: async (entity) => unwrap(await userApi.add(entity)),
    update: async (params, entity) => unwrap(await userApi.update(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity)),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await userApi.remove(record || {}));
    },
    createDefault: (context) => {
      const organization = currentOrganization(context);
      const suffix = randomName();
      return {
        owner: organization,
        name: `user_${suffix}`,
        displayName: `New User - ${suffix}`,
        email: `${suffix}@example.com`,
        phone: `${Date.now()}`.slice(-11),
        countryCode: "US",
        avatar: "https://cdn.casbin.org/img/casbin.svg",
        affiliation: "Example Inc.",
        tag: "staff",
        realName: "",
        groups: [],
        roles: [],
        permissions: [],
        signupApplication: "",
        isAdmin: organization === "built-in",
        isForbidden: false,
        isDeleted: false,
      };
    },
    loadOptions: async (entity) => ({
      organizations: await loadOrganizationOptions(),
      groups: await loadGroupOptions(String(entity.owner || "")),
      roles: await loadRoleOptions(String(entity.owner || "")),
      permissions: await loadPermissionOptions(String(entity.owner || "")),
      applications: await loadApplicationOptions(String(entity.owner || "")),
    }),
    columns: [
      {
        key: "name",
        title: "general:Name",
        sorter: true,
        width: 180,
        render: (_value, record) => renderTextLink(`/management/users/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)),
      },
      { key: "createdTime", title: "general:Created time", sorter: true, width: 180, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true, ellipsis: true },
      { key: "email", title: "general:Email", sorter: true, ellipsis: true },
      { key: "phone", title: "general:Phone", sorter: true },
      { key: "groups", title: "general:Groups", render: (value) => renderTagList(value) },
      { key: "roles", title: "general:Roles", render: (value) => renderTagList(value) },
      { key: "permissions", title: "general:Permissions", render: (value) => renderTagList(value) },
      { key: "isAdmin", title: "general:Is admin", sorter: true, width: 120, render: (value) => renderBoolean(value) },
      { key: "isForbidden", title: "general:Is forbidden", sorter: true, width: 140, render: (value) => renderBoolean(value) },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text", required: true },
      { key: "email", label: "general:Email", type: "text" },
      { key: "phone", label: "general:Phone", type: "text" },
      { key: "countryCode", label: "user:Country code", type: "text" },
      { key: "avatar", label: "general:Avatar", type: "text" },
      { key: "affiliation", label: "user:Affiliation", type: "text" },
      { key: "tag", label: "general:Tag", type: "text" },
      { key: "realName", label: "general:Real name", type: "text" },
      { key: "signupApplication", label: "user:Signup application", type: "select", optionSource: "applications" },
      { key: "groups", label: "general:Groups", type: "multiselect", optionSource: "groups" },
      { key: "roles", label: "general:Roles", type: "multiselect", optionSource: "roles" },
      { key: "permissions", label: "general:Permissions", type: "multiselect", optionSource: "permissions" },
      { key: "isAdmin", label: "general:Is admin", type: "switch" },
      { key: "isForbidden", label: "general:Is forbidden", type: "switch" },
      { key: "isDeleted", label: "general:Is deleted", type: "switch" },
    ],
  },
  organizations: {
    key: "organizations",
    routeBase: "/management/organizations",
    listTitle: "general:Organizations",
    createTitle: "organization:New Organization",
    editTitle: "organization:Edit Organization",
    searchField: "name",
    filters: [
      {
        key: "passwordType",
        label: "general:Password type",
        options: toOptions(["bcrypt", "plain", "salt", "md5-salt"]),
      },
    ],
    rowKey: (record) => String(record.name),
    listRoute: () => ({ name: "management-organizations" }),
    createRoute: () => ({ name: "management-organizations-new" }),
    editRoute: (record) => ({ name: "management-organizations-edit", params: { name: record.name } }),
    list: async (params, context) => unwrapList(await organizationApi.list("admin", ownerFromContext(context), Number(params.page || 1), Number(params.pageSize || 10), String(params.passwordType ? "passwordType" : params.searchedColumn || "name"), String(params.passwordType || params.searchText || ""), String(params.sortField || ""), String(params.sortOrder || ""))),
    get: async (params) => unwrap(await organizationApi.get("admin", decodeRouteValue(params.name))),
    create: async (entity) => unwrap(await organizationApi.add(entity)),
    update: async (params, entity) => unwrap(await organizationApi.update("admin", decodeRouteValue(params.name), entity)),
    removeByKey: async (key, records) => {
      const record = records.find((item) => String(item.name) === key);
      return unwrap(await organizationApi.remove(record || {}));
    },
    createDefault: () => {
      const suffix = randomName();
      return {
        owner: "admin",
        name: `organization_${suffix}`,
        displayName: `New Organization - ${suffix}`,
        websiteUrl: "https://door.casdoor.com",
        favicon: "https://cdn.casbin.org/img/favicon.png",
        passwordType: "bcrypt",
        defaultAvatar: "https://cdn.casbin.org/img/casbin.svg",
        defaultApplication: "",
        countryCodes: ["US"],
        tags: [],
        balanceCurrency: "USD",
        enableSoftDeletion: false,
        isProfilePublic: true,
        enableTour: true,
        disableSignin: false,
      };
    },
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/organizations/${record.name}`, String(record.name)) },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true, ellipsis: true },
      { key: "websiteUrl", title: "organization:Website URL", sorter: true, ellipsis: true },
      { key: "passwordType", title: "general:Password type", sorter: true, width: 150 },
      { key: "defaultAvatar", title: "general:Default avatar", ellipsis: true },
      { key: "balanceCurrency", title: "organization:Balance currency", width: 150 },
      { key: "enableSoftDeletion", title: "organization:Soft deletion", width: 150, render: (value) => renderBoolean(value) },
    ],
    fields: [
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text", required: true },
      { key: "websiteUrl", label: "organization:Website URL", type: "text" },
      { key: "favicon", label: "general:Favicon", type: "text" },
      { key: "passwordType", label: "general:Password type", type: "select", options: toOptions(["bcrypt", "plain", "salt", "md5-salt"]) },
      { key: "defaultAvatar", label: "general:Default avatar", type: "text" },
      { key: "defaultApplication", label: "organization:Default application", type: "text" },
      { key: "countryCodes", label: "user:Country code", type: "tags" },
      { key: "balanceCurrency", label: "organization:Balance currency", type: "text" },
      { key: "enableSoftDeletion", label: "organization:Soft deletion", type: "switch" },
      { key: "isProfilePublic", label: "organization:Is profile public", type: "switch" },
      { key: "enableTour", label: "organization:Enable tour", type: "switch" },
      { key: "disableSignin", label: "organization:Disable signin", type: "switch" },
    ],
    canDelete: (record) => String(record.name) !== "built-in",
  },
  applications: {
    key: "applications",
    routeBase: "/management/applications",
    listTitle: "general:Applications",
    createTitle: "application:New Application",
    editTitle: "application:Edit Application",
    searchField: "name",
    filters: [
      { key: "category", label: "general:Category", options: toOptions(["Default", "Agent"]) },
      { key: "type", label: "general:Type", options: toOptions(["All", "Web", "SPA", "Native"]) },
    ],
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-applications" }),
    createRoute: () => ({ name: "management-applications-new" }),
    editRoute: (record) => ({ name: "management-applications-edit", params: { organization: record.organization || record.owner, name: record.name } }),
    list: async (params, context) => {
      const field = params.category ? "category" : params.type ? "type" : String(params.searchedColumn || "name");
      const value = String(params.category || params.type || params.searchText || "");
      const response = context.organization === "All"
        ? await applicationApi.list("admin", Number(params.page || 1), Number(params.pageSize || 10), field, value, String(params.sortField || ""), String(params.sortOrder || ""))
        : await applicationApi.byOrganization("admin", currentOrganization(context), Number(params.page || 1), Number(params.pageSize || 10), field, value, String(params.sortField || ""), String(params.sortOrder || ""));
      return unwrapList(response);
    },
    get: async (params) => unwrap(await applicationApi.get("admin", decodeRouteValue(params.name))),
    create: async (entity) => unwrap(await applicationApi.add(entity)),
    update: async (params, entity) => unwrap(await applicationApi.update(decodeRouteValue(params.organization), decodeRouteValue(params.name), entity)),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await applicationApi.remove(record || {}));
    },
    createDefault: (context) => {
      const suffix = randomName();
      return {
        owner: "admin",
        organization: currentOrganization(context),
        name: `application_${suffix}`,
        displayName: `New Application - ${suffix}`,
        category: "Default",
        type: "All",
        logo: "https://cdn.casbin.org/img/kaixuan-platform-logo-light.svg",
        homepageUrl: "",
        redirectUris: ["http://localhost:9000/callback"],
        grantTypes: ["authorization_code", "password", "refresh_token"],
        providers: ["provider_captcha_default"],
        tokenFormat: "JWT",
        enablePassword: true,
        enableSignUp: true,
        disableSignin: false,
      };
    },
    loadOptions: async (entity) => ({
      organizations: await loadOrganizationOptions(),
      providers: await loadProviderOptions(String(entity.organization || entity.owner || "")),
    }),
    transformLoaded: (entity) => ({
      ...entity,
      providers: Array.isArray(entity.providers)
        ? entity.providers.map((item) => (typeof item === "string" ? item : String((item as Entity).name || ""))).filter(Boolean)
        : [],
      redirectUris: Array.isArray(entity.redirectUris) ? entity.redirectUris : [],
      grantTypes: Array.isArray(entity.grantTypes) ? entity.grantTypes : [],
    }),
    normalize: (entity) => ({
      ...entity,
      providers: Array.isArray(entity.providers)
        ? entity.providers.map((name) => ({
            name,
            canSignUp: false,
            canSignIn: false,
            canUnlink: false,
            prompted: false,
            signupGroup: "",
            rule: "",
          }))
        : [],
    }),
    columns: [
      {
        key: "name",
        title: "general:Name",
        width: 180,
        sorter: true,
        render: (_value, record) => renderTextLink(`/management/applications/${record.organization || record.owner}/${record.name}`, String(record.name)),
      },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true, ellipsis: true },
      { key: "category", title: "general:Category", sorter: true, width: 130, render: (value) => tag(String(value || "Default"), String(value || "") === "Agent" ? "success" : "default") },
      { key: "type", title: "general:Type", sorter: true, width: 120 },
      { key: "organization", title: "general:Organization", sorter: true, width: 150 },
      { key: "providers", title: "application:Providers", render: (value) => renderTagList(Array.isArray(value) ? value.map((item) => typeof item === "string" ? item : (item as Entity).name) : []) },
      { key: "enableSignUp", title: "application:Enable sign up", render: (value) => renderBoolean(value), width: 150 },
      { key: "disableSignin", title: "application:Disable signin", render: (value) => renderBoolean(value), width: 150 },
    ],
    fields: [
      { key: "organization", label: "general:Organization", type: "select", required: true, optionSource: "organizations", help: "application:Organization scoped editing" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text", required: true },
      { key: "category", label: "general:Category", type: "select", options: toOptions(["Default", "Agent"]) },
      { key: "type", label: "general:Type", type: "select", options: toOptions(["All", "Web", "SPA", "Native"]) },
      { key: "logo", label: "general:Logo", type: "text" },
      { key: "homepageUrl", label: "application:Homepage URL", type: "text" },
      { key: "redirectUris", label: "application:Redirect URIs", type: "tags" },
      { key: "grantTypes", label: "application:Grant types", type: "multiselect", options: toOptions(["authorization_code", "password", "client_credentials", "refresh_token", "token", "id_token"]) },
      { key: "providers", label: "application:Providers", type: "multiselect", optionSource: "providers" },
      { key: "tokenFormat", label: "application:Token format", type: "select", options: toOptions(["JWT", "Reference"]) },
      { key: "enablePassword", label: "application:Enable password", type: "switch" },
      { key: "enableSignUp", label: "application:Enable sign up", type: "switch" },
      { key: "disableSignin", label: "application:Disable signin", type: "switch" },
    ],
    canDelete: (record) => String(record.name) !== "app-built-in",
  },
  roles: {
    key: "roles",
    routeBase: "/management/roles",
    listTitle: "general:Roles",
    createTitle: "role:New Role",
    editTitle: "role:Edit Role",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-roles" }),
    createRoute: () => ({ name: "management-roles-new" }),
    editRoute: (record) => ({ name: "management-roles-edit", params: { owner: record.owner, name: record.name } }),
    list: async (params, context) => unwrapList(await roleApi.list(ownerFromContext(context), Number(params.page || 1), Number(params.pageSize || 10), String(params.searchedColumn || "name"), String(params.searchText || ""), String(params.sortField || ""), String(params.sortOrder || ""))),
    get: async (params) => unwrap(await roleApi.get(decodeRouteValue(params.owner), decodeRouteValue(params.name))),
    create: async (entity) => unwrap(await roleApi.add(entity)),
    update: async (params, entity) => unwrap(await roleApi.update(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity)),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await roleApi.remove(record || {}));
    },
    createDefault: (context) => {
      const suffix = randomName();
      const owner = currentOrganization(context);
      return {
        owner,
        name: `role_${suffix}`,
        displayName: `New Role - ${suffix}`,
        description: "",
        users: [],
        groups: [],
        roles: [],
        domains: [],
        isEnabled: true,
      };
    },
    loadOptions: async (entity) => ({
      organizations: await loadOrganizationOptions(),
      users: await loadUserOptions(String(entity.owner || "")),
      groups: await loadGroupOptions(String(entity.owner || "")),
      roles: await loadRoleOptions(String(entity.owner || "")),
    }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/roles/${record.owner}/${record.name}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true, ellipsis: true },
      { key: "users", title: "role:Sub users", render: (value) => renderTagList(value) },
      { key: "groups", title: "role:Sub groups", render: (value) => renderTagList(value) },
      { key: "roles", title: "role:Sub roles", render: (value) => renderTagList(value) },
      { key: "domains", title: "role:Sub domains", render: (value) => renderTagList(value) },
      { key: "isEnabled", title: "general:Is enabled", width: 120, render: (value) => renderBoolean(value) },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text", required: true },
      { key: "description", label: "general:Description", type: "textarea", rows: 3 },
      { key: "users", label: "role:Sub users", type: "multiselect", optionSource: "users" },
      { key: "groups", label: "role:Sub groups", type: "multiselect", optionSource: "groups" },
      { key: "roles", label: "role:Sub roles", type: "multiselect", optionSource: "roles" },
      { key: "domains", label: "role:Sub domains", type: "tags" },
      { key: "isEnabled", label: "general:Is enabled", type: "switch" },
    ],
  },
  permissions: {
    key: "permissions",
    routeBase: "/management/permissions",
    listTitle: "general:Permissions",
    createTitle: "permission:New Permission",
    editTitle: "permission:Edit Permission",
    searchField: "name",
    filters: [
      {
        key: "effect",
        label: "permission:Effect",
        options: toOptions(["Allow", "Deny"]),
      },
    ],
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-permissions" }),
    createRoute: () => ({ name: "management-permissions-new" }),
    editRoute: (record) => ({ name: "management-permissions-edit", params: { owner: record.owner, name: record.name } }),
    list: async (params, context) => {
      const field = params.effect ? "effect" : String(params.searchedColumn || "name");
      const value = String(params.effect || params.searchText || "");
      return unwrapList(await permissionApi.list(ownerFromContext(context), Number(params.page || 1), Number(params.pageSize || 10), field, value, String(params.sortField || ""), String(params.sortOrder || "")));
    },
    get: async (params) => unwrap(await permissionApi.get(decodeRouteValue(params.owner), decodeRouteValue(params.name))),
    create: async (entity) => unwrap(await permissionApi.add(entity)),
    update: async (params, entity) => unwrap(await permissionApi.update(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity)),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await permissionApi.remove(record || {}));
    },
    createDefault: (context) => {
      const suffix = randomName();
      const owner = currentOrganization(context);
      return {
        owner,
        name: `permission_${suffix}`,
        displayName: `New Permission - ${suffix}`,
        description: "",
        model: "",
        users: [],
        groups: [],
        roles: [],
        domains: [],
        resourceType: "Application",
        resources: [],
        actions: ["Read"],
        effect: "Allow",
        isEnabled: true,
        submitter: "",
        approver: "",
        state: "Pending",
      };
    },
    loadOptions: async (entity) => ({
      organizations: await loadOrganizationOptions(),
      users: await loadUserOptions(String(entity.owner || "")),
      groups: await loadGroupOptions(String(entity.owner || "")),
      roles: await loadRoleOptions(String(entity.owner || "")),
      models: await loadModelOptions(String(entity.owner || "")),
      applications: await loadApplicationOptions(String(entity.owner || "")),
    }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/permissions/${record.owner}/${encodeURIComponent(String(record.name))}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 140, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true, ellipsis: true },
      { key: "model", title: "general:Model", ellipsis: true },
      { key: "users", title: "role:Sub users", render: (value) => renderTagList(value) },
      { key: "groups", title: "role:Sub groups", render: (value) => renderTagList(value) },
      { key: "roles", title: "role:Sub roles", render: (value) => renderTagList(value) },
      { key: "resources", title: "general:Resources", render: (value) => renderTagList(value) },
      { key: "actions", title: "permission:Actions", render: (value) => renderTagList(value) },
      { key: "effect", title: "permission:Effect", render: (value) => tag(String(value || "Allow"), String(value || "") === "Allow" ? "success" : "error") },
      { key: "state", title: "general:State", render: (value) => tag(String(value || "Pending"), String(value || "") === "Approved" ? "success" : "warning") },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text", required: true },
      { key: "description", label: "general:Description", type: "textarea", rows: 3 },
      { key: "model", label: "general:Model", type: "select", optionSource: "models" },
      { key: "users", label: "role:Sub users", type: "multiselect", optionSource: "users" },
      { key: "groups", label: "role:Sub groups", type: "multiselect", optionSource: "groups" },
      { key: "roles", label: "role:Sub roles", type: "multiselect", optionSource: "roles" },
      { key: "domains", label: "role:Sub domains", type: "tags" },
      { key: "resourceType", label: "permission:Resource type", type: "select", options: toOptions(["Application"]) },
      { key: "resources", label: "general:Resources", type: "multiselect", optionSource: "applications" },
      { key: "actions", label: "permission:Actions", type: "multiselect", options: toOptions(["Read", "Write", "Admin"]) },
      { key: "effect", label: "permission:Effect", type: "select", options: toOptions(["Allow", "Deny"]) },
      { key: "isEnabled", label: "general:Is enabled", type: "switch" },
      { key: "state", label: "general:State", type: "select", options: toOptions(["Pending", "Approved"]) },
    ],
  },
  models: {
    key: "models",
    routeBase: "/management/models",
    listTitle: "general:Models",
    createTitle: "model:New Model",
    editTitle: "model:Edit Model",
    searchField: "name",
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-models" }),
    createRoute: () => ({ name: "management-models-new" }),
    editRoute: (record) => ({ name: "management-models-edit", params: { owner: record.owner, name: record.name } }),
    list: async (params, context) => unwrapList(await modelApi.list(ownerFromContext(context), Number(params.page || 1), Number(params.pageSize || 10), String(params.searchedColumn || "name"), String(params.searchText || ""), String(params.sortField || ""), String(params.sortOrder || ""))),
    get: async (params) => unwrap(await modelApi.get(decodeRouteValue(params.owner), decodeRouteValue(params.name))),
    create: async (entity) => unwrap(await modelApi.add(entity)),
    update: async (params, entity) => unwrap(await modelApi.update(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity)),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await modelApi.remove(record || {}));
    },
    createDefault: (context) => {
      const suffix = randomName();
      const owner = currentOrganization(context);
      return {
        owner,
        name: `model_${suffix}`,
        displayName: `New Model - ${suffix}`,
        description: "",
        modelText: RBAC_MODEL,
      };
    },
    loadOptions: async () => ({
      organizations: await loadOrganizationOptions(),
    }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/models/${record.owner}/${record.name}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true },
      { key: "modelText", title: "model:Model text", ellipsis: true, render: (value) => stringifyValue(value).slice(0, 100) || "-" },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations", disabled: (entity) => builtInObject(entity) },
      { key: "name", label: "general:Name", type: "text", required: true, disabled: (entity) => builtInObject(entity) },
      { key: "displayName", label: "general:Display name", type: "text", required: true },
      { key: "description", label: "general:Description", type: "textarea", rows: 3 },
      { key: "modelText", label: "model:Model text", type: "textarea", rows: 12, required: true },
    ],
    canDelete: (record) => !builtInObject(record),
  },
  providers: {
    key: "providers",
    routeBase: "/management/providers",
    listTitle: "application:Providers",
    createTitle: "provider:New Provider",
    editTitle: "provider:Edit Provider",
    searchField: "name",
    filters: [
      { key: "category", label: "general:Category", options: providerCategoryOptions },
    ],
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-providers" }),
    createRoute: () => ({ name: "management-providers-new" }),
    editRoute: (record) => ({ name: "management-providers-edit", params: { owner: record.owner, name: record.name } }),
    list: async (params, context) => {
      const field = params.category ? "category" : String(params.searchedColumn || "name");
      const value = String(params.category || params.searchText || "");
      const response = context.organization === "All"
        ? await providerApi.global(Number(params.page || 1), Number(params.pageSize || 10), field, value, String(params.sortField || ""), String(params.sortOrder || ""))
        : await providerApi.list(currentOrganization(context), Number(params.page || 1), Number(params.pageSize || 10), field, value, String(params.sortField || ""), String(params.sortOrder || ""));
      return unwrapList(response);
    },
    get: async (params) => unwrap(await providerApi.get(decodeRouteValue(params.owner), decodeRouteValue(params.name))),
    create: async (entity) => unwrap(await providerApi.add(entity)),
    update: async (params, entity) => unwrap(await providerApi.update(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity)),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await providerApi.remove(record || {}));
    },
    createDefault: (context) => {
      const suffix = randomName();
      const owner = currentOrganization(context);
      return {
        owner,
        name: `provider_${suffix}`,
        displayName: `New Provider - ${suffix}`,
        category: "OAuth",
        type: "GitHub",
        method: "Normal",
        clientId: "",
        clientSecret: "",
        providerUrl: "",
        host: "",
        port: 0,
        enableSignUp: true,
        disableSsl: false,
      };
    },
    loadOptions: async (entity) => ({
      organizations: await loadOrganizationOptions(),
      providerTypes: toOptions(providerTypeMap[String(entity.category || "OAuth")] || providerTypeMap.OAuth),
    }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/providers/${record.owner}/${record.name}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 150, sorter: true, render: (value) => String(value || "") === "admin" ? "admin (Shared)" : String(value || "") },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true },
      { key: "category", title: "general:Category", sorter: true, width: 130 },
      { key: "type", title: "general:Type", sorter: true, width: 140 },
      { key: "clientId", title: "provider:Client ID", ellipsis: true },
      { key: "providerUrl", title: "provider:Provider URL", ellipsis: true },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text", required: true },
      { key: "category", label: "general:Category", type: "select", options: providerCategoryOptions },
      { key: "type", label: "general:Type", type: "select", optionSource: "providerTypes" },
      { key: "method", label: "provider:Method", type: "select", options: toOptions(["Normal", "Prompted"]) },
      { key: "clientId", label: "provider:Client ID", type: "text" },
      { key: "clientSecret", label: "provider:Client Secret", type: "text" },
      { key: "providerUrl", label: "provider:Provider URL", type: "text" },
      { key: "host", label: "provider:Host", type: "text" },
      { key: "port", label: "provider:Port", type: "number", min: 0 },
      { key: "enableSignUp", label: "provider:Enable sign up", type: "switch" },
      { key: "disableSsl", label: "provider:Disable SSL", type: "switch" },
    ],
  },
  groups: {
    key: "groups",
    routeBase: "/management/groups",
    listTitle: "general:Groups",
    createTitle: "group:New Group",
    editTitle: "group:Edit Group",
    searchField: "name",
    filters: [
      { key: "type", label: "general:Type", options: toOptions(["Virtual", "Physical"]) },
    ],
    rowKey: (record) => `${record.owner}/${record.name}`,
    listRoute: () => ({ name: "management-groups" }),
    createRoute: () => ({ name: "management-groups-new" }),
    editRoute: (record) => ({ name: "management-groups-edit", params: { owner: record.owner, name: record.name } }),
    list: async (params, context) => {
      const field = params.type ? "type" : String(params.searchedColumn || "name");
      const value = String(params.type || params.searchText || "");
      return unwrapList(await groupApi.list(ownerFromContext(context), false, Number(params.page || 1), Number(params.pageSize || 10), field, value, String(params.sortField || ""), String(params.sortOrder || "")));
    },
    get: async (params) => unwrap(await groupApi.get(decodeRouteValue(params.owner), decodeRouteValue(params.name))),
    create: async (entity) => unwrap(await groupApi.add(entity)),
    update: async (params, entity) => unwrap(await groupApi.update(decodeRouteValue(params.owner), decodeRouteValue(params.name), entity)),
    removeByKey: async (key, records) => {
      const record = findRecordByKey(key, records, (item) => `${item.owner}/${item.name}`);
      return unwrap(await groupApi.remove(record || {}));
    },
    createDefault: (context, routeState) => {
      const suffix = randomName();
      const owner = currentOrganization(context);
      const parentId = String(routeState?.query.parentId || owner);
      return {
        owner,
        name: `group_${suffix}`,
        displayName: `New Group - ${suffix}`,
        type: "Virtual",
        parentId,
        isTopGroup: parentId === owner,
        users: [],
        isEnabled: true,
      };
    },
    loadOptions: async (entity) => {
      const owner = String(entity.owner || getStoredOrganization());
      const [organizationOptions, groupOptions, userOptions] = await Promise.all([
        loadOrganizationNameOptions(),
        loadGroupOptions(owner),
        loadUserOptions(owner),
      ]);
      const filteredParentGroups = groupOptions.filter((item) => String(item.value) !== `${entity.owner}/${entity.name}`).map((item) => ({
        ...item,
        value: String(item.value).split("/").slice(1).join("/"),
      }));
      return {
        organizations: organizationOptions,
        parentGroups: [
          ...organizationOptions.filter((item) => String(item.value) === owner).map((item) => ({ label: String(item.label), value: owner })),
          ...filteredParentGroups.map((item) => ({ label: String(item.label), value: item.value })),
        ],
        users: userOptions,
      };
    },
    normalize: (entity) => ({
      ...entity,
      isTopGroup: String(entity.parentId || "") === String(entity.owner || ""),
    }),
    columns: [
      { key: "name", title: "general:Name", width: 180, sorter: true, render: (_value, record) => renderTextLink(`/management/groups/${record.owner}/${record.name}`, String(record.name)) },
      { key: "owner", title: "general:Organization", width: 150, sorter: true },
      { key: "createdTime", title: "general:Created time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "updatedTime", title: "general:Updated time", width: 180, sorter: true, render: (value) => formatDate(String(value || "")) },
      { key: "displayName", title: "general:Display name", sorter: true, ellipsis: true },
      { key: "type", title: "general:Type", sorter: true, width: 130 },
      { key: "parentId", title: "group:Parent group", sorter: true, ellipsis: true },
      { key: "users", title: "general:Users", render: (value) => renderTagList(value) },
      { key: "haveChildren", title: "group:Has children", width: 140, render: (value) => renderBoolean(value) },
    ],
    fields: [
      { key: "owner", label: "general:Organization", type: "select", required: true, optionSource: "organizations" },
      { key: "name", label: "general:Name", type: "text", required: true },
      { key: "displayName", label: "general:Display name", type: "text", required: true },
      { key: "type", label: "general:Type", type: "select", options: toOptions(["Virtual", "Physical"]) },
      { key: "parentId", label: "group:Parent group", type: "select", optionSource: "parentGroups" },
      { key: "users", label: "general:Users", type: "multiselect", optionSource: "users" },
      { key: "isEnabled", label: "general:Is enabled", type: "switch" },
    ],
    canDelete: (record) => !Boolean(record.haveChildren),
  },
};
