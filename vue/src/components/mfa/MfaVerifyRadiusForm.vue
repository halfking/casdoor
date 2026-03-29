<template>
  <a-form layout="vertical" @finish="submit">
    <a-form-item v-if="mode === 'setup'" :label="t('signup:Username')">
      <a-input v-model:value="form.dest" />
    </a-form-item>

    <a-form-item
      name="passcode"
      :rules="[{ required: true, message: t('login:Please input your RADIUS password!') }]"
    >
      <a-input-password
        v-model:value="form.passcode"
        :placeholder="t('general:Password')"
        size="large"
      />
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
import { reactive } from "vue";
import { useI18n } from "vue-i18n";
import type { MfaOption } from "@/utils/auth";

defineProps<{
  mfaProps: MfaOption;
  mode?: "auth" | "setup";
}>();

const emit = defineEmits<{
  submit: [{ passcode: string; enableMfaRemember: boolean; dest: string }];
}>();

const { t } = useI18n();

const form = reactive({
  passcode: "",
  enableMfaRemember: false,
  dest: "",
});

function submit() {
  emit("submit", {
    passcode: form.passcode,
    enableMfaRemember: form.enableMfaRemember,
    dest: form.dest,
  });
}
</script>
