<template>
    <v-dialog
        :model-value="dialog"
        @update:model-value="$emit('update:dialog', $event)"
        max-width="500px"
    >
        <v-card>
            <v-card-title>
                <span class="headline">เพิ่มการแจ้งเตือนใหม่</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field
                                v-model="newItem.distance"
                                label="ระยะทาง"
                                type="number"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">ยกเลิก</v-btn>
                <v-btn color="blue darken-1" text @click="save">บันทึก</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { ref } from "vue";
import axios from "axios";
import { Notification_ENDPOINTS } from "@/assets/config/api/api_endPoints";
import Swal from "sweetalert2";

export default {
    name: "NotificationCreate",
    props: {
        dialog: Boolean,
    },
    emits: ["update:dialog", "created"],
    setup(props, { emit }) {
        const newItem = ref({
            distance: "",
        });
        const userInfo = JSON.parse(localStorage.getItem('userinfo') || sessionStorage.getItem('userinfo') || '{}');
        const jwtToken = computed(() => localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken'));
        const close = () => {
            emit("update:dialog", false);
            newItem.value = { distance: "" };
        };

        const save = async () => {
            try {
                await axios.post(
                    Notification_ENDPOINTS.addNotification,
                    {
                        distance: parseInt(newItem.value.distance, 10),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${jwtToken.value}`,
                        },
                    }
                ).then((res)=>{
                    if(res.status === 200){
                        Swal.fire({
                            icon: "success",
                            title: "สำเร็จ",
                            text: "การแจ้งเตือนถูกเพิ่มสำเร็จ",
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                })
                emit("created");
                close();
            } catch (error) {
                close();
                Swal.fire({
                    icon: "error",
                    title: "เกิดข้อผิดพลาดในการเพิ่มการแจ้งเตือน:",
                    text: error.message,
                });
            }
        };

        return {
            newItem,
            close,
            save,
        };
    },
};
</script>
