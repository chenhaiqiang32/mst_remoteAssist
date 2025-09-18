import { defineStore } from 'pinia';
import {
  createScheduleMeeting as createScheduleMeetingApi,
  createRealtimeMeeting as createRealtimeMeetingApi,
  createLongtimeMeeting as createLongtimeMeetingApi,
  getMeetingGroupList as getMeetingGroupListApi,
  delMeetingPlan as delMeetingPlanApi,
  overMeetingPlan as overMeetingPlanApi,
  getMeetingRecordList as getMeetingRecordListApi,
  getMeetingRecordDetail as getMeetingRecordDetailApi,
  getMeetingShareInfo as getMeetingShareInfoApi,
  updateMeetingPlan as updateMeetingPlanApi,
  getMeetingDetail as getMeetingDetailApi,
  getLanguageList as getLanguageListApi,
  getIndustryList as getIndustryListApi,
} from '@/api/meeting';
import { MeetingState, roomOptionsOV, roomJoinOptionsOV } from './types';

const useMeetingStore = defineStore('meeting', {
  state: (): MeetingState => ({
    assistVisible: false,
    answerVisible: false,
    ThImEvent: null,
    answerInfo: null,
    schedulePsn: [],
    roomOptions: null,
    roomInvitePsn: null,
    answerTimeoutTime: 30,
    upcomingMeetingVisible: false,
    upcomingMeetingList: [],
    upcomingMeetingInfo: null,
    forceEntryMeetingInfo: null,
    languageList: [], // 会议翻译语言
    industryList: [], // 会议行业词库
  }),

  getters: {},

  actions: {
    updateLanguageList(languageList: any[]) {
      this.$patch({ languageList });
    },
    updateIndustryList(industryList: any[]) {
      this.$patch({ industryList });
    },
    updateAssistVisible(assistVisible: boolean) {
      this.$patch({ assistVisible });
    },
    updateAnswerVisible(answerVisible: boolean) {
      this.$patch({ answerVisible });
    },
    updateAnswerInfo(answerInfo: any) {
      this.$patch({ answerInfo });
    },
    updateRoomOptions(roomOptions: roomOptionsOV | roomJoinOptionsOV | null) {
      this.$patch({ roomOptions });
    },
    clearRoomOptions() {
      this.$patch({ roomOptions: null });
    },
    updateRoomInvitePsn(roomInvitePsn: any) {
      this.$patch({ roomInvitePsn });
    },
    updateSchedulePsn(schedulePsn: any) {
      this.$patch({ schedulePsn });
    },
    updateThImEvent(ThImEvent: any) {
      this.$patch({ ThImEvent });
    },
    updateForceEntryMeetingInfo(forceEntryMeetingInfo: any) {
      this.$patch({ forceEntryMeetingInfo });
    },
    updateUpcomingMeetingVisible(upcomingMeetingVisible: boolean) {
      this.$patch({ upcomingMeetingVisible });
    },
    addUpcomingMeetingList(upcomingMeeting: any) {
      const newUpcoming = JSON.parse(JSON.stringify(this.upcomingMeetingList));
      // 查找会议是否已经存在，如果不存在则添加会议
      if (
        !newUpcoming.some((u: any) => u.meetingNo === upcomingMeeting.meetingNo)
      ) {
        newUpcoming.push(upcomingMeeting);
      }
      this.$patch({ upcomingMeetingList: newUpcoming });
    },
    removeUpcomingMeetingList(upcomingMeeting: any) {
      const newUpcoming = JSON.parse(JSON.stringify(this.upcomingMeetingList));
      const index = newUpcoming.findIndex(
        (u: any) => u.meetingNo === upcomingMeeting.meetingNo
      );

      if (index > -1) {
        newUpcoming.splice(index, 1);
      }
      console.log(newUpcoming);
      this.$patch({ upcomingMeetingList: newUpcoming });
    },
    updateUpcomingMeetingInfo(upcomingMeeting: any) {
      this.$patch({ upcomingMeetingInfo: upcomingMeeting });
    },
    // API
    createScheduleMeeting(params: any) {
      return new Promise<void>((resolve, reject) => {
        createScheduleMeetingApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    createRealtimeMeeting(params: any) {
      return new Promise<void>((resolve, reject) => {
        createRealtimeMeetingApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    createLongtimeMeeting(params: any) {
      return new Promise<void>((resolve, reject) => {
        createLongtimeMeetingApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    getMeetingGroupList() {
      return new Promise<void>((resolve, reject) => {
        getMeetingGroupListApi()
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    delMeetingPlan(params: any) {
      return new Promise<void>((resolve, reject) => {
        delMeetingPlanApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    overMeetingPlan(params: any) {
      return new Promise<void>((resolve, reject) => {
        overMeetingPlanApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    getMeetingRecordList(params: any) {
      return new Promise<void>((resolve, reject) => {
        getMeetingRecordListApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    getMeetingRecordDetail(params: any) {
      return new Promise<void>((resolve, reject) => {
        getMeetingRecordDetailApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    getMeetingShareInfo(params: any) {
      return new Promise<void>((resolve, reject) => {
        getMeetingShareInfoApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    updateMeetingPlan(params: any) {
      return new Promise<void>((resolve, reject) => {
        updateMeetingPlanApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    getMeetingDetail(params: any) {
      return new Promise<void>((resolve, reject) => {
        getMeetingDetailApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    getLanguageList() {
      return new Promise<void>((resolve, reject) => {
        getLanguageListApi()
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
    getIndustryList() {
      return new Promise<void>((resolve, reject) => {
        getIndustryListApi()
          .then((res: any) => {
            resolve(res);
          })
          .catch((err: any) => {
            reject(err);
          });
      });
    },
  },
});

export default useMeetingStore;
