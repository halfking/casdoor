<template>
  <div class="agreement-modal">
    <a-modal
      v-model:open="visible"
      :title="t('login:Terms of Use')"
      :width="600"
      :footer="null"
      @cancel="$emit('cancel')"
    >
      <div v-html="sanitizedContent" />
      <div style="text-align: center; margin-top: 16px">
        <a-button type="primary" @click="$emit('accept')">
          {{ t("login:Accept") }}
        </a-button>
        <a-button style="margin-left: 8px" @click="$emit('cancel')">
          {{ t("login:Decline") }}
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import DOMPurify from "dompurify";

const props = defineProps<{
  visible: boolean;
  content: string;
}>();

defineEmits<{
  (e: "accept"): void;
  (e: "cancel"): void;
}>();

const { t } = useI18n();

const sanitizedContent = computed(() =>
  DOMPurify.sanitize(props.content, { USE_PROFILES: { html: true } })
);
</script>
