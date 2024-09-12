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

const placeOrder = async () => {
  const result = await $swal.fire({
    title: 'ยืนยันสร้างคำสั่งซื้อ',
    text: 'คุณต้องการสร้างคำสั่งซื้อหรือไม่?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ยืนยัน',
    cancelButtonText: 'ยกเลิก',
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
    await orderStore.placeOrder({
      products: formattedProducts,
      methodPaid: payment.value,
    }).then((response) => {
      orderId.value = response.orderId;
      console.log("orderId", orderId.value);
      activeStep.value++;
    }).catch((error) => {
      console.log("error", error);
    });
  }
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
                  <v-col cols="12">
                    <v-text-field v-model="userDetail.name" label="ชื่อ" outlined></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="userDetail.phone" label="เบอร์โทร" outlined></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="userAddress" label="ที่อยู่" outlined></v-text-field>
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
              <v-btn v-if="activeStep === 3" @click="closeDetailDeliver" class="mr-auto"
                color="error">จ่ายภายหลัง</v-btn>
              <v-btn v-if="activeStep === 2 && payment === 'โอนเงิน (QR พร้อมเพย์)'" @click="placeOrder"
                class="ml-auto">ชำระเงิน</v-btn>
              <v-btn v-if="activeStep < 2" @click="activeStep++" class="ml-auto">ถัดไป</v-btn>
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