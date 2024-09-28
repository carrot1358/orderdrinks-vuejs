<template>
    <div>
        <v-row>
            <v-col v-for="item in notificationItems" :key="item.distance" cols="12" sm="6" md="4">
                <v-hover v-slot="{ isHovering, props }">
                    <v-card
                        v-bind="props"
                        :elevation="isHovering ? 8 : 2"
                        :class="{ 'on-hover': isHovering }"
                        class="mb-4 transition-swing"
                    >
                        <v-card-title class="text-h6 d-flex align-center">
                            <v-icon color="primary" class="mr-2 rotate-icon">mdi-map-marker-distance</v-icon>
                            ระยะทาง: {{ item.distance }} กม.
                        </v-card-title>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                                color="primary"
                                @click="editNotification(item)"
                                class="pulse-animation"
                            >
                                <v-icon left>mdi-pencil</v-icon>
                                แก้ไข
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-hover>
            </v-col>
        </v-row>
        <v-overlay :model-value="loading" class="align-center justify-center">
            <v-progress-circular indeterminate size="64" color="primary" class="rotate-animation"></v-progress-circular>
        </v-overlay>
    </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { Notification_ENDPOINTS } from "@/assets/config/api/api_endPoints";

export default {
    name: "NotificationList",
    emits: ["edit"],
    setup(props, { emit }) {
        const notifications = ref({ data: [] });
        const loading = ref(true);
        const jwtToken = computed(() => localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken'));

        const notificationItems = computed(() => {
            return notifications.value.data || [];
        });

        const fetchNotifications = async () => {
            try {
                const response = await axios.get(
                    Notification_ENDPOINTS.getNotifications,
                    {
                        headers: {
                            Authorization: `Bearer ${jwtToken.value}`,
                        },
                    }
                );
                notifications.value = response.data;
                loading.value = false;
            } catch (error) {
                console.error(
                    "เกิดข้อผิดพลาดในการดึงข้อมูลการแจ้งเตือน:",
                    error
                );
                loading.value = false;
            }
        };

        const editNotification = (item) => {
            emit("edit", item);
        };

        onMounted(() => {
            fetchNotifications();
        });

        return {
            notificationItems,
            loading,
            editNotification,
            fetchNotifications,
        };
    },
};
</script>

<style scoped>
.on-hover {
    transform: translateY(-5px);
}

.rotate-icon {
    animation: rotate 2s linear infinite;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.pulse-animation {
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}

.rotate-animation {
    animation: rotate 1s linear infinite;
}
</style>
