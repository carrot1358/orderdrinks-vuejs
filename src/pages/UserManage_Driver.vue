<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { User_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import { useRouter } from 'vue-router';
import { inject } from 'vue';
import EditUser from '@/views/pages/UserManage/EditUser.vue';
import CreateUser from '@/views/pages/UserManage/CreateUser.vue';
import { DotLottieVue } from '@lottiefiles/dotlottie-vue'

const $swal = inject('$swal');
const router = useRouter();

const users = ref([]);
const loading = ref(true);
const error = ref(null);
const showEditDialog = ref(false);
const showCreateDialog = ref(false);
const selectedUser = ref(null);

// เพิ่ม computed properties สำหรับ nameMatch และ phoneMatch
const nameMatch = computed(() => {
    return (user) => user.name?.toLowerCase().includes(searchUsername.value.toLowerCase()) ?? false;
});

const phoneMatch = computed(() => {
    return (user) => user.phone?.includes(searchPhone.value) ?? false;
});

const jwtToken = computed(() => localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken'));

const fetchUsers = async () => {
    try {
        loading.value = true;
        const response = await axios.get(User_ENDPOINTS.getUsers, {
            headers: { 'Authorization': `Bearer ${jwtToken.value}` }
        });
        users.value = response.data.data;
    } catch (err) {
        error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้';
        console.error(err);
    } finally {
        loading.value = false;
    }
};

const openEditDialog = (user) => {
    selectedUser.value = user;
    showEditDialog.value = true;
};

const deleteUser = async (userId) => {
    try {
        const result = await $swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: "การลบผู้ใช้นี้ไม่สามารถเรียกคืนได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก',
            customClass: {
                popup: 'swal-on-top'
            }
        });

        if (result.isConfirmed) {
            await axios.delete(`${User_ENDPOINTS.deleteUser}${userId}`, {
                headers: { 'Authorization': `Bearer ${jwtToken.value}` }
            });

            $swal.fire(
                'ลบสำเร็จ!',
                'ผู้ใช้ถูกลบออกจากระบบแล้ว',
                'success',
                {
                    customClass: {
                        popup: 'swal-on-top'
                    }
                }
            );

            await fetchUsers();
        }
    } catch (err) {
        console.error(err);
        $swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาดในการลบผู้ใช้',
            text: err.response?.data?.message || 'กรุณาลองใหม่อีกครั้ง',
            customClass: {
                popup: 'swal-on-top'
            }
        });
    }
};

onMounted(async () => {
    const userInfo = JSON.parse(localStorage.getItem('userinfo') || sessionStorage.getItem('userinfo') || '{}');
    if (!userInfo || userInfo.role !== 'driver' || !userInfo.isAdmin) {
        $swal.fire({
            icon: 'error',
            title: 'ไม่มีสิทธิ์เข้าถึง',
            text: 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้ ' + userInfo.role,
            customClass: {
                popup: 'swal-on-top'
            }
        });
        router.push('/');
        return;
    }
    await fetchUsers();
});

const roleFilter = ref('ทั้งหมด');
const searchUsername = ref('');
const searchPhone = ref('');

// ปรับปรุง filteredUsers computed property
const filteredUsers = computed(() => {
    if (!Array.isArray(users.value)) return [];
    return users.value.filter(user => {
        const roleMatch = roleFilter.value === 'ทั้งหมด' || user.role === roleFilter.value;
        return nameMatch.value(user) && phoneMatch.value(user) && roleMatch;
    });
});

const apiUrl = computed(() => import.meta.env.VITE_API_URL);

const getAvatarUrl = (avatar) => {
    return avatar ? `${apiUrl.value}${avatar}` : '/path/to/default/avatar.png';
};

const getRoleColor = (role) => {
    switch (role) {
        case 'admin':
            return 'error';
        case 'driver':
            return 'success';
        case 'manager':
            return 'warning';
        case 'user':
        default:
            return 'primary';
    }
};

const getRoleIcon = (role) => {
    switch (role) {
        case 'admin':
            return 'mdi-shield-account';
        case 'driver':
            return 'mdi-truck-delivery';
        case 'manager':
            return 'mdi-account-tie';
        case 'user':
        default:
            return 'mdi-account';
    }
};
</script>

<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <v-card class="mb-4">
                    <v-card-title class="text-h4 font-weight-bold primary--text py-4">
                        <v-icon large left color="primary">mdi-account-group</v-icon>
                        จัดการผู้ใช้
                    </v-card-title>
                    <v-card-text>
                        <v-row align="center">
                            <v-col cols="12" sm="6" md="3">
                                <v-text-field v-model="searchUsername" prepend-inner-icon="mdi-account-search"
                                    label="ค้นหาชื่อผู้ใช้" single-line hide-details outlined dense></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="3">
                                <v-text-field v-model="searchPhone" prepend-inner-icon="mdi-phone"
                                    label="ค้นหาเบอร์โทรศัพท์" single-line hide-details outlined dense></v-text-field>
                            </v-col>
                            <v-col cols="12" sm="6" md="3">
                                <v-select v-model="roleFilter"
                                    :items="['ทั้งหมด', 'admin', 'user', 'driver', 'manager']" label="กรองตามบทบาท"
                                    outlined dense></v-select>
                            </v-col>
                            <v-spacer></v-spacer>
                            <v-col cols="12" sm="auto">
                                <v-btn color="primary" @click="showCreateDialog = true" class="mb-4">
                                    <v-icon left>mdi-plus</v-icon>
                                    เพิ่มผู้ใช้ใหม่
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row v-if="loading">
            <v-col v-for="n in 8" :key="n" cols="12" sm="6" md="4" lg="3">
                <v-skeleton-loader
                    type="card"
                    class="mb-4"
                    height="350"
                ></v-skeleton-loader>
            </v-col>
        </v-row>

        <v-row v-else-if="filteredUsers.length">
            <v-col v-for="user in filteredUsers" :key="user.userId" cols="12" sm="6" md="4" lg="3">
                <v-card class="user-card d-flex flex-column align-center text-center pa-4" elevation="2">
                    <v-avatar size="200" color="grey lighten-2" class="mb-4">
                        <v-img v-if="user.avatar" :src="getAvatarUrl(user.avatar)" cover></v-img>
                        <v-icon v-else size="128" color="grey darken-2">
                            mdi-account-circle
                        </v-icon>
                    </v-avatar>
                    <v-card-title class="text-h5 mb-2">{{ user.name }}</v-card-title>
                    <v-chip :color="getRoleColor(user.role)" class="mb-3">
                        <v-icon start :icon="getRoleIcon(user.role)"></v-icon>
                        {{ user.role }}
                    </v-chip>
                    <v-card-text class="text-center">
                        <div class="mb-2">
                            <v-icon small class="mr-2">mdi-email</v-icon>
                            <span>{{ user.email ? user.email : 'ไม่มี E-mail' }}</span>
                        </div>
                        <div>
                            <v-icon small class="mr-2">mdi-phone</v-icon>
                            <span>{{ user.phone ? user.phone : 'ไม่มีเบอร์โทรศัพท์' }}</span>
                        </div>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn icon small @click="openEditDialog(user)" color="primary" class="mr-2">
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon small @click="deleteUser(user.userId)" color="error">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
        <v-row v-else>
            <v-col style="height: 500px; position: relative;">
                <div class="d-flex justify-center align-center" style="height: 100%;">
                    <DotLottieVue style="height: 500px; width: 500px;" autoplay loop
                        src="https://lottie.host/47a41b03-c713-49bf-b695-389f6fb679bd/WSEOYKZcRX.json" />
                </div>
                <h1 class="text-h4 font-weight-bold primary--text text-center overlay-text">ไม่พบผู้ใช้</h1>
            </v-col>
        </v-row>

        <v-dialog v-model="showEditDialog" max-width="500px">
            <EditUser :user="selectedUser" :jwtToken="jwtToken" :onClose="() => showEditDialog = false"
                :onUpdate="fetchUsers" :swal="$swal" />
        </v-dialog>

        <v-dialog v-model="showCreateDialog" max-width="500px">
            <CreateUser :jwtToken="jwtToken" :onClose="() => showCreateDialog = false" :onCreate="fetchUsers"
                :swal="$swal" />
        </v-dialog>
    </v-container>
</template>

<style scoped>
.overlay-text {
    position: absolute;
    top: 30px;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 1;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.user-card {
    transition: all 0.3s;
    height: 100%;
}

.user-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.swal-on-top {
    z-index: 9999 !important;
}

.v-skeleton-loader {
    border-radius: 12px;
    overflow: hidden;
}
</style>
