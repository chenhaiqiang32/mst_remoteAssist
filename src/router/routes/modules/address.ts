import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const ADDRESS: AppRouteRecordRaw = {
  path: '/Address',
  name: 'Address',
  redirect: '/Address-List',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.address',
    requiresAuth: true,
    icon: 'th-im-icon-menu-address',
    order: 1,
    hideInMenu: false,
    oneRouter: true,
  },
  children: [
    {
      path: '/Address-List',
      name: 'AddressList',
      component: () => import('@/views/address/index.vue'),
      meta: {
        locale: 'menu.address',
        requiresAuth: true,
        roles: ['admin', 'user'],
        hideInMenu: true,
        activeMenu: 'Address',
      },
    },
  ],
};

export default ADDRESS;
