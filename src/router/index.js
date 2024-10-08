import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/Ordering" },
    {
      path: "/",
      component: () => import("../layouts/default.vue"),
      children: [
        {
          path: "dashboard",
          component: () => import("../pages/dashboard.vue"),
        },
        {
          path: "OrderList",
          component: () => import("../pages/OrderList.vue"),
        },
        {
          path: "Ordering",
          component: () => import("../pages/Ordering.vue"),
        },
        {
          path: "history",
          component: () => import("../pages/history.vue"),
        },
        {
          path: "account-settings",
          component: () => import("../pages/account-settings.vue"),
        },
        {
          path: "about-me",
          component: () => import("../pages/AboutMe.vue"),
        },
        {
          path: "deliver",
          component: () => import("../pages/Deliver.vue"),
        },
        {
          path: "product-manage",
          component: () => import("../pages/productManage.vue"),
        },
        {
          path: "payment-manage",
          component: () => import("../pages/paymentManage.vue"),
        },
        {
          path: "user-manage",
          component: () => import("../pages/UserManage.vue"),
        },
        {
          path: "user-manage-driver",
          component: () => import("../pages/UserManage.vue"),
        },
        {
          path: "FactoryMaintenace",
          component: () => import("../pages/FactoryMaintenace.vue"),
        },
        {
          path: "notification-manage",
          component: () => import("../pages/NotificationManage.vue"),
        },
      ],
    },
    {
      path: "/",
      component: () => import("../layouts/blank.vue"),
      children: [
        {
          path: "login",
          component: () => import("../pages/login.vue"),
        },
        {
          path: "register",
          component: () => import("../pages/register.vue"),
        },
        {
          path: "/:pathMatch(.*)*",
          component: () => import("../pages/[...all].vue"),
        },
      ],
    },
  ],
});

export default router;
