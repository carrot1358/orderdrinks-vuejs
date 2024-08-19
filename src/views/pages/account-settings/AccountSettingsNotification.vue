<script setup>
import withLink from '@/assets/images/lineNotify/withlink.png'
import {Notification_ENDPOINTS} from "@/assets/config/api/api_endPoints";
import axios from "axios";
import {Alert} from "@/assets/sweetalert2/sweetalert2";
import {ref, reactive, onMounted} from 'vue';
import {propsToCopy} from "@iconify/utils/lib/icon-set/get-icons";
import Swal from "sweetalert2";

const alert = new Alert();
const recentDevices = ref([
  {
    type: 'New for you',
    email: true,
    browser: true,
    app: true,
  },
  {
    type: 'Account activity',
    email: true,
    browser: true,
    app: true,
  },
  {
    type: 'A new browser used to sign in',
    email: true,
    browser: true,
    app: false,
  },
  {
    type: 'A new device is linked',
    email: true,
    browser: false,
    app: false,
  },
]);
const LineKeys = ref([]);
const selectedNotification = ref('Only when I\'m online');
const userinfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : JSON.parse(sessionStorage.getItem('userInfo'));
const addNotifyForm = ref({
  apiKeys: '',
  name: '',
  isSendLink: false,
  isSendImage: true,
  userId: userinfo.id,
});
let editDialog = ref(false);
let editForm = reactive({
  oldNotifyToken: '',
  newNotifyToken: '',
  notifyName: '',
  isSendLink: false,
});
const openEditDialog = (item) => {
  editForm.oldNotifyToken = item.token;
  editForm.newNotifyToken = item.token;
  editForm.notifyName = item.name;
  editForm.isSendLink = item.isSendLink;
  editDialog.value = true;
};

onMounted(() => {
  getAllLineKeys();
});

const copyTokenToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

const submitEditForm = async () => {
  const res = await axios.post(Notification_ENDPOINTS.EDIT, {
    oldNotifyToken: editForm.oldNotifyToken,
    newNotifyToken: editForm.newNotifyToken,
    notifyName: editForm.notifyName,
    isSendLink: editForm.isSendLink,
    isSendImage: true,
  });
  editDialog.value = false;
  if (res.data.status === 200) {
    await getAllLineKeys()
    alert.showAlert("บันทึกข้อมูลสำเร็จ", "", "success", 2000);
  } else {
    alert.showAlert("บันทึกข้อมูลไม่สำเร็จ : ", res.data.message, "error", 10000);
  }
};

const getAllLineKeys = async () => {
  try {
    const res = await axios.post(Notification_ENDPOINTS.GET_BY_USER, {
      userId: userinfo.id,
    });
    LineKeys.value = res.data.data;
  } catch (e) {
    console.error(e);
  }
};

const addLineNotify = async () => {
  try {
    const res = await axios.post(Notification_ENDPOINTS.ADD, addNotifyForm.value);
    console.log(res.data);
    if (res.data.status === 200) {
      addNotifyForm.value = {
        apiKeys: '',
        name: '',
        isSendLink: false,
        isSendImage: true,
        userId: userinfo.id,
      };
      await getAllLineKeys();
      alert.showAlert("บันทึกข้อมูลสำเร็จ", "", "success", 2000);
    } else {
      alert.showAlert("บันทึกข้อมูลไม่สำเร็จ : ", res.data.message, "error", 10000);
    }
  } catch (e) {
    console.error(e);
  }
};

const deleteLineNotify = async (id) => {
  try {
    const confirmation = await Swal.fire({
      title: 'แน่ใจหรือไม่?',
      text: "คุณจะไม่สามารถกู้คืนได้อีก",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่. ลบเลย!',
      cancelButtonText: 'ยกเลิก',
    });

    if (confirmation.isConfirmed) {
      const res = await axios.post(Notification_ENDPOINTS.DELETE, {
        notifyToken: id,
      });
      console.log(res.data);
      if (res.data.status === 200) {
        await getAllLineKeys();
        alert.showAlert("ลบข้อมูลสำเร็จ", "", "success", 2000);
      } else {
        alert.showAlert("ลบข้อมูลไม่สำเร็จ : ", res.data.message, "error", 10000);
      }
    }
  } catch (e) {
    console.error(e);
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <!-- SECTION: Line Notify API -->
      <VCard>
        <VCardTitle>
          Line Notify API
          <VIcon>
            <template #default>
              <img class="small-icon"
                   src="https://upload.wikimedia.org/wikipedia/commons/2/2e/LINE_New_App_Icon_%282020-12%29.png"
                   alt="Line Notify"/>
            </template>
          </VIcon>
        </VCardTitle>

        <VRow>
          <!-- 👉 Create Line Notify -->
          <VCol cols="12" md="5" order-md="0" order="1">
            <VCardText>
              <VForm @submit.prevent="addLineNotify">
                <VRow>
                  <!-- 👉 Name the API Key -->
                  <VCol cols="12">
                    <VTextField
                      label="ชื่อ API key"
                      placeholder="ส่วนตัว, ทีม, หรือโปรเจค"
                      v-model="addNotifyForm.name"/>
                  </VCol>

                  <!-- 👉 Line Notify API Key -->
                  <VCol cols="12">
                    <VTextField
                      label="API key"
                      placeholder="abcdefghijklmnopqrstuvwx"
                      v-model="addNotifyForm.apiKeys"/>
                  </VCol>

                  <!-- 👉 Check Box -->
                  <VCol cols="12">
                    <VCheckbox
                      id="defect-checkbox"
                      label="ส่งลิงค์การจัดการ Defect ด้วย"
                      v-model="addNotifyForm.isSendLink"/>
                    <v-tooltip>
                      <template v-slot:activator="{ props }">
                        <VIcon v-bind="props" class="ml-2" small>
                          mdi-help-circle
                        </VIcon>
                      </template>
                      <div>
                        <VCard class="pa-4">
                          <VImg
                            :src="withLink"
                            alt="Image description"/>
                          <span>
                            <h2>ส่งลิงค์การจัดการ Defect ไปยัง Line Notify ทุกครั้งที่มีการสร้าง Defect ใหม่</h2>
                          </span>
                        </VCard>
                      </div>
                    </v-tooltip>
                  </VCol>

                  <!-- 👉 Create Key Button -->
                  <VCol cols="12">
                    <VBtn
                      type="submit"
                      block
                      :disabled="addNotifyForm.name.length < 1 || addNotifyForm.apiKeys.length < 5">
                      Create Key
                    </VBtn>
                  </VCol>
                </VRow>
              </VForm>
            </VCardText>
          </VCol>
        </VRow>
      </VCard>
    </VCol>

    <VCol cols="12">
      <!-- SECTION: API Keys List -->
      <VCard title="API Key List & Access ">
        <VCardText class="d-flex flex-column gap-y-4">
          <div
            v-for="item in LineKeys"
            :key="item.id"
            class="bg-var-theme-background pa-4">
            <VRow>
              <VCol sm="6" md="8" cols="10">
                <div class="d-flex align-center flex-wrap mb-3">
                  <h6 class="text-h6 mb-0 me-3">
                    {{ item.name }}
                  </h6>
                  <VChip
                    label
                    size="small"
                    :color="item.isSendLink ? '#74FF33' : '#FF3333'">
                    {{ item.isSendLink ? 'Send Link' : 'No Link' }}
                  </VChip>
                </div>
                <p class="text-base font-weight-medium">
                  <span class="me-3">{{ item.token }}</span>
                  <!--                  <VIcon :size="18" icon="bx-copy" class="cursor-pointer" @click="copyTokenToClipboard(item.token)" />-->
                  <v-tooltip>
                    <template v-slot:activator="{ props }">
                      <VIcon
                        :size="18"
                        icon="bx-copy"
                        v-bind="props"
                        @click="copyTokenToClipboard(item.token)"
                      />
                    </template>
                    <span>Copy!</span>
                  </v-tooltip>
                </p>

              </VCol>
              <VCol sm="6" md="4" cols="2" class="d-inline-flex justify-center">
                <VBtn color="#FF9E00" variant="tonal" class="mx-2" @click="openEditDialog(item)"> Edit</VBtn>
                <VBtn color="#FF0000" variant="tonal" class="mx-2" @click="deleteLineNotify(item.token)"> Delete</VBtn>
              </VCol>
            </VRow>
          </div>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <!-- Edit Dialog -->
  <VDialog v-model="editDialog" max-width="500px">
    <VCard>
      <VCardTitle>
        Edit Line Notify
      </VCardTitle>
      <VCardText>
        <VForm>
          <VTextField label="Notify Token" v-model="editForm.newNotifyToken"/>
          <VTextField label="Notify Name" v-model="editForm.notifyName"/>
          <VCheckbox label="Send Link" v-model="editForm.isSendLink"/>
        </VForm>
      </VCardText>
      <VCardActions>
        <VSpacer/>
        <VBtn color="blue darken-1" text @click="editDialog = false">Close</VBtn>
        <VBtn color="blue darken-1" text @click="submitEditForm">Save</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.v-table {
  th {
    text-align: start !important;
  }
}

.small-icon {
  width: 80%;
  height: 80%;
}
</style>
