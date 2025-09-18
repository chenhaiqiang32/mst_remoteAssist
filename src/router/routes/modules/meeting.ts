import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const MEETING: AppRouteRecordRaw = {
  path: '/Meeting',
  name: 'Meeting',
  redirect: '/Meeting-list',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.meeting',
    requiresAuth: true,
    icon: 'th-im-icon-menu-meeting',
    order: 1,
    hideInMenu: false,
    oneRouter: true,
  },
  children: [
    {
      path: '/Meeting-list',
      name: 'MeetingList',
      component: () => import('@/views/meeting/index.vue'),
      meta: {
        locale: 'menu.meeting',
        requiresAuth: true,
        roles: ['admin', 'user'],
        hideInMenu: true,
        activeMenu: 'Meeting',
      },
    },
  ],
};

export default MEETING;
