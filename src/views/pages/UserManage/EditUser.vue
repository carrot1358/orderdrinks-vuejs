<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import { User_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import LocationPicker from '@/components/LocationPicker.vue';

const props = defineProps({
    user: Object,
    jwtToken: String,
    onClose: Function,
    onUpdate: Function,
    isDriver: Boolean,
    isAdmin: Boolean,
});

const editingUser = ref({ ...props.user });
const avatarPreview = ref(null);

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        editingUser.value.avatar = file;
        avatarPreview.value = URL.createObjectURL(file);
    }
};

const currentAvatarUrl = computed(() => {
    if (avatarPreview.value) {
        return avatarPreview.value;
    } else if (editingUser.value && editingUser.value.avatar) {
        return `${import.meta.env.VITE_API_URL}${editingUser.value.avatar}`;
    }
    return null;
});

const updateUser = async () => {
    try {
        const formData = new FormData();
        Object.keys(editingUser.value).forEach(key => {
            if (editingUser.value[key] !== null && editingUser.value[key] !== undefined) {
                if (key === 'avatar') {
                    if (editingUser.value[key] instanceof File) {
                        formData.append('avatar', editingUser.value[key]);
                    }
                } else {
                    formData.append(key, editingUser.value[key]);
                }
            }
        });

        console.log('Updating user data:', Object.fromEntries(formData));

        const response = await axios.put(`${User_ENDPOINTS.updateUser}${editingUser.value.userId}`, formData, {
            headers: {
                'Authorization': `Bearer ${props.jwtToken}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data && response.data.success) {
            swal.fire({
                icon: 'success',
                title: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
                showConfirmButton: false,
                timer: 1500,
                customClass: {
                    container: 'swal-on-top'
                }
            });

            props.onUpdate();
            props.onClose();
        } else {
            throw new Error(response.data.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้');
        }
    } catch (err) {
        console.error('Error updating user:', err);
        swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล',
            text: err.response?.data?.message || err.message || 'กรุณาลองใหม่อีกครั้ง',
            customClass: {
                container: 'swal-on-top'
            }
        });
        props.onClose();
    }
};

const updateIsAdmin = (newRole) => {
    if (newRole === 'admin') {
        editingUser.value.isAdmin = true;
    }
};

const locationData = ref({
    address: props.user.address || '',
    lat: props.user.lat || '',
    lng: props.user.lng || ''
});

watch(locationData, (newValue) => {
    editingUser.value.address = newValue.address;
    editingUser.value.lat = newValue.lat;
    editingUser.value.lng = newValue.lng;
}, { deep: true });

// ลบฟังก์ชัน updateLocationData ออก เนื่องจากเราจะใช้ watch แทน

watch(() => editingUser.value.role, (newRole) => {
    if (newRole === 'admin') {
        editingUser.value.isAdmin = true;
    }
});
</script>

<template>
    <v-card>
        <v-card-title>แก้ไขข้อมูลผู้ใช้</v-card-title>
        <v-card-text>
            <v-form @submit.prevent="updateUser">
                <v-avatar size="150" class="mb-4">
                    <v-img v-if="currentAvatarUrl" :src="currentAvatarUrl" alt="Avatar Preview"></v-img>
                    <v-icon v-else size="150" color="grey lighten-1">mdi-account-circle</v-icon>
                </v-avatar>

                <v-file-input class="mb-2" prepend-icon="mdi-camera" label="รูปโปรไฟล์" @change="handleFileChange"
                    accept="image/*"></v-file-input>

                <v-text-field class="mb-2" prepend-icon="mdi-account" v-model="editingUser.name" label="ชื่อ"
                    required></v-text-field>
                <v-text-field class="mb-2" prepend-icon="mdi-phone" v-model="editingUser.phone" label="เบอร์โทร"
                    required></v-text-field>
                <v-text-field class="mb-2" prepend-icon="mdi-lock" v-model="editingUser.password" label="รหัสผ่าน"
                    type="password"></v-text-field>
                <v-select v-if="isAdmin" class="mb-2" v-model="editingUser.role"
                    :items="['admin', 'driver', 'manager', 'user']" label="บทบาท" required
                    @update:model-value="updateIsAdmin"></v-select>

                <LocationPicker v-model="locationData" />
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="error" text @click="props.onClose">ยกเลิก</v-btn>
            <v-btn color="success" text @click="updateUser">บันทึก</v-btn>
        </v-card-actions>
    </v-card>
</template>

<style scoped>
.swal-on-top {
    z-index: 9999 !important;
}
</style>