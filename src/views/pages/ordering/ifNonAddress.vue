<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { mdiAccount, mdiEmail, mdiPhone, mdiHome, mdiCrosshairsGps, mdiLatitude, mdiLongitude, mdiContentSave } from '@mdi/js';

const props = defineProps({
    modelValue: Boolean,
    userProfile: Object
});

const emit = defineEmits(['update:modelValue', 'update-user-info']);

const localUserData = ref({
    name: '',
    email: '',
    phone: '',
    address: '',
    lat: '',
    lng: ''
});

const alert = ref({
    show: false,
    type: '',
    message: ''
});

// ใช้ watch เพื่อคอยดูการเปลี่ยนแปลงของ userProfile
watch(() => props.userProfile, (newProfile) => {
    if (newProfile) {
        const { name, phone, ...rest } = newProfile;
        localUserData.value = { 
            ...localUserData.value,
            ...rest
        };
    }
}, { immediate: true });

const isPhoneValid = computed(() => {
    const phoneRegex = /^0\d{9}$/;
    return phoneRegex.test(localUserData.value.phone);
});

const isEmailValid = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(localUserData.value.email);
});

const isFormValid = computed(() => {
    return Object.entries(localUserData.value).every(([key, value]) => {
        if (key === 'phone') return isPhoneValid.value;
        if (key === 'email') return isEmailValid.value;
        return typeof value === 'string' ? value.trim() !== '' : value !== '';
    });
});

const updateUserInfo = async () => {
    if (!isFormValid.value) {
        let errorMessage = 'กรุณากรอกข้อมูลให้ครบทุกช่อง';
        if (!isPhoneValid.value) {
            errorMessage = 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (ต้องเป็นตัวเลข 10 หลัก และขึ้นต้นด้วย 0)';
        } else if (!isEmailValid.value) {
            errorMessage = 'กรุณากรอกอีเมลให้ถูกต้อง';
        }
        alert.value = {
            show: true,
            type: 'error',
            message: errorMessage
        };
        return;
    }

    const userInfo = JSON.parse(localStorage.getItem('userinfo') || sessionStorage.getItem('userinfo') || '{}');
    const isAdmin = userInfo.isAdmin;

    let updatedData = { ...localUserData.value };
    
    if (!isAdmin) {
        delete updatedData.isAdmin;
        delete updatedData.role;
    }

    // ลบ avatar ออกจากข้อมูลที่จะส่งไป ถ้าไม่มีการอัปเดต
    if (!updatedData.avatar || !(updatedData.avatar instanceof File)) {
        delete updatedData.avatar;
    }

    emit('update-user-info', updatedData);
    emit('update:modelValue', false);
};

const getLocation = () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                localUserData.value.lat = position.coords.latitude.toString();
                localUserData.value.lng = position.coords.longitude.toString();
                updateMap(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                alert.value = {
                    show: true,
                    type: 'error',
                    message: 'ไม่สามารถรับตำแหน่งได้ กรุณาลองใหม่อีกครั้งหรือป้อนตำแหน่งด้วยตนเอง'
                };
                console.error("Error getting location:", error);
            }
        );
    } else {
        alert.value = {
            show: true,
            type: 'error',
            message: 'เบราว์เซอร์ของคุณไม่รองรับการรับตำแหน่ง กรุณาป้อนตำแหน่งด้วยตนเอง'
        };
    }
};

const updateMap = (lat, lng) => {
    if (mapInstance.value) {
        const location = { lon: lng, lat: lat };
        mapInstance.value.location(location, true);
        mapInstance.value.Overlays.clear();
        const marker = new window.longdo.Marker(location);
        mapInstance.value.Overlays.add(marker);
    }
};

const mapInstance = ref(null);
const zoom = ref(15);

function loadMap(map) {
    mapInstance.value = map;
    map.Layers.setBase(longdo.Layers.NORMAL);
}

watch([() => localUserData.value.lat, () => localUserData.value.lng], ([newLat, newLng]) => {
    if (newLat && newLng) {
        updateMap(parseFloat(newLat), parseFloat(newLng));
    }
});
</script>

<template>
    <v-dialog :modelValue="modelValue" persistent max-width="800px">
        <v-card class="rounded-lg">
            <v-card-title class="headline bg-primary text-white pa-4">
                <v-icon large left>mdi-account-edit</v-icon>
                <span class="ml-2">ข้อมูลผู้ใช้</span>
            </v-card-title>
            
            <v-card-text class="pa-6">
                <v-alert
                    v-if="alert.show"
                    :type="alert.type"
                    dismissible
                    elevation="2"
                    class="mb-4"
                    @click:close="alert.show = false"
                >
                    {{ alert.message }}
                </v-alert>
                
                <v-form>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="localUserData.name"
                                label="ชื่อ"
                                prepend-icon="mdi-account"
                                outlined
                                dense
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="localUserData.email"
                                label="อีเมล"
                                prepend-icon="mdi-email"
                                outlined
                                dense
                                :rules="[v => isEmailValid || 'กรุณากรอกอีเมลให้ถูกต้อง']"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="localUserData.phone"
                                label="เบอร์โทรศัพท์"
                                prepend-icon="mdi-phone"
                                outlined
                                dense
                                :rules="[v => isPhoneValid || 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (ต้องเป็นตัวเลข 10 หลัก และขึ้นต้นด้วย 0)']"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="localUserData.address"
                                label="ที่อยู่"
                                prepend-icon="mdi-home"
                                outlined
                                dense
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-btn @click="getLocation" color="secondary" block class="mb-4">
                                <v-icon left>mdi-crosshairs-gps</v-icon>
                                รับตำแหน่งปัจจุบัน
                            </v-btn>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="localUserData.lat"
                                label="ละติจูด"
                                prepend-icon="mdi-latitude"
                                outlined
                                dense
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="localUserData.lng"
                                label="ลองจิจูด"
                                prepend-icon="mdi-longitude"
                                outlined
                                dense
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
                
                <v-card outlined class="mt-4">
                    <longdo-map @load="loadMap" :zoom="zoom" ref="mapInstance" style="width: 100%; height: 300px;"></longdo-map>
                </v-card>
            </v-card-text>
            
            <v-divider></v-divider>
            
            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    @click="updateUserInfo"
                    :disabled="!isFormValid"
                    elevation="2"
                >
                    <v-icon left>mdi-content-save</v-icon>
                    บันทึก
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style>
.swal-container {
    z-index: 9999 !important;
}
</style>