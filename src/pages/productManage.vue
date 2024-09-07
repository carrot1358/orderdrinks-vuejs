<script setup>
import { ref } from 'vue';
import AddProduct from '@/views/pages/productManage/AddProduct.vue';
import ProductList from '@/views/pages/productManage/ProductList.vue';
import { inject } from 'vue';
import { VContainer, VRow, VCol } from 'vuetify/components';

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
  <VCard class="product-manage-card">
    <VCardTitle class="text-h4 font-weight-bold pa-6">
      <v-icon large left>mdi-package-variant</v-icon>
      จัดการสินค้า
    </VCardTitle>
    <VCardText>
      <VContainer>
        <VRow>
          <VCol cols="12" sm="6" md="4">
            <VBtn 
              color="primary" 
              @click="openAddProductDialog" 
              class="mb-4"
              block
              elevation="2"
              prepend-icon="mdi-plus"
            >
              เพิ่มสินค้า
            </VBtn>
          </VCol>
        </VRow>

        <VDialog v-model="showAddProductDialog" max-width="500px">
          <AddProduct 
            :onClose="closeAddProductDialog" 
            :onProductAdded="handleProductAdded"
            :swal="$swal"
          />
        </VDialog>

        <ProductList ref="productListRef" :fetchProducts="fetchProducts" />
      </VContainer>
    </VCardText>
  </VCard>
</template>

<style scoped>
.product-manage-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.swal-on-top {
  z-index: 9999 !important;
}
</style>