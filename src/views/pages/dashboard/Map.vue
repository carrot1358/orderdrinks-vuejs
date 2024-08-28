<script setup>
import { ref, onMounted, watch } from "vue";
import { LongdoMap, LongdoMapLoad } from "longdo-map-vue";

// ใช้ API key จาก .env file
const apiKey = import.meta.env.VITE_LONGDO_MAP_API_KEY;

// โหลด Longdo Map ด้วย API key
LongdoMapLoad({
    apiKey: apiKey,
});

const zoom = ref(15);
const center = ref([13.7563, 100.5018]); // กรุงเทพมหานคร
const myCoordinates = ref(null);
const mapInstance = ref(null);
const marker = ref(null);

const updateMarkerAndMap = () => {
    if (mapInstance.value && myCoordinates.value) {
        if (!marker.value) {
            marker.value = new window.longdo.Marker(myCoordinates.value, {
                title: "ตำแหน่งของฉัน",
                icon: {
                    url: "https://map.longdo.com/mmmap/images/pin_mark.png",
                    offset: { x: 12, y: 45 },
                },
            });
            mapInstance.value.Overlays.add(marker.value);
        } else {
            marker.value.setLocation(myCoordinates.value);
        }
        mapInstance.value.location(myCoordinates.value, true);
        mapInstance.value.zoom(15, true);
    }
};

const getMyLocation = () => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            myCoordinates.value = [
                position.coords.latitude,
                position.coords.longitude,
            ];
            center.value = myCoordinates.value;
            updateMarkerAndMap();
        },
        (error) => {
            console.error("Error getting location: ", error);
        }
    );
};

const onMapReady = (map) => {
    mapInstance.value = map;
    getMyLocation();
};

watch(myCoordinates, updateMarkerAndMap);

onMounted(() => {
    if (typeof window.longdo === "undefined") {
        window.addEventListener("longdomapready", getMyLocation);
    } else {
        getMyLocation();
    }
});
</script>

<template>
    <longdo-map
        :zoom="zoom"
        :center="center"
        @ready="onMapReady"
        class="map-container"
    >
        <longdo-map-marker
            :location="{ lon: 99, lat: 14 }"
            :title="'Home'"
            :detail="'My home'"
        />
    </longdo-map>

    <VBtn @click="getMyLocation">ตำแหน่งของฉัน</VBtn>
    {{ myCoordinates }} {{ center }}
</template>

<style scoped>
.map-container {
    height: 500px;
    width: 100%;
}
</style>
