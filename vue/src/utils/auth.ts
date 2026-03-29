import { message } from "ant-design-vue";

export interface ApiResponse<T = unknown, T2 = unknown, T3 = unknown> {
  status: string;
  msg?: string;
  data?: T;
  data2?: T2;
  data3?: T3;
  [key: string]: unknown;
}

export interface OAuthGetParameters {
  clientId: string;
  responseType: string;
  redirectUri: string;
  scope: string;
  state: string;
  nonce: string;
  challengeMethod: string;
  codeChallenge: string;
  responseMode: string;
  samlRequest: string;
  relayState: string;
  noRedirect: string;
  type: "code";
}

export interface MfaOption {
  mfaType: string;
  secret?: string;
  url?: string;
  countryCode?: string;
  mfaRememberInHours?: number;
  isPreferred?: boolean;
  [key: string]: unknown;
}

export interface PromptApplication {
  providers?: Array<{ prompted?: boolean; provider?: { type?: string } }>;
  signupItems?: Array<{ prompted?: boolean; visible?: boolean; name?: string }>;
  [key: string]: unknown;
}

export interface PromptUser {
  affiliation?: string;
  region?: string;
  [key: string]: unknown;
}

export interface MfaComponentBridge {
  onLoginSuccess?: (redirectUrl: string) => void;
  setMfaState?: (payload: {
    visible: boolean;
    mfaProps: MfaOption[];
    selectedMfaProp: MfaOption | null;
    body: Record<string, unknown>;
    params: Record<string, unknown> | OAuthGetParameters | null;
    redirectUrl: string | null;
    handler: (response: ApiResponse) => void;
  }) => void;
}

export const RequiredMfa = "RequiredMfa";
export const NextMfa = "NextMfa";

function normalizeSearchInput(search?: string): string {
  if (!search) {
    return window.location.search;
  }

  const queryIndex = search.indexOf("?");
  if (queryIndex >= 0) {
    return search.slice(queryIndex);
  }

  return search.startsWith("?") ? search : `?${search}`;
}

function refinedValue(value: string | null): string {
  return value ?? "";
}

function getRawGetParameter(key: string, search?: string): string {
  const fullUrl = `${window.location.origin}/placeholder${normalizeSearchInput(search)}`;
  const token = fullUrl.split(`${key}=`)[1];
  if (!token) {
    return "";
  }

  const result = token.split("&")[0];
  if (!result) {
    return "";
  }

  return decodeURIComponent(result);
}

function getPreferredMfaProp(mfaProps: MfaOption[]): MfaOption | null {
  for (const item of mfaProps) {
    if (item?.isPreferred) {
      return item;
    }
  }

  return mfaProps[0] ?? null;
}

export function getFromLink(search?: string): string {
  const params = new URLSearchParams(normalizeSearchInput(search));
  const redirectUri = params.get("redirect_uri");
  if (redirectUri && redirectUri.trim() !== "") {
    return redirectUri;
  }

  const fromParam = params.get("from");
  if (fromParam && fromParam.trim() !== "") {
    return fromParam;
  }

  const from = sessionStorage.getItem("from");
  if (!from || from.trim() === "") {
    return "https://www.itestu.cn";
  }

  return from;
}

export function goToLink(url: string): void {
  window.location.href = url;
}

export function getQueryParamsFromState(state: string | null): string {
  if (!state) {
    return "";
  }

  const query = sessionStorage.getItem(state);
  if (query !== null) {
    return query;
  }

  try {
    return atob(state);
  } catch {
    return "";
  }
}

export function getOAuthGetParameters(search?: string | URLSearchParams): OAuthGetParameters | null {
  const queries = search instanceof URLSearchParams
    ? search
    : new URLSearchParams(normalizeSearchInput(search));
  const lowercaseQueries: Record<string, string> = {};
  queries.forEach((value, key) => {
    lowercaseQueries[key.toLowerCase()] = value;
  });

  const clientId = refinedValue(queries.get("client_id"));
  const responseType = refinedValue(queries.get("response_type"));

  let redirectUri = getRawGetParameter("redirect_uri", search instanceof URLSearchParams ? `?${queries.toString()}` : search);
  if (redirectUri === "") {
    redirectUri = refinedValue(queries.get("redirect_uri"));
  }

  let scope = refinedValue(queries.get("scope"));
  if (redirectUri.includes("#") && scope === "") {
    scope = getRawGetParameter("scope", search instanceof URLSearchParams ? `?${queries.toString()}` : search);
  }

  let state = refinedValue(queries.get("state"));
  if (state.startsWith("/auth/oauth2/login.php?wantsurl")) {
    state = encodeURIComponent(state);
  }
  if (redirectUri.includes("#") && state === "") {
    state = getRawGetParameter("state", search instanceof URLSearchParams ? `?${queries.toString()}` : search);
  }

  const nonce = refinedValue(queries.get("nonce"));
  const challengeMethod = refinedValue(queries.get("code_challenge_method"));
  const codeChallenge = refinedValue(queries.get("code_challenge"));
  const responseMode = refinedValue(queries.get("response_mode"));
  const samlRequest = refinedValue(lowercaseQueries.samlrequest);
  const relayState = refinedValue(lowercaseQueries.relaystate);
  const noRedirect = refinedValue(lowercaseQueries.noredirect);

  if (clientId === "" && samlRequest === "") {
    return null;
  }

  return {
    clientId,
    responseType,
    redirectUri,
    scope,
    state,
    nonce,
    challengeMethod,
    codeChallenge,
    responseMode,
    samlRequest,
    relayState,
    noRedirect,
    type: "code",
  };
}

export function createFormAndSubmit(url: string, params: Record<string, unknown>): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  form.style.display = "none";

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      return;
    }

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

export function checkLoginMfa(
  response: ApiResponse<string, unknown>,
  body: Record<string, unknown>,
  params: Record<string, unknown> | OAuthGetParameters | null,
  handler: (response: ApiResponse) => void,
  component: MfaComponentBridge,
  redirectUrl: string | null = null,
): void {
  if (response.data === RequiredMfa) {
    component.onLoginSuccess?.(redirectUrl ?? window.location.href);
    return;
  }

  if (response.data === NextMfa) {
    const mfaProps = Array.isArray(response.data2) ? (response.data2 as MfaOption[]) : [];
    body.providerBack = body.provider;
    body.provider = "";
    component.setMfaState?.({
      visible: true,
      mfaProps,
      selectedMfaProp: getPreferredMfaProp(mfaProps),
      body: {...body},
      params,
      redirectUrl,
      handler,
    });
    return;
  }

  if (response.data === "SelectPlan") {
    const pricing = response.data2 as { owner?: string; name?: string } | undefined;
    goToLink(`/select-plan/${pricing?.owner}/${pricing?.name}?user=${body.username ?? ""}`);
    return;
  }

  if (response.data === "BuyPlanResult") {
    const sub = response.data2 as { owner?: string; pricing?: string; name?: string } | undefined;
    goToLink(`/buy-plan/${sub?.owner}/${sub?.pricing}/result?subscription=${sub?.name}`);
    return;
  }

  handler(response);
}

export function isProviderPrompted(providerItem: { prompted?: boolean } | undefined): boolean {
  return Boolean(providerItem?.prompted);
}

export function isSignupItemPrompted(signupItem: { visible?: boolean; prompted?: boolean } | undefined): boolean {
  return Boolean(signupItem?.visible && signupItem?.prompted);
}

export function isAffiliationPrompted(application: PromptApplication | null | undefined): boolean {
  const signupItem = application?.signupItems?.find((item) => item.name === "Affiliation");
  return Boolean(signupItem?.prompted);
}

export function hasPromptPage(application: PromptApplication | null | undefined): boolean {
  if (!application) {
    return false;
  }

  const promptedProviders = application.providers?.filter((item) => isProviderPrompted(item)) ?? [];
  if (promptedProviders.length > 0) {
    return true;
  }

  const promptedSignupItems = application.signupItems?.filter((item) => isSignupItemPrompted(item)) ?? [];
  if (promptedSignupItems.some((item) => item.name === "Country/Region")) {
    return true;
  }

  return isAffiliationPrompted(application);
}

export function isPromptAnswered(user: PromptUser | null | undefined, application: PromptApplication | null | undefined): boolean {
  if (!application) {
    return true;
  }

  if (isAffiliationPrompted(application) && !user?.affiliation) {
    return false;
  }

  const promptedProviders = application.providers?.filter((item) => isProviderPrompted(item)) ?? [];
  for (const providerItem of promptedProviders) {
    const providerKey = providerItem.provider?.type?.toLowerCase();
    if (!providerKey || !user?.[providerKey]) {
      return false;
    }
  }

  const promptedSignupItems = application.signupItems?.filter((item) => isSignupItemPrompted(item)) ?? [];
  for (const signupItem of promptedSignupItems) {
    if (signupItem.name === "Country/Region" && !user?.region) {
      return false;
    }
  }

  return true;
}

export function showAuthError(text: string): void {
  message.error(text);
}
