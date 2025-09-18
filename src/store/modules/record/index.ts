import { defineStore } from 'pinia';
import { RecordStore, MeetingOv } from './types';

const useRecordStore = defineStore('record', {
  state: (): RecordStore => ({
    noRecord: false,
    noRecordDetail: false,
    curMeeting: null,
  }),

  getters: {},

  actions: {
    updateNoRecord(noRecord: boolean) {
      this.$patch({ noRecord });
    },
    updateNoRecordDetail(noRecordDetail: boolean) {
      this.$patch({ noRecordDetail });
    },
    updateCurMeeting(curMeeting: MeetingOv) {
      this.$patch({ curMeeting });
    },
    clearOptions() {
      this.$patch({ noRecord: false, noRecordDetail: false, curMeeting: null });
    },
  },
});

export default useRecordStore;
