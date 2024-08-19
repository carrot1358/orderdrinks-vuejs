<script setup>
import {User_ENDPOINTS} from "@/assets/config/api/api_endPoints";
import axios from "axios";
import {Alert} from "@/assets/sweetalert2/sweetalert2";
const alert = new Alert();
const isCurrentPasswordVisible = ref(false)
const isNewPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const userinfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : JSON.parse(sessionStorage.getItem('userInfo'))

const passwordRequirements = [
  'ต้องมีความยาวอย่างน้อย 6 ตัว',
  'ควรประกอบไปด้วย ตัวเลข,อัขระ,อักษรพิมพ์เล็ก และอักษรพิมพ์ใหญ่',
]

const changePassword = async () => {
  if (confirmPassword.value !== newPassword.value) {
    alert.showAlert('รหัสผ่านใหม่ไม่ตรงกัน', '', 'error', 1000, true, false, false)
  } else {
    try {
      const response = await axios.post(User_ENDPOINTS.CHANGE_PASSWORD, {
        userId: userinfo.id,
        oldPassword: currentPassword.value,
        newPassword: newPassword.value,
      })
      console.log(response.data)
      if (response.data.status === 200) {
        currentPassword.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
        alert.showAlert('เปลี่ยนรหัสผ่านสำเร็จ', '', 'success', 2000, true, false, false)
      } else {
        alert.showAlert('เปลี่ยนรหัสผ่านไม่สำเร็จ', response.data.message, 'error', 10000, true, false, false)
      }
    } catch (error) {
      console.error(error)
    }
  }
}

const recentDevicesHeaders = [
  {
    title: 'BROWSER',
    key: 'browser',
  },
  {
    title: 'DEVICE',
    key: 'device',
  },
  {
    title: 'LOCATION',
    key: 'location',
  },
  {
    title: 'RECENT ACTIVITY',
    key: 'recentActivity',
  },
]

const recentDevices = [
  {
    browser: 'Chrome on Windows',
    device: 'HP Spectre 360',
    location: 'New York, NY',
    recentActivity: '28 Apr 2022, 18:20',
    deviceIcon: {
      icon: 'bxl-windows',
      color: 'primary',
    },
  },
  {
    browser: 'Chrome on iPhone',
    device: 'iPhone 12x',
    location: 'Los Angeles, CA',
    recentActivity: '20 Apr 2022, 10:20',
    deviceIcon: {
      icon: 'bx-mobile',
      color: 'error',
    },
  },
  {
    browser: 'Chrome on Android',
    device: 'Oneplus 9 Pro',
    location: 'San Francisco, CA',
    recentActivity: '16 Apr 2022, 04:20',
    deviceIcon: {
      icon: 'bxl-android',
      color: 'success',
    },
  },
  {
    browser: 'Chrome on MacOS',
    device: 'Apple iMac',
    location: 'New York, NY',
    recentActivity: '28 Apr 2022, 18:20',
    deviceIcon: {
      icon: 'bxl-apple',
      color: 'secondary',
    },
  },
  {
    browser: 'Chrome on Windows',
    device: 'HP Spectre 360',
    location: 'Los Angeles, CA',
    recentActivity: '20 Apr 2022, 10:20',
    deviceIcon: {
      icon: 'bxl-windows',
      color: 'primary',
    },
  },
  {
    browser: 'Chrome on Android',
    device: 'Oneplus 9 Pro',
    location: 'San Francisco, CA',
    recentActivity: '16 Apr 2022, 04:20',
    deviceIcon: {
      icon: 'bxl-android',
      color: 'success',
    },
  },
]
</script>

<template>
  <VRow>
    <!-- SECTION: Change Password -->
    <VCol cols="12">
      <VCard title="เปลี่ยนรหัสผ่าน">
        <VForm>
          <VCardText>
            <!-- 👉 Current Password -->
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 current password -->
                <VTextField
                  v-model="currentPassword"
                  :type="isCurrentPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isCurrentPasswordVisible ? 'bx-hide' : 'bx-show'"
                  label="รหัสผ่านปัจจุบัน"
                  placeholder="············"
                  @click:append-inner="isCurrentPasswordVisible = !isCurrentPasswordVisible"
                />
              </VCol>
            </VRow>

            <!-- 👉 New Password -->
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 new password -->
                <VTextField
                  v-model="newPassword"
                  :type="isNewPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isNewPasswordVisible ? 'bx-hide' : 'bx-show'"
                  label="รหัสผ่านใหม่"
                  placeholder="············"
                  @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 confirm password -->
                <VTextField
                  v-model="confirmPassword"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isConfirmPasswordVisible ? 'bx-hide' : 'bx-show'"
                  label="ยืนยัน รหัสผ่านใหม่"
                  placeholder="············"
                  @click:append-inner="isConfirmPasswordVisible = !isConfirmPasswordVisible"
                />
              </VCol>
            </VRow>
          </VCardText>

          <!-- 👉 Password Requirements -->
          <VCardText>
            <p class="text-base font-weight-medium mt-2">
              ความต้องการของรหัสผ่านคือ:
            </p>

            <ul class="d-flex flex-column gap-y-3">
              <li
                v-for="item in passwordRequirements"
                :key="item"
                class="d-flex"
              >
                <div>
                  <VIcon
                    size="7"
                    icon="bxs-circle"
                    class="me-3"
                  />
                </div>
                <span class="font-weight-medium">{{ item }}</span>
              </li>
            </ul>
          </VCardText>

          <!-- 👉 Action Buttons -->
          <VCardText class="d-flex flex-wrap gap-4">
            <VBtn
              @click="changePassword"
              :disabled="!(currentPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0)">
              Save changes
            </VBtn>
          </VCardText>
        </VForm>
      </VCard>
    </VCol>
    <!-- !SECTION -->

<!--        <VCol cols="12">
          <VCard title="Recent Devices">
            <VDataTable
              :headers="recentDevicesHeaders"
              :items="recentDevices"
              class="text-no-wrap rounded-0 text-sm"
            >
              <template #item.browser="{ item }">
                <div class="d-flex">
                  <VIcon
                    start
                    :icon="item.raw.deviceIcon.icon"
                    :color="item.raw.deviceIcon.color"
                  />
                  <span class="text-high-emphasis text-base">
                    {{ item.raw.browser }}
                  </span>
                </div>
              </template>
              <template #bottom />
            </VDataTable>
          </VCard>
        </VCol>-->
  </VRow>
</template>
