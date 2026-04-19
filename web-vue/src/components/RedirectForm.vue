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

const props = defineProps<{
  samlResponse: string;
  redirectUrl: string;
  relayState: string;
}>();

const formRef = ref<HTMLFormElement | null>(null);

onMounted(() => {
  // Validate redirectUrl before auto-submitting to prevent open redirect
  if (props.redirectUrl) {
    try {
      const url = new URL(props.redirectUrl);
      if (url.protocol === "https:" || url.protocol === "http:") {
        formRef.value?.submit();
      } else {
        console.warn("[Casdoor] Blocked SAML redirect to non-HTTP URL:", props.redirectUrl);
      }
    } catch {
      console.warn("[Casdoor] Invalid SAML redirect URL:", props.redirectUrl);
    }
  }
});
</script>
