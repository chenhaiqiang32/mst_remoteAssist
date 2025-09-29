import type { Router, LocationQueryRaw } from 'vue-router';
import NProgress from 'nprogress'; // progress bar

import { useUserStore } from '@/store';
import { isLogin, setTimestamp } from '@/utils/auth';
import { isWujie } from '@/utils/wujie';
export default function setupUserLoginInfoGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start();
    if (to.name === 'AutoLogin') {
      next();
      return;
    }
    const userStore = useUserStore();
    if (isLogin()) {
      try {
        if (
          to.name === 'login' ||
          to.name === 'ForgetPassword' ||
          to.name === 'Protocol'
        ) {
          // await userStore.logout();
          next();
          // next({
          //   path: '/Message-List',
          // });
          return;
        }
        if (to.name !== 'NoPermission' && to.name !== 'Invitation') {
          await userStore.info();
        }
        // 邀请页面不更新时间戳，避免触发多标签页冲突检测
        if (to.name !== 'Invitation') {
          setTimestamp();
        }
        next();
      } catch (error) {
        // todo 通知父应用账户被登陆了
        if (isWujie()) {
          window?.$wujie?.bus?.$emit('REPEAT_LOGIN', {
            name: 'login',
            query: {
              redirect: to.name,
              ...to.query,
            } as LocationQueryRaw,
          })
        } else {
          await userStore.logout();
          next({
            name: 'login',
            query: {
              redirect: to.name,
              ...to.query,
            } as LocationQueryRaw,
          });
        }
      }
    } else {
      if (
        to.name === 'login' ||
        to.name === 'ForgetPassword' ||
        to.name === 'Protocol' ||
        to.name === 'Invitation'
      ) {
        next();
        return;
      }
      next({
        name: 'login',
        query: {
          redirect: to.name,
          ...to.query,
        } as LocationQueryRaw,
      });
    }
  });
}
