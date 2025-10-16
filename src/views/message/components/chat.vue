<template>
  <a-card
    class="general-card chat-panel"
    :bordered="false"
    :body-style="{
      height: '100%',
      display: 'flex',
      padding: 0,
      flexFlow: 'column',
    }"
  >
    <div class="chat-panel-top">
      <div class="chat-panel-top-left">
        <span>{{ $t('message.chat.title') }}</span>
      </div>
      <div class="chat-panel-top-right">
        <a-input-search
          v-model="searchOptions.condition"
          :style="{ width: '100%' }"
          :placeholder="$t('message.chat.search')"
          @input="handleSearchMessage"
        />
      </div>
    </div>
    <a-divider :margin="0" />
    <template v-if="conversationList && conversationList.length > 0">
      <div class="chat-panel-content wsl-scroll">
        <div
          v-for="(item, index) in conversationList"
          :key="`group_${index}`"
          class="chat-panel-content-item"
          :class="
            chatStore.curConversation?.conversationId === item.conversationId
              ? 'active'
              : ''
          "
          @click="handleSelectConversation(item)"
        >
          <div class="chat-panel-content-item-left">
            <img :src="item.targetAvatarUrl" alt="" />
          </div>
          <div class="chat-panel-content-item-right" fill>
            <div class="chat-panel-content-item-right-top">
              <div class="chat-panel-content-item-right-top-name textEllipsis">
                {{ item.targetName }}
              </div>
              <div class="chat-panel-content-item-right-top-time">
                {{ formatTimeGroup(item.sendTime) }}
              </div>
            </div>
            <div class="chat-panel-content-item-right-bot">
              <div class="chat-panel-content-item-right-bot-left">
                {{ showContent(item) }}
              </div>
              <div
                v-if="item.unreadCount > 0"
                class="chat-panel-content-item-right-bot-right"
              >
                <span>{{ item.unreadCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="no-data">
      <div class="no-data-body">
        <img :src="chatNoDataIcon" alt="" />
        <div class="no-data-body-text"> {{ $t('meeting.no.data.text') }} </div>
      </div>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
  import { onMounted, onBeforeUnmount, ref, watch } from 'vue';
  import { ObjectTrans, objToArrForKey } from '@/utils';
  import dayjs from 'dayjs';
  import { useI18n } from 'vue-i18n';
  import EventListener from '@/utils/event-listener';
  import { useChatStore, useAddressStore } from '@/store';
  import { useChatIndexedDB } from '@/utils/sdk/chatDB';
  import * as ChatPB from '@/utils/proto/chatProtocol';
  import chatNoDataIcon from '@/assets/images/no_data/message/no_chat.png';

  const dbName = 'ChatDB';
  const { getAllConversations, updateConversations } = useChatIndexedDB(dbName);

  const chatStore = useChatStore();
  const addressStore = useAddressStore();
  const conversationList: any = ref(chatStore.conversationList);

  const { t } = useI18n();
  const searchOptions = ref({
    condition: '',
  });
  const showContent = (data) => {
    const { messageType, content, name, targetName } = data;

    try {
      if (messageType === ChatPB.MessageType.SYSTEM) {
        const newContent = JSON.parse(content);
        const { eventType, eventData } = newContent;

        switch (eventType) {
          case ChatPB.EventType.CHAT_GROUP_CREATED: {
            const masterName =
              eventData.masterName ||
              addressStore.filterMemberInfoByUserId(eventData.masterId).name;
            const names =
              eventData.names ||
              objToArrForKey(
                eventData.userIds
                  .map((userId) =>
                    addressStore.memberList.find(
                      (user) => user.userId === userId
                    )
                  )
                  .filter(Boolean),
                'name'
              ).join('、');
            return `${masterName} ${t(
              'message.invite.join.group.menu.invite'
            )} ${names} ${t('message.chat.room.message.tips.create.group2')}`;
          }

          case ChatPB.EventType.CHAT_GROUP_INFO_UPDATED: {
            const updatedName =
              eventData.updatedName ||
              addressStore.filterMemberInfoByUserId(eventData.updateUserId)
                .name;
            return `${updatedName} ${t(
              'message.chat.room.message.tips.update.group'
            )}`;
          }

          case ChatPB.EventType.CHAT_GROUP_MEMBER_INVITED: {
            const invitorName =
              eventData.invitorName ||
              addressStore.filterMemberInfoByUserId(eventData.invitorUserId)
                .name;
            const inviteeNames =
              eventData.inviteeNames ||
              objToArrForKey(
                eventData.inviteeUserIds
                  .map((userId) =>
                    addressStore.memberList.find(
                      (user) => user.userId === userId
                    )
                  )
                  .filter(Boolean),
                'name'
              ).join('、');
            return `${invitorName} ${t(
              'message.chat.room.message.tips.invite.group'
            )} ${inviteeNames} ${t(
              'message.chat.room.message.tips.invite.group2'
            )}`;
          }

          case ChatPB.EventType.CHAT_GROUP_MEMBER_REMOVED: {
            const masterName =
              eventData.masterName ||
              addressStore.filterMemberInfoByUserId(eventData.masterId).name;
            const removedNames =
              eventData.removedNames ||
              objToArrForKey(
                eventData.removedUserIds
                  .map((userId) =>
                    addressStore.memberList.find(
                      (user) => user.userId === userId
                    )
                  )
                  .filter(Boolean),
                'name'
              ).join('、');
            return `${masterName} ${t(
              'message.chat.room.message.tips.remove.group'
            )} ${removedNames}`;
          }

          case ChatPB.EventType.CHAT_GROUP_MEMBER_QUIT: {
            const quitName =
              eventData.quitName ||
              addressStore.filterMemberInfoByUserId(eventData.quitUserId).name;
            return `${quitName} ${t(
              'message.chat.room.message.tips.quit.group'
            )}`;
          }

          case ChatPB.EventType.CHAT_GROUP_MASTER_CHANGED: {
            const oldMasterName =
              eventData.oldMasterName ||
              addressStore.filterMemberInfoByUserId(eventData.oldMasterId).name;
            const newMasterName =
              eventData.newMasterName ||
              addressStore.filterMemberInfoByUserId(eventData.newMasterId).name;
            return `${oldMasterName} ${t(
              'message.chat.room.message.tips.change.group'
            )} ${newMasterName}`;
          }

          case ChatPB.EventType.CHAT_GROUP_DISBANDED: {
            const masterName =
              eventData.masterName ||
              addressStore.filterMemberInfoByUserId(eventData.masterId).name;
            return `${masterName} ${t(
              'message.chat.room.message.tips.disbanded.group'
            )}`;
          }

          default:
            return newContent;
        }
      } else {
        // 处理文本、图片、音频等其他消息类型
        return content;
      }
    } catch (error) {
      // 如果解析失败，则返回原始内容
      return `${name} 邀请 ${targetName} 加入了群聊`;
    }
  };

  // const showContent = (data: any) => {
  //   // 提取消息类型和内容
  //   const { messageType, content } = data;
  //   // 处理不同的消息类型
  //   switch (messageType) {
  //     case ChatPB.MessageType.SYSTEM:
  //       try {
  //         const newContent = JSON.parse(content);
  //         const { eventType, eventData } = newContent;
  //         // 根据事件类型生成不同的返回内容
  //         switch (eventType) {
  //           case ChatPB.EventType.CHAT_GROUP_CREATED: {
  //             let masterName: any;
  //             if (!eventData.masterName) {
  //               const member = addressStore.filterMemberInfoByUserId(
  //                 eventData.masterId
  //               );
  //               masterName = member.name;
  //             } else {
  //               masterName = eventData.masterName;
  //             }
  //             let names: any;
  //             if (!eventData.names) {
  //               const result = eventData.userIds
  //                 .map((userId: any) =>
  //                   addressStore.memberList.find(
  //                     (user: any) => user.userId === userId
  //                   )
  //                 )
  //                 .filter(Boolean);
  //               names = objToArrForKey(result, 'name').join('、');
  //             } else {
  //               names = eventData.names;
  //             }
  //             return `${masterName} ${t(
  //               'message.invite.join.group.menu.invite'
  //             )} ${names} ${t('message.chat.room.message.tips.create.group2')}`;
  //           }

  //           case ChatPB.EventType.CHAT_GROUP_INFO_UPDATED: {
  //             let updatedName: any;
  //             if (!eventData.updatedName) {
  //               const member = addressStore.filterMemberInfoByUserId(
  //                 eventData.updateUserId
  //               );
  //               updatedName = member.name;
  //             } else {
  //               updatedName = eventData.updatedName;
  //             }
  //             return `${updatedName} ${t(
  //               'message.chat.room.message.tips.update.group'
  //             )}`;
  //           }

  //           case ChatPB.EventType.CHAT_GROUP_MEMBER_INVITED: {
  //             let invitorName: any;
  //             if (!eventData.invitorName) {
  //               const member = addressStore.filterMemberInfoByUserId(
  //                 eventData.invitorUserId
  //               );
  //               invitorName = member.name;
  //             } else {
  //               invitorName = eventData.invitorName;
  //             }
  //             let inviteeNames: any;
  //             if (!eventData.inviteeNames) {
  //               const result = eventData.inviteeUserIds
  //                 .map((userId: any) =>
  //                   addressStore.memberList.find(
  //                     (user: any) => user.userId === userId
  //                   )
  //                 )
  //                 .filter(Boolean);
  //               inviteeNames = objToArrForKey(result, 'name').join('、');
  //             } else {
  //               inviteeNames = eventData.inviteeNames;
  //             }
  //             return `${invitorName} ${t(
  //               'message.chat.room.message.tips.invite.group'
  //             )} ${inviteeNames} ${t(
  //               'message.chat.room.message.tips.invite.group2'
  //             )}`;
  //           }

  //           case ChatPB.EventType.CHAT_GROUP_MEMBER_REMOVED: {
  //             let masterName: any;
  //             if (!eventData.masterName) {
  //               const member = addressStore.filterMemberInfoByUserId(
  //                 eventData.masterId
  //               );
  //               masterName = member.name;
  //             } else {
  //               masterName = eventData.masterName;
  //             }
  //             let removedNames: any;
  //             if (!eventData.removedNames) {
  //               const result = eventData.removedUserIds
  //                 .map((userId: any) =>
  //                   addressStore.memberList.find(
  //                     (user: any) => user.userId === userId
  //                   )
  //                 )
  //                 .filter(Boolean);
  //               removedNames = objToArrForKey(result, 'name').join('、');
  //             } else {
  //               removedNames = eventData.removedNames;
  //             }
  //             return `${masterName} ${t(
  //               'message.chat.room.message.tips.remove.group'
  //             )} ${removedNames}`;
  //           }
  //           case ChatPB.EventType.CHAT_GROUP_MEMBER_QUIT: {
  //             let quitName: any;
  //             if (!eventData.quitName) {
  //               const member = addressStore.filterMemberInfoByUserId(
  //                 eventData.quitUserId
  //               );
  //               quitName = member.name;
  //             } else {
  //               quitName = eventData.quitName;
  //             }
  //             return `${quitName} ${t(
  //               'message.chat.room.message.tips.quit.group'
  //             )}`;
  //           }

  //           case ChatPB.EventType.CHAT_GROUP_MASTER_CHANGED: {
  //             let oldMasterName: any;
  //             if (!eventData.oldMasterName) {
  //               const member = addressStore.filterMemberInfoByUserId(
  //                 eventData.oldMasterId
  //               );
  //               oldMasterName = member.name;
  //             } else {
  //               oldMasterName = eventData.oldMasterName;
  //             }
  //             let newMasterName: any;
  //             if (!eventData.newMasterName) {
  //               const member = addressStore.filterMemberInfoByUserId(
  //                 eventData.newMasterId
  //               );
  //               newMasterName = member.name;
  //             } else {
  //               newMasterName = eventData.newMasterName;
  //             }
  //             return `${oldMasterName} ${t(
  //               'message.chat.room.message.tips.change.group'
  //             )} ${newMasterName}`;
  //           }

  //           case ChatPB.EventType.CHAT_GROUP_DISBANDED: {
  //             let masterName: any;
  //             if (!eventData.masterName) {
  //               const member = addressStore.filterMemberInfoByUserId(
  //                 eventData.masterId
  //               );
  //               masterName = member.name;
  //             } else {
  //               masterName = eventData.masterName;
  //             }
  //             return `${masterName} ${t(
  //               'message.chat.room.message.tips.disbanded.group'
  //             )}`;
  //           }

  //           default:
  //             // 处理未知的系统事件类型
  //             return newContent;
  //         }
  //       } catch (error) {
  //         return content;
  //       }
  //     case ChatPB.MessageType.TEXT:
  //     case ChatPB.MessageType.IMAGE:
  //     case ChatPB.MessageType.AUDIO:
  //     case ChatPB.MessageType.VIDEO:
  //     case ChatPB.MessageType.FILE:
  //     case ChatPB.MessageType.UNRECOGNIZED:
  //       // 处理其他类型消息
  //       return content;

  //     default:
  //       // 处理未知的消息类型
  //       // console.warn('Unrecognized message type:', messageType);
  //       return content;
  //   }
  // };

  const formatTimeGroup = (timestamp: number) => {
    const now = dayjs();
    const date = dayjs(timestamp);

    const formattedDateTime = date.format('YYYY-MM-DD HH:mm');

    if (date.isSame(now, 'day')) {
      return `${t('today')} ${date.format('HH:mm')}`;
    }
    if (date.isSame(now.add(1, 'day'), 'day')) {
      return `${t('tomorrow')} ${date.format('HH:mm')}`;
    }
    if (date.isSame(now.subtract(1, 'day'), 'day')) {
      return `${t('yesterday')} ${date.format('HH:mm')}`;
    }
    return formattedDateTime;
  };
  const handleGetConversationList = async () => {
    conversationList.value = await getAllConversations();
    chatStore.updateConversationList(conversationList.value);
    console.log('handleGetConversationList1', conversationList.value);
  };
  const handleFilterConversationList = () => {
    if (!searchOptions.value.condition) {
      return chatStore.conversationList;
    }
    const searchQuery = searchOptions.value.condition.toLowerCase();
    return chatStore.conversationList.filter(
      (message: any) =>
        message.targetName.toLowerCase().includes(searchQuery) ||
        message.content.toLowerCase().includes(searchQuery)
    );
  };
  const handleSearchMessage = () => {
    conversationList.value = handleFilterConversationList();
  };
  const handleConversationContainer = () => {
    if (chatStore.groupChatSettingVisible) {
      chatStore.updateGroupChatSettingVisible(false);
    }
  };
  const handleSelectConversation = async (data: any) => {
    if (data) {
      data.unreadCount = 0;
      updateConversations(data);
      chatStore.updateCurConversation(ObjectTrans(data));
      EventListener.emit('ChatConversationRead', data);
    }
    // 关闭会话中其他业务
    handleConversationContainer();
  };
  const handleExitGroupChat = () => {
    handleSelectConversation(chatStore.curConversation);
  };
  const handleMonitorEvent = () => {
    EventListener.on('group-info-change', handleGetConversationList);
    EventListener.on('send-refresh-chat-room', handleGetConversationList);
    EventListener.on('event-exit-group-chat', handleExitGroupChat);
    EventListener.on('event-disband-group-chat', handleExitGroupChat);
  };
  const handleClearMonitorEvent = () => {
    EventListener.off('group-info-change', handleGetConversationList);
    EventListener.off('send-refresh-chat-room', handleGetConversationList);
    EventListener.off('event-exit-group-chat', handleExitGroupChat);
    EventListener.off('event-disband-group-chat', handleExitGroupChat);
  };
  watch(
    () => chatStore.conversationList,
    () => {
      handleSearchMessage();
    },
    { deep: true, immediate: true }
  );
  onMounted(async () => {
    handleGetConversationList();
    handleMonitorEvent();
  });
  onBeforeUnmount(() => {
    handleClearMonitorEvent();
  });
</script>

<style lang="less" scoped>
  .chat-panel {
    display: flex;
    flex-direction: column;
    height: 100%;

    &-top {
      flex-shrink: 0;
      height: 64px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &-left {
        margin-right: 18px;
        span {
          font-weight: 500;
          font-size: 16px;
          color: var(--color-neutral-10);
        }
      }
      &-right {
        flex: 1;
      }
    }
    &-content {
      margin: 12px 0;
      height: calc(100vh - 64px - 24px - 80px);
      overflow-y: scroll;
      padding: 0 8px;

      /* 使用统一滚动条样式 */
      @extend .custom-scrollbar;
      .header-main {
        display: flex;
        align-items: center;
        &-title {
          span {
            font-weight: 500;
            font-size: 16px;
            color: rgb(var(--arcoblue-5));
          }
        }
      }
      &-item {
        cursor: pointer;
        width: 100%;
        padding: 12px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2px;
        &-left {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--border-radius-circle);
          margin-right: 14px;
          img {
            width: 100%;
            height: 100%;
            border-radius: var(--border-radius-circle);
          }
        }
        &-right {
          width: 100%;
          &-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            &-name {
              max-width: 120px;
              font-size: 14px;
              color: var(--color-neutral-10);
              font-weight: 500;
              min-height: 24px;
              line-height: 24px;
            }
            &-time {
              flex-shrink: 0;
              width: 130px;
              font-weight: 400;
              font-size: 12px;
              color: var(--color-neutral-4);
              text-align: right;
            }
          }
          &-bot {
            display: flex;
            justify-content: space-between;
            &-left {
              max-width: 200px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            &-right {
              flex-shrink: 0;
              padding: 0 5px;
              border-radius: var(--border-radius-large);
              background-color: #f65160;
              margin-left: 10px;
              span {
                font-weight: 400;
                font-size: 12px;
                color: #ffffff;
              }
            }
            margin-top: 2px;
            font-weight: 400;
            font-size: 12px;
            color: var(--color-neutral-6);
          }
        }
        &:hover {
          background-color: var(--color-neutral-2);
          border-radius: var(--border-radius-medium);
        }
        &.active {
          background-color: var(--color-neutral-2);
          border-radius: var(--border-radius-medium);
          position: relative;
          &::after {
            content: '';
            position: absolute;
            width: 4px;
            height: 100%;
            top: 0;
            bottom: 0;
            right: -8px;
            background-color: rgb(var(--arcoblue-7));
            border-radius: var(--border-radius-medium);
          }
        }
      }
    }
    :deep(.arco-collapse-item) {
      border: none !important;
      .arco-collapse-item-header {
        border-color: transparent !important;
      }
      .arco-collapse-item-content {
        background-color: transparent !important;
        padding: 0;
      }
    }
  }
</style>
