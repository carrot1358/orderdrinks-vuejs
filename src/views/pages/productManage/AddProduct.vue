<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { Product_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import VuePictureCropper, { cropper } from 'vue-picture-cropper';

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
const isShowModal = ref(false);
const pic = ref('');
const result = ref({
  dataURL: '',
  blobURL: ''
});

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

  newProduct.value.image = await cropper.getFile({ fileName: 'cropped_image' });
  imagePreview.value = base64;
  isShowModal.value = false;
};

const descriptionRules = [
  v => !!v || 'คำอธิบายต้องไม่ว่างเปล่า',
  v => v.length <= 100 || 'คำอธิบายต้องไม่เกิน 100 ตัวอักษร'
];

const nameRules = [
  v => !!v || 'ชื่อสินค้าต้องไม่ว่างเปล่า',
  v => v.length <= 100 || 'ชื่อสินค้าต้องไม่เกิน 100 ตัวอักษร'
];

const priceRules = [
  v => !!v || 'ราคาต้องไม่ว่างเปล่า',
  v => v > 0 || 'ราคาต้องไม่ติดลบ หรือ ต้องมากกว่า 0'
];

const stockRules = [
  v => !!v || 'จำนวนในสต็อกต้องไม่ว่างเปล่า',
  v => v > 0 || 'จำนวนในสต็อกต้องมากกว่า 0'
];

const imageRules = [
  v => !!v || 'รูปภาพต้องไม่ว่างเปล่า',
];


const isFormValid = computed(() => {
  return nameRules.every(rule => rule(newProduct.value.name) === true) &&
    descriptionRules.every(rule => rule(newProduct.value.description) === true) &&
    priceRules.every(rule => rule(newProduct.value.price) === true) &&
    stockRules.every(rule => rule(newProduct.value.stock) === true) &&
    imageRules.every(rule => rule(newProduct.value.image) === true);
});

const addProduct = async () => {
  try {
    const formData = new FormData();
    formData.append('name', newProduct.value.name);
    formData.append('description', newProduct.value.description);
    formData.append('price', newProduct.value.price);
    formData.append('stock', newProduct.value.stock);
    formData.append('image', newProduct.value.image);

    const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');

    if (isFormValid.value) {
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
            customClass: {
              container: 'swal-on-top'
            }
          });
          props.onProductAdded();
          props.onClose();
        }
      })
    }
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการเพิ่มสินค้า:', error);
    props.swal.fire({
      title: 'ข้อผิดพลาด',
      text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า',
      icon: 'error',
      confirmButtonText: 'ตกลง',
      customClass: {
        container: 'swal-on-top'
      }
    });
  }
};
</script>

<template>
  <VCard>
    <VCardTitle>เพิ่มสินค้าใหม่</VCardTitle>
    <VCardText>
      <VForm @submit.prevent="addProduct">
        <VTextField class="mb-2" v-model="newProduct.name" label="ชื่อสินค้า" :rules="nameRules" required></VTextField>
        <VTextField class="mb-2" v-model="newProduct.description" :rules="descriptionRules" label="รายละเอียดสินค้า"
          required></VTextField>
        <VTextField class="mb-2" v-model="newProduct.price" label="ราคา" type="number" :rules="priceRules" required></VTextField>
        <VTextField class="mb-2" v-model="newProduct.stock" label="จำนวนในสต็อก" type="number" :rules="stockRules" required></VTextField>
        <VFileInput class="mb-2" label="รูปภาพสินค้า" accept="image/*" @change="handleFileChange" :rules="imageRules" required></VFileInput>

        <VRow justify="center" align="center">
          <VCol cols="auto">
            <VImg v-if="imagePreview" :src="imagePreview" width="200" height="200" class="rounded-lg"></VImg>
          </VCol>
        </VRow>
        <VRow justify="center" class="mt-4">
          <VCol cols="auto">
            <VBtn :disabled="!isFormValid" type="submit" color="primary" class="mr-2">เพิ่มสินค้า</VBtn>
            <VBtn @click="$emit('close')" color="error">ยกเลิก</VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>

  <VDialog v-model="isShowModal" max-width="600px">
    <VCard>
      <VCardTitle>
        <span class="title">ครอบรูปภาพ</span>
        <VSpacer />
      </VCardTitle>
      <VCardText>
        <VuePictureCropper :boxStyle="{ width: '100%', height: '400px', backgroundColor: '#f8f8f8', margin: 'auto' }"
          :img="pic" :options="{ viewMode: 1, dragMode: 'move', aspectRatio: 1, cropBoxResizable: true }" />
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
.swal-on-top {
  z-index: 9999 !important;
}
</style>
