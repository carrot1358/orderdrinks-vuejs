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

// Mount vue app
app.mount("#app");
