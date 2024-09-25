<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Report_Statistics_ENDPOINTS } from '@/assets/config/api/api_endPoints.js'
import SalesStatistics from '@/views/pages/dashboard/SalesStatistics.vue'
import UserStatistics from '@/views/pages/dashboard/UserStatistics.vue'
import FilterStatistics from '@/views/pages/dashboard/FilterStatistics.vue'
import OrderStatistics from '@/views/pages/dashboard/OrderStatistics.vue'
import RevenueStatistics from '@/views/pages/dashboard/RevenueStatistics.vue'
import BottleCount from '@/views/pages/dashboard/BottleCount.vue'

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
  <v-container fluid class="dashboard-container pa-4">
    <!-- ส่วนหัวและตัวเลือกวันที่ -->
    <v-row>
      <v-col cols="12" md="8">
        <h1 class="text-h4 font-weight-bold mb-4">แดชบอร์ดสถิติ</h1>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="date-range-card pa-4">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="startDate"
                label="วันที่เริ่มต้น"
                type="date"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="endDate"
                label="วันที่สิ้นสุด"
                type="date"
                outlined
                dense
              ></v-text-field>
            </v-col>
          </v-row>
          <v-btn class="mt-2" color="primary" block @click="fetchAllData">อัปเดตข้อมูล</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- แถวแรกของการ์ด -->
    <v-row class="mt-4">
      <v-col cols="12" md="4">
        <v-card class="dashboard-card">
          <UserStatistics :data="userData" />
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="dashboard-card">
          <OrderStatistics :data="orderData" />
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="dashboard-card">
          <FilterStatistics :data="filterData" />
        </v-card>
      </v-col>
    </v-row>

    <!-- แถวที่สองของการ์ด -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card class="dashboard-card">
          <SalesStatistics :data="salesData" />
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="dashboard-card">
          <RevenueStatistics :data="revenueData" />
        </v-card>
      </v-col>
    </v-row>

    <!-- แถวที่สามของการ์ด -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card class="dashboard-card">
          <BottleCount />
        </v-card>
      </v-col>
    </v-row>

    <!-- ส่วนแสดงการโหลด -->
    <v-overlay :model-value="isLoading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<style scoped>
.dashboard-container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.dashboard-card {
  height: 100%;
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.date-range-card {
  height: 100%;
}
</style>