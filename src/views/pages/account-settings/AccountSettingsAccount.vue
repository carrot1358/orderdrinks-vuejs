<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import axios from 'axios'
import {onMounted, ref} from 'vue'
import {User_ENDPOINTS} from "@/assets/config/api/api_endPoints";
import {Alert} from "@/assets/sweetalert2/sweetalert2";

const alert = new Alert()
const userinfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : JSON.parse(sessionStorage.getItem('userInfo'))
const accountData = {
  id: userinfo.id,
  username: userinfo.username,
  firstname: userinfo.firstname ? userinfo.firstname : null,
  lastname: userinfo.lastname ? userinfo.lastname : null,
  email: userinfo.email,
  phone: userinfo.phone ? userinfo.phone : null,
  address: userinfo.address ? userinfo.address : null,
}
const avatarImg = ref()
const refInputEl = ref()
const accountDataLocal = ref(structuredClone(accountData))
const avatarImgLocal = ref()
const isAccountDeactivated = ref(false)

onMounted(() => {
  getAvatar()
  accountDataLocal.value = structuredClone(accountData)
})

const resetForm = () => {
  accountDataLocal.value = ""
  accountDataLocal.value = structuredClone(accountData)
}

const changeAvatar = file => {
  const fileReader = new FileReader()
  const {files} = file.target
  if (files && files.length) {
    fileReader.readAsDataURL(files[0])
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string')
        avatarImgLocal.value = fileReader.result
    }
  }
}

// reset avatar image
const resetAvatar = () => {
  avatarImgLocal.value = avatarImg.value
}

const saveAccountChanges = async () => {
  const res = await axios.post(User_ENDPOINTS.UPDATE_PROFILE, accountDataLocal.value)
  // console.log(res.data)
  if (res.data.status === 200) {
    accountData.value = accountDataLocal.value
    //save new info to local storage or session storage
    if (localStorage.getItem('userInfo')) {
      localStorage.setItem('userInfo', JSON.stringify(res.data.data))
    } else {
      sessionStorage.setItem('userInfo', JSON.stringify(res.data.data))
    }
    alert.showAlert('success', 'บันทึกข้อมูลสำเร็จ', 'success', 2000)
  } else {
    alert.showAlert('error', 'บันทึกข้อมูลไม่สำเร็จ : ' + res.data.message, 'error', 10000)
  }

}

const saveAvatarChanges = async () => {
  let formData = new FormData();
  // Convert base64 string to file
  const base64String = avatarImgLocal.value.split(',')[1];
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const file = new Blob([byteArray], {type: 'image/jpeg'});

  formData.append('userId', userinfo.id); // assuming userinfo.id is the user's id
  formData.append('imageProfile', file);

  try {
    const res = await axios.post(User_ENDPOINTS.UPDATE_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    // console.log(res.data);
    if (res.data.status === 200) {
      alert.showAlert('success', 'บันทึกข้อมูลสำเร็จ', 'success', 1000)
    } else {
      alert.showAlert('error', 'บันทึกข้อมูลไม่สำเร็จ : ' + res.data.message, 'error', 10000)
    }
    getAvatar();
  } catch (error) {
    console.error("Error updating avatar: ", error);
  }
}

const getAvatar = async () => {


  const res = await axios.get(`${User_ENDPOINTS.GET_AVATAR}?userId=${userinfo.id}`)
  // console.log(res.data)
  if (res.data.status === 200) {
    avatarImg.value = 'data:image/jpeg;base64,' + res.data.data
    avatarImgLocal.value = structuredClone(avatarImg.value)
  } else if (res.data.status === 400) {
    if (res.data.message === 'Error: Image profile not found!') {
      avatarImg.value = avatar1
      avatarImgLocal.value = structuredClone(avatarImg.value)
    }
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="รายละเอียดบัญชี">
        <VCardText class="d-flex">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded="lg"
            size="100"
            class="me-6"
            :image="avatarImgLocal"
          />

          <!-- 👉 Upload Photo -->
          <form class="d-flex flex-column justify-center gap-5">
            <div class="d-flex flex-wrap gap-2">
              <VBtn
                color="primary"
                @click="refInputEl?.click()"
              >
                <VIcon
                  icon="bx-cloud-upload"
                  class="d-sm-none"
                />
                <span class="d-none d-sm-block">อัพโหลดรูป</span>
              </VBtn>

              <input
                ref="refInputEl"
                type="file"
                name="file"
                accept=".jpeg,.png,.jpg,GIF"
                hidden
                @input="changeAvatar"
              >
              <!--SAVE BUTTON-->
              <VBtn
                color="success"
                variant="flat"
                @click="saveAvatarChanges"
                :disabled="avatarImgLocal === avatarImg"
              >
                <span class="d-none d-sm-block">บันทึก</span>
                <VIcon
                  icon="bx-save"
                  class="d-sm-none"
                />
              </VBtn>
              <!--RESET BUTTON-->
              <VBtn
                type="reset"
                color="error"
                variant="tonal"
                @click="resetAvatar"
                :disabled="avatarImgLocal === avatarImg"
              >
                <span class="d-none d-sm-block">รีเซ็ต</span>
                <VIcon
                  icon="bx-refresh"
                  class="d-sm-none"
                />
              </VBtn>
            </div>

            <p class="text-body-1 mb-0">
              รองรับสกุลไฟล์ JPG, GIF or PNG. มีขนาดไม่เกิน 800K
            </p>
          </form>
        </VCardText>

        <VDivider/>

        <VCardText>
          <!-- 👉 Form -->
          <VForm class="mt-6">
            <VRow>
              <!-- 👉 Username -->
              <VCol
                md="6"
                cols="12"
              >
                <VTextField
                  v-model="accountDataLocal.username"
                  placeholder="johndoe"
                  label="ชื่อผู้ใช้"
                />
              </VCol>

              <!-- 👉 First Name -->
              <VCol
                md="6"
                cols="12"
              >
                <VTextField
                  v-model="accountDataLocal.firstname"
                  placeholder="John"
                  label="ชื่อต้น"
                />
              </VCol>

              <!-- 👉 Last Name -->
              <VCol
                md="6"
                cols="12"
              >
                <VTextField
                  v-model="accountDataLocal.lastname"
                  placeholder="Doe"
                  label="นามสกุล"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.email"
                  label="อีเมล์"
                  placeholder="johndoe@gmail.com"
                  type="email"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="accountDataLocal.phone"
                  label="มือถือ"
                  placeholder="089 999 9999"
                />
              </VCol>

              <!-- 👉 Address -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountDataLocal.address"
                  label="ที่อยู่"
                  placeholder="150 ถ.ศรีจันทร์ ต.ในเมือง   อ.เมือง  จ.ขอนแก่น 40000"
                />
              </VCol>

              <!-- 👉 Form Actions -->
              <VCol
                cols="12"
                class="d-flex flex-wrap gap-4"
              >
                <VBtn
                  @click="saveAccountChanges"
                  :disabled="JSON.stringify(accountDataLocal) === JSON.stringify(accountData)"
                >บันทึก
                </VBtn>

                <VBtn
                  color="secondary"
                  variant="tonal"
                  type="reset"
                  @click.prevent="resetForm"
                  :disabled="JSON.stringify(accountDataLocal) === JSON.stringify(accountData)"
                >
                  รีเซ็ต
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <!-- 👉 Deactivate Account -->
      <VCard title="ปิดการใช้งานบัญชี">
        <VCardText>
          <div>
            <VCheckbox
              v-model="isAccountDeactivated"
              label="ฉันยืนยันที่จะปิดบัญชีอย่างถาวร"
            />
          </div>

          <VBtn
            :disabled="!isAccountDeactivated"
            color="error"
            class="mt-3"
          >
            ปิดบัญชี
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
