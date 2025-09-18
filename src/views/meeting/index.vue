<template>
  <div class="container">
    <div class="layout">
      <div class="layout-left-side">
        <menuVue
          @handle-quick-meeting-open="handleOptionCallOpen"
          @handle-schedule-open="handleScheduleOpen"
          @handle-longtime-open="handleLongtimeModalOpen"
          @handle-join-meeting-open="handleJoinModalOpen"
        ></menuVue>
      </div>
      <div class="layout-content">
        <!-- <a-space :size="16" direction="vertical" fill>

        </a-space> -->
        <meetingVue
          ref="meetingListRef"
          @open-link-share="handleLinkShareModalOpen"
          @open-qr-code="handleQrCodeModalOpen"
          @handle-join-meeting-open="handleJoinMeetingModalOpen"
          @handle-schedule-open="handleScheduleOpen"
        ></meetingVue>
      </div>
    </div>
    <!-- 快速会议 -->
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
    <!-- 预约会议 -->
    <a-modal
      v-if="scheduleModalVisible"
      v-model:visible="scheduleModalVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <scheduleModal
        :meeting-detail="scheduleMeetingDetail"
        @handle-close="handleScheduleClose"
        @handle-invite-open="handleScheduleInviteOpen"
      ></scheduleModal>
    </a-modal>
    <!-- 加入会议-输入会议号 -->
    <a-modal
      v-if="joinOptionsModalVisible"
      v-model:visible="joinOptionsModalVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <joinOptionsModal
        v-if="joinOptionsModalVisible"
        @handle-close="handleJoinModalClose"
        @handle-join-meeting="handleJoinMeeting"
      ></joinOptionsModal>
    </a-modal>
    <!-- 加入会议 -->
    <a-modal
      v-if="joinMeetingModalVisible"
      v-model:visible="joinMeetingModalVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <joinMeetingModal
        v-if="joinMeetingModalVisible"
        @handle-close="handleJoinMeetingModalClose"
        @handle-join-meeting="handleJoinMeeting"
      ></joinMeetingModal>
    </a-modal>
    <!-- 长期会议 -->
    <a-modal
      v-if="longtimeModalVisible"
      v-model:visible="longtimeModalVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <longtimeModal
        @handle-close="handleLongtimeModalClose"
        @handle-invite-open="handleScheduleInviteOpen"
      ></longtimeModal>
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
    <!-- 分享会议 -->
    <a-modal
      v-if="linkShareModalVisible"
      v-model:visible="linkShareModalVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <linkShareModal
        v-if="linkShareModalVisible"
        :meeting-detail="meetingDetail"
        @handle-close="handleLinkShareModalClose"
      ></linkShareModal>
    </a-modal>
    <!-- 会议二维码 -->
    <a-modal
      v-if="qrCodeModalVisible"
      v-model:visible="qrCodeModalVisible"
      :footer="false"
      :closable="false"
      class="customModal qrCodeModal"
    >
      <qrCodeModal
        v-if="qrCodeModalVisible"
        :meeting-detail="meetingDetail"
        @handle-close="handleQrCodeModalClose"
      ></qrCodeModal>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import AssistErrorType from '@/utils/sdk/assistErrorType';
  import EventListener from '@/utils/event-listener';
  import {
    useMeetingStore,
    useAddressStore,
    useUserStore,
    useCommonStore,
  } from '@/store';

  import { Message } from '@arco-design/web-vue';
  import { objToArrForKey, sleep } from '@/utils';

  import { useI18n } from 'vue-i18n';

  import optionsCallModal from '@/components/meeting/options/send.vue';

  import joinOptionsModal from '@/components/meeting/options/join.vue';
  import joinMeetingModal from '@/components/meeting/options/join_options.vue';
  import scheduleModal from '@/components/meeting/options/schedule.vue';
  import scheduleInviteModal from '@/components/meeting/member/invite.vue';
  import longtimeModal from '@/components/meeting/options/longtime.vue';
  import linkShareModal from '@/components/meeting/options/share.vue';
  import qrCodeModal from '@/components/meeting/options/qr_code.vue';

  import menuVue from './components/menu.vue';
  import meetingVue from './components/list.vue';
  import useThMeetingStore from '../../../packages/store';

  const { t } = useI18n();
  const meetingStore = useMeetingStore();
  const ThMeetingStore = useThMeetingStore();

  const addressStore = useAddressStore();
  const userStore = useUserStore();
  const commonStore = useCommonStore();

  const joinOptionsModalVisible = ref<boolean>(false);
  const joinMeetingModalVisible = ref<boolean>(false);

  const scheduleModalVisible = ref<boolean>(false);
  const meetingListRef = ref();

  // 协助会议 房间设置
  const callRoomOptionsVisible = ref(false);
  // 会议邀请人员
  const handleOptionsCallClose = () => {
    meetingStore.updateRoomOptions(null);
    meetingStore.updateRoomInvitePsn(null);
    callRoomOptionsVisible.value = false;
  };
  const handleOptionCallOpen = () => {
    callRoomOptionsVisible.value = true;
    console.log('handleOptionCallOpen', callRoomOptionsVisible.value);
    meetingStore.updateRoomInvitePsn(null);
    meetingStore.updateRoomOptions({
      meetingName: `${userStore.name} ${t('meeting.room.option.meetingName')}`,
      video: false,
      audio: true,
      loudspeaker: true,
      cloudRecord: false,
      escaping: false,
      abstract: false,
      organizer: userStore.name,
    });
  };
  // 发起呼叫-加入协作
  const handleJoinAssist = async (data: any) => {
    try {
      const res = await meetingStore.ThImEvent.joinMeeting({
        meetingNo: data.meetingNo,
        forceEntryStatus: 0,
        inviters: meetingStore.roomInvitePsn
          ? objToArrForKey(meetingStore.roomInvitePsn, 'userId')
          : [],
      });
      ThMeetingStore.updateRoomTranslateInfo({
        ...ThMeetingStore.roomTranslateInfo,
        ...res.data,
        open: !!res.data?.enableTranslation
      })
      commonStore.updateBtnLoading(false);
      if (res.code !== 200 && res.code !== 401) {
        Message.error(res.msg);
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
      handleOptionsCallClose();
      meetingStore.updateAssistVisible(true);
    } catch {
      commonStore.updateBtnLoading(false);
    }
  };
  // 发起呼叫-创建实时会议
  const handleCall = async () => {
    try {
      const res: any = await meetingStore.createRealtimeMeeting({
        aiStatus: meetingStore.roomOptions?.abstract ? '1' : '0',
        recordStatus: meetingStore.roomOptions?.cloudRecord ? '1' : '0',
        escaping: meetingStore.roomOptions?.escaping ? '1' : '0',
        subject: meetingStore.roomOptions?.meetingName,
        userIds: meetingStore.roomInvitePsn
          ? objToArrForKey(meetingStore.roomInvitePsn, 'userId')
          : [],
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

  const handleJoinModalOpen = () => {
    meetingStore.updateRoomOptions({
      video: false,
      audio: true,
      loudspeaker: true,
    });
    joinOptionsModalVisible.value = true;
  };
  const handleJoinModalClose = () => {
    joinOptionsModalVisible.value = false;
  };
  const handleJoinMeetingModalOpen = (data: any) => {
    meetingStore.updateRoomOptions({
      meetingName: data?.subject,
      meetingNo: data?.meetingNo,
      cloudRecord: data?.recordStatus === 1,
      abstract: data?.aiStatus === 1,
      escaping: data?.escaping === 1,
      organizer: data?.masterName,
      video: false,
      audio: true,
      loudspeaker: true,
    });
    joinMeetingModalVisible.value = true;
  };
  const handleJoinMeetingModalClose = () => {
    joinMeetingModalVisible.value = false;
  };
  // 加入会议
  const handleJoinMeeting = async (data: any) => {
    const res = await meetingStore.ThImEvent.joinMeeting({
      meetingNo: data.meetingNo,
      forceEntryStatus: 0,
      inviters: [],
    });
    if (res.code !== 200 && res.code !== 401) {
      if (
        res.code === AssistErrorType.OTHER_CLIENT_JOINED_MEETING ||
        res.code === AssistErrorType.OTHER_CLIENT_IN_MEETING
      ) {
        meetingStore.updateForceEntryMeetingInfo({
          meetingNo: data.meetingNo,
          invitor: [],
        });
        // todo 加入会议后会的参数 要存到会议翻译的store里
        ThMeetingStore.updateRoomTranslateInfo({
          ...ThMeetingStore.roomTranslateInfo,
          ...res.data,
          open: !!res.data?.enableTranslation
        })
        EventListener.emit('Chat-Other-Client-Joined-Meeting');
        handleJoinMeetingModalClose();
      } else {
        Message.error(res.msg);
      }
      return;
    }

    // todo 加入会议后会的参数 要存到会议翻译的store里
    ThMeetingStore.updateRoomTranslateInfo({
      ...ThMeetingStore.roomTranslateInfo,
      languageType: res.data?.languageType,
      industryType: res.data?.industryType,
      ...res.data,
      open: !!res.data?.enableTranslation
    })
    // 将业务系统中的获取房间信息，传入ThSDK中
    meetingStore.ThImEvent.roomMenuOptions = {
      video: meetingStore.roomOptions?.video,
      audio: meetingStore.roomOptions?.audio,
      loudspeaker: meetingStore.roomOptions?.loudspeaker,
    };
    meetingStore.ThImEvent.setRoomOnlineListPsn(addressStore.memberList);
    meetingStore.ThImEvent.setRoomOnlineGroupPsn(addressStore.memberGroupList);
    if (joinMeetingModalVisible.value) {
      handleJoinMeetingModalClose();
    }
    if (joinOptionsModalVisible.value) {
      handleJoinModalClose();
    }
    meetingStore.updateAssistVisible(true);
  };
  const handleUpdateMeetingList = async () => {
    await sleep(1000 * 0.3);
    meetingListRef.value?.handleGetMeetingList();
  };
  const scheduleMeetingDetail: any = ref(null);
  const handleScheduleOpen = (data?: any) => {
    scheduleModalVisible.value = true;
    if (data) {
      scheduleMeetingDetail.value = data;
    } else {
      scheduleMeetingDetail.value = null;
    }
  };
  const handleScheduleClose = () => {
    scheduleModalVisible.value = false;
    if (meetingListRef.value) {
      meetingListRef.value.handleGetMeetingList();
    }
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
  const longtimeModalVisible = ref<boolean>(false);
  const handleLongtimeModalOpen = () => {
    longtimeModalVisible.value = true;
  };
  const handleLongtimeModalClose = () => {
    longtimeModalVisible.value = false;
    handleUpdateMeetingList();
  };

  const meetingDetail: any = ref();

  const linkShareModalVisible = ref<boolean>(false);
  const handleLinkShareModalClose = () => {
    meetingDetail.value = null;
    linkShareModalVisible.value = false;
  };
  const handleLinkShareModalOpen = (data: any) => {
    console.log('handleLinkShareModalOpen', data);
    meetingDetail.value = data;
    linkShareModalVisible.value = true;
  };
  const qrCodeModalVisible = ref<boolean>(false);

  const handleQrCodeModalClose = () => {
    meetingDetail.value = null;
    qrCodeModalVisible.value = false;
  };
  const handleQrCodeModalOpen = (data: any) => {
    console.log('handleQrCodeModalOpen', data);
    meetingDetail.value = data;
    qrCodeModalVisible.value = true;
  };

  const handleMonitorEvent = () => {
    EventListener.on('meeting-list-update', handleUpdateMeetingList);
  };
  const handleClearMonitorEvent = () => {
    EventListener.off('meeting-list-update', handleUpdateMeetingList);
  };
  onBeforeUnmount(() => {
    handleClearMonitorEvent();
  });
  onMounted(() => {
    handleMonitorEvent();
  });
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
      flex-basis: 300px;
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
      }
    }
  }
</style>
