import { defineStore } from 'pinia';
import { getQuickList as getQuickListApi } from '@/api/company';

import { CompanyStore } from './types';

const useCompanyStore = defineStore('company', {
  state: (): CompanyStore => ({
    quickEnters: <any>[],
  }),

  getters: {},

  actions: {
    updateQuickEnters(quickEnters: any) {
      this.$patch({ quickEnters });
    },
    getQuickList() {
      return new Promise<void>((resolve, reject) => {
        getQuickListApi()
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

export default useCompanyStore;
