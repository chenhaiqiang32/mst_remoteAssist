<template>
  <div class="room-options-container">
    <div class="room-fixed" @click="handleClose">
      <img :src="closeIcon" alt="" />
    </div>
    <div class="room-options-header">
      <div class="room-options-h-t">
        <span>{{ t('meeting.room.option.meeting.name') }}</span>
      </div>

      <a-tooltip :content="roomOptions.meetingName">
        <div class="room-options-h-n textEllipsis">
          {{ roomOptions.meetingName }}
        </div>
      </a-tooltip>
      <div class="room-options-h-b">
        <span class="label"
          >{{ t('meeting.room.option.meeting.organizer') }}：</span
        >
        <span class="value">{{ roomOptions.organizer }}</span>
      </div>
    </div>
    <div class="room-options-main">
      <!-- 麦克风 -->
      <div class="room-options-m-i" @click="handleChangeAudio">
        <div class="room-options-m-it">
          <img
            :src="roomOptions.audio ? microphoneActiveIcon : microphoneIcon"
            alt=""
          />
        </div>
        <div class="room-options-m-ib text-ellipsis">
          {{ t('meeting.menu.mkf') }}
        </div>
      </div>
      <!-- 摄像头 -->
      <div class="room-options-m-i" @click="handleChangeVideo">
        <div class="room-options-m-it">
          <img :src="roomOptions.video ? videoActiveIcon : videoIcon" alt="" />
        </div>
        <div class="room-options-m-ib text-ellipsis">
          {{ t('meeting.menu.sxt') }}
        </div>
      </div>
      <!-- 扬声器 -->
      <div class="room-options-m-i" @click="handleChangeLoudspeaker">
        <div class="room-options-m-it">
          <img
            :src="roomOptions.loudspeaker ? volumeActiveIcon : volumeIcon"
            alt=""
          />
        </div>
        <div class="room-options-m-ib text-ellipsis">
          {{ t('meeting.menu.ysq') }}
        </div>
      </div>
      <!-- 云端录制 -->
      <!-- <div class="room-options-m-i" @click="handleChangeCloudRecord">
        <div class="room-options-m-it">
          <img
            :src="roomOptions.cloudRecord ? recordActiveIcon : recordIcon"
            alt=""
          />
        </div>
        <div class="room-options-m-ib text-ellipsis">
          {{ t('meeting.room.option.meeting.cloud.record') }}
        </div>
      </div> -->
    </div>
    <div class="room-options-b">
      <div class="room-options-bm">
        <!--        <div class="room-options-bl" @click="handleChangeAbstract">-->
        <!--          <img-->
        <!--            :src="roomOptions.abstract ? abstractIcon : abstractActiveIcon"-->
        <!--            alt=""-->
        <!--          />-->
        <!--        </div>-->
        <!-- <div class="room-options-br">
          <span>{{ t('meeting.room.option.meeting.abstract') }}</span>
          <div><a-switch v-model="roomOptions.abstract" size="small" /></div>
        </div> -->
      </div>
      <div class="room-options-bm">
        <!--        <div class="room-options-bl" @click="handleChangeTranslation">-->
        <!--          <img-->
        <!--            :src="roomOptions.escaping ? abstractIcon : abstractActiveIcon"-->
        <!--            alt=""-->
        <!--          />-->
        <!--        </div>-->
        <div class="room-options-br">
          <span>{{ t('meeting.room.option.meeting.abstract5') }}</span>
          <div><a-switch v-model="roomOptions.escaping" size="small" /></div>
        </div>
      </div>
    </div>
    <div class="schedule-checkbox schedule-checkbox-voice">
      <div class="ax" v-if="roomOptions.escaping">
        <div class="label">{{ $t('meeting.schedule.form.myLanguage') }}</div>
        <div>
          <a-select v-model="form.languageType" allow-search>
            <a-option
              class="st-img"
              :value="item.value"
              v-for="item in countryList"
              ><img :src="item.ctry" /><span>{{ item.label }}</span></a-option
            >
          </a-select>
        </div>
      </div>
      <div class="ax" v-if="roomOptions.escaping  && wordList.length > 0">
        <div class="label">{{ $t('meeting.schedule.form.thesaurus') }}</div>
        <div>
          <a-select v-model="form.industryType" :options="wordList" allow-search />
        </div>
      </div>
    </div>
    <div class="room-options-f">
      <a-button
        class="room-options-btn"
        type="primary"
        size="large"
        html-type="submit"
        long
        :loading="commonStore.btnLoading"
        @click="debouncedHandleInitiateMeeting"
      >
        <span>{{ t('meeting.room.option.meeting.initiate') }}</span>
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watchEffect } from 'vue';
  import { useMeetingStore, useCommonStore } from '@/store';
  import { debounce } from 'lodash-es';

  import closeIcon from '@/assets/options/icon_close.png';
  import microphoneIcon from '@/assets/options/icon_microphone_0.png';
  import microphoneActiveIcon from '@/assets/options/icon_microphone_1.png';
  import videoIcon from '@/assets/options/icon_video_0.png';
  import videoActiveIcon from '@/assets/options/icon_video_1.png';
  import volumeIcon from '@/assets/options/icon_volume_0.png';
  import volumeActiveIcon from '@/assets/options/icon_volume_1.png';
  import recordIcon from '@/assets/options/icon_record_0.png';
  import recordActiveIcon from '@/assets/options/icon_record_1.png';
  import abstractIcon from '@/assets/options/icon_select.png';
  import abstractActiveIcon from '@/assets/options/icon_select_no.png';
  import { useI18n } from 'vue-i18n';
  import { Message } from '@arco-design/web-vue';
  import EventListener from '@/utils/event-listener';
  import useThMeetingStore from '../../../../packages/store';
  const ThMeetingStore = useThMeetingStore();
  const meetingStore = useMeetingStore();
  const commonStore = useCommonStore();

  const emit = defineEmits(['handleClose', 'handleCall']);

  const { t, locale } = useI18n();
  const wordList = computed(() => {
    return meetingStore.industryList?.map((item) => {
      return {
        label: locale.value === 'zh-CN' ? item.value : item.english,
        value: item.label,
      }
    });
  });
  const countryList = computed(() => {
    return meetingStore.languageList?.map((item) => {
      return {
        ...item,
        label: locale.value === 'zh-CN' ? item.value : item.english,
        value: item.label,
        ctry: item.flagUrl,
      }
    });
  });

  const form = ref({
    languageType: 'cn',
    industryType: 'default',
  });
  watchEffect(() => {
    const isAliun = countryList.value?.some((v: any) => v.type === 'aliyun');
    if (isAliun) {
      form.value.languageType = 'zh';
    }
  })
  const roomOptions: any = ref({
    ...meetingStore.roomOptions,
    ...form.value,
  });
  const stream: any = ref(null);
  const handleCloseStream = () => {
    if (stream.value) {
      stream.value.getTracks().forEach((track: any) => track.stop());
      stream.value = null;
    }
  };
  const handleChangeAudio = async () => {
    roomOptions.value.audio = !roomOptions.value.audio;
    try {
      // 请求摄像头权限，但不使用视频流
      if (roomOptions.value.audio) {
        stream.value = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
      }
      handleCloseStream();
    } catch (err) {
      roomOptions.value.audio = false;
      Message.error(t('meeting.modal.option.devices.audio'));
    }
  };

  const handleChangeVideo = async () => {
    roomOptions.value.video = !roomOptions.value.video;
    try {
      // 请求摄像头权限，但不使用视频流
      if (roomOptions.value.video) {
        stream.value = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      }
      handleCloseStream();
    } catch (err) {
      roomOptions.value.video = false;
      Message.error(t('meeting.modal.option.devices.video'));
    }
  };
  const handleChangeLoudspeaker = () => {
    roomOptions.value.loudspeaker = !roomOptions.value.loudspeaker;
  };
  const handleChangeCloudRecord = () => {
    roomOptions.value.cloudRecord = !roomOptions.value.cloudRecord;
  };
  const handleChangeAbstract = () => {
    roomOptions.value.abstract = !roomOptions.value.abstract;
  };
  const handleChangeTranslation = () => {
    roomOptions.value.escaping = !roomOptions.value.escaping;
  };
  const handleClose = () => {
    handleCloseStream();
    emit('handleClose');
  };
  const handleInitiateMeeting = async () => {
    EventListener.emit('meeting-notification-close');
    if (commonStore.btnLoading) return;
    commonStore.updateBtnLoading(true);
    meetingStore.updateRoomOptions(roomOptions.value);
    ThMeetingStore.updateRoomTranslateInfo({
      ...roomOptions.value,
      ...form.value,
      open: roomOptions.value.escaping,
    })
    emit('handleCall');
  };
  const debouncedHandleInitiateMeeting = debounce(handleInitiateMeeting, 1000);
</script>

<style lang="less" scoped>
  .room-options-container {
    width: 100%;
    // height: 420px;
    background: #ffffff;
    border-radius: 8px;
    position: relative;
    .room-fixed {
      cursor: pointer;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 19px;
      right: 16px;
      background: #f4f6fd;
      img {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
      }
    }
    .room-options-header {
      width: 100%;
      padding: 39px 31px 27px;
      display: flex;
      flex-direction: column;
      align-items: center;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      .room-options-h-t {
        min-height: 22px;
        margin-bottom: 9px;
        span {
          font-weight: 500;
          font-size: 14px;
          color: #93a1c0;
        }
      }
      .room-options-h-n {
        min-height: 22px;
        margin-bottom: 25px;
        font-weight: 500;
        font-size: 20px;
        color: #3f485b;
        line-height: 22px;
      }
      .room-options-h-b {
        span {
          font-weight: 400;
          font-size: 14px;
          &.label {
            color: #93a1c0;
          }
          &.value {
            color: #3f485b;
          }
        }
      }
    }
    .room-options-main {
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 30px 43px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      margin-bottom: 15px;
      .room-options-m-i {
        width: calc(100% / 4 - 8px);
        cursor: pointer;
        margin: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .room-options-m-it {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f4f6fd;
          border-radius: 4px;
          margin-bottom: 7px;
          img {
            flex-shrink: 0;
            width: 24px;
            height: 24px;
          }
        }
        .room-options-m-ib {
          min-height: 22px;
          font-weight: 400;
          font-size: 14px;
          color: #3f485b;
          line-height: 22px;
        }
      }
    }
    .room-options-b {
      display: flex;
      flex-direction: column;
      gap: 15px;
      .room-options-bm {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 30px;
        .room-options-bl {
          cursor: pointer;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 9px;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .room-options-br {
          min-height: 22px;
          display: flex;
          align-items: center;
          width: 100%;
          justify-content: space-between;
          span {
            font-weight: 400;
            font-size: 14px;
            color: #000000;
            line-height: 22px;
          }
        }
      }
    }
    .room-options-f {
      width: 100%;
      // height: 88px;
      padding: 0 30px 30px;
      padding-top: 23px;
      .room-options-btn {
        cursor: pointer;
        width: 100%;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #165dff;
        border-radius: 4px;
        span {
          font-weight: 400;
          font-size: 14px;
          color: #ffffff;
        }
      }
    }
  }

  .text-ellipsis {
    overflow: hidden;
    white-space: nowrap;
    /*文字超出宽度则显示ellipsis省略号*/
    text-overflow: ellipsis;
  }
  .schedule-checkbox {
    padding: 0 30px;
    padding-top: 14px;
    &.schedule-checkbox-voice {
      .ax {
        width: 100%;
        .label {
          padding-bottom: 8px;
        }
      }
    }
    .bx {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .st-img {
    :deep(.arco-select-option-content) {
      img {
        width: 20px;
        height: 15px;
      }
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
</style>
