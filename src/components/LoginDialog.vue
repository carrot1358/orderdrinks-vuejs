<script setup>
import { ref, computed, inject } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { User_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import logo from '@images/svg/logo.svg?raw'

const props = defineProps({
    modelValue: Boolean,
});

const emit = defineEmits(['update:modelValue']);

const router = useRouter();
const $swal = inject('$swal');

const isPasswordVisible = ref(false);
const remember = ref(false);
const form = ref({
    phone: '',
    password: '',
});

const isFormValid = computed(() => {
    return form.value.phone.trim() !== '' && form.value.password.trim() !== '';
});

const Login = async () => {
    try {
        const formData = new FormData();
        formData.append('phone', form.value.phone);
        formData.append('password', form.value.password);
        await axios.post(User_ENDPOINTS.loginUser, formData).then((response) => {
            if (response.status === 200) {
                const data = response.data.data
                if (remember.value) {
                    localStorage.setItem('jwtToken', data.accessToken);
                } else {
                    sessionStorage.setItem('jwtToken', data.accessToken);
                }
                axios.get(User_ENDPOINTS.getProfile, {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`
                    }
                }).then((response) => {
                    if (remember.value) {
                        localStorage.setItem('userinfo', JSON.stringify(response.data.data))
                    } else {
                        sessionStorage.setItem('userinfo', JSON.stringify(response.data.data))
                    }
                }).catch((error) => {
                    console.log(error)
                })
                closeDialog()
                $swal({
                    title: 'เข้าสู่ระบบสำเร็จ!',
                    text: 'กำลังนำคุณไปยังหน้าหลัก...',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    window.location.reload();
                });
            } else {
                closeDialog()
                $swal({
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถเข้าสู่ระบบได้',
                    icon: 'error',
                    confirmButtonText: 'ลองอีกครั้ง'
                })
            }
        }).catch((error) => {
            closeDialog()
            $swal({
                title: 'เกิดข้อผิดพลาด',
                text: error.response.data.message,
                icon: 'error',
                confirmButtonText: 'ตกลง'
            })
        })
    } catch (error) {
        closeDialog()
        $swal({
            title: 'เกิดข้อผิดพลาด',
            text: error,
            icon: 'error',
            confirmButtonText: 'ตกลง'
        })
    }
};

const closeDialog = () => {
    emit('update:modelValue', false);
};

const resetForm = () => {
    form.value = {
        phone: '',
        password: '',
    };
    isPasswordVisible.value = false;
    remember.value = false;
};

const loginWithLine = () => {
    window.location.href = 'https://backend.nattapad.me/line/login';
};
</script>

<template>
    <VDialog 
        :model-value="modelValue" 
        @update:model-value="(val) => emit('update:modelValue', val)"
        max-width="448px" 
        @before-leave="resetForm"
        content-class="login-dialog"
    >
        <VCard class="auth-card pa-4 pt-7">
            <VCardItem class="justify-center">
                <template #prepend>
                    <div class="d-flex">
                        <div class="d-flex text-primary" v-html="logo" />
                    </div>
                </template>

                <VCardTitle class="text-2xl font-weight-bold">
                    OrderDrinks
                </VCardTitle>
            </VCardItem>

            <VCardText class="pt-2">
                <h5 class="text-h5 mb-1">
                    ยินดีต้องรับเข้าสู่ Order Drinks! 👋🏻
                </h5>
                <p class="mb-0">
                    กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
                </p>
            </VCardText>

            <VCardText>
                <VForm @submit.prevent="Login">
                    <VRow>
                        <VCol cols="12">
                            <VTextField v-model="form.phone" autofocus placeholder="094575****" label="เบอร์โทรศัพท์"
                                type="phone" />
                        </VCol>

                        <VCol cols="12">
                            <VTextField v-model="form.password" label="รหัสผ่าน" placeholder="············"
                                :type="isPasswordVisible ? 'text' : 'password'"
                                :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                                @click:append-inner="isPasswordVisible = !isPasswordVisible" />

                            <div class="d-flex align-center justify-space-between flex-wrap mt-1 mb-4">
                                <RouterLink class="text-primary ms-2 mb-1" to="javascript:void(0)">
                                    ลืมรหัสผ่าน?
                                </RouterLink>
                            </div>

                            <VBtn block type="submit" :disabled="!isFormValid">
                                Login
                            </VBtn>
                        </VCol>

                        <VCol cols="12" class="text-center">
                            <VBtn block color="success" @click="loginWithLine" class="mt-2">
                                <i class="bx bxl-line me-2"></i>
                                เข้าสู่ระบบด้วย Line
                            </VBtn>
                        </VCol>
                    </VRow>
                </VForm>
            </VCardText>
        </VCard>
    </VDialog>
</template>

<style lang="scss" scoped>
@use "@core/scss/template/pages/page-auth.scss";

:deep(.login-dialog) {
    z-index: 1000 !important;
}
</style>