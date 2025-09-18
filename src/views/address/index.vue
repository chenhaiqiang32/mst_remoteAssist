<template>
  <div class="container">
    <div v-if="pageType === 0" class="layout">
      <div class="layout-left-side">
        <memberVue
          v-if="pageType === 0"
          @handle-option-call-open="handleOptionCallOpen"
          @handle-change-page="handleChangePage"
        ></memberVue>
      </div>
      <div class="layout-content">
        <a-space :size="16" direction="vertical" fill>
          <selectVue
            v-if="pageType === 0"
            @handle-schedule-open="handleScheduleOpen"
            @handle-option-call-open="handleOptionCallOpen"
          ></selectVue>
        </a-space>
      </div>
    </div>
    <div v-if="pageType === 1" class="layout-concat">
      <concatQrVue
        v-if="pageType === 1"
        @handle-change-page="handleChangePage"
      ></concatQrVue>
    </div>
    <!-- 预约会议 -->
    <a-modal
      v-if="scheduleModalVisible"
      v-model:visible="scheduleModalVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <scheduleModal
        @handle-close="handleScheduleClose"
        @handle-invite-open="handleScheduleInviteOpen"
      ></scheduleModal>
    </a-modal>
    <!-- 添加成员 -->
    <a-modal
      v-if="scheduleInviteModalVisible"
      v-model:visible="scheduleInviteModalVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <scheduleInviteModal
        :select-psn="meetingStore.schedulePsn"
        @handle-close="handleScheduleInviteClose"
        @handle-invite="handleScheduleInvite"
      ></scheduleInviteModal>
    </a-modal>
    <!-- 呼叫 -->
    <a-modal
      v-if="callRoomOptionsVisible"
      v-model:visible="callRoomOptionsVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <optionsCallModal
        @handle-call="handleCall"
        @handle-close="handleOptionsCallClose"
      ></optionsCallModal>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import {
    useAddressStore,
    useMeetingStore,
    useUserStore,
    useCommonStore,
  } from '@/store';
  import AssistErrorType from '@/utils/sdk/assistErrorType';
  import EventListener from '@/utils/event-listener';
  import { ObjectTrans, objToArrForKey } from '@/utils';
  import { useI18n } from 'vue-i18n';

  import { Message } from '@arco-design/web-vue';

  import scheduleModal from '@/components/meeting/options/schedule.vue';
  import scheduleInviteModal from '@/components/meeting/member/invite.vue';
  import optionsCallModal from '@/components/meeting/options/send.vue';

  import memberVue from './components/member.vue';
  import selectVue from './components/select.vue';
  import concatQrVue from './components/concat.vue';
  import useThMeetingStore from '../../../packages/store';

  const addressStore = useAddressStore();
  const meetingStore = useMeetingStore();
  const ThMeetingStore = useThMeetingStore();
  const userStore = useUserStore();
  const commonStore = useCommonStore();
  const { t } = useI18n();
  const scheduleModalVisible = ref<boolean>(false);
  const pageType = ref(0);

  const handleScheduleOpen = () => {
    // todo 选择人员时候预约会议 改造自己展示到人员列表 但是走原来接口逻辑选中自己不传入
    const deleteMySelectPsn = addressStore.selectPsn.filter(v => v.userId !== userStore.userId)
    meetingStore.updateSchedulePsn(ObjectTrans(deleteMySelectPsn));
    scheduleModalVisible.value = true;
  };
  const handleScheduleClose = () => {
    meetingStore.updateSchedulePsn([]);
    scheduleModalVisible.value = false;
  };
  const scheduleInviteModalVisible = ref<boolean>(false);
  const handleScheduleInviteOpen = () => {
    scheduleInviteModalVisible.value = true;
  };
  const handleScheduleInviteClose = () => {
    scheduleInviteModalVisible.value = false;
  };
  const handleScheduleInvite = (data: any) => {
    handleScheduleInviteClose();
    meetingStore.updateSchedulePsn(data);
  };
  const callRoomOptionsVisible = ref(false);
  const handleOptionsCallClose = () => {
    meetingStore.updateRoomOptions(null);
    meetingStore.updateRoomInvitePsn(null);
    callRoomOptionsVisible.value = false;
  };
  const handleOptionCallOpen = (data: any) => {
    if (meetingStore.answerInfo && meetingStore.answerInfo.meetingNo) {
      Message.error(t('meeting.call.message.tips'));
      return;
    }
    callRoomOptionsVisible.value = true;
    meetingStore.updateRoomInvitePsn(data);
    meetingStore.updateRoomOptions({
      meetingName: `${userStore.name} ${t('meeting.room.option.meetingName')}`,
      video: false,
      audio: true,
      loudspeaker: true,
      cloudRecord: false,
      abstract: false,
      escaping: false,
      organizer: userStore.name,
    });
  };
  const handleJoinAssist = async (data: any) => {
    try {
      console.log(
        'Address-handleJoinAssist',
        meetingStore,
        meetingStore.ThImEvent,
        data
      );
      const res = await meetingStore.ThImEvent.joinMeeting({
        meetingNo: data.meetingNo,
        forceEntryStatus: 0,
        inviters: objToArrForKey(meetingStore.roomInvitePsn, 'userId'),
      });
      ThMeetingStore.updateRoomTranslateInfo({
        ...ThMeetingStore.roomTranslateInfo,
        ...res.data,
        open: !!res.data?.enableTranslation
      })
      commonStore.updateBtnLoading(false);
      if (res.code !== 200 && res.code !== 401) {
        if (
          res.code === AssistErrorType.OTHER_CLIENT_JOINED_MEETING ||
          res.code === AssistErrorType.OTHER_CLIENT_IN_MEETING
        ) {
          meetingStore.updateForceEntryMeetingInfo({
            meetingNo: data.meetingNo,
            invitor: objToArrForKey(meetingStore.roomInvitePsn, 'userId'),
          });
          EventListener.emit('Chat-Other-Client-Joined-Meeting');
        } else {
          Message.error(res.msg);
        }
        return;
      }
      // 将业务系统中的获取房间信息，传入ThSDK中
      meetingStore.ThImEvent.roomMenuOptions = {
        video: meetingStore.roomOptions?.video,
        audio: meetingStore.roomOptions?.audio,
        loudspeaker: meetingStore.roomOptions?.loudspeaker,
      };
      meetingStore.ThImEvent.setRoomOnlineListPsn(addressStore.memberList);
      meetingStore.ThImEvent.setRoomOnlineGroupPsn(
        addressStore.memberGroupList
      );
      console.log('address--join-----', meetingStore.roomInvitePsn);
      meetingStore.ThImEvent.updateInvitingList(
        meetingStore.roomInvitePsn,
        'add'
      );
      handleOptionsCallClose();
      meetingStore.updateAssistVisible(true);
    } catch (error) {
      commonStore.updateBtnLoading(false);
    }
  };
  const handleCall = async () => {
    try {
      const res: any = await meetingStore.createRealtimeMeeting({
        aiStatus: meetingStore.roomOptions?.abstract ? '1' : '0',
        recordStatus: meetingStore.roomOptions?.cloudRecord ? '1' : '0',
        escaping: meetingStore.roomOptions?.escaping ? '1' : '0',
        subject: meetingStore.roomOptions?.meetingName,
        userIds: objToArrForKey(meetingStore.roomInvitePsn, 'userId'),
        enableTranslation: meetingStore.roomOptions?.escaping ? '1' : '0',
        languageType: ThMeetingStore.roomTranslateInfo?.languageType,
        industryType: ThMeetingStore.roomTranslateInfo?.industryType
      });
      if (res.code !== 200 && res.code !== 401) {
        Message.error(res.msg);
        commonStore.updateBtnLoading(false);
        return;
      }
      handleJoinAssist(res.data);
    } catch {
      commonStore.updateBtnLoading(false);
    }
  };
  // 页面显示切换
  const handleChangePage = (type: number) => {
    pageType.value = type;
  };
</script>

<style scoped lang="less">
  .container {
    background-color: var(--color-fill-2);
    height: calc(100% - 12px);
    padding: 16px 20px;
    padding-bottom: 0;
    display: flex;
  }

  .layout {
    width: 100%;
    height: 100%;
    display: flex;
    border-radius: var(--border-radius-medium);
    overflow: hidden;

    &-left-side {
      flex-basis: 350px;
    }

    &-content {
      flex: 1;
      padding-left: 16px;
    }
  }
</style>

<style lang="less" scoped>
  // responsive
  @media (max-width: @screen-lg) {
    .layout {
      flex-wrap: wrap;
      &-left-side {
        flex: 1;
        flex-basis: 100%;
        margin-bottom: 16px;
      }

      &-content {
        flex: none;
        flex-basis: 100%;
        padding-left: 0;
      }
    }
  }
  .layout-concat {
    width: 100%;
  }
</style>
