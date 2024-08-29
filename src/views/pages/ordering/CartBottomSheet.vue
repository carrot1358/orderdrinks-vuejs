<script setup>
import {ref} from 'vue';
import giveDetailDeliver from '@/views/pages/ordering/giveDetailDeliver.vue';

const props = defineProps({
    cartVisible: Boolean,
    cartList: Array,
    decreaseQuantityInCart: Function,
    increaseQuantityInCart: Function,
    removeFromCart: Function,
    closeCart: Function,
    totalPrice: Number,
    generateQR: Function,
    qrCodePayment: String,
});
const showDetailDeliver = ref(false);

const handleOrderClick = () => {
    showDetailDeliver.value = true;
    props.closeCart();
    props.generateQR();
};

const closeDetailDeliver = () => {
    showDetailDeliver.value = false;
};

</script>

<template>
    <v-bottom-sheet v-model="props.cartVisible" max-width="100%" persistent :class="props.class">
        <v-container class="fill-height d-flex align-center justify-center">
            <v-card max-width="800" min-width="300" class="text-center align-content-center justify-center">
                <v-card-title>ตะกร้าสินค้า</v-card-title>
                <v-card-text>
                    <div v-for="(product, index) in props.cartList" :key="index">
                        <VCard class="d-flex text-center align-content-center justify-center pa-2 my-5">
                            <VRow>
                                <VCol cols="12" sm="6" md="4">
                                    <div class="d-inline-flex">
                                        <VImg>
                                            <img :src="product.image" alt="Placeholder" height="50"
                                                 class="rounded mx-3">
                                        </VImg>
                                        <p class="align-content-center">{{ product.name }}</p>
                                    </div>
                                </VCol>
                                <VCol cols="12" sm="6" md="8">
                                    <div class="d-inline-flex">
                                        <div class="mx-4">
                                            <v-btn @click="props.decreaseQuantityInCart(index)" min-width="15"
                                                   max-width="10" max-height="30">-
                                            </v-btn>
                                            <span
                                                class="text-center justify-center align-content-center px-4 mb-5">{{
                                                    product.quantity
                                                }}</span>
                                            <v-btn @click="props.increaseQuantityInCart(index)" min-width="15"
                                                   max-width="10" max-height="30">+
                                            </v-btn>
                                            <p>
                                                <span>{{ product.price * product.quantity }} บาท</span>
                                            </p>
                                        </div>
                                        <VBtn class="mx-3" color="error" min-width="15"
                                              @click="props.removeFromCart(index)">ลบ
                                        </VBtn>
                                    </div>
                                </VCol>
                            </VRow>

                        </VCard>
                    </div>
                    <VRow class="d-flex justify-center align-content-center mt-5 mb-2"><h3>ราคารวม : {{ totalPrice }}
                        บาท</h3></VRow>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="primary" @click="handleOrderClick">สั่งซื้อ</v-btn>
                    <v-btn text @click="props.closeCart" color="rgba(255, 0, 0)">ปิด</v-btn>
                </v-card-actions>
            </v-card>
        </v-container>
    </v-bottom-sheet>

    <giveDetailDeliver
        v-model="showDetailDeliver"
        @closeDetailDeliver="closeDetailDeliver"
        :qrCodePayment="props.qrCodePayment"
        :closeDetailDeliver="closeDetailDeliver"
        :cartList="props.cartList"
    />
</template>

<style scoped>
.v-bottom-sheet {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
