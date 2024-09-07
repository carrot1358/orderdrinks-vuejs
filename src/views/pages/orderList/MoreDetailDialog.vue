<script setup>
import { ref, watch, computed } from 'vue';
import axios from 'axios';
import { Order_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import { LongdoMap } from "longdo-map-vue";

const props = defineProps({
    selectedOrder: Object,
    showDialog: Boolean,
});

const emit = defineEmits(['update:showDialog', 'orderUpdated']);

const localSelectedOrder = ref({ ...props.selectedOrder });
const editMode = ref(false);
const mapInstance = ref(null);
const zoom = ref(15);

watch(() => props.selectedOrder, (newValue) => {
    localSelectedOrder.value = { ...newValue };
}, { deep: true });

const getStatusText = (status, type) => {
    if (type === 'statusPaid') {
        switch (status) {
            case 'paid': return 'ชำระเงินแล้ว';
            case 'not_paid': return 'ยังไม่ชำระเงิน';
            case 'check_paid': return 'ตรวจสอบการชำระเงิน';
            case 'wait_paid': return 'รอชำระเงิน';
            case 'error': return 'เกิดข้อผิดพลาด';
            default: return status;
        }
    } else if (type === 'deliverStatus') {
        switch (status) {
            case 'pending': return 'รอดำเนินการ';
            case 'delivering': return 'กำลังจัดส่ง';
            case 'delivered': return 'จัดส่งแล้ว';
            case 'cancel': return 'ยกเลิก';
            default: return status;
        }
    } else if (type === 'methodPaid') {
        switch (status) {
            case 'cash': return 'เงินสด';
            case 'promptpay': return 'พร้อมเพย์';
            default: return status;
        }
    }
    return status;
};

const loadMap = (map) => {
    mapInstance.value = map;
    map.Layers.setBase(longdo.Layers.NORMAL);
    addMarker();
};

const addMarker = () => {
    if (mapInstance.value && localSelectedOrder.value) {
        const { lat, lng } = localSelectedOrder.value.userId;
        const marker = new longdo.Marker(
            { lon: lng, lat: lat },
            {
                title: 'ตำแหน่งลูกค้า',
                icon: {
                    url: 'https://map.longdo.com/mmmap/images/pin_mark.png',
                    offset: { x: 12, y: 45 }
                }
            }
        );
        mapInstance.value.Overlays.add(marker);
        mapInstance.value.location({ lon: lng, lat: lat }, true);
        mapInstance.value.zoom(zoom.value, true);
    }
};

const openInGoogleMaps = () => {
    if (localSelectedOrder.value) {
        const { lat, lng } = localSelectedOrder.value.userId;
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        window.open(url, '_blank');
    }
};

const updateOrder = async () => {
    const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    const formData = new FormData();
    formData.append('statusPaid', localSelectedOrder.value.statusPaid);
    formData.append('deliverStatus', localSelectedOrder.value.deliverStatus);
    formData.append('methodPaid', localSelectedOrder.value.methodPaid);

    try {
        await axios.put(`${Order_ENDPOINTS.updateOrder}/${localSelectedOrder.value.orderId}`, formData, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'multipart/form-data',
            }
        });
        editMode.value = false;
        emit('orderUpdated');
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอัพเดทคำสั่งซื้อ:', error);
    }
};

const completeOrder = async () => {
    const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    try {
        await axios.put(`${Order_ENDPOINTS.completeOrder}/${localSelectedOrder.value.orderId}`, {}, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
            }
        });
        localSelectedOrder.value.deliverStatus = 'delivered';
        emit('orderUpdated');
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอัพเดทสถานะการจัดส่ง:', error);
    }
};

const cancelOrder = async () => {
    const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
    try {
        await axios.put(`${Order_ENDPOINTS.cancelOrder}/${localSelectedOrder.value.orderId}`, {}, {
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
            }
        });
        localSelectedOrder.value.deliverStatus = 'cancel';
        emit('orderUpdated');
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ:', error);
    }
};

const statusPaidItems = [
    { value: 'paid', text: 'ชำระเงินแล้ว' },
    { value: 'not_paid', text: 'ยังไม่ชำระเงิน' },
    { value: 'check_paid', text: 'ตรวจสอบการชำระเงิน' },
    { value: 'wait_paid', text: 'รอชำระเงิน' },
    { value: 'error', text: 'เกิดข้อผิดพลาด' }
];

const methodPaidItems = [
    { value: 'cash', text: 'เงินสด' },
    { value: 'promptpay', text: 'พร้อมเพย์' }
];

const deliverStatusItems = [
    { value: 'pending', text: 'รอดำเนินการ' },
    { value: 'delivering', text: 'กำลังจัดส่ง' },
    { value: 'delivered', text: 'จัดส่งแล้ว' },
    { value: 'cancel', text: 'ยกเลิก' }
];

const getStatusColor = (status) => {
    switch (status) {
        case 'paid':
        case 'delivered':
            return 'success';
        case 'not_paid':
        case 'cancel':
            return 'error';
        case 'check_paid':
        case 'delivering':
            return 'info';
        case 'wait_paid':
        case 'pending':
            return 'warning';
        default:
            return 'grey';
    }
};
</script>

<template>
    <v-dialog v-model="props.showDialog" fullscreen @update:modelValue="$emit('update:showDialog', $event)">
        <v-card>
            <v-toolbar color="red">
                <v-btn icon @click="$emit('update:showDialog', false)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>รายละเอียดคำสั่งซื้อ</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn v-if="!editMode" text @click="editMode = true">แก้ไขข้อมูล</v-btn>
                <v-btn v-if="editMode" text @click="updateOrder">บันทึก</v-btn>
                <v-btn v-if="editMode" text @click="editMode = false">ยกเลิก</v-btn>
            </v-toolbar>

            <v-container v-if="localSelectedOrder">
                <v-row>
                    <v-col cols="12" md="6">
                        <v-card class="mb-4">
                            <v-card-title>ข้อมูลลูกค้า</v-card-title>
                            <v-card-text>
                                <v-list dense>
                                    <v-list-item>
                                        <v-list-item-title>ชื่อ:</v-list-item-title>
                                        <v-list-item-subtitle>{{ localSelectedOrder.userId.name
                                            }}</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>เบอร์โทร:</v-list-item-title>
                                        <v-list-item-subtitle>{{ localSelectedOrder.userId.phone
                                            }}</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>อีเมล:</v-list-item-title>
                                        <v-list-item-subtitle>{{ localSelectedOrder.userId.email
                                            }}</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>ที่อยู่:</v-list-item-title>
                                        <v-list-item-subtitle>{{ localSelectedOrder.userId.address
                                            }}</v-list-item-subtitle>
                                    </v-list-item>
                                </v-list>
                            </v-card-text>
                        </v-card>

                        <v-card class="mb-4">
                            <v-card-title>ข้อมูลคำสั่งซื้อ</v-card-title>
                            <v-card-text>
                                <template v-if="!editMode">
                                    <v-list dense>
                                        <v-list-item>
                                            <v-list-item-title>วันที่สั่งซื้อ:</v-list-item-title>
                                            <v-list-item-subtitle>{{ new
                                                Date(localSelectedOrder.createdAt).toLocaleString()
                                                }}</v-list-item-subtitle>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-list-item-title>สถานะการชำระเงิน:</v-list-item-title>
                                            <v-chip :color="getStatusColor(localSelectedOrder.statusPaid)"
                                                text-color="white">
                                                {{ getStatusText(localSelectedOrder.statusPaid, 'statusPaid') }}
                                            </v-chip>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-list-item-title>วิธีการชำระเงิน:</v-list-item-title>
                                            <v-chip color="primary" text-color="white">
                                                {{ getStatusText(localSelectedOrder.methodPaid, 'methodPaid') }}
                                            </v-chip>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-list-item-title>ราคารวม:</v-list-item-title>
                                            <v-list-item-subtitle>{{ localSelectedOrder.totalPrice }}
                                                บาท</v-list-item-subtitle>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-list-item-title>สถานะการจัดส่ง:</v-list-item-title>
                                            <v-chip :color="getStatusColor(localSelectedOrder.deliverStatus)"
                                                text-color="white">
                                                {{ getStatusText(localSelectedOrder.deliverStatus, 'deliverStatus') }}
                                            </v-chip>
                                        </v-list-item>
                                    </v-list>
                                </template>
                                <template v-else>
                                    <v-select class="mb-4" v-model="localSelectedOrder.statusPaid" :items="statusPaidItems"
                                        item-title="text" item-value="value" label="สถานะการชำระเงิน"></v-select>
                                    <v-select class="mb-4" v-model="localSelectedOrder.methodPaid" :items="methodPaidItems"
                                        item-title="text" item-value="value" label="วิธีการชำระเงิน"></v-select>
                                    <v-select class="mb-4" v-model="localSelectedOrder.deliverStatus" :items="deliverStatusItems"
                                        item-title="text" item-value="value" label="สถานะการจัดส่ง"></v-select>
                                </template>
                            </v-card-text>
                        </v-card>

                        <v-card>
                            <v-card-title>รายการสินค้า</v-card-title>
                            <v-card-text>
                                <v-list dense>
                                    <v-list-item v-for="product in localSelectedOrder.products" :key="product._id">
                                        <v-list-item-content>
                                            <v-list-item-title>{{ product.productId.name }}</v-list-item-title>
                                            <v-list-item-subtitle>
                                                จำนวน: {{ product.quantity }} | ราคา: {{ product.productId.price *
                                                product.quantity }} บาท
                                            </v-list-item-subtitle>
                                        </v-list-item-content>
                                    </v-list-item>
                                </v-list>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-card class="mb-4">
                            <v-card-title>ตำแหน่งที่อยู่ลูกค้า</v-card-title>
                            <v-card-text>
                                <v-btn @click="openInGoogleMaps" color="primary" class="mb-4">เปิดใน Google Maps</v-btn>
                                <longdo-map @load="loadMap" :zoom="zoom"
                                    style="width: 100%; height: 400px;"></longdo-map>
                            </v-card-text>
                        </v-card>

                        <v-card>
                            <v-card-title>การดำเนินการ</v-card-title>
                            <v-card-text>
                                <v-btn v-if="!editMode && localSelectedOrder.deliverStatus !== 'delivered'"
                                    color="success" @click="completeOrder" class="mr-2 mb-2">
                                    ส่งสินค้าแล้ว
                                </v-btn>
                                <v-btn v-if="!editMode && localSelectedOrder.deliverStatus !== 'cancel'" color="error"
                                    @click="cancelOrder" class="mb-2">
                                    ยกเลิกคำสั่งซื้อ
                                </v-btn>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<style scoped>
.v-card {
    transition: all 0.3s;
}

.v-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
</style>