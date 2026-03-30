// Shared utility functions — ported from web/src/Setting.js
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import * as Conf from "../Conf";
import type { Application, Organization, User } from "../api/types";

/* ───────── Constants ───────── */

export const ServerUrl = "";
export const StaticBaseUrl = "https://cdn.casbin.org";

/* ───────── Navigation ───────── */

export function openLink(link: string) {
  const w = window.open(link, "_blank");
  if (w) w.focus();
}

export function goToLink(link: string) {
  window.location.href = link;
}

export function goToLinkSoft(router: { push: (path: string) => void }, link: string) {
  if (link.startsWith("http://") || link.startsWith("https://")) {
    openLink(link);
  } else {
    router.push(link);
  }
}

export function goToLogin(router: { push: (path: string) => void }) {
  router.push("/login");
}

/* ───────── Message ───────── */

export function showMessage(
  type: "success" | "error" | "info" | "warning",
  text: string
) {
  if (type === "success") {
    message.success(text);
  } else if (type === "error") {
    message.error(text);
  } else if (type === "warning") {
    message.warning(text);
  } else {
    message.info(text);
  }
}

/* ───────── User helpers ───────── */

export function isAdminUser(account: { owner?: string } | null): boolean {
  return account?.owner === "built-in";
}

export function isLocalAdminUser(
  account: { owner?: string; isAdmin?: boolean } | null
): boolean {
  return account?.isAdmin === true || isAdminUser(account);
}

/* ───────── Mobile detection ───────── */

export function isMobile(): boolean {
  return window.innerWidth <= 768;
}

/* ───────── Language ───────── */

export function getLanguage(): string {
  const stored = localStorage.getItem("i18nextLng");
  return stored || Conf.DefaultLanguage;
}

export function setLanguage(lang: string) {
  localStorage.setItem("i18nextLng", lang);
}

/**
 * Parse multi-language text like "English|中文".
 * If the text contains "|", split and pick the correct segment based on current language.
 */
export function getLanguageText(text: string): string {
  if (!text || !text.includes("|")) return text;
  const parts = text.split("|");
  const lang = getLanguage();
  if (lang === "zh") return parts[1] || parts[0];
  return parts[0];
}

/* ───────── Provider visibility ───────── */

export function isProviderVisible(providerItem: {
  provider?: { category?: string; type?: string };
}): boolean {
  if (!providerItem?.provider) return false;
  const cat = providerItem.provider.category;
  if (cat !== "OAuth" && cat !== "SAML" && cat !== "Web3") return false;
  if (providerItem.provider.type === "WeChatMiniProgram") return false;
  return true;
}

export function isProviderVisibleForSignUp(providerItem: {
  canSignUp?: boolean;
  provider?: { category?: string; type?: string };
}): boolean {
  if (providerItem.canSignUp === false) return false;
  return isProviderVisible(providerItem);
}

export function isProviderVisibleForSignIn(providerItem: {
  canSignIn?: boolean;
  provider?: { category?: string; type?: string };
}): boolean {
  if (providerItem.canSignIn === false) return false;
  return isProviderVisible(providerItem);
}

export function isProviderPrompted(providerItem: {
  prompted?: boolean;
  provider?: { category?: string; type?: string };
}): boolean {
  return !!providerItem.prompted && isProviderVisible(providerItem);
}

/* ───────── Application item helpers ───────── */

export function getSignupItem(
  application: Application | null,
  itemName: string
) {
  if (!application?.signupItems) return null;
  return application.signupItems.find((item) => item.name === itemName) ?? null;
}

export function getSigninItem(
  application: Application | null,
  itemName: string
) {
  if (!application?.signinItems) return null;
  return application.signinItems.find((item) => item.name === itemName) ?? null;
}

/* ───────── Login method detection ───────── */

function isSigninMethodEnabled(
  application: Application | null,
  method: string
): boolean {
  if (!application?.signinMethods) return false;
  return application.signinMethods.some(
    (m) => m.name === method && m.rule !== "None"
  );
}

export function isPasswordEnabled(application: Application | null): boolean {
  return isSigninMethodEnabled(application, "Password");
}

export function isCodeSigninEnabled(application: Application | null): boolean {
  return isSigninMethodEnabled(application, "Verification code");
}

export function isWebAuthnEnabled(application: Application | null): boolean {
  return isSigninMethodEnabled(application, "WebAuthn");
}

export function isLdapEnabled(application: Application | null): boolean {
  return isSigninMethodEnabled(application, "LDAP");
}

export function isFaceIdEnabled(application: Application | null): boolean {
  return isSigninMethodEnabled(application, "Face ID");
}

/* ───────── Login link ───────── */

export function getLoginLink(application: Application | null): string {
  if (!application) return "/login";
  const path = window.location.pathname;
  if (path.includes("/login/oauth/authorize")) {
    return path + window.location.search;
  }
  if (path.includes("/login/saml/authorize")) {
    return path;
  }
  return `/login/${application.name}`;
}

export function redirectToLoginPage(
  application: Application | null,
  router: { push: (path: string) => void }
) {
  const link = getLoginLink(application);
  goToLinkSoft(router, link);
}

export function getApplicationName(application: Application | null): string {
  if (!application) return "";
  let name = `${application.owner}/${application.name}`;
  if ((application as any).isShared && application.organization) {
    name += `-org-${application.organization}`;
  }
  return name;
}

/* ───────── Prompt page helpers ───────── */

export function isSignupItemPrompted(signupItem: { visible?: boolean; prompted?: boolean }): boolean {
  return !!signupItem.visible && !!signupItem.prompted;
}

export function getAllPromptedProviderItems(application: Application | null) {
  return application?.providers?.filter((p) => isProviderPrompted(p)) ?? [];
}

export function getAllPromptedSignupItems(application: Application | null) {
  return application?.signupItems?.filter((s) => isSignupItemPrompted(s)) ?? [];
}

export function isAffiliationPrompted(application: Application | null): boolean {
  const item = getSignupItem(application, "Affiliation");
  if (!item) return false;
  return !!item.prompted;
}

export function hasPromptPage(application: Application | null): boolean {
  const providerItems = getAllPromptedProviderItems(application);
  if (providerItems.length > 0) return true;
  const signupItems = getAllPromptedSignupItems(application);
  if (signupItems.filter((i: any) => i.name === "Country/Region").length > 0) return true;
  return isAffiliationPrompted(application);
}

function isAffiliationAnswered(user: User | null, application: Application | null): boolean {
  if (!isAffiliationPrompted(application)) return true;
  if (!user) return false;
  return user.affiliation !== "";
}

function isProviderItemAnswered(user: User | null, providerItem: { provider?: { type?: string } }): boolean {
  if (!user) return false;
  const pType = providerItem.provider?.type?.toLowerCase();
  if (!pType) return false;
  const val = (user as any)[pType];
  return val !== undefined && val !== "";
}

function isSignupItemAnswered(user: User | null, signupItem: { name?: string }): boolean {
  if (!user) return false;
  if (signupItem.name !== "Country/Region") return true;
  const val = (user as any).region;
  return val !== undefined && val !== "";
}

export function isPromptAnswered(user: User | null, application: Application | null): boolean {
  if (!isAffiliationAnswered(user, application)) return false;
  const providerItems = getAllPromptedProviderItems(application);
  for (const pi of providerItems) {
    if (!isProviderItemAnswered(user, pi)) return false;
  }
  const signupItems = getAllPromptedSignupItems(application);
  for (const si of signupItems) {
    if (!isSignupItemAnswered(user, si)) return false;
  }
  return true;
}

/* ───────── Validation helpers ───────── */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string, countryCode = ""): boolean {
  const phoneCnRegex = /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/;
  const phoneRegex = /[0-9]{4,15}$/;
  return countryCode === "CN" ? phoneCnRegex.test(phone) : phoneRegex.test(phone);
}

/* ───────── Country/Region helpers ───────── */

export interface CountryCodeItem {
  code: string;
  name: string;
  phone: string;
}

export function getCountryCodeData(): CountryCodeItem[] {
  // Lazy-loaded at runtime; for now provide empty array.
  // Full implementation will use libphonenumber-js when available.
  return [];
}

/* ───────── Provider Logo ───────── */

export function getProviderLogoURL(provider: {
  type?: string;
  customLogo?: string;
  category?: string;
}): string {
  if (provider.type === "Custom" && provider.customLogo) {
    return provider.customLogo;
  }
  if (provider.category === "OAuth") {
    return `${StaticBaseUrl}/img/social_${provider.type?.toLowerCase()}.png`;
  }
  return "";
}

/* ───────── Theme ───────── */

export function isDarkTheme(themeAlgorithm: string[]): boolean {
  return themeAlgorithm.includes("dark");
}

export function inIframe(): boolean {
  try {
    return window !== window.parent;
  } catch {
    return true;
  }
}

/* ───────── Label with tooltip ───────── */

export function getLabel(text: string, tooltip?: string): string {
  // In Vue we'll use ant-design-vue Tooltip in templates instead
  return text;
}

/* ───────── From link / redirect ───────── */

export function getFromLink(search: string = window.location.search): string {
  const params = new URLSearchParams(search);
  const redirectUri = params.get("redirect_uri");
  if (redirectUri !== null && redirectUri.trim() !== "") {
    return redirectUri;
  }
  const fromParam = params.get("from");
  if (fromParam !== null && fromParam.trim() !== "") {
    return fromParam;
  }
  const from = sessionStorage.getItem("from");
  if (from === null || from.trim() === "") {
    return "/";
  }
  return from;
}

export function createFormAndSubmit(url: string, params: Record<string, string | null | undefined>) {
  const form = document.createElement("form");
  form.method = "post";
  form.action = url;

  for (const k in params) {
    if (!params[k]) continue;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    input.value = params[k]!;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  setTimeout(() => { form.remove(); }, 500);
}

/* ───────── MFA check ───────── */

export interface LoginResponse {
  status: string;
  msg: string;
  data?: string;
  data2?: string;
  name?: string;
  sub?: string;
}

export type MfaType =
  | "app/totp"
  | "sms"
  | "email"
  | "recovery"
  | "push"
  | "radius"
  | "password";

/**
 * Check if the login response requires MFA or plan selection.
 * Returns an action object describing what to do next.
 */
export function checkLoginMfa(
  res: LoginResponse
): {
  action:
    | "mfa"
    | "selectPlan"
    | "buyPlanResult"
    | "redirect"
    | "done"
    | "error";
  mfaType?: string;
  data?: string;
  data2?: string;
} {
  if (res.status === "error") {
    return { action: "error" };
  }

  const msg = res.msg || "";
  if (msg === "RequiredMfa") {
    return { action: "mfa", mfaType: res.data || "app/totp", data2: res.data2 };
  }
  if (msg === "NextMfa") {
    return { action: "mfa", mfaType: res.data || "app/totp", data2: res.data2 };
  }
  if (msg === "SelectPlan") {
    return { action: "selectPlan", data: res.data };
  }
  if (msg === "BuyPlanResult") {
    return { action: "buyPlanResult", data: res.data };
  }

  return { action: "done" };
}
