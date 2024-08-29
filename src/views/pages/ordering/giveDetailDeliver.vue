<script setup>
import {ref, computed} from 'vue';
import axios from 'axios';
import LottieAnimation from "@/assets/lottie/lottieanimetion.vue";
import { inject } from 'vue';

const $swal = inject('$swal')
// import {Ordering_ENDPOINTS} from '@/assets/config/api/api_endPoints.js';
// import {getPaymentAdmin} from '@/assets/config/api/api_endPoints.js';

const props = defineProps({
    qrCodePayment: String,
    showDetailDeliver: Boolean,
    closeDetailDeliver: Function,
    cartList: Array,
});

const userDetail = ref({
    name: 'nattapad',
    phone: '0945756665',
    address: '159/199',
});

const paymentItems = ['โอนเงิน (QR พร้อมเพย์)', 'เงินสด (ปลายทาง)'];
const payment = ref(paymentItems[0]);

const activeStep = ref(1);
const paymentStatus = ref('ยังไม่ชำระเงิน');
const paymentSlip = ref(null);
const paymentSlipReader = ref(null);
const loading = ref(false);

const debugPaymentStatus = async () => {
    if(paymentStatus.value === 'ชำระเงินแล้ว') {
        paymentStatus.value = 'ยังไม่ชำระเงิน';
    } else {
        paymentStatus.value = 'ชำระเงินแล้ว';
    }
};

const placeOrder =async () =>{
    const playload = {
        jwtToken: localStorage.getItem('jwtToken'),
        userDetail: userDetail.value,
        cartList: props.cartList,
        payment: payment.value,
        paymentStatus: paymentStatus.value,
    };
    // Need Fix
    // await axios.post(Ordering_ENDPOINTS.placeOrder, playload);
    paymentSlip.value = null;
    paymentSlipReader.value = null;
    props.cartList = [];
    props.closeDetailDeliver();
    $swal.fire({
        title: 'สั่งซื้อสำเร็จ',
        text: 'กำลังนำคุณไปยังหน้าหลัก...',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    }).then(() => {
        
    })
}

const handleFileChange = async () => {
    if (paymentSlip.value) {
        const file = paymentSlip.value;
        const reader = new FileReader();
        reader.onload = () => {
            paymentSlipReader.value = reader.result;
        };
        reader.readAsDataURL(file);
    }
}

// Need Fix
const uploadPaymentSlip = async () => {
    loading.value = true
    setTimeout(() => (loading.value = false), 3000)
    const formData = new FormData();
    formData.append('file', paymentSlip.value);
    // Need Fix
    await axios.post('/api/upload-payment-slip', formData);

};

const showStep3 = computed(() => payment.value === 'โอนเงิน (QR พร้อมเพย์)');
const isDisabledDoneButton = computed(() => {
    return !((showStep3.value && paymentStatus.value !== 'ยังไม่ชำระเงิน') || !showStep3.value);
});
const paymentStatusColor = computed(() => {
    return paymentStatus.value === 'ยังไม่ชำระเงิน' ? 'red' : 'green';
});
</script>
<template>
    <v-dialog max-width="600px">
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
                                        <v-text-field v-model="userDetail.phone" label="เบอร์โทร"
                                                      outlined></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-text-field v-model="userDetail.address" label="ที่อยู่"
                                                      outlined></v-text-field>
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
                                        <v-select
                                            v-model="payment"
                                            :items="paymentItems"
                                            label="ช่องทางชำระเงิน"
                                            outlined
                                        ></v-select>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </v-card>
                    </template>

                    <template v-if="showStep3" v-slot:item.3>
                        <v-card title="QR Code" flat>
                            <v-card-text class="d-flex flex-column justify-center align-center">
                                <img :src="props.qrCodePayment" alt="QR Code"/>
                                <v-chip :style="{ color: paymentStatusColor }">{{ paymentStatus }}</v-chip>

                            </v-card-text>

                            <v-file-input
                                v-model="paymentSlip"
                                label="อัพโหลดสลิปการโอนเงิน"
                                prepend-icon="mdi-paperclip"
                                accept="image/*"
                                @change="handleFileChange"
                                chips
                                show-size
                            />
                            <div class="d-flex flex-column justify-center align-center mt-3">
                                <v-img :src="paymentSlipReader" v-if="paymentSlipReader" width="30%"></v-img>
                            </div>


                            <div class="d-flex justify-center align-content-center mt-3">
                                <v-btn
                                    :loading="loading"
                                    :disabled="!paymentSlip"
                                    class="flex-grow-1"
                                    height="48"
                                    variant="tonal"
                                    @click="uploadPaymentSlip"
                                >
                                    ส่งหลักฐาน
                                </v-btn>
                            </div>


                        </v-card>
                    </template>


                    <template v-if="!showStep3" v-slot:item.3>
                        <div class="d-flex flex-column justify-center align-center">

                            <LottieAnimation animationPath="src/assets/lottie/lottieFile/place_order.json"
                                             width="100%" height="100%"/>
                            <h3>🎉 วางคำสั่งซื้อเรียร้อยแล้ว 🎉</h3>
                        </div>
                    </template>

                    <template v-slot:actions>
                        <div class="d-flex justify-space-between w-100">
                            <v-btn v-if="activeStep > 1" @click="activeStep--" class="mr-auto">ย้อนกลับ</v-btn>
                            <v-btn v-if="activeStep < 3" @click="activeStep++" class="ml-auto">ถัดไป</v-btn>
                            <v-btn color="success" v-if="activeStep === 3" :disabled="isDisabledDoneButton"
                                   @click="placeOrder"
                                   prepend-icon="mdi-check-circle" class="ml-auto">เสร็จ
                            </v-btn>
                            <v-btn v-if="showStep3 === true && activeStep === 3" @click="debugPaymentStatus" density="comfortable" icon="mdi-bug" size="x-small"></v-btn>
                        </div>
                    </template>

                </v-stepper>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>
