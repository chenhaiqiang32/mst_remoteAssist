import axios from 'axios';
import EventListener from '@/utils/event-listener';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Message } from '@arco-design/web-vue';
import { getToken, getTokenType } from '@/utils/auth';
import i18n from '@/locale';
import { isWujie } from '@/utils/wujie';

export interface HttpResponse<T = unknown> {
  status: number;
  msg: string;
  code: number;
  data: T;
}

// if (import.meta.env.VITE_API_BASE_URL) {
//   axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
// }

axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // let each request carry token
    // this example using the JWT token
    // Authorization is a custom headers key
    // please modify it according to the actual situation
    if (!config.headers) {
      config.headers = {};
    }
    config.headers = {
      ...config.headers,
      'User-Client': '3',
      'Accept-Language': i18n.global.locale.value,
    };
    const token = getToken();
    const tokenType = getTokenType();
    if (token) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }
    return config;
  },
  (error) => {
    // do something
    return Promise.reject(error);
  }
);
// add response interceptors
axios.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {
    const res = response.data;
    if ([401].includes(res.code)) {
      EventListener.emit('sys-user-reset-login');
      return res;
    }
    if ([30405].includes(res.code)) {
      EventListener.emit('sys-application-disabled');
      return res;
    }
    if ([20408].includes(res.code)) {
      // todo 通知父应用账户被登陆了
      if (isWujie()) {
        window?.$wujie?.bus?.$emit('repeatLogin', {
          name: 'login',
        });
      }
      return res;
    }
    if ([403].includes(res.code)) {
      EventListener.emit('sys-no-permission-access');
      return res;
    }
    return res;
  },
  (error) => {
    Message.error({
      content: error.msg || i18n.global.t('network.error'),
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  }
);
