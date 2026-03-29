<template>
  <a-form layout="vertical" @finish="submit">
    <a-form-item
      name="password"
      :rules="[{ required: true, message: t('login:Please input your password!') }]"
    >
      <a-input-password
        v-model:value="password"
        :placeholder="t('general:Password')"
        size="large"
      />
    </a-form-item>

    <a-button block html-type="submit" size="large" type="primary">
      {{ submitText || t("forget:Verify") }}
    </a-button>
  </a-form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";

defineProps<{
  submitText?: string;
}>();

const emit = defineEmits<{
  submit: [{ password: string }];
}>();

const { t } = useI18n();
const password = ref("");

function submit() {
  emit("submit", {password: password.value});
}
</script>
