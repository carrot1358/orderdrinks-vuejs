<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Order_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import DeliverList from '@/views/pages/deliver/DeliverList.vue';
import { useWebSocket } from '@/assets/config/websocket/websocket'
import { Websocket_URL_Frontend } from '@/assets/config/api/websocket_endPoints'
import { VSkeletonLoader } from 'vuetify/components';
import Swal from 'sweetalert2';

const orders = ref([]);
const loading = ref(false);

const userInfo = ref(JSON.parse(localStorage.getItem('userinfo') || sessionStorage.getItem('userinfo') || '{}'))
const { isConnected, lastMessage, error, send } = useWebSocket(`${Websocket_URL_Frontend}${userInfo.value.userId}`, {
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 20000,
  heartbeatMessage: JSON.stringify({ type: 'ping' })
})
watch(lastMessage, (newMessage) => {
  if (newMessage && newMessage.sendto === 'both' && newMessage.body.latitude && newMessage.body.longitude) {
    updateDistance()
  }
})

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
    orders.value = []
  } finally {
    loading.value = false;
  }
};

const updateDistance = async () => {
  const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
  try {
    const response = await axios.get(Order_ENDPOINTS.getOderDelivery, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    orders.value = response.data.data;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัพเดทระยะทาง:', error);
  }
}

const prepareOrder = async () => {
  Swal.fire({
    title: 'ต้องการเตรียมจัดส่งสินค้าหรือไม่?',
    text: "การเตรียมจัดส่งสินค้าจะทำให้สถานะของคำสั่งซื้อของลูกค้าถูกเปลี่ยนเป็นกำลังจัดส่ง",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'เตรียมจัดส่งสินค้า',
  }).then((result) => {
    if (result.isConfirmed) {
      const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
      try {
        axios.post(Order_ENDPOINTS.prepareOrder, {}, {
          headers: {
            'Authorization': `Bearer ${jwtToken}`
          }
        }).then((response) => {
          if (response.status === 200) {
            Swal.fire('สำเร็จ!', 'คำสั่งซื้อถูกเตรียมจัดส่งสำเร็จ', 'success', {
              timer: 1500
            });
            fetchOrders();
          }
        }).catch((error) => {
          Swal.fire('ผิดพลาด!', error.response.data.message, 'error', {
            timer: 1500
          });
        });
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการเตรียมจัดส่งสินค้า:', error);
      }
    }
  });
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
        <v-alert type="info" v-if="orders.length === 0">
          ไม่พบคำสั่งซื้อที่ต้องการจัดส่ง
        </v-alert>
        <DeliverList :orders="orders" :loading="loading" @refresh="fetchOrders" />
      </v-card-text>
    </v-card>
  </v-container>
</template>