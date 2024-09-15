<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Order_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import DeliverList from '@/views/pages/deliver/DeliverList.vue';
import { VSkeletonLoader } from 'vuetify/components';

const orders = ref([]);
const loading = ref(false);

const fetchOrders = async () => {
  loading.value = true;
  const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
  try {
    const response = await axios.get(Order_ENDPOINTS.getOderDelivery, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    orders.value = response.data.data;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ:', error);
  } finally {
    loading.value = false;
  }
};

const prepareOrder = async () => {
  const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
  try {
    await axios.post(Order_ENDPOINTS.prepareOrder, {}, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    await fetchOrders();
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเตรียมจัดส่งสินค้า:', error);
  }
};

onMounted(fetchOrders);
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-btn color="primary" @click="prepareOrder" :loading="loading">
          เตรียมจัดส่งสินค้า
        </v-btn>
      </v-col>
    </v-row>
    <v-card class="mt-5">
      <v-card-text>
        <DeliverList :orders="orders" :loading="loading" @refresh="fetchOrders" />
      </v-card-text>
    </v-card>
  </v-container>
</template>