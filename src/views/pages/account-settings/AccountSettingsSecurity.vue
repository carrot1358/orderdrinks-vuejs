<script setup>
import { ref, inject } from "vue";
import axios from "axios";
import { User_ENDPOINTS } from "@/assets/config/api/api_endPoints";

const props = defineProps(["userProfile"]);
const emit = defineEmits(["update-profile"]);
const $swal = inject("$swal");

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const changePassword = async () => {
    if (newPassword.value !== confirmPassword.value) {
        $swal.fire({
            icon: "error",
            title: "รหัสผ่านไม่ตรงกัน",
            text: "กรุณากรอกรหัสผ่านใหม่ให้ตรงกัน",
        });
        return;
    }

    try {
        const jwtToken =
            localStorage.getItem("jwtToken") ||
            sessionStorage.getItem("jwtToken");
        await axios.put(
            `${User_ENDPOINTS.updateUser}${props.userProfile.userId}`,
            {
                currentPassword: currentPassword.value,
                newPassword: newPassword.value,
            },
            {
                headers: { Authorization: `Bearer ${jwtToken}` },
            }
        );
        $swal.fire({
            icon: "success",
            title: "เปลี่ยนรหัสผ่านสำเร็จ",
            showConfirmButton: false,
            timer: 1500,
        });
        currentPassword.value = "";
        newPassword.value = "";
        confirmPassword.value = "";
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน:", error);
        $swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง",
        });
    }
};
</script>

<template>
    <VCard class="mb-4">
        <VCardTitle>เปลี่ยนรหัสผ่าน</VCardTitle>
        <VCardText>
            <VForm @submit.prevent="changePassword">
                <VTextField
                    class="mb-4"
                    v-model="currentPassword"
                    label="รหัสผ่านปัจจุบัน"
                    type="password"
                    required
                />
                <VTextField
                    class="mb-4"
                    v-model="newPassword"
                    label="รหัสผ่านใหม่"
                    type="password"
                    required
                />
                <VTextField
                    class=""
                    v-model="confirmPassword"
                    label="ยืนยันรหัสผ่านใหม่"
                    type="password"
                    required
                />
                <VBtn type="submit" color="primary" class="mt-4"
                    >เปลี่ยนรหัสผ่าน</VBtn
                >
            </VForm>
        </VCardText>
    </VCard>
</template>
