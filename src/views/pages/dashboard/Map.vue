<script setup>
import "leaflet/dist/leaflet.css"
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet"

import arcades from "@/assets/Map/arcades.json"

let zoom = ref(6)
let center = ref([38, 139.69])
let my_Coordinates = ref([0, 0])


let getmyLocation = () => {
  navigator.geolocation.getCurrentPosition((position) => {
    my_Coordinates.value = [position.coords.latitude, position.coords.longitude];
    center.value = [position.coords.latitude, position.coords.longitude];

  }, (error) => {
    console.error("Error getting location: ", error);
  });
};
</script>

<template>
  <main>
    <l-map ref="map" v-model:zoom="zoom" v-model:center="center" :useGlobalLeaflet="false">
      <l-tile-layer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                    layer-type="base"
                    name="Stadia Maps Basemap"></l-tile-layer>
      <l-marker :lat-lng="my_Coordinates"  draggable></l-marker>
    </l-map>

  </main>
  <VBtn  @click="getmyLocation">home</VBtn>
  {{center}}
</template>

<style scoped lang="scss">
html, body {
  margin: 0;
  padding: 0;
}

main {
  height: 100vh;
  width: 100vw;
}
</style>
