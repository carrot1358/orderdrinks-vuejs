<script setup>
import { ref, watch } from 'vue'

const props = defineProps(['data', 'isConnected'])
const emit = defineEmits(['request-bottle-count'])

const bottleCount = ref(0)
const lastUpdated = ref(null)
const bottleImage = ref(null)
const isLoading = ref(false)

watch(() => props.data, (newData) => {
  if (newData) {
    bottleCount.value = newData.bottle_count
    lastUpdated.value = newData.time_completed
    bottleImage.value = `data:image/jpeg;base64,${newData.image}`
    isLoading.value = false
  }
}, { deep: true })

watch(() => props.isConnected, (newValue) => {
  console.log('isConnected changed:', newValue)
}, { immediate: true })

const requestBottleCount = () => {
  console.log('requestBottleCount called in BottleCount')
  isLoading.value = true
  emit('request-bottle-count')
}
</script>

<template>
    <div class="bottle-count-card">
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
    </div>
</template>

<style scoped>
</style>
