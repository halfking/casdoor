<template>
  <div class="order-pay-container">
    <a-spin v-if="loading" tip="Loading..." />
    <div v-else-if="order" class="order-pay-content">
      <!-- Order Header -->
      <div class="order-header">
        <h2>{{ t("product.Order") }} #{{ order.name }}</h2>
        <a-tag :color="getStatusColor(order.state)">
          {{ getStatusText(order.state) }}
        </a-tag>
      </div>

      <!-- Order Info -->
      <a-card :title="t('product.Order Information')">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item :label="t('general.Organization')">
            {{ order.owner }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('general.User')">
            {{ order.userOwner }}/{{ order.userName }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('general.Created Time')">
            {{ formatDate(order.createdTime) }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('product.State')">
            <a-tag :color="getStatusColor(order.state)">
              {{ getStatusText(order.state) }}
            </a-tag>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- Products -->
      <a-card :title="t('product.Products')" class="products-card">
        <a-table
          :columns="productColumns"
          :data-source="order.products || []"
          :pagination="false"
          :row-key="(record: any) => `${record.owner}-${record.name}`"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              {{ record.displayName || record.name }}
            </template>
            <template v-else-if="column.key === 'price'">
              {{ record.currency || 'USD' }} {{ record.price }}
            </template>
            <template v-else-if="column.key === 'quantity'">
              {{ record.quantity }}
            </template>
            <template v-else-if="column.key === 'subtotal'">
              {{ record.currency || 'USD' }} {{ (record.price || 0) * (record.quantity || 0) }}
            </template>
          </template>
        </a-table>
      </a-card>

      <!-- Payment Info -->
      <a-card v-if="payment" :title="t('payment.Payment')" class="payment-card">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item :label="t('payment.Payment Name')">
            {{ payment.name }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('payment.Payment Status')">
            <a-tag :color="getPaymentStatusColor(payment.state)">
              {{ getPaymentStatusText(payment.state) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item :label="t('payment.Amount')">
            {{ payment.currency || 'USD' }} {{ payment.amount }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('payment.Payment URL')">
            <a :href="payment.paymentUrl" target="_blank" v-if="payment.paymentUrl">
              {{ t("general.View") }}
            </a>
            <span v-else>-</span>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- Order Total -->
      <div class="order-total">
        <span>{{ t("product.Total") }}:</span>
        <span class="total-amount">
          {{ order.currency || 'USD' }} {{ order.price }}
        </span>
      </div>

      <!-- Action Buttons -->
      <div v-if="!isViewMode" class="action-buttons">
        <a-button
          type="primary"
          size="large"
          :loading="isProcessingPayment"
          @click="handlePayment"
        >
          {{ t("payment.Pay Now") }}
        </a-button>
        <a-button size="large" @click="goToStore">
          {{ t("product.Continue Shopping") }}
        </a-button>
      </div>
      <div v-else class="action-buttons">
        <a-button size="large" @click="goToStore">
          {{ t("product.Continue Shopping") }}
        </a-button>
      </div>
    </div>
    <a-empty v-else :description="t('general.No data')" />
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { useAuthStore } from "@/stores/auth";
import * as OrderApi from "@/api/modules/order";
import * as PaymentApi from "@/api/modules/payment";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(false);
const isProcessingPayment = ref(false);
const isViewMode = ref(false);

const order = ref<any>(null);
const payment = ref<any>(null);

const productColumns = [
  {
    title: t("product.Product Name"),
    key: "name",
  },
  {
    title: t("product.Price"),
    key: "price",
  },
  {
    title: t("product.Quantity"),
    key: "quantity",
  },
  {
    title: t("product.Subtotal"),
    key: "subtotal",
  },
];

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString();
};

const getStatusColor = (state: string) => {
  const colorMap: Record<string, string> = {
    Created: "blue",
    Paid: "green",
    Declined: "red",
    Cancelled: "default",
  };
  return colorMap[state] || "default";
};

const getStatusText = (state: string) => {
  const textMap: Record<string, string> = {
    Created: t("payment.Pending"),
    Paid: t("payment.Paid"),
    Declined: t("payment.Declined"),
    Cancelled: t("payment.Cancelled"),
  };
  return textMap[state] || state;
};

const getPaymentStatusColor = (state: string) => {
  return getStatusColor(state);
};

const getPaymentStatusText = (state: string) => {
  return getStatusText(state);
};

const fetchOrder = async () => {
  loading.value = true;
  try {
    const owner = route.query.owner as string || route.params.organizationName as string;
    const orderName = route.query.orderId as string || route.params.orderName as string;
    
    if (!owner || !orderName) {
      message.error(t("general.Invalid parameters"));
      return;
    }
    
    const data = await OrderApi.getOrder(owner, orderName);
    if (data) {
      order.value = data;
      isViewMode.value = data.state !== "Created";
      
      if (data.paymentId) {
        fetchPayment(data.owner, data.paymentId);
      }
    }
  } catch (error) {
    message.error(t("general.Failed to load order"));
  } finally {
    loading.value = false;
  }
};

const fetchPayment = async (owner: string, paymentId: string) => {
  try {
    const data = await PaymentApi.getPayment(owner, paymentId);
    if (data) {
      payment.value = data;
    }
  } catch (error) {
    console.error("Failed to load payment:", error);
  }
};

const handlePayment = async () => {
  if (!order.value) return;
  
  isProcessingPayment.value = true;
  try {
    // Trigger payment - this would redirect to payment provider
    message.info(t("payment Redirecting to payment..."));
    
    // For now, just show a message about payment
    const paymentData = {
      owner: order.value.owner,
      name: `payment_${Date.now()}`,
      orderName: order.value.name,
      createdTime: new Date().toISOString(),
    };
    
    // In a real implementation, this would create a payment and redirect
    message.success(t("general.Payment initiated"));
  } catch (error) {
    message.error(t("general.Failed to process payment"));
  } finally {
    isProcessingPayment.value = false;
  }
};

const goToStore = () => {
  router.push("/product-store");
};

onMounted(() => {
  fetchOrder();
});
</script>

<style scoped lang="less">
.order-pay-container {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.order-pay-content {
  max-width: 900px;
  margin: 0 auto;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
}

.products-card,
.payment-card {
  margin-top: 16px;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 18px;
  font-weight: 600;
  
  .total-amount {
    font-size: 24px;
    color: #1890ff;
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  
  .ant-btn {
    min-width: 150px;
  }
}
</style>