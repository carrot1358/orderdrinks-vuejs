/* eslint-disable import/order */
// import "@/@iconify/icons-bundle";
import App from "@/App.vue";
import vuetify from "@/plugins/vuetify";
import { loadFonts } from "@/plugins/webfontloader";
import router from "@/router";
import "@core/scss/template/index.scss";
import "@layouts/styles/index.scss";
import "@styles/styles.scss";
import { createPinia } from "pinia";
import { createApp } from "vue";
import VueSweetalert2 from "vue-sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import Vue3Lottie from "vue3-lottie";
import LongdoMap from "longdo-map-vue";
import Swal from 'sweetalert2';

loadFonts();

// Create vue app
const app = createApp(App);

app
  .use(LongdoMap, {
    load: {
      apiKey: import.meta.env.VITE_LONGDO_MAP_API_KEY,
    },
  })
// Use plugins
app.use(vuetify);
app.use(createPinia());
app.use(router);
app.use(VueSweetalert2);
app.use(Vue3Lottie);

// กำหนดค่าเริ่มต้นสำหรับ Sweetalert2
const swal = Swal.mixin({
  customClass: {
    container: 'my-swal'
  }
})

// ใช้ swal แทน Swal ในแอพพลิเคชันของคุณ
app.config.globalProperties.$swal = swal

// เพิ่ม CSS global
const style = document.createElement('style')
style.textContent = `
  .my-swal {
    z-index: 9999 !important;
  }
`
document.head.appendChild(style)

// Mount vue app
app.mount("#app");
