import { defineStore } from 'pinia';
import { getPlatformDetail } from '@/api/user';

import { CommonStore } from './types';

const useCommonStore = defineStore('common', {
  state: (): CommonStore => ({
    networkStatus: false,
    socketStatus: 1, // 1 未连接， 2连接中， 3连接成功
    lastLoginTime: 0,
    textInputMaxLength: 1000,
    companyInfo: {
      logo1: '',
      logo2: '',
    },
    platformConfig: {},
    btnLoading: false,
    notificationId: null,
  }),

  getters: {},

  actions: {
    updateNetworkStatus(networkStatus: boolean) {
      this.$patch({ networkStatus });
    },
    updateSocketStatus(socketStatus: number) {
      this.$patch({ socketStatus });
    },
    updateLastLoginTime(lastLoginTime: number) {
      this.$patch({ lastLoginTime });
    },
    updateCompanyInfo(companyInfo: any) {
      this.$patch({ companyInfo });
    },
    updatePlatformConfig(platformConfig: any) {
      this.$patch({ platformConfig });
    },
    updateBtnLoading(btnLoading: boolean) {
      this.$patch({ btnLoading });
    },
    updateNotificationId(notificationId: any) {
      this.$patch({ notificationId });
    },
    getPlatformDetail(params: any) {
      return new Promise<void>((resolve, reject) => {
        getPlatformDetail(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
  },
});

export default useCommonStore;
