<template>
  <a-card
    class="general-card menu-panel"
    :bordered="false"
    :body-style="{
      height: '100%',
      display: 'flex',
      padding: 0,
      flexFlow: 'column',
    }"
  >
    <div class="menu-panel-top">
      <span>{{ $t('meeting.menu.title') }}</span>
    </div>
    <div class="menu-panel-content">
      <a-row class="grid-meeting-type" :gutter="[16, 16]">
        <a-col :xs="12" :sm="12" :md="6" :lg="12" :xl="12" :xxl="12" :span="12">
          <a-card
            class="grid-meeting-type-item"
            :bordered="true"
            hoverable
            @click="debounceQuickMeeting"
          >
            <div class="grid-meeting-type-item-b">
              <div class="grid-meeting-type-item-b-top icon1">
                <CreateMenuIcon1></CreateMenuIcon1>
              </div>
              <div class="grid-meeting-type-item-b-bot">
                <span> {{ $t('meeting.menu.kshy') }}</span>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :xs="12" :sm="12" :md="6" :lg="12" :xl="12" :xxl="12" :span="12">
          <a-card
            class="grid-meeting-type-item"
            :bordered="true"
            hoverable
            @click="handleScheduleOpen"
          >
            <div class="grid-meeting-type-item-b">
              <div class="grid-meeting-type-item-b-top icon2">
                <CreateMenuIcon2></CreateMenuIcon2>
              </div>
              <div class="grid-meeting-type-item-b-bot">
                <span> {{ $t('meeting.menu.yyhy') }}</span>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :xs="12" :sm="12" :md="6" :lg="12" :xl="12" :xxl="12" :span="12">
          <a-card
            class="grid-meeting-type-item"
            :bordered="true"
            hoverable
            @click="handleLongtimeModalOpen"
          >
            <div class="grid-meeting-type-item-b">
              <div class="grid-meeting-type-item-b-top icon3">
                <CreateMenuIcon3></CreateMenuIcon3>
              </div>
              <div class="grid-meeting-type-item-b-bot">
                <span> {{ $t('meeting.menu.cqhy') }}</span>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :xs="12" :sm="12" :md="6" :lg="12" :xl="12" :xxl="12" :span="12">
          <a-card
            class="grid-meeting-type-item"
            :bordered="true"
            hoverable
            @click="handleRoomJoinOptionOpen"
          >
            <div class="grid-meeting-type-item-b">
              <div class="grid-meeting-type-item-b-top icon4">
                <CreateMenuIcon4></CreateMenuIcon4>
              </div>
              <div class="grid-meeting-type-item-b-bot">
                <span> {{ $t('meeting.menu.jrhy') }}</span>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
  import { useMeetingStore } from '@/store';
  import { debounce } from 'lodash-es';
  import { Message } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';

  import CreateMenuIcon1 from '@/assets/svg/meeting/icon_create_1.svg';
  import CreateMenuIcon2 from '@/assets/svg/meeting/icon_create_2.svg';
  import CreateMenuIcon3 from '@/assets/svg/meeting/icon_create_3.svg';
  import CreateMenuIcon4 from '@/assets/svg/meeting/icon_create_4.svg';

  const meetingStore = useMeetingStore();

  const { t } = useI18n();
  const emit = defineEmits([
    'handleQuickMeetingOpen',
    'handleScheduleOpen',
    'handleLongtimeOpen',
    'handleJoinMeetingOpen',
  ]);
  const handleQuickMeeting = () => {
    if (meetingStore.answerInfo && meetingStore.answerInfo.meetingNo) {
      Message.error(t('meeting.call.message.tips'));
      return;
    }
    emit('handleQuickMeetingOpen');
  };
  const debounceQuickMeeting = debounce(handleQuickMeeting, 1000);

  const handleScheduleOpen = () => {
    emit('handleScheduleOpen');
  };
  const handleLongtimeModalOpen = () => {
    emit('handleLongtimeOpen');
  };
  const handleRoomJoinOptionOpen = () => {
    if (meetingStore.answerInfo && meetingStore.answerInfo.meetingNo) {
      Message.error(t('meeting.call.message.tips'));
      return;
    }
    emit('handleJoinMeetingOpen');
  };
</script>

<style lang="less" scoped>
  .menu-panel {
    display: flex;
    flex-direction: column;
    height: 100%;

    &-top {
      height: 64px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      span {
        font-weight: 500;
        font-size: 16px;
        color: var(--color-neutral-10);
      }
    }
    &-content {
      margin-bottom: 12px;
      padding: 0 16px;
      .grid-meeting-type {
        &-item {
          width: 100%;
          height: 126px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          :deep(.arco-card-body) {
            width: 100% !important;
          }
          &-b {
            cursor: pointer;
            flex-shrink: 0;
            height: 126px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: var(--border-radius-large);
            &-top {
              width: 56px;
              height: 56px;
              border-radius: var(--border-radius-medium);
              display: flex;
              align-items: center;
              justify-content: center;
              img {
                flex-shrink: 0;
                width: 38px;
                height: 38px;
              }
              &.icon1 {
                background-color: #ebf3ff;
              }
              &.icon2 {
                background-color: #ebf3ff;
              }
              &.icon3 {
                background-color: #fff7eb;
              }
              &.icon4 {
                background-color: #ebf3ff;
              }
            }
            &-bot {
              margin-top: 12px;
              min-height: 20px;
              text-align: center;
              span {
                font-size: 13px;
                font-weight: 400;
                color: var(--color-text-1);
              }
            }
          }
        }
      }
    }
  }
</style>
