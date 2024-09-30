<template>
    <v-container>
        <v-card>
            <v-card-title class="text-h5 font-weight-bold">
                รายงานการบำรุงรักษาโรงงาน
            </v-card-title>

            <v-card-text>
                <v-row>
                    <v-col cols="12" md="3">
                        <v-btn color="primary" @click="openRefillDialog" block>
                            บันทึกเติมสารกรอง
                        </v-btn>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-btn color="secondary" @click="openChangeDialog" block>
                            บันทึกเปลี่ยนไส้กรอง
                        </v-btn>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-btn color="success" @click="openCleaningDialog" block>
                            บันทึกทำความสะอาดเครื่องกรอง
                        </v-btn>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-btn color="info" @click="openDownloadDialog" block>
                            ดาวน์โหลดรายงาน
                        </v-btn>
                    </v-col>
                </v-row>

                <v-tabs v-model="tab" class="mt-4">
                    <v-tab value="refill">การเติมสารกรอง</v-tab>
                    <v-tab value="change">การเปลี่ยนไส้กรอง</v-tab>
                    <v-tab value="cleaning">การทำความสะอาดเครื่องกรอง</v-tab>
                </v-tabs>

                <v-window v-model="tab">
                    <v-window-item value="refill">
                        <v-data-table :headers="refillHeaders" :items="filterRefills" :items-per-page="itemsPerPage"
                            :page.sync="currentPage" class="elevation-1" @touchstart.stop @touchmove.stop>
                            <template v-slot:item.iodine="{ item }">
                                <v-icon :color="item.iodine ? 'success' : 'error'">
                                    {{ item.iodine ? 'mdi-check' : 'mdi-close' }}
                                </v-icon>
                            </template>
                            <template v-slot:item.carbon="{ item }">
                                <v-icon :color="item.carbon ? 'success' : 'error'">
                                    {{ item.carbon ? 'mdi-check' : 'mdi-close' }}
                                </v-icon>
                            </template>
                            <template v-slot:item.resin="{ item }">
                                <v-icon :color="item.resin ? 'success' : 'error'">
                                    {{ item.resin ? 'mdi-check' : 'mdi-close' }}
                                </v-icon>
                            </template>
                            <template v-slot:item.manganese="{ item }">
                                <v-icon :color="item.manganese ? 'success' : 'error'">
                                    {{ item.manganese ? 'mdi-check' : 'mdi-close' }}
                                </v-icon>
                            </template>
                            <template v-slot:item.sodaAsh="{ item }">
                                <v-icon :color="item.sodaAsh ? 'success' : 'error'">
                                    {{ item.sodaAsh ? 'mdi-check' : 'mdi-close' }}
                                </v-icon>
                            </template>
                            <template v-slot:item.date="{ item }">
                                {{ formatDate(item.date) }}
                            </template>
                            <template v-slot:item.actions="{ item }">
                                <v-btn small color="error" @click="confirmDelete('refill', item._id)">ลบ</v-btn>
                            </template>
                        </v-data-table>
                    </v-window-item>

                    <v-window-item value="change">
                        <v-data-table :headers="changeHeaders" :items="filterChangeData" :items-per-page="itemsPerPage"
                            :page.sync="currentPage" class="elevation-1" @touchstart.stop @touchmove.stop>
                            <template v-slot:item.smallFilter="{ item }">
                                <v-icon :color="item.smallFilter ? 'success' : 'error'">
                                    {{ item.smallFilter ? 'mdi-check' : 'mdi-close' }}
                                </v-icon>
                            </template>
                            <template v-slot:item.membraneFilter="{ item }">
                                <v-icon :color="item.membraneFilter ? 'success' : 'error'">
                                    {{ item.membraneFilter ? 'mdi-check' : 'mdi-close' }}
                                </v-icon>
                            </template>
                            <template v-slot:item.date="{ item }">
                                {{ formatDate(item.date) }}
                            </template>
                            <template v-slot:item.actions="{ item }">
                                <v-btn small color="error" @click="confirmDelete('change', item._id)">ลบ</v-btn>
                            </template>
                        </v-data-table>
                    </v-window-item>

                    <v-window-item value="cleaning">
                        <v-data-table :headers="cleaningHeaders" :items="filterCleaningData"
                            :items-per-page="itemsPerPage" :page.sync="currentPage" class="elevation-1" @touchstart.stop @touchmove.stop>
                            <template v-slot:item.cleaned="{ item }">
                                <v-icon :color="item.cleaned ? 'success' : 'error'">
                                    {{ item.cleaned ? 'mdi-check' : 'mdi-close' }}
                                </v-icon>
                            </template>
                            <template v-slot:item.date="{ item }">
                                {{ formatDate(item.date) }}
                            </template>
                            <template v-slot:item.actions="{ item }">
                                <v-btn small color="error" @click="confirmDelete('cleaning', item._id)">ลบ</v-btn>
                            </template>
                        </v-data-table>
                    </v-window-item>
                </v-window>
            </v-card-text>
        </v-card>

        <!-- Dialog สำหรับบันทึกเติมสารกรอง -->
        <v-dialog v-model="showRefillDialog" max-width="500px">
            <v-card>
                <v-card-title>บันทึกเติมสารกรอง</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="submitRefillForm">
                        <v-checkbox v-model="refillForm.iodine" label="เหลือไออดีน (ทุก 3 วัน)"></v-checkbox>
                        <v-checkbox v-model="refillForm.carbon" label="คาร์บอน (ทุก 1 ปี)"></v-checkbox>
                        <v-checkbox v-model="refillForm.resin" label="เรซิน (ทุก 1 ปี)"></v-checkbox>
                        <v-checkbox v-model="refillForm.manganese" label="แมงกานีส (ทุก 1 ปี)"></v-checkbox>
                        <v-checkbox v-model="refillForm.sodaAsh" label="Soda ash (ทุก 1 ปี)"></v-checkbox>
                        <v-text-field class="mt-3" v-model="refillForm.other" label="รายละเอียดอื่นๆ"></v-text-field>
                        <v-text-field class="mt-3" v-model="refillForm.date" label="วันที่" type="date"
                            :max="getCurrentDate()" :value="getCurrentDate()"></v-text-field>
                        <v-btn type="submit" color="primary" class="mt-4">บันทึก</v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Dialog สำหรับบันทึกเปลี่ยนไส้กรอง -->
        <v-dialog v-model="showChangeDialog" max-width="500px">
            <v-card>
                <v-card-title>บันทึกเปลี่ยนไส้กรอง</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="submitChangeForm">
                        <v-checkbox v-model="changeForm.smallFilter" label="ไส้กรองเล็ก"></v-checkbox>
                        <v-checkbox v-model="changeForm.membraneFilter" label="ไส้กรอง Membrane"></v-checkbox>
                        <v-text-field class="mt-3" v-model="changeForm.other" label="รายละเอียดอื่นๆ"></v-text-field>
                        <v-text-field class="mt-3" v-model="changeForm.date" label="วันที่" type="date"
                            :max="getCurrentDate()" :value="getCurrentDate()"></v-text-field>
                        <v-btn type="submit" color="primary" class="mt-4">บันทึก</v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Dialog สำหรับบันทึกทำความสะอาดเครื่องกรอง -->
        <v-dialog v-model="showCleaningDialog" max-width="500px">
            <v-card>
                <v-card-title>บันทึกทำความสะอาดเครื่องกรอง</v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="submitCleaningForm">
                        <v-checkbox v-model="cleaningForm.cleaned" label="ทำความสะอาด"></v-checkbox>
                        <v-text-field class="mt-3" v-model="cleaningForm.date" label="วันที่" type="date"
                            :max="getCurrentDate()" :value="getCurrentDate()"></v-text-field>
                        <v-btn type="submit" color="primary" class="mt-4">บันทึก</v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>

        <v-dialog v-model="showDownloadDialog" max-width="400px">
            <v-card>
                <v-card-title class="text-h5 font-weight-bold">เลือกประเภทรายงานที่ต้องการดาวน์โหลด</v-card-title>
                <v-card-text>
                    <v-btn-toggle v-model="selectedReportType" mandatory class="d-flex flex-column align-stretch"
                        style="min-height: 200px;">
                        <v-btn value="refill" class="mb-2 flex-grow-1 text-subtitle-1"
                            height="60">การเติมสารกรอง</v-btn>
                        <v-btn value="change" class="mb-2 flex-grow-1 text-subtitle-1"
                            height="60">การเปลี่ยนไส้กรอง</v-btn>
                        <v-btn value="cleaning" class="mb-2 flex-grow-1 text-subtitle-1"
                            height="60">การทำความสะอาดเครื่องกรอง</v-btn>
                    </v-btn-toggle>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="downloadSelectedReport">ดาวน์โหลด PDF</v-btn>
                    <v-btn color="primary" @click="downloadSelectedReportExcel">ดาวน์โหลด Excel</v-btn> <!-- ปุ่มใหม่ -->
                    <v-btn color="error" @click="showDownloadDialog = false">ยกเลิก</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { FactoryMaintenance_ENDPOINTS } from "@/assets/config/api/api_endPoints";
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

const router = useRouter();
const userInfo = ref(JSON.parse(localStorage.getItem('userinfo') || sessionStorage.getItem('userinfo') || '{}'));
const jwtToken = ref(localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken'));

const filterRefills = ref([]);
const filterChangeData = ref([]);
const filterCleaningData = ref([]);

const showRefillDialog = ref(false);
const showChangeDialog = ref(false);
const showCleaningDialog = ref(false);
const showDownloadDialog = ref(false);
const selectedReportType = ref('refill');

const openRefillDialog = () => {
    showRefillDialog.value = true;
    console.log("showRefillDialog", showRefillDialog.value);
};

const openChangeDialog = () => {
    showChangeDialog.value = true;
    console.log("showChangeDialog", showChangeDialog.value);
};

const openCleaningDialog = () => {
    showCleaningDialog.value = true;
    console.log("showCleaningDialog", showCleaningDialog.value);
};

const openDownloadDialog = () => {
    showDownloadDialog.value = true;
};

const refillForm = ref({
    iodine: false,
    carbon: false,
    resin: false,
    manganese: false,
    sodaAsh: false,
    other: "",
    date: new Date().toISOString().split('T')[0],
});

const changeForm = ref({
    smallFilter: false,
    membraneFilter: false,
    other: "",
    date: new Date().toISOString().split('T')[0],
});

const cleaningForm = ref({
    cleaned: false,
    date: new Date().toISOString().split('T')[0],
});

const currentPage = ref(1);
const itemsPerPage = ref(10);

const tab = ref('refill');

const refillHeaders = ref([
    { title: 'ไอโอดีน', key: 'iodine', align: 'center' },
    { title: 'คาร์บอน', key: 'carbon', align: 'center' },
    { title: 'เรซิน', key: 'resin', align: 'center' },
    { title: 'แมงกานีส', key: 'manganese', align: 'center' },
    { title: 'โซดาแอช', key: 'sodaAsh', align: 'center' },
    { title: 'อื่นๆ', key: 'other' },
    { title: 'วันที่', key: 'date', width: '200px' },
    { title: 'การดำเนินการ', key: 'actions', align: 'center' },
]);

onMounted(async () => {
    if (!userInfo.value.isAdmin) {
        await Swal.fire({
            icon: "error",
            title: "คุณไม่มีสิทธิ์เข้าสู่ระบบ",
            text: `กรุณาตรวจสอบสิทธิ์ผู้ใช้ของคุณ (${userInfo.value.role})`,
        });
        router.push("/");
        return;
    }

    await fetchAllData();
});

const getCurrentDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const thailandTime = new Date(now.getTime() - (offset * 60 * 1000) + (7 * 60 * 60 * 1000));
    return thailandTime.toISOString().split('T')[0];
};

const fetchAllData = async () => {
    await Promise.all([
        fetchFilterRefills(),
        fetchFilterChanges(),
        fetchFilterCleanings(),
    ]);
};

const fetchFilterRefills = async () => {
    try {
        const response = await axios.get(FactoryMaintenance_ENDPOINTS.getFilterRefills, {
            headers: { Authorization: `Bearer ${jwtToken.value}` },
        });
        filterRefills.value = response.data.data;
        console.log("filterRefills", filterRefills.value);
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลการเติมสารกรอง:", error);
    }
};

const fetchFilterChanges = async () => {
    try {
        const response = await axios.get(FactoryMaintenance_ENDPOINTS.getFilterChanges, {
            headers: { Authorization: `Bearer ${jwtToken.value}` },
        });
        filterChangeData.value = response.data.data;
        console.log("filterChangeData", filterChangeData.value);
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลการเปลี่ยนไส้กรอง:", error);
    }
};

const fetchFilterCleanings = async () => {
    try {
        const response = await axios.get(FactoryMaintenance_ENDPOINTS.getFilterCleanings, {
            headers: { Authorization: `Bearer ${jwtToken.value}` },
        });
        filterCleaningData.value = response.data.data;
        console.log("filterCleaningData", filterCleaningData.value);
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลการทำความสะอาดเครื่องกรอง:", error);
    }
};

const submitRefillForm = async () => {
    try {
        const formData = new FormData();
        Object.keys(refillForm.value).forEach(key => {
            formData.append(key, refillForm.value[key]);
        });

        await axios.post(FactoryMaintenance_ENDPOINTS.addFilterRefill, formData, {
            headers: {
                Authorization: `Bearer ${jwtToken.value}`,
                'Content-Type': 'multipart/form-data'
            },
        });
        await fetchFilterRefills();
        showRefillDialog.value = false;
        resetRefillForm();
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลการเติมสารกรอง:", error);
    }
};

const submitChangeForm = async () => {
    try {
        const formData = new FormData();
        Object.keys(changeForm.value).forEach(key => {
            formData.append(key, changeForm.value[key]);
        });

        await axios.post(FactoryMaintenance_ENDPOINTS.addFilterChange, formData, {
            headers: {
                Authorization: `Bearer ${jwtToken.value}`,
                'Content-Type': 'multipart/form-data'
            },
        });
        await fetchFilterChanges();
        showChangeDialog.value = false;
        resetChangeForm();
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลการเปลี่ยนไส้กรอง:", error);
    }
};

const submitCleaningForm = async () => {
    try {
        const formData = new FormData();
        Object.keys(cleaningForm.value).forEach(key => {
            formData.append(key, cleaningForm.value[key]);
        });

        await axios.post(FactoryMaintenance_ENDPOINTS.addFilterCleaning, formData, {
            headers: {
                Authorization: `Bearer ${jwtToken.value}`,
                'Content-Type': 'multipart/form-data'
            },
        });
        await fetchFilterCleanings();
        showCleaningDialog.value = false;
        resetCleaningForm();
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการบันทึกข้อมูลการทำความสะอาดเครื่องกรอง:", error);
    }
};

const resetRefillForm = () => {
    refillForm.value = {
        iodine: false,
        carbon: false,
        resin: false,
        manganese: false,
        sodaAsh: false,
        other: "",
        date: new Date().toISOString().split('T')[0],
    };
};

const resetChangeForm = () => {
    changeForm.value = {
        smallFilter: false,
        membraneFilter: false,
        other: "",
        date: new Date().toISOString().split('T')[0],
    };
};

const resetCleaningForm = () => {
    cleaningForm.value = {
        cleaned: false,
        date: new Date().toISOString().split('T')[0],
    };
};

const changeHeaders = ref([
    { title: 'ไส้กรองเล็ก', key: 'smallFilter', align: 'center' },
    { title: 'ไส้กรอง Membrane', key: 'membraneFilter', align: 'center' },
    { title: 'อื่นๆ', key: 'other' },
    { title: 'วันที่', key: 'date', width: '200px' },
    { title: 'การดำเนินการ', key: 'actions', align: 'center' },
]);

const cleaningHeaders = ref([
    { title: 'ทำความสะอาด', key: 'cleaned', align: 'center' },
    { title: 'วันที่', key: 'date', width: '200px' },
    { title: 'การดำเนินการ', key: 'actions', align: 'center' },
]);

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543; // แปลงเป็นปีพุทธศักราช
    return `${day} ${month} ${year}`;
};

const downloadSelectedReport = async () => {
    try {
        let endpoint;
        let filename;

        switch (selectedReportType.value) {
            case 'refill':
                endpoint = FactoryMaintenance_ENDPOINTS.getReportRefillsPDF;
                filename = 'รายงานการเติมสารกรอง.pdf';
                break;
            case 'change':
                endpoint = FactoryMaintenance_ENDPOINTS.getReportChangesPDF;
                filename = 'รายงานการเปลี่ยนไส้กรอง.pdf';
                break;
            case 'cleaning':
                endpoint = FactoryMaintenance_ENDPOINTS.getReportCleaningsPDF;
                filename = 'รายงานการทำความสะอาดเครื่องกรอง.pdf';
                break;
            default:
                throw new Error('ไม่พบประเภทรายงานที่เลือก');
        }

        const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${jwtToken.value}` },
            responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        saveAs(blob, filename);
        showDownloadDialog.value = false;
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดาวน์โหลดรายงาน:", error);
        await Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถดาวน์โหลดรายงานได้ กรุณาลองใหม่อีกครั้ง",
        });
    }
};

const downloadSelectedReportExcel = async () => {
    try {
        let endpoint;
        let filename;

        switch (selectedReportType.value) {
            case 'refill':
                endpoint = FactoryMaintenance_ENDPOINTS.getReportRefillsExcel;
                filename = 'รายงานการเติมสารกรอง.xlsx';
                break;
            case 'change':
                endpoint = FactoryMaintenance_ENDPOINTS.getReportChangesExcel;
                filename = 'รายงานการเปลี่ยนไส้กรอง.xlsx';
                break;
            case 'cleaning':
                endpoint = FactoryMaintenance_ENDPOINTS.getReportCleaningsExcel;
                filename = 'รายงานการทำความสะอาดเครื่องกรอง.xlsx';
                break;
            default:
                throw new Error('ไม่พบประเภทรายงานที่เลือก');
        }

        const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${jwtToken.value}` },
            responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, filename);
        showDownloadDialog.value = false;
    } catch (error) {
        showDownloadDialog.value = false;
        console.error("เกิดข้อผิดพลาดในการดาวน์โหลดรายงาน:", error);
        await Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถดาวน์โหลดรายงานได้ กรุณาลองใหม่อีกครั้ง",
        });
    }
};

const confirmDelete = (type, id) => {
    Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: "คุณจะไม่สามารถย้อนกลับได้!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, ลบมัน!'
    }).then((result) => {
        if (result.isConfirmed) {
            let endpoint;
            switch (type) {
                case 'refill':
                    endpoint = FactoryMaintenance_ENDPOINTS.deleteFilterRefill;
                    break;
                case 'change':
                    endpoint = FactoryMaintenance_ENDPOINTS.deleteFilterChange;
                    break;
                case 'cleaning':
                    endpoint = FactoryMaintenance_ENDPOINTS.deleteFilterCleaning;
                    break;
                default:
                    return;
            }
            deleteItem(endpoint, id);
        }
    });
};

const deleteItem = async (endpoint, id) => {
    try {
        await axios.delete(`${endpoint}${id}`, {
            headers: { Authorization: `Bearer ${jwtToken.value}` },
        });
        Swal.fire(
            {
                title: 'ลบแล้ว!',
                text: 'รายการของคุณถูกลบแล้ว.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            }
        );
        await fetchAllData(); // Refresh the data
    } catch (error) {
        Swal.fire(
            'เกิดข้อผิดพลาด!',
            'มีข้อผิดพลาดในการลบรายการของคุณ.',
            'error'
        );
    }
};
</script>

<style scoped></style>
<style scoped></style>
<style scoped></style>