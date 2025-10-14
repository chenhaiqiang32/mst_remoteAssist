import axios from 'axios';
import {
  longtimeRes,
  realtimeRes,
  scheduleRes,
} from '@/store/modules/meeting/types';

// 创建预约会议
export function createScheduleMeeting(data: any) {
  return axios.post<scheduleRes>('/api/meeting/plan/schedule', data);
}

// 创建即时会议
export function createRealtimeMeeting(data: any) {
  return axios.post<realtimeRes>('/api/meeting/plan/realtime', data);
}

// 创建长期会议
export function createLongtimeMeeting(data: any) {
  return axios.post<longtimeRes>('/api/meeting/plan/longtime', data);
}

// 会议计划相关接口

export function getMeetingGroupList() {
  return axios.get<any>('/api/meeting/plan/group/list');
}

// 删除(取消)会议计划接口
export function delMeetingPlan(data: any) {
  return axios.post<any>(`/api/meeting/plan/cancel/${data.planId}`);
}
// 会议详情接口
export function getMeetingDetail(params: any) {
  return axios.get<any>(`/api/meeting/plan/detail/${params.planId}`);
}

// 会议分享链接
export function getMeetingShareInfo(params: any) {
  return axios.get<any>(`/api/meeting/plan/inviteInfo/${params.meetingNo}`);
}

// 修改会议
export function updateMeetingPlan(data: any) {
  return axios.put<any>(`/api/meeting/plan/update`, data);
}
// 结束会议
export function overMeetingPlan(data: any) {
  return axios.post<any>(`/api/meeting/plan/close/${data.planId}`);
}

// 会议记录列表
export function getMeetingRecordList(params: any) {
  return axios.get<any>(`/api/meeting/meeting/list`, {
    params,
  });
}
// 会议记录详情
export function getMeetingRecordDetail(params: any) {
  return axios.get<any>(`/api/meeting/meeting/detail/${params.meetingId}`);
}

// 支持的语言列表
export function getLanguageList() {
  return axios.get<any>(`/api/meeting/plan/getLanguageList`);
}

// 支持的行业词库
export function getIndustryList() {
  return axios.get<any>(`/api/meeting/plan/getIndustryList`);
}

// 获取流程列表
export function getSopList() {
  return axios.get<any>(`/api/meeting/meeting/listSop`);
}

// 流程下发
export function distributeSop(data: any) {
  return axios.post<any>(`/api/meeting/meeting/distributeSop`, data);
}
