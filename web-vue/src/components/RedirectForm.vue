<template>
  <div>
    <p>{{ t("login.Redirecting, please wait.") }}</p>
    <form ref="formRef" method="post" :action="redirectUrl">
      <input type="hidden" name="SAMLResponse" :value="samlResponse" />
      <input type="hidden" name="RelayState" :value="relayState" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
  samlResponse: string;
  redirectUrl: string;
  relayState: string;
}>();

const formRef = ref<HTMLFormElement | null>(null);

onMounted(() => {
  formRef.value?.submit();
});
</script>
