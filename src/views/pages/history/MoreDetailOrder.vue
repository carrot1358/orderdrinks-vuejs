<script setup>
import { defineProps, defineEmits, ref, computed, watch } from 'vue';
import { usePaymentStore } from '@/stores/paymentStore';
import axios from 'axios';
import { Order_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import { inject } from 'vue';

const $swal = inject('$swal');
const paymentStore = usePaymentStore();

const props = defineProps({
    showDialog: Boolean,
    selectedOrder: Object,
    qrCodePayment: String,
});

const emit = defineEmits(['update:showDialog', 'orderUpdated']);

const Api_URL = import.meta.env.VITE_API_URL;

const updateDialog = (value) => {
    emit('update:showDialog', value);
};

const closeDialog = () => {
    emit('update:showDialog', false);
    resetPaymentData();
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
};

const getStatusColor = (status) => {
    switch (status) {
        case 'paid':
        case 'completed':
            return 'success';
        case 'pending':
        case 'delivering':
            return 'warning';
        case 'not_paid':
        case 'cancel':
        case 'cancelled':
            return 'error';
        default:
            return 'info';
    }
};

const cancelOrder = async () => {
    try {
        const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
        await axios.put(`${Order_ENDPOINTS.cancelOrder}/${props.selectedOrder.orderId}`, {}, {
            headers: {
                authorization: `Bearer ${jwtToken}`,
            },
        });
        emit('orderUpdated');
        closeDialog();
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ:', error);
    }
};

const paymentStatus = ref('ยังไม่ชำระเงิน');
const paymentSlip = ref(null);
const paymentSlipReader = ref(null);
const loading = ref(false);
const showPaymentDialog = ref(false);

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
    const result = await paymentStore.checkPaymentStatus(props.selectedOrder.orderId, paymentSlip.value);
    if (result.statusPaid === "paid") {
        paymentStatus.value = "ชำระเงินสำเร็จ";
        showPaymentDialog.value = false;
        await $swal.fire({
            icon: 'success',
            title: 'ชำระเงินสำเร็จ',
            text: 'ขอบคุณสำหรับการสั่งซื้อ',
            timer: 2000,
            showConfirmButton: false,
        });
        emit('orderUpdated');
        closeDialog();
    } else {
        paymentStatus.value = result.message;
    }
    loading.value = false;
};

const resetPaymentData = () => {
    paymentStatus.value = 'ยังไม่ชำระเงิน';
    paymentSlip.value = null;
    paymentSlipReader.value = null;
    loading.value = false;
};

watch(showPaymentDialog, (newValue) => {
    if (!newValue) {
        resetPaymentData();
    }
});
</script>

<template>
    <v-dialog :model-value="showDialog" @update:model-value="updateDialog" max-width="900px">
        <v-card v-if="selectedOrder" class="order-detail-card">
            <v-card-title class="text-h5 font-weight-bold pa-6 primary white--text">
                รายละเอียดคำสั่งซื้อ
                <v-chip color="white" text-color="primary" class="ml-2">
                    {{ selectedOrder.orderId }}
                </v-chip>
            </v-card-title>
            <v-card-text class="pa-6">
                <!-- Customer Information -->
                <v-row>
                    <v-col cols="12" md="6">
                        <v-card outlined class="mb-4">
                            <v-card-title class="subtitle-1 font-weight-bold">
                                <v-icon left color="primary">mdi-account</v-icon>
                                ข้อมูลลูกค้า
                            </v-card-title>
                            <v-card-text>
                                <v-list dense>
                                    <v-list-item>
                                        <v-list-item-title><v-icon>mdi-account</v-icon>{{ selectedOrder.userId.name
                                            }}</v-list-item-title>
                                        <v-list-item-subtitle>ข้อมูลลูกค้า</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title><v-icon>mdi-phone</v-icon> {{ selectedOrder.userId.phone
                                            }}</v-list-item-title>
                                        <v-list-item-subtitle>เบอร์โทรศัพท์</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title><v-icon>mdi-email</v-icon> {{ selectedOrder.userId.email
                                            }}</v-list-item-title>
                                        <v-list-item-subtitle>อีเมล</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title><v-icon>mdi-map-marker</v-icon> {{
                                            selectedOrder.userId.address }}</v-list-item-title>
                                        <v-list-item-subtitle>ที่อยู่</v-list-item-subtitle>
                                    </v-list-item>
                                </v-list>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-card outlined class="mb-4">
                            <v-card-title class="subtitle-1 font-weight-bold">
                                <v-icon left color="primary">mdi-information</v-icon>
                                ข้อมูลการสั่งซื้อ
                            </v-card-title>
                            <v-card-text>
                                <v-list dense>
                                    <v-list-item>
                                        <v-list-item-subtitle><v-icon>mdi-calendar</v-icon>
                                            วันที่สั่งซื้อ</v-list-item-subtitle>
                                        <v-list-item-title>{{ formatDate(selectedOrder.createdAt) }}</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-subtitle><v-icon>mdi-cash</v-icon>
                                            วิธีการชำระเงิน</v-list-item-subtitle>
                                        <v-list-item-title>{{ selectedOrder.methodPaid }}</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-subtitle><v-icon>mdi-cash-check</v-icon>
                                            สถานะการชำระเงิน</v-list-item-subtitle>
                                        <v-chip :color="getStatusColor(selectedOrder.statusPaid)" small label>
                                            {{ selectedOrder.statusPaid }}
                                        </v-chip>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-subtitle><v-icon>mdi-truck-delivery</v-icon>
                                            สถานะการจัดส่ง</v-list-item-subtitle>
                                        <v-chip :color="getStatusColor(selectedOrder.deliverStatus)" small label>
                                            {{ selectedOrder.deliverStatus }}
                                        </v-chip>
                                    </v-list-item>
                                </v-list>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Product List -->
                <v-card outlined class="mb-4">
                    <v-card-title class="subtitle-1 font-weight-bold">
                        <v-icon left color="primary">mdi-cart</v-icon>
                        รายการสินค้า
                    </v-card-title>
                    <v-card-text>
                        <v-table>
                            <template v-slot:default>
                                <thead>
                                    <tr>
                                        <th class="text-left">สินค้า</th>
                                        <th class="text-center">จำนวน</th>
                                        <th class="text-right">ราคาต่อชิ้น</th>
                                        <th class="text-right">ราคารวม</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="product in selectedOrder.products" :key="product._id"
                                        class="product-row">
                                        <td>
                                            <v-avatar size="32" class="mr-2">
                                                <v-img
                                                    :src="product.productId.imagePath ? `${Api_URL}${product.productId.imagePath}` : 'https://via.placeholder.com/150'"
                                                    :alt="product.productId.name"></v-img>
                                            </v-avatar>
                                            {{ product.productId.name }}
                                        </td>
                                        <td class="text-center">{{ product.quantity }}</td>
                                        <td class="text-right">{{ product.productId.price.toLocaleString() }} บาท</td>
                                        <td class="text-right">{{ (product.productId.price *
                                            product.quantity).toLocaleString() }} บาท</td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="3" class="text-right font-weight-bold">ราคารวมทั้งหมด:</td>
                                        <td class="text-right">
                                            <v-chip color="primary" label>
                                                {{ selectedOrder.totalPrice.toLocaleString() }} บาท
                                            </v-chip>
                                        </td>
                                    </tr>
                                </tfoot>
                            </template>
                        </v-table>
                    </v-card-text>
                </v-card>

                <!-- Payment Slip -->
                <v-card v-if="selectedOrder.slipImage" outlined class="mb-4">
                    <v-card-title class="subtitle-1 font-weight-bold">
                        <v-icon left color="primary">mdi-image</v-icon>
                        หลักฐานการชำระเงิน
                    </v-card-title>
                    <v-card-text>
                        <v-img :src="selectedOrder.slipImage ? `${Api_URL}${selectedOrder.slipImage}` : ''"
                            max-height="300" contain class="grey lighten-2"></v-img>
                    </v-card-text>
                </v-card>
            </v-card-text>
            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn v-if="selectedOrder.statusPaid !== 'paid'" color="primary" @click="showPaymentDialog = true">
                    ชำระเงิน
                </v-btn>
                <v-btn v-if="selectedOrder.deliverStatus !== 'cancel' && selectedOrder.deliverStatus !== 'delivered'"
                    color="error" @click="cancelOrder">
                    ยกเลิกคำสั่งซื้อ
                </v-btn>
                <v-btn color="primary" @click="closeDialog">ปิด</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Payment Dialog -->
    <v-dialog v-model="showPaymentDialog" max-width="500px">
        <v-card>
            <v-card-title>ชำระเงิน</v-card-title>
            <v-card-text>
                <v-img v-if="props.qrCodePayment" :src="props.qrCodePayment" alt="QR Code" />
                <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
                <v-chip :color="paymentStatus === 'ชำระเงินสำเร็จ' ? 'success' : 'warning'">{{ paymentStatus }}</v-chip>
                <v-file-input v-model="paymentSlip" label="อัพโหลดสลิปการโอนเงิน" prepend-icon="mdi-paperclip"
                    accept="image/*" @change="handleFileChange" chips show-size />
                <v-img :src="paymentSlipReader" v-if="paymentSlipReader" width="100%"></v-img>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn :loading="loading" :disabled="!paymentSlip" color="primary" @click="uploadPaymentSlip">
                    ส่งหลักฐาน
                </v-btn>
                <v-btn color="error" @click="showPaymentDialog = false">ปิด</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>



<style scoped>
.order-detail-card {
    border-radius: 8px;
    overflow: hidden;
}

.order-detail-card .v-card__title {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.order-detail-card .v-card__text {
    padding-top: 20px;
}

.v-list-item {
    padding: 0;
}

.v-avatar {
    border: 1px solid rgba(0, 0, 0, 0.12);
}

.v-simple-table {
    background-color: transparent !important;
}

.v-simple-table th {
    font-weight: bold;
    text-transform: uppercase;
    font-size: 0.875rem;
}

.v-simple-table td {
    height: 60px;
    vertical-align: middle;
}

.product-row {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.product-row:last-child {
    border-bottom: none;
}

.v-chip {
    font-weight: 500;
}

.v-list-item-content {
    flex-direction: row !important;
}

.v-list-item-title {
    flex: 1;
}

.v-list-item-subtitle {
    flex: 2;
}
</style>