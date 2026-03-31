import { ref, computed, type Ref } from "vue";
import { useRoute, useRouter, type Router } from "vue-router";
import { useI18n } from "vue-i18n";
import * as AuthBackend from "../api/modules/auth";
import * as ApplicationBackend from "../api/modules/application";
import * as InvitationBackend from "../api/modules/invitation";
import * as Setting from "../utils/Setting";
import * as Provider from "../utils/Provider";
import type { Application, Invitation } from "../api/types";

export interface SignupProps {
  application?: Ref<Application | null>;
  onUpdateApplication?: (app: Application | null) => void;
  onUpdateAccount?: (account: any) => void;
  preview?: string;
}

export function useSignup(props?: SignupProps) {
  const route = useRoute();
  const router = useRouter();
  const { t } = useI18n();

  /* ───────── State ───────── */
  const applicationName = ref<string | null>(
    (route.params.applicationName as string) ?? null
  );
  const application = ref<Application | null>(props?.application?.value ?? null);
  const msg = ref("");
  const email = ref("");
  const phone = ref("");
  const emailOrPhoneMode = ref("");
  const countryCode = ref("");
  const validEmail = ref(false);
  const validPhone = ref(false);
  const region = ref("");
  const isTermsOfUseVisible = ref(false);
  const termsOfUseContent = ref("");
  const invitationCode = ref("");
  const invitation = ref<Invitation | null>(null);
  const displayNameRule = ref("");
  const passwordPopoverOpen = ref(false);

  /* ───────── Computed ───────── */
  const applicationObj = computed(() => application.value);

  /* ───────── Init ───────── */
  function init() {
    const oAuthParams = Provider.getOAuthGetParameters();
    if (oAuthParams !== null) {
      const signinUrl = window.location.pathname.replace(
        "/signup/oauth/authorize",
        "/login/oauth/authorize"
      );
      sessionStorage.setItem("signinUrl", signinUrl + window.location.search);
    }

    if (application.value == null) {
      if (applicationName.value !== null) {
        getApplication(applicationName.value);
        setInvitationCode();
      } else if (oAuthParams !== null) {
        getApplicationLogin(oAuthParams);
      } else {
        Setting.showMessage(
          "error",
          `${t("general.Unknown application name")}: ${applicationName.value}`
        );
        onUpdateApplication(null);
      }
    }
  }

  /* ───────── Get application ───────── */
  function getApplication(name: string) {
    if (!name) return;
    ApplicationBackend.getApplication("admin", name).then((res: any) => {
      if (res.status === "error") {
        Setting.showMessage("error", res.msg);
        return;
      }
      onUpdateApplication(res.data);
    });
  }

  function getApplicationLogin(oAuthParams: Provider.OAuthGetParams) {
    AuthBackend.getApplicationLogin(oAuthParams).then((res: any) => {
      if (res.status === "ok") {
        onUpdateApplication(res.data);
        setInvitationCode(res.data);
      } else {
        onUpdateApplication(null);
        msg.value = res.msg;
      }
    });
  }

  function onUpdateApplication(app: Application | null) {
    application.value = app;
    if (props?.onUpdateApplication) {
      props.onUpdateApplication(app);
    }
  }

  /* ───────── Invitation ───────── */
  function setInvitationCode(app: Application | null = null) {
    const sp = new URLSearchParams(window.location.search);
    if (sp.has("invitationCode")) {
      const code = sp.get("invitationCode") || "";
      invitationCode.value = code;
      if (code !== "") {
        let appName = applicationName.value;
        if (app) {
          appName = app.name;
        }
        getInvitationCodeInfo(code, "admin/" + appName);
      }
    }
  }

  function getInvitationCodeInfo(code: string, appName: string) {
    InvitationBackend.getInvitationCodeInfo(code, appName).then((res: any) => {
      if (res.status === "error") {
        Setting.showMessage("error", res.msg);
        return;
      }
      invitation.value = res.data;
      if (res.data.email) {
        validEmail.value = true;
        email.value = res.data.email;
      }
      if (res.data.phone) {
        validPhone.value = true;
        phone.value = res.data.phone;
      }
    });
  }

  /* ───────── Result path ───────── */
  function getResultPath(
    app: Application,
    signupParams: Record<string, any>
  ): string {
    if (signupParams?.plan && signupParams?.pricing) {
      return `/buy-plan/${app.organization}/${signupParams.pricing}?user=${signupParams.username}&plan=${signupParams.plan}`;
    }
    const oAuthParams = Provider.getOAuthGetParameters();
    if (Setting.hasPromptPage(app)) {
      return `/prompt/${app.name}?oauth=${oAuthParams !== null}`;
    }
    return `/result/${app.name}`;
  }

  /* ───────── Submit ───────── */
  function onFinish(values: Record<string, any>) {
    const app = applicationObj.value;
    if (!app) return;

    // Flatten arrays
    for (const key of ["gender", "bio", "tag", "education"]) {
      if (Array.isArray(values[key])) {
        values[key] = values[key].join(", ");
      }
    }

    if (invitationCode.value && !values.invitationCode) {
      values.invitationCode = invitationCode.value;
    }

    const params = new URLSearchParams(window.location.search);
    values.plan = params.get("plan");
    values.pricing = params.get("pricing");

    const oAuthParams = Provider.getOAuthGetParameters();

    AuthBackend.signup(values, oAuthParams ?? undefined).then((res: any) => {
      if (res.status === "ok") {
        // OAuth code returned
        if (
          oAuthParams &&
          res.data &&
          typeof res.data === "string" &&
          !res.data.includes("/")
        ) {
          const code = res.data;
          const redirectUrl = `${oAuthParams.redirectUri}${oAuthParams.redirectUri.includes("?") ? "&" : "?"}code=${code}&state=${oAuthParams.state}`;
          Setting.goToLink(redirectUrl);
          return;
        }

        // Consent required
        if (
          oAuthParams &&
          res.data &&
          typeof res.data === "object" &&
          (res.data as any).required === true
        ) {
          Setting.goToLink(
            `/consent/${app.name}?${window.location.search.substring(1)}`
          );
          return;
        }

        if (typeof res.data === "string") {
          values.username = res.data.split("/")[1];
        }

        if (
          Setting.hasPromptPage(app) &&
          (!values.plan || !values.pricing)
        ) {
          AuthBackend.getAccount("").then((accountRes: any) => {
            if (accountRes.status === "ok") {
              if (props?.onUpdateAccount) {
                const account = accountRes.data;
                account.organization = accountRes.data2;
                props.onUpdateAccount(account);
              }
              Setting.goToLinkSoft(router, getResultPath(app, values));
            } else {
              Setting.showMessage(
                "error",
                `${t("application.Failed to sign in")}: ${accountRes.msg}`
              );
            }
          });
        } else {
          Setting.goToLinkSoft(router, getResultPath(app, values));
        }
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  /* ───────── Offset ───────── */
  function parseOffset(offset: number | undefined): string {
    if (
      offset === 2 ||
      offset === 4 ||
      Setting.inIframe() ||
      Setting.isMobile()
    ) {
      return "0 auto";
    }
    if (offset === 1) return "0 10%";
    if (offset === 3) return "0 60%";
    return "0 auto";
  }

  /* ───────── Provider visibility ───────── */
  function isProviderVisible(providerItem: any): boolean {
    return Setting.isProviderVisibleForSignUp(providerItem);
  }

  /* ───────── Get visible providers ───────── */
  function getVisibleProviders(): any[] {
    if (!applicationObj.value?.providers) return [];
    return applicationObj.value.providers.filter((p: any) =>
      isProviderVisible(p)
    );
  }

  return {
    // state
    applicationName,
    application,
    applicationObj,
    msg,
    email,
    phone,
    emailOrPhoneMode,
    countryCode,
    validEmail,
    validPhone,
    region,
    isTermsOfUseVisible,
    termsOfUseContent,
    invitationCode,
    invitation,
    displayNameRule,
    passwordPopoverOpen,
    // methods
    init,
    onFinish,
    parseOffset,
    isProviderVisible,
    getVisibleProviders,
    onUpdateApplication,
  };
}
