export interface MeetingOv {
  meetingId: string;
  meetingNo: string;
  subject: string;
}

export interface RecordStore {
  curMeeting?: MeetingOv | null;
  noRecord: boolean;
  noRecordDetail: boolean;
}
