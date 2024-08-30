import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/Ordering' },
    {
      path: '/',
      component: () => import('../layouts/default.vue'),
      children: [
        {
          path: 'dashboard',
          component: () => import('../pages/dashboard.vue'),
        },

        /*{
          path: 'DefectDetection',
          component: () => import('../pages/DefectDetection.vue'),
        },*/
        {
          path: 'OrderList',
          component: () => import('../pages/OrderList.vue'),
        },
        {
          path: 'Ordering',
          component: () => import('../pages/Ordering.vue'),
        },
        {
          path: 'history',
          component: () => import('../pages/history.vue'),
        },
        {
          path: 'account-settings',
          component: () => import('../pages/account-settings.vue'),
        },
        {
          path: 'typography',
          component: () => import('../pages/typography.vue'),
        },
        {
          path: 'icons',
          component: () => import('../pages/icons.vue'),
        },
        {
          path: 'cards',
          component: () => import('../pages/cards.vue'),
        },
        {
          path: 'tables',
          component: () => import('../pages/tables.vue'),
        },
        {
          path: 'form-layouts',
          component: () => import('../pages/form-layouts.vue'),
        },
        {
          path: 'about-me',
          component: () => import('../pages/AboutMe.vue'),
        },
        {
          path: 'product-manage',
          component: () => import('../pages/productManage.vue'),
        },
        {
          path: 'payment-manage',
          component: () => import('../pages/paymentManage.vue'),
        },
      ],
    },
    {
      path: '/',
      component: () => import('../layouts/blank.vue'),
      children: [
        {
          path: 'login',
          component: () => import('../pages/login.vue'),
        },
        {
          path: 'DefectDetection',
          component: () => import('../pages/DefectDetection.vue'),
        },
        {
          path: 'register',
          component: () => import('../pages/register.vue'),
        },
        {
          path: '/:pathMatch(.*)*',
          component: () => import('../pages/[...all].vue'),
        },
        
      ],
    },
    
  ],
})

export default router
