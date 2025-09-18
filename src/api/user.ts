import axios from 'axios';
import { UserState } from '@/store/modules/user/types';

export interface LoginData {
  username: string;
  password: string;
}

export interface LoginRes {
  token: string;
  tokenType: string;
}
export function login(data: LoginData) {
  return axios.post<LoginRes>('/api/meeting/user/login', data);
}

export function getUserInfo() {
  return axios.get<UserState>('/api/chat/user/info');
}

export function logout() {
  return axios.put<any>('/api/meeting/user/loginOut');
}

export function resetLogin(data: any) {
  return axios.post<any>(`/api/meeting/user/refreshToken`, data);
}

export function refreshToken() {
  return axios.post<UserState>('/api/meeting/user/refreshToken');
}

export function getMasterInfo(params: any) {
  return axios.get<UserState>('/api/manage/user/company/master/info', {
    params,
  });
}
export function revampPassword(data: any) {
  return axios.put<any>('/api/manage/user/modifyPassword', data);
}

export function getArLoginQrCode(data: any) {
  return axios.post<any>('/api/manage/user/qrCode/glass', data);
}

export function getTokenByCode(data: any) {
  return axios.post<any>(`/api/meeting/user/oauth/token`, data);
}

export function batchExport(data: any) {
  return axios.post<any>(
    `/api/manage/user/batch/export/login/qrcode`,
    {
      ids: data.ids,
    },
    {
      responseType: 'arraybuffer',
    }
  );
}

export function getPlatformDetail(params: { domain: string }) {
  return axios.get<any>(`/api/manage/brand/info/${params.domain}`);
}

export function getApplicationCode(params: any) {
  return axios.get<any>(`/api/meeting/authen/v1/authorize`, {
    params,
  });
}
