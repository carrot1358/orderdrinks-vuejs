<script setup>
import { computed, ref } from 'vue'
import { VueApexCharts } from 'vue3-apexcharts'

const props = defineProps({
    data: {
        type: Object,
        required: true,
        default: () => ({
            filterChanges: 0,
            filterRefills: 0
        })
    }
})

const chartOptions = computed(() => ({
    chart: { type: 'donut', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    labels: ['การเปลี่ยนไส้กรอง', 'การเติมสารกรอง'],
    colors: ['rgb(255, 152, 0)', 'rgb(33, 150, 243)'], // สีส้ม, สีฟ้า
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }],
    tooltip: { y: { formatter: (val) => val + " ครั้ง" } },
    legend: { position: 'bottom' }
}))

const series = computed(() => [props.data?.filterChanges ?? 0, props.data?.filterRefills ?? 0])
const totalFilterOperations = computed(() => (props.data?.filterChanges ?? 0) + (props.data?.filterRefills ?? 0))

const showChart = ref(false)
setTimeout(() => { showChart.value = true }, 300)
</script>

<template>
    <v-card class="filter-card">
        <v-card-title class="headline d-flex align-center">
            <v-icon large color="rgb(255, 152, 0)" class="mr-2">mdi-filter</v-icon>
            สถิติการเปลี่ยนไส้กรอง
        </v-card-title>
        <v-card-text>
            <v-fade-transition>
                <div v-if="showChart && totalFilterOperations > 0">
                    <VueApexCharts type="donut" height="350" :options="chartOptions" :series="series" />
                    <v-row class="mt-4">
                        <v-col cols="6" class="text-center">
                            <div class="text-h6">{{ props.data?.filterChanges ?? 0 }}</div>
                            <v-chip color="rgb(255, 152, 0)" text-color="white" class="pa-2">
                                <div class="text-caption">การเปลี่ยนไส้กรอง</div>
                            </v-chip>
                        </v-col>
                        <v-col cols="6" class="text-center">
                            <div class="text-h6">{{ props.data?.filterRefills ?? 0 }}</div>
                            <v-chip color="rgb(33, 150, 243)" text-color="white" class="pa-2">
                                <div class="text-caption">การเติมสารกรอง</div>
                            </v-chip>
                        </v-col>
                    </v-row>
                    <v-divider class="my-4"></v-divider>
                    <v-row>
                        <v-col cols="12" class="text-center">
                            <div class="text-h5 font-weight-bold">{{ totalFilterOperations }}</div>
                            <v-chip color="rgb(156, 39, 176)" text-color="white" class="pa-4">
                                <div class="text-caption">จำนวนการดำเนินการทั้งหมด</div>
                            </v-chip>
                        </v-col>
                    </v-row>
                </div>
                <v-alert v-else type="info" outlined>ไม่มีข้อมูลการเปลี่ยนไส้กรอง</v-alert>
            </v-fade-transition>
        </v-card-text>
    </v-card>
</template>

<style scoped>
</style>