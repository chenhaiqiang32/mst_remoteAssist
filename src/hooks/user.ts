import { useRouter } from 'vue-router';

import { useUserStore } from '@/store';
import { clearToken } from '@/utils/auth';

export default function useUser() {
  const router = useRouter();
  const userStore = useUserStore();
  const logout = async (logoutTo?: string) => {
    await userStore.logout();
    const currentRoute = router.currentRoute.value;
    // Message.success('登出成功');
    clearToken();
    router.push({
      name: logoutTo && typeof logoutTo === 'string' ? logoutTo : 'login',
      query: {
        ...router.currentRoute.value.query,
        redirect: currentRoute.name as string,
      },
    });
    window.location.reload();
  };
  return {
    logout,
  };
}
