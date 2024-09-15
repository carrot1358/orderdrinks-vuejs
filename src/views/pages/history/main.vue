<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { Order_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import { useDisplay } from 'vuetify'
import MoreDetailOrder from './MoreDetailOrder.vue';
import { usePaymentStore } from '@/stores/paymentStore';

const { mdAndUp, lgAndUp } = useDisplay()

const orders = ref([]);
const selectedOrder = ref(null);
const showDetailDialog = ref(false);
const loading = ref(true);
const paymentStatusFilter = ref([]);
const deliveryStatusFilter = ref([]);

const paymentStatusOptions = [

  { title: 'ชำระแล้ว', value: 'paid' },
  { title: 'ยังไม่ชำระ', value: 'not_paid' },
  { title: 'ยกเลิก', value: 'cancel' }
];

const deliveryStatusOptions = [

  { title: 'รอดำเนินการ', value: 'pending' },
  { title: 'กำลังจัดส่ง', value: 'delivering' },
  { title: 'จัดส่งแล้ว', value: 'delivered' },
  { title: 'ยกเลิก', value: 'cancel' }
];

const Api_URL = import.meta.env.VITE_API_URL;

const fetchOrders = async () => {
  try {
    loading.value = true;
    const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    const response = await axios.get(Order_ENDPOINTS.getOrderByUser, {
      headers: {
        authorization: `Bearer ${jwtToken}`,
      },
    });
    orders.value = response.data.data;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
};

const showOrderDetail = (order) => {
  selectedOrder.value = order;
  showDetailDialog.value = true;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'paid':
    case 'completed':
      return 'success';
    case 'pending':
    case 'delivering':
      return 'warning';
    case 'wait_paid':
      return 'info';
    case 'not_paid':
    case 'cancel':
    case 'cancelled':
      return 'error';
    default:
      return 'info';
  }
};

const translateStatus = (status) => {
  const statusMap = {
    'paid': 'ชำระแล้ว',
    'completed': 'เสร็จสิ้น',
    'pending': 'รอดำเนินการ',
    'delivering': 'กำลังจัดส่ง',
    'not_paid': 'ยังไม่ชำระ',
    'cancel': 'ยกเลิก',
    'wait_paid': 'รอชำระ',
    'cancelled': 'ยกเลิกแล้ว',
    'delivered': 'จัดส่งแล้ว'
  };
  return statusMap[status] || status;
};

const filteredOrders = computed(() => {
  return orders.value
    .filter(order => {
      const paymentMatch = paymentStatusFilter.value.length === 0 ||
        paymentStatusFilter.value.includes('all') ||
        paymentStatusFilter.value.includes(order.statusPaid);
      const deliveryMatch = deliveryStatusFilter.value.length === 0 ||
        deliveryStatusFilter.value.includes('all') ||
        deliveryStatusFilter.value.includes(order.deliverStatus);
      return paymentMatch && deliveryMatch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // เรียงลำดับตามวันที่สร้าง จากใหม่ไปเก่า
});

onMounted(fetchOrders);

const headers = computed(() => [
  { title: 'วันที่สั่งซื้อ', key: 'createdAt', align: 'center' },
  { title: 'ราคารวม', key: 'totalPrice', align: 'end' },
  { title: 'สถานะการชำระเงิน', key: 'statusPaid', align: 'center' },
  { title: 'การดำเนินการ', key: 'actions', align: 'center', sortable: false }
])

const updateShowDetailDialog = (value) => {
  showDetailDialog.value = value;
  if (!value) {
    // Dialog was closed, refresh orders
    fetchOrders();
  }
};

const paymentStore = usePaymentStore();
</script>

<template>
  <v-container fluid>
    <v-card class="order-history-card">
      <v-card-title class="text-h4 font-weight-bold pa-6">
        <v-icon large left class="mr-2">mdi-history</v-icon>
        ประวัติการสั่งซื้อ
      </v-card-title>

      <v-card-text>
        <v-row class="mb-4">
          <v-col cols="12" sm="6" md="4">
            <v-select v-model="paymentStatusFilter" :items="paymentStatusOptions" label="สถานะการชำระ" outlined dense
              multiple chips clearable></v-select>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select v-model="deliveryStatusFilter" :items="deliveryStatusOptions" label="สถานะการจัดส่ง" outlined
              dense multiple chips clearable></v-select>
          </v-col>
        </v-row>

        <v-skeleton-loader v-if="loading" type="table" class="mb-6"></v-skeleton-loader>

        <v-data-table v-else :headers="headers" :items="filteredOrders" :loading="loading" class="elevation-1"
          :sort-by="[{ key: 'createdAt', order: 'desc' }]">
          <template v-slot:item.createdAt="{ item }">
            <v-chip :color="new Date(item.createdAt) > new Date(Date.now() - 86400000) ? 'success' : 'default'" label>
              {{ formatDate(item.createdAt) }}
            </v-chip>
          </template>

          <template v-slot:item.totalPrice="{ item }">
            <v-chip color="primary" label>
              {{ item.totalPrice.toLocaleString() }} บาท
            </v-chip>
          </template>

          <template v-slot:item.statusPaid="{ item }">
            <v-chip :color="getStatusColor(item.deliverStatus === 'cancel' ? 'cancel' : item.statusPaid)" label>
              {{ translateStatus(item.deliverStatus === 'cancel' ? 'cancel' : item.statusPaid) }}
            </v-chip>
          </template>

          <template v-slot:item.deliverStatus="{ item }">
            <v-chip :color="getStatusColor(item.deliverStatus)" label>
              {{ translateStatus(item.deliverStatus) }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn color="primary" variant="tonal" @click="showOrderDetail(item)" size="small">
              รายละเอียด
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <MoreDetailOrder :showDialog="showDetailDialog" :selectedOrder="selectedOrder"
      :qrCodePayment="paymentStore.qrCodePayment" @update:showDialog="updateShowDetailDialog"
      @orderUpdated="fetchOrders" />
  </v-container>
</template>

<style scoped>
.order-history-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

:deep(.v-data-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.v-data-table__wrapper > table) {
  border-spacing: 0;
  border-collapse: separate;
}

:deep(tbody tr) {
  transition: background-color 0.2s, transform 0.2s;
}

:deep(tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.05);
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  :deep(.v-data-table__wrapper) {
    overflow-x: auto;
  }
}

.order-detail-card {
  border-radius: 8px;
  overflow: hidden;
}

.order-detail-card .v-card__title {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.order-detail-card .v-card__text {
  padding-top: 20px;
}

.v-list-item {
  padding: 0;
}

.v-avatar {
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.v-simple-table {
  background-color: transparent !important;
}

.v-simple-table th {
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.875rem;
}

.v-simple-table td {
  height: 60px;
  vertical-align: middle;
}

.product-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.product-row:last-child {
  border-bottom: none;
}

.v-avatar {
  margin-right: 12px;
}

.v-chip {
  font-weight: 500;
}

.v-skeleton-loader {
  border-radius: 8px;
  overflow: hidden;
}
</style>