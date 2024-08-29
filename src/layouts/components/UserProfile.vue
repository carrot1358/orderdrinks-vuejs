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
const jwtToken = computed(() => {
  return localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
});

onMounted(() => {
  getProfile()
})

const props = defineProps({
  isLogin: Boolean,
});

const logout = () => {
  if(localStorage.getItem('jwtToken')){
    localStorage.removeItem('jwtToken');
  }else{
    sessionStorage.removeItem('jwtToken');
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

          <!-- 👉 Profile -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="bx-user"
                size="22"
              />
            </template>

            <VListItemTitle>Profile</VListItemTitle>
          </VListItem>

          <!-- 👉 Settings -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="bx-cog"
                size="22"
              />
            </template>

            <VListItemTitle>Settings</VListItemTitle>
          </VListItem>

          <!-- 👉 Pricing -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="bx-dollar"
                size="22"
              />
            </template>

            <VListItemTitle>Pricing</VListItemTitle>
          </VListItem>

          <!-- 👉 FAQ -->
          <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="bx-help-circle"
                size="22"
              />
            </template>

            <VListItemTitle>FAQ</VListItemTitle>
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
