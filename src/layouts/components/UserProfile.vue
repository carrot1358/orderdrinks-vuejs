<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import router from "@/router";
import axios from "axios";
import {User_ENDPOINTS} from "@/assets/config/api/api_endPoints";
import {onMounted} from "vue";
const avatarProfile = ref();

const userinfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : JSON.parse(sessionStorage.getItem('userInfo'));

onMounted(() => {
  getAvatarProfile()
})

const logout = () => {
  if(localStorage.getItem('userInfo')){
    localStorage.removeItem('userInfo');
  }else{
    sessionStorage.removeItem('userInfo');
  }
  userinfo.value = null;
  /*
  router.push('/').then(() => {
    window.location.reload();
  });*/
};

const getAvatarProfile = async () => {
    const res = await axios.get(`${User_ENDPOINTS.GET_AVATAR}?userId=${userinfo.id}`)
    // console.log(res.data)
    if (res.data.status === 200) {
      avatarProfile.value = 'data:image/jpeg;base64,'+res.data.data
    }else if(res.data.status === 400){
      if(res.data.message === 'Error: Image profile not found!'){
        avatarProfile.value = avatar1
      }
    }
}
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
      <VImg :src="avatarProfile" />

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
                    <VImg :src="avatarProfile" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ userinfo.username }}
            </VListItemTitle>
            <VListItemSubtitle>
              {{ userinfo.roles[0].name }}
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
