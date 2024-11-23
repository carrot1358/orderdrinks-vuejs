<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Order_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import DeliverList from '@/views/pages/deliver/DeliverList.vue';
import { useWebSocket } from '@/assets/config/websocket/websocket'
import { Websocket_URL_Frontend } from '@/assets/config/api/websocket_endPoints'
import { VSkeletonLoader } from 'vuetify/components';
import Swal from 'sweetalert2';
import DeliveryMap from '@/views/pages/deliver/DeliveryMap.vue';

const orders = ref([]);
const loading = ref(false);
const showMap = ref(false);
const lastDeliveryMetadata = ref(null);

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
  const confirmResult = await Swal.fire({
    title: 'ต้องการเตรียมจัดส่งสินค้าหรือไม่?',
    text: "การเตรียมจัดส่งสินค้าจะทำให้สถานะของคำสั่งซื้อของลูกค้าถูกเปลี่ยนเป็นกำลังจัดส่ง",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ยืนยันการจัดส่ง',
    cancelButtonText: 'ยกเลิก'
  });

  if (confirmResult.isConfirmed) {
    try {
      const response = await axios.post(Order_ENDPOINTS.prepareOrder, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken')}`
        }
      });
      
      if (response.status === 200) {
        lastDeliveryMetadata.value = response.data.data.metadata;
        
        showDeliveryList(lastDeliveryMetadata.value);
        
        fetchOrders();
      }
    } catch (error) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: error.response?.data?.message || 'ไม่สามารถดำเนินการได้',
        icon: 'error'
      });
    }
  }
};

const showDeliveryList = (metadata) => {
  if (!metadata) {
    Swal.fire({
      title: 'ไม่พบข้อมูลรายการ',
      text: 'กรุณาเตรียมจัดส่งสินค้าก่อน',
      icon: 'warning'
    });
    return;
  }

  const createDeliveryListHtml = (metadata) => {
    const escapeHtml = (unsafe) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    return `
      <div class="delivery-checklist">
        <div class="checklist-header">
          <p class="batch-id">รหัสชุดจัดส่ง: ${metadata.batchId}</p>
        </div>
        
        <table class="product-table">
          <thead>
            <tr>
              <th style="width: 100px" class="text-center">ตรวจสอบ</th>
              <th style="width: 45%" class="text-center">สินค้า</th>
              <th style="width: 120px" class="text-center">จำนวน</th>
              <th style="width: 150px" class="text-center">ราคารวม</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(metadata.productSummary)
              .map(([id, product]) => `
                <tr>
                  <td class="text-center">
                    <input type="checkbox" id="product-${escapeHtml(id)}" class="product-checkbox" 
                      data-product-name="${escapeHtml(product.name)}">
                  </td>
                  <td>${escapeHtml(product.name)}</td>
                  <td class="text-center">${escapeHtml(String(product.totalQuantity))}</td>
                  <td class="text-right">${escapeHtml(product.totalPrice.toLocaleString())} ฿</td>
                </tr>
              `).join('')}
            <tr class="total-row">
              <td colspan="2">รวมทั้งหมด</td>
              <td class="text-center">${Object.values(metadata.productSummary)
                .reduce((sum, product) => sum + product.totalQuantity, 0)}</td>
              <td class="text-right">${metadata.totalAmount.toLocaleString()} ฿</td>
            </tr>
          </tbody>
        </table>

        <div class="delivery-info">
          <div class="info-item">
            <strong>จำนวนออเดอร์:</strong> ${metadata.totalOrders} ออเดอร์
          </div>
        </div>

        <div class="validation-message" style="color: red; display: none;">
          กรุณาตรวจสอบรายการสินค้าให้ครบทุกรายการ
        </div>
      </div>
    `;
  };

  const showDeliveryDialog = () => {
    Swal.fire({
      title: 'รายการที่ต้องเตรียม',
      html: createDeliveryListHtml(metadata),
      confirmButtonText: 'เสร็จสิ้น',
      allowOutsideClick: false,
      width: '1000px',
      customClass: {
        container: 'modern-swal-container',
        popup: 'modern-swal-popup'
      },
      preConfirm: () => {
        const checkboxes = document.querySelectorAll('.product-checkbox');
        const uncheckedItems = Array.from(checkboxes)
          .filter(checkbox => !checkbox.checked)
          .map(checkbox => checkbox.dataset.productName);
        
        if (uncheckedItems.length > 0) {
          return Swal.fire({
            title: 'ยังเช็คไม่ครบ',
            html: `คุณยังไม่ได้เช็ครายการ:<br>${uncheckedItems.join('<br>')}
                  <br><br>ยืนยันจะปิดหน้าต่างหรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก'
          }).then((result) => {
            if (!result.isConfirmed) {
              setTimeout(showDeliveryDialog, 100);
            }
            return result.isConfirmed;
          });
        } else {
          return Swal.fire({
            title: 'เช็ครายการครบแล้ว',
            text: 'คุณเช็ครายการทั้งหมดแล้ว ยืนยันจะปิดหน้าต่างหรือไม่?',
            icon: 'success',
            showCancelButton: true,
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'ยกเลิก'
          }).then((result) => {
            if (!result.isConfirmed) {
              setTimeout(showDeliveryDialog, 100);
            }
            return result.isConfirmed;
          });
        }
      }
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        setTimeout(showDeliveryDialog, 100);
      }
    });
  };

  showDeliveryDialog();
};

const fetchLastDeliveryMetadata = async () => {
  const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
  try {
    const response = await axios.get(Order_ENDPOINTS.getLastDeliveryMetadata, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    lastDeliveryMetadata.value = response.data.data;
  } catch (error) {
    console.error('ไม่สามารถดึงข้อมูลรายการล่าสุดได้:', error);
    lastDeliveryMetadata.value = null;
  }
};

onMounted(() => {
  fetchOrders();
  fetchLastDeliveryMetadata();
});
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-btn color="primary" @click="prepareOrder" :loading="loading" class="mr-2">
          เตรียมจัดส่งสินค้า
        </v-btn>
        <v-btn color="info" @click="showMap = true" class="mr-2">
          <v-icon left>mdi-map-marker</v-icon>
          แผนที่การจัดส่ง
        </v-btn>
        <v-btn 
          color="success" 
          @click="showDeliveryList(lastDeliveryMetadata)" 
          :disabled="!lastDeliveryMetadata"
        >
          <v-icon left>mdi-format-list-checks</v-icon>
          รายการสินค้าที่ต้องส่ง
        </v-btn>
      </v-col>
    </v-row>
    
    <DeliveryMap 
      v-model:show="showMap"
      :orders="orders"
    />
    
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

<style>
.modern-table-container {
  margin: 20px 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 14px;
}

.modern-table th {
  background: #2c3e50;
  color: white;
  padding: 12px;
  text-align: left;
}

.modern-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.modern-table tbody tr:hover {
  background: #f8f9fa;
}

.total-row {
  background: #f8f9fa;
  font-weight: bold;
}

.delivery-info {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.info-card {
  background: #f8f9fa;
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.info-card i {
  color: #2c3e50;
  font-size: 1.2em;
}

.success-title {
  color: #2c3e50;
  font-size: 1.5em;
  margin-bottom: 20px;
}

.modern-swal-popup {
  border-radius: 15px;
  padding: 20px;
}

.modern-swal-content {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .modern-table {
    font-size: 12px;
  }
  
  .info-card {
    width: 100%;
    justify-content: center;
  }
}

.delivery-checklist {
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
}

.checklist-header {
  text-align: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.batch-id {
  color: #666;
  font-size: 0.9em;
  margin-top: 5px;
}

.product-list {
  margin: 20px 0;
}

.product-item {
  margin-bottom: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
}

.product-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.product-checkbox label {
  display: flex;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
}

.product-name {
  font-weight: 500;
  color: #2c3e50;
}

.product-quantity {
  color: #666;
}

.delivery-summary {
  background: #edf2f7;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.summary-item i {
  color: #3085d6;
}

.delivery-locations {
  margin-top: 20px;
}

.delivery-locations ul {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

.delivery-locations li {
  padding: 8px 12px;
  background: #f8f9fa;
  margin-bottom: 5px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .product-checkbox label {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .product-quantity {
    margin-top: 5px;
  }
}

.delivery-checklist {
  padding: 20px;
}

.checklist-header {
  margin-bottom: 20px;
  text-align: center;
}

.batch-id {
  font-size: 1.1em;
  color: #2c3e50;
  font-weight: 500;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.product-table th,
.product-table td {
  padding: 12px 20px;
  border: 1px solid #e2e8f0;
}

.product-table th {
  background: #2c3e50;
  color: white;
  font-weight: 500;
  text-align: center;
  padding: 12px 20px;
  vertical-align: middle;
}

.product-table tbody tr:hover {
  background: #f8fafc;
}

.product-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 0 auto;
  display: block;
}

.text-center {
  text-align: center;
  vertical-align: middle;
}

.text-right {
  text-align: right;
  padding-right: 30px;
}

.total-row {
  background: #f8fafc;
  font-weight: 600;
}

.delivery-info {
  margin-top: 20px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 8px;
}

.info-item {
  margin-bottom: 10px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.validation-message {
  margin-top: 15px;
  padding: 10px;
  background: #fff5f5;
  border-radius: 4px;
  text-align: center;
}

@media (max-width: 1024px) {
  .product-table {
    font-size: 14px;
  }
  
  .product-table td {
    padding: 12px 10px;
  }
}
</style>