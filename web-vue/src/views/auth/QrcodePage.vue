<template>
  <div class="entry-shell">
    <a-card class="entry-card">
      <CustomHelmet :application="application" />
      <template v-if="loading">
        <a-spin size="large" tip="Generating QR code..." />
      </template>
      <template v-else-if="errorMessage">
        <a-result status="error" title="Unable to load QR code" :sub-title="errorMessage" />
      </template>
      <template v-else>
        <a-space direction="vertical" align="center" size="large" style="width: 100%">
          <h1 class="title">Scan to pay</h1>
          <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="Payment QR code" class="qr-code" />
          <a-typography-paragraph copyable class="pay-url">{{ payUrl }}</a-typography-paragraph>
          <a-alert type="info" show-icon message="Waiting for payment confirmation" />
          <a-button @click="openPayUrl">Open payment link</a-button>
        </a-space>
      </template>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import QRCode from "qrcode";
import type { Application } from "@/api/types";
import { getApplication } from "@/api/modules/application";
import { notifyPayment } from "@/api/modules/payment";
import CustomHelmet from "@/components/CustomHelmet.vue";
import * as Setting from "@/utils/Setting";

const route = useRoute();
const loading = ref(true);
const errorMessage = ref("");
const payUrl = ref("");
const qrCodeDataUrl = ref("");
const application = ref<Application | null>(null);
let pollTimer: number | undefined;

function openPayUrl() {
  if (payUrl.value) {
    window.open(payUrl.value, "_blank", "noopener,noreferrer");
  }
}

async function startPolling(owner: string, paymentName: string, successUrl: string) {
  pollTimer = window.setInterval(async () => {
    const response = await notifyPayment(owner, paymentName);
    if (response.status !== "ok") {
      return;
    }

    const payment = response.data as { state?: string } | null;
    const state = String(payment?.state || "").toLowerCase();
    if (["paid", "success", "succeeded", "approved", "done"].includes(state)) {
      window.clearInterval(pollTimer);
      Setting.goToLink(successUrl);
    }
  }, 3000);
}

onMounted(async () => {
  const owner = String(route.params.owner || "");
  const paymentName = String(route.params.paymentName || "");
  const providerName = String(route.query.providerName || route.query.provider || "");
  const successUrl = String(route.query.successUrl || "/");
  payUrl.value = String(route.query.payUrl || "");

  if (!owner || !paymentName || !providerName || !payUrl.value) {
    errorMessage.value = "Missing payment QR code parameters.";
    loading.value = false;
    return;
  }

  try {
    const applicationName = String(route.query.application || "");
    if (applicationName) {
      const appRes = await getApplication("admin", applicationName);
      if (appRes.status === "ok") {
        application.value = appRes.data ?? null;
      }
    }

    qrCodeDataUrl.value = await QRCode.toDataURL(payUrl.value, {
      margin: 2,
      width: 320,
    });
    await startPolling(owner, paymentName, successUrl);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to generate QR code.";
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (pollTimer) {
    window.clearInterval(pollTimer);
  }
});
</script>

<style scoped>
.entry-shell {
  display: flex;
  justify-content: center;
  padding: 48px 16px;
}

.entry-card {
  width: min(640px, 100%);
  text-align: center;
}

.title {
  margin: 0;
  font-size: 32px;
}

.qr-code {
  width: min(320px, 100%);
  border-radius: 16px;
}

.pay-url {
  margin-bottom: 0;
  word-break: break-all;
}
</style>
