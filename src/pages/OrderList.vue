<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Order_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import MoreDetailDialog from '@/views/pages/orderList/MoreDetailDialog.vue';

const orders = ref([]);
const loading = ref(true);
const error = ref(null);
const showDetailDialog = ref(false);
const selectedOrder = ref(null);

const fetchOrders = async () => {
    const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    try {
        const response = await axios.get(Order_ENDPOINTS.getOrders, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        });
        orders.value = response.data.data;
        loading.value = false;
    } catch (err) {
        error.value = 'เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ';
        loading.value = false;
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ:', err);
    }
};

onMounted(fetchOrders);

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('th-TH', options);
};

const getStatusColor = (status) => {
  switch (status) {
    case 'paid':
    case 'delivered':
      return 'success';
    case 'not_paid':
    case 'cancel':
      return 'error';
    case 'check_paid':
    case 'delivering':
      return 'info';
    case 'wait_paid':
    case 'pending':
      return 'warning';
    default:
      return 'grey';
  }
};

const getStatusText = (status, type) => {
  if (type === 'statusPaid') {
    switch (status) {
      case 'paid': return 'ชำระเงินแล้ว';
      case 'not_paid': return 'ยังไม่ชำระเงิน';
      case 'check_paid': return 'ตรวจสอบการชำระเงิน';
      case 'wait_paid': return 'รอชำระเงิน';
      case 'error': return 'เกิดข้อผิดพลาด';
      default: return status;
    }
  } else if (type === 'deliverStatus') {
    switch (status) {
      case 'pending': return 'รอดำเนินการ';
      case 'delivering': return 'กำลังจัดส่ง';
      case 'delivered': return 'จัดส่งแล้ว';
      case 'cancel': return 'ยกเลิก';
      default: return status;
    }
  } else if (type === 'methodPaid') {
    switch (status) {
      case 'cash': return 'เงินสด';
      case 'promptpay': return 'พร้อมเพย์';
      default: return status;
    }
  }
  return status;
};

const showOrderDetail = (order) => {
    selectedOrder.value = order;
    showDetailDialog.value = true;
};

const handleOrderUpdated = () => {
  fetchOrders();
};
</script>

<template>
    <v-container>
        <h1 class="text-h4 mb-4">รายการคำสั่งซื้อ</h1>
        <v-card v-if="loading">
            <v-card-text class="text-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <p class="mt-2">กำลังโหลดข้อมูล...</p>
            </v-card-text>
        </v-card>
        <v-card v-else-if="error">
            <v-card-text class="text-center red--text">
                {{ error }}
            </v-card-text>
        </v-card>
        <v-card v-else>
            <v-data-table :headers="[
                { title: 'ชื่อลูกค้า', key: 'userId.name' },
                { title: 'วันที่สั่งซื้อ', key: 'createdAt' },
                { title: 'ราคารวม', key: 'totalPrice' },
                { title: 'วิธีการชำระเงิน', key: 'methodPaid' },
                { title: 'สถานะการชำระเงิน', key: 'statusPaid' },
                { title: 'สถานะการจัดส่ง', key: 'deliverStatus' },
                { title: 'การดำเนินการ', key: 'actions', sortable: false }
            ]" :items="orders" class="elevation-1">
                <template v-slot:item.userId.name="{ item }">
                    {{ item.userId.name }}
                </template>
                <template v-slot:item.createdAt="{ item }">
                    {{ formatDate(item.createdAt) }}
                </template>
                <template v-slot:item.totalPrice="{ item }">
                    {{ item.totalPrice.toLocaleString() }} บาท
                </template>
                <template v-slot:item.methodPaid="{ item }">
                    {{ getStatusText(item.methodPaid, 'methodPaid') }}
                </template>
                <template v-slot:item.statusPaid="{ item }">
                    <v-chip :color="getStatusColor(item.statusPaid)" text-color="white">
                        {{ getStatusText(item.statusPaid, 'statusPaid') }}
                    </v-chip>
                </template>
                <template v-slot:item.deliverStatus="{ item }">
                    <v-chip :color="getStatusColor(item.deliverStatus)" text-color="white">
                        {{ getStatusText(item.deliverStatus, 'deliverStatus') }}
                    </v-chip>
                </template>
                <template v-slot:item.actions="{ item }">
                    <v-btn color="primary" @click="showOrderDetail(item)">
                        แสดงรายละเอียด
                    </v-btn>
                </template>
            </v-data-table>
        </v-card>

        <MoreDetailDialog
          v-model:showDialog="showDetailDialog"
          :selectedOrder="selectedOrder"
          @orderUpdated="handleOrderUpdated"
        />
    </v-container>
</template>
