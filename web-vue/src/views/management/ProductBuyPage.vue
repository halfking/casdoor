<template>
  <div class="product-buy-container">
    <a-spin v-if="loading" tip="Loading..." />
    <div v-else-if="product" class="product-buy-content">
      <!-- Floating Cart Button -->
      <div class="floating-cart">
        <a-badge :count="cartItemCount" :offset="[-5, 5]">
          <a-button type="primary" @click="goToCart">
            <shopping-cart-outlined />
            {{ t("general.Cart") }}
          </a-button>
        </a-badge>
      </div>

      <!-- Product Info -->
      <a-card>
        <a-descriptions :column="2" bordered>
          <a-descriptions-item :label="t('product.Product')">
            {{ product.displayName || product.name }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('product.Category')">
            {{ product.category || '-' }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('product.Price')">
            <span class="price">
              {{ product.currency || 'USD' }} {{ product.price }}
            </span>
          </a-descriptions-item>
          <a-descriptions-item :label="t('product.Quantity')">
            <a-input-number
              v-model:value="buyQuantity"
              :min="1"
              :max="product.quantity || 999"
            />
          </a-descriptions-item>
          <a-descriptions-item :label="t('product.Description')" :span="2">
            {{ product.description || '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- Pricing Options -->
      <a-card v-if="pricing" :title="t('product.Pricing')" class="pricing-card">
        <a-radio-group v-model:value="selectedPricing" class="pricing-options">
          <a-radio :value="pricing.name" class="pricing-option">
            <div class="pricing-content">
              <span class="pricing-name">{{ pricing.displayName || pricing.name }}</span>
              <span class="pricing-price">{{ pricing.currency || 'USD' }} {{ pricing.price }}</span>
            </div>
          </a-radio>
        </a-radio-group>
      </a-card>

      <!-- Plan Options -->
      <a-card v-if="plans.length > 0" :title="t('product.Plan')" class="plan-card">
        <a-radio-group v-model:value="selectedPlan" class="plan-options">
          <a-radio v-for="plan in plans" :key="plan.name" :value="plan.name" class="plan-option">
            <div class="plan-content">
              <span class="plan-name">{{ plan.displayName || plan.name }}</span>
              <span class="plan-price">{{ plan.currency || 'USD' }} {{ plan.price }}</span>
            </div>
          </a-radio>
        </a-radio-group>
      </a-card>

      <!-- Order Summary -->
      <a-card :title="t('product.Order Summary')" class="summary-card">
        <a-descriptions :column="1">
          <a-descriptions-item :label="t('product.Product')">
            {{ product.displayName || product.name }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('product.Quantity')">
            {{ buyQuantity }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('product.Subtotal')">
            <span class="total-price">
              {{ product.currency || 'USD' }} {{ totalPrice }}
            </span>
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <a-button
          type="primary"
          size="large"
          :loading="isAddingToCart"
          @click="handleAddToCart"
        >
          <shopping-cart-outlined />
          {{ t("product.Add to Cart") }}
        </a-button>
        <a-button
          type="primary"
          size="large"
          :loading="isPlacingOrder"
          @click="handleBuyNow"
        >
          {{ t("product.Buy Now") }}
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
import { ShoppingCartOutlined } from "@ant-design/icons-vue";
import { useAuthStore } from "@/stores/auth";
import * as ProductApi from "@/api/modules/product";
import * as PlanApi from "@/api/modules/plan";
import * as PricingApi from "@/api/modules/pricing";
import * as UserApi from "@/api/modules/user";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(false);
const isPlacingOrder = ref(false);
const isAddingToCart = ref(false);
const cartItemCount = ref(0);

const product = ref<any>(null);
const pricing = ref<any>(null);
const plans = ref<any[]>([]);

const buyQuantity = ref(1);
const selectedPricing = ref("");
const selectedPlan = ref("");

const totalPrice = computed(() => {
  if (!product.value) return "0.00";
  return (product.value.price * buyQuantity.value).toFixed(2);
});

const fetchProduct = async () => {
  loading.value = true;
  try {
    const owner = route.params.organizationName as string || route.query.owner as string;
    const productName = route.params.productName as string || route.query.product as string;
    
    if (!owner || !productName) {
      message.error(t("general.Invalid parameters"));
      return;
    }
    
    const data = await ProductApi.getProduct(owner, productName);
    if (data) {
      product.value = data;
    }
  } catch (error) {
    message.error(t("general.Failed to load product"));
  } finally {
    loading.value = false;
  }
};

const fetchPricing = async () => {
  if (!product.value?.pricingId) return;
  
  try {
    const data = await PricingApi.getPricing(product.value.owner, product.value.pricingId);
    if (data) {
      pricing.value = data;
      selectedPricing.value = data.name;
    }
  } catch (error) {
    console.error("Failed to load pricing:", error);
  }
};

const fetchPlans = async () => {
  if (!product.value?.owner) return;
  
  try {
    const data = await PlanApi.getPlans(product.value.owner);
    if (data) {
      plans.value = data.filter((plan: any) => 
        plan.isEnabled && plan.products?.includes(product.value?.name)
      );
      if (plans.value.length > 0) {
        selectedPlan.value = plans.value[0].name;
      }
    }
  } catch (error) {
    console.error("Failed to load plans:", error);
  }
};

const getCartItemCount = async () => {
  if (!authStore.account) return;
  
  try {
    const userData = await UserApi.getUser(authStore.account.owner, authStore.account.name);
    if (userData?.cart) {
      cartItemCount.value = userData.cart.length;
    }
  } catch (error) {
    console.error("Failed to get cart count:", error);
  }
};

const handleAddToCart = async () => {
  if (!authStore.account || !product.value) {
    message.error(t("general Please login first"));
    return;
  }
  
  isAddingToCart.value = true;
  try {
    const userData = await UserApi.getUser(authStore.account.owner, authStore.account.name);
    const cart = userData.cart || [];
    
    // Check if product already in cart
    const existingIndex = cart.findIndex(
      (item: any) => item.owner === product.value.owner && item.name === product.value.name
    );
    
    if (existingIndex !== -1) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 0) + buyQuantity.value;
    } else {
      cart.push({
        owner: product.value.owner,
        name: product.value.name,
        quantity: buyQuantity.value,
      });
    }
    
    userData.cart = cart;
    await UserApi.updateUser(userData.owner, userData.name, userData);
    
    message.success(t("general.Successfully added"));
    cartItemCount.value = cart.length;
  } catch (error) {
    message.error(t("general.Failed to add to cart"));
  } finally {
    isAddingToCart.value = false;
  }
};

const handleBuyNow = async () => {
  if (!authStore.account || !product.value) {
    message.error(t("general Please login first"));
    return;
  }
  
  isPlacingOrder.value = true;
  try {
    const orderData = {
      owner: authStore.account.owner,
      name: `order_${Date.now()}`,
      createdTime: new Date().toISOString(),
      userOwner: authStore.account.owner,
      userName: authStore.account.name,
      products: [
        {
          owner: product.value.owner,
          name: product.value.name,
          displayName: product.value.displayName || product.value.name,
          price: product.value.price,
          quantity: buyQuantity.value,
        },
      ],
    };
    
    const result = await (await import("@/api/modules/order")).createOrder(orderData);
    if (result) {
      message.success(t("general.Successfully created"));
      router.push(`/order-pay?orderId=${result.name}`);
    }
  } catch (error) {
    message.error(t("general.Failed to create order"));
  } finally {
    isPlacingOrder.value = false;
  }
};

const goToCart = () => {
  router.push("/cart");
};

onMounted(() => {
  fetchProduct().then(() => {
    if (product.value) {
      fetchPricing();
      fetchPlans();
    }
  });
  getCartItemCount();
});
</script>

<style scoped lang="less">
.product-buy-container {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
}

.product-buy-content {
  max-width: 800px;
  margin: 0 auto;
}

.floating-cart {
  position: fixed;
  top: 100px;
  right: 24px;
  z-index: 100;
}

.pricing-card,
.plan-card,
.summary-card {
  margin-top: 16px;
}

.price,
.total-price {
  font-size: 20px;
  font-weight: 600;
  color: #1890ff;
}

.pricing-options,
.plan-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pricing-option,
.plan-option {
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  
  &:hover {
    border-color: #1890ff;
  }
  
  &[checked] {
    border-color: #1890ff;
  }
}

.pricing-content,
.plan-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.pricing-name,
.plan-name {
  font-weight: 500;
}

.pricing-price,
.plan-price {
  color: #1890ff;
  font-weight: 600;
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