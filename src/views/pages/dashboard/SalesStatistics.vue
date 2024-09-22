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

const chartOptions = computed(() => ({
    chart: {
        type: 'bar',
        height: 350,
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    plotOptions: { bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
        categories: props.data.map(item => item._id),
        title: { text: 'วันที่' }
    },
    yaxis: { title: { text: 'ยอดขาย (บาท)' } },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: (val) => val + " บาท" } },
    colors: ['rgb(76, 175, 80)'] // สีเขียว
}))

const series = computed(() => [{
    name: 'ยอดขาย',
    data: props.data.map(item => item.totalSales)
}])

const totalSales = computed(() => props.data.reduce((sum, item) => sum + item.totalSales, 0))
const totalOrders = computed(() => props.data.reduce((sum, item) => sum + item.count, 0))

const showChart = ref(false)
setTimeout(() => { showChart.value = true }, 300)
</script>

<template>
    <v-card class="sales-card">
        <v-card-title class="headline d-flex align-center">
            <v-icon large color="rgb(76, 175, 80)" class="mr-2">mdi-chart-bar</v-icon>
            สถิติยอดขาย
        </v-card-title>
        <v-card-text>
            <v-fade-transition>
                <div v-if="showChart && props.data.length > 0">
                    <VueApexCharts type="bar" height="350" :options="chartOptions" :series="series" />
                    <v-row class="mt-4">
                        <v-col cols="6" class="text-center">
                            <div class="text-h5 font-weight-bold">{{ totalSales.toLocaleString() }} บาท</div>
                            <v-chip color="rgb(76, 175, 80)" text-color="white" class="pa-4">

                                <div class="text-caption">ยอดขายรวม</div>
                            </v-chip>
                        </v-col>
                        <v-col cols="6" class="text-center">
                            <div class="text-h5 font-weight-bold">{{ totalOrders }}</div>
                            <v-chip color="rgb(33, 150, 243)" text-color="white" class="pa-4">

                                <div class="text-caption">จำนวนคำสั่งซื้อ</div>
                            </v-chip>
                        </v-col>
                    </v-row>
                </div>
                <v-alert v-else type="info" outlined>ไม่มีข้อมูลยอดขาย</v-alert>
            </v-fade-transition>
        </v-card-text>
    </v-card>
</template>

<style scoped>
.sales-card {
    transition: all 0.3s ease-in-out;
    border-radius: 12px;
}

.sales-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1);
}
</style>