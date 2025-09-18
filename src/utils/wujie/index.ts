export const isWujie = () => {
  return window.__POWERED_BY_WUJIE__;
};
type WujieWindowOpenParams = {
  routeUrl: string; // todo: router.resolve出来的url eg：'#/chat?code=c73331bc64c8423894a5512eb21edd6c&type=1'
  appId: string;
  target?: '_blank' | '_self';
};
/**
 * 打开无界主应用新窗口
 * @param params
 */
export const openWujieWindow = (params: WujieWindowOpenParams) => {
  if (isWujie()) {
    window.$wujie?.bus.$emit('OPEN_NEW_WINDOW', params);
  } else {
    throw new Error('当前环境非无界环境');
  }
};

export const wujieCopyToClipboard = (text: string) => {
  window.focus();
  navigator.clipboard.writeText(text);
}

export function isNodeProd() {
  return process.env.NODE_ENV === 'production';
}