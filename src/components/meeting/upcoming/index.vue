<template>
  <div class="upcoming-container">
    <div class="upcoming-container-top">
      <div class="upcoming-container-top-l">
        <img :src="logoIcon" alt="" />
        <div class="upcoming-container-top-l-r">
          <span>{{ t('meeting.modal.upcoming.title') }}</span>
        </div>
      </div>
      <div class="upcoming-container-top-r" @click="handleClose">
        <img :src="closeIcon" alt="" />
      </div>
    </div>
    <div class="upcoming-container-main">
      <a-tooltip :content="meetingStore.upcomingMeetingInfo?.subject">
        <div class="upcoming-container-main-top textEllipsis">
          {{ meetingStore.upcomingMeetingInfo?.subject }}
        </div>
      </a-tooltip>
      <div class="upcoming-container-main-bot">
        <div class="upcoming-container-main-bot-i one">
          <span>{{ t('meeting.modal.upcoming.content2') }}:</span>
          &nbsp;
          <span>{{ masterName }}</span>
        </div>
        <div class="upcoming-container-main-bot-i">
          <span>{{ t('meeting.modal.upcoming.content1') }}:</span>
          &nbsp;
          <span
            >{{ showTime(meetingStore.upcomingMeetingInfo?.startTime) }} -
            {{ showTime(meetingStore.upcomingMeetingInfo?.endTime) }}</span
          >
        </div>
      </div>
    </div>
    <div class="upcoming-container-menu">
      <a-button long class="modal-btn-item" @click="handleClose">{{
        $t('meeting.modal.upcoming.btn1')
      }}</a-button>
      <a-button
        long
        class="modal-btn-item"
        type="primary"
        @click="handleJoinMeeting"
        >{{ $t('meeting.modal.upcoming.btn2') }}</a-button
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';

  import { useMeetingStore, useAddressStore } from '@/store';
  import { formatTimestamp } from '@/utils';
  import EventListener from '@/utils/event-listener';

  import logoIcon from '@/assets/images/logo_icon.png';
  import closeIcon from '@/assets/icons/icon_close.png';

  const { t } = useI18n();
  const meetingStore = useMeetingStore();
  const addressStore = useAddressStore();

  const masterName = ref('');

  const showTime = (time: any) => {
    if (time) {
      return formatTimestamp(time, 'HH:mm');
    }
    return '';
  };
  const showMasterName = async (master: any) => {
    if (master) {
      const member: any = await addressStore.filterMemberInfoByUserId(master);
      masterName.value = member.name;
    }
  };
  const handleClose = () => {
    // 关闭立即入会弹窗
    meetingStore.removeUpcomingMeetingList(meetingStore.upcomingMeetingInfo);
    if (meetingStore.upcomingMeetingList.length > 0) {
      meetingStore.updateUpcomingMeetingInfo(
        meetingStore.upcomingMeetingList[0]
      );
    } else {
      meetingStore.updateUpcomingMeetingInfo(null);
      meetingStore.updateUpcomingMeetingVisible(false);
    }
  };
  const handleJoinMeeting = async () => {
    EventListener.emit('meeting-notification-close');
    EventListener.emit('Chat-upcoming-meeting-join');
  };
  onMounted(() => {
    showMasterName(meetingStore.upcomingMeetingInfo.master);
  });
  defineExpose({
    handleClose,
  });
</script>

<style scoped lang="less">
  .upcoming-container {
    cursor: pointer;
    width: 100%;
    padding: 13px 11px 23px 18px;
    background: #ffffff;
    box-shadow: 0px 6px 58px 0px rgba(121, 145, 173, 0.2);
    border-radius: 8px;
    border: 1px solid #e6ebf5;
    .upcoming-container-top {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;
      .upcoming-container-top-l {
        display: flex;
        align-items: center;
        img {
          margin-right: 6px;
          flex-shrink: 0;
          width: 22px;
          height: 22px;
        }
        .upcoming-container-top-l-r {
          span {
            font-weight: 500;
            font-size: 12px;
            color: #0b172a;
          }
        }
      }
      .upcoming-container-top-r {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
    .upcoming-container-main {
      width: 100%;
      margin-bottom: 20px;
      .upcoming-container-main-top {
        margin-bottom: 8px;
        font-weight: 500;
        font-size: 15px;
        color: #0b172a;
      }
    }
    .upcoming-container-main-bot {
      width: 100%;

      .upcoming-container-main-bot-i {
        span {
          font-weight: 400;
          font-size: 12px;
          color: #0b172a;
        }
        &.one {
          margin-bottom: 10px;
        }
      }
    }
    .upcoming-container-menu {
      display: flex;
      justify-content: space-between;
      .modal-btn-item {
        margin: 0 4px;
      }
    }
  }
</style>
