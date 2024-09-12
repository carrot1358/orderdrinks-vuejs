<script setup>
import { ref } from 'vue';
import GiveDetailDeliver from '@/views/pages/ordering/giveDetailDeliver.vue';
import { useOrderStore } from '@/stores/orderStore';
import { usePaymentStore } from '@/stores/paymentStore';

const VITE_API_URL = import.meta.env.VITE_API_URL;

const props = defineProps({
  cartVisible: Boolean,
  closeCart: Function,
  totalPrice: Number,
  removeFromCart: Function,
});

const orderStore = useOrderStore();
const paymentStore = usePaymentStore();

const increaseQuantity = (index) => {
  orderStore.increaseQuantity(index);
};

const decreaseQuantity = (index) => {
  orderStore.decreaseQuantity(index);
};

const showDetailDeliver = ref(false);

const handleOrderClick = async () => {
  await paymentStore.generateQR(props.totalPrice);
  showDetailDeliver.value = true;
  props.closeCart();
};

const closeDetailDeliver = () => {
  showDetailDeliver.value = false;
};

const removeFromCart = (index) => {
  props.removeFromCart(index);
  if (orderStore.cartList.length === 0) {
    props.closeCart();
  }
};
</script>

<template>
  <v-bottom-sheet v-model="props.cartVisible" max-width="100%" persistent>
    <v-card max-width="900" class="cart-card mx-auto">
      <v-card-title class="cart-title">ตะกร้าสินค้า</v-card-title>
      <v-card-text class="cart-content">
        <div class="cart-items">
          <v-card v-for="(product, index) in orderStore.cartList" :key="product.productId" class="product-card mb-3" flat>
            <v-row no-gutters align="center">
              <v-col cols="3">
                <v-img :src="product.imagePath ? `${VITE_API_URL}${product.imagePath}` : ''" height="80" contain class="bg-grey-lighten-2"></v-img>
              </v-col>
              <v-col cols="9">
                <v-card-text>
                  <div class="text-subtitle-1 font-weight-medium">{{ product.name }}</div>
                  <div class="text-body-2 text-grey">ราคา: {{ product.price }} บาท</div>
                  <div class="d-flex align-center mt-2">
                    <v-btn icon="mdi-minus" size="small" color="primary" variant="text" @click="decreaseQuantity(index)"></v-btn>
                    <span class="mx-2 text-body-1">{{ product.quantity }}</span>
                    <v-btn icon="mdi-plus" size="small" color="primary" variant="text" @click="increaseQuantity(index)"></v-btn>
                    <v-spacer></v-spacer>
                    <v-btn icon="mdi-delete" size="small" color="error" variant="text" @click="props.removeFromCart(index)"></v-btn>
                  </div>
                </v-card-text>
              </v-col>
            </v-row>
          </v-card>
        </div>
      </v-card-text>
      <v-card-actions class="cart-actions">
        <v-row class="d-flex justify-center align-center mb-2">
          <h3>ราคารวม : {{ totalPrice }} บาท</h3>
        </v-row>
        <v-row>
          <v-col>
            <v-btn color="primary" block @click="handleOrderClick">สั่งซื้อ</v-btn>
          </v-col>
          <v-col>
            <v-btn text block @click="props.closeCart" color="error">ปิด</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>

  <GiveDetailDeliver
    v-model="showDetailDeliver"
    :qrCodePayment="paymentStore.qrCodePayment"
    :closeDetailDeliver="closeDetailDeliver"
    :cartList="orderStore.cartList"
  />
</template>

<style scoped>
.v-bottom-sheet {
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.cart-card {
  display: flex;
  flex-direction: column;
  height: 80vh; /* ปรับความสูงตามต้องการ */
  max-height: 600px; /* กำหนดความสูงสูงสุด */
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

.cart-title {
  flex-shrink: 0;
  padding: 16px;
  background-color: #f5f5f5;
  font-weight: bold;
}

.cart-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
}

.cart-items {
  padding-bottom: 16px;
}

.product-card {
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 0;
}

.product-card:last-child {
  border-bottom: none;
}

.cart-actions {
  flex-shrink: 0;
  padding: 16px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
}

/* ปรับแต่งปุ่มเพิ่ม/ลด */
.v-btn.v-btn--icon.v-btn--size-small {
  width: 28px;
  height: 28px;
}

/* ปรับแต่งข้อความจำนวน */
.text-body-1 {
  min-width: 24px;
  text-align: center;
}
</style>