<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import { User_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import LocationPicker from '@/components/LocationPicker.vue';
import Swal from 'sweetalert2';

const props = defineProps({
    jwtToken: String,
    onClose: Function,
    onCreate: Function,
    isDriver: Boolean,
    isAdmin: Boolean,
});

const newUser = ref({
    name: '',
    phone: '',
    password: '',
    isAdmin: false,
    role: 'user',
    passwordConfirmExisted: '',
    address: '',
    lat: '',
    lng: '',
});

const locationData = ref({
    address: '',
    lat: '',
    lng: ''
});

watch(locationData, (newValue) => {
    newUser.value.address = newValue.address;
    newUser.value.lat = newValue.lat;
    newUser.value.lng = newValue.lng;
}, { deep: true });

const createUser = async () => {
    try {
        const formData = new FormData();
        Object.keys(newUser.value).forEach(key => {
            if (newUser.value[key] !== null && newUser.value[key] !== undefined) {
                formData.append(key, newUser.value[key]);
            }
        });

        console.log('Creating user with data:', Object.fromEntries(formData));

        const response = await axios.post(User_ENDPOINTS.createUser, formData, {
            headers: {
                'Authorization': `Bearer ${props.jwtToken}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data && response.data.success) {
            Swal.fire({
                icon: 'success',
                title: 'สร้างผู้ใช้ใหม่สำเร็จ',
                showConfirmButton: false,
                timer: 1500,
                customClass: {
                    container: 'swal-on-top'
                },
                target: document.body
            });

            props.onCreate();
            props.onClose();
        } else {
            throw new Error(response.data.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้');
        }
    } catch (err) {
        console.error('Error creating user:', err);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้',
            text: err.response?.data?.message || err.message || 'กรุณาลองใหม่อีกครั้ง',
            customClass: {
                container: 'swal-on-top'
            },
            target: document.body
        });
    }
};
</script>

<template>
    <v-card>
        <v-card-title>เพิ่มผู้ใช้ใหม่</v-card-title>
        <v-card-text>
            <v-text-field class="mb-4" prepend-icon="mdi-account" v-model="newUser.name" label="ชื่อ" required></v-text-field>
            <v-text-field class="mb-4" prepend-icon="mdi-phone" v-model="newUser.phone" label="เบอร์โทร" required></v-text-field>
            <v-text-field class="mb-2" prepend-icon="mdi-lock" v-model="newUser.password" label="รหัสผ่าน" type="password" required></v-text-field>
            <v-text-field class="mb-2" prepend-icon="mdi-lock" v-model="newUser.passwordConfirmExisted" label="รหัสเชื่อมโยงบัญชีผู้ใช้" required></v-text-field>
            <v-checkbox class="mb-4" v-if="isAdmin" v-model="newUser.isAdmin" label="เป็นผู้ดูแลระบบ"></v-checkbox>
            <v-select class="mb-4" v-if="isAdmin" v-model="newUser.role" :items="['user', 'admin', 'driver', 'manager']" label="บทบาท"
                required></v-select>
            <LocationPicker v-model="locationData" />
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="props.onClose">ยกเลิก</v-btn>
            <v-btn color="primary" text @click="createUser">สร้าง</v-btn>
        </v-card-actions>
    </v-card>
</template>

<style scoped>
.swal-on-top {
    z-index: 9999 !important;
}
</style>