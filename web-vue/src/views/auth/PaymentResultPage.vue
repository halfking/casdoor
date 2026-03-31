<template>
  <div class="entry-shell">
    <a-card class="entry-card">
      <CustomHelmet :application="application" />
      <a-spin v-if="loading" size="large" tip="Checking payment status..." />
      <a-result
        v-else
        :status="resultStatus"
        :title="resultTitle"
        :sub-title="resultSubtitle"
      >
        <template #extra>
          <a-space>
            <a-button type="primary" @click="goHome">Back home</a-button>
            <a-button @click="goOrders">View orders</a-button>
            <a-button v-if="retryUrl" @click="retryPayment">Retry payment</a-button>
          </a-space>
        </template>
      </a-result>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { Application, Payment, Subscription } from "@/api/types";
import { getApplication } from "@/api/modules/application";
import { notifyPayment } from "@/api/modules/payment";
import { getSubscription } from "@/api/modules/subscription";
import CustomHelmet from "@/components/CustomHelmet.vue";
import * as Setting from "@/utils/Setting";

const route = useRoute();
const loading = ref(true);
const application = ref<Application | null>(null);
const payment = ref<Payment | null>(null);
const resultStatus = ref<"success" | "info" | "warning" | "error">("info");
const resultTitle = ref("Payment processing");
const resultSubtitle = ref("Waiting for the provider to confirm the payment.");
const retryUrl = ref("");
let pollTimer: number | undefined;

const owner = computed(() => String(route.params.owner || ""));
const paymentName = ref(String(route.query.payment || route.query.paymentName || ""));
const subscriptionName = computed(() => String(route.query.subscription || ""));

function goHome() {
  Setting.goToLink("/");
}

function goOrders() {
  Setting.goToLink("/orders");
}

function retryPayment() {
  if (retryUrl.value) {
    Setting.goToLink(retryUrl.value);
  }
}

function applyResultStatus(currentPayment: Payment | null) {
  const state = String(currentPayment?.state || "").toLowerCase();
  const payUrl = String((currentPayment as unknown as Record<string, unknown> | null)?.payUrl || "");
  retryUrl.value = payUrl;

  if (["paid", "success", "succeeded", "approved", "done"].includes(state)) {
    resultStatus.value = "success";
    resultTitle.value = "Payment successful";
    resultSubtitle.value = "The order has been completed successfully.";
    return;
  }

  if (["canceled", "cancelled", "failed", "error", "closed"].includes(state)) {
    resultStatus.value = "error";
    resultTitle.value = "Payment failed";
    resultSubtitle.value = currentPayment?.detail || "The payment was not completed.";
    return;
  }

  resultStatus.value = "info";
  resultTitle.value = "Payment processing";
  resultSubtitle.value = currentPayment?.detail || "Waiting for the provider to confirm the payment.";
}

async function resolvePaymentName() {
  if (paymentName.value) {
    return;
  }

  if (!subscriptionName.value || !owner.value) {
    return;
  }

  const subscriptionRes = await getSubscription(owner.value, subscriptionName.value);
  if (subscriptionRes.status !== "ok" || !subscriptionRes.data) {
    throw new Error(subscriptionRes.msg || "Failed to query subscription status.");
  }

  const subscription = subscriptionRes.data as Subscription;
  paymentName.value = String(subscription.payment || "");
}

async function checkPayment() {
  if (!owner.value || !paymentName.value) {
    throw new Error("Unable to determine which payment should be verified.");
  }

  const response = await notifyPayment(owner.value, paymentName.value);
  if (response.status !== "ok") {
    throw new Error(response.msg || "Failed to query payment status.");
  }

  payment.value = (response.data as Payment | null) ?? null;
  applyResultStatus(payment.value);

  const state = String(payment.value?.state || "").toLowerCase();
  return ["created", "pending", "processing"].includes(state);
}

onMounted(async () => {
  if (!owner.value) {
    resultStatus.value = "error";
    resultTitle.value = "Missing payment information";
    resultSubtitle.value = "Unable to determine which payment should be verified.";
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

    await resolvePaymentName();
    const shouldContinuePolling = await checkPayment();
    if (shouldContinuePolling) {
      pollTimer = window.setInterval(async () => {
        try {
          const keepPolling = await checkPayment();
          if (!keepPolling && pollTimer) {
            window.clearInterval(pollTimer);
          }
        } catch {
          // Keep polling quietly to tolerate temporary payment gateway delays.
        }
      }, 2000);
    }
  } catch (error) {
    resultStatus.value = "error";
    resultTitle.value = "Payment check failed";
    resultSubtitle.value = error instanceof Error ? error.message : "Unable to verify payment result.";
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
  width: min(720px, 100%);
}
</style>
