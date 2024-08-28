<script setup>
import { ref } from "vue";
import { LongdoMap, LongdoMapLoad } from "longdo-map-vue";

const apiKey = import.meta.env.VITE_LONGDO_MAP_API_KEY;

LongdoMapLoad({
  apiKey: apiKey,
});

const myLocation = ref([16.441541396163437, 102.91509502842585]); // ตำแหน่งคงที่
const mapInstance = ref(null);
const zoom = ref(15);

function loadMap(map) {
  mapInstance.value = map;
  map.Layers.setBase(longdo.Layers.NORMAL);
  addMarker();
}

function addMarker() {
  if (mapInstance.value) {
    const marker = new longdo.Marker({ lon: myLocation.value[1], lat: myLocation.value[0] },
    {
      title: 'ตำแหน่งที่กำหนด',
      icon: {
        url: 'https://map.longdo.com/mmmap/images/pin_mark.png',
        offset: { x: 12, y: 45 }
      }
    });
    mapInstance.value.Overlays.add(marker);
    mapInstance.value.location({ lon: myLocation.value[1], lat: myLocation.value[0] }, true);
    mapInstance.value.zoom(zoom.value, true);
  }
}

function openInGoogleMaps() {
  const lat = myLocation.value[0];
  const lng = myLocation.value[1];
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  window.open(url, '_blank');
}
</script>

<template>
  <VCard>
    <VCardTitle class="text-center">
      <h1>About me</h1>
    </VCardTitle>
    <VCardText>
      <VBtn @click="openInGoogleMaps" color="primary" class="mb-4">เปิดใน Google Maps</VBtn>
      <longdo-map @load="loadMap" :zoom="zoom" class="map-container">
      </longdo-map>
    </VCardText>
  </VCard>
</template>

<style scoped>
.map-container {
  height: 500px;
  width: 100%;
}
</style>
