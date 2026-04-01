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
    v-else-if="application?.signinHtml"
    v-html="sanitizeHtml(application.signinHtml)"
  />

  <!-- Single visible provider auto-redirect -->
  <template v-else-if="shouldAutoRedirectToProvider">
    <a-spin :spinning="true" size="large" style="display: flex; justify-content: center; margin-top: 100px" />
  </template>

  <!-- Main login layout -->
  <div v-else class="login-content" :style="contentStyle">
    <div :class="['login-panel', isDark ? 'login-panel-dark' : '']">
      <!-- Side image / HTML -->
      <div
        v-if="application?.formSideHtml && !isMobile"
        class="side-image"
        v-html="sanitizeHtml(application.formSideHtml)"
      />

      <!-- Login form area -->
      <div class="login-form">
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

        <!-- Login form -->
        <a-form
          ref="formRef"
          :model="formState"
          layout="vertical"
          @finish="onFormFinish"
        >
          <!-- Custom CSS injection -->
          <component v-if="customCssComponent" :is="customCssComponent" />

          <!-- Render all signinItems as form items -->
          <template v-for="item in visibleSigninItems" :key="item.name">
            <!-- Logo -->
            <div v-if="item.name === 'Logo'" class="login-logo-box" :style="getItemCss(item)">
              <AppLogo :application="application!" />
            </div>

            <!-- Back button -->
            <div v-else-if="item.name === 'Back button'" class="login-back-box" :style="getItemCss(item)">
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
                :placeholder="item.placeholder || t('login:username, email or phone')"
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
                  :placeholder="item.placeholder || t('login:Password')"
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
import AppLogo from "@/components/AppLogo.vue";
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
  return application.value.signinItems.filter((item) => item.visible);
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

const contentStyle = computed(() => {
  const offset = application.value?.formOffset;
  return { margin: login.parseOffset(offset) };
});

const customCssComponent = computed<VNode | null>(() => {
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
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 40px 20px;
}

.login-panel {
  display: flex;
  background: var(--kx-bg-card, #fff);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  max-width: 900px;
  width: 100%;
}

.login-panel-dark {
  background: #1f1f1f;
}

.side-image {
  flex: 0 0 360px;
  min-height: 400px;
  overflow: hidden;
}

.login-form {
  flex: 1;
  padding: 40px;
  position: relative;
  min-width: 360px;
  max-width: 460px;
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

.login-logo-box {
  text-align: center;
  margin-bottom: 24px;
}

.login-back-box {
  margin-bottom: 16px;
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

.login-captcha-box {
  margin-bottom: 16px;
}

.login-custom-box {
  margin-bottom: 16px;
}

.signed-in-box {
  margin-bottom: 24px;
}

.hidden {
  display: none;
}

@media (max-width: 768px) {
  .login-panel {
    flex-direction: column;
  }
  .side-image {
    display: none;
  }
  .login-form {
    min-width: unset;
    max-width: unset;
    padding: 24px 16px;
  }
}
</style>
