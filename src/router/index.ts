import { createRouter, createWebHashHistory } from 'vue-router';
import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css';

import { appRoutes } from './routes';
import { REDIRECT_MAIN, NOT_FOUND_ROUTE } from './routes/base';
import createRouteGuard from './guard';

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: 'Message',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/AutoLogin',
      name: 'AutoLogin',
      component: () => import('@/views/autoLogin/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/ForgetPassword',
      name: 'ForgetPassword',
      component: () => import('@/views/forgetPassword/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/Protocol',
      name: 'Protocol',
      component: () => import('@/views/protocol/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/invitation',
      name: 'Invitation',
      component: () => import('@/views/invitation/index.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/NoPermission',
      name: 'NoPermission',
      component: () => import('@/views/redirect/noPermission.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    ...appRoutes,
    REDIRECT_MAIN,
    NOT_FOUND_ROUTE,
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

createRouteGuard(router);

export default router;
