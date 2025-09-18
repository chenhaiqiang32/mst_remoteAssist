<template>
  <div class="room-join-options-container">
    <div class="room-options-c">
      <div class="room-fixed" @click="handleClose">
        <img :src="closeIcon" alt="" />
      </div>
      <div class="room-options-header">
        <div class="room-options-h-t">
          <span>{{ t('meeting.menu.jrhy') }}</span>
        </div>
        <div class="room-options-h-n">
          <div class="room-options-h-n-t">
            <span>{{ t('meeting.qr.code.modal.desc') }}</span>
            <span class="required">*</span>
          </div>
          <a-input
            v-model="roomOptions.meetingNo"
            :placeholder="t('meeting.room.option.meeting.join.title')"
            @input="handleClearSpace"
          ></a-input>
          <!-- <a-verification-code
            v-model="roomOptions.meetingNo"
            :length="9"
            @finish="handleVerificationFinish"
            @change="handleChanging"
          /> -->
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
            <img
              :src="roomOptions.video ? videoActiveIcon : videoIcon"
              alt=""
            />
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
      <div class="room-options-f">
        <div
          class="room-options-btn"
          :class="roomOptions.meetingNo ? 'active' : ''"
          @click="debounceJoinMeeting"
        >
          <span>{{ t('meeting.room.option.meeting.join') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useMeetingStore } from '@/store';
  import { debounce } from 'lodash-es';
  import { useI18n } from 'vue-i18n';

  import closeIcon from '@/assets/options/icon_close.png';
  import microphoneIcon from '@/assets/options/icon_microphone_0.png';
  import microphoneActiveIcon from '@/assets/options/icon_microphone_1.png';
  import videoIcon from '@/assets/options/icon_video_0.png';
  import videoActiveIcon from '@/assets/options/icon_video_1.png';
  import volumeIcon from '@/assets/options/icon_volume_0.png';
  import volumeActiveIcon from '@/assets/options/icon_volume_1.png';

  import { Message } from '@arco-design/web-vue';
  import EventListener from '@/utils/event-listener';

  const meetingStore = useMeetingStore();

  const emit = defineEmits(['handleClose', 'handleJoinMeeting']);
  const { t } = useI18n();

  const isFinished = ref<boolean>(false);

  const roomOptions: any = ref({
    ...meetingStore.roomOptions,
    meetingNo: '',
  });
  const stream: any = ref(null);
  const handleCloseStream = () => {
    if (stream.value) {
      stream.value.getTracks().forEach((track: any) => track.stop());
      stream.value = null;
    }
  };
  const handleClose = () => {
    handleCloseStream();
    roomOptions.value.meetingNo = '';
    emit('handleClose');
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
      roomOptions.value.video = !roomOptions.value.video;
      Message.error(t('meeting.modal.option.devices.video'));
    }
  };
  const handleChangeLoudspeaker = () => {
    roomOptions.value.loudspeaker = !roomOptions.value.loudspeaker;
  };
  const handleClearSpace = () => {
    console.log('handleClearSpace', roomOptions.value.meetingNo);
    roomOptions.value.meetingNo = roomOptions.value.meetingNo.replace(
      /\s+/g,
      ''
    );
  };
  const handleInitiateMeeting = async () => {
    if (!roomOptions.value.meetingNo) {
      return;
    }
    EventListener.emit('meeting-notification-close');
    meetingStore.updateRoomOptions(roomOptions.value);
    emit('handleJoinMeeting', {
      meetingNo: roomOptions.value.meetingNo,
    });
  };
  const debounceJoinMeeting = debounce(handleInitiateMeeting, 1000);
</script>

<style scoped lang="less">
  .room-join-options-container {
    width: 100%;
    background: #ffffff;
    border-radius: 8px;
    position: relative;
    .room-options-c {
      width: 100%;
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
        padding: 19px 31px 27px;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        .room-options-h-t {
          min-height: 22px;
          margin-bottom: 9px;
          span {
            font-weight: 500;
            font-size: 20px;
            color: var(--color-neutral-10);
          }
        }
        .room-options-h-n {
          width: 100%;
          font-weight: 500;
          font-size: 12px;
          color: #3f485b;
          margin-top: 4px;
          .room-options-h-n-t {
            margin-bottom: 12px;
            span {
              font-weight: 400;
              font-size: 14px;
              color: #3f485b;
              &.required {
                color: #f65160;
              }
            }
          }
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
        padding: 53px 43px;
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
        align-items: center;
        justify-content: center;

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
          background: rgba(123, 136, 165, 0.46);
          border-radius: 4px;
          span {
            font-weight: 400;
            font-size: 14px;
            color: #ffffff;
          }
          &.active {
            background: #165dff;
            span {
              color: #ffffff;
            }
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
  }
</style>
