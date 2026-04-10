<template>
  <!-- Device code expired -->
  <a-result
    v-if="login.type.value === 'device' && login.userCodeStatus.value === 'expired'"
    status="error"
    :title="t('login:The code has expired')"
    :sub-title="t('login:Please try again')"
  />

  <!-- Application loading -->
  <template v-else-if="login.applicationObj.value === undefined">
    <a-spin :spinning="true" size="large" style="display: flex; justify-content: center; margin-top: 100px" />
  </template>

  <!-- Application not found -->
  <template v-else-if="login.applicationObj.value === null">
    <a-result
      status="error"
      :title="t('application:Failed to sign in')"
      :sub-title="login.msg.value || t('general:There was a problem signing in')"
    >
      <template #extra>
        <a-button type="primary" @click="goBack">
          {{ t("login:Back") }}
        </a-button>
      </template>
    </a-result>
  </template>

  <!-- SAML response → redirect form -->
  <RedirectForm
    v-else-if="login.samlResponse.value"
    :redirect-url="login.redirectUrl.value"
    :saml-response="login.samlResponse.value"
    :relay-state="login.relayState.value"
  />

  <!-- Custom signinHtml override -->
  <div
    v-else-if="allowCustomSigninHtml && application?.signinHtml"
    v-html="sanitizeHtml(application.signinHtml)"
  />

  <!-- Single visible provider auto-redirect -->
  <template v-else-if="shouldAutoRedirectToProvider">
    <a-spin :spinning="true" size="large" style="display: flex; justify-content: center; margin-top: 100px" />
  </template>

  <!-- Main login layout -->
  <div
    v-else
    :class="['login-content', 'auth-shell', isDark ? 'auth-shell-dark' : 'auth-shell-light']"
    :style="contentStyle"
  >
    <div :class="['login-panel', 'login-panel-split', isDark ? 'login-panel-dark' : '']">
      <!-- PC: 左品牌区 / 手机: 顶区 — 与参考稿一致；有自定义侧栏 HTML 时用侧栏替代 -->
      <aside
        v-if="!(allowCustomSideHtml && application?.formSideHtml && !isMobile)"
        class="login-hero"
        aria-label="brand"
      >
        <div class="login-hero-inner">
          <img class="login-hero-logo" src="/img/kx-brand-mark-on-dark.svg" alt="" />
          <h1 class="login-hero-title">开轩启圭</h1>
          <p class="login-hero-subtitle">统一认证 · {{ brandProductName }}</p>
          <p class="login-hero-tagline">{{ t("login:Sign In") }} {{ brandProductName }}</p>
        </div>
      </aside>
      <div
        v-else-if="allowCustomSideHtml && application?.formSideHtml && !isMobile"
        class="side-image"
        v-html="sanitizeHtml(application.formSideHtml)"
      />
      <div v-else-if="!isMobile" class="side-image side-image-default">
        <div class="side-brand-stack">
          <img class="side-brand-hero" :src="platformBrandMarkSrc" alt="开轩启圭" />
          <div class="side-brand-subtitle">统一认证中心</div>
        </div>
      </div>

      <!-- Login form area -->
      <div class="login-form">
          <div class="brand-header brand-header--duplicate">
            <img class="brand-logo" :src="brandLogoUrl" alt="开轩启圭" />
            <div class="brand-text">
              <div class="brand-title">开轩启圭</div>
              <div class="brand-subtitle">统一认证 · {{ brandProductName }}</div>
            </div>
          </div>
          <div class="brand-helper-text brand-helper-text--duplicate">{{ t("login:Sign In") }} {{ brandProductName }}</div>

        <!-- Background -->
        <div
          v-if="application?.formBackgroundUrl"
          class="login-background"
          :style="{ backgroundImage: `url(${application.formBackgroundUrl})` }"
        />

        <!-- Org choice box (visible when needed) -->
        <template v-if="login.isOrganizationChoiceBoxVisible(application?.orgChoiceMode || '')">
          <OrganizationSelect
            :mode="application?.orgChoiceMode"
            :init-value="login.owner.value || ''"
            @change="onOrganizationChange"
          />
        </template>

        <!-- Already signed-in box -->
        <template v-else-if="isSignedIn && application?.enableSigninSession">
          <div class="signed-in-box">
            <SelfLoginButton
              :username="account?.displayName || account?.name || ''"
              @click="onContinueSignIn"
            />
            <a-divider>{{ t("login:Or sign in with another account") }}</a-divider>
          </div>
        </template>

        <div class="source-app-brand">
          <img :src="sourceAppIcon" :alt="sourceAppName" class="source-app-brand-logo" />
          <div class="source-app-brand-name">{{ sourceAppName }}</div>
        </div>

        <!-- Login form -->
        <a-form
          ref="formRef"
          :model="formState"
          layout="vertical"
          @finish="onFormFinish"
        >
          <div class="login-form-title-block">
            <h2 class="login-form-title">开轩启圭</h2>
            <p class="login-form-subtitle">统一认证 · {{ brandProductName }}</p>
          </div>

          <!-- Custom CSS injection -->
          <component v-if="customCssComponent" :is="customCssComponent" />

          <!-- Render all signinItems as form items -->
          <template v-for="item in visibleSigninItems" :key="item.name">
            <!-- Back button -->
            <div
              v-if="item.name === 'Back button' && showBackButton"
              class="login-back-box"
              :style="getItemCss(item)"
            >
              <a-button type="link" @click="goBack">
                <template #icon><ArrowLeftOutlined /></template>
                {{ t("login:Back") }}
              </a-button>
            </div>

            <!-- Languages -->
            <div v-else-if="item.name === 'Languages'" class="login-languages-box" :style="getItemCss(item)">
              <LanguageSelect />
            </div>

            <!-- Signin methods tabs -->
            <div v-else-if="item.name === 'Signin methods'" class="login-methods-box" :style="getItemCss(item)">
              <a-tabs
                v-if="methodItems.length > 1"
                v-model:activeKey="login.loginMethod.value"
                centered
              >
                <a-tab-pane
                  v-for="mi in methodItems"
                  :key="mi.key"
                  :tab="mi.label"
                />
              </a-tabs>
            </div>

            <!-- Username -->
            <a-form-item
              v-else-if="item.name === 'Username'"
              :label="getItemLabel(item, t('general:Username'))"
              name="username"
              :rules="[{ required: true, message: t('login:Please input your username') }]"
              :style="getItemCss(item)"
            >
              <a-input
                v-model:value="formState.username"
                name="username"
                autocomplete="username"
                spellcheck="false"
                :placeholder="item.placeholder || t('login:username, Email or phone')"
                size="large"
                :prefix="usernamePrefix"
                @change="(e: any) => login.onUsernameChange(e.target?.value ?? e)"
              >
                <template v-if="showCountryCode" #addonBefore>
                  <CountryCodeSelect v-model="countryCode" :width="90" />
                </template>
              </a-input>
            </a-form-item>

            <!-- Password / verification code (combined) -->
            <template v-else-if="item.name === 'Password'">
              <a-form-item
                v-if="showPasswordInput"
                :label="getItemLabel(item, t('general:Password'))"
                name="password"
                :rules="[{ required: true, message: t('login:Please input your password') }]"
                :style="getItemCss(item)"
              >
                <a-input-password
                  v-model:value="formState.password"
                  name="password"
                  autocomplete="current-password"
                  :placeholder="item.placeholder || t('general:Password')"
                  size="large"
                />
              </a-form-item>

              <!-- If method is verificationCode and there's no dedicated code item, show SendCodeInput here -->
              <a-form-item
                v-else-if="showInlineVerificationCode"
                :label="t('login:Verification code')"
                name="code"
                :rules="[{ required: true, message: t('login:Please input your code') }]"
                :style="getItemCss(item)"
              >
                <SendCodeInput
                  v-model="formState.code"
                  :application="application!"
                  :method="verificationCodeMethod"
                  :country-code="countryCode"
                  :on-button-click-args="{
                    dest: formState.username,
                    type: verificationCodeMethod,
                    applicationId: `admin/${application?.name}`,
                    checkUser: 'true',
                  }"
                />
              </a-form-item>
            </template>

            <!-- Dedicated Verification code signinItem -->
            <a-form-item
              v-else-if="item.name === 'Verification code'"
              :label="getItemLabel(item, t('login:Verification code'))"
              name="code"
              :rules="[{ required: isVerificationCodeMethodActive, message: t('login:Please input your code') }]"
              :style="getItemCss(item)"
              :class="{ hidden: !isVerificationCodeMethodActive }"
            >
              <SendCodeInput
                v-model="formState.code"
                :application="application!"
                :method="verificationCodeMethod"
                :country-code="countryCode"
                :on-button-click-args="{
                  dest: formState.username,
                  type: verificationCodeMethod,
                  applicationId: `admin/${application?.name}`,
                  checkUser: 'true',
                }"
                :use-inline-captcha="login.isInlineCaptchaEnabled(application)"
                :captcha-value="login.captchaValues.value"
                @refresh-captcha="login.refreshInlineCaptcha"
              />
            </a-form-item>

            <!-- Forgot password link -->
            <div v-else-if="item.name === 'Forgot password?'" class="login-forgot-box" :style="getItemCss(item)">
              <router-link :to="forgetUrl">
                {{ item.label || t("login:Forgot password?") }}
              </router-link>
            </div>

            <!-- Agreement / Terms of Use -->
            <div v-else-if="item.name === 'Agreement'" class="login-agreement-box" :style="getItemCss(item)">
              <a-checkbox v-model:checked="termsAccepted">
                {{ t("login:I have read and agree to the") }}
                <a href="#" @click.prevent="login.isTermsOfUseVisible.value = true">
                  {{ t("login:Terms of Use") }}
                </a>
              </a-checkbox>
            </div>

            <!-- Login button -->
            <a-form-item v-else-if="item.name === 'Login button'" :style="getItemCss(item)">
              <a-button
                type="primary"
                html-type="submit"
                block
                size="large"
                :loading="login.loginLoading.value"
              >
                {{ t("login:Sign In") }}
              </a-button>
            </a-form-item>

            <!-- Provider buttons (OAuth) -->
            <div v-else-if="item.name === 'Providers'" class="login-providers-box" :style="getItemCss(item)">
              <a-divider v-if="oauthProviderItems.length > 0">
                <span class="login-provider-divider-text">{{ t("login:Or sign in with") }}</span>
              </a-divider>
              <div class="provider-buttons">
                <ProviderButton
                  v-for="pi in oauthProviderItems"
                  :key="pi.name"
                  :provider-item="pi"
                  :application="application!"
                />
              </div>
            </div>

            <!-- Signup link -->
            <div v-else-if="item.name === 'Signup link'" class="login-signup-box" :style="getItemCss(item)">
              <span v-if="application?.enableSignUp">
                {{ t("login:No account?") }}&nbsp;
                <router-link :to="signupUrl" @click="login.storeSigninUrl">
                  {{ t("login:sign up now") }}
                </router-link>
              </span>
            </div>

            <!-- Inline captcha -->
            <div v-else-if="item.name === 'Captcha'" class="login-captcha-box" :style="getItemCss(item)">
              <CaptchaModal
                v-if="captchaProviderItems.length > 0 && login.isInlineCaptchaEnabled(application)"
                :owner="captchaProviderItems[0].provider?.owner || ''"
                :name="captchaProviderItems[0].provider?.name || ''"
                :visible="true"
                :is-current-provider="true"
                :no-modal="true"
                @ok="onInlineCaptchaOk"
                @update-token="onInlineCaptchaToken"
              />
            </div>

            <!-- Custom / text items -->
            <div
              v-else-if="item.isCustom"
              class="login-custom-box"
              :style="getItemCss(item)"
              v-html="sanitizeHtml(item.label || '')"
            />
          </template>
        </a-form>
        <div
          v-if="application?.enableSignUp && !hasSignupItem"
          class="login-signup-box login-signup-box-fallback"
        >
          {{ t("login:No account?") }}&nbsp;
          <router-link :to="signupUrl" @click="login.storeSigninUrl">
            {{ t("login:sign up now") }}
          </router-link>
        </div>

        <!-- Captcha modal (non-inline) -->
        <CaptchaModal
          v-if="captchaProviderItems.length > 0 && !login.isInlineCaptchaEnabled(application)"
          :owner="captchaProviderItems[0].provider?.owner || ''"
          :name="captchaProviderItems[0].provider?.name || ''"
          :visible="login.openCaptchaModal.value"
          :is-current-provider="true"
          @ok="onModalCaptchaOk"
          @cancel="login.openCaptchaModal.value = false"
        />

        <!-- Agreement modal -->
        <AgreementModal
          :visible="login.isTermsOfUseVisible.value"
          :content="application?.termsOfUse || ''"
          @accept="login.isTermsOfUseVisible.value = false; termsAccepted = true"
          @cancel="login.isTermsOfUseVisible.value = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h, watch, type VNode } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ArrowLeftOutlined } from "@ant-design/icons-vue";
import DOMPurify from "dompurify";

import { useLogin } from "@/composables/useLogin";
import * as Setting from "@/utils/Setting";
import * as Provider from "@/utils/Provider";
import type { Application, SigninItem } from "@/api/types";

// Components
import RedirectForm from "@/components/RedirectForm.vue";
import LanguageSelect from "@/components/LanguageSelect.vue";
import CountryCodeSelect from "@/components/CountryCodeSelect.vue";
import SendCodeInput from "@/components/SendCodeInput.vue";
import CaptchaModal from "@/components/CaptchaModal.vue";
import ProviderButton from "@/components/ProviderButton.vue";
import SelfLoginButton from "@/components/SelfLoginButton.vue";
import OrganizationSelect from "@/components/OrganizationSelect.vue";
import AgreementModal from "@/components/AgreementModal.vue";

/* ── Props ── */

const props = defineProps<{
  account?: any;
}>();

/* ── Core ── */

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const login = useLogin({
  account: props.account,
});

/* ── Local state ── */

const formRef = ref();
const formState = ref({
  username: "",
  password: "",
  code: "",
  organization: "",
});
const termsAccepted = ref(false);
const countryCode = ref("+1");
const isMobile = ref(Setting.isMobile());

/* ── Computed ── */

const application = computed(() => login.applicationObj.value);
const isDark = computed(() => Setting.isDarkTheme());
const isSignedIn = computed(() => !!props.account?.name);

const methodItems = computed(() => {
  if (!application.value) return [];
  return login.getMethodChoiceItems(application.value);
});

const visibleSigninItems = computed<SigninItem[]>(() => {
  if (!application.value?.signinItems) return [];
  return application.value.signinItems.filter((item) => item.visible && item.name !== "Logo");
});

const oauthProviderItems = computed(() => {
  if (!application.value) return [];
  return login.getVisibleOAuthProviderItems(application.value);
});

const captchaProviderItems = computed(() => {
  if (!application.value) return [];
  return login.getCaptchaProviderItems(application.value);
});

const showPasswordInput = computed(() => {
  const m = login.loginMethod.value;
  return m === "password" || m === "ldap";
});

const showInlineVerificationCode = computed(() => {
  const m = login.loginMethod.value;
  if (!m.includes("verificationCode")) return false;
  // Only show inline if there's no dedicated "Verification code" signinItem
  return !login.hasVerificationCodeSigninItem(application.value);
});

const isVerificationCodeMethodActive = computed(() => {
  return login.loginMethod.value.includes("verificationCode");
});

const verificationCodeMethod = computed(() => {
  const m = login.loginMethod.value;
  if (m === "verificationCodeEmail") return "email";
  if (m === "verificationCodePhone") return "phone";
  return "all";
});

const showCountryCode = computed(() => {
  return login.loginMethod.value.includes("verificationCode");
});

const usernamePrefix = computed(() => {
  return undefined; // Can be UserOutlined icon
});

const forgetUrl = computed(() => {
  if (!application.value) return "/forget";
  if (application.value.forgetUrl) return application.value.forgetUrl;
  return `/forget/${application.value.name}`;
});

const signupUrl = computed(() => {
  if (!application.value) return "/signup";
  return login.getSignupUrl(application.value);
});

const showBackButton = computed(() => {
  const path = route.path;
  if (path.includes("/login/oauth/authorize")) return true;
  if (path.includes("/login/oauth/device/")) return true;
  if (path.includes("/login/saml/authorize/")) return true;
  if (path.includes("/cas/") && path.endsWith("/login")) return true;
  return false;
});

const sourceAppName = computed(() => {
  const app = application.value;
  if (!app) return "来源应用";
  return app.displayName || app.name || "来源应用";
});

/** 左侧栏：平台主品牌（与 favicon「单字开」区分，使用完整 SVG 字标） */
const platformBrandMarkSrc = computed(() =>
  isDark.value ? "/img/kaixuan-platform-logo-dark.svg" : "/img/kaixuan-platform-logo-light.svg"
);

/** 表单顶栏：优先应用主 logo（横版），勿优先 favicon 以免小图被裁成无意义圆块 */
const sourceAppIcon = computed(() => {
  const app = application.value as Application & { logoDark?: string; themeData?: Record<string, unknown> };
  if (!app) {
    return isDark.value ? "/img/kaixuan-platform-logo-dark.svg" : "/img/kaixuan-platform-logo-light.svg";
  }
  const lightLogo = app.logo || "/img/kaixuan-platform-logo-light.svg";
  const darkFromThemeData = typeof app.themeData?.logoDark === "string" ? String(app.themeData.logoDark) : "";
  const darkFromField = app.logoDark || "";
  const inferredDark = lightLogo.includes("-light.") ? lightLogo.replace("-light.", "-dark.") : "";
  if (isDark.value) {
    return darkFromField || darkFromThemeData || inferredDark || "/img/kaixuan-platform-logo-dark.svg";
  }
  return lightLogo;
});

const shouldAutoRedirectToProvider = computed(() => {
  if (!application.value) return false;
  const app = application.value;

  // Check if no password/code/webauthn/ldap methods enabled
  const hasLocalMethod = app.signinMethods?.some((m) =>
    ["Password", "Verification code", "WebAuthn", "LDAP", "Face ID"].includes(m.name)
  );
  if (hasLocalMethod) return false;

  const visibleProviders = oauthProviderItems.value;
  return visibleProviders.length === 1;
});

const brandProductName = computed(() => {
  return application.value?.displayName || application.value?.name || "Auth";
});
const brandLogoUrl = computed(() =>
  isDark.value ? "/img/kx-brand-mark-on-dark.svg" : "/img/kx-brand-mark.svg",
);
const hasSignupItem = computed(() => visibleSigninItems.value.some((item) => item.name === "Signup link"));
const enforceBrandStyle = computed(() => true);
const allowCustomSigninHtml = computed(() => !enforceBrandStyle.value);
const allowCustomSideHtml = computed(() => !enforceBrandStyle.value);

const contentStyle = computed(() => {
  if (enforceBrandStyle.value) return {};
  const offset = application.value?.formOffset;
  if (!isMobile.value && (offset === 1 || offset === 2)) {
    return { margin: "0px auto" };
  }
  return { margin: login.parseOffset(offset) };
});

const customCssComponent = computed<VNode | null>(() => {
  if (enforceBrandStyle.value) return null;
  if (!application.value?.formCss) return null;
  const css = isMobile.value
    ? application.value.formCssMobile || application.value.formCss
    : application.value.formCss;
  if (!css) return null;
  return h("style", {}, sanitizeCss(css));
});

/* ── Methods ── */

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}

function sanitizeCss(css: string): string {
  // Basic CSS blocklist
  const blocklist = [
    /expression\s*\(/gi,
    /javascript\s*:/gi,
    /vbscript\s*:/gi,
    /@import/gi,
    /url\s*\(/gi,
  ];
  let result = css;
  for (const pattern of blocklist) {
    result = result.replace(pattern, "/* blocked */");
  }
  return result;
}

function getItemCss(item: SigninItem): Record<string, string> {
  if (enforceBrandStyle.value) return {};
  if (!item.customCss) return {};
  try {
    return JSON.parse(item.customCss);
  } catch {
    return {};
  }
}

function getItemLabel(item: SigninItem, fallback: string): string {
  return item.label || fallback;
}

function goBack() {
  window.history.go(-2);
}

function onOrganizationChange(val: string) {
  if (!val) return;
  router.push(`/login/${val}`);
}

function onContinueSignIn() {
  if (formRef.value) {
    formRef.value.submit();
  }
}

function onFormFinish(values: Record<string, unknown>) {
  if (!termsAccepted.value) {
    Setting.showMessage("warning", t("login:I have read and agree to the") + " " + t("login:Terms of Use"));
    return;
  }

  const merged = {
    ...values,
    username: formState.value.username,
    password: formState.value.password || undefined,
    code: formState.value.code || undefined,
    organization: application.value?.organization || "",
  };
  login.onFinish(merged);
}

function onModalCaptchaOk(captchaType: string, captchaToken: string, clientSecret: string) {
  login.onCaptchaOk(captchaType, captchaToken, clientSecret, {
    username: formState.value.username,
    password: formState.value.password || undefined,
    code: formState.value.code || undefined,
    organization: application.value?.organization || "",
    application: application.value?.name || "",
  });
}

function onInlineCaptchaOk(captchaType: string, captchaToken: string, clientSecret: string) {
  login.captchaValues.value = { captchaType, captchaToken, clientSecret };
}

function onInlineCaptchaToken(captchaType: string, captchaToken: string, clientSecret: string) {
  login.captchaValues.value = { captchaType, captchaToken, clientSecret };
}

/* ── Auto-redirect for single provider ── */

watch(shouldAutoRedirectToProvider, (val) => {
  if (val && application.value) {
    const pi = oauthProviderItems.value[0];
    if (pi?.provider) {
      const url = Provider.getAuthUrl(application.value, pi.provider, "signup");
      if (url) {
        Setting.goToLink(url);
      }
    }
  }
});

/* ── Lifecycle ── */

onMounted(async () => {
  await login.loadApplication();

  // Set prefilled username
  if (login.prefilledUsername.value) {
    formState.value.username = login.prefilledUsername.value;
  }

  // Auto signin
  if (application.value?.enableAutoSignin && Setting.inIframe()) {
    login.sendSilentSigninData("signing-in");
  }
});
</script>

<style scoped>
.login-content {
  display: flex;
  justify-content: stretch;
  align-items: stretch;
  width: 100%;
  margin: 0 !important;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 0;
}

/* 单卡兜底（无 split 类时） */
.login-panel:not(.login-panel-split) {
  display: flex;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(252, 254, 255, 0.98) 100%);
  border-radius: 18px;
  border: 1px solid #d9e6ff;
  box-shadow: 0 14px 36px rgba(68, 102, 165, 0.18);
  overflow: hidden;
  max-width: 960px;
  width: 100%;
}

.login-panel-split {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  width: 100vw;
  max-width: none;
  min-height: 100vh;
  min-height: 100dvh;
  border-radius: 0;
  border: none;
  overflow: hidden;
  background: #ffffff;
  box-shadow: none;
}

.login-panel-dark.login-panel-split {
  background: #111827;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.5);
}

.login-hero {
  flex: 0 0 46%;
  min-width: 300px;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 36px;
  position: relative;
  color: #f8fafc;
  background: linear-gradient(165deg, #050f1f 0%, #0c2242 45%, #155a8c 100%);
}

.login-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.45;
  background-image:
    radial-gradient(ellipse 90% 70% at 15% 15%, rgba(59, 130, 246, 0.4), transparent 52%),
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 100% 100%, 26px 26px, 26px 26px;
}

.login-hero-inner {
  position: relative;
  z-index: 1;
  text-align: left;
  max-width: 300px;
}

.login-hero-logo {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  margin-bottom: 18px;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.28);
}

.login-hero-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.2px;
  line-height: 1.2;
}

.login-hero-subtitle {
  margin: 0 0 14px;
  font-size: 14px;
  color: rgba(248, 250, 252, 0.9);
}

.login-hero-tagline {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: rgba(248, 250, 252, 0.68);
}

.login-panel-dark .login-hero {
  background: linear-gradient(165deg, #020617 0%, #0b1220 48%, #132f52 100%);
}

.login-panel-dark .side-image-default {
  background: linear-gradient(145deg, #1a2338 0%, #141c2e 100%);
  border-right-color: #2f3d55;
}

.login-panel-dark .side-brand-subtitle {
  color: #9fb0c8;
}

.side-image {
  flex: 0 0 340px;
  min-height: 400px;
  overflow: hidden;
  background: radial-gradient(circle at top left, rgba(22, 119, 255, 0.2), transparent 58%);
}

.side-image-default {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 40px 20px 32px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
  border-right: 1px solid #e3ebff;
}

.side-brand-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 300px;
}

.side-brand-hero {
  width: 100%;
  height: auto;
  max-height: 96px;
  object-fit: contain;
}

.side-brand-subtitle {
  margin-top: 0;
  color: #5c6b8a;
  font-size: 15px;
  letter-spacing: 0.02em;
}

.login-form {
  flex: 0 0 54%;
  padding: 40px 36px 36px;
  position: relative;
  min-width: 0;
  min-height: 100%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-panel-dark .login-form {
  background: #111827;
}

/* 品牌区已展示，表单内重复标题隐藏 */
.brand-header--duplicate,
.brand-helper-text--duplicate {
  display: none !important;
}

.login-form :deep(.ant-form-item) {
  margin-bottom: 14px;
}

.login-form :deep(.ant-form) {
  width: min(380px, 100%);
  margin: 0 auto;
}

.login-form-title-block {
  margin-bottom: 14px;
}

.login-form-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #0f2747;
}

.login-form-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #56719a;
}

.login-panel-dark .login-form-title {
  color: #dbeafe;
}

.login-panel-dark .login-form-subtitle {
  color: #9fb2d4;
}

/* 白底上的深蓝输入区，对齐参考稿 */
.login-form :deep(.ant-input),
.login-form :deep(.ant-input-password),
.login-form :deep(.ant-input-affix-wrapper),
.login-form :deep(.ant-input-group-addon) {
  background: #152238 !important;
  border-color: #2d3f66 !important;
  color: #e8eef7 !important;
  border-radius: 10px !important;
}

.login-form :deep(.ant-input-affix-wrapper .ant-input) {
  background: transparent !important;
}

.login-form :deep(.ant-input::placeholder) {
  color: #94a3b8 !important;
}

.login-panel-dark .login-form :deep(.ant-input),
.login-panel-dark .login-form :deep(.ant-input-password),
.login-panel-dark .login-form :deep(.ant-input-affix-wrapper),
.login-panel-dark .login-form :deep(.ant-input-group-addon) {
  background: #0c1424 !important;
  border-color: #334155 !important;
  color: #e5e7eb !important;
}

/* 登录方式 Tab：统一深蓝，去掉 Ant Design 默认紫 */
.login-form :deep(.ant-tabs-nav::before) {
  border-color: rgba(148, 163, 184, 0.35) !important;
}

.login-form :deep(.ant-tabs-tab) {
  color: #64748b !important;
}

.login-form :deep(.ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #1d4ed8 !important;
}

.login-form :deep(.ant-tabs-ink-bar) {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8) !important;
}

.login-form :deep(.ant-btn-primary) {
  height: 48px !important;
  font-weight: 600 !important;
  border: none !important;
  border-radius: 10px !important;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8) !important;
  box-shadow: 0 10px 26px rgba(37, 99, 235, 0.38);
}

.login-form :deep(.ant-btn-primary:hover) {
  background: linear-gradient(90deg, #60a5fa, #1e40af) !important;
}

.login-form :deep(a),
.login-form :deep(.ant-btn-link) {
  color: #2563eb !important;
}

@media (min-width: 769px) {
  .login-form :deep(.login-languages-box) {
    position: absolute;
    top: 18px;
    right: 20px;
    z-index: 2;
    margin: 0 !important;
  }
}

.brand-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.brand-logo {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(22, 119, 255, 0.22);
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: #24314f;
}

.brand-subtitle {
  font-size: 12px;
  color: #5d6f96;
}

.brand-helper-text {
  margin-bottom: 16px;
  font-size: 13px;
  color: #6a7ca5;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.1;
}

.login-back-box {
  margin-bottom: 16px;
}

.source-app-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 18px;
}

.source-app-brand-logo {
  flex-shrink: 0;
  max-height: 52px;
  max-width: 200px;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 10px;
  border: 1px solid #e5ecfb;
  background: #ffffff;
  padding: 4px 8px;
  box-shadow: 0 1px 4px rgba(31, 42, 68, 0.08);
}

.source-app-brand-name {
  color: var(--kx-text-primary, #1f2a44);
  font-size: 28px;
  font-weight: 600;
  line-height: 1.2;
}

.login-languages-box {
  text-align: right;
  margin-bottom: 16px;
}

.login-methods-box {
  margin-bottom: 16px;
}

.login-forgot-box {
  text-align: right;
  margin-bottom: 16px;
}

.login-agreement-box {
  margin-bottom: 16px;
}

.login-providers-box {
  margin-bottom: 16px;
}

.provider-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.login-provider-divider-text {
  color: #999;
  font-size: 12px;
}

.login-signup-box {
  text-align: center;
  margin-top: 16px;
}

.login-signup-box-fallback {
  margin-top: 8px;
}

.login-captcha-box {
  margin-bottom: 16px;
}

.login-custom-box {
  margin-bottom: 16px;
}

.signed-in-box {
  margin-bottom: 24px;
}

.login-form {
  --field-bg: #f7f9fc;
  --field-border: #d8dee9;
  --field-hover: #cbd5e1;
  --field-focus: #9db3d9;
  --field-text: #1f2a44;
  --field-placeholder: #98a2b3;
}

.login-panel-dark .login-form {
  --field-bg: #1f2b40;
  --field-border: #33435f;
  --field-hover: #405273;
  --field-focus: #5b7db1;
  --field-text: #e6edf7;
  --field-placeholder: #9fb0c8;
}

.login-content .login-panel .login-form :deep(.ant-input),
.login-content .login-panel .login-form :deep(.ant-input-affix-wrapper),
.login-content .login-panel .login-form :deep(.ant-input-password),
.login-content .login-panel .login-form :deep(.ant-select-selector),
.login-content .login-panel .login-form :deep(.ant-input-group-addon) {
  background: var(--field-bg) !important;
  border-color: var(--field-border) !important;
  color: var(--field-text) !important;
}

.login-content .login-panel .login-form :deep(.ant-input::placeholder),
.login-content .login-panel .login-form :deep(.ant-input-password input::placeholder) {
  color: var(--field-placeholder) !important;
}

.login-content .login-panel .login-form :deep(.ant-input:hover),
.login-content .login-panel .login-form :deep(.ant-input-affix-wrapper:hover),
.login-content .login-panel .login-form :deep(.ant-input-password:hover),
.login-content .login-panel .login-form :deep(.ant-select-selector:hover) {
  border-color: var(--field-hover) !important;
}

.login-content .login-panel .login-form :deep(.ant-input:focus),
.login-content .login-panel .login-form :deep(.ant-input-affix-wrapper-focused),
.login-content .login-panel .login-form :deep(.ant-input-password-focused),
.login-content .login-panel .login-form :deep(.ant-select-focused .ant-select-selector) {
  border-color: var(--field-focus) !important;
  box-shadow: 0 0 0 2px rgba(100, 132, 189, 0.12) !important;
}

.hidden {
  display: none;
}

@media (max-width: 768px) {
  .login-content {
    align-items: stretch;
    padding: 0;
  }

  .login-panel:not(.login-panel-split) {
    flex-direction: column;
    border-radius: 12px;
  }

  .login-panel-split {
    flex-direction: column;
    border-radius: 0;
    width: 100vw;
    max-width: none;
    min-height: 100vh;
    min-height: 100dvh;
    box-shadow: none;
  }

  .login-hero {
    flex: none;
    min-width: unset;
    min-height: unset;
    padding: 32px 24px 40px;
    border-radius: 0 0 26px 26px;
  }

  .login-hero-inner {
    text-align: center;
    max-width: none;
  }

  .login-hero-logo {
    margin-left: auto;
    margin-right: auto;
  }

  .login-form {
    margin-top: -20px;
    border-radius: 22px 22px 0 0;
    padding: 28px 18px 40px;
    min-width: unset;
    max-width: unset;
    flex: 1;
    box-shadow: 0 -12px 40px rgba(15, 23, 42, 0.06);
    display: block;
  }

  .login-panel-dark .login-form {
    box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.35);
  }

  .side-image {
    display: none;
  }

  .login-form :deep(.login-languages-box) {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 2;
    margin: 0 !important;
  }
  .source-app-brand-name {
    font-size: 30px;
  }
}
</style>
