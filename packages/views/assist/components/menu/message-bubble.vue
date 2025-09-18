<script setup lang="ts">
  import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watchEffect,
  } from 'vue';
  import { v4 as uuidv4 } from 'uuid';
  import i18n from '../../../../locale';
  import IconComment from '../../assets/icons/icon_comment.png';
  import SendBubble from '../../assets/icons/icon_send_bubble.png';
  import useThMeetingStore from '../../../../store';
  import * as PB from '../../../../proto/protocol';
  import msg from '../../../../services/msg';
  import IndexDBService from '../../../../utils/db';
  import THEventBus from '../../../../services/THEventBus';

  let messageDB: any;
  let timer: any = null;
  const ThMeetingStore = useThMeetingStore();
  const newMessage = ref('');
  const messages = ref<any[]>([]);
  const chatContainer = ref<HTMLDivElement>(null);
  const { t } = i18n.global;
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
    clearTimeout(timer);
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
        // 同步三秒后清空消息列表
        timer = setTimeout(() => {
          // ThMeetingStore.removeCurrentMessageList();
          messages.value = [];
          clearTimeout(timer);
        }, 1000 * 3);
      }
    } catch (error) {
      console.error('Error adding chat session:', error);
    }
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
    // handleGetAllMessage();
  };
  // const handleMonitorEvent = () => {
  //   THEventBus.on('updateChatMessage', handleGetAllMessage);
  // };
  // const handleClearMonitorEvent = () => {
  //   THEventBus.off('updateChatMessage', handleGetAllMessage);
  // };
  onMounted(async () => {
    handleInitMessageDB();
    // handleMonitorEvent();
  });
  onBeforeUnmount(() => {
    // handleClearMonitorEvent();
  });
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      newMessage.value += '\n';
    } else if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };
  // 当前消息和右侧抽屉全部消息列表合并
  const allMessagesList = computed(() => {
    return [...messages.value, ...ThMeetingStore.currentMessageList];
  });
  defineExpose({
    allMessagesList,
  });
</script>

<template>
  <div class="bubble-message-content">
    <!-- 左下角实时消息 -->
    <div
      v-show="allMessagesList && allMessagesList.length > 0"
      ref="chatContainer"
      class="th-ma-message-tips wsl-scroll"
    >
      <div
        v-for="(message, index) in allMessagesList"
        :key="`cur_message_${index}`"
        class="th-ma-message-tips-item"
      >
        <div class="th-ma-message-tips-item-left">
          <span>{{ message.name }}：</span>
        </div>
        <div class="th-ma-message-tips-item-right textEllipsis">
          {{ message.message }}
        </div>
      </div>
    </div>
    <div class="bubble-input">
      <a-input
        v-model="newMessage"
        :placeholder="t('mst.menu.input')"
        @keydown="handleKeydown"
      >
        <template #prepend>
          <img :src="IconComment" alt="" />
        </template>
        <template #suffix>
          <img :src="SendBubble" @click.stop.prevent="sendMessage" />
        </template>
      </a-input>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .bubble-message-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: end;
    .th-ma-message-tips {
      margin-bottom: 20px;
      width: 250px;
      max-height: 100%;
      height: auto;
      z-index: 10;
      display: flex;
      flex-direction: column;
      .th-ma-message-tips-item {
        flex-shrink: 0;
        width: fit-content;
        max-width: 100%;
        display: flex;
        background: rgba(23, 32, 46, 0.76);
        border-radius: 49px;
        justify-content: flex-start;
        padding: 7px 15px;
        margin-top: 7px;
        .th-ma-message-tips-item-left {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          span {
            color: #ff6715;
            font-size: 14px;
          }
        }
        .th-ma-message-tips-item-right {
          width: fit-content;
          max-width: 120px;
          flex-shrink: 0;
          color: #d1d5db;
          font-size: 14px;
        }
      }
    }
    .bubble-input {
      :deep(.arco-input-outer) {
        height: 36px;
        & > :last-child {
          border-top-right-radius: 88px;
          border-bottom-right-radius: 88px;
        }
      }
      :deep(.arco-input-suffix) {
        cursor: pointer;
      }
      :deep(.arco-input-prepend) {
        border: none;
        border-radius: 0;
        border-top-left-radius: 88px;
        border-bottom-left-radius: 88px;
        background: rgba(23, 32, 46, 0.76);
        img {
          width: 24px;
        }
      }
      :deep(.arco-input-wrapper) {
        background: rgba(23, 32, 46, 0.76);
        color: #8d8f98;
        padding-left: 0;
        padding-right: 2px;
        &.arco-input-focus {
          border-color: transparent;
        }
      }
    }
  }
</style>
