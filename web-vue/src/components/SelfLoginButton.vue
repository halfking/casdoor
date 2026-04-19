<template>
  <a-button type="primary" block @click="handleClick">
    <span>{{ t("login:Continue with") }} {{ username }}</span>
  </a-button>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const props = defineProps<{
  username: string;
  signinUrl?: string;
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();

const { t } = useI18n();

function handleClick() {
  emit("click");
}
</script>
