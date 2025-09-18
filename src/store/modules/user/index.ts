import { defineStore } from 'pinia';
import {
  login as userLogin,
  getUserInfo,
  LoginData,
  refreshToken as refreshTokenApi,
  getTokenByCode as getTokenByCodeApi,
  logout as userLogout,
  resetLogin as userResetLoginApi,
  getMasterInfo as getMasterInfoApi,
  revampPassword as revampPasswordApi,
  getArLoginQrCode as getArLoginQrCodeApi,
  batchExport as batchExportApi,
  getApplicationCode as getApplicationCodeApi,
} from '@/api/user';
import { clearToken } from '@/utils/auth';
import { removeRouteListener } from '@/utils/route-listener';
import { UserState } from './types';

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    name: undefined,
    alias: undefined,
    avatarUrl: undefined,
    userId: 0,
  }),

  getters: {
    userInfo(state: UserState): UserState {
      return { ...state };
    },
  },

  actions: {
    // Set user's information
    setInfo(partial: Partial<UserState>) {
      this.$patch(partial);
    },

    // Reset user's information
    resetInfo() {
      this.$reset();
    },

    // Get user's information
    async info() {
      const res: any = await getUserInfo();
      if (res.code === 200) {
        this.setInfo(res.data);
      }
    },

    // Login
    async login(loginForm: LoginData) {
      try {
        return new Promise<void>((resolve, reject) => {
          userLogin(loginForm)
            .then((res: any) => {
              resolve(res);
            })
            .catch((err: any) => {
              reject(err);
            });
        });
      } catch (err) {
        clearToken();
        throw err;
      }
    },
    async logoutCallBack() {
      // await this.userLogout();
      clearToken();
      removeRouteListener();
      this.resetInfo();
    },
    // Logout
    async logout() {
      this.logoutCallBack();
    },
    userLogout() {
      return new Promise<void>((resolve, reject) => {
        userLogout()
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    userResetLogin(data: any) {
      return new Promise<void>((resolve, reject) => {
        userResetLoginApi(data)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    refreshToken() {
      return new Promise<void>((resolve, reject) => {
        refreshTokenApi()
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },

    getTokenByCode(params: any) {
      return new Promise<void>((resolve, reject) => {
        getTokenByCodeApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },

    getMasterInfo(params: any) {
      return new Promise<void>((resolve, reject) => {
        getMasterInfoApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    revampPassword(data: any) {
      return new Promise<void>((resolve, reject) => {
        revampPasswordApi(data)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    getArLoginQrCode(data: any) {
      return new Promise<void>((resolve, reject) => {
        getArLoginQrCodeApi(data)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    batchExport(data: any) {
      return new Promise<void>((resolve, reject) => {
        batchExportApi(data)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    getApplicationCode(data: any) {
      return new Promise<void>((resolve, reject) => {
        getApplicationCodeApi(data)
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

export default useUserStore;
