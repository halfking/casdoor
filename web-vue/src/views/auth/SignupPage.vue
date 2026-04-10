<template>
  <div v-if="!application" style="display: flex; justify-content: center; align-items: center; height: 50vh">
    <a-spin size="large" :tip="t('login.Loading')" />
  </div>

  <!-- Custom signup HTML override -->
  <div v-else-if="allowCustomSignupHtml && signupHtmlSafe" v-html="signupHtmlSafe" />

  <div v-else>
    <div
      :class="['login-content', isMobile ? 'login-content-mobile' : 'login-content-desktop']"
      :style="{ margin: contentMargin }"
    >
      <!-- Custom CSS -->
      <component v-if="customCssComponent" :is="customCssComponent" />

      <div :class="['login-panel', isDark ? 'login-panel-dark' : '']">
        <!-- Side image -->
        <div
          v-if="application.formSideHtml && !isMobile"
          class="side-image"
          v-html="sideHtmlSafe"
        />
        <div v-else-if="!isMobile" class="side-image side-image-default">
          <div class="side-brand-stack">
            <img class="side-brand-hero" :src="platformBrandMarkSrc" alt="开轩启圭" />
            <div class="side-brand-subtitle">统一认证中心</div>
          </div>
        </div>

        <div class="login-form">
          <CustomHelmet :application="application" />

          <LanguageSelect
            v-if="application.organizationObj?.languages"
            :languages="application.organizationObj.languages"
            class="signup-language-select"
          />

          <div class="source-app-brand">
            <img :src="sourceAppLogo" :alt="sourceAppName" class="source-app-brand-logo" />
            <div class="source-app-brand-name">{{ sourceAppName }}</div>
          </div>

          <!-- Sign up disabled -->
          <a-result
            v-if="!application.enableSignUp"
            status="error"
            :title="t('application.Sign Up Error')"
            :sub-title="t('application.The application does not allow to sign up new account')"
          >
            <template #extra>
              <a-button type="primary" @click="goToLogin">{{ t('login.Sign In') }}</a-button>
            </template>
          </a-result>

          <!-- Signup form -->
          <a-form
            v-else
            ref="formRef"
            :model="formState"
            name="signup"
            :label-col="enforceBrandStyle || isMobile ? undefined : { span: 8 }"
            :wrapper-col="enforceBrandStyle || isMobile ? undefined : { span: 16 }"
            :layout="enforceBrandStyle ? 'vertical' : (isMobile ? 'vertical' : 'horizontal')"
            :style="{ width: 'min(460px, 100%)' }"
            size="large"
            @finish="handleFinish"
            @finishFailed="handleFinishFailed"
          >
            <!-- Hidden fields -->
            <a-form-item name="application" hidden>
              <a-input />
            </a-form-item>
            <a-form-item name="organization" hidden>
              <a-input />
            </a-form-item>
            <a-form-item
              name="signupOrganizationId"
              label="组织 ID（可选）"
              extra="留空默认注册到 personal（通过 personal-app）；填写后按当前应用注册到指定组织"
              class="signup-organization-id"
            >
              <a-input
                v-model:value="formState.signupOrganizationId"
                placeholder="例如：kaixuan-dev / kaixuan-prd / personal"
              />
            </a-form-item>

            <!-- Dynamic signup items -->
            <template
              v-for="(signupItem, idx) in visibleSignupItems"
              :key="idx"
            >
              <!-- Per-item custom CSS -->
              <component
                v-if="getItemCssComponent(signupItem, idx)"
                :is="getItemCssComponent(signupItem, idx)"
              />

              <!-- Username -->
              <a-form-item
                v-if="signupItem.name === 'Username'"
                name="username"
                :label="signupItem.label || t('signup.Username')"
                :rules="getUsernameRules(signupItem)"
                class="signup-username"
              >
                <a-input
                  v-model:value="formState.username"
                  :placeholder="signupItem.placeholder"
                  :disabled="invitation?.username !== undefined && invitation?.username !== ''"
                />
              </a-form-item>

              <!-- Display name: First, Last mode -->
              <template v-else-if="signupItem.name === 'Display name' && signupItem.rule === 'First, last' && getLanguage() !== 'zh'">
                <a-form-item
                  name="firstName"
                  :label="signupItem.label || t('general.First name')"
                  :rules="getNameRules(signupItem, t('signup.Please input your first name!'))"
                  class="signup-first-name"
                >
                  <a-input v-model:value="formState.firstName" :placeholder="signupItem.placeholder" />
                </a-form-item>
                <a-form-item
                  name="lastName"
                  :label="signupItem.label || t('general.Last name')"
                  :rules="getNameRules(signupItem, t('signup.Please input your last name!'))"
                  class="signup-last-name"
                >
                  <a-input v-model:value="formState.lastName" :placeholder="signupItem.placeholder" />
                </a-form-item>
              </template>

              <!-- Display name: normal -->
              <a-form-item
                v-else-if="signupItem.name === 'Display name'"
                name="name"
                :label="signupItem.label || ((signupItem.rule === 'Real name' || signupItem.rule === 'First, last') ? t('application.Real name') : t('general.Display name'))"
                :rules="getNameRules(signupItem, (signupItem.rule === 'Real name' || signupItem.rule === 'First, last') ? t('signup.Please input your real name!') : t('signup.Please input your display name!'))"
                class="signup-name"
              >
                <a-input v-model:value="formState.name" :placeholder="signupItem.placeholder" />
              </a-form-item>

              <!-- First name (standalone) -->
              <a-form-item
                v-else-if="signupItem.name === 'First name' && displayNameRule !== 'First, last'"
                name="firstName"
                :label="signupItem.label || t('general.First name')"
                :rules="getNameRules(signupItem, t('signup.Please input your first name!'))"
                class="signup-first-name"
              >
                <a-input v-model:value="formState.firstName" :placeholder="signupItem.placeholder" />
              </a-form-item>

              <!-- Last name (standalone) -->
              <a-form-item
                v-else-if="signupItem.name === 'Last name' && displayNameRule !== 'First, last'"
                name="lastName"
                :label="signupItem.label || t('general.Last name')"
                :rules="getNameRules(signupItem, t('signup.Please input your last name!'))"
                class="signup-last-name"
              >
                <a-input v-model:value="formState.lastName" :placeholder="signupItem.placeholder" />
              </a-form-item>

              <!-- Affiliation -->
              <a-form-item
                v-else-if="signupItem.name === 'Affiliation'"
                name="affiliation"
                :label="signupItem.label || t('user.Affiliation')"
                :rules="getNameRules(signupItem, t('signup.Please input your affiliation!'))"
                class="signup-affiliation"
              >
                <a-input v-model:value="formState.affiliation" :placeholder="signupItem.placeholder" />
              </a-form-item>

              <!-- ID card -->
              <a-form-item
                v-else-if="signupItem.name === 'ID card'"
                name="idCard"
                :label="signupItem.label || t('user.ID card')"
                :rules="idCardRules(signupItem)"
                class="signup-idcard"
              >
                <a-input v-model:value="formState.idCard" :placeholder="signupItem.placeholder" />
              </a-form-item>

              <!-- Country/Region -->
              <a-form-item
                v-else-if="signupItem.name === 'Country/Region'"
                name="country_region"
                :label="signupItem.label || t('user.Country/Region')"
                :rules="[{ required: signupItem.required, message: t('signup.Please select your country/region!') }]"
                class="signup-country-region"
              >
                <RegionSelect v-model:value="formState.country_region" />
              </a-form-item>

              <!-- Email -->
              <template v-else-if="signupItem.name === 'Email'">
                <SignupEmailItem
                  :signup-item="signupItem"
                  :application="application"
                  :invitation="invitation"
                  v-model:email="formState.email"
                  v-model:emailCode="formState.emailCode"
                  v-model:validEmail="validEmail"
                />
              </template>

              <!-- Phone -->
              <template v-else-if="signupItem.name === 'Phone'">
                <SignupPhoneItem
                  :signup-item="signupItem"
                  :application="application"
                  :invitation="invitation"
                  v-model:phone="formState.phone"
                  v-model:phoneCode="formState.phoneCode"
                  v-model:countryCode="formState.countryCode"
                  v-model:validPhone="validPhone"
                />
              </template>

              <!-- Email or Phone / Phone or Email -->
              <template v-else-if="signupItem.name === 'Email or Phone' || signupItem.name === 'Phone or Email'">
                <a-row style="margin-top: 30px; margin-bottom: 20px">
                  <a-radio-group
                    v-model:value="emailOrPhoneMode"
                    button-style="solid"
                    style="width: 400px"
                  >
                    <template v-if="signupItem.name === 'Email or Phone'">
                      <a-radio-button value="Email">{{ t('general.Email') }}</a-radio-button>
                      <a-radio-button value="Phone">{{ t('general.Phone') }}</a-radio-button>
                    </template>
                    <template v-else>
                      <a-radio-button value="Phone">{{ t('general.Phone') }}</a-radio-button>
                      <a-radio-button value="Email">{{ t('general.Email') }}</a-radio-button>
                    </template>
                  </a-radio-group>
                </a-row>
                <SignupEmailItem
                  v-if="currentEmailOrPhoneMode(signupItem) === 'Email'"
                  :signup-item="signupItem"
                  :application="application"
                  :invitation="invitation"
                  v-model:email="formState.email"
                  v-model:emailCode="formState.emailCode"
                  v-model:validEmail="validEmail"
                />
                <SignupPhoneItem
                  v-else
                  :signup-item="signupItem"
                  :application="application"
                  :invitation="invitation"
                  v-model:phone="formState.phone"
                  v-model:phoneCode="formState.phoneCode"
                  v-model:countryCode="formState.countryCode"
                  v-model:validPhone="validPhone"
                />
              </template>

              <!-- Password -->
              <a-popover
                v-else-if="signupItem.name === 'Password'"
                placement="top"
                :open="passwordPopoverOpen"
              >
                <template #content>
                  <div v-for="(item, i) in passwordCheckItems" :key="i">
                    <span :style="{ color: item.passed ? 'green' : 'red' }">
                      {{ item.passed ? '✓' : '✗' }} {{ item.description }}
                    </span>
                  </div>
                </template>
                <a-form-item
                  name="password"
                  :label="signupItem.label || t('general.Password')"
                  :rules="passwordRules"
                  has-feedback
                  class="signup-password"
                >
                  <a-input-password
                    v-model:value="formState.password"
                    :placeholder="signupItem.placeholder"
                    @focus="onPasswordFocus"
                    @blur="passwordPopoverOpen = false"
                  />
                </a-form-item>
              </a-popover>

              <!-- Confirm password -->
              <a-form-item
                v-else-if="signupItem.name === 'Confirm password'"
                name="confirm"
                :label="signupItem.label || t('general.Confirm')"
                :rules="confirmPasswordRules"
                has-feedback
                class="signup-confirm"
              >
                <a-input-password
                  v-model:value="formState.confirm"
                  :placeholder="signupItem.placeholder"
                />
              </a-form-item>

              <!-- Invitation code -->
              <a-form-item
                v-else-if="signupItem.name === 'Invitation code'"
                name="invitationCode"
                :label="signupItem.label || t('application.Invitation code')"
                :rules="[{ required: signupItem.required, message: t('signup.Please input your invitation code!') }]"
                class="signup-invitation-code"
              >
                <a-input
                  v-model:value="formState.invitationCode"
                  :placeholder="signupItem.placeholder"
                  :disabled="invitation != null && invitationCode !== ''"
                />
              </a-form-item>

              <!-- Agreement -->
              <a-form-item
                v-else-if="signupItem.name === 'Agreement'"
                name="agreement"
                :wrapper-col="isMobile ? undefined : { span: 16, offset: 8 }"
                :rules="[{ validator: agreementValidator }]"
              >
                <a-checkbox v-model:checked="formState.agreement">
                  {{ t('signup.Accept') }}&nbsp;
                  <a @click.prevent="openTerms">{{ t('signup.Terms of Use') }}</a>
                </a-checkbox>
              </a-form-item>

              <!-- Text items -->
              <div
                v-else-if="signupItem.name.startsWith('Text ')"
                v-html="sanitizeHtml(signupItem.label)"
              />

              <!-- Signup button -->
              <a-form-item
                v-else-if="signupItem.name === 'Signup button'"
                :wrapper-col="isMobile ? undefined : { span: 16, offset: 8 }"
              >
                <a-button type="primary" html-type="submit" class="signup-button" block>
                  {{ t('account.Sign Up') }}
                </a-button>
                &nbsp;&nbsp;{{ t('signup.Have account?') }}&nbsp;
                <a class="signup-link" @click="goToSignIn">{{ t('signup.sign in now') }}</a>
              </a-form-item>

              <!-- Providers -->
              <template v-else-if="signupItem.name === 'Providers'">
                <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center">
                  <ProviderButton
                    v-for="providerItem in visibleProviders"
                    :key="providerItem.name"
                    :provider-item="providerItem"
                    :application="application"
                    :size="getProviderSize(signupItem)"
                    @click="onProviderClick($event, signupItem)"
                  />
                </div>
              </template>

              <!-- Custom form items (Gender, Bio, Tag, Education) -->
              <template v-else-if="isCustomFormItem(signupItem)">
                <a-form-item
                  v-if="!signupItem.type || signupItem.type === 'Input'"
                  :name="signupItem.name.toLowerCase()"
                  :label="signupItem.label || signupItem.name"
                  :rules="getCustomItemRules(signupItem)"
                >
                  <a-input :placeholder="signupItem.placeholder" />
                </a-form-item>
                <a-form-item
                  v-else-if="signupItem.type === 'Single Choice' || signupItem.type === 'Multiple Choices'"
                  :name="signupItem.name.toLowerCase()"
                  :label="signupItem.label || signupItem.name"
                  :rules="[{ required: signupItem.required, message: t('signup.Please input your {label}!').replace('{label}', signupItem.label || signupItem.name) }]"
                >
                  <a-select
                    :mode="signupItem.type === 'Multiple Choices' ? 'multiple' : undefined"
                    :placeholder="signupItem.placeholder"
                    :show-search="false"
                    :options="(signupItem.options || []).map((o: string) => ({ label: o, value: o }))"
                  />
                </a-form-item>
              </template>
            </template>
          </a-form>
        </div>
      </div>
    </div>

    <!-- Agreement modal -->
    <AgreementModal
      :visible="isTermsOfUseVisible"
      :content="termsOfUseContent"
      @accept="isTermsOfUseVisible = false; formState.agreement = true"
      @cancel="isTermsOfUseVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h, reactive, resolveComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import DOMPurify from "dompurify";
import { useSignup } from "../../composables/useSignup";
import * as Setting from "../../utils/Setting";
import * as PasswordChecker from "../../utils/PasswordChecker";
import CustomHelmet from "../../components/CustomHelmet.vue";
import LanguageSelect from "../../components/LanguageSelect.vue";
import ProviderButton from "../../components/ProviderButton.vue";
import RegionSelect from "../../components/RegionSelect.vue";
import AgreementModal from "../../components/AgreementModal.vue";
import SendCodeInput from "../../components/SendCodeInput.vue";
import CountryCodeSelect from "../../components/CountryCodeSelect.vue";
import type { Application } from "../../api/types";

/* ───────── Sub-components for Email/Phone (internal) ───────── */

const SignupEmailItem = {
  name: "SignupEmailItem",
  props: {
    signupItem: { type: Object, required: true },
    application: { type: Object, default: null },
    invitation: { type: Object, default: null },
    email: { type: String, default: "" },
    emailCode: { type: String, default: "" },
    validEmail: { type: Boolean, default: false },
  },
  emits: ["update:email", "update:emailCode", "update:validEmail"],
  setup(props: any, { emit }: any) {
    const { t } = useI18n();
    const localEmail = computed({
      get: () => props.email,
      set: (v: string) => emit("update:email", v),
    });
    const localCode = computed({
      get: () => props.emailCode,
      set: (v: string) => emit("update:emailCode", v),
    });

    function emailValidator(_: any, value: string) {
      if (props.email !== "" && !Setting.isValidEmail(props.email)) {
        emit("update:validEmail", false);
        return Promise.reject(t("login.The input is not valid Email!"));
      }
      if (props.signupItem.regex) {
        const reg = new RegExp(props.signupItem.regex);
        if (!reg.test(props.email)) {
          emit("update:validEmail", false);
          return Promise.reject(t("signup.The input Email doesn't match the signup item regex!"));
        }
      }
      emit("update:validEmail", true);
      return Promise.resolve();
    }

    return () => {
      const items = [];
      items.push(
        h("div", { class: "signup-email" }, [
          // Use a-form-item for email input
          h(
            resolveComponent("a-form-item"),
            {
              name: "email",
              label: props.signupItem.label || t("general.Email"),
              rules: [
                { required: props.signupItem.required, message: t("login.Please input your Email!") },
                { validator: emailValidator },
              ],
            },
            {
              default: () =>
                h(resolveComponent("a-input"), {
                  value: localEmail.value,
                  "onUpdate:value": (v: string) => { localEmail.value = v; },
                  placeholder: props.signupItem.placeholder,
                  disabled: props.invitation?.email != null && props.invitation.email !== "",
                }),
            }
          ),
        ])
      );

      if (props.signupItem.rule !== "No verification") {
        items.push(
          h(
            resolveComponent("a-form-item"),
            {
              name: "emailCode",
              label: props.signupItem.label || t("code.Email code"),
              rules: [{ required: props.signupItem.required, message: t("code.Please input your verification code!") }],
            },
            {
              default: () =>
                h(SendCodeInput, {
                  modelValue: localCode.value,
                  "onUpdate:modelValue": (v: string) => { localCode.value = v; },
                  disabled: !props.validEmail,
                  method: "signup",
                  onButtonClickArgs: { dest: props.email, type: "email", applicationId: Setting.getApplicationName(props.application) },
                  application: props.application,
                }),
            }
          )
        );
      }
      return h("div", items);
    };
  },
};

const SignupPhoneItem = {
  name: "SignupPhoneItem",
  props: {
    signupItem: { type: Object, required: true },
    application: { type: Object, default: null },
    invitation: { type: Object, default: null },
    phone: { type: String, default: "" },
    phoneCode: { type: String, default: "" },
    countryCode: { type: String, default: "" },
    validPhone: { type: Boolean, default: false },
  },
  emits: ["update:phone", "update:phoneCode", "update:countryCode", "update:validPhone"],
  setup(props: any, { emit }: any) {
    const { t } = useI18n();
    const localPhone = computed({
      get: () => props.phone,
      set: (v: string) => emit("update:phone", v),
    });
    const localPhoneCode = computed({
      get: () => props.phoneCode,
      set: (v: string) => emit("update:phoneCode", v),
    });
    const localCountryCode = computed({
      get: () => props.countryCode,
      set: (v: string) => emit("update:countryCode", v),
    });

    function phoneValidator(_: any, value: string) {
      if (!props.signupItem.required && !value) return Promise.resolve();
      if (value && !Setting.isValidPhone(value, props.countryCode)) {
        emit("update:validPhone", false);
        return Promise.reject(t("signup.The input is not valid Phone!"));
      }
      emit("update:validPhone", true);
      return Promise.resolve();
    }

    return () => {
      const items = [];

      // Phone number with country code
      items.push(
        h(
          resolveComponent("a-form-item"),
          {
            label: props.signupItem.label || t("general.Phone"),
            required: props.signupItem.required,
            class: "signup-phone",
          },
          {
            default: () =>
              h(resolveComponent("a-input-group"), { compact: true }, {
                default: () => [
                  h(CountryCodeSelect, {
                    value: localCountryCode.value,
                    "onUpdate:value": (v: string) => { localCountryCode.value = v; },
                    countryCodes: props.application?.organizationObj?.countryCodes,
                    style: { width: "35%" },
                  }),
                  h(
                    resolveComponent("a-form-item"),
                    {
                      name: "phone",
                      noStyle: true,
                      rules: [
                        { required: props.signupItem.required, message: t("signup.Please input your phone number!") },
                        { validator: phoneValidator },
                      ],
                    },
                    {
                      default: () =>
                        h(resolveComponent("a-input"), {
                          value: localPhone.value,
                          "onUpdate:value": (v: string) => { localPhone.value = v; },
                          placeholder: props.signupItem.placeholder,
                          style: { width: "65%" },
                          disabled: props.invitation?.phone != null && props.invitation.phone !== "",
                        }),
                    }
                  ),
                ],
              }),
          }
        )
      );

      // Phone code
      if (props.signupItem.rule !== "No verification") {
        items.push(
          h(
            resolveComponent("a-form-item"),
            {
              name: "phoneCode",
              label: props.signupItem.label || t("code.Phone code"),
              rules: [{ required: props.signupItem.required, message: t("code.Please input your phone verification code!") }],
              class: "phone-code",
            },
            {
              default: () =>
                h(SendCodeInput, {
                  modelValue: localPhoneCode.value,
                  "onUpdate:modelValue": (v: string) => { localPhoneCode.value = v; },
                  disabled: !props.validPhone,
                  method: "signup",
                  onButtonClickArgs: { dest: props.phone, type: "phone", applicationId: Setting.getApplicationName(props.application) },
                  application: props.application,
                  countryCode: props.countryCode,
                }),
            }
          )
        );
      }

      return h("div", items);
    };
  },
};

/* ───────── Main component ───────── */

const { t } = useI18n();
const router = useRouter();

const {
  application,
  applicationObj,
  email,
  phone,
  emailOrPhoneMode,
  validEmail,
  validPhone,
  isTermsOfUseVisible,
  termsOfUseContent,
  invitationCode,
  invitation,
  displayNameRule,
  passwordPopoverOpen,
  init,
  onFinish,
  parseOffset,
  getVisibleProviders,
} = useSignup();

const formRef = ref();
const isMobile = computed(() => Setting.isMobile());
const isDark = computed(() => Setting.isDarkTheme());

const platformBrandMarkSrc = computed(() =>
  isDark.value ? "/img/kaixuan-platform-logo-dark.svg" : "/img/kaixuan-platform-logo-light.svg"
);

const formState = reactive<Record<string, any>>({
  application: "",
  organization: "",
  signupOrganizationId: "",
  username: "",
  name: "",
  firstName: "",
  lastName: "",
  affiliation: "",
  idCard: "",
  country_region: "",
  email: "",
  emailCode: "",
  phone: "",
  phoneCode: "",
  countryCode: "",
  password: "",
  confirm: "",
  invitationCode: "",
  agreement: false,
});

/* ───────── Computed ───────── */
const visibleSignupItems = computed(() => {
  const source = application.value?.signupItems?.filter((i: any) => i.visible) ?? [];
  const deduped = source.filter((item: any, index: number, arr: any[]) => arr.findIndex((i: any) => i.name === item.name) === index);
  const items = !enforceBrandStyle.value
    ? deduped
    : deduped.filter((item: any) => {
      const keep = new Set([
        "Username",
        "Display name",
        "Email",
        "Phone",
        "Email or Phone",
        "Phone or Email",
        "Password",
        "Confirm password",
        "Agreement",
        "Signup button",
      ]);
      return keep.has(item.name);
    });
  // Ensure Signup button exists
  const hasButton = items.some((i: any) => i.name === "Signup button");
  if (!hasButton) {
    items.push({
      customCss: "",
      label: "",
      name: "Signup button",
      placeholder: "",
      visible: true,
      required: false,
      prompted: false,
      type: "",
      rule: "",
      regex: "",
      options: [] as string[],
    });
  }
  return items;
});

const visibleProviders = computed(() => getVisibleProviders());
const brandProductName = computed(() => {
  return application.value?.displayName || application.value?.name || "Auth";
});
const brandLogoUrl = computed(() =>
  isDark.value ? "/img/kx-brand-mark-on-dark.svg" : "/img/kx-brand-mark.svg",
);
const enforceBrandStyle = computed(() => true);
const allowCustomSignupHtml = computed(() => !enforceBrandStyle.value);
const allowCustomSideHtml = computed(() => !enforceBrandStyle.value);

const signupHtmlSafe = computed(() => {
  if (!application.value?.signupHtml) return "";
  return sanitizeHtml(application.value.signupHtml);
});

const sideHtmlSafe = computed(() => {
  if (!application.value?.formSideHtml) return "";
  return sanitizeHtml(application.value.formSideHtml);
});

const contentMargin = computed(() => {
  if (!isMobile.value && (application.value?.formOffset === 1 || application.value?.formOffset === 2)) {
    return "0 auto";
  }
  return parseOffset(application.value?.formOffset);
});

const sourceAppName = computed(() => {
  const app = application.value;
  if (!app) return "来源应用";
  return app.displayName || app.name || "来源应用";
});

const sourceAppLogo = computed(() => {
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

const customCssComponent = computed(() => {
  if (enforceBrandStyle.value) return null;
  if (!application.value) return null;
  const parts: string[] = [];
  if (!Setting.inIframe() && !Setting.isMobile() && application.value.formCss) {
    const safe = sanitizeCss(application.value.formCss);
    if (safe) parts.push(safe);
  }
  if (!Setting.inIframe() && Setting.isMobile() && application.value.formCssMobile) {
    const safe = sanitizeCss(application.value.formCssMobile);
    if (safe) parts.push(safe);
  }
  if (parts.length === 0) return null;
  return h("style", parts.join("\n"));
});

const passwordOptions = computed(() =>
  application.value?.organizationObj?.passwordOptions ?? []
);

const passwordRules = computed(() => [
  {
    required: true,
    validator: (_rule: any, value: string) => {
      const errorMsg = PasswordChecker.checkPasswordComplexity(
        value,
        passwordOptions.value,
        t
      );
      if (errorMsg === "") return Promise.resolve();
      return Promise.reject(errorMsg);
    },
  },
]);

const passwordCheckItems = computed(() =>
  PasswordChecker.getPasswordCheckItems(
    passwordOptions.value,
    formState.password,
    t
  )
);

const confirmPasswordRules = computed(() => [
  {
    required: true,
    message: t("signup.Please confirm your password!"),
  },
  {
    validator: (_rule: any, value: string) => {
      if (!value || formState.password === value) return Promise.resolve();
      return Promise.reject(
        t("signup.Your confirmed password is inconsistent with the password!")
      );
    },
  },
]);

/* ───────── Methods ───────── */

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

function sanitizeCss(css: string): string {
  const blocklist = [/expression\s*\(/gi, /javascript\s*:/gi, /url\s*\(/gi, /@import/gi];
  let result = css;
  for (const pattern of blocklist) {
    result = result.replace(pattern, "");
  }
  return result;
}

function getItemCssComponent(signupItem: any, idx: number) {
  if (enforceBrandStyle.value) return null;
  if (!signupItem?.customCss) return null;
  const safe = sanitizeCss(signupItem.customCss);
  if (!safe) return null;
  return h("style", { key: `signup_${idx}_style` }, safe);
}

function getLanguage() {
  return Setting.getLanguage();
}

function getUsernameRules(item: any) {
  const rules: any[] = [
    {
      required: item.required,
      message: t("forget.Please input your username!"),
      whitespace: true,
    },
  ];
  if (item.regex) {
    rules.push({
      pattern: new RegExp(item.regex),
      message: t("signup.The input doesn't match the signup item regex!"),
    });
  }
  return rules;
}

function getNameRules(item: any, requiredMsg: string) {
  const rules: any[] = [
    { required: item.required, message: requiredMsg, whitespace: true },
  ];
  if (item.regex) {
    rules.push({
      pattern: new RegExp(item.regex),
      message: t("signup.The input doesn't match the signup item regex!"),
    });
  }
  return rules;
}

function idCardRules(item: any) {
  return [
    {
      required: item.required,
      message: t("signup.Please input your ID card number!"),
      whitespace: true,
    },
    {
      required: item.required,
      pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9X]$/,
      message: t("signup.Please input the correct ID card number!"),
    },
  ];
}

function getCustomItemRules(item: any) {
  const rules: any[] = [
    {
      required: item.required,
      message: t("signup.Please input your {label}!").replace(
        "{label}",
        item.label || item.name
      ),
    },
  ];
  if (item.regex) {
    rules.push({
      pattern: new RegExp(item.regex),
      message: t("signup.The input doesn't match the signup item regex!"),
    });
  }
  return rules;
}

function isCustomFormItem(item: any): boolean {
  return ["Gender", "Bio", "Tag", "Education"].includes(item.name);
}

function currentEmailOrPhoneMode(item: any): string {
  if (emailOrPhoneMode.value !== "") return emailOrPhoneMode.value;
  return item.name === "Email or Phone" ? "Email" : "Phone";
}

function getProviderSize(item: any): string {
  const app = applicationObj.value;
  if (!app) return "small";
  if (item.rule === "None" || item.rule === "") {
    const showForm =
      Setting.isPasswordEnabled(app) ||
      Setting.isCodeSigninEnabled(app) ||
      Setting.isWebAuthnEnabled(app) ||
      Setting.isLdapEnabled(app);
    return showForm ? "small" : "big";
  }
  return item.rule;
}

function onProviderClick(e: Event, signupItem: any) {
  if (formState.agreement === false && visibleSignupItems.value.some((i: any) => i.name === "Agreement")) {
    e.preventDefault();
    Setting.showMessage("error", t("signup.Please accept the agreement!"));
  }
}

function agreementValidator(_rule: any, value: any) {
  if (value) return Promise.resolve();
  return Promise.reject(t('signup.Please accept the agreement!'));
}

function openTerms() {
  if (application.value?.termsOfUse) {
    termsOfUseContent.value = application.value.termsOfUse;
    isTermsOfUseVisible.value = true;
  }
}

function goToLogin() {
  Setting.redirectToLoginPage(application.value, router);
}

function goToSignIn() {
  const linkInStorage = sessionStorage.getItem("signinUrl");
  if (linkInStorage) {
    Setting.goToLinkSoft(router, linkInStorage);
  } else {
    Setting.redirectToLoginPage(application.value, router);
  }
}

function handleFinish(values: Record<string, any>) {
  const hasAgreementItem = visibleSignupItems.value.some((i: any) => i.name === "Agreement" && i.visible);
  if (hasAgreementItem && !formState.agreement) {
    Setting.showMessage("warning", t("signup.Please accept the agreement!"));
    return;
  }
  onFinish({ ...formState, ...values });
}

function handleFinishFailed(errorInfo: any) {
  formRef.value?.scrollToField(errorInfo.errorFields?.[0]?.name);
}

function onPasswordFocus() {
  if (passwordOptions.value.length > 0) {
    passwordPopoverOpen.value = true;
  }
}

/* ───────── Lifecycle ───────── */
onMounted(() => {
  init();

  // Set initial form state from application once loaded
  const unwatch = computed(() => application.value);
  if (application.value) {
    formState.application = application.value.name;
    formState.organization = application.value.organization;
    formState.countryCode =
      application.value.organizationObj?.countryCodes?.[0] ?? "";
  }

  // Check display name rule
  const dnItem = application.value?.signupItems?.find(
    (i: any) => i.name === "Display name"
  );
  if (dnItem) {
    displayNameRule.value = dnItem.rule || "";
  }

  // Fill invitation data
  if (invitation.value) {
    if (invitation.value.username) formState.username = invitation.value.username;
    if (invitation.value.email) formState.email = invitation.value.email;
    if (invitation.value.phone) formState.phone = invitation.value.phone;
  }
  if (invitationCode.value) {
    formState.invitationCode = invitationCode.value;
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

.login-panel-dark:not(.login-panel-split) {
  background: linear-gradient(180deg, rgba(19, 26, 44, 0.94) 0%, rgba(13, 20, 36, 0.94) 100%);
  border-color: rgba(109, 146, 226, 0.36);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
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
  padding: 0;
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
  flex: 0 0 360px;
  min-height: 400px;
  overflow: hidden;
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
  position: relative;
  min-width: 360px;
  max-width: 460px;
  padding: 40px;
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

.login-panel-dark .login-form {
  background: #111827;
}

.brand-header--duplicate,
.brand-helper-text--duplicate {
  display: none !important;
}

.login-form :deep(.ant-form-item) {
  margin-bottom: 14px;
}

.login-form :deep(.ant-form) {
  width: min(460px, 100%);
  margin: 0 auto;
}

.login-form :deep(.ant-input),
.login-form :deep(.ant-input-password),
.login-form :deep(.ant-input-affix-wrapper),
.login-form :deep(.ant-input-group-addon),
.login-form :deep(.ant-select-selector) {
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
.login-panel-dark .login-form :deep(.ant-input-group-addon),
.login-panel-dark .login-form :deep(.ant-select-selector) {
  background: #0c1424 !important;
  border-color: #334155 !important;
  color: #e5e7eb !important;
}

.login-form :deep(.ant-btn-primary),
.signup-button {
  width: 100%;
  height: 48px !important;
  font-weight: 600 !important;
  border: none !important;
  border-radius: 10px !important;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8) !important;
  box-shadow: 0 10px 26px rgba(37, 99, 235, 0.38);
}

.login-form :deep(.ant-btn-primary:hover),
.signup-button:hover {
  background: linear-gradient(90deg, #60a5fa, #1e40af) !important;
}

.login-form :deep(a),
.login-form :deep(.ant-btn-link) {
  color: #2563eb !important;
}

.signup-language-select {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

@media (min-width: 769px) {
  .signup-language-select {
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
  margin-bottom: 12px;
  font-size: 13px;
  color: #6a7ca5;
}

.auth-shell {
  position: relative;
  overflow: hidden;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
}

.auth-shell-light {
  background:
    radial-gradient(circle at 18% 12%, rgba(59, 130, 246, 0.18), transparent 40%),
    radial-gradient(circle at 84% 88%, rgba(29, 78, 216, 0.16), transparent 44%),
    linear-gradient(180deg, #071425 0%, #0b1f3c 52%, #0e2748 100%);
}

.auth-shell-dark {
  background:
    radial-gradient(circle at 18% 10%, rgba(59, 130, 246, 0.14), transparent 38%),
    radial-gradient(circle at 84% 88%, rgba(30, 64, 175, 0.12), transparent 42%),
    linear-gradient(180deg, #0b0f18 0%, #0b1220 45%, #0a1322 100%);
}

.auth-shell::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: linear-gradient(rgba(168, 190, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(168, 190, 255, 0.08) 1px, transparent 1px);
  background-size: 32px 32px;
}

.auth-shell-dark::before {
  background-image: linear-gradient(rgba(168, 190, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(168, 190, 255, 0.06) 1px, transparent 1px);
}

.login-panel-dark .brand-subtitle,
.login-panel-dark .brand-helper-text {
  color: #9aa7c7;
}

@media (max-width: 768px) {
  .login-panel {
    flex-direction: column;
  }

  .login-panel:not(.login-panel-split),
  .login-panel-dark:not(.login-panel-split) {
    flex-direction: column;
    padding: 18px 12px;
    border-radius: 12px;
    width: 100%;
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
    box-shadow: 0 -12px 40px rgba(15, 23, 42, 0.06);
    display: block;
  }

  .login-panel-dark .login-form {
    box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.35);
  }

  .side-image {
    display: none;
  }
  .login-form {
    min-width: unset;
    max-width: unset;
    padding: 24px 16px;
  }
  .source-app-brand-name {
    font-size: 30px;
  }
}
</style>
