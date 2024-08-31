<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Order_ENDPOINTS } from '@/assets/config/api/api_endPoints';

const orders = ref([]);
const selectedOrder = ref(null);
const showDetailDialog = ref(false);

const fetchOrders = async () => {
  try {
    const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    const response = await axios.get(Order_ENDPOINTS.getOrderByUser, {
      headers: {
        authorization: `Bearer ${jwtToken}`,
      },
    });
    orders.value = response.data.data;
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ:', error);
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
};

const cancelOrder = async (orderId) => {
  try {
    const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    await axios.put(`${Order_ENDPOINTS.cancelOrder}/${orderId}`, {}, {
      headers: {
        authorization: `Bearer ${jwtToken}`,
      },
    });
    await fetchOrders();
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ:', error);
  }
};

const showOrderDetail = (order) => {
  selectedOrder.value = order;
  showDetailDialog.value = true;
};

onMounted(fetchOrders);
</script>

<template>
  <v-container>
    <h1 class="text-h4 mb-4">ประวัติการสั่งซื้อ</h1>
    <v-list>
      <v-list-item v-for="order in orders" :key="order.orderId" class="mb-4">
        <v-card width="100%">
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <p><strong>เวลาที่สร้าง:</strong> {{ formatDate(order.createdAt) }}</p>
                <p><strong>สถานะการชำระเงิน:</strong> {{ order.statusPaid }}</p>
                <p><strong>ยกเลิกคำสั่งซื้อ:</strong> {{ order.cancelOrder ? 'ใช่' : 'ไม่' }}</p>
                <p><strong>เสร็จสมบูรณ์:</strong> {{ order.completedOrder ? 'ใช่' : 'ไม่' }}</p>
              </v-col>
              <v-col cols="12" sm="6">
                <p><strong>ราคารวม:</strong> {{ order.totalPrice }} บาท</p>
                <v-btn
                  v-if="!order.cancelOrder && !order.completedOrder"
                  color="error"
                  @click="cancelOrder(order.orderId)"
                  class="mr-2"
                >
                  ยกเลิกคำสั่งซื้อ
                </v-btn>
                <v-btn color="primary" @click="showOrderDetail(order)">
                  ดูรายละเอียด
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-list-item>
    </v-list>

    <v-dialog v-model="showDetailDialog" max-width="600px">
      <v-card v-if="selectedOrder">
        <v-card-title>รายละเอียดคำสั่งซื้อ</v-card-title>
        <v-card-text>
          <p><strong>รหัสคำสั่งซื้อ:</strong> {{ selectedOrder.orderId }}</p>
          <p><strong>วันที่สั่งซื้อ:</strong> {{ formatDate(selectedOrder.createdAt) }}</p>
          <p><strong>สถานะการชำระเงิน:</strong> {{ selectedOrder.statusPaid }}</p>
          <p><strong>วิธีการชำระเงิน:</strong> {{ selectedOrder.methodPaid }}</p>
          <p><strong>ราคารวม:</strong> {{ selectedOrder.totalPrice }} บาท</p>
          <p><strong>ยกเลิกคำสั่งซื้อ:</strong> {{ selectedOrder.cancelOrder ? 'ใช่' : 'ไม่' }}</p>
          <p><strong>เสร็จสมบูรณ์:</strong> {{ selectedOrder.completedOrder ? 'ใช่' : 'ไม่' }}</p>
          <h3 class="mt-4">รายการสินค้า:</h3>
          <v-list>
            <v-list-item v-for="product in selectedOrder.products" :key="product._id">
              <v-list-item-content>
                <v-list-item-title>{{ product.productId.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  จำนวน: {{ product.quantity }} | ราคา: {{ product.productId.price * product.quantity }} บาท
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="showDetailDialog = false">ปิด</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
