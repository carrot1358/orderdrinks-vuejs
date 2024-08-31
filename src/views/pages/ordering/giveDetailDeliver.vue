<script setup>
import { ref, computed, watch } from 'vue';
import { useOrderStore } from '@/stores/orderStore';
import { usePaymentStore } from '@/stores/paymentStore';
import LottieAnimation from "@/assets/lottie/lottieanimetion.vue";
import { inject } from 'vue';

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
  if(result.statusPaid === "paid"){
    paymentStatus.value = "ชำระเงินสำเร็จ"
    isDisabledDoneButton.value = false
  }else{
    paymentStatus.value = result.message
    isDisabledDoneButton.value = true
  }
  loading.value = false;
};

const closeDetailDeliver = () => {
  showDetailDeliver.value = false;
};

const debugPaymentStatus = () => {
  console.log('Current payment status:', paymentStatus.value);
  // เพิ่มโค้ดสำหรับการดีบั๊กเพิ่มเติมตามต้องการ
};

watch(() => props.qrCodePayment, (newValue) => {
  console.log('qrCodePayment updated:', newValue);
});
</script>

<template>
  <v-dialog v-model="showDetailDeliver" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">รายละเอียดคำสั่งซื้อ</span>
      </v-card-title>
      <v-card-text>
        <v-stepper v-model="activeStep" class="pa-3"
          :items="['รายละเอียด', 'วิธีชำระเงิน', showStep3 ? 'ชำระเงิน' : 'สำเร็จ']">
          <template v-slot:item.1>
            <v-card title="รายละเอียดผู้ใช้" flat>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="userDetail.name" label="ชื่อ" outlined></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="userDetail.phone" label="เบอร์โทร" outlined></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="userDetail.address" label="ที่อยู่" outlined></v-text-field>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </template>

          <template v-slot:item.2>
            <v-card title="ช่องทางการชำระเงิน" flat>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-select v-model="payment" :items="paymentItems" label="ช่องทางชำระเงิน" outlined></v-select>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </template>

          <template v-if="showStep3" v-slot:item.3>
            <v-card title="QR Code" flat>
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
              <v-btn v-if="activeStep > 1" @click="activeStep--" class="mr-auto">ย้อนกลับ</v-btn>
              <v-btn v-if="activeStep === 2 && payment === 'โอนเงิน (QR พร้อมเพย์)'" @click="placeOrder" class="ml-auto">ชำระเงิน</v-btn>
              <v-btn v-if="activeStep < 2 " @click="activeStep++" class="ml-auto">ถัดไป</v-btn>
              <v-btn color="success" v-if="activeStep === 3" :disabled="isDisabledDoneButton"
                prepend-icon="mdi-check-circle" class="ml-auto" @click="closeDetailDeliver">เสร็จ
              </v-btn>
              <v-btn v-if="showStep3 === true && activeStep === 3" @click="debugPaymentStatus" density="comfortable"
                icon="mdi-bug" size="x-small"></v-btn>
            </div>
          </template>

        </v-stepper>
      </v-card-text>
    </v-card>
  </v-dialog>

</template>

<style>
.swal-on-top {
  z-index: 9999;
}
</style>