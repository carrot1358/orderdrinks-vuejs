<script setup>
import { ref, watch } from "vue";
import axios from "axios";
import LocationPicker from "@/components/LocationPicker.vue"; // เพิ่มการนำเข้า LocationPicker

const props = defineProps(["userProfile"]);
const emit = defineEmits(["update-profile"]);

const localUserProfile = ref({ ...props.userProfile });
const avatarPreview = ref(null);
const loading = ref(false);

const userDetail = ref(JSON.parse(localStorage.getItem('userinfo') || sessionStorage.getItem('userinfo') || '{}'));

const location = ref({
    lat: localUserProfile.value.lat,
    lng: localUserProfile.value.lng,
    address: localUserProfile.value.address
});

watch(
    () => props.userProfile,
    (newValue) => {
        localUserProfile.value = { ...newValue };
    },
    { deep: true }
);

watch(location, (newValue) => {
    localUserProfile.value.lat = newValue.lat;
    localUserProfile.value.lng = newValue.lng;
    localUserProfile.value.address = newValue.address;
}, { deep: true });

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        localUserProfile.value.avatar = file;
        avatarPreview.value = URL.createObjectURL(file);
    }
};

const updateProfile = async () => {
    loading.value = true;
    try {
        const formData = new FormData();
        Object.keys(localUserProfile.value).forEach((key) => {
            if (
                localUserProfile.value[key] !== null &&
                localUserProfile.value[key] !== undefined &&
                key !== "avatar" &&
                key !== "role" &&
                key !== "isAdmin"
            ) {
                formData.append(key, localUserProfile.value[key]);
            }
        });

        // เพิ่ม avatar เฉพาะเมื่อมีการอัปเดต
        if (localUserProfile.value.avatar instanceof File) {
            formData.append("avatar", localUserProfile.value.avatar);
        }

        if (userDetail.value.role !== "user") {
            formData.append("role", localUserProfile.value.role);
            formData.append("isAdmin", localUserProfile.value.isAdmin);
        }

        emit("update-profile", formData);
    } finally {
        loading.value = false;
    }
};

const getAvatarUrl = () => {
    if (avatarPreview.value) {
        return avatarPreview.value;
    } else if (localUserProfile.value && localUserProfile.value.avatar) {
        return `${import.meta.env.VITE_API_URL}${
            localUserProfile.value.avatar
        }`;
    }
    return null;
};
</script>

<template>
    <VOverlay v-model="loading" class="align-center justify-center">
        <VProgressCircular indeterminate size="64" />
    </VOverlay>
    <VForm @submit.prevent="updateProfile">
        <VRow justify="center">
            <VCol justify="center" cols="12" md="4" class="text-center">
                <div class="d-flex justify-center">
                    <VAvatar size="250" class="mb-4">
                        <VImg
                            v-if="getAvatarUrl()"
                            :src="getAvatarUrl()"
                            alt="Avatar"
                            max-width="100%"
                        />
                        <VIcon v-else size="150" icon="mdi-account-circle" />
                    </VAvatar>
                </div>
                <VFileInput
                    class="mt-4"
                    label="อัปโหลดรูปโปรไฟล์"
                    accept="image/*"
                    @change="handleFileChange"
                    prepend-icon="mdi-camera"
                />
            </VCol>
            <VCol cols="12" md="8">
                <VTextField
                    class="mb-4 mt-2"
                    v-model="localUserProfile.name"
                    prepend-icon="mdi-account"
                    label="ชื่อ"
                />
                <VTextField
                    class="mb-4"
                    v-model="localUserProfile.email"
                    prepend-icon="mdi-email"
                    label="อีเมล"
                    type="email"
                />
                <VTextField
                    class="mb-4"
                    v-model="localUserProfile.phone"
                    prepend-icon="mdi-phone"
                    label="เบอร์โทรศัพท์"
                />
                <LocationPicker v-model="location" />
            </VCol>
        </VRow>
        <VBtn type="submit" color="primary" class="mt-4"
            >บันทึกการเปลี่ยนแปลง</VBtn
        >
    </VForm>
</template>

<style scoped>
.v-col {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.v-file-input {
    width: 100%;
}
</style>
