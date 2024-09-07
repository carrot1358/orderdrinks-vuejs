<script setup>
import logo from '@images/svg/logo.svg?raw'
// import {User_ENDPOINTS} from "@/assets/config/api/api_endPoints";
import axios from "axios";
import router from "@/router";
//import {Alert} from "@/assets/sweetalert2/sweetalert2.js";
import {nextTick} from 'vue';

const alert = new Alert();

const form = ref({
  username: '',
  email: '',
  password: '',
  privacyPolicies: false,
})

const isPasswordVisible = ref(false)

const registerUser = async () => {
  try {
    const response = await axios.post(User_ENDPOINTS.REGISTER, form.value)
    console.log(response.data)
    if (response.data.status === 200) {
      alert.showAlert(response.data.message, '', 'success', 1000)
      await nextTick()
      await router.push('/login').then(() => {
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      })
    } else {
      alert.showAlert(response.data.message, '', 'error', 2000)
    }
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-4 pt-7"
      max-width="448"
    >
      <VCardItem class="justify-center">
        <template #prepend>
          <div class="d-flex">
            <div
              class="d-flex text-primary"
              v-html="logo"
            />
          </div>
        </template>

        <VCardTitle class="text-2xl font-weight-bold">
          OrderDrinks
        </VCardTitle>
      </VCardItem>

      <VCardText class="pt-2">
        <h5 class="text-h5 mb-1">
          เตรียมรับประสบการ์ณที่มากที่สุด 🚀
        </h5>
        <p class="mb-0">
          สร้างบัญชีผู้ใช้ของคุณเพื่อเริ่มต้นใช้งาน
        </p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="registerUser">
          <VRow>
            <!-- Username -->
            <VCol cols="12">
              <VTextField
                v-model="form.username"
                autofocus
                label="ชื่อผู้ใช้"
                placeholder="FishingNetDefect"
              />
            </VCol>
            <!-- email -->
            <VCol cols="12">
              <VTextField
                v-model="form.email"
                label="อีเมล์"
                placeholder="FishingNetDefect@email.com"
                type="email"
              />
            </VCol>

            <!-- password -->
            <VCol cols="12">
              <VTextField
                v-model="form.password"
                label="รหัสผ่าน"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'bx-hide' : 'bx-show'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
              <div class="d-flex align-center mt-1 mb-4">
                <VCheckbox
                  id="privacy-policy"
                  v-model="form.privacyPolicies"
                  inline
                />
                <VLabel
                  for="privacy-policy"
                  style="opacity: 1;"
                >
                  <span class="me-1">ฉันยอมรับเงื่อนไข</span>
                  <a
                    href="javascript:void(0)"
                    class="text-primary"
                  >privacy policy & terms</a>
                </VLabel>
              </div>

              <VBtn
                block
                type="submit"
              >
                สมัครสมาชิก
              </VBtn>
            </VCol>

            <!-- login instead -->
            <VCol
              cols="12"
              class="text-center text-base"
            >
              <span>มีบัญชีอยู่แล้ว?</span>
              <RouterLink
                class="text-primary ms-2"
                to="/login"
              >
                ลงชื่อเข้าใช้
              </RouterLink>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
