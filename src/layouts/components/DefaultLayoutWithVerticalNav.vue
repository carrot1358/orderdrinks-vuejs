<script setup>
import { useTheme } from "vuetify";
import VerticalNavSectionTitle from "@/@layouts/components/VerticalNavSectionTitle.vue";
import upgradeBannerDark from "@images/pro/upgrade-banner-dark.png";
import upgradeBannerLight from "@images/pro/upgrade-banner-light.png";
import VerticalNavLayout from "@layouts/components/VerticalNavLayout.vue";
import VerticalNavLink from "@layouts/components/VerticalNavLink.vue";
import { ref } from 'vue';
import LoginDialog from '@/components/LoginDialog.vue'; // สร้างไฟล์นี้ใหม่

// Components
import Footer from "@/layouts/components/Footer.vue";
import NavbarThemeSwitcher from "@/layouts/components/NavbarThemeSwitcher.vue";
import UserProfile from "@/layouts/components/UserProfile.vue";

const vuetifyTheme = useTheme();

const jwtToken = localStorage.getItem("jwtToken")
    ? localStorage.getItem("jwtToken")
    : sessionStorage.getItem("jwtToken");
const userinfo = ref(
    JSON.parse(
        localStorage.getItem("userinfo") ||
        sessionStorage.getItem("userinfo") ||
        "{}"
    )
);

const isLogin = computed(() => {
    if (jwtToken) {
        return true;
    } else {
        return false;
    }
});

const isAdmin = computed(() => {
    if (isLogin.value) {
        if (userinfo.value.role === "admin") {
            return true;
        }
    } else {
        return false;
    }
});

const isEmployee = computed(() => {
    if (isLogin.value) {
        if (userinfo.value.role !== "user") {
            return true;
        }
    } else {
        return false;
    }
});

const isDriver = computed(() => {
    if (isLogin.value) {
        if (
            userinfo.value.role === "driver" ||
            userinfo.value.role === "admin"
        ) {
            return true;
        }
    } else {
        return false;
    }
});

const isUser = computed(() => {
    if (isLogin.value) {
        if (userinfo.value.role === "user") {
            return true;
        }
    } else {
        return false;
    }
});

const showLoginDialog = ref(false);

const openLoginDialog = () => {
  showLoginDialog.value = true;
};
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

                <!-- <IconBtn class="me-2" href="https://github.com/themeselection/sneat-vuetify-vuejs-admin-template-free"
                    target="_blank" rel="noopener noreferrer">
                    <VIcon icon="bxl-github" />
                </IconBtn> -->

                <!-- <IconBtn class="me-2">
                    <VIcon icon="bx-bell" />
                </IconBtn> -->

                <NavbarThemeSwitcher class="me-2" />
                <div v-if="isLogin">
                    <UserProfile :isLogin="isLogin" />
                </div>
                <div v-else>
                    <VBtn class="text-capitalize" color="primary" size="small" outlined @click="openLoginDialog">
                        <VIcon icon="bx-log-in" />
                        Login
                    </VBtn>
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
            }" />
            <VerticalNavSectionTitle v-if="isAdmin" :item="{
                heading: 'ผู้ดูแลระบบ',
            }" />
            <VerticalNavLink v-if="isAdmin" :item="{
                title: 'รายการคำสั่งซื้อ',
                icon: 'bx-list-ul',
                to: '/OrderList',
            }" />
            <VerticalNavLink v-if="isAdmin" :item="{
                title: 'จัดการสินค้า',
                icon: 'bx-package',
                to: '/product-manage',
            }" />
            <VerticalNavLink v-if="isAdmin" :item="{
                title: 'จัดการผู้ใช้',
                icon: 'bx-user',
                to: '/user-manage',
            }" />
            <VerticalNavLink v-if="isAdmin" :item="{
                title: 'จัดการการชำระเงิน',
                icon: 'bx-credit-card',
                to: '/payment-manage',
            }" />
            <VerticalNavLink v-if="isAdmin" :item="{
                title: 'การบำรุงรักษาโรงงาน',
                icon: 'bx:bxs-report',
                to: '/FactoryMaintenace',
            }" />

            <!-- 👉 คนขับรถ -->
            <VerticalNavSectionTitle v-if="isDriver" :item="{
                heading: 'คนขับรถ',
            }" />
            <VerticalNavLink v-if="isDriver" :item="{
                title: 'จัดการส่งสินค้า',
                icon: 'bx-send',
                to: '/deliver',
            }" />
            <VerticalNavLink v-if="isDriver" :item="{
                title: 'จัดการผู้ใช้',
                icon: 'bx-user',
                to: '/user-manage-driver',
            }" />

            <!-- 👉 อื่นๆ -->
            <VerticalNavSectionTitle :item="{
                heading: 'อื่นๆ',
            }" />
            <VerticalNavLink v-if="isAdmin" :item="{
                title: 'สถิติการขาย',
                icon: 'bx-chart',
                to: '/dashboard',
            }" />
            <VerticalNavLink :item="{
                title: 'เกี่ยวกับเรา',
                icon: 'mdi-account',
                to: '/about-me',
            }" />
        </template>

        <!-- 👉 Pages -->
        <slot />

        <!-- 👉 Footer -->
        <template #footer>
            <div class="footer-container">
                <Footer />
            </div>
        </template>
    </VerticalNavLayout>

    <LoginDialog v-model="showLoginDialog" />
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

.footer-container {
    border: 2px solid white; // เพิ่มกรอบสีขาว
    padding: 10px 1rem 0px 1rem;
    margin: 0;
    background-color: white; // ระบายสีขาวลงไปเต็มๆ
    border-radius: 20px;
}

footer.layout-footer {
    border: 2px solid white; // เพิ่มกรอบสีขาว
    padding: 0px 0px 0px 0px;
    margin: 1px;
    background-color: white; // ระบายสีขาวลงไปเต็มๆ

}
</style>
