import axios from 'axios';

// 会议详情接口返回数据类型
export interface MeetingDetailRes {
  meetingName: string;
  meetingNo: string;
  startTime: number;
  endTime?: number;
  planStatus: number;
  status: number;
  duration: string;
  qrCode: string;
  master?: number;
}

// 加入会议接口参数类型
export interface JoinMeetingData {
  meetingToken: string;
}

// 加入会议接口返回数据类型
export interface JoinMeetingRes {
  code: number;
  msg: string;
  data?: any;
}

/**
 * 根据token获取会议详情
 * @param token 会议邀请token
 * @returns Promise<MeetingDetailRes>
 */
export function getMeetingDetailByToken(token: string) {
  return axios.get<{ code: number; msg: string; data: MeetingDetailRes }>(
    `api/meeting/plan/share/detailByToken/${token}`
  );
}

/**
 * 加入会议
 * @param data 加入会议参数
 * @returns Promise<JoinMeetingRes>
 */
export function joinMeeting(data: JoinMeetingData) {
  return axios.post<JoinMeetingRes>('api/meeting/plan/share/joinMeeting', data);
}
