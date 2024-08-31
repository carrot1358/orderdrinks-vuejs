import { defineStore } from 'pinia';
import axios from 'axios';
import promptpay from 'promptpay-qr';
import qrcode from 'qrcode';
import { Payment_ENDPOINTS } from '@/assets/config/api/api_endPoints';
import { Order_ENDPOINTS } from '@/assets/config/api/api_endPoints';

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    adminPaymentDetails: {},
    qrCodePayment: '',
  }),
  actions: {
    async fetchPaymentAdminDetails() {
      try {
        const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
        const response = await axios.get(Payment_ENDPOINTS.getPayments, {
          headers: {
            authorization: `Bearer ${jwtToken}`,
          },
        });
        this.adminPaymentDetails = response.data.data[0];
      } catch (error) {
        console.error('Error fetching payment admin details:', error);
      }
    },
    async generateQR(amount) {
      const mobileNumber = this.adminPaymentDetails.numberPromtpay;

      const payload = promptpay(mobileNumber, { amount });
      this.qrCodePayment = await qrcode.toDataURL(payload);
    },
    async checkPaymentStatus(orderId, paymentSlip) {
      const jwtToken = localStorage.getItem('jwtToken') || sessionStorage.getItem('jwtToken');
      try {
        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('slip', paymentSlip);
        const response = await axios.post(Order_ENDPOINTS.checkSlip, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            authorization: `Bearer ${jwtToken}`,
          },
        });
        return response.data.data
      } catch (error) {
        console.error('Error checking payment status:', error);
        return 'ยังไม่ชำระเงิน';
      }
    },
  },
});
