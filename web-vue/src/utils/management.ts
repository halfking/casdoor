import dayjs from "dayjs";
import { message, Tag } from "ant-design-vue";
import { h } from "vue";
import { RouterLink } from "vue-router";
import type { ResourceContext, SelectOption } from "@/types/management";

declare global {
  interface Window {
    __CASDOOR_ACCOUNT__?: {
      owner?: string;
      name?: string;
      displayName?: string;
      isAdmin?: boolean;
    };
  }
}

export const MAX_PAGE_SIZE = 25;

export const RBAC_MODEL = `[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act`;

const BUILT_IN_OBJECTS = new Set([
  "api-enforcer-built-in",
  "user-enforcer-built-in",
  "api-model-built-in",
  "user-model-built-in",
  "api-adapter-built-in",
  "user-adapter-built-in",
]);

export function showMessage(type: "success" | "error" | "info", text: string): void {
  message[type](text);
}

export function formatDate(date?: string | null): string {
  if (!date) {
    return "-";
  }

  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
}

export function randomName(): string {
  return Math.random().toString(36).slice(-6);
}

export function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

export function getStoredLanguage(): string {
  return localStorage.getItem("language") || "en";
}

export function getAcceptLanguage(): string {
  const language = getStoredLanguage();
  return `${language};q=0.9,en;q=0.8`;
}

export function getStoredOrganization(): string {
  return localStorage.getItem("organization") || "All";
}

export function setStoredOrganization(organization: string): void {
  localStorage.setItem("organization", organization);
  window.dispatchEvent(new Event("storageOrganizationChanged"));
}

export function getRuntimeAccount() {
  return window.__CASDOOR_ACCOUNT__ || {};
}

export function getResourceContext(): ResourceContext {
  const account = getRuntimeAccount();
  const accountOwner = account.owner || "built-in";
  const isAdmin = accountOwner === "built-in" || account.isAdmin === true;
  const organization = isAdmin ? getStoredOrganization() : accountOwner;

  return {
    organization,
    accountOwner,
    isAdmin,
  };
}

export function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function toOptions(values: Array<string | number>): SelectOption[] {
  return values.map((value) => ({
    label: String(value),
    value,
  }));
}

export function renderTagList(values: unknown, routePrefix?: string) {
  if (!Array.isArray(values) || values.length === 0) {
    return "-";
  }

  return values.map((value) => {
    const text = String(value);
    const tagNode = h(Tag, { color: "processing" }, () => text);

    if (!routePrefix) {
      return tagNode;
    }

    return h(
      RouterLink,
      { to: `${routePrefix}/${encodeURIComponent(text)}` },
      () => tagNode,
    );
  });
}

export function renderBoolean(value: unknown) {
  const checked = Boolean(value);
  return h(Tag, { color: checked ? "success" : "default" }, () => (checked ? "ON" : "OFF"));
}

export function builtInObject(record: Record<string, unknown>): boolean {
  return record.owner === "built-in" && BUILT_IN_OBJECTS.has(String(record.name || ""));
}

export function findRecordByKey(key: string, records: Record<string, unknown>[], rowKey: (record: Record<string, unknown>) => string) {
  return records.find((record) => rowKey(record) === key);
}

export function splitCompositeKey(key: string): [string, string] {
  const [owner, ...rest] = key.split("/");
  return [owner, rest.join("/")];
}
