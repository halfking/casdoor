<template>
  <a-form layout="vertical" @finish="submit">
    <div v-if="mfaProps.url" class="qrcode-wrap">
      <a-qrcode :value="String(mfaProps.url)" />
    </div>

    <a-typography-paragraph v-if="mfaProps.secret" type="secondary">
      {{ t("mfa:Or copy the secret to your Authenticator App") }}
    </a-typography-paragraph>

    <a-space v-if="mfaProps.secret" style="width: 100%; margin-bottom: 16px">
      <a-input :value="String(mfaProps.secret)" readonly />
      <a-button @click="copySecret">{{ t("general:Copy") }}</a-button>
    </a-space>

    <a-form-item
      name="passcode"
      :rules="[{ required: true, message: t('login:Please input your code!') }]"
    >
      <a-input
        v-model:value="form.passcode"
        :placeholder="t('mfa:Verification code')"
        size="large"
      />
    </a-form-item>

    <a-form-item name="enableMfaRemember">
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
import { message } from "ant-design-vue";
import { reactive } from "vue";
import { useI18n } from "vue-i18n";
import type { MfaOption } from "@/utils/auth";

const props = defineProps<{
  mfaProps: MfaOption;
}>();

const emit = defineEmits<{
  submit: [{ passcode: string; enableMfaRemember: boolean }];
}>();

const { t } = useI18n();

const form = reactive({
  passcode: "",
  enableMfaRemember: false,
});

async function copySecret() {
  if (!props.mfaProps.secret) {
    return;
  }

  await navigator.clipboard.writeText(String(props.mfaProps.secret));
  message.success(t("general:Copied to clipboard successfully"));
}

function submit() {
  emit("submit", {passcode: form.passcode, enableMfaRemember: form.enableMfaRemember});
}
</script>

<style scoped>
.qrcode-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
</style>
