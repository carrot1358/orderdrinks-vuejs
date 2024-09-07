<script setup>
import { ref, computed, onMounted } from 'vue';
import OrderDialog from '@/views/pages/ordering/OrderDialog.vue';
import CartBottomSheet from '@/views/pages/ordering/CartBottomSheet.vue';
import { useProductStore } from '@/stores/productStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { useOrderStore } from '@/stores/orderStore';
import animationData from '@/assets/lottie/lottieFile/nodata.json';

const productStore = useProductStore();
const paymentStore = usePaymentStore();
const orderStore = useOrderStore();

const cartVisible = ref(false);
const buttonCartVisible = computed(() => orderStore.cartList.length > 0);
const lookingOrdering = ref(false);
const lookingProduct = ref({});

const isProductsEmpty = computed(() => productStore.products.length === 0);

const VITE_API_URL = import.meta.env.VITE_API_URL;

onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    paymentStore.fetchPaymentAdminDetails()
  ]);
});

const totalPrice = computed(() => orderStore.getTotalPrice);

const clickOrder = (product) => {
  lookingOrdering.value = true;
  lookingProduct.value = { ...product, quantity: 1, id: product.productId };
};

const closeDialog = () => {
  lookingOrdering.value = false;
};

const addToCart = (product) => {
  orderStore.addToCart({ ...product });
  buttonCartVisible.value = true;
  lookingOrdering.value = false;
};

const removeFromCart = (index) => {
  orderStore.removeFromCart(index);
  if (orderStore.cartList.length === 0) {
    buttonCartVisible.value = false;
    cartVisible.value = false;
  }
};

const closeCart = () => {
  cartVisible.value = false;
};
</script>

<template>
  <OrderDialog
    :lookingOrdering="lookingOrdering"
    :lookingProduct="lookingProduct"
    :addToCart="addToCart"
    :closeDialog="closeDialog"
  />

  <CartBottomSheet
    :cartVisible="cartVisible"
    :closeCart="closeCart"
    :totalPrice="totalPrice"
    :removeFromCart="removeFromCart"
  />

  <VCard class="align-content-center justify-center text-center pa-2 pb-8 center">
    <VCardTitle><h1>สั่งซื้อสินค้า</h1></VCardTitle>
    <VRow class="align-content-center justify-center">
      <div v-for="(product, index) in productStore.products" :key="index">
        <VCol>
          <VCard class="ma-1 pa-3">
            <VCardTitle>{{ product.name }}</VCardTitle>
            <VImg>
              <img class="rounded" :src="VITE_API_URL + product.imagePath" :alt="product.name">
            </VImg>
            <VBtn color="primary" @click="clickOrder(product)">สั่ง</VBtn>
          </VCard>
        </VCol>
      </div>
    </VRow>
    <VRow v-if="isProductsEmpty">
      <Vue3Lottie :animationData="animationData" :height="400" :width="400"/>
    </VRow>
  </VCard>

  <v-btn icon large class="cart-button" @click="cartVisible = true" v-if="buttonCartVisible">
    <v-icon>mdi-cart</v-icon>
  </v-btn>
</template>

<style scoped>
.cart-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}
</style>
