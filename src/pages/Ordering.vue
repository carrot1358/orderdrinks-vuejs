<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import animationData from '@/assets/lottie/lottieFile/noData.json';
import OrderDialog from '@/views/pages/ordering/OrderDialog.vue';
import CartBottomSheet from '@/views/pages/ordering/CartBottomSheet.vue';
import IfNonAddress from '@/views/pages/ordering/ifNonAddress.vue';
import { useProductStore } from '@/stores/productStore';
import { usePaymentStore } from '@/stores/paymentStore';
import { useOrderStore } from '@/stores/orderStore';
import { User_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import axios from 'axios';
import Swal from 'sweetalert2';

const productStore = useProductStore();
const paymentStore = usePaymentStore();
const orderStore = useOrderStore();

const userInfo = JSON.parse(localStorage.getItem('userinfo') || sessionStorage.getItem('userinfo') || '{}');
const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

const Urlapi = import.meta.env.VITE_API_URL;
const UrlWs = import.meta.env.VITE_WEBSOCKET_URL;
const UrlLongdoMap = import.meta.env.VITE_LONGDO_MAP_API_KEY;

const cartVisible = ref(false);
const buttonCartVisible = computed(() => orderStore.cartList.length > 0);
const lookingOrdering = ref(false);
const lookingProduct = ref({});
const showAddressDialog = ref(false);
const userProfile = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  lat: '',
  lng: ''
});

const isProductsEmpty = computed(() => productStore.products.length === 0);

const VITE_API_URL = import.meta.env.VITE_API_URL;

onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    paymentStore.fetchPaymentAdminDetails(),
    checkUserAddress()
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

const checkUserAddress = async () => {
  try { 
    const response = await axios.get(`${User_ENDPOINTS.getProfile}`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    userProfile.value = response.data.data;
    console.log(userProfile.value);
    console.log('userProfile.value.lat', userProfile.value.lat);
    console.log('userProfile.value.lng', userProfile.value.lng);
    console.log('userProfile.value.address', userProfile.value.address);
    console.log('userProfile.value.phone', userProfile.value.phone);
    console.log('userProfile.value.lineAvatar', userProfile.value.lineAvatar);
    
    
    if (!userProfile.value.lat || !userProfile.value.lng || !userProfile.value.address || userProfile.value.phone === "ยังไม่ได้ระบุ") {
      await nextTick();
      showAddressDialog.value = true;
      console.log("Setting showAddressDialog to true", showAddressDialog.value);
    }

    console.log("showAddressDialog", showAddressDialog.value);
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง',
    });
  }
};

const updateUserInfo = async (updatedInfo) => {
  try {
    const userID = userInfo.userId;
    const formData = new FormData();

    // Add updated fields to formData
    Object.keys(updatedInfo).forEach(key => {
      if (updatedInfo[key] !== undefined && updatedInfo[key] !== null) {
        formData.append(key, updatedInfo[key]);
      }
    });

    // Check if lineAvatar exists and convert it to a file
    if (userProfile.value && userProfile.value.lineAvatar) {
      const avatarFile = await urlToFile(userProfile.value.lineAvatar, 'avatar.jpg');
      formData.append('avatar', avatarFile);
    }

    const response = await axios.put(`${User_ENDPOINTS.updateUser}${userID}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'authorization': `Bearer ${jwtToken}`
      },
    });

    if (response.data.success) {
      showAddressDialog.value = false;
      await checkUserAddress();
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'อัพเดทข้อมูลสำเร็จ',
        text: response.data.message,
      });
    } else {
      throw new Error(response.data.message || 'Failed to update user info');
    }
  } catch (error) {
    console.error('Error updating user info:', error);
    // Show error message
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: error.response?.data?.message || error.message || 'ไม่สามารถอัพเดทข้อมูลได้ กรุณาลองใหม่อีกครั้ง',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    setTimeout(() => {
      showAddressDialog.value = true;
    }, 2000);
  }
};

const urlToFile = async (url, filename) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

// Add a watcher for showAddressDialog
watch(showAddressDialog, (newValue) => {
  console.log("showAddressDialog changed:", newValue);
});

console.log('All env variables:', import.meta.env);
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

  <IfNonAddress
    v-if="showAddressDialog"
    v-model="showAddressDialog"
    :userProfile="userProfile"
    @update-user-info="updateUserInfo"
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
      <v-col cols="12" class="text-center">
        <Vue3Lottie
          :animationData="animationData"
          :height="400"
          :width="400"
        />
        <h2 class="mt-4">ไม่มีสินค้าในขณะนี้</h2>
      </v-col>
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
