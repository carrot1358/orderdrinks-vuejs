<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { User_ENDPOINTS } from '@/assets/config/api/api_endPoints';

const props = defineProps({
    jwtToken: String,
    onClose: Function,
    onCreate: Function,
    swal: Object,
});

const newUser = ref({
    name: '',
    phone: '',
    password: '',
    isAdmin: false,
    role: 'user',
});

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
            props.swal.fire({
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
        props.swal.fire({
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
            <v-text-field v-model="newUser.name" label="ชื่อ" required></v-text-field>
            <v-text-field v-model="newUser.phone" label="เบอร์โทร" required></v-text-field>
            <v-text-field v-model="newUser.password" label="รหัสผ่าน" type="password" required></v-text-field>
            <v-checkbox v-model="newUser.isAdmin" label="เป็นผู้ดูแลระบบ"></v-checkbox>
            <v-select v-model="newUser.role" :items="['user', 'admin', 'driver', 'manager']" label="บทบาท"
                required></v-select>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="props.onClose">ยกเลิก</v-btn>
            <v-btn color="blue darken-1" text @click="createUser">สร้าง</v-btn>
        </v-card-actions>
    </v-card>
</template>

<style scoped>
.swal-on-top {
    z-index: 9999 !important;
}
</style>