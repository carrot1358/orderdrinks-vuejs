<script setup>
import { ref } from 'vue';
import AddProduct from '@/views/pages/productManage/AddProduct.vue';
import ProductList from '@/views/pages/productManage/ProductList.vue';
import { inject } from 'vue';

const $swal = inject('$swal');

const showAddProductDialog = ref(false);
const productListRef = ref(null);

const openAddProductDialog = () => {
  showAddProductDialog.value = true;
};

const closeAddProductDialog = () => {
  showAddProductDialog.value = false;
};

const handleProductAdded = () => {
  closeAddProductDialog();
  if (productListRef.value) {
    productListRef.value.fetchProducts();
  }
};

const fetchProducts = () => {
  if (productListRef.value) {
    productListRef.value.fetchProducts();
  }
};
</script>

<template>
  <VCard>
    <VCardTitle>จัดการสินค้า</VCardTitle>
    <VCardText>
      <VBtn color="primary" @click="openAddProductDialog" class="mb-4">เพิ่มสินค้า</VBtn>

      <VDialog v-model="showAddProductDialog" max-width="500px">
        <AddProduct 
          :onClose="closeAddProductDialog" 
          :onProductAdded="handleProductAdded"
          :swal="$swal"
        />
      </VDialog>

      <ProductList ref="productListRef" :fetchProducts="fetchProducts" />
    </VCardText>
  </VCard>
</template>

<style scoped>
.swal-on-top {
  z-index: 9999 !important;
}
</style>