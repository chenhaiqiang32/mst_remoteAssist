import copy from 'copy-to-clipboard';
import { computed, onMounted, onBeforeUnmount } from 'vue';
import useLocale from '@/hooks/locale';
import { isWujie } from '@/utils/wujie/index';
import { name as appName } from '../../../package.json';

export type WujieWindowOpenParams = {
  routeUrl: string; // todo: router.resolve出来的url eg：'#/chat?code=c73331bc64c8423894a5512eb21edd6c&type=1'
  appId: string;
  target?: '_blank' | '_self';
};

type AppConfig = {
  appId: string;
  origin: string;
  host: string;
  pathname: string;
  commonPath: string;
};
export const useWujieTools = () => {
  const isWujieFn = (): boolean => {
    return Boolean(window.__POWERED_BY_WUJIE__);
  };
  // 判断是否运行在无界环境中
  // 打开主应用的新窗口
  const openWujieWindow = (params: WujieWindowOpenParams) => {
    if (isWujieFn()) {
      window.$wujie?.bus.$emit('OPEN_NEW_WINDOW', params);
    } else {
      throw new Error('当前环境非无界环境');
    }
  };

  // 复制内容到剪贴板
  const wujieCopyToClipboard = async (text: string) => {
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      window.focus(); // todo 走原生 wujie环境下需要先focus window
      return navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log('复制成功（Clipboard API）');
        })
        .catch((err) => {
          console.error('Clipboard API 复制失败:', err);
          copy(text);
        });
    }
    // 回退方法
    copy(text);
  };

  const getAppConfig: () => AppConfig = () => {
    if (!isWujie()) {
      return {
        appId: appName,
        origin: window.location.origin,
        host: window.location.host,
        pathname: window.location.pathname,
        commonPath: `${window.location.origin}${window.location.pathname}?${appName}=`,
      };
    }
    const parentLocation: Location =
      window?.$wujie?.props?.parentWindow?.location;
    const currentHref = parentLocation?.href;
    const appId = appName;
    const url = new URL(currentHref);
    const appConfig = {
      appId, // 应用id
      origin: url.origin,
      host: url.host,
      pathname: url.pathname,
      // todo 微前端公共加载路径 eg： http://localhost:3000/mst/knowledge?knowledge=%2F%23%2Frag-list
      // todo 微前端公共加载路径 eg： http://localhost:3000/mst/knowledge?knowledge=/#/rag-list
      commonPath: `${url.origin}${url.pathname}?${appId}=`,
    };
    return appConfig;
  };
  const publicPath = () => window?.__WUJIE_PUBLIC_PATH__ ?? '';
  return {
    isWujieFn,
    publicPathFn: publicPath,
    publicPath: computed(publicPath),
    isWujie: computed(isWujieFn),
    WindowOpen: openWujieWindow,
    Copy: wujieCopyToClipboard,
    appConfig: getAppConfig(),
  };
};

export const useWujieOnChangeLocal = () => {
  // todo 监听微应用切换语言事件
  const { changeLocale } = useLocale();
  const handleOnChangeLocal = (mainAppLocale: string) => {
    changeLocale(mainAppLocale);
  };
  onMounted(async () => {
    if (isWujie()) {
      window?.$wujie?.bus?.$on('CHANGE_LOCAL', handleOnChangeLocal);
    }
  });
  onBeforeUnmount(() => {
    if (isWujie()) {
      window?.$wujie?.bus?.$off('CHANGE_LOCAL', handleOnChangeLocal);
    }
  });
  return {};
};
