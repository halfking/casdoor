<template>
  <div class="entry-shell" v-if="pricing">
    <CustomHelmet :application="application" />
    <div class="login-panel pricing-panel">
      <div class="login-form pricing-form">
        <AppLogo :application="application" />
        <h1 class="pricing-title">{{ pricing.displayName || pricing.name }}</h1>
        <p class="pricing-description">{{ pricing.description || "Choose a plan to continue." }}</p>

        <a-radio-group
          v-if="periods.length > 1"
          v-model:value="selectedPeriod"
          button-style="solid"
          size="large"
          class="period-group"
        >
          <a-radio-button v-for="period in periods" :key="period" :value="period">
            {{ period }}
          </a-radio-button>
        </a-radio-group>

        <a-row :gutter="16" class="plan-grid">
          <a-col v-for="plan in visiblePlans" :key="plan.name" :xs="24" :md="12" :xl="8">
            <a-card class="plan-card" :title="plan.displayName || plan.name">
              <p class="plan-price">{{ currencySymbol(plan.currency) }}{{ plan.price }}</p>
              <p class="plan-meta">{{ plan.period }}</p>
              <p class="plan-desc">{{ plan.description || "" }}</p>
              <a-button type="primary" block @click="selectPlan(plan.name)">
                Select Plan
              </a-button>
            </a-card>
          </a-col>
        </a-row>

        <p v-if="pricing.trialDuration > 0" class="trial-note">
          Free {{ pricing.trialDuration }}-day trial available.
        </p>
      </div>
    </div>
  </div>

  <div v-else class="entry-shell">
    <a-card class="entry-card">
      <a-spin v-if="loading" size="large" tip="Loading plans..." />
      <a-result v-else status="error" title="Failed to load pricing" :sub-title="errorMessage" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { Application, Plan, Pricing } from "@/api/types";
import { getApplication } from "@/api/modules/application";
import { getPlan } from "@/api/modules/plan";
import { getPricing } from "@/api/modules/pricing";
import { useAuthStore } from "@/stores/auth";
import AppLogo from "@/components/AppLogo.vue";
import CustomHelmet from "@/components/CustomHelmet.vue";
import * as Setting from "@/utils/Setting";

const route = useRoute();
const authStore = useAuthStore();

const loading = ref(true);
const errorMessage = ref("");
const pricing = ref<Pricing | null>(null);
const application = ref<Application | null>(null);
const plans = ref<Plan[]>([]);
const selectedPeriod = ref("");

const owner = computed(() => String(route.params.owner || ""));
const pricingName = computed(() => String(route.params.pricingName || ""));
const userName = computed(() => String(route.query.user || authStore.account?.name || ""));
const periods = computed(() => [...new Set(plans.value.map((item) => item.period).filter(Boolean))]);
const visiblePlans = computed(() => plans.value.filter((item) => !selectedPeriod.value || item.period === selectedPeriod.value));

function currencySymbol(currency?: string) {
  if (currency === "CNY") return "¥";
  if (currency === "EUR") return "€";
  return "$";
}

function selectPlan(planName: string) {
  if (!pricing.value) {
    return;
  }

  if (authStore.account || userName.value) {
    const params = new URLSearchParams();
    params.set("plan", planName);
    if (userName.value) {
      params.set("user", userName.value);
    }
    Setting.goToLink(`/buy-plan/${pricing.value.owner}/${pricing.value.name}?${params.toString()}`);
    return;
  }

  if (pricing.value.application) {
    Setting.goToLink(`/signup/${pricing.value.application}?plan=${encodeURIComponent(planName)}&pricing=${encodeURIComponent(pricing.value.name)}`);
    return;
  }

  Setting.goToLink(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
}

onMounted(async () => {
  if (!owner.value || !pricingName.value) {
    errorMessage.value = "Missing pricing route parameters.";
    loading.value = false;
    return;
  }

  try {
    const pricingRes = await getPricing(owner.value, pricingName.value);
    if (pricingRes.status !== "ok" || !pricingRes.data) {
      errorMessage.value = pricingRes.msg || "Pricing not found.";
      return;
    }

    pricing.value = pricingRes.data;
    if (pricing.value.application) {
      const appRes = await getApplication("admin", pricing.value.application);
      if (appRes.status === "ok") {
        application.value = appRes.data ?? null;
      }
    }

    const planResults = await Promise.all(pricing.value.plans.map((planNameItem) => getPlan(owner.value, planNameItem, true)));
    plans.value = planResults.filter((item) => item.status === "ok" && item.data).map((item) => item.data as Plan);
    selectedPeriod.value = periods.value[0] || "";
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Failed to load pricing.";
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
.pricing-panel {
  width: min(1120px, 100%);
}

.pricing-form {
  width: 100%;
}

.pricing-title {
  margin: 0 0 12px;
  font-size: 40px;
}

.pricing-description {
  margin: 0 auto 24px;
  max-width: 720px;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.65);
}

.period-group {
  margin-bottom: 28px;
}

.plan-grid {
  margin-top: 12px;
}

.plan-card {
  height: 100%;
  margin-bottom: 16px;
}

.plan-price {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
}

.plan-meta,
.trial-note {
  color: rgba(0, 0, 0, 0.6);
}

.plan-desc {
  min-height: 66px;
}
</style>
