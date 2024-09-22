<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Report_Statistics_ENDPOINTS } from '@/assets/config/api/api_endPoints.js'
import SalesStatistics from '@/views/pages/dashboard/SalesStatistics.vue'
import UserStatistics from '@/views/pages/dashboard/UserStatistics.vue'
import FilterStatistics from '@/views/pages/dashboard/FilterStatistics.vue'
import OrderStatistics from '@/views/pages/dashboard/OrderStatistics.vue'
import RevenueStatistics from '@/views/pages/dashboard/RevenueStatistics.vue'
import BottleCount from '@/views/pages/dashboard/BottleCount.vue'  // เพิ่มบรรทัดนี้

const jwtToken = ref(localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken'))

const startDate = ref(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])

const salesData = ref([])
const userData = ref(null)
const filterData = ref(null)
const orderData = ref([])
const revenueData = ref([])

const isLoading = ref(true)

const fetchAllData = async () => {
  isLoading.value = true
  try {
    const config = {
      params: { startDate: startDate.value, endDate: endDate.value },
      headers: { 'Authorization': `Bearer ${jwtToken.value}` }
    }

    const [salesRes, userRes, filterRes, orderRes, revenueRes] = await Promise.all([
      axios.get(Report_Statistics_ENDPOINTS.getReportStatisticsSales, config),
      axios.get(Report_Statistics_ENDPOINTS.getReportStatisticsUsers, config),
      axios.get(Report_Statistics_ENDPOINTS.getReportStatisticsFilter, config),
      axios.get(Report_Statistics_ENDPOINTS.getReportStatisticsOrder, config),
      axios.get(Report_Statistics_ENDPOINTS.getReportStatisticsRevenue, config)
    ])

    salesData.value = salesRes.data.data
    userData.value = userRes.data.data
    filterData.value = filterRes.data.data
    orderData.value = orderRes.data.data
    revenueData.value = revenueRes.data.data
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchAllData)
</script>

<template>
  <v-container fluid class="dashboard-container">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 font-weight-bold mb-6">แดชบอร์ดสถิติ</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6" lg="4">
        <v-card class="mb-4 date-range-card">
          <v-card-title class="headline">
            <v-icon large left>mdi-calendar-range</v-icon>
            ช่วงเวลา
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-menu
                  v-model="startDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="startDate"
                      label="วันที่เริ่มต้น"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="startDate" no-title @input="startDateMenu = false"></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="12" sm="6">
                <v-menu
                  v-model="endDateMenu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  max-width="290px"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="endDate"
                      label="วันที่สิ้นสุด"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="endDate" no-title @input="endDateMenu = false"></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
            <v-btn color="primary" block @click="fetchAllData" :loading="isLoading">
              อัปเดตข้อมูล
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="!isLoading">
      <v-col cols="12" md="6" lg="4">
        <v-slide-y-transition>
          <UserStatistics :data="userData" />
        </v-slide-y-transition>
      </v-col>
      <v-col cols="12" md="6" lg="4">
        <v-slide-y-transition>
          <OrderStatistics :data="orderData" />
        </v-slide-y-transition>
      </v-col>
      <v-col cols="12" md="6" lg="4">
        <v-slide-y-transition>
          <FilterStatistics :data="filterData" />
        </v-slide-y-transition>
      </v-col>
    </v-row>

    <v-row v-if="!isLoading">
      <v-col cols="12" md="6">
        <v-slide-y-transition>
          <SalesStatistics :data="salesData" />
        </v-slide-y-transition>
      </v-col>
      <v-col cols="12" md="6">
        <v-slide-y-transition>
          <RevenueStatistics :data="revenueData" />
        </v-slide-y-transition>
      </v-col>
    </v-row>

    <v-row v-if="!isLoading">
      <v-col cols="12" md="6">
        <v-slide-y-transition>
          <BottleCount />
        </v-slide-y-transition>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.dashboard-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-top: 2rem;
}

.date-range-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.date-range-card:hover {
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-5px);
}

.v-slide-y-transition-enter-active,
.v-slide-y-transition-leave-active {
  transition: all 0.3s ease;
}

.v-slide-y-transition-enter,
.v-slide-y-transition-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
