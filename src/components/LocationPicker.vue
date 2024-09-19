<script setup>
import { ref, watch, nextTick } from 'vue';
import { mdiCrosshairsGps, mdiMapMarker } from '@mdi/js';

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({ lat: '', lng: '', address: '' })
    }
});

const emit = defineEmits(['update:modelValue']);

const localValue = ref({ ...props.modelValue });

const mapInstance = ref(null);
const zoom = ref(15);
const marker = ref(null);

const alert = ref({
    show: false,
    type: '',
    message: ''
});

watch(() => props.modelValue, (newValue) => {
    localValue.value = { ...newValue };
}, { deep: true });

const updateModelValue = () => {
    emit('update:modelValue', { ...localValue.value });
};

function loadMap(map) {
    mapInstance.value = map;
    map.Layers.setBase(longdo.Layers.NORMAL);
    map.Event.bind('click', function (mouse) {
        const location = map.location(mouse);
        updateMarker(location);
        updateCoordinates(location);
    });
}

function updateMap(lat, lng) {
    if (mapInstance.value) {
        const location = { lon: lng, lat: lat };
        mapInstance.value.location(location, true);
        updateMarker(location);
    }
}

function updateMarker(location) {
    if (marker.value) {
        mapInstance.value.Overlays.remove(marker.value);
    }
    marker.value = new window.longdo.Marker(location);
    mapInstance.value.Overlays.add(marker.value);
}

function updateCoordinates(location) {
    localValue.value.lat = location.lat.toFixed(6);
    localValue.value.lng = location.lon.toFixed(6);
    nextTick(updateModelValue);
}

function markCurrentLocation() {
    if (mapInstance.value) {
        const center = mapInstance.value.location();
        updateMarker({ lat: center.lat, lon: center.lon });
        updateCoordinates({ lat: center.lat, lon: center.lon });
    }
}

const getLocation = () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                updateMarker(location);
                updateCoordinates(location);
                updateMap(location.lat, location.lon);
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

watch([() => localValue.value.lat, () => localValue.value.lng], ([newLat, newLng]) => {
    if (newLat && newLng) {
        updateMap(parseFloat(newLat), parseFloat(newLng));
    }
});
</script>

<template>
    <div>
        <v-text-field v-model="localValue.address" label="ที่อยู่" prepend-icon="mdi-home" outlined dense
            @input="updateModelValue"></v-text-field>
        <v-alert v-if="alert.show" :type="alert.type" dismissible elevation="2" class="mb-4"
            @click:close="alert.show = false">
            {{ alert.message }}
        </v-alert>
        <v-btn @click="getLocation" color="secondary" block class="mb-4">
            <v-icon left>{{ mdiCrosshairsGps }}</v-icon>
            รับตำแหน่งจาก GPS
        </v-btn>

        <v-row>
            <v-col cols="12" sm="6">
                <v-text-field v-model="localValue.lat" label="ละติจูด" prepend-icon="mdi-latitude" outlined dense
                    @input="updateModelValue"></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
                <v-text-field v-model="localValue.lng" label="ลองจิจูด" prepend-icon="mdi-longitude" outlined dense
                    @input="updateModelValue"></v-text-field>
            </v-col>
        </v-row>
        <v-btn @click="markCurrentLocation" color="primary" block class="mb-4">
            <v-icon left>{{ mdiMapMarker }}</v-icon>
            ทำเครื่องหมายตำแหน่งปัจจุบัน
        </v-btn>

        <v-card outlined class="mt-4">
            <longdo-map @load="loadMap" :zoom="zoom" ref="mapInstance" style="width: 100%; height: 300px;"></longdo-map>
        </v-card>
    </div>
</template>