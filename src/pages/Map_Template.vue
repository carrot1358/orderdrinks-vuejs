<script setup>
import { ref } from "vue";
import { LongdoMap, LongdoMapLoad } from "longdo-map-vue";

const apiKey = import.meta.env.VITE_LONGDO_MAP_API_KEY;

LongdoMapLoad({
  apiKey: apiKey,
});

const myLocation = ref([13.7563, 100.5018]); // กรุงเทพมหานคร เริ่มต้น
const mapInstance = ref(null);

function loadMap(map) {
  mapInstance.value = map;
  map.Layers.setBase(longdo.Layers.NORMAL);
}

function addMarker(marker) {
  console.log("ตำแหน่งมาร์กเกอร์:", marker.location());
}

function getMyLocation() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      myLocation.value = [position.coords.latitude, position.coords.longitude];
      console.log("ตำแหน่งของฉัน:", myLocation.value);
      
      if (mapInstance.value) {
        // ลบมาร์กเกอร์เก่า (ถ้ามี)
        mapInstance.value.Overlays.clear();
        
        // เพิ่มมาร์กเกอร์ใหม่ที่ตำแหน่งปัจจุบัน
        const marker = new longdo.Marker({ lon: myLocation.value[1], lat: myLocation.value[0] },
        {
          title: 'ตำแหน่งของฉัน',
          icon: {
            url: 'https://map.longdo.com/mmmap/images/pin_mark.png',
            offset: { x: 12, y: 45 }
          }
        });
        mapInstance.value.Overlays.add(marker);
        
        // เลื่อนแผนที่ไปยังตำแหน่งใหม่
        mapInstance.value.location({ lon: myLocation.value[1], lat: myLocation.value[0] }, true);
      }
    },
    (error) => {
      console.error("เกิดข้อผิดพลาดในการรับตำแหน่ง:", error);
    }
  );
}
</script>

<template>
  <VCard>
    <VCardTitle class="text-center">
      <h1>About me</h1>
    </VCardTitle>
    <VCardText>
      <p>นี่คือตำแหน่งปัจจุบันของฉัน:</p>
      <p>ละติจูด: {{ myLocation[0] }}, ลองจิจูด: {{ myLocation[1] }}</p>
      <VBtn @click="getMyLocation" class="mb-4">ตำแหน่งของฉัน</VBtn>
      <longdo-map @load="loadMap" class="map-container">
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
