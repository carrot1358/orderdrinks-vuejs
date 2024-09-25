<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import router from "@/router";
import axios from "axios";
import {User_ENDPOINTS} from "@/assets/config/api/api_endPoints";
import { onMounted, ref, computed } from "vue";
import { inject } from 'vue';

const $swal = inject('$swal')

const userinfo = ref([])
// สร้าง computed property สำหรับ jwtToken
let jwtToken = computed(() => {
  return localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
});

onMounted(() => {
  getProfile()
})

const props = defineProps({
  isLogin: Boolean,
});

const openOrder = () => {
  router.push('/Ordering')
}

const openHistory = () => {
  router.push('/history')
}

const openSettings = () => {
  router.push('/account-settings')
}
const logout = () => {
  if(localStorage.getItem('jwtToken')){
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userinfo');
  }else{
    sessionStorage.removeItem('jwtToken');
    sessionStorage.removeItem('userinfo');
  }
  $swal({
    title: 'ออกจากระบบสำเร็จ!',
    text: 'กำลังนำคุณไปยังหน้าหลัก...',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false
  }).then(() => {
    userinfo.value = null;
    jwtToken = null;
    props.isLogin = false;
  })
  
};

const getProfile = async () => {
    axios.get(User_ENDPOINTS.getProfile, {
      headers: {
        'authorization': `Bearer ${jwtToken.value}` // ใช้ jwtToken.value
      }
    }).then((response) => {
      userinfo.value = response.data.data
    }).catch((error) => {
      console.log(error)
    })
}

// รูปภาพของผู้ใช้จากฐานข้อมูล
const avatarUrl = computed(() => {
  return userinfo.value && userinfo.value.avatar 
    ? `${import.meta.env.VITE_API_URL}${userinfo.value.avatar}` 
    : null;
});

// รูปภาพของผู้ใช้จาก line
const lineAvatar = computed(() => {
  return userinfo.value && userinfo.value.lineAvatar
    ? userinfo.value.lineAvatar
    : avatar1; 
});

// เลือกรูปภาพของผู้ใช้
const displayAvatar = computed(() => {
  return avatarUrl.value == null ? lineAvatar.value : avatarUrl.value;
});
</script>

<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    color="success"
    bordered
  >
    <VAvatar
      class="cursor-pointer"
      color="primary"
      variant="tonal"
    >
      <VImg :src="displayAvatar" />

      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                  >
                    <VImg :src="displayAvatar" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ userinfo.name }}
            </VListItemTitle>
            <VListItemSubtitle>
              {{ userinfo.role }}
            </VListItemSubtitle>
          </VListItem>
          <VDivider class="my-2" />

          <!-- 👉 Order -->
          <VListItem link to="/Ordering" @click="openOrder">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="bx-dollar"
                size="22"
              />
            </template>

            <VListItemTitle>ดูสินค้า</VListItemTitle>
          </VListItem>

          <!-- 👉 History -->
          <VListItem link to="/history" @click="openHistory">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="bx-history"
                size="22"
              />
            </template>

            <VListItemTitle>ดูประวัติการสั่งซื้อ</VListItemTitle>
          </VListItem>

          <!-- 👉 Settings -->
          <VListItem link to="/account-settings" @click="openSettings">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="bx-cog"
                size="22"
              />
            </template>

            <VListItemTitle>ตั้งค่าบัญชี</VListItemTitle>
          </VListItem>

          <!-- Divider -->
          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <VListItem to="/login" @click="logout">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="bx-log-out"
                size="22"
              />
            </template>

            <VListItemTitle>Logout</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
