<template>
  <div class="entry-shell" v-if="product">
    <div class="login-panel buy-panel">
      <div class="login-form buy-form">
        <CustomHelmet :application="application" />
        <AppLogo :application="application" />

        <h1 class="title">{{ plan?.displayName || product.displayName || product.name }}</h1>
        <p class="subtitle">{{ plan?.description || product.description || product.detail }}</p>

        <a-card class="summary-card" title="Order Summary">
          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="Product">{{ product.displayName || product.name }}</a-descriptions-item>
            <a-descriptions-item v-if="plan" label="Plan">{{ plan.displayName || plan.name }}</a-descriptions-item>
            <a-descriptions-item label="Quantity">
              <a-input-number v-model:value="quantity" :min="1" />
            </a-descriptions-item>
            <a-descriptions-item v-if="product.isRecharge" label="Amount">
              <a-space direction="vertical" style="width: 100%">
                <a-radio-group
                  v-if="product.rechargeOptions?.length"
                  v-model:value="customPrice"
                  option-type="button"
                  button-style="solid"
                >
                  <a-radio-button v-for="amount in product.rechargeOptions" :key="amount" :value="amount">
                    {{ currencySymbol(product.currency) }}{{ amount }}
                  </a-radio-button>
                </a-radio-group>
                <a-input-number
                  v-model:value="customPrice"
                  :min="1"
                  :disabled="product.disableCustomRecharge"
                />
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="Price">{{ currencySymbol(product.currency) }}{{ actualPrice }}</a-descriptions-item>
            <a-descriptions-item label="Providers">
              <a-radio-group v-model:value="selectedProviderName" class="provider-group">
                <a-radio-button v-for="provider in providers" :key="provider.name" :value="provider.name">
                  {{ provider.displayName || provider.name }}
                </a-radio-button>
              </a-radio-group>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>

        <a-alert
          v-if="!resolvedUserName"
          type="warning"
          show-icon
          message="Login required"
          description="You need a user identity to place this order."
          class="action-alert"
        />

        <a-space class="action-row">
          <a-button v-if="!resolvedUserName" type="primary" @click="goToLogin">Sign in</a-button>
          <a-button v-else type="primary" :loading="submitting" @click="handleSubmit">Place order and pay</a-button>
          <a-button @click="goBack">Back</a-button>
        </a-space>
      </div>
    </div>
  </div>

  <div v-else class="entry-shell">
    <a-card class="entry-card">
      <a-spin v-if="loading" size="large" tip="Loading product..." />
      <a-result v-else status="error" title="Failed to load product" :sub-title="errorMessage" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { Application, Order, Payment, Plan, Pricing, Product, ProductInfo, Provider } from "@/api/types";
import { getApplication } from "@/api/modules/application";
import { payOrder, placeOrder } from "@/api/modules/order";
import { getPlan } from "@/api/modules/plan";
import { getPricing } from "@/api/modules/pricing";
import { getProduct } from "@/api/modules/product";
import { useAuthStore } from "@/stores/auth";
import AppLogo from "@/components/AppLogo.vue";
import CustomHelmet from "@/components/CustomHelmet.vue";
import * as Setting from "@/utils/Setting";

const route = useRoute();
const authStore = useAuthStore();

const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref("");
const pricing = ref<Pricing | null>(null);
const plan = ref<Plan | null>(null);
const product = ref<Product | null>(null);
const application = ref<Application | null>(null);
const quantity = ref(1);
const customPrice = ref(100);
const selectedProviderName = ref("");

const owner = computed(() => String(route.params.owner || ""));
const pricingName = computed(() => String(route.params.pricingName || ""));
const planName = computed(() => String(route.query.plan || ""));
const resolvedUserName = computed(() => String(route.query.user || authStore.account?.name || ""));
const providers = computed<Provider[]>(() => product.value?.providerObjs || []);
const paymentEnv = computed(() => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("micromessenger") && ua.includes("mobile") ? "WechatBrowser" : "";
});
const actualPrice = computed(() => {
  if (!product.value) {
    return 0;
  }
  return product.value.isRecharge ? Number(customPrice.value || 0) : Number(product.value.price || 0);
});

function currencySymbol(currency?: string) {
  if (currency === "CNY") return "¥";
  if (currency === "EUR") return "€";
  return "$";
}

function goToLogin() {
  Setting.goToLink(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
}

function goBack() {
  window.history.back();
}

function invokeWechatJsapi(attachInfo: Record<string, unknown>, successUrl: string) {
  const bridgePayload = {
    appId: String(attachInfo.appId || ""),
    timeStamp: String(attachInfo.timeStamp || ""),
    nonceStr: String(attachInfo.nonceStr || ""),
    package: String(attachInfo.package || ""),
    signType: String(attachInfo.signType || ""),
    paySign: String(attachInfo.paySign || ""),
  };

  if (!bridgePayload.appId || !bridgePayload.timeStamp || !bridgePayload.nonceStr || !bridgePayload.package) {
    return false;
  }

  const bridge = (window as unknown as { WeixinJSBridge?: { invoke: (...args: unknown[]) => void } }).WeixinJSBridge;
  const invoke = () => {
    bridge?.invoke("getBrandWCPayRequest", bridgePayload, (res: { err_msg?: string }) => {
      const message = String(res?.err_msg || "");
      if (message === "get_brand_wcpay_request:ok") {
        Setting.goToLink(successUrl);
        return;
      }
      if (message === "get_brand_wcpay_request:cancel") {
        Setting.showMessage("warning", "Payment cancelled.");
        return;
      }
      Setting.showMessage("error", "Payment failed.");
    });
  };

  if (!bridge) {
    document.addEventListener("WeixinJSBridgeReady", invoke, false);
    return true;
  }

  invoke();
  return true;
}

async function handleSubmit() {
  if (!product.value || !resolvedUserName.value) {
    return;
  }

  const providerName = selectedProviderName.value || providers.value[0]?.name;
  if (!providerName) {
    Setting.showMessage("error", "No payment provider is available for this product.");
    return;
  }

  submitting.value = true;
  try {
    const productInfo: ProductInfo = {
      owner: product.value.owner,
      name: product.value.name,
      displayName: product.value.displayName,
      detail: product.value.detail,
      price: actualPrice.value,
      currency: product.value.currency,
      isRecharge: product.value.isRecharge,
      pricingName: pricingName.value,
      planName: planName.value,
      quantity: quantity.value,
    };

    const placeRes = await placeOrder(product.value.owner, [productInfo], resolvedUserName.value);

    if (placeRes.status !== "ok" || !placeRes.data) {
      throw new Error(placeRes.msg || "Failed to create order.");
    }

    const order = placeRes.data as Order;
    const payRes = await payOrder(order.owner, order.name, providerName, paymentEnv.value);
    if (payRes.status !== "ok" || !payRes.data) {
      throw new Error(payRes.msg || "Failed to initialize payment.");
    }

    const payment = payRes.data as Payment;
    const attachInfo = (payRes.data2 || {}) as Record<string, unknown>;
    const resultParams = new URLSearchParams({
      payment: payment.name,
      providerName,
    });
    if (pricing.value?.application) {
      resultParams.set("application", pricing.value.application);
    }

    const defaultSuccessUrl = `/buy-plan/${encodeURIComponent(order.owner)}/${encodeURIComponent(pricingName.value)}/result?${resultParams.toString()}`;
    const payUrl = String(payment.payUrl || "");
    const successUrl = String(payment.successUrl || defaultSuccessUrl);
    const paymentName = String(payment.name || "");
    const provider = providers.value.find((item) => item.name === providerName);

    if (provider?.type === "WeChat Pay" && paymentEnv.value === "WechatBrowser") {
      const handled = invokeWechatJsapi(attachInfo, successUrl);
      if (handled) {
        return;
      }
    }

    if (provider?.type === "WeChat Pay" && paymentEnv.value !== "WechatBrowser") {
      const params = new URLSearchParams({
        providerName,
        payUrl,
        successUrl,
      });
      if (pricing.value?.application) {
        params.set("application", pricing.value.application);
      }
      Setting.goToLink(`/qrcode/${encodeURIComponent(order.owner)}/${encodeURIComponent(paymentName)}?${params.toString()}`);
      return;
    }

    if (payUrl) {
      Setting.goToLink(payUrl);
      return;
    }

    Setting.goToLink(successUrl);
  } catch (error) {
    Setting.showMessage("error", error instanceof Error ? error.message : "Payment failed.");
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  if (!owner.value || !pricingName.value || !planName.value) {
    errorMessage.value = "Missing pricing or plan information.";
    loading.value = false;
    return;
  }

  try {
    const pricingRes = await getPricing(owner.value, pricingName.value);
    if (pricingRes.status !== "ok" || !pricingRes.data) {
      throw new Error(pricingRes.msg || "Pricing not found.");
    }
    pricing.value = pricingRes.data;

    const planRes = await getPlan(owner.value, planName.value, true);
    if (planRes.status !== "ok" || !planRes.data) {
      throw new Error(planRes.msg || "Plan not found.");
    }
    plan.value = planRes.data;

    const productRes = await getProduct(owner.value, plan.value.product);
    if (productRes.status !== "ok" || !productRes.data) {
      throw new Error(productRes.msg || "Product not found.");
    }
    product.value = productRes.data;

    if (product.value.rechargeOptions?.length) {
      customPrice.value = product.value.rechargeOptions[0];
    } else {
      customPrice.value = Number(product.value.price || 0);
    }

    if (product.value.providerObjs?.length) {
      selectedProviderName.value = product.value.providerObjs[0].name;
    }

    if (pricing.value.application) {
      const appRes = await getApplication("admin", pricing.value.application);
      if (appRes.status === "ok") {
        application.value = appRes.data ?? null;
      }
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to load product.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.entry-shell {
  display: flex;
  justify-content: center;
  padding: 32px 16px;
}

.entry-card,
.buy-panel {
  width: min(860px, 100%);
}

.buy-form {
  width: 100%;
}

.title {
  margin: 0 0 12px;
  font-size: 36px;
}

.subtitle {
  margin: 0 auto 24px;
  max-width: 640px;
  color: rgba(0, 0, 0, 0.65);
}

.summary-card {
  text-align: left;
}

.provider-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-alert {
  margin-top: 16px;
  text-align: left;
}

.action-row {
  margin-top: 24px;
}
</style>
