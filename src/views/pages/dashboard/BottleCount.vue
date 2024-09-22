<script setup>
import { ref, watch } from 'vue'
import { useWebSocket } from '@/assets/config/websocket/websocket'
import { Websocket_URL_Frontend } from '@/assets/config/api/websocket_endPoints'

const bottleCount = ref(0)
const lastUpdated = ref(null)
const bottleImage = ref(null)
const isLoading = ref(false)

const userInfo = ref(JSON.parse(localStorage.getItem('userinfo') || sessionStorage.getItem('userinfo') || '{}'))

const { isConnected, lastMessage, error, send } = useWebSocket(`${Websocket_URL_Frontend}${userInfo.value.userId}`, {
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 20000,
    heartbeatMessage: JSON.stringify({ type: 'ping' })
})

watch(lastMessage, (newMessage) => {
    if (newMessage && newMessage.sendto === 'both' && newMessage.body.bottle_count) {
        bottleCount.value = newMessage.body.bottle_count
        lastUpdated.value = newMessage.body.time_completed || new Date().toISOString()
        if (newMessage.body.image) {
            bottleImage.value = `data:image/jpeg;base64,${newMessage.body.image}`
        }
        isLoading.value = false
    }
})

const requestBottleCount = () => {
    if (isConnected.value) {
        isLoading.value = true
        const message = {
            sendto: 'device',
            body: {
                topic: 'need_bottle_image'
            }
        }
        console.log('Sending message:', message)
        send(message)
    } else {
        console.log('WebSocket not connected')
    }
}
</script>

<template>
    <v-card class="bottle-count-card">
        <v-card-title class="headline d-flex align-center">
            <v-icon large color="rgb(33, 150, 243)" class="mr-2">mdi-bottle-wine</v-icon>
            จำนวนขวด
        </v-card-title>
        <v-card-text>
            <v-row align="center" justify="center">
                <v-col cols="12" sm="6" class="text-center">
                    <div class="text-h2 font-weight-bold" style="color: rgb(33, 150, 243);">{{ bottleCount }}</div>
                    <div class="text-subtitle-1">จำนวนขวดทั้งหมด</div>
                    <div v-if="lastUpdated" class="text-caption mt-2">
                        อัพเดทล่าสุด: {{ new Date(lastUpdated).toLocaleString() }}
                    </div>
                </v-col>
                <v-col cols="12" sm="6" class="text-center">
                    <v-img v-if="bottleImage" :src="bottleImage" contain max-height="200" class="mx-auto"></v-img>
                    <div v-else class="text-subtitle-1">ไม่มีรูปภาพ</div>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions>
            <v-btn color="primary" @click="requestBottleCount" :loading="isLoading" :disabled="!isConnected">
                ขอข้อมูลจำนวนขวด
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<style scoped>
.bottle-count-card {
    transition: all 0.3s ease-in-out;
    border-radius: 12px;
}

.bottle-count-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1);
}
</style>
