import { defineStore } from 'pinia';
import axios from 'axios';
import { Product_ENDPOINTS } from '@/assets/config/api/api_endPoints';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
  }),
  actions: {
    async fetchProducts() {
      try {
        const response = await axios.get(Product_ENDPOINTS.getProducts);
        this.products = response.data.data;
        console.log('products', this.products);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    },
  },
});