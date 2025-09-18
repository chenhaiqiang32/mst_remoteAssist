<template>
  <div v-if="meetingStore.answerVisible" class="answer-container">
    <div class="answer-container-left">
      <div class="answer-container-left-icon">
        <img :src="meetingStore.answerInfo.avatarUrl" alt="" />
      </div>
    </div>
    <div class="answer-container-mid">
      <div class="answer-container-mid-top">
        <span>{{ meetingStore.answerInfo.name }}</span>
      </div>
      <div class="answer-container-mid-desc">
        {{ t('meeting.answer.desc') }}...
      </div>
    </div>
    <div class="answer-container-right">
      <div
        class="answer-container-right-item right"
        @click="handleMeetingHangup"
      >
        <img :src="hangupIcon" alt="" />
      </div>
      <div class="answer-container-right-item" @click="handleMeetingAgree">
        <img :src="answerIcon" alt="" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n';
  import { Message } from '@arco-design/web-vue';
  import { useMeetingStore, useAddressStore, useCommonStore } from '@/store';
  import AssistErrorType from '@/utils/sdk/assistErrorType';
  import EventListener from '@/utils/event-listener';

  import hangupIcon from '@/assets/icons/ic_hang_up.png';
  import answerIcon from '@/assets/icons/ic_answer.png';
  import { onBeforeUnmount, onMounted, watch, ref } from 'vue';
  import { isWujie } from '@/utils/wujie';
  import useThMeetingStore from '../../../../packages/store';

  const { t } = useI18n();
  const meetingStore = useMeetingStore();
  const ThMeetingStore = useThMeetingStore();
  const addressStore = useAddressStore();
  const commonStore = useCommonStore();
  const handleMeetingHangup = () => {
    Message.success(t('meeting.answer.message.hangup'));
    meetingStore.ThImEvent.sendAssistInviteeRejectEvent({
      meetingNo: meetingStore.answerInfo.meetingNo,
      invitor: meetingStore.answerInfo.userId,
    });
    meetingStore.updateAnswerInfo(null);
    meetingStore.updateAnswerVisible(false);
    EventListener.emit('Chat-answer-hangup');
  };
  const handleMeetingAgree = async () => {
    EventListener.emit('meeting-notification-close');
    const res: any = await meetingStore.ThImEvent.agreeJoinMeeting({
      meetingNo: meetingStore.answerInfo.meetingNo,
      invitor: meetingStore.answerInfo.userId,
      forceEntryStatus: 0,
    });
    if (res.code !== 200 && res.code !== 401) {
      if (
        res.code === AssistErrorType.OTHER_CLIENT_JOINED_MEETING ||
        res.code === AssistErrorType.OTHER_CLIENT_IN_MEETING
      ) {
        meetingStore.updateForceEntryMeetingInfo({
          meetingNo: meetingStore.answerInfo.meetingNo,
          invitor: meetingStore.answerInfo.userId,
        });
        EventListener.emit('Chat-Other-Client-Joined-Meeting');
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
    meetingStore.ThImEvent.setRoomOnlineListPsn(addressStore.memberList);
    meetingStore.ThImEvent.setRoomOnlineGroupPsn(addressStore.memberGroupList);
    meetingStore.updateAnswerVisible(false);
    meetingStore.updateAnswerInfo(null);
    meetingStore.updateAssistVisible(true);
    EventListener.emit('Chat-answer-agree');
  };

  // todo 存一下父应用传来的消息 使用后watch清除
  const mainAppEventData = ref()
  const onMainAppJoinMeeting = async (data: any) => {
    console.log('Mount-------接收到父应用通知进入会议>>>>>>>>>>>>>', data, commonStore.socketStatus);
    const { invitorId, meetingNo } = data?.eventValue ?? {};
    //  存一下父应用传来的消息 更新进入协作需要的store信息 给即将进入的会议使用
    mainAppEventData.value = data?.eventValue;
    meetingStore.updateAnswerInfo({
      ...meetingStore.answerInfo,
      meetingNo: meetingNo,
      userId: invitorId
    });
  };

  watch(() => [commonStore.socketStatus, mainAppEventData.value], async (newValue) => {
    const [newSocketStatus, newEventData] = newValue;
    console.log('Mount-------watch进入会议前的时候是不是在线', newEventData, newSocketStatus);
    // todo 在线 且 父应用传入了进入会议的参数才打开协作
    if (newSocketStatus === 3 && newEventData) {
      await handleMeetingAgree();
      mainAppEventData.value = null;
    }
  })
  onMounted(() => {
    if (isWujie()) {
      // 接受到主应用发送的请求JOIN_MEETING事件
      window?.$wujie?.bus?.$on('JOIN_MEETING', onMainAppJoinMeeting);
    }
  })
  onBeforeUnmount(() => {
    if (isWujie()) {
      // 接受到主应用发送的请求JOIN_MEETING事件
      window?.$wujie?.bus?.$off('JOIN_MEETING', onMainAppJoinMeeting);
      mainAppEventData.value = null;
    }
  })
</script>

<style scoped lang="less">
  .answer-container {
    cursor: pointer;
    width: 420px;
    padding: 21px 24px 21px 21px;
    position: fixed;
    top: 68px;
    left: 0;
    right: 0;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    border: 1px solid #d8e0f0;
    z-index: 100;
    display: flex;
    align-items: center;
    box-shadow: 0px 7px 23px 0px rgba(0, 0, 0, 0.1);
    .answer-container-left {
      flex-shrink: 0;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-right: 11px;
      .answer-container-left-icon {
        flex-shrink: 0;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid #ffffff;
        }
      }
    }
    .answer-container-mid {
      flex-shrink: 0;
      margin-right: 36px;
      .answer-container-mid-top {
        span {
          font-weight: 400;
          font-size: 20px;
          color: #0a1629;
        }
      }
      .answer-container-mid-desc {
        margin-top: 14px;
        width: 138px;
        font-weight: 400;
        font-size: 14px;
        color: #adadad;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: center;
      }
    }
    .answer-container-right {
      display: flex;
      align-items: center;
      justify-content: center;
      .answer-container-right-item {
        flex-shrink: 0;
        width: 50px;
        height: 50px;
        img {
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }
        &.right {
          margin-right: 23px;
        }
      }
    }
  }
</style>
