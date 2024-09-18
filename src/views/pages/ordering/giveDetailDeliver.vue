<script setup>
import { ref, computed, watch } from 'vue';
import { useOrderStore } from '@/stores/orderStore';
import { usePaymentStore } from '@/stores/paymentStore';
import LottieAnimation from "@/assets/lottie/lottieanimetion.vue";
import { inject } from 'vue';
import axios from 'axios';
import { User_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import Swal from 'sweetalert2'

const backendUrl = import.meta.env.VITE_API_URL;

const $swal = inject('$swal');

const props = defineProps({
  modelValue: Boolean,
  qrCodePayment: String,
  closeDetailDeliver: Function,
  cartList: Array,
});

const emit = defineEmits(['update:modelValue']);

const showDetailDeliver = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const orderStore = useOrderStore();
const paymentStore = usePaymentStore();

const userDetail = ref(JSON.parse(localStorage.getItem('userinfo') || sessionStorage.getItem('userinfo') || '{}'));
const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
const userAddress = ref('');

const paymentItems = ['โอนเงิน (QR พร้อมเพย์)', 'เงินสด (ปลายทาง)'];
const payment = ref(paymentItems[0]);
const orderId = ref(null);

const activeStep = ref(1);
const paymentStatus = ref('ยังไม่ชำระเงิน');
const paymentSlip = ref(null);
const paymentSlipReader = ref(null);
const loading = ref(false);

const showStep3 = computed(() => payment.value === 'โอนเงิน (QR พร้อมเพย์)');
const isDisabledDoneButton = ref(true);
const paymentStatusColor = computed(() => {
  switch (paymentStatus.value) {
    case 'ยังไม่ชำระเงิน':
      return '#FF0000'; // สีแดง
    case 'ชำระเงินสำเร็จ':
      return '#00FF00'; // สีเขียว
    default:
      return '#FFA500'; // สีส้ม
  }
});

const totalPrice = computed(() => {
  return props.cartList.reduce((total, item) => total + (item.price * item.quantity), 0);
});

const localCartList = ref([]);

const mapInstance = ref(null);
const zoom = ref(15);
const marker = ref(null);

function loadMap(map) {
  mapInstance.value = map;
  map.Layers.setBase(longdo.Layers.NORMAL);
  map.location({ lon: userDetail.value.lng, lat: userDetail.value.lat }, true);
  updateMarker({ lon: userDetail.value.lng, lat: userDetail.value.lat });
  map.Event.bind('click', function (mouse) {
    const location = map.location(mouse);
    updateMarker(location);
    updateCoordinates(location);
  });
}

function updateMarker(location) {
  if (marker.value) {
    mapInstance.value.Overlays.remove(marker.value);
  }
  marker.value = new window.longdo.Marker(location);
  mapInstance.value.Overlays.add(marker.value);
}

function updateCoordinates(location) {
  userDetail.value.lat = location.lat.toFixed(6);
  userDetail.value.lng = location.lon.toFixed(6);
}

function markCurrentLocation() {
  if (mapInstance.value) {
    const center = mapInstance.value.location();
    updateMarker(center);
    updateCoordinates(center);
  }
}

watch([() => userDetail.value.lat, () => userDetail.value.lng], ([newLat, newLng]) => {
  if (newLat && newLng && mapInstance.value) {
    const location = { lon: parseFloat(newLng), lat: parseFloat(newLat) };
    mapInstance.value.location(location, true);
    updateMarker(location);
  }
});

onMounted(() => {
  Promise.all([
    getUserAddress()
  ]);
});

const getUserAddress = () => {
  axios.get(User_ENDPOINTS.getProfile, {
    headers: {
      'Authorization': `Bearer ${jwtToken}`
    }
  })
    .then((response) => {
      userAddress.value = response.data.data.address;
      console.log("userAddress", userAddress.value);
      console.log(response.data)
    })
    .catch((error) => {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลที่อยู่ผู้ใช้:', error);
    });
};

async function updateUserInfo() {
  try {
    const formData = new FormData();
    formData.append('name', userDetail.value.name);
    formData.append('phone', userDetail.value.phone);
    formData.append('address', userAddress.value);
    formData.append('lat', userDetail.value.lat);
    formData.append('lng', userDetail.value.lng);

    const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

    const response = await axios.put(
      `${User_ENDPOINTS.updateUser}${userDetail.value.userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${jwtToken}`
        }
      }
    );

    if (response.status === 200) {
      console.log('อัปเดตข้อมูลผู้ใช้สำเร็จ');
      // ดำเนินการต่อไปยังขั้นตอนที่สอง
      activeStep.value++;
    } else {
      throw new Error('การอัปเดตข้อมูลผู้ใช้ไม่สำเร็จ');
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้:', error);
    // แสดงข้อความแจ้งเตือนหรือจัดการข้อผิดพลาดตามที่คุณต้องการ
  }
}

const placeOrderCash = async () => {
  const orderPlaced = await placeOrder();
  if (orderPlaced) {
    await $swal.fire({
      title: 'สั่งซื้อสำเร็จ',
      text: 'ขอบคุณสำหรับการสั่งซื้อ คุณสามารถชำระเงินปลายทางได้',
      icon: 'success',
      confirmButtonText: 'ตกลง',
      timer: 2000,
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: {
        container: 'swal-on-top'
      }
    });
    closeDetailDeliver();
  }
};

const placeOrder = async () => {
  // สร้างข้อความสรุปรายการสั่งซื้อ
  const orderSummary = orderStore.cartList.map(item =>
    `<tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${item.price.toLocaleString()} บาท</td>
      <td>${(item.price * item.quantity).toLocaleString()} บาท</td>
    </tr>`
  ).join('');

  // คำนวณราคารวม
  const totalPrice = orderStore.cartList.reduce((total, item) => total + (item.price * item.quantity), 0);

  const result = await $swal.fire({
    title: 'ยืนยันคำสั่งซื้อ',
    html: `
      <div style="text-align: left; font-family: 'Kanit', sans-serif;">
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <h3 style="color: #4a4a4a; margin-bottom: 10px;">ข้อมูลการจัดส่ง</h3>
          <p><strong>ชื่อ:</strong> ${userDetail.value.name}</p>
          <p><strong>ที่อยู่:</strong> ${userAddress.value}</p>
          <p><strong>เบอร์โทร:</strong> ${userDetail.value.phone}</p>
        </div>
        <h3 style="color: #4a4a4a; margin-bottom: 10px;">รายการสั่งซื้อ</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #4a4a4a; color: white;">
              <th style="padding: 10px; text-align: left;">สินค้า</th>
              <th style="padding: 10px; text-align: center;">จำนวน</th>
              <th style="padding: 10px; text-align: right;">ราคาต่อชิ้น</th>
              <th style="padding: 10px; text-align: right;">ราคารวม</th>
            </tr>
          </thead>
          <tbody>
            ${orderSummary}
          </tbody>
          <tfoot>
            <tr style="background-color: #f5f5f5; font-weight: bold;">
              <td colspan="3" style="padding: 10px; text-align: right;">ราคารวมทั้งสิ้น:</td>
              <td style="padding: 10px; text-align: right;">${totalPrice.toLocaleString()} บาท</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `,
    icon: 'info',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ยืนยันคำสั่งซื้อ',
    cancelButtonText: 'ยกเลิก',
    width: '600px',
    target: document.body,
    customClass: {
      container: 'swal-on-top'
    }
  });

  if (result.isConfirmed) {
    // เก็บข้อมูล cartList ไว้ในตัวแปรภายใน component
    localCartList.value = [...orderStore.cartList];

    const formattedProducts = JSON.stringify(orderStore.cartList.map(product => ({
      productId: product.productId,
      quantity: product.quantity
    })));
    try {
      const response = await orderStore.placeOrder({
        products: formattedProducts,
        methodPaid: payment.value,
      });
      orderId.value = response.orderId;
      console.log("orderId", orderId.value);
      activeStep.value++;
      return true; // คืนค่า true เมื่อการสั่งซื้อสำเร็จ
    } catch (error) {
      console.log("error", error);
      await $swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดำเนินการสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ตกลง',
        customClass: {
          container: 'swal-on-top'
        }
      });
      return false; // คืนค่า false เมื่อเกิดข้อผิดพลาด
    }
  }
  return false; // คืนค่า false ถ้าผู้ใช้ยกเลิกการยืนยัน
};

const handleFileChange = async () => {
  if (paymentSlip.value) {
    const file = paymentSlip.value;
    const reader = new FileReader();
    reader.onload = () => {
      paymentSlipReader.value = reader.result;
    };
    reader.readAsDataURL(file);
  }
};

const uploadPaymentSlip = async () => {
  loading.value = true;
  const result = await paymentStore.checkPaymentStatus(orderId.value, paymentSlip.value);
  console.log("result", result);
  if (result.statusPaid === "paid") {
    paymentStatus.value = "ชำระเงินสำเร็จ";
    isDisabledDoneButton.value = false;
    await $swal.fire({
      icon: 'success',
      title: 'ชำระเงินสำเร็จ',
      text: 'ขอบคุณสำหรับการสั่งซื้อ',
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        container: 'swal-on-top'
      }
    });
    // ล้างค่าพารามิเตอร์ทั้งหมด
    orderId.value = null;
    paymentSlip.value = null;
    paymentSlipReader.value = null;
    localCartList.value = [];
    activeStep.value = 1;
    paymentStatus.value = 'ยังไม่ชำระเงิน';
    // ปิด dialog
    closeDetailDeliver();
  } else {
    paymentStatus.value = result.message;
    isDisabledDoneButton.value = true;
  }
  loading.value = false;
};

const closeDetailDeliver = () => {
  showDetailDeliver.value = false;
  // รีเซ็ตค่าทั้งหมด
  orderId.value = null;
  paymentSlip.value = null;
  paymentSlipReader.value = null;
  localCartList.value = [];
  activeStep.value = 1;
  paymentStatus.value = 'ยังไม่ชำระเงิน';
  isDisabledDoneButton.value = true;
  payment.value = paymentItems[0];
};

const debugPaymentStatus = () => {
  console.log('Current payment status:', paymentStatus.value);
};

const calculateTotalPrice = (cartList) => {
  return cartList.reduce((total, item) => total + (item.price * item.quantity), 0);
};

watch(() => props.qrCodePayment, (newValue) => {
  console.log('qrCodePayment updated:', newValue);
});
</script>

<template>
  <v-dialog v-model="showDetailDeliver" max-width="100%" fullscreen :z-index="1000">
    <v-card class="full-width-card">
      <v-card-title>
        <span class="headline">รายละเอียดคำสั่งซื้อ</span>
      </v-card-title>
      <v-card-text>
        <v-stepper v-model="activeStep" class="pa-3 full-width-stepper"
          :items="['รายละเอียด', 'วิธีชำระเงิน', showStep3 ? 'ชำระเงิน' : 'สำเร็จ']">
          <template v-slot:item.1>
            <v-card title="รายละเอียดผู้ใช้" flat>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="userDetail.name" label="ชื่อ" outlined></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model="userDetail.phone" label="เบอร์โทร" outlined></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="userAddress" label="ที่อยู่" outlined></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-card outlined>
                      <longdo-map @load="loadMap" :zoom="zoom" ref="mapInstance"
                        style="width: 100%; height: 300px;"></longdo-map>
                      <v-card-actions>
                        <v-btn @click="markCurrentLocation" color="primary" text>
                          <v-icon left>mdi-map-marker</v-icon>
                          ทำเครื่องหมายตำแหน่งปัจจุบัน
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </template>

          <template v-slot:item.2>
            <v-card title="ช่องทางการชำระเงิน" flat class="full-width-card">
              <v-card-text>
                <v-row>
                  <v-col cols="12">
                    <v-select v-model="payment" :items="paymentItems" label="ช่องทางชำระเงิน" outlined></v-select>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </template>

          <template v-if="showStep3" v-slot:item.3>


            <v-card-text class="d-flex flex-column justify-center align-center">
              <img v-if="props.qrCodePayment" :src="props.qrCodePayment" alt="QR Code" />
              <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
              <v-chip :style="{ backgroundColor: paymentStatusColor, color: 'white' }">{{ paymentStatus }}</v-chip>
            </v-card-text>

            <v-file-input v-model="paymentSlip" label="อัพโหลดสลิปการโอนเงิน" prepend-icon="mdi-paperclip"
              accept="image/*" @change="handleFileChange" chips show-size />
            <div class="d-flex flex-column justify-center align-center mt-3">
              <v-img :src="paymentSlipReader" v-if="paymentSlipReader" width="30%"></v-img>
            </div>

            <div class="d-flex justify-center align-content-center mt-3">
              <v-btn :loading="loading" :disabled="!paymentSlip" class="flex-grow-1" height="48" variant="tonal"
                @click="uploadPaymentSlip">
                ส่งหลักฐาน
              </v-btn>
            </div>

            <v-card class="payment-details-card mx-auto mt-4" elevation="3" max-width="600" rounded="lg">
              <v-card-title class="text-h5 font-weight-bold primary--text">รายการสินค้า</v-card-title>
              <v-card-text>
                <v-row no-gutters>
                  <v-col v-for="item in localCartList" :key="item.productId" cols="12" sm="6" md="4" class="pa-2">
                    <v-card outlined>
                      <v-img :src="backendUrl + item.imagePath" v-if="item.imagePath" height="120" cover></v-img>
                      <v-icon v-else size="120" class="grey lighten-2">mdi-package-variant-closed</v-icon>
                      <v-card-text>
                        <div class="font-weight-medium">{{ item.name }}</div>
                        <div class="text-caption">จำนวน: {{ item.quantity }} x {{ item.price.toLocaleString() }} บาท
                        </div>
                        <v-chip color="primary" text-color="white" x-small class="mt-1">
                          {{ (item.quantity * item.price).toLocaleString() }} บาท
                        </v-chip>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                <v-divider class="my-3"></v-divider>
                <v-row align="center" justify="space-between">
                  <v-col cols="6">
                    <div class="text-h6 font-weight-bold">ราคารวมทั้งสิ้น</div>
                  </v-col>
                  <v-col cols="6" class="text-right">
                    <v-chip color="success" text-color="white" large>
                      <v-icon class="mr-1" left small>mdi-cash-multiple</v-icon>
                      {{ calculateTotalPrice(localCartList).toLocaleString() }} บาท
                    </v-chip>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </template>

          <template v-if="!showStep3" v-slot:item.3>
            <div class="d-flex flex-column justify-center align-center">

              <LottieAnimation animationPath="src/assets/lottie/lottieFile/place_order.json" width="100%"
                height="100%" />
              <h3>🎉 วางคำสั่งซื้อเรียร้อยแล้ว 🎉</h3>
            </div>
          </template>

          <template v-slot:actions>
            <div class="d-flex justify-space-between w-100">
              <v-btn v-if="activeStep === 1" @click="closeDetailDeliver" class="mr-auto" color="error">ยกเลิก</v-btn>
              <v-btn v-else-if="activeStep > 1 && activeStep < 3" @click="activeStep--" class="mr-auto">ย้อนกลับ</v-btn>


              <v-btn v-if="activeStep === 2 && payment === 'โอนเงิน (QR พร้อมเพย์)'" @click="placeOrder"
                class="ml-auto">ชำระเงิน</v-btn>
              <v-btn color="success" v-if="activeStep === 2 && payment === 'เงินสด (ปลายทาง)'"
                @click="placeOrderCash" class="ml-auto">จ่ายสด</v-btn>
              <v-btn v-if="activeStep < 2" @click="updateUserInfo" class="ml-auto">ถัดไป</v-btn>

              <v-btn v-if="activeStep === 3" @click="closeDetailDeliver" class="mr-auto"
                color="error">จ่ายภายหลัง</v-btn>
              <v-btn color="success" v-if="activeStep === 3" :disabled="isDisabledDoneButton"
                prepend-icon="mdi-check-circle" class="ml-auto" @click="closeDetailDeliver">เสร็จ
              </v-btn>
              

            </div>
          </template>

        </v-stepper>
      </v-card-text>
    </v-card>
  </v-dialog>

</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500&display=swap');

.swal-on-top {
  z-index: 9999 !important;
}

.swal2-container {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.swal2-popup {
  margin: auto !important;
  font-family: 'Kanit', sans-serif;
}

.payment-details-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

@media (max-width: 600px) {
  .payment-details-card {
    margin: 0 -16px;
    border-radius: 0;
  }
}

.v-list-item {
  display: flex;
  align-items: flex-start;
}

.v-list-item__avatar {
  margin-top: 0;
}

.v-list-item__content {
  flex: 1;
}

.full-width-card {
  width: 100%;
  max-width: 100%;
}

.full-width-stepper {
  width: 100%;
}

.v-stepper {
  width: 100%;
}

.v-select {
  width: 100%;
}
</style>