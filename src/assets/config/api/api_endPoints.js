export const API_ENDPOINTS = "http://localhost:8080/api/fishing-defect"
export const Statistics_ENDPOINTS = "http://localhost:8080/defect_statistics"
const Base_URL = "http://localhost:8080/api"
export const getPaymentAdmin = Base_URL+"/paymentAdmin"

export const User_ENDPOINTS = {
  BASE: Base_URL+"/user",
  REGISTER: Base_URL+"/user/register",
  LOGIN: Base_URL+"/user/login",
  UPDATE_PROFILE: Base_URL+"/user/update",
  UPDATE_AVATAR: Base_URL+"/user/update/avatar",
  GET_AVATAR: Base_URL+"/user/avatar",
  GET_USER_SESSION: Base_URL+"/user/session",
  CHANGE_PASSWORD: Base_URL+"/user/change-password",
}

export const Notification_ENDPOINTS = {

}

export const Ordering_ENDPOINTS = {
  Get_User_Address: Base_URL+"/order/get-address",
  Generate_QR: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example",
  Upload_Slip: Base_URL+"/order/upload-slip",
  Place_Order: Base_URL+"/order/place-order",
}

export const OrderList_ENDPOINTS = {
  Orders: Base_URL+"/order/get-all",
}
