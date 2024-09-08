import { defineStore } from 'pinia';
import axios from 'axios';
import { Order_ENDPOINTS } from '@/assets/config/api/api_endPoints';

const jwtToken = localStorage.getItem('jwtToken') ? localStorage.getItem('jwtToken') : sessionStorage.getItem('jwtToken');

export const useOrderStore = defineStore('order', {
  state: () => ({
    cartList: [],
  }),
  getters: {
    getTotalPrice() {
      return this.cartList.reduce((total, item) => total + item.price * item.quantity, 0);
    },
  },
  actions: {
    addToCart(product) {
      const existingProductIndex = this.cartList.findIndex(item => item.productId === product.productId);
      if (existingProductIndex !== -1) {
        this.cartList[existingProductIndex].quantity += product.quantity;
      } else {
        this.cartList.push({ ...product });
      }
    },
    removeFromCart(index) {
      this.cartList.splice(index, 1);
    },
    increaseQuantity(index) {
      if (index >= 0 && index < this.cartList.length) {
        this.cartList[index].quantity++;
      }
    },
    decreaseQuantity(index) {
      if (index >= 0 && index < this.cartList.length && this.cartList[index].quantity > 1) {
        this.cartList[index].quantity--;
      }
    },
    async placeOrder(orderDetails) {
      try {
        const formData = new FormData();
        formData.append('products', orderDetails.products);
        formData.append('methodPaid', orderDetails.methodPaid === "โอนเงิน (QR พร้อมเพย์)" ? "promptpay" : "cash");
        const response = await axios.post(Order_ENDPOINTS.createOrder, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${jwtToken}`,
          },
        });
        if (response.status === 201) {
          this.cartList = [];
          return response.data.data;
        }
        throw new Error('Failed to place order');
      } catch (error) {
        console.error('Error placing order:', error);
        throw error;
      }
    },
  },
});
