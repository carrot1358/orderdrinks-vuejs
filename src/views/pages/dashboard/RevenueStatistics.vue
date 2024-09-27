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
        type: 'area',
        height: 350,
        zoom: { enabled: false },
        animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['rgb(76, 175, 80)'], // สีเขียว
    xaxis: {
        type: 'datetime',
        categories: props.data.map(item => item.date)
    },
    yaxis: { title: { text: 'รายได้ (บาท)' } },
    tooltip: {
        x: { format: 'dd MMM yyyy' },
        y: { formatter: (val) => val + " บาท" }
    },
    theme: { mode: 'light', palette: 'palette1' }
}))

const series = computed(() => [{
    name: 'รายได้',
    data: props.data.map(item => item.totalRevenue)
}])

const totalRevenue = computed(() => props.data.reduce((sum, item) => sum + item.totalRevenue, 0))
const averageRevenue = computed(() => props.data.length > 0 ? totalRevenue.value / props.data.length : 0)

const showChart = ref(false)
setTimeout(() => { showChart.value = true }, 300)
</script>

<template>
    <v-card class="revenue-card">
        <v-card-title class="headline d-flex align-center">
            <v-icon large color="rgb(76, 175, 80)" class="mr-2">mdi-cash-multiple</v-icon>
            สถิติรายได้
        </v-card-title>
        <v-card-text>
            <v-fade-transition>
                <div v-if="showChart && props.data.length > 0">
                    <VueApexCharts type="area" height="350" :options="chartOptions" :series="series" />
                    <v-row class="mt-4">
                        <v-col cols="6" class="text-center">
                            <div class="text-h5 font-weight-bold">{{ totalRevenue.toLocaleString() }} บาท</div>
                            <v-chip color="rgb(76, 175, 80)" text-color="white" class="pa-4">

                                <div class="text-caption">รายได้รวม</div>
                            </v-chip>
                        </v-col>
                        <v-col cols="6" class="text-center">
                            <div class="text-h5 font-weight-bold">{{ averageRevenue.toLocaleString(undefined,
                                {maximumFractionDigits: 2}) }} บาท</div>
                            <v-chip color="rgb(33, 150, 243)" text-color="white" class="pa-4">

                                <div class="text-caption">รายได้เฉลี่ยต่อวัน</div>
                            </v-chip>
                        </v-col>
                    </v-row>
                </div>
                <v-alert v-else type="info" outlined>ไม่มีข้อมูลรายได้</v-alert>
            </v-fade-transition>
        </v-card-text>
    </v-card>
</template>

<style scoped>
</style>