<template>
  <a-card
    class="record-detail-container"
    :bordered="false"
    :body-style="{ padding: 0, height: '100%' }"
  >
    <div v-if="recordStore.noRecordDetail" class="detail-panel">
      <div class="detail-panel-top">
        <div class="detail-panel-top-title">
          <a-space :size="16"
            ><div class="detail-panel-top-title-left">
              <MeetingDefaultIcon></MeetingDefaultIcon>
            </div>

            <a-tooltip :content="meetingDetail.subject">
              <div class="detail-panel-top-title-right">
                <div class="meeting-title">{{ meetingDetail.subject }}</div>
                <div class="meeting-number"
                  >会议号：{{ meetingDetail.meetingNo }}</div
                >
              </div>
            </a-tooltip>
          </a-space>
        </div>
        <div class="detail-panel-top-btn">
          <a-button type="primary" @click="handleOpenAssist">
            <template #icon>
              <img :src="sendIcon" alt="" />
            </template>
            <template #default>{{ $t('meeting.btn.send') }}</template>
          </a-button>
        </div>
      </div>
      <a-divider :margin="0" />
      <div class="detail-panel-main wsl-scroll">
        <a-typography-title
          class="block-title"
          :heading="6"
          :style="{
            margin: 0,
            fontWeight: 400,
          }"
        >
          {{ $t('meeting.detail.assist.title') }}
        </a-typography-title>
        <a-row
          :gutter="[20, 20]"
          :style="{
            marginTop: '10px',
          }"
        >
          <a-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" :xxl="6">
            <a-card class="grid-card" :bordered="false" hoverable>
              <div class="block-item-grid">
                <div class="block-item-grid-top">
                  <span>{{ $t('meeting.detail.assist.fqr') }}</span>
                </div>
                <div class="block-item-grid-bot">
                  <div class="block-item-grid-bot-icon">
                    <img :src="meetingDetail.masterAvatarUrl" alt="" />
                  </div>
                  <div class="block-item-grid-bot-l">
                    {{ meetingDetail.masterName }}
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" :xxl="6">
            <a-card class="grid-card" :bordered="false" hoverable>
              <div class="block-item-grid">
                <div class="block-item-grid-top">
                  <span>{{ $t('meeting.detail.assist.hysc') }}</span>
                </div>
                <div class="block-item-grid-bot">
                  <div class="block-item-grid-bot-l">
                    {{ formatSeconds(meetingDetail.meetingDuration) }}
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" :xxl="6"
            ><a-card class="grid-card" :bordered="false" hoverable>
              <div class="block-item-grid">
                <div class="block-item-grid-top">
                  <span>{{ $t('meeting.detail.assist.start.time') }}</span>
                </div>
                <div class="block-item-grid-bot">
                  <div class="block-item-grid-bot-l">
                    {{
                      meetingDetail.startTime
                        ? formatTimestamp(meetingDetail.startTime, 'today')
                        : ''
                    }}
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
          <a-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" :xxl="6">
            <a-card class="grid-card" :bordered="false" hoverable>
              <div class="block-item-grid">
                <div class="block-item-grid-top">
                  <span>{{ $t('meeting.detail.assist.end.time') }}</span>
                </div>
                <div class="block-item-grid-bot">
                  <div class="block-item-grid-bot-l">
                    {{
                      meetingDetail.endTime
                        ? formatTimestamp(meetingDetail.endTime, 'today')
                        : ''
                    }}
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
        <a-typography-title
          class="block-title"
          :heading="6"
          :style="{
            margin: '20px 0 10px',
            fontWeight: 400,
          }"
        >
          {{ $t('meeting.detail.meeting.member') }}
        </a-typography-title>
        <div class="block-member">
          <div class="block-member-item">
            <div class="block-member-item-title">
              <span>{{ $t('meeting.detail.meeting.member.yq') }}</span>
              &nbsp;&nbsp;
              <span
                >({{ meetingDetail.inviteMembers.length }}
                {{ $t('meeting.detail.meeting.member.dw') }})</span
              >
            </div>
            <div class="block-member-item-main">
              <div
                v-for="(item, index) in meetingDetail.inviteMembers"
                :key="`yq_${index}`"
                class="block-member-item-main-i"
              >
                <div class="block-member-item-main-i-t">
                  <img :src="item.avatarUrl" alt="" />
                  <div
                    :class="
                      item.pcOnline || item.androidOnline || item.glassOnline
                        ? 'online'
                        : 'outline'
                    "
                    class="block-member-item-main-i-t-f"
                  ></div>
                </div>
                <div class="block-member-item-main-i-n">
                  <span>{{ item.name }}</span>
                </div>
              </div>
            </div>
          </div>
          <a-divider :margin="5" />
          <div class="block-member-item" style="margin-top: 10px">
            <div class="block-member-item-title">
              <span>{{ $t('meeting.detail.meeting.member.sj') }}</span>
              &nbsp;&nbsp;
              <span
                >({{ meetingDetail.members.length }}
                {{ $t('meeting.detail.meeting.member.dw') }})</span
              >
            </div>
            <div v-if="meetingDetail.members" class="block-member-item-main">
              <div
                v-for="(item, index) in meetingDetail.members"
                :key="`sj_${index}`"
                class="block-member-item-main-i"
              >
                <div class="block-member-item-main-i-t">
                  <img :src="item.avatarUrl" alt="" />
                  <div
                    :class="
                      item.pcOnline || item.androidOnline || item.glassOnline
                        ? 'online'
                        : 'outline'
                    "
                    class="block-member-item-main-i-t-f"
                  ></div>
                </div>
                <div class="block-member-item-main-i-n">
                  <span>{{ item.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <a-typography-title
          class="block-title"
          :heading="6"
          :style="{
            margin: '20px 0 10px',
            fontWeight: 400,
          }"
        >
          {{ $t('meeting.detail.assist.zl') }}
        </a-typography-title>
        <a-row
          :gutter="[16, 16]"
          :style="{
            marginTop: '10px',
          }"
        >
          <a-col
            v-for="(item, index) in collaborativeType"
            :key="`data_${index}`"
            :xs="24"
            :sm="24"
            :md="24"
            :lg="12"
            :xl="12"
            :xxl="8"
          >
            <a-card class="grid-card-data" :bordered="true" hoverable>
              <div class="grid-card-data-main">
                <div class="grid-card-data-main-top">
                  <div class="grid-card-data-main-top-left">
                    <component :is="item.icon" class="icon" />
                  </div>
                  <div class="grid-card-data-main-top-right">
                    <div
                      v-if="item.hasData && item.showNum"
                      class="grid-card-data-main-top-right-num"
                    >
                      <span
                        >{{ item.num }}
                        {{ t('meeting.detail.assist.zl.dw') }}</span
                      >
                    </div>
                  </div>
                </div>
                <div class="grid-card-data-main-bot">
                  <div class="grid-card-data-main-bot-top">
                    <span>{{ item.title }}</span>
                  </div>
                  <div class="grid-card-data-main-bot-bot">
                    <div class="grid-card-data-main-bot-bot-left">
                      <span>{{ item.desc }}</span>
                    </div>
                    <div class="grid-card-data-main-bot-bot-right">
                      <template v-if="item.hasData">
                        <a-link href="/" @click="handleCheck(item, $event)">{{
                          t('meeting.detail.assist.zl.btn.look')
                        }}</a-link>
                        <!-- <a-link
                          v-if="item.btn.includes('preview')"
                          href="/"
                          @click="handlePreview"
                          >{{
                            t('meeting.detail.assist.zl.btn.preview')
                          }}</a-link
                        >
                        <a-link
                          v-if="item.btn.includes('download')"
                          href="/"
                          @click="handleDownload"
                          >{{
                            t('meeting.detail.assist.zl.btn.download')
                          }}</a-link
                        > -->
                      </template>
                      <span v-else>{{
                        $t('meeting.detail.assist.zl.zwlr')
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </div>
    <div v-else class="no-data">
      <div class="no-data-body">
        <img :src="recordDetailNoDataIcon" alt="" />
        <div class="no-data-body-text"> {{ $t('meeting.no.data.text') }} </div>
      </div>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import * as ChatPB from '@/utils/proto/chatProtocol';
  import { useI18n } from 'vue-i18n';
  import { formatSeconds, formatTimestamp } from '@/utils';
  import { getToken } from '@/utils/auth';
  import sendIcon from '@/assets/icons/send.png';
  import MeetingDefaultIcon from '@/assets/svg/meeting/icon-default-meeting.svg';
  import recordDetailNoDataIcon from '@/assets/images/no_data/record/no_record_detail.png';

  import infoIcon1 from '@/assets/images/meeting/icon_info_1.svg';
  import infoIcon2 from '@/assets/images/meeting/icon_info_2.svg';
  import infoIcon3 from '@/assets/images/meeting/icon_info_3.svg';
  import infoIcon4 from '@/assets/images/meeting/icon_info_4.svg';
  import infoIcon5 from '@/assets/images/meeting/icon_info_5.svg';
  import infoIcon6 from '@/assets/images/meeting/icon_info_6.svg';

  import {
    useMeetingStore,
    useRecordStore,
    useCommonStore,
    useAddressStore,
  } from '@/store';
  import { Message } from '@arco-design/web-vue';

  const emit = defineEmits(['handleSendAssist']);

  const recordStore = useRecordStore();
  const commonStore = useCommonStore();
  const addressStore = useAddressStore();

  const { t, locale } = useI18n();
  const MeetingStore = useMeetingStore();

  const meetingDetail = ref({
    subject: '',
    meetingId: '',
    meetingNo: '',
    masterAvatarUrl: '',
    masterName: '',
    meetingDuration: 0,
    startTime: null,
    endTime: null,
    inviteMembers: [] as any,
    members: [] as any,
    summaryCount: 0,
    cloudVideoCount: 0,
    screenshotCount: 0,
    attachmentCount: 0,
    manualRecordCount: 0,
    chatMessageCount: 0,
  });

  // 协作资料-元素
  const collaborativeType: any = ref();
  const handleFormateData = () => {
    collaborativeType.value = [
      // {
      //   type: 1,
      //   icon: infoIcon1,
      //   title: t('meeting.detail.assist.zl.hyzy'),
      //   desc: t('meeting.detail.assist.zl.hyzy.en'),
      //   hasData: meetingDetail.value.summaryCount > 0,
      //   showNum: false,
      //   btn: ['look'],
      //   url: 'abstract',
      // },
      // {
      //   type: 2,
      //   icon: infoIcon2,
      //   title: t('meeting.detail.assist.zl.sphy'),
      //   desc: t('meeting.detail.assist.zl.sphy.en'),
      //   hasData: meetingDetail.value.cloudVideoCount > 0,
      //   showNum: false,
      //   btn: ['preview'],
      //   url: 'video',
      // },
      {
        type: 3,
        icon: infoIcon3,
        title: t('meeting.detail.assist.zl.hyzt'),
        desc: t('meeting.detail.assist.zl.hyzt.en'),
        hasData: meetingDetail.value.screenshotCount > 0,
        showNum: true,
        num: meetingDetail.value.screenshotCount,
        btn: ['preview'],
        url: 'capture',
      },
      {
        type: 4,
        icon: infoIcon4,
        title: t('meeting.detail.assist.zl.hywj'),
        desc: t('meeting.detail.assist.zl.hywj.en'),
        hasData: meetingDetail.value.attachmentCount > 0,
        showNum: true,
        num: meetingDetail.value.attachmentCount,
        btn: ['preview'],
        url: 'file',
      },
      {
        type: 5,
        icon: infoIcon5,
        title: t('meeting.detail.assist.zl.sdlx'),
        desc: t('meeting.detail.assist.zl.sdlx.en'),
        hasData: meetingDetail.value.manualRecordCount > 0,
        showNum: true,
        num: meetingDetail.value.manualRecordCount,
        btn: ['preview'],
        url: 'picture_recording',
      },
      {
        type: 6,
        icon: infoIcon6,
        title: t('meeting.detail.assist.zl.hyxx'),
        desc: t('meeting.detail.assist.zl.hyxx.en'),
        hasData: meetingDetail.value.chatMessageCount > 0,
        showNum: false,
        btn: ['look'],
        url: 'message',
      },
    ];
  };
  const handleCheck = (data: any, e: any) => {
    e.preventDefault();
    window.open(
      `${
        commonStore.platformConfig?.meetingDetailUrl
      }/AssistV3/meetingWH/views/${data.url}/index_pc.html?userClient=${
        ChatPB.Client.PC
      }&lang=${locale.value}&meetingId=${
        meetingDetail.value.meetingId
      }&token=${getToken()}`,
      '_blank'
    );
  };
  // const handlePreview = (e: any) => {
  //   e.preventDefault();
  //   console.log('preview');
  // };
  // const handleDownload = (e: any) => {
  //   e.preventDefault();
  //   console.log('download');
  // };
  const handleUpdateRoomPsn = () => {
    if (meetingDetail.value.members) {
      meetingDetail.value.members.forEach((member: any) => {
        const incomingMember = addressStore.memberList.find(
          (m: any) => m.userId === member.userId
        );
        if (incomingMember) {
          member.pcOnline = incomingMember.pcOnline;
          member.androidOnline = incomingMember.androidOnline;
          member.glassOnline = incomingMember.glassOnline;
        }
      });
      meetingDetail.value.members.sort((a: any, b: any) => {
        const aOnline = a.pcOnline || a.androidOnline || a.glassOnline ? 1 : 0;
        const bOnline = b.pcOnline || b.androidOnline || b.glassOnline ? 1 : 0;
        return bOnline - aOnline;
      });
    }
    if (meetingDetail.value.inviteMembers) {
      meetingDetail.value.inviteMembers.forEach((member: any) => {
        const incomingMember = addressStore.memberList.find(
          (m: any) => m.userId === member.userId
        );
        if (incomingMember) {
          member.pcOnline = incomingMember.pcOnline;
          member.androidOnline = incomingMember.androidOnline;
          member.glassOnline = incomingMember.glassOnline;
        }
      });
      meetingDetail.value.inviteMembers.sort((a: any, b: any) => {
        const aOnline = a.pcOnline || a.androidOnline || a.glassOnline ? 1 : 0;
        const bOnline = b.pcOnline || b.androidOnline || b.glassOnline ? 1 : 0;
        return bOnline - aOnline;
      });
    }
  };
  const handleGetDetail = async () => {
    const res: any = await MeetingStore.getMeetingRecordDetail({
      meetingId: recordStore.curMeeting?.meetingId,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      recordStore.updateNoRecordDetail(false);
      return;
    }
    meetingDetail.value = res.data;
    recordStore.updateNoRecordDetail(true);
    handleFormateData();
    handleUpdateRoomPsn();
  };
  const handleOpenAssist = () => {
    // 记录中，打开协助
    emit('handleSendAssist', meetingDetail.value);
  };

  watch(
    () => [locale, recordStore.curMeeting, addressStore.memberList],
    (newVal) => {
      if (newVal[0]) {
        handleFormateData();
      }
      if (newVal[1]) {
        handleGetDetail();
      }
      if (newVal[2]) {
        handleUpdateRoomPsn();
      }
    },
    { deep: true }
  );
</script>

<style scoped lang="less">
  .record-detail-container {
    width: 100%;
    height: 100%;
    .detail-panel {
      width: 100%;
      &-top {
        height: 64px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        &-title {
          &-left {
            flex-shrink: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #ebf3ff;
            border-radius: var(--border-radius-circle);
            img {
              flex-shrink: 0;
              width: 28px;
              height: 28px;
            }
          }
          &-right {
            max-width: 250px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            .meeting-title {
              font-weight: 500;
              font-size: 16px;
              color: var(--color-neutral-10);
              line-height: 1.2;
            }
            .meeting-number {
              font-weight: 400;
              font-size: 12px;
              color: var(--color-neutral-6);
              line-height: 1.2;
              margin-top: 2px;
            }
          }
        }
      }
      &-main {
        padding: 27px 20px 26px 12px;
        height: calc(100vh - 80px - 80px);
        overflow-y: scroll;

        /* 使用统一滚动条样式 */
        @extend .custom-scrollbar;
        .grid-card {
          padding: 10px 16px 14px;
          border-radius: var(--border-radius-medium);
          background-color: var(--color-neutral-2);
          :deep(.arco-card-body) {
            padding: 0;
          }
          .block-item-grid {
            width: 100%;
            height: 100%;
            .block-item-grid-top {
              min-height: 18px;
              span {
                font-weight: 400;
                font-size: 12px;
                color: var(--color-neutral-6);
              }
            }
            .block-item-grid-bot {
              min-height: 30px;
              display: flex;
              align-items: center;
              margin-top: 10px;
              &-icon {
                flex-shrink: 0;
                width: 30px;
                height: 30px;

                margin-right: 8px;
                img {
                  width: 100%;
                  height: 100%;
                  border-radius: var(--border-radius-circle);
                }
              }
              &-l {
                font-weight: 400;
                font-size: 16px;
                color: var(--color-text-1);
              }
            }
          }
        }
        .block-member {
          padding: 12px 15px;
          border: 1px solid var(--color-neutral-3);
          border-radius: var(--border-radius-medium);
          &-item {
            width: 100%;
            &-title {
              min-height: 18px;
              line-height: 18px;
              span {
                font-weight: 400;
                font-size: 12px;
                color: var(--color-neutral-6);
              }
            }
            &-main {
              width: 100%;
              display: flex;
              flex-wrap: wrap;
              &-i {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                margin: 10px;
                &-t {
                  flex-shrink: 0;
                  position: relative;
                  width: 30px;
                  height: 30px;
                  img {
                    width: 100%;
                    height: 100%;
                    border-radius: var(--border-radius-circle);
                  }
                  &-f {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    width: 10px;
                    height: 10px;
                    border-radius: var(--border-radius-circle);
                    border: 2px solid var(--color-neutral-2);
                    &.online {
                      background-color: #28c445;
                    }
                    &.outline {
                      background-color: #878787;
                    }
                  }
                }
                &-n {
                  margin-top: 2px;
                  min-height: 21px;
                  span {
                    font-weight: 400;
                    font-size: 14px;
                    color: var(--color-text-1);
                  }
                }
              }
            }
          }
        }
        .grid-card-data {
          &-main {
            padding: 23px 20px 30px;
            &-top {
              width: 100%;
              height: 48px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              &-left {
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;

                img {
                  width: 100%;
                  height: 100%;
                }
              }
              &-right {
                height: 100%;
                display: flex;
                justify-content: flex-end;
                &-num {
                  flex-shrink: 0;
                  height: 21px;
                  padding: 0 12px;
                  border-radius: 12px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background-color: rgb(var(--arcoblue-5));
                  span {
                    font-size: 14px;
                    color: var(--color-neutral-1);
                  }
                }
              }
            }
            &-bot {
              width: 100%;
              margin-top: 17px;
              &-top {
                min-height: 24px;
                display: flex;
                align-items: center;
                span {
                  font-weight: 500;
                  font-size: 16px;
                  color: var(--color-neutral-10);
                }
              }
              &-bot {
                margin-top: 2px;
                min-height: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                &-left {
                  span {
                    font-weight: 400;
                    font-size: 12px;
                    color: var(--color-neutral-6);
                  }
                }
                &-right {
                  display: flex;
                  align-items: center;
                  justify-content: flex-end;
                  span {
                    font-weight: 500;
                    font-size: 12px;
                    color: var(--color-neutral-6);
                  }
                  .arco-link {
                    font-size: 12px;
                  }
                }
              }
            }
          }
          :deep(.arco-card-body) {
            padding: 0;
          }
        }
      }
    }

    :deep(.arco-btn-icon) {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
