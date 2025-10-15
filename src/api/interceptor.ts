import axios from 'axios';
import EventListener from '@/utils/event-listener';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Message } from '@arco-design/web-vue';
import { getToken, getTokenType } from '@/utils/auth';
import i18n from '@/locale';
import { isWujie } from '@/utils/wujie';
import { getBatchPreviewUrls } from './user';

export interface HttpResponse<T = unknown> {
  status: number;
  msg: string;
  code: number;
  data: T;
}

// 存储桶配置
const BUCKET_KEYS = ['meeting/company_', 'avatar/'];
const EXCLUDE_URLS = ['/api/meeting/file/upload-url'];

// 检查字符串是否为存储桶key
const isBucketKey = (str: string): boolean => {
  if (typeof str !== 'string') return false;

  // 检查是否包含存储桶key模式
  const hasBucketKey = BUCKET_KEYS.some((bucketKey) => str.includes(bucketKey));
  if (hasBucketKey) {
    return true;
  }

  // 检查是否匹配存储桶URL模式 (sop/company_数字/...)
  const bucketPattern = /^sop\/company_\d+\//;
  if (bucketPattern.test(str)) {
    return true;
  }

  return false;
};

// 递归遍历数据结构，收集存储桶keys
const collectBucketKeys = (
  data: any,
  bucketKeys: Set<string> = new Set()
): Set<string> => {
  if (typeof data === 'string') {
    if (isBucketKey(data)) {
      bucketKeys.add(data);
    }
  } else if (Array.isArray(data)) {
    data.forEach((item) => collectBucketKeys(item, bucketKeys));
  } else if (data && typeof data === 'object') {
    Object.values(data).forEach((value) =>
      collectBucketKeys(value, bucketKeys)
    );
  }
  return bucketKeys;
};

// 递归替换数据结构中的存储桶keys
const replaceBucketKeys = (data: any, urlMap: Record<string, string>): any => {
  if (typeof data === 'string') {
    if (isBucketKey(data)) {
      const previewUrl = urlMap[data];
      if (previewUrl) {
        return previewUrl;
      }
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => replaceBucketKeys(item, urlMap));
  }
  if (data && typeof data === 'object') {
    const result: any = {};
    Object.entries(data).forEach(([key, value]) => {
      result[key] = replaceBucketKeys(value, urlMap);
    });
    return result;
  }
  return data;
};

// 处理存储桶key替换
const handleBucketKeyReplacement = async (
  data: any,
  requestUrl: string
): Promise<any> => {
  try {
    // 检查是否需要处理存储桶key替换
    const shouldExclude = EXCLUDE_URLS.some((url) => requestUrl.includes(url));

    if (shouldExclude) {
      return data;
    }

    // 收集所有存储桶keys
    const bucketKeys = collectBucketKeys(data);

    if (bucketKeys.size === 0) {
      return data;
    }

    // 调用批量获取预览URL接口
    const response = await getBatchPreviewUrls({
      objectKeys: Array.from(bucketKeys),
    });

    if (response && response.data) {
      // 构建URL映射对象
      const urlMap: Record<string, string> = {};
      Object.entries(response.data).forEach(([key, value]) => {
        if (value && (value as any).previewUrl) {
          urlMap[key] = (value as any).previewUrl;
        }
      });

      // 替换数据中的存储桶keys
      return replaceBucketKeys(data, urlMap);
    }

    return data;
  } catch (error) {
    console.error('处理存储桶key替换时出错:', error);
    return data;
  }
};

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
  async (response: AxiosResponse<HttpResponse>) => {
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

    // 处理存储桶key替换（仅对GET请求且不在排除列表中的接口，或特定的POST请求）
    const isGetRequest = response.config.method === 'get';
    const isSpecialPostRequest = response.config.method === 'post' && response.config.url === '/api/chat/group';
    if (isGetRequest || isSpecialPostRequest) {
      const requestUrl = response.config.url || '';
      const shouldExclude = EXCLUDE_URLS.some((url) =>
        requestUrl.includes(url)
      );
      if (!shouldExclude) {
        try {
          const processedData = await handleBucketKeyReplacement(
            res,
            requestUrl
          );
          return processedData;
        } catch (error) {
          console.error('处理存储桶key替换时出错:', error);
          return res;
        }
      }
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
