<script setup>
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'
import logo from '@images/svg/logo.svg?raw'
import {User_ENDPOINTS} from "@/assets/config/api/api_endPoints";
import axios from "axios";
import router from "@/router";
import {Alert} from "@/assets/sweetalert2/sweetalert2.js";
import {nextTick} from 'vue';


const form = ref({
  username: '',
  password: '',
})
const isPasswordVisible = ref(false)
const remember = ref(false)

const login = async () => {
  try{
    const response = await axios.post(User_ENDPOINTS.LOGIN, form.value);
    if(response.status === 200){
      if(remember.value){
        localStorage.setItem('userInfo', JSON.stringify(response.data.data));
      }else{
        sessionStorage.setItem('userInfo', JSON.stringify(response.data.data));
      }
      console.log(response.data)
      await nextTick()
      await router.push('/').then(() => {
        // window.location.reload();
      })
    }else {
      console.log(response.data)
    }
  }catch (e){
    console.log(e)
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
          ยินดีต้องรับเข้าสู่  Order Drinks! 👋🏻
        </h5>
        <p class="mb-0">
          กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ
        </p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="login">
          <VRow>
            <!-- username -->
            <VCol cols="12">
              <VTextField
                v-model="form.username"
                autofocus
                placeholder="johndoe"
                label="ชื่อผู้ใช้"
                type="username"
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

              <!-- remember me checkbox -->
              <div class="d-flex align-center justify-space-between flex-wrap mt-1 mb-4">
                <VCheckbox
                  v-model="remember"
                  label="จำฉัน"
                />

                <RouterLink
                  class="text-primary ms-2 mb-1"
                  to="javascript:void(0)"
                >
                  ลืมรหัสผ่าน?
                </RouterLink>
              </div>

              <!-- login button -->
              <VBtn
                block
                type="submit"
              >
                Login
              </VBtn>
            </VCol>

            <!-- create account -->
            <VCol
              cols="12"
              class="text-center text-base"
            >
              <span>ยังไม่มีบัญชีหรือเปล่า?</span>
              <RouterLink
                class="text-primary ms-2"
                to="/register"
              >
                สร้างบัญชี
              </RouterLink>
            </VCol>

            <VCol
              cols="12"
              class="d-flex align-center"
            >
              <VDivider />
              <span class="mx-4">or</span>
              <VDivider />
            </VCol>

            <!-- auth providers -->
            <VCol
              cols="12"
              class="text-center"
            >
              <AuthProvider />
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
