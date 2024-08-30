<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { Product_ENDPOINTS } from '@/assets/config/api/api_endPoints';

const props = defineProps({
  onClose: Function,
  onProductAdded: Function,
  swal: Object
});

const newProduct = ref({
  name: '',
  description: '',
  price: 0,
  stock: 0,
  image: null
});

const imagePreview = ref(null);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  newProduct.value.image = file;
  imagePreview.value = URL.createObjectURL(file);
};

const addProduct = async () => {
  try {
    const formData = new FormData();
    formData.append('name', newProduct.value.name);
    formData.append('description', newProduct.value.description);
    formData.append('price', newProduct.value.price);
    formData.append('stock', newProduct.value.stock);
    formData.append('image', newProduct.value.image);

    const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

    const response = await axios.post(Product_ENDPOINTS.addProduct, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${jwtToken}`
      }
    }).then((response) => {
      console.log(response.data.status);
      if (response.data.status === 201) {
        props.swal.fire({
          title: 'สินค้าเพิ่มสำเร็จ',
          text: 'สินค้าได้ถูกเพิ่มเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonText: 'ตกลง',
          timer: 1500,
          timerProgressBar: true,
        });
        props.onProductAdded();
        props.onClose();
      }
    })
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเพิ่มสินค้า:', error);
    props.swal.fire({
      title: 'ข้อผิดพลาด',
      text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า',
      icon: 'error',
      confirmButtonText: 'ตกลง'
    });
  }
};
</script>

<template>
  <VCard>
    <VCardTitle>เพิ่มสินค้าใหม่</VCardTitle>
    <VCardText>
      <VForm @submit.prevent="addProduct">
        <VTextField class="mb-2" v-model="newProduct.name" label="ชื่อสินค้า" required></VTextField>
        <VTextField class="mb-2" v-model="newProduct.description" label="รายละเอียดสินค้า" required></VTextField>
        <VTextField class="mb-2" v-model="newProduct.price" label="ราคา" type="number" required></VTextField>
        <VTextField class="mb-2" v-model="newProduct.stock" label="จำนวนในสต็อก" type="number" required></VTextField>
        <VFileInput class="mb-2" label="รูปภาพสินค้า" accept="image/*" @change="handleFileChange" required></VFileInput>

        <VRow justify="center" align="center">
          <VCol cols="auto">
            <VImg v-if="imagePreview" :src="imagePreview" width="200" height="200" class="rounded-lg"></VImg>
          </VCol>
        </VRow>
        <VRow justify="center" class="mt-4">
          <VCol cols="auto">
            <VBtn type="submit" color="primary" class="mr-2">เพิ่มสินค้า</VBtn>
            <VBtn @click="$emit('close')" color="error">ยกเลิก</VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>
