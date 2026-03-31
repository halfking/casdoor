<template>
  <div v-if="samlResponse" style="display: none">
    <RedirectForm
      :saml-response="samlResponse"
      :redirect-url="redirectUrl"
      :relay-state="relayState"
    />
  </div>
  <div v-else style="display: flex; justify-content: center; align-items: center">
    <a-spin
      v-if="!errorMsg"
      size="large"
      :tip="t('login.Signing in...')"
      style="padding-top: 10%"
    />
    <a-result
      v-else
      status="error"
      :title="t('general.There was a problem signing you in..')"
      :sub-title="errorMsg"
    >
      <template #extra>
        <a-button type="primary" @click="goBack">
          {{ t("general.Back") }}
        </a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { login, loginCas } from "@/api/modules/auth";
import * as ProviderUtil from "@/utils/Provider";
import * as Setting from "@/utils/Setting";
import RedirectForm from "@/components/RedirectForm.vue";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const errorMsg = ref<string | null>(null);
const samlResponse = ref("");
const redirectUrl = ref("");
const relayState = ref("");

const REACT_FALLBACK_KEY = "__casdoor_callback_react";
const REACT_FALLBACK_PAYLOAD_KEY = "casdoor_callback_react_fallback";

function getNormalizedSearch(search?: string): string {
  const normalized = new URL(`${window.location.origin}/callback${search || ""}`);
  normalized.searchParams.delete(REACT_FALLBACK_KEY);
  return normalized.search;
}

function consumeReactFallbackPayload(): Record<string, unknown> | null {
  const payload = sessionStorage.getItem(REACT_FALLBACK_PAYLOAD_KEY);
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload);
    if (getNormalizedSearch(parsed.search) !== getNormalizedSearch(window.location.search)) {
      return null;
    }
    sessionStorage.removeItem(REACT_FALLBACK_PAYLOAD_KEY);
    return parsed;
  } catch {
    sessionStorage.removeItem(REACT_FALLBACK_PAYLOAD_KEY);
    return null;
  }
}

function getInnerParams(): URLSearchParams {
  const params = new URLSearchParams(window.location.search);
  const state = params.get("state") || "";
  const queryString = ProviderUtil.getQueryParamsFromState(state);
  return new URLSearchParams(queryString);
}

function getResponseType(): string {
  const authServerUrl = window.location.origin; // self-hosted
  const innerParams = getInnerParams();
  const method = innerParams.get("method");

  if (method === "signup") {
    const realRedirectUri = innerParams.get("redirect_uri");
    if (realRedirectUri === null) {
      const samlRequest = innerParams.get("SAMLRequest");
      const casService = innerParams.get("service");
      if (samlRequest) return "saml";
      if (casService) return "cas";
      return "login";
    }
    const realRedirectUrl = new URL(realRedirectUri).origin;
    if (authServerUrl === realRedirectUrl) return "login";
    const responseType = innerParams.get("response_type");
    return responseType || "code";
  } else if (method === "link") {
    return "link";
  }
  return "unknown";
}

function handleCasLoginResult(res: Record<string, unknown>, casService: string) {
  let msg = "Logged in successfully.";
  if (casService === "") {
    msg += "Now you can visit apps protected by Casdoor.";
  }
  Setting.showMessage("success", msg);

  if (casService !== "") {
    const st = res.data as string;
    const newUrl = new URL(casService);
    newUrl.searchParams.append("ticket", st);
    window.location.href = newUrl.toString();
  }
}

function handleOAuthLoginResult(
  res: Record<string, unknown>,
  innerParams: URLSearchParams,
  queryString: string,
  applicationName: string,
  responseType: string
) {
  const oAuthParams = ProviderUtil.getOAuthGetParameters(innerParams);
  const concatChar = oAuthParams?.redirectUri?.includes("?") ? "&" : "?";
  const responseMode = oAuthParams?.responseMode || "query";
  const signinUrl = localStorage.getItem("signinUrl");
  const responseTypes = responseType.split(" ");

  const mfaResult = Setting.checkLoginMfa(res as unknown as Setting.LoginResponse);

  if (mfaResult.action === "mfa") {
    // TODO: Navigate to MFA verification page
    Setting.showMessage("info", "MFA verification required");
    return;
  }
  if (mfaResult.action === "selectPlan") {
    if (mfaResult.data) {
      try {
        const pricing = typeof mfaResult.data === "string" ? JSON.parse(mfaResult.data) : mfaResult.data;
        Setting.goToLink(`/select-plan/${pricing.owner}/${pricing.name}`);
      } catch {
        Setting.goToLink("/");
      }
    }
    return;
  }
  if (mfaResult.action === "buyPlanResult") {
    if (mfaResult.data) {
      try {
        const sub = typeof mfaResult.data === "string" ? JSON.parse(mfaResult.data) : mfaResult.data;
        Setting.goToLink(`/buy-plan/${sub.owner}/${sub.pricing}/result?subscription=${sub.name}`);
      } catch {
        Setting.goToLink("/");
      }
    }
    return;
  }
  if (mfaResult.action === "error") {
    errorMsg.value = (res as Record<string, string>).msg || "Login failed";
    return;
  }

  // action === "done" — proceed with response type handling
  const data3 = (res as Record<string, unknown>).data3;

  if (responseType === "login") {
    if (data3) {
      sessionStorage.setItem("signinUrl", signinUrl || "");
      router.push(`/forget/${applicationName}`);
      return;
    }
    Setting.showMessage("success", "Logged in successfully");
    Setting.goToLink(Setting.getFromLink(queryString));
  } else if (responseType === "code") {
    if (data3) {
      sessionStorage.setItem("signinUrl", signinUrl || "");
      router.push(`/forget/${applicationName}`);
      return;
    }
    const code = res.data as string;
    if (responseMode === "form_post") {
      Setting.createFormAndSubmit(oAuthParams?.redirectUri || "", {
        code,
        state: oAuthParams?.state,
      });
    } else {
      Setting.goToLink(`${oAuthParams?.redirectUri}${concatChar}code=${code}&state=${oAuthParams?.state}`);
    }
  } else if (responseTypes.includes("token") || responseTypes.includes("id_token")) {
    if (data3) {
      sessionStorage.setItem("signinUrl", signinUrl || "");
      router.push(`/forget/${applicationName}`);
      return;
    }
    const token = res.data as string;
    if (responseMode === "form_post") {
      Setting.createFormAndSubmit(oAuthParams?.redirectUri || "", {
        token: responseTypes.includes("token") ? token : null,
        id_token: responseTypes.includes("id_token") ? token : null,
        token_type: "bearer",
        state: oAuthParams?.state,
      });
    } else {
      Setting.goToLink(
        `${oAuthParams?.redirectUri}${concatChar}${responseType}=${token}&state=${oAuthParams?.state}&token_type=bearer`
      );
    }
  } else if (responseType === "link") {
    let from = innerParams.get("from") || "/";
    const oauth = innerParams.get("oauth");
    if (oauth) from += `?oauth=${oauth}`;
    if (from.startsWith("http")) {
      Setting.goToLink(from);
    } else {
      router.push(from);
    }
  } else if (responseType === "saml") {
    const data2 = res.data2 as Record<string, string> | undefined;
    if (data2?.method === "POST") {
      samlResponse.value = res.data as string;
      redirectUrl.value = data2.redirectUrl;
      relayState.value = oAuthParams?.relayState || "";
    } else {
      if (data3) {
        sessionStorage.setItem("signinUrl", signinUrl || "");
        router.push(`/forget/${applicationName}`);
        return;
      }
      const samlResp = res.data as string;
      const redir = (data2 as Record<string, string>)?.redirectUrl || "";
      Setting.goToLink(
        `${redir}${redir.includes("?") ? "&" : "?"}SAMLResponse=${encodeURIComponent(samlResp)}&RelayState=${oAuthParams?.relayState || ""}`
      );
    }
  }
}

function goBack() {
  window.history.go(-2);
}

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  const state = params.get("state") || "";
  const queryString = ProviderUtil.getQueryParamsFromState(state);
  const isSteam = params.get("openid.mode");

  // Resolve code from various providers
  let code = params.get("code");
  if (code === null) code = params.get("auth_code"); // WeCom
  if (code === null) code = params.get("authCode"); // DingTalk
  if (code === null) {
    const web3Key = params.get("web3AuthTokenKey");
    if (web3Key) code = localStorage.getItem(web3Key);
  }
  if (isSteam !== null && code === null) {
    code = window.location.search;
  }

  const innerParams = getInnerParams();
  const applicationName = innerParams.get("application") || "";
  const providerName = innerParams.get("provider") || "";
  const method = innerParams.get("method") || "";
  const samlRequest = innerParams.get("SAMLRequest") || "";
  const casService = innerParams.get("service") || "";

  // Telegram auth data
  const telegramId = params.get("id");
  if (telegramId !== null && (!code || code === "")) {
    const telegramAuthData: Record<string, unknown> = {
      id: parseInt(telegramId, 10),
    };
    const hash = params.get("hash");
    const authDate = params.get("auth_date");
    if (hash) telegramAuthData.hash = hash;
    if (authDate) telegramAuthData.auth_date = authDate;
    for (const field of ["first_name", "last_name", "username", "photo_url"]) {
      const value = params.get(field);
      if (value) telegramAuthData[field] = value;
    }
    code = JSON.stringify(telegramAuthData);
  }

  const redirectUri = `${window.location.origin}/callback`;

  // PKCE
  const codeVerifier = ProviderUtil.getCodeVerifier(state);

  const body: Record<string, unknown> = {
    type: getResponseType(),
    application: applicationName,
    provider: providerName,
    code: code,
    samlRequest: samlRequest,
    state: applicationName,
    invitationCode: innerParams.get("invitationCode") || "",
    redirectUri: redirectUri,
    method: method,
    codeVerifier: codeVerifier,
  };

  if (codeVerifier) {
    ProviderUtil.clearCodeVerifier(state);
  }

  // Handle react fallback payload
  const fallbackPayload = consumeReactFallbackPayload();
  if (fallbackPayload !== null) {
    const fallbackRes = fallbackPayload.res as Record<string, unknown>;
    if (fallbackPayload.flow === "cas") {
      handleCasLoginResult(fallbackRes, (fallbackPayload.casService as string) || casService);
    } else {
      const fallbackInnerParams = new URLSearchParams(
        (fallbackPayload.innerParams as string) || queryString
      );
      handleOAuthLoginResult(
        fallbackRes,
        fallbackInnerParams,
        (fallbackPayload.queryString as string) || queryString,
        applicationName,
        (fallbackPayload.responseType as string) || getResponseType()
      );
    }
    return;
  }

  try {
    if (getResponseType() === "cas") {
      const res = await loginCas(body, { service: casService });
      if (res.status === "ok") {
        handleCasLoginResult(res as unknown as Record<string, unknown>, casService);
      } else {
        Setting.showMessage("error", `${t("application.Failed to sign in")}: ${res.msg}`);
        errorMsg.value = res.msg;
      }
      return;
    }

    // OAuth
    const oAuthParams = ProviderUtil.getOAuthGetParameters(innerParams);
    const res = await login(body, oAuthParams ? {
      clientId: oAuthParams.clientId,
      responseType: oAuthParams.responseType,
      redirectUri: oAuthParams.redirectUri,
      scope: oAuthParams.scope,
      state: oAuthParams.state,
      nonce: oAuthParams.nonce,
      code_challenge_method: oAuthParams.challengeMethod,
      code_challenge: oAuthParams.codeChallenge,
    } : undefined);

    if (res.status === "ok") {
      handleOAuthLoginResult(res as unknown as Record<string, unknown>, innerParams, queryString, applicationName, getResponseType());
    } else {
      errorMsg.value = res.msg;
    }
  } catch (e) {
    errorMsg.value = String(e);
  }
});
</script>
