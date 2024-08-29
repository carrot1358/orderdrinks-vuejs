<script setup>
import { ref, computed, onMounted } from 'vue';
import OrderDialog from '@/views/pages/ordering/OrderDialog.vue';
import CartBottomSheet from '@/views/pages/ordering/CartBottomSheet.vue';
import promptpay from 'promptpay-qr';
import qrcode from 'qrcode';
import { inject } from 'vue';

const $swal = inject('$swal')

const jwtToken = localStorage.getItem('jwtToken') ? localStorage.getItem('jwtToken') : sessionStorage.getItem('jwtToken');

const qrCodePayment = ref('');
const adminPaymentPhone = ref('0945756665');

const cartVisible = ref(false);
const buttonCartVisible = ref(false);

const cartList = ref([]);
const totalPrice = computed(() => {
    return cartList.value.reduce((acc, cur) => acc + cur.price * cur.quantity, 0);
});
const lookingOrdering = ref(false);
const lookingProduct = ref({
    name: null,
    price: null,
    image: null,
    quantity: 1,
});
const products = ref([
    {name: 'ขวดเล็ก', price: 100, image: 'https://via.placeholder.com/200'},
    {name: 'ขวดกลาง', price: 150, image: 'https://via.placeholder.com/200'},
    {name: 'ขวดใหญ่', price: 200, image: 'https://via.placeholder.com/200'},
]);

const generateQR = async () => {
    const mobileNumber = adminPaymentPhone.value;
    const amount = totalPrice.value;
    console.log('generateQR -> amount', amount);
    const payload = promptpay(mobileNumber, { amount });
    qrCodePayment.value = await qrcode.toDataURL(payload);
};
const increaseQuantity = () => {
    lookingProduct.value.quantity++;
};

const decreaseQuantity = () => {
    if (lookingProduct.value.quantity > 1) {
        lookingProduct.value.quantity--;
    }
};

const addToCart = (product) => {
    let isExist = false;
    for (let i = 0; i < cartList.value.length; i++) {
        if (cartList.value[i].name === product.name) {
            cartList.value[i].quantity += product.quantity;
            isExist = true;
            break;
        }
    }
    if (!isExist) {
        cartList.value.push(product);
    }
    buttonCartVisible.value = true;
    lookingOrdering.value = false;
};

const clickOrder = (index) => {
    lookingOrdering.value = true;
    lookingProduct.value = {...products.value[index], quantity: 1};
};

const closeDialog = () => {
    lookingOrdering.value = false;
};

const decreaseQuantityInCart = (index) => {
    if (cartList.value[index].quantity > 1) {
        cartList.value[index].quantity--;
    }
};

const increaseQuantityInCart = (index) => {
    cartList.value[index].quantity++;
    console.log(JSON.stringify(cartList, null, 2));
    console.log(totalPrice.value);
};

const removeFromCart = (index) => {
    cartList.value.splice(index, 1);
    if (cartList.value.length === 0) {
        buttonCartVisible.value = false;
        cartVisible.value = false;
    }
};

const closeCart = () => {
    cartVisible.value = false;
};
</script>

<template>

    <OrderDialog
        :lookingOrdering="lookingOrdering"
        :lookingProduct="lookingProduct"
        :increaseQuantity="increaseQuantity"
        :decreaseQuantity="decreaseQuantity"
        :addToCart="addToCart"
        :closeDialog="closeDialog"
    />

    <CartBottomSheet
        :cartVisible="cartVisible"
        :cartList="cartList"
        :decreaseQuantityInCart="decreaseQuantityInCart"
        :increaseQuantityInCart="increaseQuantityInCart"
        :removeFromCart="removeFromCart"
        :closeCart="closeCart"
        :totalPrice="totalPrice"
        :generateQR="generateQR"
        :qrCodePayment="qrCodePayment"
        class="cart-Bottom-Sheet"
    />

    <VCard class="align-content-center justify-center text-center pa-2 pb-8 center">
        <VCardTitle><h1>สั่งซื้อสินค้า</h1></VCardTitle>
        <VRow class="align-content-center justify-center">
            <div v-for="(product, index) in products" :key="index">
                <VCol>
                    <VCard class="ma-1 pa-3">
                        <VCardTitle>{{ product.name }}</VCardTitle>
                        <VImg>
                            <img class="rounded" src="https://via.placeholder.com/200" alt="Placeholder">
                        </VImg>
                        <VBtn color="primary" @click="clickOrder(index)">สั่ง</VBtn>
                    </VCard>
                </VCol>
            </div>
        </VRow>
    </VCard>

    <v-btn icon large class="cart-button" @click="cartVisible = true" v-if="buttonCartVisible">
        <v-icon>mdi-cart</v-icon>
    </v-btn>
</template>

<style scoped>

.cart-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
}

.cart-Bottom-Sheet {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
