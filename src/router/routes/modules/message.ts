import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const MESSAGE: AppRouteRecordRaw = {
  path: '/Message',
  name: 'Message',
  redirect: '/Message-List',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.message',
    requiresAuth: true,
    icon: 'th-im-icon-menu-message',
    order: 0,
    hideInMenu: false,
    oneRouter: true,
  },
  children: [
    {
      path: '/Message-List',
      name: 'MessageList',
      component: () => import('@/views/message/index.vue'),
      meta: {
        locale: 'menu.message',
        requiresAuth: true,
        roles: ['admin', 'user'],
        hideInMenu: true,
        activeMenu: 'Message',
      },
    },
  ],
};

export default MESSAGE;
