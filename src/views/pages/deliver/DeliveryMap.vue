<script setup>
import { ref, onMounted, watch } from 'vue';
import { LongdoMap, LongdoMapLoad, LongdoMapMarker } from 'longdo-map-vue';

const props = defineProps({
  orders: {
    type: Array,
    required: true
  },
  show: Boolean
});

const emit = defineEmits(['update:show']);

const apiKey = import.meta.env.VITE_LONGDO_MAP_API_KEY;
const mapInstance = ref(null);
const myLocation = ref([13.7563, 100.5018]);
const showOrderDialog = ref(false);
const selectedOrder = ref(null);

// โหลด Longdo Map
LongdoMapLoad({
  apiKey: apiKey
});

function loadMap(map) {
  mapInstance.value = map;
  map.Layers.setBase(longdo.Layers.NORMAL);
  getMyLocation();
}

function getMyLocation() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      myLocation.value = [position.coords.latitude, position.coords.longitude];
      if (mapInstance.value) {
        mapInstance.value.location({ 
          lon: myLocation.value[1], 
          lat: myLocation.value[0] 
        }, true);
      }
    },
    (error) => {
      console.error("เกิดข้อผิดพลาดในการรับตำแหน่ง:", error);
    }
  );
}

function showOrderDetail(order) {
  selectedOrder.value = order;
  showOrderDialog.value = true;
}

function createCustomPopup(order) {
  return `
    <div class="custom-popup">
      <div class="popup-header">
        <div class="popup-title-wrapper">
          <span class="popup-icon">👤</span>
          <span class="popup-title">${order.userId.name}</span>
        </div>
      </div>
      
      <div class="popup-content">
        <div class="popup-info">
          <span class="popup-icon-small">📍ที่อยู่: </span>
          <span>${order.userId.address}</span>
        </div>
        
        <div class="popup-info">
          <span class="popup-icon-small">📱เบอร์โทร: </span>
          <span>${order.userId.phone}</span>
        </div>
      </div>

      <button 
        onclick="window.dispatchEvent(new CustomEvent('show-order-detail', {detail: '${order.orderId}'}))"
        class="popup-button"
      >
        <span class="popup-icon-small">📋</span>
        ดูรายละเอียด
      </button>
    </div>
  `;
}

// เพิ่ม event listener สำหรับรับ custom event
onMounted(() => {
  window.addEventListener('show-order-detail', (event) => {
    const order = props.orders.find(o => o.orderId === event.detail);
    if (order) {
      showOrderDetail(order);
    }
  });
});
</script>

<template>
  <v-dialog v-model="props.show" fullscreen hide-overlay transition="dialog-bottom-transition">
    <v-card>
      <v-toolbar dark color="primary" class="elevation-2">
        <v-btn icon dark color="white" @click="$emit('update:show', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>
          <v-icon left>mdi-map-marker-radius</v-icon>
          แผนที่การจัดส่ง
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="getMyLocation">
          <v-icon>mdi-crosshairs-gps</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-0">
        <longdo-map 
          :zoom="12"
          @load="loadMap"
          class="delivery-map"
        >
          <longdo-map-marker
            :location="{ lon: myLocation[1], lat: myLocation[0] }"
            :title="'ตำแหน่งของฉัน'"
            :detail="'ตำแหน่งปัจจุบัน'"
          />
          
          <longdo-map-marker
            v-for="order in orders"
            :key="order.orderId"
            :location="{ lon: order.userId.lng, lat: order.userId.lat }"
            :title="order.userId.name"
            :detail="createCustomPopup(order)"
          />
        </longdo-map>
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Dialog แสดงรายละเอียดออเดอร์ -->
  <v-dialog v-model="showOrderDialog" max-width="500" transition="dialog-transition">
    <v-card v-if="selectedOrder" class="order-detail-card">
      <v-card-title class="text-h5 primary white--text">
        <v-icon left color="white">mdi-cart</v-icon>
        รายละเอียดคำสั่งซื้อ
      </v-card-title>

      <v-card-text class="pt-4">
        <div class="order-info mb-4">
          <div class="d-flex align-center mb-2">
            <v-icon color="primary" class="mr-2">mdi-pound</v-icon>
            <span class="text-subtitle-1">{{ selectedOrder.orderId }}</span>
          </div>
          
          <v-divider class="my-3"></v-divider>
          
          <div class="customer-info">
            <div class="info-item">
              <v-icon color="grey darken-1">mdi-account</v-icon>
              <span>{{ selectedOrder.userId.name }}</span>
            </div>
            <div class="info-item">
              <v-icon color="grey darken-1">mdi-map-marker</v-icon>
              <span>{{ selectedOrder.userId.address }}</span>
            </div>
            <div class="info-item">
              <v-icon color="grey darken-1">mdi-phone</v-icon>
              <span>{{ selectedOrder.userId.phone }}</span>
            </div>
          </div>
        </div>

        <v-card outlined class="product-list pa-3">
          <div class="text-subtitle-1 font-weight-bold mb-3">
            <v-icon color="primary">mdi-package-variant</v-icon>
            รายการสินค้า
          </div>
          
          <v-list dense>
            <v-list-item v-for="product in selectedOrder.products" :key="product._id">
              <v-list-item-content>
                <div class="d-flex justify-space-between align-center">
                  <div class="product-name">
                    {{ product.productId.name }}
                    <span class="quantity">x{{ product.quantity }}</span>
                  </div>
                  <div class="product-price">
                    {{ product.productId.price * product.quantity }} บาท
                  </div>
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <v-divider class="my-3"></v-divider>

          <div class="d-flex justify-space-between align-center total-price">
            <span class="text-subtitle-1 font-weight-bold">ราคารวม</span>
            <span class="text-h6 primary--text">{{ selectedOrder.totalPrice }} บาท</span>
          </div>

          <div class="payment-method mt-2">
            <v-chip
              :color="selectedOrder.methodPaid === 'cash' ? 'green' : 'blue'"
              text-color="white"
              small
            >
              <v-icon left small>
                {{ selectedOrder.methodPaid === 'cash' ? 'mdi-cash' : 'mdi-qrcode' }}
              </v-icon>
              {{ selectedOrder.methodPaid === 'cash' ? 'เงินสด' : 'พร้อมเพย์' }}
            </v-chip>
          </div>
        </v-card>
      </v-card-text>

      <v-card-actions class="pb-4 px-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey darken-1"
          text
          @click="showOrderDialog = false"
        >
          ปิด
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.delivery-map {
  width: 100%;
  height: calc(100vh - 64px);
}

/* Custom Popup Styles */
:deep(.custom-popup) {
  padding: 16px;
  min-width: 250px;
  border-radius: 8px;
  background: white;
}

.popup-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.popup-title {
  font-size: 16px;
  font-weight: 500;
  color: #1976d2;
}

.popup-content {
  margin-bottom: 12px;
}

.popup-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.popup-button {
  background: linear-gradient(45deg, #1976d2, #2196f3);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.popup-button:hover {
  background: linear-gradient(45deg, #1565c0, #1976d2);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* Order Detail Styles */
.order-detail-card {
  border-radius: 8px;
  overflow: hidden;
}

.customer-info {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.product-list {
  background: #fafafa;
  border-radius: 4px;
}

.product-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity {
  color: #666;
  font-size: 0.9em;
  margin-left: 8px;
}

.product-price {
  font-weight: 500;
}

.total-price {
  padding: 8px 16px;
  background: #f5f5f5;
  border-radius: 4px;
}

.payment-method {
  display: flex;
  justify-content: flex-end;
}
</style>

<style>
/* ต้องใช้ global CSS เพราะ popup content อยู่นอก Vue component */
.custom-popup {
  padding: 16px;
  min-width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.popup-header {
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #1976d2;
}

.popup-icon {
  color: #1976d2;
  font-size: 24px;
}

.popup-icon-small {
  color: #666;
  font-size: 18px;
}

.popup-content {
  margin-bottom: 16px;
}

.popup-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #444;
  font-size: 14px;
  line-height: 1.4;
}

.popup-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #1976d2, #2196f3);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.popup-button:hover {
  background: linear-gradient(135deg, #1565c0, #1976d2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}

.popup-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
}

/* เพิ่ม styles สำหรับปุ่มปิด */
.popup-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s ease;
}

.popup-close:hover {
  background: rgba(0, 0, 0, 0.2);
  color: #333;
}

.popup-header {
  position: relative;
  padding-right: 32px;
}

.popup-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
