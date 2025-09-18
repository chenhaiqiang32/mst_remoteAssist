<template>
  <div v-if="MeetingList.length > 0" class="list-panel">
    <div class="list-panel-top">
      <span>{{ $t('meeting.list.title') }}</span>
    </div>
    <div class="list-panel-main wsl-scroll">
      <div
        v-for="(item, index) in MeetingList"
        :key="`meeting_${index}`"
        class="list-panel-main-item"
        :class="item.timestamp === 0 ? 'long' : ''"
      >
        <div class="list-panel-main-item-top">
          <span>{{
            item.timestamp === 0
              ? $t('meeting.list.long.title')
              : formatTimeGroup(item.timestamp)
          }}</span>
        </div>
        <div class="list-panel-main-item-content">
          <a-card
            :class="item.timestamp === 0 ? 'long-card' : ''"
            :bordered="false"
            :body-style="{ padding: '5px' }"
          >
            <div
              v-for="(meeting, meetingIndex) in item.meetings"
              :key="`meeting_item_${meetingIndex}`"
              class="list-panel-main-item-content-item"
              :class="
                moveCurrentActive.planId === meeting.planId ? 'active' : ''
              "
              @mouseenter="handleMoveEnter(meeting)"
              @mouseleave="handleMoveLeave"
            >
              <div class="list-panel-main-item-content-item-left">
                <MeetingDefaultIcon
                  v-if="item.timestamp !== 0"
                ></MeetingDefaultIcon>
                <MeetingDefaultLongIcon v-else></MeetingDefaultLongIcon>
              </div>
              <div
                class="list-panel-main-item-content-item-right"
                :class="
                  meetingIndex < item.meetings.length - 1 ? 'borderB' : ''
                "
              >
                <div class="list-panel-main-item-content-item-right-left">
                  <a-tooltip :content="meeting.subject">
                    <div
                      class="list-panel-main-item-content-item-right-left-top textEllipsis"
                    >
                      {{ meeting.subject }}
                    </div>
                  </a-tooltip>
                  <div class="list-panel-main-item-content-item-right-left-bot">
                    <div
                      class="list-panel-main-item-content-item-right-left-bot-i"
                    >
                      <span>{{ $t('meeting.list.long.zzz') }}:</span>
                      <img :src="meeting.masterAvatarUrl" alt="" />
                      <span>{{ meeting.masterName }}</span>
                    </div>
                    <div
                      class="list-panel-main-item-content-item-right-left-bot-i"
                    >
                      <span>{{ $t('meeting.list.long.time') }}:</span>
                      <span
                        >{{ formatTime(meeting.startTime) }}
                        {{
                          item.timestamp !== 0
                            ? `- ${formatTime(meeting.endTime)}`
                            : ''
                        }}
                      </span>
                    </div>
                    <div
                      class="list-panel-main-item-content-item-right-left-bot-i"
                    >
                      <span>{{ $t('meeting.list.long.hyh') }}:</span>
                      <span>{{ formattedMeetingNo(meeting.meetingNo) }}</span>
                    </div>
                    <div
                      v-if="item.timestamp !== 0"
                      class="list-panel-main-item-content-item-right-left-bot-s"
                      :class="showMeetingStatusCss(meeting.planStatus)"
                    >
                      <span>{{ showStatusLabel(meeting.planStatus) }}</span>
                    </div>
                  </div>
                </div>
                <div
                  v-if="moveCurrentActive.planId === meeting.planId"
                  class="list-panel-main-item-content-item-right-right"
                >
                  <a-space>
                    <a-button
                      type="primary"
                      @click="handleJoinMeeting(meeting)"
                      >{{ $t('meeting.list.long.rh') }}</a-button
                    >
                    <a-button @click="handleLinkShareModalOpen(meeting)">
                      <template #icon>
                        <SvgShareIcon class="share-icon"></SvgShareIcon>
                      </template>
                    </a-button>
                    <a-button @click="handleQrCodeModalOpen(meeting)">
                      <template #icon>
                        <SvgQrIcon class="qrCode-icon">></SvgQrIcon>
                      </template>
                    </a-button>

                    <a-dropdown
                      v-if="meeting.masterId === userStore.userId"
                      trigger="click"
                      @select="handleSelect"
                      @popup-visible-change="handleOpenSelect"
                    >
                      <a-button>
                        <template #icon>
                          <icon-more-vertical />
                        </template>
                      </a-button>
                      <template v-if="item.timestamp !== 0" #content>
                        <a-doption
                          v-if="
                            meeting.masterId === userStore.userId &&
                            meeting.planStatus === 0
                          "
                          :value="{
                            command: 3,
                            data: meeting,
                          }"
                          >{{ $t('meeting.list.long.xg') }}</a-doption
                        >
                        <a-doption
                          v-if="
                            meeting.masterId === userStore.userId &&
                            meeting.planStatus === 0
                          "
                          :value="{
                            command: 1,
                            data: meeting,
                          }"
                          >{{ $t('meeting.list.long.qxhy') }}</a-doption
                        >
                        <a-doption
                          v-if="
                            meeting.masterId === userStore.userId &&
                            meeting.planStatus === 1
                          "
                          :value="{
                            command: 2,
                            data: meeting,
                          }"
                          >{{ $t('meeting.list.long.jshy') }}</a-doption
                        >
                      </template>
                      <template v-else #content>
                        <a-doption
                          v-if="meeting.masterId === userStore.userId"
                          :value="{
                            command: 4,
                            data: meeting,
                          }"
                          ><span class="btn-del">{{
                            $t('meeting.list.long.del')
                          }}</span></a-doption
                        >
                      </template>
                    </a-dropdown>
                  </a-space>
                </div>
              </div>
            </div>
          </a-card>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="no-data">
    <div class="no-data-body">
      <img :src="meetingNoDataIcon" alt="" />
      <div class="no-data-body-text"> {{ $t('meeting.no.data.text') }} </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';

  import dayjs from 'dayjs';
  import { useI18n } from 'vue-i18n';

  import MeetingDefaultIcon from '@/assets/svg/meeting/icon-default-meeting.svg';
  import MeetingDefaultLongIcon from '@/assets/svg/meeting/icon-default-meeting-long.svg';
  import meetingNoDataIcon from '@/assets/images/no_data/meeting/no_meeting.png';

  import SvgShareIcon from '@/assets/svg/share.svg';
  import SvgQrIcon from '@/assets/svg/icon_qr_code.svg';

  import { useMeetingStore, useUserStore } from '@/store';
  import { formattedMeetingNo } from '@/utils';
  import { Message } from '@arco-design/web-vue';

  const emit = defineEmits([
    'openLinkShare',
    'openQrCode',
    'handleJoinMeetingOpen',
    'handleScheduleOpen',
  ]);

  const { t } = useI18n();
  const meetingStore = useMeetingStore();
  const MeetingList: any = ref([]);
  const userStore = useUserStore();
  const isCanMove: any = ref(true);
  const moveCurrentActive: any = ref({
    planId: '',
  });
  const formatTimeGroup = (timestamp: number) => {
    const now = dayjs();
    const date = dayjs(timestamp);

    const formattedDateTime = date.format('YYYY-MM-DD');

    if (date.isSame(now, 'day')) {
      return `${t('today')}`;
    }
    return formattedDateTime;
  };
  const formatTime = (timestamp: number) => {
    const date = dayjs(timestamp);

    const formattedDateTime = date.format('YYYY-MM-DD HH:mm');
    return formattedDateTime;
  };
  const showStatusLabel = (status: any) => {
    if (status === 1) {
      return t('meeting.list.long.status.jxz');
    }
    return t('meeting.list.long.status.dks');
  };
  const showMeetingStatusCss = (status: any) => {
    if (status === 1) {
      return 'jxz';
    }
    if (status === 0) {
      return 'dks';
    }
    return '';
  };
  const handleGetMeetingList = async () => {
    const res: any = await meetingStore.getMeetingGroupList();
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      return;
    }
    MeetingList.value = res.data;
  };
  const handleDelMeetingPlan = async (data: any) => {
    const res: any = await meetingStore.delMeetingPlan({
      planId: data.planId,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
    } else {
      Message.success(t('meeting.list.long.delete'));
    }
    handleGetMeetingList();
  };
  const handleCancelMeetingPlan = async (data: any) => {
    const res: any = await meetingStore.delMeetingPlan({
      planId: data.planId,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
    } else {
      Message.success(t('meeting.list.long.cancel'));
    }
    handleGetMeetingList();
  };
  const handleOverMeetingPlan = async (data: any) => {
    const res: any = await meetingStore.overMeetingPlan({
      planId: data.planId,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      handleGetMeetingList();
      return;
    }
    Message.success(t('meeting.list.long.cancel'));
    handleGetMeetingList();
  };
  const handleEditMeetingPlan = async (data: any) => {
    const res: any = await meetingStore.getMeetingDetail(data);
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      return;
    }
    emit('handleScheduleOpen', res.data);
  };
  const handleSelect = (data: any) => {
    if (data.command === 1) {
      handleCancelMeetingPlan(data.data);
    } else if (data.command === 2) {
      handleOverMeetingPlan(data.data);
    } else if (data.command === 3) {
      handleEditMeetingPlan(data.data);
    } else if (data.command === 4) {
      handleDelMeetingPlan(data.data);
    }
  };
  const handleMoveEnter = (data: any) => {
    if (isCanMove.value) {
      moveCurrentActive.value = data;
    }
  };
  const handleMoveLeave = () => {
    if (isCanMove.value) {
      moveCurrentActive.value = '';
    }
  };
  const handleOpenSelect = (visible: boolean) => {
    isCanMove.value = !visible;
    if (!visible) {
      handleMoveLeave();
    }
  };
  const handleJoinMeeting = (data: any) => {
    if (meetingStore.answerInfo && meetingStore.answerInfo.meetingNo) {
      Message.error(t('meeting.call.message.tips'));
      return;
    }
    emit('handleJoinMeetingOpen', data);
  };
  const handleLinkShareModalOpen = (data: any) => {
    emit('openLinkShare', data);
  };
  const handleQrCodeModalOpen = (data: any) => {
    emit('openQrCode', data);
  };
  onMounted(() => {
    handleGetMeetingList();
  });
  defineExpose({
    handleGetMeetingList,
  });
</script>

<style scoped lang="less">
  .list-panel {
    width: 100%;

    &-top {
      height: 42px;
      display: flex;
      align-items: center;

      span {
        font-weight: 500;
        font-size: 16px;
        color: var(--color-neutral-10);
      }
    }

    &-main {
      padding: 7px 0 14px;
      height: calc(100vh - 55px - 80px);
      overflow-y: scroll;

      /* 使用统一滚动条样式 */
      @extend .custom-scrollbar;

      &-item {
        margin-bottom: 24px;

        &-top {
          height: 24px;
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          span {
            font-weight: 500;
            font-size: 14px;
            color: var(--color-neutral-10);
          }
        }

        &-content {
          width: 100%;
          border-radius: var(--border-radius-medium);
          overflow: hidden;

          &-item {
            cursor: pointer;
            padding: 0 10px;
            min-height: 70px;
            border-radius: var(--border-radius-medium);
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1px;

            &-left {
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;
              background-color: #ebf3ff;
              border-radius: var(--border-radius-circle);

              img {
                flex-shrink: 0;
                width: 28px;
                height: 28px;
              }
            }

            &-right {
              flex: 1;
              height: 100%;
              padding: 12px 0;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: space-between;

              &-left {
                &-top {
                  width: fit-content;
                  max-width: 250px;
                  min-height: 24px;
                  font-weight: 500;
                  font-size: 14px;
                  color: var(--color-neutral-10);
                }

                &-bot {
                  min-height: 18px;
                  display: flex;
                  align-items: center;

                  &-i {
                    display: flex;
                    align-items: center;
                    min-width: 120px;

                    span {
                      font-weight: 400;
                      font-size: 12px;
                      color: var(--color-neutral-6);
                      margin-right: 12px;
                    }

                    img {
                      flex-shrink: 0;
                      width: 18px;
                      height: 18px;
                      border-radius: var(--border-radius-circle);
                      margin-right: 6px;
                    }
                  }

                  &-s {
                    padding: 4px 2px;
                    border-radius: var(--border-radius-medium);

                    &.jxz {
                      background-color: rgba(2, 103, 255, 0.15);

                      span {
                        color: #0267ff;
                      }
                    }

                    &.dks {
                      padding: 4px 2px;
                      background-color: rgba(255, 169, 2, 0.15);

                      span {
                        color: #ff8b02;
                      }
                    }
                  }
                }
              }

              &-right {
                display: flex;
                align-items: center;
              }

              &.borderB {
                &::after {
                  content: '';
                  width: 100%;
                  height: 1px;
                  background-color: var(--color-neutral-2);
                  position: absolute;
                  bottom: -2px;
                  right: 0;
                }
              }
            }
            &.active {
              &:hover {
                background-color: #f7f7f7;

                .list-panel-main-item-content-item-left {
                  background-color: #fff;
                }

                .list-panel-main-item-content-item-right {
                  &.borderB {
                    &::after {
                      content: '';
                      width: 100%;
                      height: 1px;
                      background-color: transparent !important;
                      position: absolute;
                      bottom: -1px;
                      right: 0;
                    }
                  }
                }
              }
            }
          }

          .long-card {
            background-color: #fff7eb;

            .list-panel-main-item-content-item {
              &-left {
                background-color: #fff;
              }

              &-right {
                &.borderB {
                  &::after {
                    content: '';
                    width: 100%;
                    height: 1px;
                    background-color: rgba(#ff6b00, 0.12);
                    position: absolute;
                    bottom: -1px;
                    right: 0;
                  }
                }
              }
              &.active {
                &:hover {
                  background-color: #fff0db;

                  .list-panel-main-item-content-item-right {
                    &-right {
                      &.borderB {
                        &::after {
                          content: '';
                          width: 100%;
                          height: 1px;
                          background-color: transparent;
                          position: absolute;
                          bottom: -1px;
                          right: 0;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .share-icon {
    fill: var(--color-neutral-7);
  }
  .qrCode-icon {
    fill: var(--color-neutral-7);
  }
  .btn-del {
    color: #f65160;
  }
</style>
