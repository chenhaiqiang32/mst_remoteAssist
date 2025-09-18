<template>
  <div class="container">
    <div class="layout">
      <div class="layout-left-side">
        <recordListVue ref="recordListRef"></recordListVue>
      </div>
      <a-divider
        direction="vertical"
        :style="{
          margin: 0,
        }"
      />
      <div class="layout-content">
        <detailVue @handle-send-assist="handleOptionCallOpen"></detailVue>
      </div>
    </div>
    <!-- 发起会议 -->
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
  import { ref, onBeforeUnmount, onMounted } from 'vue';
  import {
    useRecordStore,
    useMeetingStore,
    useAddressStore,
    useUserStore,
    useCommonStore,
  } from '@/store';
  import AssistErrorType from '@/utils/sdk/assistErrorType';
  import EventListener from '@/utils/event-listener';
  import { objToArrForKey } from '@/utils';
  import { Message } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';

  import optionsCallModal from '@/components/meeting/options/send.vue';
  import recordListVue from './components/record.vue';
  import detailVue from './components/detail.vue';
  import useThMeetingStore from '../../../packages/store';

  const { t } = useI18n();
  const recordStore = useRecordStore();
  const meetingStore = useMeetingStore();
  const ThMeetingStore = useThMeetingStore();
  const addressStore = useAddressStore();
  const userStore = useUserStore();
  const commonStore = useCommonStore();

  const recordListRef = ref();
  // 协助会议 房间设置
  const callRoomOptionsVisible = ref(false);
  // 会议邀请人员
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
    meetingStore.updateRoomInvitePsn(data.inviteMembers);
    meetingStore.updateRoomOptions({
      meetingName: data.subject,
      video: false,
      audio: true,
      loudspeaker: true,
      cloudRecord: data.recordStatus === 1,
      abstract: data.aiStatus === 1,
      escaping: data.escaping === 1,
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
        if (
          res.code === AssistErrorType.OTHER_CLIENT_JOINED_MEETING ||
          res.code === AssistErrorType.OTHER_CLIENT_IN_MEETING
        ) {
          meetingStore.updateForceEntryMeetingInfo({
            meetingNo: data.meetingNo,
            invitor: meetingStore.roomInvitePsn
              ? objToArrForKey(meetingStore.roomInvitePsn, 'userId')
              : [],
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
      handleOptionsCallClose();
      meetingStore.updateAssistVisible(true);
    } catch (error) {
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
        commonStore.updateBtnLoading(false);
        Message.error(res.msg);
        return;
      }
      handleJoinAssist(res.data);
    } catch (error) {
      commonStore.updateBtnLoading(false);
    }
  };
  const handleClearRecord = () => {
    recordStore.clearOptions();
  };

  const handleUpdateRecordList = async () => {
    // await sleep(1000 * 0.5);
    // recordListRef.value?.handleInitMeetingList();
  };
  const handleMonitorEvent = () => {
    EventListener.on('record-list-update', handleUpdateRecordList);
  };
  const handleClearMonitorEvent = () => {
    EventListener.off('record-list-update', handleUpdateRecordList);
  };
  onMounted(() => {
    handleMonitorEvent();
  });
  onBeforeUnmount(() => {
    handleClearRecord();
    handleClearMonitorEvent();
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
      flex-basis: 350px;
    }

    &-content {
      flex: 1;
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
        padding: 0;
        order: -1;
      }
    }
  }
</style>
