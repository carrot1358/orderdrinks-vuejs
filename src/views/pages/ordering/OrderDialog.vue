<script setup>
import { ref } from 'vue';
const VITE_API_URL = import.meta.env.VITE_API_URL;

const props = defineProps({
  lookingOrdering: Boolean,
  lookingProduct: Object,
  addToCart: Function,
  closeDialog: Function,
});

const quantity = ref(1);

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const handleAddToCart = () => {
  props.addToCart({ ...props.lookingProduct, quantity: quantity.value });
  props.closeDialog();
  setTimeout(() => {
    quantity.value = 1;
  }, 1000); // 1000 มิลลิวินาที = 1 วินาที
};
</script>

<template>
  <v-dialog v-model="props.lookingOrdering" max-width="500" persistent>
    <v-card class="text-center">
      <v-card-title>
        <h3>สั่งซื้อ : {{ props.lookingProduct.name }}</h3>
      </v-card-title>
      <v-img :src="VITE_API_URL + props.lookingProduct.imagePath" :alt="props.lookingProduct.name" class="mb-4" height="200" max-width="100%"></v-img>
      <v-row class="pt-3 text-center align-content-center justify-center">
        <v-btn @click="decreaseQuantity">-</v-btn>
        <span class="border px-10 text-center justify-center align-content-center mx-1">{{ quantity }}</span>
        <v-btn @click="increaseQuantity">+</v-btn>
      </v-row>
      <v-card-text>
        <p>ราคา: {{ props.lookingProduct.price * quantity }} บาท</p>
      </v-card-text>
      <v-card-actions class="text-center justify-center">
        <v-btn color="primary" @click="handleAddToCart">เพิ่มเข้าตะกร้า</v-btn>
        <v-btn color="error" @click="props.closeDialog">ยกเลิก</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.v-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>