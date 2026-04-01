<template>
  <div class="cart-list-container">
    <a-spin v-if="loading" tip="Loading..." />
    <div v-else>
      <!-- Cart Header -->
      <div class="cart-header">
        <h2>{{ t("general.Cart") }}</h2>
        <a-button v-if="cartItems.length > 0" danger @click="handleClearCart">
          {{ t("general.Clear") }}
        </a-button>
      </div>

      <!-- Empty State -->
      <a-empty v-if="cartItems.length === 0" :description="t('product.No items in cart')">
        <a-button type="primary" @click="goToStore">
          {{ t("product.Go to Product Store") }}
        </a-button>
      </a-empty>

      <!-- Cart Table -->
      <a-table
        v-else
        :columns="columns"
        :data-source="cartItems"
        :pagination="false"
        :row-key="(record: any) => `${record.owner}-${record.name}`"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'product'">
            <div class="product-info">
              <img
                v-if="record.product?.image"
                :src="record.product.image"
                :alt="record.product.name"
                class="product-image"
              />
              <div v-else class="product-image-placeholder">
                <shopping-outlined />
              </div>
              <div class="product-details">
                <span class="product-name">{{ record.product?.displayName || record.product?.name }}</span>
                <span class="product-price">
                  {{ record.product?.currency || 'USD' }} {{ record.product?.price }}
                </span>
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'quantity'">
            <a-input-number
              v-model:value="record.quantity"
              :min="1"
              :max="record.product?.quantity"
              @change="(value: any) => handleQuantityChange(record, value)"
            />
          </template>
          <template v-else-if="column.key === 'subtotal'">
            <span class="subtotal">
              {{ record.product?.currency || 'USD' }} {{ (record.product?.price || 0) * (record.quantity || 0) }}
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-popconfirm
              :title="t('general.Are you sure to delete?')"
              @confirm="handleRemoveItem(record)"
            >
              <a-button danger size="small">
                <delete-outlined />
              </a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>

      <!-- Cart Footer -->
      <div v-if="cartItems.length > 0" class="cart-footer">
        <div class="cart-total">
          <span>{{ t("product.Total") }}:</span>
          <span class="total-amount">{{ totalAmount }}</span>
        </div>
        <a-button type="primary" size="large" @click="handlePlaceOrder" :loading="isPlacingOrder">
          {{ t("product.Place Order") }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { ShoppingOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import { useAuthStore } from "@/stores/auth";
import * as UserApi from "@/api/modules/user";
import * as OrderApi from "@/api/modules/order";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const isPlacingOrder = ref(false);
const cartItems = ref<any[]>([]);
const user = ref<any>(null);

const columns = [
  {
    title: t("product.Product"),
    key: "product",
    width: "40%",
  },
  {
    title: t("product.Quantity"),
    key: "quantity",
    width: "20%",
  },
  {
    title: t("product.Subtotal"),
    key: "subtotal",
    width: "20%",
  },
  {
    title: t("general.Action"),
    key: "action",
    width: "20%",
  },
];

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const price = item.product?.price || 0;
    const quantity = item.quantity || 0;
    return sum + price * quantity;
  }, 0).toFixed(2);
});

const fetchCart = async () => {
  loading.value = true;
  try {
    const userOwner = authStore.account?.owner;
    const userName = authStore.account?.name;
    if (!userOwner || !userName) {
      message.error(t("general.User not found"));
      return;
    }
    
    const userData = await UserApi.getUser(userOwner, userName);
    if (userData) {
      user.value = userData;
      cartItems.value = (userData.cart || []).map((item: any) => ({
        ...item,
        quantity: item.quantity || 1,
      }));
    }
  } catch (error) {
    message.error(t("general.Failed to connect to server"));
  } finally {
    loading.value = false;
  }
};

const handleQuantityChange = async (record: any, value: number) => {
  if (!user.value) return;
  
  const updatedUser = { ...user.value };
  const cart = updatedUser.cart || [];
  const index = cart.findIndex(
    (item: any) => item.owner === record.owner && item.name === record.name
  );
  
  if (index !== -1) {
    cart[index].quantity = value;
    updatedUser.cart = cart;
    
    try {
      await UserApi.updateUser(updatedUser.owner, updatedUser.name, updatedUser);
      const updatedItem = cartItems.value.find(
        (item) => item.owner === record.owner && item.name === record.name
      );
      if (updatedItem) {
        updatedItem.quantity = value;
      }
    } catch (error) {
      message.error(t("general.Failed to update quantity"));
    }
  }
};

const handleRemoveItem = async (record: any) => {
  if (!user.value) return;
  
  const updatedUser = { ...user.value };
  const cart = (updatedUser.cart || []).filter(
    (item: any) => !(item.owner === record.owner && item.name === record.name)
  );
  updatedUser.cart = cart;
  
  try {
    await UserApi.updateUser(updatedUser.owner, updatedUser.name, updatedUser);
    cartItems.value = cartItems.value.filter(
      (item) => !(item.owner === record.owner && item.name === record.name)
    );
    message.success(t("general.Successfully deleted"));
  } catch (error) {
    message.error(t("general.Failed to delete"));
  }
};

const handleClearCart = async () => {
  if (!user.value) return;
  
  const updatedUser = { ...user.value };
  updatedUser.cart = [];
  
  try {
    await UserApi.updateUser(updatedUser.owner, updatedUser.name, updatedUser);
    cartItems.value = [];
    message.success(t("general.Successfully deleted"));
  } catch (error) {
    message.error(t("general.Failed to delete"));
  }
};

const handlePlaceOrder = async () => {
  if (isPlacingOrder.value) return;
  
  const invalidItems = cartItems.value.filter((item) => item.isInvalid);
  if (invalidItems.length > 0) {
    message.error(t("product:Cart contains invalid products, please delete them before placing an order"));
    return;
  }
  
  isPlacingOrder.value = true;
  try {
    const orderData = {
      owner: authStore.account?.owner,
      name: `order_${Date.now()}`,
      createdTime: new Date().toISOString(),
      userOwner: authStore.account?.owner,
      userName: authStore.account?.name,
      products: cartItems.value.map((item) => ({
        owner: item.owner,
        name: item.name,
        displayName: item.product?.displayName || item.product?.name,
        price: item.product?.price,
        quantity: item.quantity,
      })),
    };
    
    const result = await OrderApi.createOrder(orderData);
    if (result) {
      // Clear cart after successful order
      const updatedUser = { ...user.value };
      updatedUser.cart = [];
      await UserApi.updateUser(updatedUser.owner, updatedUser.name, updatedUser);
      cartItems.value = [];
      
      message.success(t("general.Successfully created"));
      router.push(`/order-pay?orderId=${result.name}`);
    }
  } catch (error) {
    message.error(t("general.Failed to create"));
  } finally {
    isPlacingOrder.value = false;
  }
};

const goToStore = () => {
  router.push("/product-store");
};

onMounted(() => {
  fetchCart();
});
</script>

<style scoped lang="less">
.cart-list-container {
  padding: 24px;
  background: var(--kx-bg-card, #fff);
  border-radius: 8px;
}

.cart-header {
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

.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.product-image-placeholder {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 24px;
  color: #999;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 500;
}

.product-price {
  color: #666;
}

.subtotal {
  font-weight: 600;
  color: #1890ff;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.cart-total {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  
  .total-amount {
    font-size: 24px;
    font-weight: 600;
    color: #1890ff;
  }
}
</style>