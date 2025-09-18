import { createPinia } from 'pinia';
import useAppStore from './modules/app';
import useCommonStore from './modules/common';
import useCompanyStore from './modules/company';
import useUserStore from './modules/user';
import useTabBarStore from './modules/tab-bar';
import useMeetingStore from './modules/meeting';
import useAddressStore from './modules/address';
import useRecordStore from './modules/record';
import useChatStore from './modules/chat';
import piniaPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPersistedstate);
export {
  useAppStore,
  useCommonStore,
  useUserStore,
  useTabBarStore,
  useMeetingStore,
  useAddressStore,
  useRecordStore,
  useChatStore,
  useCompanyStore,
};
export default pinia;
