import { get, post } from "../base";

/* ───────── OAuth / CAS query helpers ───────── */

export interface OAuthParams {
  clientId?: string;
  responseType?: string;
  redirectUri?: string;
  type?: string;
  scope?: string;
  state?: string;
  nonce?: string;
  code_challenge_method?: string;
  code_challenge?: string;
}

export interface CasLoginParams {
  type?: string;
  id?: string;
  redirectUri?: string;
  service?: string;
}

function oAuthParamsToQuery(params?: OAuthParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, v);
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

function casLoginParamsToQuery(params?: CasLoginParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.type) q.set("type", params.type);
  if (params.id) q.set("id", params.id);
  if (params.redirectUri) q.set("redirectUri", params.redirectUri);
  const s = q.toString();
  return s ? `?${s}` : "";
}

/* ───────── account ───────── */

export function getAccount(query = "") {
  const hasQueryPrefix = query.startsWith("?");
  const baseQuery = query === "" ? "" : (hasQueryPrefix ? query : `?${query}`);
  const separator = baseQuery.includes("?") ? "&" : "?";
  return get(`/api/get-account${baseQuery}${separator}_ts=${Date.now()}`);
}

export function signup(values: Record<string, unknown>, oAuthParams?: OAuthParams) {
  return post(`/api/signup${oAuthParamsToQuery(oAuthParams)}`, values);
}

export function getEmailAndPhone(organization: string, username: string) {
  return get(
    `/api/get-email-and-phone?organization=${encodeURIComponent(organization)}&username=${encodeURIComponent(username)}`
  );
}

/* ───────── application login ───────── */

export function getApplicationLogin(params: {
  type?: string;
  id?: string;
  clientId?: string;
  responseType?: string;
  redirectUri?: string;
  service?: string;
  scope?: string;
  state?: string;
  device_code?: string;
}) {
  let query = "";
  if (params.type === "cas") {
    query = casLoginParamsToQuery(params as CasLoginParams);
  } else if (params.type === "device") {
    const q = new URLSearchParams();
    if (params.type) q.set("type", params.type);
    if (params.device_code) q.set("device_code", params.device_code);
    query = `?${q.toString()}`;
  } else {
    query = oAuthParamsToQuery(params as OAuthParams);
  }
  return get(`/api/get-app-login${query}`);
}

/* ───────── login / logout ───────── */

export function login(values: Record<string, unknown>, oAuthParams?: OAuthParams) {
  return post(`/api/login${oAuthParamsToQuery(oAuthParams)}`, values);
}

export function loginCas(values: Record<string, unknown>, params: { service: string }) {
  return post(`/api/login?service=${encodeURIComponent(params.service)}`, values);
}

export function logout() {
  return post("/api/logout", {});
}

export function unlink(values: Record<string, unknown>) {
  return post("/api/unlink", values);
}

/* ───────── SAML ───────── */

export function getSamlLogin(providerId: string, relayState: string) {
  return get(
    `/api/get-saml-login?id=${encodeURIComponent(providerId)}&relayState=${encodeURIComponent(relayState)}`
  );
}

export function loginWithSaml(values: Record<string, unknown>, queryString: string) {
  return post(`/api/login${queryString}`, values);
}

/* ───────── WeChat ───────── */

export function getWechatMessageEvent(ticket: string) {
  return get(`/api/get-webhook-event?ticket=${encodeURIComponent(ticket)}`);
}

export function getWechatQRCode(providerId: string) {
  return get(`/api/get-qrcode?id=${encodeURIComponent(providerId)}`);
}

/* ───────── captcha status ───────── */

export function getCaptchaStatus(values: {
  organization: string;
  username: string;
  application: string;
}) {
  const q = new URLSearchParams({
    organization: values.organization,
    userId: values.username,
    application: values.application,
  });
  return get(`/api/get-captcha-status?${q.toString()}`);
}
