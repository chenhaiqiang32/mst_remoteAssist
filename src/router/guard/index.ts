import type { Router } from 'vue-router';
import { setRouteEmitter } from '@/utils/route-listener';
import setupUserLoginInfoGuard from './userLoginInfo';
import setupPermissionGuard from './permission';
import { isWujie } from '@/utils/wujie';
function setupPageGuard(router: Router) {
  router.beforeEach(async (to) => {
    // emit route change
    setRouteEmitter(to);
  });
}

export default function createRouteGuard(router: Router) {
  setupPageGuard(router);
  setupUserLoginInfoGuard(router);
  setupPermissionGuard(router);
  // todo通用字路由监听通知父应用
  router.beforeEach(async (to) => {
    if (isWujie()) {
      window.$wujie?.bus.$emit('ROUTE_CHANGE', {
        routeInfo: to,
        appId: window.__WUJIE.id,
        preloadParams: window.$wujie?.props
      })
    }
  });
}
