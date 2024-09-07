<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Order_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import MoreDetailDialog from '@/views/pages/orderList/MoreDetailDialog.vue';
import { VSkeletonLoader } from 'vuetify/components';
import { computed } from 'vue';
import { useDisplay } from 'vuetify';

const { mdAndUp, lgAndUp } = useDisplay();

const orders = ref([]);
const loading = ref(true);
const error = ref(null);
const showDetailDialog = ref(false);
const selectedOrder = ref(null);

const Api_URL = import.meta.env.VITE_API_URL;

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

const getOrderStatusIcon = (status) => {
  switch (status) {
    case 'paid':
    case 'delivered':
      return 'mdi-check-circle';
    case 'not_paid':
    case 'cancel':
      return 'mdi-close-circle';
    case 'check_paid':
    case 'delivering':
      return 'mdi-progress-check';
    case 'wait_paid':
    case 'pending':
      return 'mdi-clock-outline';
    default:
      return 'mdi-help-circle';
  }
};

const showOrderDetail = (order) => {
    selectedOrder.value = order;
    showDetailDialog.value = true;
};

const handleOrderUpdated = () => {
  fetchOrders();
};

const headers = computed(() => [
  { title: 'ชื่อลูกค้า', key: 'userId.name', align: 'start', sortable: true },
  { title: 'วันที่สั่งซื้อ', key: 'createdAt', align: 'center', sortable: true },
  { title: 'ราคา', key: 'totalPrice', align: 'end', sortable: true },
  { title: 'การชำระเงิน', key: 'methodPaid', align: 'center', sortable: true },
  { title: 'การชำระเงิน', key: 'statusPaid', align: 'center', sortable: true },
  { title: 'การจัดส่ง', key: 'deliverStatus', align: 'center', sortable: true },
  { title: ' ', key: 'actions', align: 'center', sortable: false }
]);
</script>

<template>
  <v-container fluid>
    <v-card class="order-list-card">
      <v-card-title class="text-h4 font-weight-bold pa-6 d-flex align-center">
        <v-icon large left class="mr-2">mdi-clipboard-list</v-icon>
        รายการคำสั่งซื้อ
      </v-card-title>

      <v-card-text>
        <v-skeleton-loader
          v-if="loading"
          type="table"
          class="mx-auto"
        ></v-skeleton-loader>

        <v-alert
          v-else-if="error"
          type="error"
          icon="mdi-alert-circle"
          prominent
          border="left"
        >
          {{ error }}
        </v-alert>

        <v-data-table
          v-else
          :headers="headers"
          :items="orders"
          :items-per-page="10"
          class="elevation-1"
        >
          <template v-slot:item.userId.name="{ item }">
            <v-avatar size="32" class="mr-2 mt-2">
              <v-img :src="item.userId.avatar ? `${Api_URL}${item.userId.avatar}` : 'https://cdn.vuetifyjs.com/images/john.jpg'"></v-img>
            </v-avatar>
            {{ item.userId.name }}
          </template>

          <template v-slot:header.createdAt>
            <span v-if="mdAndUp">วันที่สั่งซื้อ</span>
          </template>

          <template v-slot:item.createdAt="{ item }">
            <v-chip
              v-if="mdAndUp"
              :color="new Date(item.createdAt) > new Date(Date.now() - 86400000) ? 'success' : 'default'"
              small
              label
            >
              {{ formatDate(item.createdAt) }}
            </v-chip>
          </template>

          <template v-slot:item.totalPrice="{ item }">
            <v-chip color="primary" label>
              {{ item.totalPrice.toLocaleString() }} บาท
            </v-chip>
          </template>

          <template v-slot:header.methodPaid>
            <span v-if="lgAndUp">วิธีการชำระเงิน</span>
          </template>

          <template v-slot:item.methodPaid="{ item }">
            <span v-if="lgAndUp">{{ getStatusText(item.methodPaid, 'methodPaid') }}</span>
          </template>

          <template v-slot:item.statusPaid="{ item }">
            <v-chip :color="getStatusColor(item.statusPaid)" label>
              <v-icon left size="small">
                {{ getOrderStatusIcon(item.statusPaid) }}
              </v-icon>
              {{ getStatusText(item.statusPaid, 'statusPaid') }}
            </v-chip>
          </template>

          <template v-slot:item.deliverStatus="{ item }">
            <v-chip :color="getStatusColor(item.deliverStatus)" label>
              <v-icon left size="small">
                {{ getOrderStatusIcon(item.deliverStatus) }}
              </v-icon>
              {{ getStatusText(item.deliverStatus, 'deliverStatus') }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              color="primary"
              variant="tonal"
              @click="showOrderDetail(item)"
              size="small"
            >
              <v-icon left>mdi-eye</v-icon>
              รายละเอียด
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <MoreDetailDialog
      v-model:showDialog="showDetailDialog"
      :selectedOrder="selectedOrder"
      @orderUpdated="handleOrderUpdated"
    />
  </v-container>
</template>

<style scoped>
.order-list-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.v-data-table {
  border-radius: 8px;
}

:deep(.v-data-table__wrapper > table) {
  border-spacing: 0 8px;
  border-collapse: separate;
}

:deep(tbody tr) {
  transition: box-shadow 0.2s, transform 0.2s;
}

:deep(tbody tr:hover) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  :deep(.v-data-table__wrapper) {
    overflow-x: auto;
  }
}
</style>
