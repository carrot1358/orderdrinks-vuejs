<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import { Product_ENDPOINTS } from '@/assets/config/api/api_endPoints';

const VITE_API_URL = import.meta.env.VITE_API_URL;

const products = ref([]);
const editingProduct = ref(null);
const showEditDialog = ref(false);
const imagePreview = ref(null);
const $swal = inject('$swal');

const props = defineProps({
  fetchProducts: Function
});

onMounted(async () => {
    await props.fetchProducts();
});

const fetchProducts = async () => {
    try {
        const response = await axios.get(Product_ENDPOINTS.getProducts);
        products.value = response.data.data;
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า:', error);
        $swal.fire({
            icon: 'error',
            title: 'การดึงข้อมูลสินค้าผิดพลาด',
            text: 'กรุณาลองใหม่อีกครั้ง',
        });
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
    editingProduct.value.image = file;
    imagePreview.value = URL.createObjectURL(file);
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

        if(response.status === 200){
            showEditDialog.value = false; 
            $swal.fire({
                icon: 'success',
                title: 'อัปเดตสินค้าเรียบร้อย',
                text: 'สินค้าได้รับการอัปเดตสำเร็จ',
                timer: 1500,
                timerProgressBar: true,
            }).then(() => {
                window.location.reload();
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
                });
            }
        }
    } catch (error) {
        console.error('เกิดข้อผิดพลาดในการลบสินค้า:', error);
        $swal.fire({
            icon: 'error',
            title: 'ลบสินค้าผิดพลาด',
            text: error.response?.data?.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        });
    }
};
</script>

<template>
    <VCard>
        <VCardTitle>รายการสินค้า</VCardTitle>
        <VCardText>
            <VTable>
                <thead>
                    <tr>
                        <th>ชื่อ</th>
                        <th>ราคา</th>
                        <th>สต็อก</th>
                        <th class="d-none d-sm-table-cell">รูปภาพ</th>
                        <th>การดำเนินการ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="product in products" :key="product.productId" class="text-center item-center">
                        <td>{{ product.name }}</td>
                        <td>{{ product.price }}</td>
                        <td>{{ product.stock }}</td>
                        <td class="d-none d-sm-table-cell ">
                            <div class="d-flex justify-center align-center" style="height: 100%;">
                                <VImg :src="`${VITE_API_URL}${product.imagePath}`" width="50" height="45"></VImg>
                            </div>
                        </td>
                        <td>
                            <VBtn color="primary" size="small" class="mx-1 my-1" @click="openEditDialog(product)">แก้ไข</VBtn>
                            <VBtn color="error" size="small" class="mx-1 my-1" @click="deleteProduct(product.productId)">ลบ</VBtn>
                        </td>
                    </tr>
                </tbody>
            </VTable>
        </VCardText>
    </VCard>

    <VDialog v-model="showEditDialog" max-width="500px">
        <VCard>
            <VCardTitle>แก้ไขสินค้า</VCardTitle>
            <VCardText>
                <VForm @submit.prevent="updateProduct">
                    <VTextField class="mb-2" v-model="editingProduct.name" label="ชื่อสินค้า" required></VTextField>
                    <VTextField class="mb-2" v-model="editingProduct.description" label="รายละเอียดสินค้า" required></VTextField>
                    <VTextField class="mb-2" v-model="editingProduct.price" label="ราคา" type="number" required></VTextField>
                    <VTextField class="mb-2" v-model="editingProduct.stock" label="จำนวนในสต็อก" type="number" required></VTextField>
                    <VFileInput class="mb-2" label="รูปภาพสินค้า" accept="image/*" @change="handleFileChange"></VFileInput>
                    <VRow justify="center" align="center">
                        <VCol cols="auto">
                            <VImg v-if="imagePreview" :src="imagePreview"  width="200" height="200" class="rounded-lg"></VImg>
                        </VCol>
                    </VRow>
                    <VRow justify="center" class="mt-4">
                        <VCol cols="auto">
                            <VBtn type="submit" color="primary" class="mr-2">บันทึก</VBtn>
                            <VBtn @click="showEditDialog = false" color="error">ยกเลิก</VBtn>
                        </VCol>
                    </VRow>
                </VForm>
            </VCardText>
        </VCard>
    </VDialog>
</template>

<style scoped>
.v-table td {
    height: 70px; /* ปรับความสูงตามต้องการ */
}

@media (max-width: 600px) {
    .v-table {
        font-size: 0.8rem;
    }

    .v-btn {
        font-size: 0.7rem;
        padding: 0 8px;
    }
}
</style>
