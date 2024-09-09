const backend_url = import.meta.env.VITE_API_URL

export const User_ENDPOINTS = {
  createUser: backend_url+"/api/v1/users/", // POST
  loginUser: backend_url+"/api/v1/users/login", // POST
  getUsers: backend_url+"/api/v1/users/", // GET
  getUserById: backend_url+"/api/v1/users/", // GET :id
  getProfile: backend_url+"/api/v1/users/profile", // GET
  updateUser: backend_url+"/api/v1/users/", // PUT :id
  deleteUser: backend_url+"/api/v1/users/", // DELETE :id
}

export const Product_ENDPOINTS = {
  addProduct: backend_url+"/api/v1/products/", // POST
  getProducts: backend_url+"/api/v1/products/", // GET
  getProductById: backend_url+"/api/v1/products/", // GET :id
  createProduct: backend_url+"/api/v1/products/", // POST
  updateProduct: backend_url+"/api/v1/products/", // PUT :id
  deleteProduct: backend_url+"/api/v1/products/", // DELETE :id
}

export const Order_ENDPOINTS = {
  getOrders: backend_url+"/api/v1/orders/", // GET
  getOrderById: backend_url+"/api/v1/orders/", // GET :id
  getOrderByUser: backend_url+"/api/v1/orders/my_order", // GET
  createOrder: backend_url+"/api/v1/orders/", // POST
  completeOrder: backend_url+"/api/v1/orders/complete", // PUT :id
  cancelOrder: backend_url+"/api/v1/orders/cancel", // PUT :id
  updateOrder: backend_url+"/api/v1/orders/update", // PUT :id
  checkSlip: backend_url+"/api/v1/orders/check_slip", // POST
}

export const Payment_ENDPOINTS = {
  getPayments: backend_url+"/api/v1/payments/", // GET
  updatePayment: backend_url+"/api/v1/payments/", // PUT
}

export const Notification_ENDPOINTS = {
  getNotifications: backend_url+"/api/v1/notifications/", // GET
  updateNotification: backend_url+"/api/v1/notifications/", // PUT
}
