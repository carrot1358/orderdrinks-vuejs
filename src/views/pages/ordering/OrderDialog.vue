<script setup>
import { ref } from 'vue';

const props = defineProps({
  lookingOrdering: Boolean,
  lookingProduct: Object,
  increaseQuantity: Function,
  decreaseQuantity: Function,
  addToCart: Function,
  closeDialog: Function,
});
</script>

<template>
  <v-dialog v-model="props.lookingOrdering" max-width="500" persistent>
    <v-card class="text-center">
      <v-card-title>
        <h1>สั่งซื้อ : {{ props.lookingProduct.name }}</h1>
      </v-card-title>
      <v-img :src="props.lookingProduct.image" alt="Placeholder" class="mb-4" height="200" max-width="100%"></v-img>
      <v-row class="pt-3 text-center align-content-center justify-center">
        <v-btn @click="props.decreaseQuantity">-</v-btn>
        <span class="border px-10 text-center justify-center align-content-center mx-1">{{ props.lookingProduct.quantity }}</span>
        <v-btn @click="props.increaseQuantity">+</v-btn>
      </v-row>
      <v-card-text>
        <p>ราคา: {{ props.lookingProduct.price * props.lookingProduct.quantity }} บาท</p>
      </v-card-text>
      <v-card-actions class="text-center justify-center">
        <v-btn color="primary">สั่งซื้อ</v-btn>
        <v-btn color="warning" @click="props.addToCart(props.lookingProduct)">เพิ่มเข้าตะกร้า</v-btn>
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
