import axios from 'axios';

// 快捷入口列表
export function getQuickList() {
  return axios.get<any>('/api/meeting/quick/list');
}

export function getList() {
  return axios.get<any>('/api/meeting/quick/list');
}
