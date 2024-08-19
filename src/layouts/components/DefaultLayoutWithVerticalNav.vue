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
let userinfo = localStorage.getItem('userInfo') ? localStorage.getItem('userInfo') : sessionStorage.getItem('userInfo');

</script>

<template>
  <VerticalNavLayout>
    <!-- 👉 navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center">
        <!-- 👉 Vertical nav toggle in overlay mode -->
        <IconBtn
          class="ms-n3 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon icon="bx-menu" />
        </IconBtn>
        <VSpacer />

        <IconBtn
          class="me-2"
          href="https://github.com/themeselection/sneat-vuetify-vuejs-admin-template-free"
          target="_blank"
          rel="noopener noreferrer"
        >
          <VIcon icon="bxl-github" />
        </IconBtn>

        <IconBtn class="me-2">
          <VIcon icon="bx-bell" />
        </IconBtn>

        <NavbarThemeSwitcher class="me-2" />
        <div v-if="userinfo">
          <UserProfile />
        </div>
        <div v-else>
          <RouterLink to="/login">
            <VBtn
              class="text-capitalize"
              color="primary"
              size="small"
              outlined
            >
              <VIcon icon="bx-log-in" />
               Login
            </VBtn>
          </RouterLink>
        </div>

      </div>
    </template>

    <template #vertical-nav-content>
      <VerticalNavLink
        :item="{
          title: 'Dashboard',
          icon: 'bx-home',
          to: '/dashboard',
        }"
      />
<!--      <VerticalNavLink
        :item="{
          title:'Defect Detection',
          icon:'bx-bug',
          to:'/DefectDetection',
        }"
      />-->
      <VerticalNavLink
        :item="{
          title:'สั่งซื้อสินค้า',
          icon:'bx-cart',
          to:'/Ordering',
        }"
      />
      <VerticalNavLink
        :item="{
          title:'History',
          icon:'bx-history',
          to:'/history',
        }"
      />
      <VerticalNavLink
        :item="{
          title: 'Account Settings',
          icon: 'mdi-account-cog-outline',
          to: '/account-settings',
        }"
      />
        <VerticalNavSectionTitle :item="{
            heading: 'พนักงาน',
        }"/>
            <VerticalNavLink
                :item="{
                    title: 'รายการคำสั่งซื้อ',
                    icon: 'bx-list-ul',
                    to: '/OrderList',
                }"
            />


      <!-- 👉 Pages -->
      <VerticalNavSectionTitle
        :item="{
          heading: 'Pages',
        }"
      />
      <VerticalNavLink
        :item="{
          title: 'Login',
          icon: 'bx-log-in',
          to: '/login',
        }"
      />
      <VerticalNavLink
        :item="{
          title: 'Register',
          icon: 'bx-user-plus',
          to: '/register',
        }"
      />
      <VerticalNavLink
        :item="{
          title: 'Error',
          icon: 'bx-info-circle',
          to: '/no-existence',
        }"
      />

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
