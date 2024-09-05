<script setup>
import { useTheme } from 'vuetify'
import VerticalNavSectionTitle from '@/@layouts/components/VerticalNavSectionTitle.vue'
import upgradeBannerDark from '@images/pro/upgrade-banner-dark.png'
import upgradeBannerLight from '@images/pro/upgrade-banner-light.png'
import VerticalNavLayout from '@layouts/components/VerticalNavLayout.vue'
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'

const vuetifyTheme = useTheme()

const jwtToken = localStorage.getItem('jwtToken') ? localStorage.getItem('jwtToken') : sessionStorage.getItem('jwtToken');
const userinfo = ref(JSON.parse(localStorage.getItem('userinfo') || sessionStorage.getItem('userinfo') || '{}'));

const isLogin = computed(() => {
  if (jwtToken) {
    return true;
  } else {
    return false;
  }
});

const isAdmin = computed(() => {
  if (userinfo.value.role === 'admin') {
    return true;
  } else {
    return false;
  }
});

const isEmployee = computed(() => {
  if(isLogin.value){
    if (userinfo.value.role !== 'user') {
      return true;
  }} else {
    return false;
  }
});

const isUser = computed(() => {
  if (userinfo.value.role === 'user') {
    return true;
  } else {
    return false;
  }
});

</script>

<template>
  <VerticalNavLayout>
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <!-- 👉 Vertical nav toggle in overlay mode -->
        <IconBtn class="ms-n3 d-lg-none" @click="toggleVerticalOverlayNavActive(true)">
          <VIcon icon="bx-menu" />
        </IconBtn>
        <VSpacer />

        <IconBtn class="me-2" href="https://github.com/themeselection/sneat-vuetify-vuejs-admin-template-free"
          target="_blank" rel="noopener noreferrer">
          <VIcon icon="bxl-github" />
        </IconBtn>

        <IconBtn class="me-2">
          <VIcon icon="bx-bell" />
        </IconBtn>

        <NavbarThemeSwitcher class="me-2" />
        <div v-if="isLogin">
          <UserProfile :isLogin="isLogin" />
        </div>
        <div v-else>
          <RouterLink to="/login">
            <VBtn class="text-capitalize" color="primary" size="small" outlined>
              <VIcon icon="bx-log-in" />
              Login
            </VBtn>
          </RouterLink>
        </div>
      </div>
    </template>

    <template #vertical-nav-content>
      <VerticalNavLink :item="{
        title: 'สั่งซื้อสินค้า',
        icon: 'bx-cart',
        to: '/Ordering',
      }" />
      <VerticalNavLink v-if="isUser || isEmployee || isAdmin" :item="{
        title: 'ประวัติการสั่งซื้อ',
        icon: 'bx-history',
        to: '/history',
      }" />
      <VerticalNavLink v-if="isLogin" :item="{
        title: 'ตั้งค่าบัญชี',
        icon: 'mdi-account-cog-outline',
        to: '/account-settings',
      }"  />
      <VerticalNavSectionTitle v-if="isEmployee" :item="{
        heading: 'พนักงาน',
      }" />
      <VerticalNavLink v-if="isEmployee" :item="{
        title: 'รายการคำสั่งซื้อ',
        icon: 'bx-list-ul',
        to: '/OrderList',
      }" />
      <VerticalNavLink v-if="isEmployee" :item="{
        title: 'จัดการสินค้า',
        icon: 'bx-package',
        to: '/product-manage',
      }" />
      <VerticalNavLink v-if="isAdmin" :item="{
        title: 'จัดการการชำระเงิน',
        icon: 'bx-credit-card',
        to: '/payment-manage',
      }" />

      <!-- 👉 Pages -->
      <VerticalNavSectionTitle :item="{
        heading: 'Pages',
      }" />
      <VerticalNavLink :item="{
        title: 'เกี่ยวกับเรา',
        icon: 'mdi-account',
        to: '/about-me',
      }" />

      <!--       👉 User Interface
            <VerticalNavSectionTitle
              :item="{
                heading: 'User Interface',
              }"
            />
            <VerticalNavLink
              :item="{
                title: 'Typography',
                icon: 'mdi-alpha-t-box-outline',
                to: '/typography',
              }"
            />
            <VerticalNavLink
              :item="{
                title: 'Icons',
                icon: 'bx-show',
                to: '/icons',
              }"
            />
            <VerticalNavLink
              :item="{
                title: 'Cards',
                icon: 'bx-credit-card',
                to: '/cards',
              }"
            />
            <VerticalNavLink
              :item="{
                title: 'Tables',
                icon: 'bx-table',
                to: '/tables',
              }"
            />
            <VerticalNavLink
              :item="{
                title: 'Form Layouts',
                icon: 'mdi-form-select',
                to: '/form-layouts',
              }"
            />-->

    </template>


    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <!--      <Footer />-->
    </template>
  </VerticalNavLayout>
</template>

<style lang="scss" scoped>
.meta-key {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  block-size: 1.5625rem;
  line-height: 1.3125rem;
  padding-block: 0.125rem;
  padding-inline: 0.25rem;
}
</style>
