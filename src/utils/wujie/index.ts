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
};

export function getSocketHost() {
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('192.168.1.88');

  return isLocal ? '63.178.128.115:9012' : window.location.host;
}
