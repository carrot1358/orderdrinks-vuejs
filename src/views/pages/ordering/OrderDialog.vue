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

const setQuantity = (value) => {
  quantity.value = value;
};

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

const handleCloseDialog = () => {
  props.closeDialog();
  setTimeout(() => {
    quantity.value = 1;
  }, 500);
};
</script>

<template>
  <v-dialog v-model="props.lookingOrdering" max-width="500" persistent>
    <v-card class="text-center pa-4">
      <v-card-title>
        <h3>สั่งซื้อ : {{ props.lookingProduct.name }}</h3>
      </v-card-title>
      <v-img :src="VITE_API_URL + props.lookingProduct.imagePath" :alt="props.lookingProduct.name" class="mb-4"
        height="200" max-width="100%"></v-img>
      <v-row class="mt-4 justify-center align-center">
        <v-col cols="12" sm="8" md="6">
          <v-card-text class="quantity-control pa-2">
            <v-btn icon="mdi-minus" variant="text" @click="decreaseQuantity(1)" :disabled="quantity <= 1"></v-btn>
            <span class="quantity-display mx-4">{{ quantity }}</span>
            <v-btn icon="mdi-plus" variant="text" @click="increaseQuantity(1)"></v-btn>
          </v-card-text>
        </v-col>
      </v-row>
      <v-row class="justify-center mt-2">
        <v-col cols="auto">
          <v-btn-group variant="outlined">
            <v-btn @click="setQuantity(5)">5</v-btn>
            <v-btn @click="setQuantity(10)">10</v-btn>
            <v-btn @click="setQuantity(20)">20</v-btn>
          </v-btn-group>
        </v-col>
      </v-row>
      <v-card-text>
        <p>ราคา: {{ props.lookingProduct.price * quantity }} บาท</p>
      </v-card-text>
      <v-card-actions class="text-center justify-center">
        <v-btn color="primary" @click="handleAddToCart">เพิ่มเข้าตะกร้า</v-btn>
        <v-btn color="error" @click="handleCloseDialog">ยกเลิก</v-btn>
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

.v-btn {
  margin: 0 2px;
}

.quantity-control {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.quantity-display {
  font-size: 1.2rem;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
}
</style>