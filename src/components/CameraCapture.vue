<template>
    <v-card class="camera-container mx-auto" max-width="400" elevation="8">
        <v-card-text class="pa-0">
            <div class="video-wrapper">
                <video ref="videoElement" autoplay playsinline></video>
                <v-overlay :model-value="isCapturing" class="align-center justify-center">
                    <v-progress-circular indeterminate size="64"></v-progress-circular>
                </v-overlay>
            </div>
        </v-card-text>
        
        <v-card-actions class="button-container pa-4">
            <v-btn @click="captureImage" color="primary" variant="elevated" prepend-icon="mdi-camera">
                ถ่ายภาพ
            </v-btn>
            <v-btn @click="switchCamera" color="secondary" variant="elevated" prepend-icon="mdi-camera-switch">
                สลับกล้อง
            </v-btn>
        </v-card-actions>

        <v-expand-transition>
            <v-card-text v-if="capturedImage" class="pa-0">
                <v-img 
                    :src="capturedImage" 
                    :width="width" 
                    :height="height" 
                    cover 
                    class="mt-2"
                    :style="{ objectFit: 'cover', objectPosition: 'center' }"
                >
                    <template v-slot:placeholder>
                        <v-row class="fill-height ma-0" align="center" justify="center">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        </v-row>
                    </template>
                </v-img>
            </v-card-text>
        </v-expand-transition>

        <canvas ref="canvasElement" style="display:none;"></canvas>
    </v-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const videoElement = ref(null);
const canvasElement = ref(null);
const capturedImage = ref(null);
const isCapturing = ref(false);
const width = 480;
const height = 640;
let stream = null;
const facingMode = ref('environment'); // เริ่มต้นด้วยกล้องหลัง

const startCamera = async () => {
    try {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: facingMode.value,
                width: { ideal: height },
                height: { ideal: width }
            }
        });
        if (videoElement.value) {
            videoElement.value.srcObject = stream;
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการเข้าถึงกล้อง:', error);
    }
};

const stopCamera = () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
};

const captureImage = async () => {
    if (videoElement.value && canvasElement.value) {
        isCapturing.value = true;
        await new Promise(resolve => setTimeout(resolve, 300)); // เพิ่มดีเลย์เล็กน้อยเพื่อให้ overlay แสดง

        const context = canvasElement.value.getContext('2d');
        canvasElement.value.width = width;
        canvasElement.value.height = height;
        context.save();
        context.translate(width / 2, height / 2);
        context.rotate(Math.PI / 2);
        context.drawImage(videoElement.value, -height / 2, -width / 2, height, width);
        context.restore();
        capturedImage.value = canvasElement.value.toDataURL('image/jpeg');
        
        isCapturing.value = false;
    }
};

const switchCamera = () => {
    facingMode.value = facingMode.value === 'environment' ? 'user' : 'environment';
    startCamera();
};

onMounted(() => {
    startCamera();
});

onUnmounted(() => {
    stopCamera();
});
</script>

<style scoped>
.camera-container {
    overflow: hidden;
}

.video-wrapper {
    position: relative;
    width: 100%;
    padding-top: 133.33%; /* อัตราส่วน 3:4 (480:640) */
    overflow: hidden;
    background-color: #000;
}

video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: rotate(90deg);
}

.button-container {
    display: flex;
    justify-content: space-around;
}

.v-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>