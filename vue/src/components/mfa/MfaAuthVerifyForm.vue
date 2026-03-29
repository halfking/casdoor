<template>
  <div class="mfa-auth-form">
    <div class="title">{{ t("mfa:Multi-factor authentication") }}</div>

    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane v-for="item in tabs" :key="item.key" :tab="item.label" />
    </a-tabs>

    <a-alert v-if="errorMessage" :message="errorMessage" show-icon type="error" style="margin-bottom: 16px" />

    <MfaVerifySmsForm
      v-if="activeKey === 'sms' || activeKey === 'email'"
      :application-name="applicationName"
      :mfa-props="activeOption"
      mode="auth"
      @submit="verify"
    />

    <MfaVerifyTotpForm
      v-else-if="activeKey === 'app'"
      :mfa-props="activeOption"
      @submit="verify"
    />

    <MfaVerifyRadiusForm
      v-else-if="activeKey === 'radius'"
      :mfa-props="activeOption"
      mode="auth"
      @submit="verify"
    />

    <MfaVerifyPushForm
      v-else-if="activeKey === 'push'"
      :mfa-props="activeOption"
      mode="auth"
      @submit="verify"
    />

    <MfaVerifyPasswordForm
      v-else-if="activeKey === 'password'"
      @submit="({ password }) => verify({ passcode: password, enableMfaRemember: false })"
    />

    <a-form v-else layout="vertical" @finish="recover">
      <a-typography-paragraph type="secondary">
        {{ t("mfa:Multi-factor recover description") }}
      </a-typography-paragraph>

      <a-form-item
        name="recoveryCode"
        :rules="[{ required: true, message: t('mfa:Recovery code') }]"
      >
        <a-input v-model:value="recoveryCode" :placeholder="t('mfa:Recovery code')" size="large" />
      </a-form-item>

      <a-button :loading="loading" block html-type="submit" size="large" type="primary">
        {{ t("forget:Verify") }}
      </a-button>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import MfaVerifyPasswordForm from "@/components/mfa/MfaVerifyPasswordForm.vue";
import MfaVerifyPushForm from "@/components/mfa/MfaVerifyPushForm.vue";
import MfaVerifyRadiusForm from "@/components/mfa/MfaVerifyRadiusForm.vue";
import MfaVerifySmsForm from "@/components/mfa/MfaVerifySmsForm.vue";
import MfaVerifyTotpForm from "@/components/mfa/MfaVerifyTotpForm.vue";
import { login, loginCas } from "@/utils/auth-api";
import type { ApiResponse, MfaOption, OAuthGetParameters } from "@/utils/auth";

const props = defineProps<{
  formValues: Record<string, unknown>;
  authParams: Record<string, unknown> | OAuthGetParameters | null;
  mfaProps: MfaOption[];
  applicationName?: string;
}>();

const emit = defineEmits<{
  success: [ApiResponse];
  fail: [string];
}>();

const { t } = useI18n();

const knownLabels: Record<string, string> = {
  sms: t("mfa:Use SMS"),
  email: t("mfa:Use Email"),
  app: t("mfa:Use Authenticator App"),
  radius: t("mfa:Use Radius"),
  push: t("mfa:Use Push Notification"),
  password: t("general:Password"),
  recovery: t("mfa:Recovery code"),
};

const preferredKey = props.mfaProps.find((item) => item.isPreferred)?.mfaType ?? props.mfaProps[0]?.mfaType ?? "recovery";
const activeKey = ref(preferredKey);
const loading = ref(false);
const recoveryCode = ref("");
const errorMessage = ref("");

const tabs = computed(() => {
  const list = props.mfaProps.map((item) => ({
    key: item.mfaType,
    label: knownLabels[item.mfaType] ?? item.mfaType,
  }));
  list.push({key: "recovery", label: knownLabels.recovery});
  return list;
});

const activeOption = computed(() => props.mfaProps.find((item) => item.mfaType === activeKey.value) ?? props.mfaProps[0]);

async function submitPayload(payload: Record<string, unknown>) {
  loading.value = true;
  errorMessage.value = "";

  const body = {
    ...props.formValues,
    ...payload,
    mfaType: activeKey.value,
  };

  try {
    const response = body.type === "cas"
      ? await loginCas(body, {service: String((props.authParams as Record<string, unknown> | null)?.service ?? "")})
      : await login(body, props.authParams as OAuthGetParameters | null);

    if (response.status === "ok") {
      emit("success", response);
    } else {
      errorMessage.value = response.msg || t("general:Failed to verify");
      emit("fail", errorMessage.value);
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t("general:Failed to connect to server");
    emit("fail", errorMessage.value);
  } finally {
    loading.value = false;
  }
}

function verify(values: { passcode: string; enableMfaRemember: boolean; dest?: string; countryCode?: string }) {
  void submitPayload(values);
}

function recover() {
  void submitPayload({recoveryCode: recoveryCode.value});
}
</script>

<style scoped>
.mfa-auth-form {
  width: 360px;
}

.title {
  margin-bottom: 16px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
}
</style>
