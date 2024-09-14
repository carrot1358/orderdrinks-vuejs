<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import DeliverDialog from '@/views/pages/deliver/DeliverDialog.vue';

const props = defineProps({
  orders: Array,
});

const emit = defineEmits(['refresh']);

const selectedOrder = ref(null);
const showDetailDialog = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(20);

const filteredOrders = ref([]);

const apiUrl = import.meta.env.VITE_API_URL || '';


const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage.value));

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredOrders.value.slice(start, end);
});

const updateFilteredOrders = () => {
  filteredOrders.value = props.orders
    .filter(order =>
      order.userId.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      order.userId.phone.includes(searchQuery.value)
    )
    .sort((a, b) => a.distance - b.distance);
  currentPage.value = 1;
};

const showOrderDetail = (order) => {
  selectedOrder.value = order;
  showDetailDialog.value = true;
};

const handleOrderUpdated = () => {
  emit('refresh');
};

const getMethodPaidText = (method) => {
  const methodTexts = {
    cash: 'เงินสด',
    promptpay: 'พร้อมเพย์'
  };
  return methodTexts[method] || method;
};

const getMethodPaidColor = (method) => {
  const methodColors = {
    cash: 'green',
    promptpay: 'blue'
  };
  return methodColors[method] || 'grey';
};

const getStatusPaidText = (status) => {
  const statusTexts = {
    paid: 'ชำระแล้ว',
    wait_paid: 'รอชำระเงิน',
    check_paid: 'ตรวจสอบการชำระเงิน',
    not_paid: 'ยังไม่ชำระ',
    error: 'เกิดข้อผิดพลาด'
  };
  return statusTexts[status] || status;
};

const getStatusPaidColor = (status) => {
  const statusColors = {
    paid: 'success',
    wait_paid: 'warning',
    check_paid: 'info',
    not_paid: 'error',
    error: 'error'
  };
  return statusColors[status] || 'default';
};

const getDeliverStatusText = (status) => {
  const deliverStatusTexts = {
    pending: 'รอดำเนินการ',
    delivering: 'กำลังจัดส่ง',
    delivered: 'จัดส่งแล้ว',
    cancel: 'ยกเลิก'
  };
  return deliverStatusTexts[status] || status;
};

const getDeliverStatusColor = (status) => {
  const deliverStatusColors = {
    pending: 'warning',
    delivering: 'info',
    delivered: 'success',
    cancel: 'error'
  };
  return deliverStatusColors[status] || 'default';
};

const apiUri = import.meta.env.VITE_API_URI || '';

onMounted(() => {
  updateFilteredOrders();
});

watch(() => props.orders, updateFilteredOrders);
watch(searchQuery, updateFilteredOrders);
</script>

<template>
  <v-container>
    <!-- ช่องค้นหา -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-text-field v-model="searchQuery" label="ค้นหาตามชื่อหรือเบอร์โทรศัพท์" prepend-inner-icon="mdi-magnify"
          clearable @input="updateFilteredOrders"></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-select v-model="itemsPerPage" :items="[10, 20, 50, 100]" label="จำนวนรายการต่อหน้า"
          @update:model-value="updateFilteredOrders"></v-select>
      </v-col>
    </v-row>

    <!-- รายการ Order -->
    <v-row>
      <v-col cols="12" v-for="order in paginatedOrders" :key="order._id">
        <v-card class="order-card mb-4" elevation="3">
          <v-card-text>
            <v-row align="center" no-gutters>
              <!-- ข้อมูลลูกค้า -->
              <v-col cols="12" sm="4" md="3" class="pa-2">
                <div class="d-flex align-center">
                  <v-avatar color="primary" size="40" class="mr-3 elevation-1">
                    <v-img v-if="order.userId.avatar" :src="apiUrl + order.userId.avatar" :alt="order.userId.name">
                      <template v-slot:placeholder>
                        <v-icon icon="mdi-account" color="white"></v-icon>
                      </template>
                    </v-img>
                    <v-icon v-else icon="mdi-account" color="white"></v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1 font-weight-medium">{{ order.userId.name }}</div>
                    <div class="text-caption">{{ order.userId.phone }}</div>
                  </div>
                </div>
              </v-col>

              <!-- ข้อมูลการชำระเงิน -->
              <v-col cols="12" sm="3" md="3" class="pa-2">
                <v-chip :color="getStatusPaidColor(order.statusPaid)" small class="mr-2">
                  {{ getStatusPaidText(order.statusPaid) }}
                </v-chip>
                <span class="font-weight-bold">{{ order.totalPrice }} บาท</span>
              </v-col>

              <!-- ข้อมูลการจัดส่ง -->
              <v-col cols="12" sm="3" md="3" class="pa-2">
                <v-chip :color="getDeliverStatusColor(order.deliverStatus)" small class="mr-2">
                  {{ getDeliverStatusText(order.deliverStatus) }}
                </v-chip>
                <span>{{ (order.distance / 1000).toFixed(2) }} กม.</span>
              </v-col>

              <!-- ปุ่มดำเนินการ -->
              <v-col cols="12" sm="2" md="3" class="pa-2 text-right">
                <v-btn color="primary" variant="tonal" @click="showOrderDetail(order)">
                  <v-icon left>mdi-information-outline</v-icon>
                  รายละเอียด
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Pagination -->
    <v-pagination v-model="currentPage" :length="totalPages" @update:model-value="updateFilteredOrders"></v-pagination>
  </v-container>

  <DeliverDialog v-if="selectedOrder" v-model:showDialog="showDetailDialog" :selectedOrder="selectedOrder"
    @orderUpdated="handleOrderUpdated" />
</template>

<style scoped>
.order-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

@media (max-width: 600px) {
  .v-col {
    padding-bottom: 8px;
  }
}
</style>