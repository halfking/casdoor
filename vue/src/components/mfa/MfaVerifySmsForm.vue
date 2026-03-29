<template>
  <a-form layout="vertical" @finish="submit">
    <a-typography-paragraph v-if="fixedDest" type="secondary">
      {{ isEmail ? t("mfa:Your email is") : t("mfa:Your phone is") }} {{ fixedDest }}
    </a-typography-paragraph>

    <a-form-item v-if="showEditableDest && !isEmail" :label="t('signup:Country code')">
      <a-input v-model:value="form.countryCode" />
    </a-form-item>

    <a-form-item v-if="showEditableDest" :label="isEmail ? t('general:Email') : t('general:Phone')">
      <a-input v-model:value="form.dest" />
    </a-form-item>

    <a-form-item
      name="passcode"
      :rules="[{ required: true, message: t('login:Please input your code!') }]"
    >
      <a-input
        v-model:value="form.passcode"
        :placeholder="t('mfa:Verification code')"
        size="large"
      >
        <template #addonAfter>
          <a-button :disabled="sending || countdown > 0 || !targetDest" type="link" @click.prevent="sendCode">
            {{ countdown > 0 ? `${countdown}s` : t("code:Send Code") }}
          </a-button>
        </template>
      </a-input>
    </a-form-item>

    <a-form-item>
      <a-checkbox v-model:checked="form.enableMfaRemember">
        {{ t("mfa:Remember this account for {hour} hours", { hour: mfaProps.mfaRememberInHours ?? 0 }) }}
      </a-checkbox>
    </a-form-item>

    <a-button block html-type="submit" size="large" type="primary">
      {{ t("forget:Verify") }}
    </a-button>
  </a-form>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from "vue";
import { message } from "ant-design-vue";
import { useI18n } from "vue-i18n";
import { sendVerificationCode } from "@/utils/auth-api";
import type { MfaOption } from "@/utils/auth";

const props = defineProps<{
  mfaProps: MfaOption;
  mode?: "auth" | "setup";
  applicationName?: string;
  user?: Record<string, unknown> | null;
}>();

const emit = defineEmits<{
  submit: [{ passcode: string; enableMfaRemember: boolean; dest: string; countryCode: string }];
}>();

const { t } = useI18n();
const sending = ref(false);
const countdown = ref(0);

const isEmail = computed(() => props.mfaProps.mfaType === "email");
const fixedDest = computed(() => {
  if (props.mode === "auth") {
    return String(props.mfaProps.secret ?? "");
  }

  if (isEmail.value) {
    return String(props.user?.email ?? "");
  }

  return String(props.user?.phone ?? "");
});

const form = reactive({
  passcode: "",
  enableMfaRemember: false,
  dest: fixedDest.value,
  countryCode: String(props.mfaProps.countryCode ?? props.user?.countryCode ?? ""),
});

const showEditableDest = computed(() => props.mode === "setup" && fixedDest.value === "");
const targetDest = computed(() => (showEditableDest.value ? form.dest : fixedDest.value));

let timer: number | null = null;

function startCountdown() {
  countdown.value = 60;
  timer = window.setInterval(() => {
    countdown.value -= 1;
    if (countdown.value <= 0 && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }, 1000);
}

async function sendCode() {
  if (!targetDest.value || !props.applicationName) {
    return;
  }

  sending.value = true;
  try {
    const result = await sendVerificationCode({
      method: props.mode === "setup" ? "mfaSetup" : "mfaAuth",
      dest: targetDest.value,
      type: isEmail.value ? "email" : "phone",
      applicationId: props.applicationName,
      countryCode: form.countryCode,
    });

    if (result.status === "ok") {
      message.success(t("user:Verification code sent"));
      startCountdown();
    } else {
      message.error(result.msg || t("general:Failed to get"));
    }
  } finally {
    sending.value = false;
  }
}

function submit() {
  emit("submit", {
    passcode: form.passcode,
    enableMfaRemember: form.enableMfaRemember,
    dest: targetDest.value,
    countryCode: form.countryCode,
  });
}

onBeforeUnmount(() => {
  if (timer !== null) {
    window.clearInterval(timer);
  }
});
</script>
