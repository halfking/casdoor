import { get, post, qs, idQuery, type ApiResponse, type PaginatedResponse, type ListParams } from "../base";
import type { User } from "../types";

/* ───────── standard CRUD ───────── */

export function getGlobalUsers(params: Omit<ListParams, "owner">) {
  return get<User[]>(qs("/api/get-global-users", params)) as Promise<PaginatedResponse<User>>;
}

export function getUsers(params: ListParams & { groupName?: string }) {
  return get<User[]>(qs("/api/get-users", params)) as Promise<PaginatedResponse<User>>;
}

export function getUser(owner: string, name: string) {
  return get<User>(idQuery("/api/get-user", owner, name));
}

export function addUser(user: Partial<User>) {
  return post("/api/add-user", user);
}

export function addUserKeys(user: Partial<User>) {
  return post("/api/add-user-keys", user);
}

export function updateUser(owner: string, name: string, user: Partial<User>) {
  return post(idQuery("/api/update-user", owner, name), user);
}

export function deleteUser(user: Partial<User>) {
  return post("/api/delete-user", user);
}

/* ───────── FormData helpers ───────── */

function toFormData(fields: Record<string, string | undefined>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== "") fd.append(k, v);
  }
  return fd;
}

/* ───────── password / verification ───────── */

export function setPassword(
  userOwner: string,
  userName: string,
  oldPassword: string,
  newPassword: string,
  code?: string
) {
  return post(
    "/api/set-password",
    toFormData({ userOwner, userName, oldPassword, newPassword, code })
  );
}

export function sendCode(params: {
  captchaType: string;
  captchaToken: string;
  clientSecret: string;
  method: string;
  countryCode?: string;
  dest: string;
  type: string;
  applicationId: string;
  checkUser?: string;
}) {
  return post("/api/send-verification-code", toFormData(params as Record<string, string>));
}

export function verifyCaptcha(
  owner: string,
  name: string,
  captchaType: string,
  captchaToken: string,
  clientSecret: string
) {
  return post(
    "/api/verify-captcha",
    toFormData({
      captchaType,
      captchaToken,
      clientSecret,
      applicationId: `${owner}/${name}`,
    })
  );
}

export function resetEmailOrPhone(dest: string, type: string, code: string) {
  return post("/api/reset-email-or-phone", toFormData({ dest, type, code }));
}

/* ───────── impersonate ───────── */

export function impersonateUser(username: string) {
  return post("/api/impersonate-user", toFormData({ username }));
}

export function exitImpersonateUser() {
  return post("/api/exit-impersonate-user", {});
}

/* ───────── captcha / code / password check ───────── */

export function getCaptcha(owner: string, name: string, isCurrentProvider: boolean) {
  return get(
    `/api/get-captcha?applicationId=${owner}/${encodeURIComponent(name)}&isCurrentProvider=${isCurrentProvider}`
  );
}

export function verifyCode(values: Record<string, unknown>) {
  return post("/api/verify-code", values);
}

export function checkUserPassword(values: Record<string, unknown>) {
  return post("/api/check-user-password", values);
}

/* ───────── group ───────── */

export function removeUserFromGroup(owner: string, name: string, groupName: string) {
  return post("/api/remove-user-from-group", toFormData({ owner, name, groupName }));
}

/* ───────── identification ───────── */

export function verifyIdentification(owner: string, name: string, provider: string) {
  const params = new URLSearchParams({ owner, name, provider });
  return post(`/api/verify-identification?${params.toString()}`, undefined);
}

/* ───────── external address/affiliation ───────── */

export function getAddressOptions(url: string) {
  return get(url);
}

export function getAffiliationOptions(url: string, code: string) {
  return get(`${url}/${code}`);
}
