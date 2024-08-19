<script setup>
import {useRoute} from 'vue-router'
import AccountSettingsAccount from '@/views/pages/account-settings/AccountSettingsAccount.vue'
import AccountSettingsNotification from '@/views/pages/account-settings/AccountSettingsNotification.vue'
import AccountSettingsSecurity from '@/views/pages/account-settings/AccountSettingsSecurity.vue'
import {onMounted} from "vue";
import router from "@/router";

const route = useRoute()
const activeTab = ref(route.params.tab)

onMounted(() => {
  /*if (localStorage.getItem('userInfo') === null && sessionStorage.getItem('userInfo') === null){
    router.push('/login').then(
      () => {
        console.log('redirected to login')
        window.location.reload()
      }
    )
  }*/
})

// tabs
const tabs = [
  {
    title: 'Account',
    icon: 'bx-user',
    tab: 'account',
  },
  {
    title: 'Security',
    icon: 'bx-lock-open',
    tab: 'security',
  },
  {
    title: 'Notifications',
    icon: 'bx-bell',
    tab: 'notification',
  },
]
</script>

<template>
  <div>
    <VTabs
      v-model="activeTab"
      show-arrows
    >
      <VTab
        v-for="item in tabs"
        :key="item.icon"
        :value="item.tab"
      >
        <VIcon
          size="20"
          start
          :icon="item.icon"
        />
        {{ item.title }}
      </VTab>
    </VTabs>
    <VDivider/>

    <VWindow
      v-model="activeTab"
      class="mt-5 disable-tab-transition"
    >
      <!-- Account -->
      <VWindowItem value="account">
        <AccountSettingsAccount/>
      </VWindowItem>

       Security
      <VWindowItem value="security">
        <AccountSettingsSecurity/>
      </VWindowItem>

      <!-- Notification -->
      <VWindowItem value="notification">
        <AccountSettingsNotification/>
      </VWindowItem>
    </VWindow>
  </div>
</template>
