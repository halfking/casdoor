// Login page composable — ported from web/src/auth/LoginPage.js
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import * as Setting from "@/utils/Setting";
import * as Provider from "@/utils/Provider";
import { DefaultApplication } from "@/Conf";
import { encryptByPasswordObfuscator } from "@/utils/Obfuscator";
import * as AuthApi from "@/api/modules/auth";
import { getApplication, getDefaultApplication } from "@/api/modules/application";
import type { Application, User, Provider as ProviderType } from "@/api/types";

/* ───────── Types ───────── */

export type LoginMethodType =
  | "password"
  | "verificationCode"
  | "verificationCodeEmail"
  | "verificationCodePhone"
  | "webAuthn"
  | "ldap"
  | "faceId"
  | "wechat"
  | "";

export interface LoginState {
  type: string;
  applicationName: string;
  owner: string | null;
  mode: string;
  msg: string | null;
  username: string;
  validEmailOrPhone: boolean;
  validEmail: boolean;
  loginMethod: LoginMethodType;
  openCaptchaModal: boolean;
  openFaceRecognitionModal: boolean;
  verifyCaptcha: undefined | (() => void);
  samlResponse: string;
  relayState: string;
  redirectUrl: string;
  isTermsOfUseVisible: boolean;
  termsOfUseContent: string;
  orgChoiceMode: string;
  loginLoading: boolean;
  userCode: string;
  userCodeStatus: string;
  prefilledUsername: string;
  captchaValues: { captchaType?: string; captchaToken?: string; clientSecret?: string };
  getVerifyTotp: undefined | (() => unknown);
}

/* ───────── Composable ───────── */

export function useLogin(props: {
  account?: User | null;
  application?: Application | null;
  preview?: string;
  themeAlgorithm?: string[];
  requiredEnableMfa?: boolean;
  onUpdateApplication?: (app: Application) => void;
}) {
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();

  /* ── Reactive state ── */

  const type = ref("");
  const applicationName = ref("");
  const owner = ref<string | null>(null);
  const mode = ref("signin");
  const msg = ref<string | null>(null);
  const username = ref("");
  const validEmailOrPhone = ref(false);
  const validEmail = ref(false);
  const loginMethod = ref<LoginMethodType>("");
  const openCaptchaModal = ref(false);
  const openFaceRecognitionModal = ref(false);
  const samlResponse = ref("");
  const relayState = ref("");
  const redirectUrl = ref("");
  const isTermsOfUseVisible = ref(false);
  const termsOfUseContent = ref("");
  const orgChoiceMode = ref("");
  const loginLoading = ref(false);
  const userCode = ref("");
  const userCodeStatus = ref("");
  const prefilledUsername = ref("");
  const captchaValues = ref<{ captchaType?: string; captchaToken?: string; clientSecret?: string }>({});
  const getVerifyTotp = ref<undefined | (() => unknown)>(undefined);

  const application = ref<Application | null>(null);

  /* ── Derived ── */

  const applicationObj = computed<Application | null>(() => {
    return props.application ?? application.value;
  });

  /* ── Parse route to determine login type ── */

  function resolveRouteParams() {
    const path = route.path;
    const query = route.query;

    if (path.includes("/login/oauth/device/")) {
      type.value = "device";
      userCode.value = (route.params.userCode as string) || "";
      userCodeStatus.value = "success";
    } else if (path.includes("/login/saml/authorize/")) {
      type.value = "saml";
      owner.value = (route.params.owner as string) || null;
      applicationName.value = (route.params.applicationName as string) || "";
    } else if (path.includes("/login/oauth/authorize")) {
      type.value = "code";
    } else if (path.includes("/cas/") && path.endsWith("/login")) {
      type.value = "cas";
      owner.value = (route.params.owner as string) || null;
      applicationName.value = (route.params.casApplicationName as string) || "";
    } else {
      type.value = "login";
      owner.value = (route.params.owner as string) || null;
    }

    if (query.username) {
      prefilledUsername.value = query.username as string;
      username.value = query.username as string;
    }

    if (query.orgChoiceMode) {
      orgChoiceMode.value = query.orgChoiceMode as string;
    }
  }

  /* ── Load the application ── */

  async function loadApplication() {
    resolveRouteParams();

    try {
      let res: any;
      if (type.value === "saml" || type.value === "cas") {
        res = await getApplication("admin", applicationName.value);
      } else if (type.value === "device") {
        res = await AuthApi.getApplicationLogin({
          type: "device",
          device_code: userCode.value,
        });
      } else if (owner.value) {
        res = await getDefaultApplication("admin", owner.value);
      } else {
        // OAuth login — extract from query
        const oAuthParams = Provider.getOAuthGetParameters();
        if (oAuthParams?.clientId) {
          res = await AuthApi.getApplicationLogin({
            type: type.value,
            id: `admin/${oAuthParams.clientId}`,
            redirectUri: oAuthParams.redirectUri,
            scope: oAuthParams.scope,
            state: oAuthParams.state,
          });
        } else {
          // Fallback — try to get from the path
          const pathParts = route.path.split("/").filter(Boolean);
          const appName = pathParts[1]; // /login/:appName
          if (appName) {
            res = await getApplication("admin", appName);
          } else {
            // Self-login — load the built-in application
            res = await getApplication("admin", DefaultApplication);
          }
        }
      }

      if (res?.status === "ok" && res.data) {
        application.value = res.data;
        if (props.onUpdateApplication) {
          props.onUpdateApplication(res.data);
        }
        initLoginMethod(res.data);
      } else if (res?.status === "error") {
        msg.value = res.msg || t("login:Failed to load application");
      } else {
        application.value = null;
        msg.value = res?.msg || "";
      }
    } catch {
      msg.value = t("general:Failed to connect to server");
    }
  }

  /* ── Get default login method ── */

  function getDefaultLoginMethod(app: Application): LoginMethodType {
    if (!app.signinMethods?.length) return "password";
    const first = app.signinMethods[0];
    if (!first) return "password";

    switch (first.name) {
      case "Password":
        if (first.rule === "All" || first.rule === "Non-LDAP") return "password";
        return "password";
      case "Verification code":
        if (first.rule === "Email only") return "verificationCodeEmail";
        if (first.rule === "Phone only") return "verificationCodePhone";
        return "verificationCode";
      case "WebAuthn":
        return "webAuthn";
      case "LDAP":
        return "ldap";
      case "Face ID":
        return "faceId";
      case "WeChat":
        return "wechat";
      default:
        return "password";
    }
  }

  function initLoginMethod(app: Application) {
    loginMethod.value = getDefaultLoginMethod(app);
  }

  /* ── Captcha logic ── */

  function getCaptchaRule(app: Application): string {
    if (!app.providers) return "None";
    const captchaProviderItem = app.providers.find(
      (p) => p.provider?.category === "Captcha"
    );
    if (!captchaProviderItem) return "None";
    return captchaProviderItem.rule || "None";
  }

  function getCaptchaProviderItems(app: Application) {
    if (!app.providers) return [];
    return app.providers.filter((p) => p.provider?.category === "Captcha");
  }

  function isInlineCaptchaEnabled(app: Application | null): boolean {
    if (!app) return false;
    const rule = getCaptchaRule(app);
    return rule === "Always" || rule === "Dynamic" || rule === "InternetOnly";
  }

  function checkCaptchaStatus(
    app: Application,
    callback: () => void
  ) {
    const rule = getCaptchaRule(app);
    if (rule === "Always" || rule === "InternetOnly") {
      openCaptchaModal.value = true;
    } else if (rule === "Dynamic") {
      // Dynamic logic — skip captcha initially; backend decides
      callback();
    } else {
      callback();
    }
  }

  function refreshInlineCaptcha() {
    // Trigger re-render on inline captcha
    captchaValues.value = {};
  }

  /* ── Build login values ── */

  function populateOauthValues(values: Record<string, unknown>) {
    const app = applicationObj.value;
    if (app?.organization) {
      values["organization"] = app.organization;
    }

    const oAuthParams = Provider.getOAuthGetParameters();
    values["type"] = oAuthParams?.type ?? type.value;

    if (oAuthParams?.samlRequest && oAuthParams.samlRequest !== "") {
      values["samlRequest"] = oAuthParams.samlRequest;
      values["relayState"] = oAuthParams.relayState;
      values["type"] = "saml";
    }
  }

  /* ── Login function ── */

  async function doLogin(values: Record<string, unknown>) {
    loginLoading.value = true;
    const app = applicationObj.value;
    if (!app) return;

    populateOauthValues(values);
    const oAuthParams = Provider.getOAuthGetParameters();
    const responseType = values["type"] as string || type.value;

    try {
      let res: any;
      if (type.value === "cas") {
        const casParams = Provider.getCasLoginParameters(app.organization!, app.name);
        values["type"] = casParams.type;
        res = await AuthApi.loginCas(values, { service: casParams.service });
      } else {
        const authOauthParams = oAuthParams
          ? {
            clientId: oAuthParams.clientId,
            responseType: oAuthParams.responseType,
            redirectUri: oAuthParams.redirectUri,
            scope: oAuthParams.scope,
            state: oAuthParams.state,
            nonce: oAuthParams.nonce,
            code_challenge_method: oAuthParams.challengeMethod,
            code_challenge: oAuthParams.codeChallenge,
          }
          : undefined;
        res = await AuthApi.login(values, authOauthParams);
      }

      if (res?.status === "ok") {
        handleLoginResponse(res, responseType, oAuthParams);
      } else if (res?.status === "error") {
        const mfa = Setting.checkLoginMfa(res);
        if (mfa.action === "mfa") {
          handleMfaRequired(mfa);
        } else {
          Setting.showMessage("error", res.msg);
        }
      }
    } catch {
      Setting.showMessage("error", t("general:Failed to connect to server"));
    } finally {
      loginLoading.value = false;
    }
  }

  function handleLoginResponse(
    res: any,
    responseType: string,
    oAuthParams: Provider.OAuthGetParams | null
  ) {
    if (res.msg === "RequiredMfa") {
      handleMfaRequired(Setting.checkLoginMfa(res));
      return;
    }

    if (responseType === "login") {
      if (res.data3) {
        sessionStorage.setItem("signinUrl", window.location.pathname + window.location.search);
        Setting.goToLink(`/forget/${applicationName.value}`);
        return;
      }
      Setting.showMessage("success", t("login:Successfully logged in"));
      Setting.goToLink("/");
    } else if (responseType === "code") {
      postCodeLoginAction(res);
    } else if (responseType === "token" || responseType === "id_token") {
      const accessToken = res.data;
      if (oAuthParams?.redirectUri) {
        Setting.goToLink(
          `${oAuthParams.redirectUri}#${responseType}=${accessToken}?state=${oAuthParams.state}&token_type=bearer`
        );
      }
    } else if (responseType === "device") {
      // device code flow
      userCodeStatus.value = "success";
      Setting.showMessage("success", t("login:Successfully logged in"));
    } else if (responseType === "saml") {
      if (res.data2) {
        samlResponse.value = res.data;
        redirectUrl.value = res.data2;
        relayState.value = oAuthParams?.relayState || "";
      }
    } else {
      Setting.showMessage("success", t("login:Successfully logged in"));
      Setting.goToLink("/");
    }
  }

  function postCodeLoginAction(res: any) {
    const mfa = Setting.checkLoginMfa(res);
    if (mfa.action === "mfa") {
      handleMfaRequired(mfa);
      return;
    }

    // Check for consent
    if (res.msg === "LoginOk" || res.msg === "SignupOk") {
      const link = res.data || res.data2;
      if (link && (link as string).includes("/consent/")) {
        Setting.goToLink(link);
        return;
      }
      if (link && (link as string).includes("/prompt/")) {
        Setting.goToLink(link);
        return;
      }
    }

    // noRedirect mode for embedded
    const oAuthParams = Provider.getOAuthGetParameters();
    if (oAuthParams?.noRedirect === "true") {
      const targetOrigin = oAuthParams.redirectUri
        ? new URL(oAuthParams.redirectUri).origin
        : window.location.origin;
      window.parent.postMessage(
        { tag: "Casdoor", type: "LoginOk", data: res },
        targetOrigin
      );
      return;
    }

    // Default redirect
    const link = res.data || res.data2;
    if (link) {
      Setting.goToLink(link as string);
    } else {
      Setting.goToLink("/");
    }
  }

  function handleMfaRequired(mfa: ReturnType<typeof Setting.checkLoginMfa>) {
    // MFA handling — the parent page or MFA component will deal with this
    // For now, we expose a callback-based approach
    Setting.showMessage("info", t("login:MFA authentication required"));
    // TODO: integrate MFA page/component
  }

  /* ── onFinish (form submit handler) ── */

  async function onFinish(rawValues: Record<string, unknown>) {
    const app = applicationObj.value;
    if (!app) return;

    const values = { ...rawValues };
    values["application"] = app.name;

    const method = loginMethod.value;

    if (method === "webAuthn") {
      loginLoading.value = true;
      try {
        await signInWithWebAuthn(username.value, values);
      } catch (err: any) {
        Setting.showMessage("error", err.message || String(err));
      }
      loginLoading.value = false;
      return;
    }

    if (method === "faceId") {
      openFaceRecognitionModal.value = true;
      return;
    }

    // password / ldap / verificationCode
    if (method === "password" || method === "ldap") {
      if (values["password"]) {
        const orgObj = app.organizationObj;
        if (orgObj?.passwordObfuscatorType) {
          const [encrypted, err] = encryptByPasswordObfuscator(
            orgObj.passwordObfuscatorType,
            orgObj.passwordObfuscatorKey || "",
            values["password"] as string
          );
          if (err) {
            Setting.showMessage("error", err);
            return;
          }
          values["password"] = encrypted;
        }
      }
    }

    values["signinMethod"] = method === "ldap" ? "LDAP" : "Password";
    if (method?.includes("verificationCode")) {
      values["signinMethod"] = "Verification code";
    }

    const inlineCaptcha = isInlineCaptchaEnabled(app);
    if (inlineCaptcha && captchaValues.value.captchaType) {
      values["captchaType"] = captchaValues.value.captchaType;
      values["captchaToken"] = captchaValues.value.captchaToken;
      values["clientSecret"] = captchaValues.value.clientSecret;
    }

    const captchaRule = getCaptchaRule(app);
    if (!inlineCaptcha && (captchaRule === "Always" || captchaRule === "InternetOnly")) {
      openCaptchaModal.value = true;
      return;
    }

    await doLogin(values);
  }

  async function onCaptchaOk(
    captchaType: string,
    captchaToken: string,
    clientSecret: string,
    values: Record<string, unknown>
  ) {
    openCaptchaModal.value = false;
    values["captchaType"] = captchaType;
    values["captchaToken"] = captchaToken;
    values["clientSecret"] = clientSecret;
    await doLogin(values);
  }

  /* ── WebAuthn ── */

  async function signInWithWebAuthn(
    uname: string,
    values: Record<string, unknown>
  ) {
    const app = applicationObj.value;
    if (!app) throw new Error("No application");

    const oAuthParams = Provider.getOAuthGetParameters();
    populateOauthValues(values);

    const usernameParam = uname ? `&name=${encodeURIComponent(uname)}` : "";
    const beginRes = await fetch(
      `${Setting.ServerUrl}/api/webauthn/signin/begin?owner=${app.organization}${usernameParam}`,
      { method: "GET", credentials: "include" }
    );
    const credentialRequestOptions = await beginRes.json();

    if ("status" in credentialRequestOptions && credentialRequestOptions.status !== "ok") {
      throw new Error(credentialRequestOptions.msg);
    }

    credentialRequestOptions.publicKey.challenge = webAuthnBufferDecode(
      credentialRequestOptions.publicKey.challenge
    );

    if (uname && credentialRequestOptions.publicKey.allowCredentials) {
      credentialRequestOptions.publicKey.allowCredentials.forEach(
        (item: any) => {
          item.id = webAuthnBufferDecode(item.id);
        }
      );
    }

    const assertion = (await navigator.credentials.get({
      publicKey: credentialRequestOptions.publicKey,
    })) as PublicKeyCredential;

    const authData = (assertion.response as AuthenticatorAssertionResponse).authenticatorData;
    const clientDataJSON = assertion.response.clientDataJSON;
    const rawId = assertion.rawId;
    const sig = (assertion.response as AuthenticatorAssertionResponse).signature;
    const userHandle = (assertion.response as AuthenticatorAssertionResponse).userHandle;

    let finishUrl = `${Setting.ServerUrl}/api/webauthn/signin/finish?responseType=${values["type"]}`;
    if (values["type"] === "code" && oAuthParams) {
      finishUrl = `${Setting.ServerUrl}/api/webauthn/signin/finish?responseType=${values["type"]}&clientId=${oAuthParams.clientId}&scope=${oAuthParams.scope}&redirectUri=${oAuthParams.redirectUri}&nonce=${oAuthParams.nonce}&state=${oAuthParams.state}&codeChallenge=${oAuthParams.codeChallenge}&challengeMethod=${oAuthParams.challengeMethod}`;
    }

    const finishRes = await fetch(finishUrl, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        id: assertion.id,
        rawId: webAuthnBufferEncode(rawId),
        type: assertion.type,
        response: {
          authenticatorData: webAuthnBufferEncode(authData),
          clientDataJSON: webAuthnBufferEncode(clientDataJSON),
          signature: webAuthnBufferEncode(sig),
          userHandle: userHandle ? webAuthnBufferEncode(userHandle) : "",
        },
      }),
    });
    const res = await finishRes.json();

    if (res.status === "ok") {
      const responseType = values["type"] as string;
      if (responseType === "code") {
        postCodeLoginAction(res);
      } else if (responseType === "token" || responseType === "id_token") {
        const accessToken = res.data;
        if (oAuthParams?.redirectUri) {
          Setting.goToLink(
            `${oAuthParams.redirectUri}#${responseType}=${accessToken}?state=${oAuthParams.state}&token_type=bearer`
          );
        }
      } else {
        Setting.showMessage("success", t("login:Successfully logged in with WebAuthn credentials"));
        Setting.goToLink("/");
      }
    } else {
      Setting.showMessage("error", res.msg);
    }
  }

  /* ── WebAuthn buffer helpers ── */

  function webAuthnBufferDecode(value: string): ArrayBuffer {
    return Uint8Array.from(atob(value.replace(/-/g, "+").replace(/_/g, "/")), (c) =>
      c.charCodeAt(0)
    ).buffer;
  }

  function webAuthnBufferEncode(value: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(value)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  }

  /* ── Username validation ── */

  function onUsernameChange(val: string) {
    username.value = val;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{5,15}$/;
    validEmail.value = emailRegex.test(val);
    const isPhone = phoneRegex.test(val.replace(/[- ()]/g, ""));
    validEmailOrPhone.value = validEmail.value || isPhone;
  }

  /* ── Silent / auto sign-in ── */

  function sendSilentSigninData(data: string) {
    if (Setting.inIframe()) {
      const message = { tag: "Casdoor", type: "SilentSignin", data };
      window.parent.postMessage(message, "*");
    }
  }

  /* ── Organization choice ── */

  function isOrganizationChoiceBoxVisible(ocm: string): boolean {
    if (orgChoiceMode.value === "None") return false;
    const path = route.path;
    if (path === "/login" || path.match(/^\/login\/[^/]+$/)) {
      return ocm === "Select" || ocm === "Input";
    }
    return false;
  }

  /* ── Provider visibility ── */

  function isProviderVisibleInLogin(providerItem: any): boolean {
    if (!providerItem?.provider) return false;
    const cat = providerItem.provider.category;
    if (cat === "Captcha") return false;
    return Setting.isProviderVisible(providerItem);
  }

  /* ── Signup link URL ── */

  function getSignupUrl(app: Application): string {
    const path = window.location.pathname;
    if (path.includes("/login/oauth/authorize")) {
      return path.replace("/login/oauth/authorize", "/signup/oauth/authorize") + window.location.search;
    }
    if (app.signupUrl) {
      return app.signupUrl;
    }
    let url = `/signup/${app.name}`;
    if (app.isShared && app.organization) {
      url = `/signup/${app.name}-org-${app.organization}`;
    }
    return url + window.location.search;
  }

  function storeSigninUrl() {
    sessionStorage.setItem("signinUrl", window.location.pathname + window.location.search);
  }

  /* ── Render helpers ── */

  function hasVerificationCodeSigninItem(app: Application | null): boolean {
    if (!app?.signinItems) return false;
    return app.signinItems.some((item) => item.name === "Verification code");
  }

  /* ── Method choice box items ── */

  function getMethodChoiceItems(app: Application) {
    const items: { label: string; key: string }[] = [];
    const generateKey = (name: string, rule: string) => `${name}-${rule}`;

    const itemsMap = new Map<string, { label: string; key: string }>([
      [generateKey("Password", "All"), { label: t("general:Password"), key: "password" }],
      [generateKey("Password", "Non-LDAP"), { label: t("general:Password"), key: "password" }],
      [generateKey("Verification code", "All"), { label: t("login:Verification code"), key: "verificationCode" }],
      [generateKey("Verification code", "Email only"), { label: t("login:Verification code"), key: "verificationCodeEmail" }],
      [generateKey("Verification code", "Phone only"), { label: t("login:Verification code"), key: "verificationCodePhone" }],
      [generateKey("WebAuthn", "None"), { label: t("login:WebAuthn"), key: "webAuthn" }],
      [generateKey("LDAP", "None"), { label: t("login:LDAP"), key: "ldap" }],
      [generateKey("Face ID", "None"), { label: t("login:Face ID"), key: "faceId" }],
      [generateKey("WeChat", "Tab"), { label: t("login:WeChat"), key: "wechat" }],
      [generateKey("WeChat", "None"), { label: t("login:WeChat"), key: "wechat" }],
    ]);

    app.signinMethods?.forEach((signinMethod) => {
      if (signinMethod.rule === "Hide password") return;
      const item = itemsMap.get(generateKey(signinMethod.name, signinMethod.rule));
      if (item) {
        let label =
          signinMethod.name === signinMethod.displayName
            ? item.label
            : signinMethod.displayName;
        if ((app.signinMethods?.length ?? 0) >= 4 && label === "Verification code") {
          label = "Code";
        }
        items.push({ label, key: item.key });
      }
    });

    return items;
  }

  function getVisibleOAuthProviderItems(app: Application) {
    if (!app.providers) return [];
    return app.providers.filter(
      (pi) => isProviderVisibleInLogin(pi) && pi.provider?.category !== "SAML"
    );
  }

  /* ── Parse form offset ── */

  function parseOffset(offset: number | undefined): string {
    if (offset === undefined || offset === null) return "0px auto";
    switch (offset) {
      case 1:
        return "0px auto 0px 100px";
      case 2:
        return "0px auto 0px 200px";
      case 3:
        return "0px auto";
      case 4:
        return "0px auto";
      default:
        return "0px auto";
    }
  }

  return {
    // State
    type,
    applicationName,
    owner,
    mode,
    msg,
    username,
    validEmailOrPhone,
    validEmail,
    loginMethod,
    openCaptchaModal,
    openFaceRecognitionModal,
    samlResponse,
    relayState,
    redirectUrl,
    isTermsOfUseVisible,
    termsOfUseContent,
    orgChoiceMode,
    loginLoading,
    userCode,
    userCodeStatus,
    prefilledUsername,
    captchaValues,
    getVerifyTotp,
    application,
    applicationObj,

    // Methods
    resolveRouteParams,
    loadApplication,
    onFinish,
    onCaptchaOk,
    onUsernameChange,
    getCaptchaRule,
    getCaptchaProviderItems,
    isInlineCaptchaEnabled,
    refreshInlineCaptcha,
    checkCaptchaStatus,
    sendSilentSigninData,
    isOrganizationChoiceBoxVisible,
    isProviderVisibleInLogin,
    getSignupUrl,
    storeSigninUrl,
    hasVerificationCodeSigninItem,
    getMethodChoiceItems,
    getVisibleOAuthProviderItems,
    parseOffset,
    currentLoginMethod: loginMethod,
    doLogin,
  };
}
