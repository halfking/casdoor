import request from "@/api/request";
import type { ApiResponse, OAuthGetParameters } from "@/utils/auth";

type PlainObject = Record<string, unknown>;

function buildOAuthQuery(oAuthParams?: OAuthGetParameters | null): string {
  if (!oAuthParams) {
    return "";
  }

  const searchParams = new URLSearchParams();
  searchParams.set("clientId", oAuthParams.clientId);
  searchParams.set("responseType", oAuthParams.responseType);
  searchParams.set("redirectUri", oAuthParams.redirectUri);
  searchParams.set("type", oAuthParams.type);
  searchParams.set("scope", oAuthParams.scope);
  searchParams.set("state", oAuthParams.state);
  searchParams.set("nonce", oAuthParams.nonce);
  searchParams.set("code_challenge_method", oAuthParams.challengeMethod);
  searchParams.set("code_challenge", oAuthParams.codeChallenge);

  return `?${searchParams.toString()}`;
}

function toFormData(values: PlainObject): FormData {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    formData.append(key, String(value));
  });
  return formData;
}

export async function getAccount(query = ""): Promise<ApiResponse<Record<string, unknown>, string>> {
  return request.get(`/api/get-account${query}`);
}

export async function getApplication(owner: string, name: string): Promise<ApiResponse<Record<string, unknown>>> {
  return request.get(`/api/get-application?id=${owner}/${encodeURIComponent(name)}`);
}

export async function getApplicationLogin(params?: PlainObject | null): Promise<ApiResponse<Record<string, unknown>>> {
  const query = params?.type === "cas"
    ? `?type=${params.type}&id=${params.id ?? ""}&redirectUri=${params.service ?? ""}`
    : params?.type === "device"
      ? `?userCode=${params.userCode ?? ""}&type=device`
      : buildOAuthQuery(params as OAuthGetParameters | null);
  return request.get(`/api/get-app-login${query}`);
}

export async function signup(
  values: PlainObject,
  oAuthParams?: OAuthGetParameters | null,
): Promise<ApiResponse<string | Record<string, unknown>, unknown, boolean>> {
  return request.post(`/api/signup${buildOAuthQuery(oAuthParams)}`, values);
}

export async function login(
  values: PlainObject,
  oAuthParams?: OAuthGetParameters | null,
): Promise<ApiResponse<string | Record<string, unknown>, unknown, boolean>> {
  return request.post(`/api/login${buildOAuthQuery(oAuthParams)}`, values);
}

export async function loginCas(
  values: PlainObject,
  params: {service?: string},
): Promise<ApiResponse<string | Record<string, unknown>, unknown, boolean>> {
  return request.post(`/api/login?service=${params.service ?? ""}`, values);
}

export async function logout(): Promise<ApiResponse> {
  return request.post("/api/logout");
}

export async function getEmailAndPhone(
  organization: string,
  username: string,
): Promise<ApiResponse<{name?: string; phone?: string; email?: string}, string>> {
  return request.get(`/api/get-email-and-phone?organization=${organization}&username=${encodeURIComponent(username)}`);
}

export async function loginWithSaml(
  values: PlainObject,
  query: string,
): Promise<ApiResponse<string, unknown, boolean>> {
  return request.post(`/api/login${query}`, values);
}

export async function grantConsent(
  consent: PlainObject,
  oAuthParams: OAuthGetParameters,
): Promise<ApiResponse<string>> {
  return request.post("/api/grant-consent", {
    ...consent,
    clientId: oAuthParams.clientId,
    provider: "",
    signinMethod: "",
    responseType: oAuthParams.responseType || "code",
    redirectUri: oAuthParams.redirectUri,
    scope: oAuthParams.scope,
    state: oAuthParams.state,
    nonce: oAuthParams.nonce || "",
    challenge: oAuthParams.codeChallenge || "",
    resource: "",
  });
}

export async function getUser(owner: string, name: string): Promise<ApiResponse<Record<string, unknown>>> {
  return request.get(`/api/get-user?id=${owner}/${encodeURIComponent(name)}`);
}

export async function updateUser(
  owner: string,
  name: string,
  user: PlainObject,
): Promise<ApiResponse> {
  return request.post(`/api/update-user?id=${owner}/${encodeURIComponent(name)}`, user);
}

export async function verifyCode(values: PlainObject): Promise<ApiResponse> {
  return request.post("/api/verify-code", values);
}

export async function setPassword(
  userOwner: string,
  userName: string,
  oldPassword: string,
  newPassword: string,
  code = "",
): Promise<ApiResponse> {
  const formData = new FormData();
  formData.append("userOwner", userOwner);
  formData.append("userName", userName);
  formData.append("oldPassword", oldPassword);
  formData.append("newPassword", newPassword);
  if (code) {
    formData.append("code", code);
  }
  return request.post("/api/set-password", formData);
}

export async function checkUserPassword(values: PlainObject): Promise<ApiResponse> {
  return request.post("/api/check-user-password", values);
}

export async function sendVerificationCode(options: {
  method: string;
  dest: string;
  type: string;
  applicationId: string;
  countryCode?: string;
  captchaType?: string;
  captchaToken?: string;
  clientSecret?: string;
  checkUser?: string;
}): Promise<ApiResponse> {
  return request.post(
    "/api/send-verification-code",
    toFormData({
      captchaType: options.captchaType ?? "",
      captchaToken: options.captchaToken ?? "",
      clientSecret: options.clientSecret ?? "",
      method: options.method,
      countryCode: options.countryCode ?? "",
      dest: options.dest,
      type: options.type,
      applicationId: options.applicationId,
      checkUser: options.checkUser ?? "",
    }),
  );
}

export async function mfaSetupInitiate(values: {
  owner: string;
  name: string;
  mfaType: string;
}): Promise<ApiResponse<Record<string, unknown>>> {
  return request.post("/api/mfa/setup/initiate", toFormData(values));
}

export async function mfaSetupVerify(values: PlainObject): Promise<ApiResponse> {
  return request.post("/api/mfa/setup/verify", toFormData(values));
}

export async function mfaSetupEnable(values: PlainObject): Promise<ApiResponse> {
  return request.post("/api/mfa/setup/enable", toFormData(values));
}
