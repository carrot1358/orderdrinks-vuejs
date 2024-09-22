const backend_url = import.meta.env.VITE_API_URL

export const User_ENDPOINTS = {
  createUser: backend_url+"/api/v1/users/", // POST
  loginUser: backend_url+"/api/v1/users/login", // POST
  confirmExistedUser: backend_url+"/api/v1/users/confirm-existed-user", // POST
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
  getOderDelivery: backend_url+"/api/v1/orders/get-order-delivery", // GET auth driver
  getOrderNotDone: backend_url+"/api/v1/orders/get-order-not-done", // GET auth driver
  getOrderByUser: backend_url+"/api/v1/orders/my_order", // GET
  createOrder: backend_url+"/api/v1/orders/", // POST
  completeOrder: backend_url+"/api/v1/orders/complete", // PUT :id
  cancelOrder: backend_url+"/api/v1/orders/cancel", // PUT :id
  updateOrder: backend_url+"/api/v1/orders/update", // PUT :id
  checkSlip: backend_url+"/api/v1/orders/check_slip", // POST
  prepareOrder: backend_url+"/api/v1/orders/prepare-delivery", // post :id
}

export const Payment_ENDPOINTS = {
  getPayments: backend_url+"/api/v1/payments/", // GET
  updatePayment: backend_url+"/api/v1/payments/", // PUT
}

export const Notification_ENDPOINTS = {
  getNotifications: backend_url+"/api/v1/notifications/", // GET
  updateNotification: backend_url+"/api/v1/notifications/", // PUT
}

export const FactoryMaintenance_ENDPOINTS = {
  addFilterRefill: backend_url+"/api/v1/filter-reports/refill", // POST auth admin
  getFilterRefills: backend_url+"/api/v1/filter-reports/refill", // GET auth admin
  addFilterChange: backend_url+"/api/v1/filter-reports/change", // POST auth admin
  getFilterChanges: backend_url+"/api/v1/filter-reports/change", // GET auth admin
  addFilterCleaning: backend_url+"/api/v1/filter-reports/cleaning", // POST auth admin
  getFilterCleanings: backend_url+"/api/v1/filter-reports/cleaning", // GET auth admin

  getReportRefillsPDF: backend_url+"/api/v1/reports/generate-pdf-refill", // GET
  getReportChangesPDF: backend_url+"/api/v1/reports/generate-pdf-change", // GET
  getReportCleaningsPDF: backend_url+"/api/v1/reports/generate-pdf-cleaning", // GET
}

export const Report_Statistics_ENDPOINTS = {
  /*
  all params:
    - startDate: string (2024-02-20)
    - endDate: string (2024-02-20)
  */
  getReportStatisticsSales: backend_url+"/api/v1/reports/sales-stats", // GET
  getReportStatisticsUsers: backend_url+"/api/v1/reports/user-stats", // GET
  getReportStatisticsFilter: backend_url+"/api/v1/reports/filter-stats", // GET
  getReportStatisticsOrder: backend_url+"/api/v1/reports/order-stats", // GET
  getReportStatisticsRevenue: backend_url+"/api/v1/reports/revenue-stats", // GET
}
