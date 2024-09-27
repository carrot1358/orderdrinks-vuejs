<script setup>
import { ref, watch } from 'vue'
import { useWebSocket } from '@/assets/config/websocket/websocket'
import { Websocket_URL_Frontend } from '@/assets/config/api/websocket_endPoints'
import { LongdoMap, LongdoMapLoad } from 'longdo-map-vue'
import truckIcon from '@/assets/images/icons/marker/truck.png' // นำเข้ารูปภาพ

const apiKey = import.meta.env.VITE_LONGDO_MAP_API_KEY

LongdoMapLoad({
    apiKey: apiKey,
})

const userInfo = ref(JSON.parse(localStorage.getItem('userinfo') || sessionStorage.getItem('userinfo') || '{}'))
const { isConnected, lastMessage, error, send } = useWebSocket(`${Websocket_URL_Frontend}${userInfo.value.userId}`, {
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 20000,
    heartbeatMessage: JSON.stringify({ type: 'ping' })
})

const vehicleLocation = ref([0, 0])
const mapInstance = ref(null)
const zoom = ref(15)

function loadMap(map) {
    mapInstance.value = map
    map.Layers.setBase(longdo.Layers.NORMAL)
}

watch(lastMessage, (newMessage) => {
    if (newMessage && newMessage.sendto === 'both' && newMessage.body.latitude && newMessage.body.longitude) {
        vehicleLocation.value = [newMessage.body.latitude, newMessage.body.longitude]
        updateMarker()
    }
})

function updateMarker() {
    if (mapInstance.value) {
        const marker = new longdo.Marker({ lon: vehicleLocation.value[1], lat: vehicleLocation.value[0] }, {
            title: 'ตำแหน่งรถ',
            icon: {
                url: truckIcon, // ใช้ import เพื่อโหลดรูปภาพ
                offset: { x: 12, y: 20 }, // ปรับตำแหน่งของไอคอน
                size: { width: 32, height: 32 }
            }
        })
        mapInstance.value.Overlays.clear()
        mapInstance.value.Overlays.add(marker)
    }
}
</script>

<template>
    <v-card class="driver-location-card">
        <v-card-title class="headline d-flex align-center">
            <v-icon large color="rgb(33, 150, 243)" class="mr-2">mdi-map-marker</v-icon>
            ตำแหน่งรถ
        </v-card-title>
        <v-card-text>
            <longdo-map @load="loadMap" :zoom="zoom" class="map-container"></longdo-map>
        </v-card-text>
    </v-card>
</template>

<style scoped>
.map-container {
    height: 500px;
    width: 100%;
}

.driver-location-card {
    transition: all 0.3s ease-in-out;
    border-radius: 12px;
}

.driver-location-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1);
}
</style>
