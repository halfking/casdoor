<template>
  <div v-if="!application" />
  <div v-else class="forget-content" :style="{ padding: isMobile() ? '0' : undefined, boxShadow: isMobile() ? 'none' : undefined }">
    <a-button
      type="text"
      size="large"
      :style="{ position: 'relative', left: isMobile() ? '10px' : '-90px', top: 0 }"
      @click="stepBack"
    >
      <template #icon><ArrowLeftOutlined style="font-size: 24px" /></template>
    </a-button>

    <a-row>
      <a-col :span="24" style="justify-content: center">
        <a-row>
          <a-col :span="24">
            <div style="margin-top: 80px; margin-bottom: 10px; text-align: center">
              <CustomHelmet :application="application" />
              <AppLogo :application="application" />
            </div>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <div style="text-align: center; font-size: 28px">{{ t("forget:Reset password") }}</div>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-steps
              :current="current"
              :items="stepsItems"
              :style="{ width: '90%', maxWidth: '500px', margin: 'auto', marginTop: '80px' }"
            />
          </a-col>
        </a-row>
      </a-col>
      <a-col :span="24" style="display: flex; justify-content: center">
        <div style="margin-top: 40px; text-align: center">
          <!-- Step 1: username -->
          <a-form
            v-if="current === 0"
            ref="step1Ref"
            name="step1"
            :model="step1Form"
            style="width: 300px"
            size="large"
            @finish="onStep1Finish"
          >
            <a-form-item name="username" :rules="[{ required: true, message: t('forget:Please input your username!'), whitespace: true }]">
              <a-input v-model:value="step1Form.username" :placeholder="t('login:username, Email or phone')">
                <template #prefix><UserOutlined /></template>
              </a-input>
            </a-form-item>
            <br />
            <a-form-item>
              <a-button block type="primary" html-type="submit">{{ t("forget:Next Step") }}</a-button>
            </a-form-item>
          </a-form>

          <!-- Step 2: verify email/phone -->
          <a-form
            v-if="current === 1"
            ref="step2Ref"
            name="step2"
            :model="step2Form"
            style="width: 300px"
            size="large"
            @finish="onStep2Finish"
            @values-change="onStep2ValuesChange"
          >
            <a-form-item name="dest">
              <a-select
                v-model:value="step2Form.dest"
                :virtual="false"
                :disabled="isVerifyTypeFixed"
                style="text-align: left"
                :placeholder="t('forget:Choose email or phone')"
              >
                <a-select-option v-if="phone" :value="phone">&nbsp;&nbsp;{{ phone }}</a-select-option>
                <a-select-option v-if="email" :value="email">&nbsp;&nbsp;{{ email }}</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item name="code" :rules="[{ required: true, message: t('code:Please input your verification code!') }]">
              <SendCodeInput
                v-model="step2Form.code"
                :disabled="!step2Form.dest"
                method="forget"
                :on-button-click-args="{
                  dest: step2Form.dest,
                  type: verifyType,
                  applicationId: getApplicationName(application),
                  checkUser: userName,
                }"
                :application="application"
              />
            </a-form-item>
            <br />
            <a-form-item>
              <a-button block type="primary" html-type="submit">{{ t("forget:Next Step") }}</a-button>
            </a-form-item>
          </a-form>

          <!-- Step 3: new password -->
          <a-form
            v-if="current === 2"
            ref="step3Ref"
            name="step3"
            :model="step3Form"
            style="width: 300px"
            size="large"
            @finish="onStep3Finish"
          >
            <a-popover
              :placement="windowWidth >= 960 ? 'right' : 'top'"
              :open="passwordPopoverOpen"
            >
              <template #content>
                <div v-for="item in passwordCheckItems" :key="item.option" style="margin: 4px 0">
                  <CheckCircleTwoTone v-if="item.passed" two-tone-color="#52c41a" />
                  <CloseCircleTwoTone v-else two-tone-color="#eb2f96" />
                  <span style="margin-left: 8px">{{ item.description }}</span>
                </div>
              </template>
              <a-form-item
                name="newPassword"
                has-feedback
                :rules="[{ required: true, validator: validatePassword }]"
              >
                <a-input-password
                  v-model:value="step3Form.newPassword"
                  :placeholder="t('general:Password')"
                  @focus="onPasswordFocus"
                  @blur="passwordPopoverOpen = false"
                >
                  <template #prefix><LockOutlined /></template>
                </a-input-password>
              </a-form-item>
            </a-popover>
            <a-form-item
              name="confirm"
              has-feedback
              :rules="[
                { required: true, message: t('signup:Please confirm your password!') },
                { validator: validateConfirm },
              ]"
            >
              <a-input-password v-model:value="step3Form.confirm" :placeholder="t('general:Confirm')">
                <template #prefix><CheckCircleOutlined /></template>
              </a-input-password>
            </a-form-item>
            <br />
            <a-form-item>
              <a-button block type="primary" html-type="submit">{{ t("forget:Change Password") }}</a-button>
            </a-form-item>
          </a-form>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  KeyOutlined,
  LockOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons-vue";
import { getApplication } from "@/api/modules/application";
import { getEmailAndPhone } from "@/api/modules/auth";
import { verifyCode, setPassword } from "@/api/modules/user";
import { showMessage, isMobile, getLoginLink, redirectToLoginPage, getApplicationName, goToLinkSoft } from "@/utils/Setting";
import { checkPasswordComplexity, getPasswordCheckItems } from "@/utils/PasswordChecker";
import { encryptByPasswordObfuscator } from "@/utils/Obfuscator";
import CustomHelmet from "@/components/CustomHelmet.vue";
import AppLogo from "@/components/AppLogo.vue";
import SendCodeInput from "@/components/SendCodeInput.vue";
import type { Application } from "@/api/types";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const props = defineProps<{
  application?: Application;
  account?: { name: string };
  applicationName?: string;
}>();

const emit = defineEmits<{ updateApplication: [app: Application] }>();

/* ───────── state ───────── */
const application = ref<Application | undefined>(props.application);
const appName = computed(() => props.applicationName ?? (route.params.applicationName as string));

const current = ref(route.query.code ? 2 : 0);
const userName = ref(props.account?.name ?? (route.query.username as string) ?? "");
const phone = ref("");
const email = ref("");
const dest = ref("");
const verifyType = ref(""); // "email" | "phone"
const isVerifyTypeFixed = ref(false);
const code = ref((route.query.code as string) ?? "");
const windowWidth = ref(window.innerWidth);

const step1Form = ref({ username: userName.value });
const step2Form = ref({ dest: "", code: "" });
const step3Form = ref({ newPassword: "", confirm: "" });

const passwordPopoverOpen = ref(false);

const passwordOptions = computed<string[]>(() => (application.value as any)?.organizationObj?.passwordOptions ?? []);

const passwordCheckItems = computed(() =>
  getPasswordCheckItems(passwordOptions.value, step3Form.value.newPassword, t)
);

const stepsItems = computed(() => [
  { title: t("forget:Account"), icon: h(UserOutlined) },
  { title: t("forget:Verify"), icon: h(SolutionOutlined) },
  { title: t("forget:Reset"), icon: h(KeyOutlined) },
]);

/* ───────── lifecycle ───────── */
onMounted(async () => {
  if (!application.value && appName.value) {
    try {
      const res = await getApplication("admin", appName.value);
      if (res.status === "error") {
        showMessage("error", res.msg);
        return;
      }
      application.value = res.data;
      emit("updateApplication", res.data);
    } catch (e: any) {
      showMessage("error", e.message ?? "Failed to load application");
    }
  }
});

/* ───────── step handlers ───────── */
async function onStep1Finish() {
  const org = application.value?.organization ?? "";
  const username = step1Form.value.username;
  try {
    const res = await getEmailAndPhone(org, username);
    if (res.status !== "ok") {
      showMessage("error", res.msg);
      return;
    }
    const resData = res.data as any;
    const p = resData.phone ?? "";
    const e = resData.email ?? "";
    if (!p && !e) {
      showMessage("error", t("general:No verification method"));
      return;
    }
    userName.value = resData.name;
    phone.value = p;
    email.value = e;

    const saveFields = (type: string, d: string, fixed: boolean) => {
      verifyType.value = type;
      isVerifyTypeFixed.value = fixed;
      dest.value = d;
      step2Form.value.dest = d;
    };

    switch (res.data2) {
      case "email":
        saveFields("email", e, true);
        break;
      case "phone":
        saveFields("phone", p, true);
        break;
      default: // "username"
        p ? saveFields("phone", p, false) : saveFields("email", e, false);
    }
    current.value = 1;
  } catch (err: any) {
    showMessage("error", err.message ?? "Request failed");
  }
}

function onStep2ValuesChange(changed: Record<string, any>) {
  if (changed.dest) {
    dest.value = changed.dest;
    verifyType.value = changed.dest.includes("@") ? "email" : "phone";
  }
}

async function onStep2Finish() {
  try {
    const res = await verifyCode({
      application: application.value?.name ?? "",
      organization: application.value?.organization ?? "",
      username: step2Form.value.dest,
      name: userName.value,
      code: step2Form.value.code,
      type: "login",
    });
    if (res.status === "ok") {
      code.value = step2Form.value.code;
      current.value = 2;
    } else {
      showMessage("error", res.msg);
    }
  } catch (err: any) {
    showMessage("error", err.message ?? "Verification failed");
  }
}

async function onStep3Finish() {
  const orgObj = (application.value as any)?.organizationObj;
  const userOwner = orgObj?.name ?? "";

  // If coming from a direct link with code in query, verify it first
  if (route.query.code) {
    try {
      const res = await verifyCode({
        application: application.value?.name ?? "",
        organization: userOwner,
        username: (route.query.dest as string) ?? "",
        name: userName.value,
        code: code.value,
        type: "login",
      });
      if (res.status !== "ok") {
        showMessage("error", res.msg);
        return;
      }
    } catch (err: any) {
      showMessage("error", err.message ?? "Verification failed");
      return;
    }
  }

  let encryptedNewPassword = step3Form.value.newPassword;
  if (orgObj?.passwordObfuscatorType && orgObj.passwordObfuscatorType !== "Plain") {
    const [cipher, errorMsg] = encryptByPasswordObfuscator(
      orgObj.passwordObfuscatorType,
      orgObj.passwordObfuscatorKey,
      step3Form.value.newPassword
    );
    if (errorMsg) {
      showMessage("error", errorMsg);
      return;
    }
    encryptedNewPassword = cipher;
  }

  try {
    const res = await setPassword(userOwner, userName.value, "", encryptedNewPassword, code.value);
    if (res.status === "ok") {
      const linkInStorage = sessionStorage.getItem("signinUrl");
      if (linkInStorage) {
        goToLinkSoft(router, linkInStorage);
      } else {
        redirectToLoginPage(application.value ?? null, router);
      }
    } else {
      showMessage("error", res.msg);
    }
  } catch (err: any) {
    showMessage("error", err.message ?? "Failed to reset password");
  }
}

/* ───────── validators ───────── */
function validatePassword(_rule: any, value: string) {
  const errorMsg = checkPasswordComplexity(value, passwordOptions.value, t);
  return errorMsg === "" ? Promise.resolve() : Promise.reject(errorMsg);
}

function validateConfirm(_rule: any, value: string) {
  if (!value || step3Form.value.newPassword === value) return Promise.resolve();
  return Promise.reject(t("signup:Your confirmed password is inconsistent with the password!"));
}

function onPasswordFocus() {
  if (passwordOptions.value.length > 0) {
    passwordPopoverOpen.value = true;
  }
}

/* ───────── navigation ───────── */
function stepBack() {
  if (current.value > 0) {
    current.value--;
  } else if (window.history.length > 1) {
    router.back();
  } else {
    redirectToLoginPage(application.value ?? null, router);
  }
}
</script>
