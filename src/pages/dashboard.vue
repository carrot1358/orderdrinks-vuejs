<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'
import { Report_Statistics_ENDPOINTS } from '@/assets/config/api/api_endPoints.js'
import SalesStatistics from '@/views/pages/dashboard/SalesStatistics.vue'
import UserStatistics from '@/views/pages/dashboard/UserStatistics.vue'
import FilterStatistics from '@/views/pages/dashboard/FilterStatistics.vue'
import OrderStatistics from '@/views/pages/dashboard/OrderStatistics.vue'
import RevenueStatistics from '@/views/pages/dashboard/RevenueStatistics.vue'
import BottleCount from '@/views/pages/dashboard/BottleCount.vue'
import DriverLocation from '@/views/pages/dashboard/DriverLocation.vue'
import { useWebSocket } from '@/assets/config/websocket/websocket'
import { Websocket_URL_Frontend } from '@/assets/config/api/websocket_endPoints'

const jwtToken = ref(localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken'))
const userInfo = ref(JSON.parse(localStorage.getItem('userinfo') || sessionStorage.getItem('userinfo') || '{}'))

const { isConnected, lastMessage, error, send } = useWebSocket(`${Websocket_URL_Frontend}${userInfo.value.userId}`, {
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 20000,
  heartbeatMessage: JSON.stringify({ type: 'ping' })
})

console.log('WebSocket URL:', `${Websocket_URL_Frontend}${userInfo.value.userId}`)

const startDate = ref(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])

const salesData = ref([])
const userData = ref(null)
const filterData = ref(null)
const orderData = ref([])
const revenueData = ref([])
const bottleData = ref(null)
const driverLocationData = ref(null)

const isLoading = ref(true)

const fetchAllData = async () => {
  isLoading.value = true
  try {
    const config = {
      params: { startDate: startDate.value, endDate: endDate.value },
      headers: { 'Authorization': `Bearer ${jwtToken.value}` }
    }

    const salesRes = await axios.get(Report_Statistics_ENDPOINTS.getReportStatisticsSales, config)
    salesData.value = salesRes.data.data

    const userRes = await axios.get(Report_Statistics_ENDPOINTS.getReportStatisticsUsers, config)
    userData.value = userRes.data.data

    const filterRes = await axios.get(Report_Statistics_ENDPOINTS.getReportStatisticsFilter, config)
    filterData.value = filterRes.data.data

    const orderRes = await axios.get(Report_Statistics_ENDPOINTS.getReportStatisticsOrder, config)
    orderData.value = orderRes.data.data

    const revenueRes = await axios.get(Report_Statistics_ENDPOINTS.getReportStatisticsRevenue, config)
    revenueData.value = revenueRes.data.data
    console.log("revenueData",revenueData.value)

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ:', error)
  } finally {
    isLoading.value = false
  }
}

watch(lastMessage, (newMessage) => {
  if (newMessage && newMessage.sendto === 'both') {
    if (newMessage.body.bottle_count !== undefined) {
      bottleData.value = newMessage.body
    }
    if (newMessage.body.latitude !== undefined && newMessage.body.longitude !== undefined) {
      driverLocationData.value = newMessage.body
    }
  }
})

const requestBottleCount = () => {
  console.log('requestBottleCount called in dashboard')
  if (isConnected.value) {
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

watch(isConnected, (newValue) => {
  console.log('WebSocket connection status:', newValue)
})

onMounted(fetchAllData)
</script>

<template>
  <v-container fluid class="dashboard-container pa-4">
    <!-- ส่วนหัวและตัวเลือกวันที่ -->
    <v-row>
      <v-col cols="12" md="8">
        <h1 class="text-h4 font-weight-bold mb-4">แดชบอร์ดสถิติ</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-card class="dashboard-card date-range-card pa-4 d-flex flex-column align-center justify-center ">
          <v-row class="justify-center align-center">
            <v-col cols="12" sm="6" class="d-flex justify-center">
              <v-text-field
                v-model="startDate"
                label="วันที่เริ่มต้น"
                type="date"
                outlined
                dense
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" class="d-flex justify-center">
              <v-text-field
                v-model="endDate"
                label="วันที่สิ้นสุด"
                type="date"
                outlined
                dense
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row class="justify-center">
            <v-col cols="12" class="d-flex justify-center">
              <v-btn class="mt-2" color="primary" @click="fetchAllData">อัปเดตข้อมูล</v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="12" md="8">
        <v-card class="dashboard-card">
          <BottleCount :data="bottleData" :isConnected="isConnected" @request-bottle-count="requestBottleCount" />
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
      <v-col cols="12" md="12">
        <v-card class="dashboard-card">
          <DriverLocation :data="driverLocationData" />
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>