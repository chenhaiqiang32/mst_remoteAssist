import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const RECORD: AppRouteRecordRaw = {
  path: '/Record',
  name: 'Record',
  redirect: '/Record-list',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.record',
    requiresAuth: true,
    icon: 'th-im-icon-menu-record',
    order: 1,
    hideInMenu: false,
    oneRouter: true,
  },
  children: [
    {
      path: '/Record-list',
      name: 'RecordList',
      component: () => import('@/views/record/index.vue'),
      meta: {
        locale: 'menu.record',
        requiresAuth: true,
        roles: ['admin', 'user'],
        hideInMenu: true,
        activeMenu: 'Record',
      },
    },
  ],
};

export default RECORD;
