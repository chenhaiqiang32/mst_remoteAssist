const TOKEN_KEY = 'token';
const TOKEN_TYPE_KEY = 'Bearer';
const REFRESH_TOKEN_KEY = 'refreshToken';

const isLogin = () => {
  return !!localStorage.getItem(`${TOKEN_KEY}`);
};

const getToken = () => {
  return localStorage.getItem(`${TOKEN_KEY}`);
};

const getTokenType = () => {
  return localStorage.getItem(`${TOKEN_TYPE_KEY}`);
};

const getRefreshToken = () => {
  return localStorage.getItem(`${REFRESH_TOKEN_KEY}`);
};

const setToken = (token: string) => {
  localStorage.setItem(`${TOKEN_KEY}`, token);
};

const setTokenType = (tokenType: string) => {
  localStorage.setItem(`${TOKEN_TYPE_KEY}`, tokenType);
};

const setRefreshToken = (refreshToken: string) => {
  localStorage.setItem(`${REFRESH_TOKEN_KEY}`, refreshToken);
};
const setTimestamp = () => {
  const newTime: any = new Date().getTime();
  localStorage.setItem('ASSIST_APP', newTime);
  sessionStorage.setItem('ASSIST_APP', newTime);
};
const getLocalTimestamp = () => {
  return localStorage.getItem('ASSIST_APP');
};
const getSessionTimestamp = () => {
  return sessionStorage.getItem('ASSIST_APP');
};
const clearToken = () => {
  localStorage.removeItem(`${TOKEN_KEY}`);
  localStorage.removeItem(`${TOKEN_TYPE_KEY}`);
  localStorage.removeItem(`${REFRESH_TOKEN_KEY}`);
  localStorage.removeItem(`ASSIST_APP`);
  sessionStorage.clear();
};

export {
  isLogin,
  getToken,
  getTokenType,
  getRefreshToken,
  setToken,
  setRefreshToken,
  setTokenType,
  clearToken,
  setTimestamp,
  getLocalTimestamp,
  getSessionTimestamp,
};
