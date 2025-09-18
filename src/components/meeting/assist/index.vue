<template>
  <div
    v-if="meetingStore.assistVisible"
    id="assist-container"
    class="assist-container"
  >
    <THMKitAssist
      v-if="meetingStore.assistVisible"
      :sdk-event="meetingStore.ThImEvent"
    ></THMKitAssist>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, onBeforeUnmount } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { Message } from '@arco-design/web-vue';
  import { useMeetingStore } from '@/store';
  import EventListener from '@/utils/event-listener';
  import { THMKitAssist, THEventBus } from '../../../../packages/index';
  import IndexDBService from '../../../../packages/utils/db';

  const { t } = useI18n();
  const meetingStore = useMeetingStore();
  const handleAssistHangup = () => {
    EventListener.emit('meeting-list-update');
    EventListener.emit('record-list-update');
    meetingStore.updateAssistVisible(false);
  };
  //  清理本地indexdb聊天记录
  const handleClose = () => {
    const messageDB = new IndexDBService();
    messageDB.deleteChatSessionsTable();
  };
  const handleOverMeeting = () => {
    handleAssistHangup();
    Message.success(t('meeting.assist.over'));
    handleClose(); // 清理本地indexdb聊天记录
  };
  const handleLeaveMeeting = () => {
    handleAssistHangup();
    Message.success(t('meeting.assist.leave'));
    handleClose(); // 清理本地indexdb聊天记录
  };

  const handleErrorLeaveMeeting = () => {
    handleAssistHangup();
    Message.success(t('meeting.assist.error.leave'));
  };
  const handleMonitorAssistEvent = () => {
    THEventBus.on('mst-over-meeting', handleOverMeeting);
    THEventBus.on('mst-leave-meeting', handleLeaveMeeting);
    THEventBus.on('mst-error-leave-meeting', handleErrorLeaveMeeting);
  };
  const handleClearMonitorAssistEvent = () => {
    THEventBus.off('mst-over-meeting', handleOverMeeting);
    THEventBus.off('mst-leave-meeting', handleLeaveMeeting);
    THEventBus.off('mst-error-leave-meeting', handleErrorLeaveMeeting);
  };
  onMounted(() => {
    handleMonitorAssistEvent();
  });
  onBeforeUnmount(() => {
    handleClearMonitorAssistEvent();
  });
</script>

<style scoped lang="less">
  .assist-container {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: black;
    z-index: 100;
    :deep(.arco-drawer-container) {
      &.msg-drawer-wrapper {
        z-index: 11 !important;
        .arco-drawer {
          .arco-drawer-body {
            padding: 0;
          }
        }
      }
    }
  }
</style>
