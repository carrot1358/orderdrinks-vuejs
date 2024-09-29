<script setup>
import { computed, ref } from 'vue'
import { VueApexCharts } from 'vue3-apexcharts'

const props = defineProps({
    data: {
        type: Array,
        required: true,
        default: () => []
    }
})

const statusTranslation = {
    'delivered': 'จัดส่งแล้ว',
    'cancel': 'ยกเลิก',
    'delivering': 'กำลังจัดส่ง',
    'pending': 'รอดำเนินการ'
}

const statusColors = {
    'delivered': 'rgb(76, 175, 80)',  // สีเขียว
    'cancel': 'rgb(244, 67, 54)',     // สีแดง
    'delivering': 'rgb(33, 150, 243)', // สีฟ้า
    'pending': 'rgb(255, 193, 7)' // สีส้ม
}

const chartOptions = computed(() => ({
    chart: { type: 'pie', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    labels: props.data.map(item => statusTranslation[item._id] || item._id),
    colors: props.data.map(item => statusColors[item._id] || 'rgb(158, 158, 158)'), // สีเทาเป็นสีเริ่มต้น
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }],
    tooltip: { y: { formatter: (val) => val + " คำสั่งซื้อ" } },
    legend: { position: 'bottom' }
}))

const series = computed(() => props.data.map(item => item.count))
const totalOrders = computed(() => props.data.reduce((sum, item) => sum + item.count, 0))

const showChart = ref(false)
setTimeout(() => { showChart.value = true }, 300)
</script>

<template>
    <div class="order-card">
        <v-card-title class="headline d-flex align-center">
            <v-icon large color="blue darken-2" class="mr-2">mdi-cart</v-icon>
            สถิติคำสั่งซื้อ
        </v-card-title>
        <v-card-text>
            <v-fade-transition>
                <div v-if="showChart && props.data.length > 0">
                    <VueApexCharts type="pie" height="350" :options="chartOptions" :series="series" />
                    <v-row class="mt-4">
                        <v-col v-for="item in props.data" :key="item._id" cols="4" class="text-center">
                            <div class="text-h6">{{ item.count }}</div>
                            <v-chip :color="statusColors[item._id]" text-color="white" class="pa-2">
                                <div class="text-caption">{{ statusTranslation[item._id] || item._id }}</div>
                            </v-chip>
                        </v-col>
                    </v-row>
                    <v-divider class="my-4"></v-divider>
                    <v-row>
                        <v-col cols="12" class="text-center">
                            <div class="text-h6">{{ totalOrders }}</div>
                            <v-chip color="rgb(156, 39, 176)" text-color="white" class="pa-4"> <!-- สีม่วง -->
                                
                                <div class="text-caption">จำนวนคำสั่งซื้อทั้งหมด</div>
                            </v-chip>
                        </v-col>
                    </v-row>
                </div>
                <v-alert v-else type="info" outlined>ไม่มีข้อมูลคำสั่งซื้อ</v-alert>
            </v-fade-transition>
        </v-card-text>
    </div>
</template>

<style scoped>
</style>