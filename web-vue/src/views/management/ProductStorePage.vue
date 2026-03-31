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
                <div v-if="product.description" class="product-desc">{{ product.description }}</div>
              </template>
            </a-card-meta>

            <template #actions>
              <a-input-number
                v-model:value="productQuantities[product.name]"
                :min="1"
                :max="product.stock || 999"
                style="width: 60px"
              />
              <a-button type="primary" size="small" @click="addToCart(product)">
                <shopping-cart-outlined /> {{ t("general.Add to cart") }}
              </a-button>
            </template>
          </a-card>
        </a-col>
      </a-row>

      <a-empty v-if="products.length === 0" description="No products available" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { ShoppingCartOutlined, ShoppingOutlined } from "@ant-design/icons-vue";
import * as ProductApi from "@/api/modules/product";
import { useAuthStore } from "@/stores/auth";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);

const products = ref<any[]>([]);
const productQuantities = ref<Record<string, number>>({});
const cartItemCount = ref(0);

function goToCart() {
  router.push("/management/cart");
}

function addToCart(product: any) {
  const quantity = productQuantities.value[product.name] || 1;
  message.success(`Added ${quantity} x ${product.displayName || product.name} to cart`);
  // TODO: Implement actual cart API call
}

async function loadProducts() {
  loading.value = true;
  try {
    const response = await ProductApi.getProducts({
      owner: "",
      page: 1,
      pageSize: 100,
      field: "state",
      value: "Published",
    });
    if (response.status === "ok") {
      products.value = response.data || [];
      // Initialize quantities
      products.value.forEach((p: any) => {
        productQuantities.value[p.name] = 1;
      });
    }
  } catch (error) {
    message.error((error as Error).message);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  if (!authStore.account) {
    loading.value = false;
    return;
  }
  await loadProducts();
});
</script>

<style scoped>
.product-store-container {
  padding: 24px;
}

.store-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.product-card {
  height: 100%;
  transition: transform 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-cover {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  background: #f5f5f5;
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-image-placeholder {
  font-size: 48px;
  color: #ccc;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #5734d3;
  margin-bottom: 8px;
}

.product-price .currency {
  font-size: 14px;
  margin-right: 4px;
}

.product-desc {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
