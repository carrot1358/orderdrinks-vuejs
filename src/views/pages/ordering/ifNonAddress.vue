<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { User_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import Swal from 'sweetalert2';
import axios from 'axios';

const props = defineProps({
    modelValue: Boolean,
    userProfile: Object
});

const emit = defineEmits(['update:modelValue', 'update-user-info']);
const isShowMergeAccount = ref(false);

const localUserData = ref({
    name: '',
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

const mergeAccount = ref({
    phone: '',
    passwordConfirmExisted: '',
    lineId: props.userProfile.lineId,
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

const isFormValid = computed(() => {
    return Object.entries(localUserData.value).every(([key, value]) => {
        if (key === 'phone') return isPhoneValid.value;
        return typeof value === 'string' ? value.trim() !== '' : value !== '';
    });
});


const updateMergeAccount = async () => {
    const formData = new FormData();
    formData.append('phone', mergeAccount.value.phone);
    formData.append('passwordConfirmExisted', mergeAccount.value.passwordConfirmExisted);
    formData.append('lineId', props.userProfile.lineId);
    await axios.post(User_ENDPOINTS.confirmExistedUser, formData)
    .then((res) => {
        if(res.status === 200){
            console.log(res.data)
            removeSessionStorage('jwtToken')
            removeSessionStorage('userinfo')
            const jwtToken = res.data.data.accessToken
            sessionStorage.setItem('jwtToken', jwtToken)

            axios.get(User_ENDPOINTS.getProfile, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            })
            .then((res) => {
                console.log(res.data)
                sessionStorage.setItem('userinfo', JSON.stringify(res.data.data))
                Swal.fire({
                    icon: 'success',
                    title: 'รวมข้อมูลสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: {
                        container: 'swal-on-top'
                    }
                }).then(() => {
                    window.location.href = '/ordering'
                })
            })
            .catch((err) => {
                console.log(err)
            })
        }
    })
    .catch((err) => {
        console.log(err)
    })
}

const updateUserInfo = async () => {
    if (!isFormValid.value) {
        let errorMessage = 'กรุณากรอกข้อมูลให้ครบทุกช่อง';
        if (!isPhoneValid.value) {
            errorMessage = 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (ต้องเป็นตัวเลข 10 หลัก และขึ้นต้นด้วย 0)';
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

    let updatedData = { 
        name: localUserData.value.name,
        phone: localUserData.value.phone,
        ...localUserData.value 
    };
    
    if (!isAdmin) {
        delete updatedData.isAdmin;
        delete updatedData.role;
    }

    // ลบ avatar ออกจากข้อมูลที่จะส่งไป ถ้าไม่มีการอัปเดต
    if (!updatedData.avatar || !(updatedData.avatar instanceof File)) {
        delete updatedData.avatar;
    }

    // update userinfo from updateData
    const updatedUserInfo = { ...userInfo, ...updatedData };
    sessionStorage.setItem('userinfo', JSON.stringify(updatedUserInfo));

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
        updateMarker(location);
    }
};

const mapInstance = ref(null);
const zoom = ref(15);
const marker = ref(null);

function loadMap(map) {
    mapInstance.value = map;
    map.Layers.setBase(longdo.Layers.NORMAL);
    map.Event.bind('click', function(mouse) {
        const location = map.location(mouse);
        updateMarker(location);
        updateCoordinates(location);
    });
}

function updateMarker(location) {
    if (marker.value) {
        mapInstance.value.Overlays.remove(marker.value);
    }
    marker.value = new window.longdo.Marker(location);
    mapInstance.value.Overlays.add(marker.value);
}

function updateCoordinates(location) {
    localUserData.value.lat = location.lat.toFixed(6);
    localUserData.value.lng = location.lon.toFixed(6);
}

function markCurrentLocation() {
    if (mapInstance.value) {
        const center = mapInstance.value.location();
        updateMarker(center);
        updateCoordinates(center);
    }
}

const showMergeAccount = () => {
    isShowMergeAccount.value = true;

}

const closeMergeAccount = () => {
    isShowMergeAccount.value = false;
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
                <span class="ml-2">ข้อมูลผู้ใช้ <v-btn color="primary" @click="showMergeAccount" text>มีพนักงานสมัครให้แล้ว?</v-btn></span>
                
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
                                รับตำแหน่งจาก GPS
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
                    <v-card-actions>
                        <v-btn @click="markCurrentLocation" color="primary" text>
                            <v-icon left>mdi-map-marker</v-icon>
                            ทำเครื่องหมายตำแหน่งปัจจุบัน
                        </v-btn>
                    </v-card-actions>
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

    <v-dialog v-model="isShowMergeAccount" persistent max-width="800px">
        <v-card class="rounded-lg">
            <v-card-title class="headline bg-primary text-white pa-4">
                <v-icon large left>mdi-account-edit</v-icon>
                <span class="ml-2">รวมข้อมูลผู้ใช้ </span>
                
            </v-card-title>
            
            <v-card-text class="pa-6">
                
                <v-form>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="mergeAccount.phone"
                                label="เบอร์โทรศัพท์"
                                prepend-icon="mdi-phone"
                                outlined
                                dense
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="mergeAccount.passwordConfirmExisted"
                                label="รหัสรวมข้อมูล"
                                prepend-icon="mdi-lock"
                                outlined
                                dense
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
                
                
            </v-card-text>
            
            <v-divider></v-divider>
            
            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    @click="updateMergeAccount"
                    elevation="2"
                >
                    <v-icon left>mdi-content-save</v-icon>
                    บันทึก
                </v-btn>
                <v-btn @click="closeMergeAccount" color="error" text>ยกเลิก</v-btn>
            </v-card-actions>
            
        </v-card>
    </v-dialog>
</template>

<style>
.swal-container {
    z-index: 9999 !important;
}
</style>