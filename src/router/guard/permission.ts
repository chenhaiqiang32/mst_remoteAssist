import type { Router } from 'vue-router';
import NProgress from 'nprogress'; // progress bar

export default function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    next();
    NProgress.done();
  });
}
