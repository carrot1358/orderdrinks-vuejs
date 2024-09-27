<script setup>
import { computed, ref } from 'vue'
import { VueApexCharts } from 'vue3-apexcharts'

const props = defineProps({
    data: {
        type: Object,
        required: true,
        default: () => ({
            newUsers: 0,
            totalUsers: 0
        })
    }
})

const chartOptions = computed(() => ({
    chart: {
        type: 'donut',
        animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
            animateGradually: {
                enabled: true,
                delay: 150
            },
            dynamicAnimation: {
                enabled: true,
                speed: 350
            }
        }
    },
    colors: ['rgb(76, 175, 80)', 'rgb(33, 150, 243)'], // สีเขียว, ฟ้า
    labels: ['ผู้ใช้ใหม่', 'ผู้ใช้ทั้งหมด'],
    responsive: [{
        breakpoint: 480,
        options: {
            chart: {
                width: 200
            },
            legend: {
                position: 'bottom'
            }
        }
    }],
    tooltip: {
        y: {
            formatter: function(val) {
                return val + " คน"
            }
        }
    },
    dataLabels: {
        enabled: false
    },
    legend: {
        position: 'bottom'
    }
}))

const series = computed(() => [props.data.newUsers, props.data.totalUsers])

const totalNewUsers = computed(() => props.data?.newUsers ?? 0)
const totalUsers = computed(() => props.data?.totalUsers ?? 0)

const showChart = ref(false)

setTimeout(() => {
    showChart.value = true
}, 300)
</script>

<template>
    <div class="user-statistics-card rounded-lg">
        <v-card-title class="text-h5 font-weight-bold pa-4">
            <v-icon large left color="rgb(76, 175, 80)" class="mr-2">mdi-account-group</v-icon>
            สถิติผู้ใช้
        </v-card-title>
        <v-card-text>
            <v-fade-transition>
                <div v-if="showChart && totalUsers > 0">
                    <VueApexCharts type="donut" height="350" :options="chartOptions" :series="series" />
                    <v-row class="mt-4">
                        <v-col cols="6" class="text-center">
                            <v-scale-transition>
                                <div>
                                    <div class="text-h4 font-weight-bold" style="color: rgb(76, 175, 80);">{{ totalNewUsers }}</div>
                                    <div class="text-subtitle-1">ผู้ใช้ใหม่</div>
                                </div>
                            </v-scale-transition>
                        </v-col>
                        <v-col cols="6" class="text-center">
                            <v-scale-transition>
                                <div>
                                    <div class="text-h4 font-weight-bold" style="color: rgb(33, 150, 243);">{{ totalUsers }}</div>
                                    <div class="text-subtitle-1">ผู้ใช้ทั้งหมด</div>
                                </div>
                            </v-scale-transition>
                        </v-col>
                    </v-row>
                </div>
                <v-alert v-else type="info" outlined>ไม่มีข้อมูลผู้ใช้</v-alert>
            </v-fade-transition>
        </v-card-text>
    </div>
</template>

<style scoped>
</style>