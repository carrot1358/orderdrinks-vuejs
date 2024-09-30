<template>
    <v-dialog
        :model-value="dialog"
        @update:model-value="$emit('update:dialog', $event)"
        max-width="500px"
    >
        <v-card>
            <v-card-title>
                <span class="headline">แก้ไขการแจ้งเตือน</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
              <div class="text-subtitle-1">
                ระยะทางเดิม: <strong>{{ editedItem.distance }} ม.</strong>
              </div>
            </v-col>
                        <v-col cols="12">
                            <v-text-field
                                v-model="editedItem.distance_new"
                                label="ระยะทางใหม่"
                                type="number"
                                :rules="rules.distance_new"
                                outlined
                                dense
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="warning" text @click="close">ยกเลิก</v-btn>
                <v-btn
                    color="success"
                    text
                    @click="save"
                    :disabled="!isFormValid"
                    >บันทึก</v-btn
                >
                <v-btn color="error" text @click="deleteItem"
                    >ลบระยะทางนี้</v-btn
                >
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { ref, watch, computed } from "vue";
import axios from "axios";
import { Notification_ENDPOINTS } from "@/assets/config/api/api_endPoints";
import Swal from "sweetalert2";

export default {
    name: "NotificationEdit",
    props: {
        item: Object,
        dialog: Boolean,
    },
    emits: ["update:dialog", "saved", "deleted"],
    setup(props, { emit }) {
        const editedItem = ref({ ...props.item, distance_new: props.item.distance });
        const jwtToken = computed(
            () =>
                localStorage.getItem("jwtToken") ||
                sessionStorage.getItem("jwtToken")
        );

        const rules = {
            distance_new: [
                (v) => !!v || "กรุณากรอกระยะทางใหม่",
                (v) =>
                    (!isNaN(parseFloat(v)) && isFinite(v)) ||
                    "กรุณากรอกตัวเลขที่ถูกต้อง",
                (v) => v > 0 || "ระยะทางต้องมากกว่า 0",
            ],
        };

        const isFormValid = computed(() => {
            return rules.distance_new.every(
                (rule) => rule(editedItem.value.distance_new) === true
            );
        });

        watch(
            () => props.item,
            (newVal) => {
                editedItem.value = { ...newVal };
            }
        );

        const close = () => {
            emit("update:dialog", false);
        };

        const save = async () => {
            if (!isFormValid.value) {
                console.error("ข้อมูลไม่ถูกต้อง");
                return;
            }

            try {
                await axios
                    .put(
                        Notification_ENDPOINTS.updateNotification,
                        {
                            distance_old: parseInt(props.item.distance, 10),
                            distance_new: parseInt(
                                editedItem.value.distance_new,
                                10
                            ),
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${jwtToken.value}`,
                            },
                        }
                    )
                    .then((response) => {
                        if (response.status === 200) {
                            Swal.fire({
                                icon: "success",
                                title: "อัปเดตการแจ้งเตือนสำเร็จ",
                                showConfirmButton: false,
                                timer: 1500,
                            });
                        }
                    })
                    .catch((error) => {
                        Swal.fire({
                            icon: "error",
                            title: "เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน:",
                            text: error.message,
                        });
                    });
                emit("saved");
                close();
            } catch (error) {
                console.error("เกิดข้อผิดพลาดในการอัปเดตการแจ้งเตือน:", error);
            }
        };

        const deleteItem = async () => {
            try {
                const distance = parseInt(props.item.distance, 10);
                await axios.delete(
                    Notification_ENDPOINTS.deleteNotification,
                    {
                        data: { distance: distance },
                        headers: {
                            Authorization: `Bearer ${jwtToken.value}`,
                        },
                    }
                ).then((response) => {
                    if (response.status === 200) {
                        Swal.fire({
                            icon: "success",
                            title: "ลบการแจ้งเตือนสำเร็จ",
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    }
                })
                emit("deleted");
                close();
            } catch (error) {
                console.error("เกิดข้อผิดพลาดในการลบการแจ้งเตือน:", error);
                // แสดงข้อความแจ้งเตือนให้ผู้ใช้ทราบ
                alert("เกิดข้อผิดพลาดในการลบการแจ้งเตือน: " + error.message);
            }
        };

        return {
            editedItem,
            rules,
            isFormValid,
            close,
            save,
            deleteItem,
        };
    },
};
</script>
