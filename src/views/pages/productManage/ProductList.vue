<script setup>
import { ref, onMounted, nextTick, inject } from 'vue';
import axios from 'axios';
import { Product_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import { VChip, VDivider, VTooltip } from 'vuetify/components'
import VuePictureCropper, { cropper } from 'vue-picture-cropper';

const VITE_API_URL = import.meta.env.VITE_API_URL;

const products = ref([]);
const editingProduct = ref(null);
const showEditDialog = ref(false);
const imagePreview = ref(null);
const $swal = inject('$swal');
const isLoading = ref(true);
const isShowModal = ref(false);
const pic = ref('');

const props = defineProps({
    fetchProducts: Function,
    onProductEdited: Function
});

onMounted(async () => {
    await props.fetchProducts();
});

const fetchProducts = async () => {
    try {
        isLoading.value = true;
        const response = await axios.get(Product_ENDPOINTS.getProducts);
        products.value = response.data.data;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:', error);
        $swal.fire({
            icon: 'error',
            title: 'การดึงข้อมูลสินค้าผิดพลาด',
            text: 'กรุณาลองใหม่อีกครั้ง',
        });
    } finally {
        isLoading.value = false;
    }
};

defineExpose({ fetchProducts });

const openEditDialog = (product) => {
    editingProduct.value = { ...product };
    imagePreview.value = `${VITE_API_URL}${product.imagePath}`;
    showEditDialog.value = true;
};

const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        pic.value = reader.result;
        isShowModal.value = true;
    };
};

const getResult = async () => {
    if (!cropper) return;
    const base64 = cropper.getDataURL();
    const blob = await cropper.getBlob();
    if (!blob) return;

    editingProduct.value.image = await cropper.getFile({ fileName: 'cropped_image' });
    imagePreview.value = base64;
    isShowModal.value = false;
};

const updateProduct = async () => {
    try {
        const formData = new FormData();
        formData.append('name', editingProduct.value.name);
        formData.append('description', editingProduct.value.description);
        formData.append('price', editingProduct.value.price);
        formData.append('stock', editingProduct.value.stock);
        if (editingProduct.value.image instanceof File) {
            formData.append('image', editingProduct.value.image);
        }

        const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

        const response = await axios.put(`${Product_ENDPOINTS.updateProduct}${editingProduct.value.productId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${jwtToken}`
            }
        });

        if (response.status === 200) {
            showEditDialog.value = false;
            $swal.fire({
                icon: 'success',
                title: 'อัปเดตสินค้าเรียบร้อย',
                text: 'สินค้าได้รับการอัปเดตสำเร็จ',
                timer: 1500,
                timerProgressBar: true,
            }).then(() => {
                props.onProductEdited();
                // window.location.reload();
            });
        } else {
            $swal.fire({
                icon: 'error',
                title: 'อัปเดตสินค้าผิดพลาด',
                text: response.data.message,
            });
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการอัปเดตสินค้า:', error);
        $swal.fire({
            icon: 'error',
            title: 'อัปเดตสินค้าผิดพลาด',
            text: error.response?.data?.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        });
    }
};

const deleteProduct = async (productId) => {
    try {
        const result = await $swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: "คุณจะไม่สามารถกู้คืนสินค้านี้ได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ใช่, ลบเลย!',
            cancelButtonText: 'ยกเลิก'
        });

        if (result.isConfirmed) {
            const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
            const response = await axios.delete(`${Product_ENDPOINTS.deleteProduct}${productId}`, {
                headers: {
                    'Authorization': `Bearer ${jwtToken}`
                }
            });

            if (response.status === 200) {
                await fetchProducts();
                $swal.fire({
                    title: 'ลบแล้ว!',
                    text: 'สินค้าของคุณถูกลบเรียบร้อยแล้ว',
                    icon: 'success',
                    timer: 1500,
                    timerProgressBar: true,
                    customClass: {
                        container: 'swal-on-top'
                    }
                });
            }
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบสินค้า:', error);
        $swal.fire({
            icon: 'error',
            title: 'ลบสินค้าผิดพลาด',
            text: error.response?.data?.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
            customClass: {
                container: 'swal-on-top'
            }
        });
    }
};

const getStockColor = (stock) => {
    if (stock === -1) return 'info'
    if (stock > 50) return 'success'
    if (stock > 20) return 'warning'
    return 'error'
}
</script>

<template>
    <VCard class="product-list-card">
        <VCardTitle class="text-h5 font-weight-bold pa-6 d-flex align-center">
            <v-icon large left class="mr-2">mdi-format-list-bulleted</v-icon>
            รายการสินค้า
        </VCardTitle>
        <VDivider></VDivider>
        <VCardText>
            <v-skeleton-loader
                v-if="isLoading"
                type="table-heading, table-thead, table-tbody, table-tfoot"
                class="mb-6"
            ></v-skeleton-loader>

            <VTable v-else hover class="product-table">
                <thead>
                    <tr>
                        <th class="text-left">ชื่อ</th>
                        <th class="text-center">ราคา</th>
                        <th class="text-center">สต็อก</th>
                        <th class="text-center d-none d-sm-table-cell">รูปภาพ</th>
                        <th class="text-center">การดำเนินการ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="product in products" :key="product.productId">
                        <td>{{ product.name }}</td>
                        <td class="text-center">
                            <VChip color="primary" label>{{ product.price }} บาท</VChip>
                        </td>
                        <td class="text-center">
                            <VChip v-if="product.stock !== -1" :color="getStockColor(product.stock)" label>
                                {{ product.stock }}
                            </VChip>
                            <VChip v-else color="info" label>
                                <v-icon left class="mr-1">mdi-infinity</v-icon>
                                ไม่จำกัด
                            </VChip>
                        </td>
                        <td class="text-center d-none d-sm-table-cell">
                            <VTooltip>
                                <template v-slot:activator="{ props }">
                                    <VAvatar size="45" v-bind="props">
                                        <VImg :src="`${VITE_API_URL}${product.imagePath}`" cover></VImg>
                                    </VAvatar>
                                </template>
                                <span>{{ product.name }}</span>
                            </VTooltip>
                        </td>
                        <td class="text-center">
                            <VBtn color="primary" variant="tonal" size="small" class="mr-2 my-1"
                                @click="openEditDialog(product)">
                                <VIcon color="primary" icon="mdi-pencil"></VIcon>
                                <VTooltip activator="parent" location="top">แก้ไข</VTooltip>
                            </VBtn>
                            <VBtn color="error" variant="tonal" size="small" class="my-1" @click="deleteProduct(product.productId)">
                                <VIcon color="error" icon="mdi-delete"></VIcon>
                                <VTooltip activator="parent" location="top">ลบ</VTooltip>
                            </VBtn>
                        </td>
                    </tr>
                </tbody>
            </VTable>
        </VCardText>
    </VCard>

    <VDialog v-model="showEditDialog" max-width="500px">
        <VCard>
            <VCardTitle class="text-h6 font-weight-bold pa-4">
                แก้ไขสินค้า
            </VCardTitle>
            <VDivider></VDivider>
            <VCardText>
                <VForm @submit.prevent="updateProduct" class="pa-4">
                    <VTextField v-model="editingProduct.name" label="ชื่อสินค้า" required outlined dense class="mb-4">
                    </VTextField>
                    <VTextField v-model="editingProduct.description" label="รายละเอียดสินค้า" required outlined dense
                        class="mb-4"></VTextField>
                    <VTextField v-model="editingProduct.price" label="ราคา" type="number" required outlined dense
                        class="mb-4"></VTextField>
                    <VTextField v-model="editingProduct.stock" label="จำนวนในสต็อก" type="number" required outlined
                        dense class="mb-4"></VTextField>
                    <VFileInput label="รูปภาพสินค้า" accept="image/*" @change="handleFileChange" outlined dense
                        class="mb-4"></VFileInput>
                    <VRow justify="center" align="center" class="mb-4">
                        <VCol cols="auto">
                            <VAvatar size="200" v-if="imagePreview">
                                <VImg :src="imagePreview" cover></VImg>
                            </VAvatar>
                        </VCol>
                    </VRow>
                    <VRow justify="center">
                        <VCol cols="auto">
                            <VBtn type="submit" color="primary" class="mr-2">บันทึก</VBtn>
                            <VBtn @click="showEditDialog = false" color="error">ยกเลิก</VBtn>
                        </VCol>
                    </VRow>
                </VForm>
            </VCardText>
        </VCard>
    </VDialog>

    <VDialog v-model="isShowModal" max-width="600px">
        <VCard>
            <VCardTitle>
                <span class="title">ครอบรูปภาพ</span>
                <VSpacer />
            </VCardTitle>
            <VCardText>
                <VuePictureCropper
                    :boxStyle="{ width: '100%', height: '400px', backgroundColor: '#f8f8f8', margin: 'auto' }"
                    :img="pic"
                    :options="{ viewMode: 1, dragMode: 'move', aspectRatio: 1, cropBoxResizable: true }"
                />
            </VCardText>
            <VCardActions>
                <VSpacer />
                <VBtn color="error" @click="isShowModal = false">ยกเลิก</VBtn>
                <VBtn color="primary" @click="getResult">ครอบ</VBtn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<style scoped>
.product-list-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.product-table {
    border-collapse: separate;
    border-spacing: 0 8px;
}

.product-table tbody tr {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.product-table tbody tr:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.swal-on-top {
    z-index: 9999 !important;
}

.v-skeleton-loader {
    border-radius: 8px;
    overflow: hidden;
}
</style>
