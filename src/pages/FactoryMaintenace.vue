<template>
    <v-container>
        <v-card>
            <v-card-title class="text-h4 font-weight-bold">
                รายงานการบำรุงรักษาโรงงาน
            </v-card-title>

            <v-card-text>
                <!-- ตารางแสดงข้อมูลการบำรุงรักษา -->
                <v-data-table
                    :headers="headers"
                    :items="maintenanceData"
                    class="elevation-1"
                >
                    <!-- เพิ่ม template สำหรับแต่ละคอลัมน์ตามต้องการ -->
                </v-data-table>

                <!-- ฟอร์มเพิ่มข้อมูลการบำรุงรักษา -->
                <v-form @submit.prevent="addMaintenanceRecord">
                    <!-- เพิ่ม input fields ตามที่ต้องการ -->
                </v-form>

                <!-- ปุ่ม Export PDF -->
                <v-btn @click="exportToPDF" color="primary">
                    Export รายงาน PDF
                </v-btn>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const maintenanceData = ref([]);
const headers = ref([
    { title: "วันที่", key: "date" },
    { title: "ประเภทการบำรุงรักษา", key: "type" },
    { title: "รายละเอียด", key: "details" },
    { title: "ผู้ดำเนินการ", key: "operator" },
]);

onMounted(async () => {
    const userInfo = JSON.parse(localStorage.getItem("userinfo") ? localStorage.getItem("userinfo") : sessionStorage.getItem("userinfo"));
    if (!userInfo.isAdmin) {
        swal.fire({
            icon: "error",
            title: "คุณไม่มีสิทธิ์เข้าสู่ระบบ",
            text: `กรุณาตรวจสอบสิทธิ์ผู้ใช้ของคุณ (${userInfo.role})`,
        });
        setTimeout(() => {
            router.push("/");
        }, 2000);
        return;
    }

    // โหลดข้อมูลการบำรุงรักษา
    await fetchMaintenanceData();
});

const fetchMaintenanceData = async () => {
    try {
        // เรียก API เพื่อดึงข้อมูลการบำรุงรักษา
        const response = await axios.get("/api/maintenance");
        maintenanceData.value = response.data;
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลการบำรุงรักษา:", error);
    }
};

const addMaintenanceRecord = async () => {
    // เพิ่มโลจิกสำหรับการเพิ่มข้อมูลการบำรุงรักษา
};

const exportToPDF = () => {
    // เพิ่มโลจิกสำหรับการ export ข้อมูลเป็น PDF
};
</script>
