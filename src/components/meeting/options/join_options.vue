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
    </div>
    <!-- <div class="room-options-b">
      <div class="room-options-br">
        <span>
          {{
            roomOptions.cloudRecord
              ? t('meeting.room.option.meeting.abstract3')
              : t('meeting.room.option.meeting.abstract4')
          }}</span
        >
      </div>
      <div class="room-options-br">
        <span>
          {{
            roomOptions.abstract
              ? t('meeting.room.option.meeting.abstract1')
              : t('meeting.room.option.meeting.abstract2')
          }}</span
        >
      </div>
    </div> -->
    <div class="room-options-f">
      <div class="room-options-btn" @click="debounceJoinMeeting">
        <span>{{ t('meeting.room.option.meeting.join') }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  import { debounce } from 'lodash-es';
  import { useMeetingStore } from '@/store';

  import closeIcon from '@/assets/options/icon_close.png';
  import microphoneIcon from '@/assets/options/icon_microphone_0.png';
  import microphoneActiveIcon from '@/assets/options/icon_microphone_1.png';
  import videoIcon from '@/assets/options/icon_video_0.png';
  import videoActiveIcon from '@/assets/options/icon_video_1.png';
  import volumeIcon from '@/assets/options/icon_volume_0.png';
  import volumeActiveIcon from '@/assets/options/icon_volume_1.png';

  import { useI18n } from 'vue-i18n';
  import { Message } from '@arco-design/web-vue';
  import EventListener from '@/utils/event-listener';

  const meetingStore = useMeetingStore();

  const emit = defineEmits(['handleClose', 'handleJoinMeeting']);

  const { t } = useI18n();

  const roomOptions: any = ref({
    ...meetingStore.roomOptions,
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
      } else {
        handleCloseStream();
      }
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
      roomOptions.value.video = !roomOptions.value.video;
      Message.error(t('meeting.modal.option.devices.video'));
    }
  };
  const handleChangeLoudspeaker = () => {
    roomOptions.value.loudspeaker = !roomOptions.value.loudspeaker;
  };

  const handleClose = () => {
    handleCloseStream();
    emit('handleClose');
  };

  const handleJoinMeeting = async () => {
    EventListener.emit('meeting-notification-close');
    meetingStore.updateRoomOptions(roomOptions.value);
    emit('handleJoinMeeting', {
      meetingNo: roomOptions.value.meetingNo,
    });
  };
  const debounceJoinMeeting = debounce(handleJoinMeeting, 300);
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
      align-items: center;
      justify-content: center;
      margin-bottom: 23px;

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
        span {
          font-weight: 400;
          font-size: 14px;
          color: #000000;
          line-height: 22px;
        }
      }
    }
    .room-options-f {
      width: 100%;
      // height: 88px;
      padding: 0 30px 30px;
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
</style>
