<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from 'vue';
import axios from 'axios';
import '@fortawesome/fontawesome-free/css/all.css'
import WebSocketService from '@/assets/config/websocket/websocket.js';
import {API_ENDPOINTS} from '@/assets/config/api/api_endPoints.js';
import {Websocket_URL_Frontend} from '@/assets/config/api/websocket_endPoints.js';
import LottieAnimation from "@/assets/lottie/lottieanimetion.vue";
import {Alert} from "@/assets/sweetalert2/sweetalert2.js";

const userinfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : JSON.parse(sessionStorage.getItem('userInfo'));
const alert = new Alert();
let socketService = null;

const id_data = ref('');
const fishingDefectData = ref('');
const imageSrc = ref('');
const needManaged = ref(false);

onMounted(async () => {
  const waitDefect_element = document.getElementById('wait-for-defect');
  //WebSocket
  socketService = new WebSocketService(Websocket_URL_Frontend);
  socketService.onOpen(() => {
    console.log('Connection opened');
  });
  socketService.onMessage((event) => {
    const data = JSON.parse(event.data);
    console.log('Message from server: ');
    if (data.id) {
      id_data.value = data.id;
      getDataById(data.id);
    }
    if(data.message == "Defected"){
      getLastData();
    }
    if (data.message == "Activated") {
      needManaged.value = false;
      alert.showAlert('Success', 'Machine is activated.', 'success', 2000);
    } else if (data.message == "Deactivated") {
      needManaged.value = false;
      alert.showAlert('Success', 'Machine is deactivated.', 'success', 2000);
    } else if (data.message == "This defect is already been managed.") {
      alert.showAlert('Fail', 'This defect is already been managed.', 'success');
    }
    console.log(data);
  });
  socketService.onError((error) => {
    console.log('WebSocket Error: ', error);
  });
  socketService.onClose((event) => {
    console.log('WebSocket connection closed: ', event.code, event.reason);
  });

  getLastData();

});
onUnmounted(() => {
  if (socketService) {
    socketService.close();
  }
});

const getLastData = async () => {
  const response = await axios.get(`${API_ENDPOINTS}/get_lastdata`);
  if (response.data.data.ismanaged == false) {
    fishingDefectData.value = response.data.data;
    imageSrc.value = 'data:image/jpeg;base64,' + fishingDefectData.value["image"];
    console.log(response.data);
    id_data.value = response.data.data.id;
    needManaged.value = true;
  }else{
    console.log("No defect data");
  }

}

const getDataById = async (id: string) => {
  const response = await axios.get(`${API_ENDPOINTS}/get_dataById/${id}`);
  fishingDefectData.value = response.data;
  imageSrc.value = 'data:image/jpeg;base64,' + fishingDefectData.value["image"];
  console.log(response.data);
  id_data.value = response.data.id;
  needManaged.value = true;
}
// Machine Control
const Deactivate_machine = async () => {
  const res = await axios.get(`${API_ENDPOINTS}/deactivate?id=${id_data.value}&userId=${userinfo.id}`);
  console.log(res.data);
  // Reset data
  needManaged.value = false;
  id_data.value = '';
  imageSrc.value = '';
  fishingDefectData.value = '';
}
const Activate_machine = async () => {
  const res = await axios.get(`${API_ENDPOINTS}/activate?id=${id_data.value}&userId=${userinfo.id}`);
  console.log(res.data);
  // Reset data
  needManaged.value = false;
  id_data.value = '';
  imageSrc.value = '';
  fishingDefectData.value = '';
}


//for testing
// needManaged.value = true;

</script>

<template>
  <VRow align="center" justify="center">
    <!-- 👉 Show Defect image section -->
    <VCol
      cols="12"
      lg="8"
      md="8"
    >
      <VCard id="defect-show-card" class="text-center">
        <div v-if="needManaged">
          <VCardText>
            <!-- ID TEXT -->
            <VCardText class="text-h6">
              <VAvatar
                class=""
                color="primary"
                size="40"
                variant="tonal"
              >
                <VIcon
                  icon="bxs-id-card"
                  size="1.5rem"
                />
              </VAvatar>
              ID : {{ id_data }}
            </VCardText>

            <!-- Image -->
            <VImg id="imageDefect"
                  :src="imageSrc"
                  alt="Defect Image"
                  class="align-content-center justify-center align-center d-inline-flex"
                  style="width: 70%; height: 280px;"
            />

          </VCardText>
          <VCardText>
            <VBtn class="mb-2 mx-2" variant="tonal" @click="Deactivate_machine">
              Deactivate Machine
            </VBtn>
            <VBtn class="mb-2 mx-2" variant="elevated" @click="Activate_machine">
              Keep Activate Machine
            </VBtn>
          </VCardText>
        </div>
        <div v-else>
          <VCardText>
            <LottieAnimation animationPath="src/assets/lottie/lottieFile/wait-defect.json"
                             class="justify-center align-content-center text-center align-center d-inline-flex" height="350px"
                             width="300px"/>
            <VCardText>
              <VAvatar
                color="primary"
                size="40"
                variant="tonal"
              >
                <VIcon
                  icon="bxs-error"
                  size="1.5rem"
                />
              </VAvatar>
              Waiting for defect...
            </VCardText>
          </VCardText>
        </div>

      </VCard>
    </VCol>
  </VRow>


</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@100&display=swap');

#defect-show-card {
  height: 500px; /* Set the height as per your requirement */
  overflow: auto; /* Add a scrollbar if the content exceeds the height */
}

#imageDefect {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}
</style>
