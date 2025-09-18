export interface roomOptionsOV {
  meetingName: string;
  meetingNo?: string;
  audio: boolean;
  video: boolean;
  loudspeaker: boolean;
  cloudRecord: boolean;
  escaping: boolean;
  abstract: boolean;
  organizer: string | null | undefined;
}
export interface roomJoinOptionsOV {
  audio: boolean;
  video: boolean;
  loudspeaker: boolean;
}

export interface MeetingState {
  assistVisible?: boolean;
  answerVisible?: boolean;
  answerInfo?: any;
  ThImEvent?: any;
  schedulePsn?: any;
  roomOptions?: roomOptionsOV | null;
  roomInvitePsn?: any;
  answerTimeoutTime: number;
  upcomingMeetingVisible: boolean;
  upcomingMeetingList: any[];
  upcomingMeetingInfo: any | null;
  forceEntryMeetingInfo: any;
  languageList?: any[];
  industryList?: any[];
}
export interface scheduleFormOV {
  planId?: number;
  subject: string;
  userIds?: [];
  startTime: string;
  endTime: string;
  aiStatus: string; // 0: 不开启; 1:开启
  recordStatus: string; // 0: 不开启;  1:开启
  escaping: string; // 0: 不开启，1: 开启
  planType?: number;
  voiceTranslation?: boolean; // 开启语音
  languageType?: string; // 我的语言
  industryType?: string; // 行业词库
}

export interface longtimeFormOV {
  subject: string;
  userIds: [];
  aiStatus: string; // 0: 不开启; 1:开启
  recordStatus: string; // 0: 不开启;  1:开启
  escaping: string; // 0: 不开启，1: 开启
  voiceTranslation?: boolean; // 开启语音
  languageType?: string; // 我的语言
  industryType?: string; // 行业词库
}

export interface longtimeRes {
  meetingNo: string;
}

export interface realtimeRes {
  meetingNo: string;
}

export interface scheduleRes {
  meetingNo: string;
}
