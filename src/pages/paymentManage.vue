<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { Payment_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import { useRouter } from 'vue-router';
import { inject } from 'vue';

const $swal = inject('$swal');
const router = useRouter();

// เพิ่ม default value สำหรับ paymentInfo
const paymentInfo = ref({
    typePromtpay: '',
    numberPromtpay: ''
});

const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
const isEditing = ref(false);

// ตรวจสอบว่า userInfo มีค่าก่อนใช้งาน
onMounted(async () => {
    const userInfo = JSON.parse(localStorage.getItem('userinfo') || sessionStorage.getItem('userinfo') || '{}');
    if (!userInfo || !userInfo.role) {
        // จัดการกรณีที่ไม่มีข้อมูลผู้ใช้
        $swal.fire({
            icon: 'error',
            title: 'ไม่พบข้อมูลผู้ใช้',
            text: 'กรุณาเข้าสู่ระบบใหม่',
        });
        router.push('/login');
        return;
    }

    await fetchPaymentInfo();
});

// ตรวจสอบค่าก่อนใช้งานใน computed property
const getPromptPayLabel = computed(() => {
    return paymentInfo.value && paymentInfo.value.typePromtpay === 'phone' ? 'เบอร์มือถือ' : 'หมายเลขบัตรประชาชน';
});

const validatePromptPayNumber = () => {
    const number = paymentInfo.value.numberPromtpay;
    const type = paymentInfo.value.typePromtpay;
    
    if (type === 'phone' && number.length !== 10) {
        $swal.fire({
            icon: 'error',
            title: 'ข้อผิดพลาด',
            text: 'เบอร์มือถือต้องมีความยาว 10 หลัก',
        });
        return false;
    } else if (type === 'idCard' && number.length !== 13) {
        $swal.fire({
            icon: 'error',
            title: 'ข้อผิดพลาด',
            text: 'หมายเลขบัตรประชาชนต้องมีความยาว 13 หลัก',
        });
        return false;
    }
    return true;
};

const fetchPaymentInfo = async () => {
    try {
        const response = await axios.get(Payment_ENDPOINTS.getPayments, {
            headers: {
                'authorization': `Bearer ${jwtToken}`
            }
        });
        paymentInfo.value = response.data.data[0];
        console.log(paymentInfo.value);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน:', error);
        $swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถดึงข้อมูลการชำระเงินได้',
        });
    }
};

const updatePaymentInfo = async () => {
    if (!validatePromptPayNumber()) {
        return;
    }
    try {
        const formData = new FormData();
        formData.append('typePromtpay', paymentInfo.value.typePromtpay);
        formData.append('numberPromtpay', paymentInfo.value.numberPromtpay);
        await axios.put(Payment_ENDPOINTS.updatePayment, formData, {
            headers: {
                'authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        isEditing.value = false;
        $swal.fire({
            icon: 'success',
            title: 'อัปเดตสำเร็จ',
            text: 'ข้อมูลการชำระเงินถูกอัปเดตเรียบร้อยแล้ว',
        });
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลการชำระเงิน:', error);
        $swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถอัปเดตข้อมูลการชำระเงินได้',
        });
    }
};
</script>

<template>
    <VRow justify="center">
        <VCol cols="12" sm="8" md="6">
            <VCard>
                <VCardTitle class="text-center">จัดการข้อมูลการชำระเงิน</VCardTitle>
                <VCardText>
                    <VForm @submit.prevent="updatePaymentInfo">
                        <VSelect class="mb-3"
                            v-model="paymentInfo.typePromtpay"
                            :items="[ { text: 'เบอร์มือถือ', value: 'phone' }, { text: 'บัตรประชาชน', value: 'idCard' } ]"
                            item-title="text"
                            item-value="value"
                            label="ประเภท PromptPay"
                            :disabled="!isEditing"
                        ></VSelect>
                        <VTextField class="mb-4"
                            v-model="paymentInfo.numberPromtpay"
                            :label="getPromptPayLabel"
                            :disabled="!isEditing"
                        ></VTextField>
                        <VRow justify="center" class="mt-1">
                            <VCol cols="auto">
                                <VBtn v-if="!isEditing" color="primary" @click="isEditing = true">
                                    แก้ไข
                                </VBtn>
                                <VBtn v-else color="success" type="submit">
                                    บันทึก
                                </VBtn>
                                <VBtn v-if="isEditing" color="error" class="ml-2" @click="isEditing = false">
                                    ยกเลิก
                                </VBtn>
                            </VCol>
                        </VRow>
                    </VForm>
                </VCardText>
            </VCard>
        </VCol>
    </VRow>
</template>
