<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AccountSettingsAccount from '@/views/pages/account-settings/AccountSettingsAccount.vue'
import AccountSettingsNotification from '@/views/pages/account-settings/AccountSettingsNotification.vue'
import AccountSettingsSecurity from '@/views/pages/account-settings/AccountSettingsSecurity.vue'
import axios from 'axios'
import { User_ENDPOINTS } from '@/assets/config/api/api_endPoints'
import Swal from 'sweetalert2'

const route = useRoute()
const activeTab = ref(route.params.tab || 'account')
const userProfile = ref(null)

const tabs = [
  { title: 'บัญชี', icon: 'mdi-account-outline', tab: 'account' },
  /* { title: 'ความปลอดภัย', icon: 'mdi-lock-outline', tab: 'security' },
  { title: 'การแจ้งเตือน', icon: 'mdi-bell-outline', tab: 'notification' }, */
]

onMounted(async () => {
  await fetchUserProfile()
})

const fetchUserProfile = async () => {
  try {
    const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken')
    const response = await axios.get(User_ENDPOINTS.getProfile, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    })
    userProfile.value = response.data.data
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:', error)
  }
}

const updateUserProfile = async (updatedData) => {
  try {
    const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken')
    await axios.put(`${User_ENDPOINTS.updateUser}${userProfile.value.userId}`, updatedData, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'multipart/form-data'
      }
    }).then((response) => {
      if(response.status === 200){
        fetchUserProfile()
        Swal.fire({
          title: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        })
      }
    }).catch((error) => {
      Swal.fire({
        title: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้',
        text: error.response.data.message,
        icon: 'error',
        showConfirmButton: false,
        timer: 1500
      })
    })
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้:', error)
  }
}
</script>

<template>
  <VCard>
    <VTabs v-model="activeTab" grow>
      <VTab v-for="item in tabs" :key="item.tab" :value="item.tab">
        <VIcon :icon="item.icon" class="mr-2" />
        {{ item.title }}
      </VTab>
    </VTabs>

    <VDivider />

    <VCardText>
      <VWindow v-model="activeTab">
        <VWindowItem value="account">
          <AccountSettingsAccount
            :user-profile="userProfile"
            @update-profile="updateUserProfile"
          />
        </VWindowItem>

        <!-- <VWindowItem value="security">
          <AccountSettingsSecurity
            :user-profile="userProfile"
            @update-profile="updateUserProfile"
          />
        </VWindowItem>

        <VWindowItem value="notification">
          <AccountSettingsNotification
            :user-profile="userProfile"
            @update-profile="updateUserProfile"
          />
        </VWindowItem> -->
      </VWindow>
    </VCardText>
  </VCard>
</template>
