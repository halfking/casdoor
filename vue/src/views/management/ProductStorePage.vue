<template>
  <div class="product-store-container">
    <a-spin v-if="loading" tip="Loading..." />
    <div v-else>
      <!-- Header with cart button -->
      <div class="store-header">
        <a-button type="primary" @click="goToCart">
          <shopping-cart-outlined /> 
          {{ t("general.Cart") }}
          <a-badge v-if="cartItemCount > 0" :count="cartItemCount" :offset="[10, 0]" />
        </a-button>
      </div>

      <!-- Products grid -->
      <a-row :gutter="[24, 24]">
        <a-col v-for="product in products" :key="product.name" :xs="24" :sm="12" :md="8" :lg="6">
          <a-card hoverable class="product-card" :body-style="{ padding: '16px' }">
            <template #cover>
              <div class="product-cover">
                <img v-if="product.image" :src="product.image" :alt="product.name" class="product-image" />
                <div v-else class="product-image-placeholder">
                  <shopping-outlined />
                </div>
              </div>
            </template>
            
            <a-card-meta :title="product.displayName || product.name">
              <template #description>
                <div class="product-price">
                  <span class="currency">{{ product.currency || 'USD' }}</span>
                  <span class="amount">{{ product.price }}</span>
                </div>
                <div class="product-desc">{{ product.description }}</div>
              </template>
            </a-card-meta>

            <template #actions>
              <a-tooltip :title="t('product.Add to Cart')">
                <shopping-cart-outlined @click.stop="addToCart(product)" />
              </a-tooltip>
              <a-tooltip :title="t('product.Buy Now')">
                <shopping-outlined @click.stop="buyNow(product)" />
              </a-tooltip>
            </template>
          </a-card>
        </a-col>
      </a-row>

      <!-- Empty state -->
      <a-empty v-if="products.length === 0 && !loading" :description="t('general.No data')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { ShoppingCartOutlined } from "@ant-design/icons-vue";
import * as ProductApi from "@/api/product";
import * as UserApi from "@/api/user";
import { useAuthStore } from "@/stores/auth";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const products = ref<any[]>([]);
const cartItemCount = ref(0);

const fetchProducts = async () => {
  loading.value = true;
  try {
    const org = authStore.account?.owner || "admin";
    const data = await ProductApi.getProducts(org);
    if (data) {
      products.value = data.filter((p: any) => p.isEnabled);
    }
  } catch (error) {
    message.error(t("general.Failed to load products"));
  } finally {
    loading.value = false;
  }
};

const getCartItemCount = async () => {
  if (!authStore.account) return;
  try {
    const userData = await UserApi.getUser(authStore.account.owner, authStore.account.name);
    cartItemCount.value = userData.cart?.length || 0;
  } catch (error) {
    console.error("Failed to get cart count:", error);
  }
};

const addToCart = async (product: any) => {
  if (!authStore.account) {
    message.warning(t("general Please login first"));
    return;
  }
  try {
    const userData = await UserApi.getUser(authStore.account.owner, authStore.account.name);
    const cart = userData.cart || [];
    const existingIndex = cart.findIndex(
      (item: any) => item.owner === product.owner && item.name === product.name
    );
    if (existingIndex !== -1) {
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 0) + 1;
    } else {
      cart.push({ owner: product.owner, name: product.name, quantity: 1 });
    }
    userData.cart = cart;
    await UserApi.updateUser(userData.owner, userData.name, userData);
    cartItemCount.value = cart.length;
    message.success(t("general.Successfully added"));
  } catch (error) {
    message.error(t("general.Failed to add to cart"));
  }
};

const buyNow = (product: any) => {
  router.push(`/buy?owner=${product.owner}&product=${product.name}`);
};

const goToCart = () => {
  router.push("/cart");
};

onMounted(() => {
  fetchProducts();
  getCartItemCount();
});
</script>

<style scoped lang="less">
.product-store-container {
  padding: 24px;
}

.store-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.product-card {
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.product-cover {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.product-image {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.product-image-placeholder {
  font-size: 48px;
  color: #999;
}

.product-price {
  margin-bottom: 8px;
  
  .currency {
    font-size: 14px;
    color: #666;
  }
  
  .amount {
    font-size: 20px;
    font-weight: 600;
    color: #1890ff;
    margin-left: 4px;
  }
}

.product-desc {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.ant-card-actions) {
  li {
    margin: 4px 0;
  }
}
</style>