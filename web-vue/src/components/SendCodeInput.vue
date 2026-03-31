<template>
  <a-input-search
    :addon-before="textBefore"
    :disabled="disabled"
    :value="modelValue"
    :placeholder="t('code:Enter your code')"
    class="verification-code-input"
    auto-complete="one-time-code"
    @update:value="$emit('update:modelValue', $event)"
    @search="handleSearch"
  >
    <template #prefix><SafetyOutlined /></template>
    <template #enterButton>
      <a-button
        type="primary"
        :disabled="disabled || buttonLeftTime > 0"
        :loading="buttonLoading"
        style="font-size: 14px"
      >
        {{ buttonLeftTime > 0 ? `${buttonLeftTime} s` : buttonLoading ? t("code:Sending") : t("code:Send Code") }}
      </a-button>
    </template>
  </a-input-search>
  <CaptchaModal
    v-if="!useInlineCaptcha"
    :owner="application?.owner ?? ''"
    :name="application?.name ?? ''"
    :visible="captchaVisible"
    :is-current-provider="false"
    @ok="handleCaptchaOk"
    @cancel="captchaVisible = false"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { SafetyOutlined } from "@ant-design/icons-vue";
import { sendCode } from "@/api/modules/user";
import { showMessage } from "@/utils/Setting";
import CaptchaModal from "./CaptchaModal.vue";

const props = defineProps<{
  modelValue?: string;
  disabled?: boolean;
  textBefore?: string;
  application?: { owner: string; name: string; codeResendTimeout?: number };
  method: string;
  countryCode?: string;
  /** { dest, type, applicationId, checkUser? } */
  onButtonClickArgs: { dest: string; type: string; applicationId: string; checkUser?: string };
  useInlineCaptcha?: boolean;
  captchaValue?: { captchaType?: string; captchaToken?: string; clientSecret?: string };
}>();

const emit = defineEmits<{
  "update:modelValue": [val: string];
  refreshCaptcha: [];
}>();

const { t } = useI18n();
const captchaVisible = ref(false);
const buttonLeftTime = ref(0);
const buttonLoading = ref(false);

function getCodeResendTimeout() {
  return (props.application?.codeResendTimeout && props.application.codeResendTimeout > 0)
    ? props.application.codeResendTimeout
    : 60;
}

function handleCountDown(leftTime?: number) {
  let sec = leftTime ?? getCodeResendTimeout();
  buttonLeftTime.value = sec;
  const tick = () => {
    sec--;
    buttonLeftTime.value = sec;
    if (sec > 0) setTimeout(tick, 1000);
  };
  setTimeout(tick, 1000);
}

async function handleCaptchaOk(captchaType: string, captchaToken: string, clientSecret: string) {
  captchaVisible.value = false;
  buttonLoading.value = true;
  try {
    const res = await sendCode({
      captchaType,
      captchaToken,
      clientSecret,
      method: props.method,
      countryCode: props.countryCode,
      ...props.onButtonClickArgs,
    });
    buttonLoading.value = false;
    if (res?.status === "ok") {
      handleCountDown();
    } else {
      if (props.useInlineCaptcha) emit("refreshCaptcha");
    }
  } catch {
    buttonLoading.value = false;
    if (props.useInlineCaptcha) emit("refreshCaptcha");
  }
}

function handleSearch() {
  if (!props.useInlineCaptcha) {
    captchaVisible.value = true;
    return;
  }
  if (!props.captchaValue?.captchaType || !props.captchaValue?.captchaToken) {
    showMessage("error", t("general:Please complete the captcha correctly"));
    return;
  }
  handleCaptchaOk(
    props.captchaValue.captchaType,
    props.captchaValue.captchaToken,
    props.captchaValue.clientSecret ?? ""
  );
}
</script>
