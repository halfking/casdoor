<template>
  <div class="dashboard-page">
    <a-spin :spinning="loading">
      <!-- Statistics cards -->
      <a-row :gutter="[16, 16]" class="stat-cards">
        <a-col :xs="12" :sm="6" v-for="card in statCards" :key="card.label">
          <a-card class="stat-card">
            <a-statistic :title="card.label" :value="card.value" />
          </a-card>
        </a-col>
      </a-row>

      <!-- Trend chart -->
      <a-card :title="t('general.Dashboard')" class="chart-card">
        <v-chart v-if="chartOption" class="trend-chart" :option="chartOption" autoresize />
        <a-empty v-else-if="!loading" />
      </a-card>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import { getDashboard } from "@/api/modules/dashboard";
import { useAuthStore } from "@/stores/auth";

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent]);

const { t } = useI18n();
const authStore = useAuthStore();
const loading = ref(false);

interface DashboardData {
  [key: string]: number[];
}

const dashboardData = ref<DashboardData>({});

const entityLabels: Record<string, string> = {
  organizationCounts: "Organizations",
  userCounts: "Users",
  applicationCounts: "Applications",
  providerCounts: "Providers",
  subscriptionCounts: "Subscriptions",
  roleCounts: "Roles",
  groupCounts: "Groups",
  permissionCounts: "Permissions",
  modelCounts: "Models",
  adapterCounts: "Adapters",
  enforcerCounts: "Enforcers",
};

// Statistics cards: total users, today's new, 7-day new, 30-day new
const statCards = computed(() => {
  const userCounts = dashboardData.value.userCounts;
  if (!userCounts || userCounts.length < 31) {
    return [];
  }
  const total = userCounts[30]; // latest (cumulative)
  const todayNew = userCounts[30] - (userCounts[29] ?? 0);
  const weekNew = userCounts[30] - (userCounts[23] ?? 0);
  const monthNew = userCounts[30] - (userCounts[0] ?? 0);
  return [
    { label: t("general.Users") + " (" + t("general.Total") + ")", value: total },
    { label: t("general.Users") + " (" + t("general.Today") + ")", value: todayNew },
    { label: t("general.Users") + " (7d)", value: weekNew },
    { label: t("general.Users") + " (30d)", value: monthNew },
  ];
});

// Generate x-axis labels: past 30 days
function generateDateLabels(): string[] {
  const labels: string[] = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
  }
  return labels;
}

const chartOption = computed(() => {
  const data = dashboardData.value;
  if (!data || Object.keys(data).length === 0) return null;

  const dateLabels = generateDateLabels();

  // Show key entities as lines
  const showKeys = ["userCounts", "organizationCounts", "applicationCounts", "providerCounts", "roleCounts", "permissionCounts"];
  const series = showKeys
    .filter((k) => data[k] && data[k].length > 0)
    .map((k) => ({
      name: entityLabels[k] || k,
      type: "line" as const,
      smooth: true,
      data: data[k],
    }));

  return {
    tooltip: { trigger: "axis" as const },
    legend: {
      data: series.map((s) => s.name),
      bottom: 0,
    },
    grid: { left: "3%", right: "4%", bottom: "12%", containLabel: true },
    xAxis: {
      type: "category" as const,
      boundaryGap: false,
      data: dateLabels,
    },
    yAxis: { type: "value" as const },
    series,
  };
});

async function fetchData() {
  loading.value = true;
  try {
    const owner = authStore.account?.owner || "";
    const res = await getDashboard(owner);
    if (res.status === "ok" && res.data) {
      // API returns array with single object, or object directly
      const raw = Array.isArray(res.data) ? res.data[0] : res.data;
      dashboardData.value = raw || {};
    }
  } catch (err) {
    console.error("[Dashboard] fetch error:", err);
  } finally {
    loading.value = false;
  }
}

onMounted(fetchData);
</script>

<style scoped>
.dashboard-page {
  padding: 0;
}

.stat-cards {
  margin-bottom: 16px;
}

.stat-card {
  border-radius: var(--kx-radius-card, 10px);
}

.chart-card {
  border-radius: var(--kx-radius-card, 10px);
}

.trend-chart {
  height: 400px;
  width: 100%;
}
</style>
