<template>
  <div class="chat-container">
    <div class="chat-c-t">
      <div class="chat-c-t-l">
        {{ t('mst.message.dropdown.title') }}({{ messages.length }})
      </div>
      <!--      <div class="chat-c-t-r" @click="handleClose">-->
      <!--        <img :src="messageCloseIcon" alt="close" />-->
      <!--      </div>-->
    </div>
    <div ref="chatContainer" class="chat-c-m wsl-scroll">
      <div
        v-for="(message, index) in messages?.sort((a: any, b: any) => a - b)"
        :key="`${message}_${index}`"
        :class="[
          'chat-c-m-i',
          message.sender === ThMeetingStore.mineInfo.userId
            ? 'my-message'
            : 'other-message',
        ]"
      >
        <div class="chat-c-m-i-i-l">
          <img :src="message.avatarUrl" alt="avatar" class="avatar" />
        </div>
        <div class="chat-c-m-i-r">
          <div class="chat-c-m-i-r-t">
            <span class="name">{{ message.name }}</span>
            <span class="time">{{ formatTime(message.timestamp) }}</span>
          </div>
          <div class="chat-c-m-i-r-m">
            {{ message.message }}
          </div>
        </div>
      </div>
    </div>
    <div class="chat-c-b">
      <div class="chat-c-b-text">
        <textarea
          v-model="newMessage"
          class="wsl-scroll"
          :maxlength="1000"
          :placeholder="t('mst.message.dropdown.input.placeholder')"
          @keydown="handleKeydown"
        ></textarea>
      </div>
      <div class="chat-c-b-send">
        <a-space>
          <img :src="messageSendIcon" alt="send" @click="sendMessage" />
          <img :src="messageExpandIcon" alt="expand" @click="handleClose" />
        </a-space>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, nextTick, onMounted, onBeforeUnmount, watchEffect } from 'vue';
  import { v4 as uuidv4 } from 'uuid';
  import dayjs from 'dayjs';

  import { isBoolean } from '@arco-design/web-vue/es/_utils/is';
  import * as PB from '../../../../proto/protocol';

  import useThMeetingStore from '../../../../store';
  import i18n from '../../../../locale/index';
  import messageCloseIcon from '../../assets/icons/icon_close.png';
  import messageSendIcon from '../../assets/icons/icon_send.png';
  import messageExpandIcon from '../../assets/icons/icon_expand.png';
  import IndexDBService from '../../../../utils/db';
  import THEventBus from '../../../../services/THEventBus';
  import msg from '../../../../services/msg';

  let messageDB: any;
  const emit = defineEmits(['handleClose']);
  interface Message {
    name: string;
    avatarUrl: string;
    message: string;
    meetingNo: string;
    type: number;
    fp: string;
    timestamp: number;
    sender: number;
  }
  const ThMeetingStore = useThMeetingStore();
  const { t } = i18n.global;
  const messages = ref<Message[]>([]);
  const newMessage: any = ref('');
  const chatContainer = ref<HTMLElement | null>(null);

  const formatTime = (timestamp: number) => {
    const now = dayjs();
    const inputDate = dayjs(timestamp);
    // 判断是否是今天
    if (now.isSame(inputDate, 'day')) {
      return inputDate.format('HH:mm');
    }
    return inputDate.format('YYYY-MM-DD HH:mm');
  };
  const handleScrollBottom = () => {
    // 滚动到最底部
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTo({
          top: chatContainer.value.scrollHeight,
          behavior: 'smooth',
        });
      }
    });
  };

  const sendMessage = async () => {
    try {
      if (newMessage.value.trim() !== '') {
        const message = {
          name: ThMeetingStore.mineInfo.name,
          avatarUrl: ThMeetingStore.mineInfo.avatarUrl,
          meetingNo: ThMeetingStore.meetingInfo.meetingNo,
          message: newMessage.value,
          type: PB.MessageType.TEXT,
          fp: uuidv4(),
          timestamp: Date.now(),
          sender: ThMeetingStore.mineInfo.userId,
        };
        if (!ThMeetingStore.assistNetworkStatus) {
          msg.error(t('mst.message.network.error'));
          return;
        }
        await messageDB.addChatSession(message);
        messages.value.push(message);
        ThMeetingStore.ThImEvent.sendAssistChatMessageSendEvent({
          meetingNo: ThMeetingStore.meetingInfo.meetingNo,
          type: PB.MessageType.TEXT,
          message: newMessage.value,
        });
        newMessage.value = '';
        handleScrollBottom();
      }
    } catch (error) {
      console.error('Error adding chat session:', error);
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      newMessage.value += '\n';
    } else if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };
  const handleClose = () => {
    emit('handleClose');
  };
  const handleGetAllMessage = async () => {
    try {
      if (messageDB) {
        console.log('handleGetAllMessage-messageDB', messageDB);
        messages.value = await messageDB.getAllChatSessions();
        handleScrollBottom();
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };
  const handleInitMessageDB = async () => {
    messageDB = new IndexDBService();
    handleGetAllMessage();
  };
  const handleMonitorEvent = () => {
    THEventBus.on('updateChatMessage', handleGetAllMessage);
  };
  const handleClearMonitorEvent = () => {
    THEventBus.off('updateChatMessage', handleGetAllMessage);
  };

  onMounted(async () => {
    handleMonitorEvent();
  });
  onBeforeUnmount(() => {
    handleClearMonitorEvent();
  });
  watchEffect(() => {
    if (isBoolean(ThMeetingStore.meetingPersonListInfo.visible)) {
      handleInitMessageDB();
    }
  });
</script>

<style lang="less" scoped>
  .chat-container {
    height: 100%;
    cursor: auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow: hidden;
    .chat-c-t {
      width: 100%;
      height: 36px;
      padding: 0 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom: 1px solid #eaeaea;
      .chat-c-t-l {
        font-weight: 400;
        font-size: 12px;
        color: #9ca3af;
      }
      .chat-c-t-r {
        cursor: pointer;
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
    .chat-c-m {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      .chat-c-m-i {
        display: flex;
        margin-bottom: 32px;
        .chat-c-m-i-i-l {
          width: 24px;
          margin-right: 12px;
          .avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
          }
        }
        .chat-c-m-i-r {
          max-width: calc(100% - 40px);
          .chat-c-m-i-r-t {
            height: 18px;
            margin-bottom: 4px;
            font-weight: 400;
            font-size: 12px;
            color: #6b7280;
            display: flex;
            align-items: center;
            .name {
              margin-right: 8px;
            }
          }
          .chat-c-m-i-r-m {
            max-width: 100%;
            width: fit-content;
            padding: 8px 12px;
            background: #f4f4f4;
            border-radius: 8px;
            border: 1px solid #eeeeee;
            font-weight: 400;
            font-size: 14px;
            color: #6b7280;
            word-wrap: break-word;
            text-align: left;
            line-height: 17px;
            white-space: pre-wrap; /* 自动换行 */
          }
        }
        &.my-message {
          flex-direction: row-reverse;
          .chat-c-m-i-r {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
          .chat-c-m-i-i-l {
            margin-right: 0;
            margin-left: 12px;
          }
          .chat-c-m-i-r-t {
            flex-direction: row-reverse;
            .name {
              margin-left: 8px;
            }
          }
          .chat-c-m-i-r-m {
            max-width: 100%;
            text-align: right;
            background: rgba(45, 140, 255, 0.1);
            border: 1px solid rgba(45, 140, 255, 0.1);
          }
        }
      }
    }
    .chat-c-b {
      height: 100px;
      padding: 16px 16px 8px;
      position: relative;
      border-top: 1px solid #eaeaea;

      .chat-c-b-text {
        width: 100%;
        textarea {
          cursor: auto;
          all: unset;
          width: 100%;
          resize: none; /* 禁止用户调整大小 */
          font-size: 14px;
          word-wrap: break-word;
          color: #6b7280;
          line-height: 17px;
          overflow-x: hidden;
          overflow-y: auto;
        }
      }
      .chat-c-b-send {
        height: 40px;
        position: absolute;
        cursor: pointer;
        right: 16px;
        bottom: 10px;
        img {
          width: 40px;
        }
      }
    }
  }
</style>
