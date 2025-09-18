<template>
  <div class="system-container">
    <div class="system-message">
      <span> {{ showContent(message) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watchEffect } from 'vue';
  import { objToArrForKey } from '@/utils';
  import { useI18n } from 'vue-i18n';

  import * as ChatPB from '@/utils/proto/chatProtocol';
  import { useAddressStore } from '@/store';

  const { t } = useI18n();
  const addressStore = useAddressStore();
  const props = defineProps<{
    message: any;
  }>();
  const message: any = ref(props.message);
  const showContent = (newContent: any) => {
    // 从内容中提取事件类型和事件数据
    const { eventType, eventData } = newContent;

    // 使用 switch 语句处理不同的事件类型
    switch (eventType) {
      case ChatPB.EventType.CHAT_GROUP_CREATED: {
        let masterName: any;
        if (!eventData.masterName) {
          const member = addressStore.filterMemberInfoByUserId(
            eventData.masterId
          );
          masterName = member.name;
        } else {
          masterName = eventData.masterName;
        }
        let names: any;
        if (!eventData.names) {
          const result = eventData.userIds
            .map((userId: any) =>
              addressStore.memberList.find(
                (user: any) => user.userId === userId
              )
            )
            .filter(Boolean);
          names = objToArrForKey(result, 'name').join('、');
        } else {
          names = eventData.names;
        }
        return `${masterName} ${t(
          'message.invite.join.group.menu.invite'
        )} ${names} ${t('message.chat.room.message.tips.create.group2')}`;
      }

      case ChatPB.EventType.CHAT_GROUP_INFO_UPDATED: {
        let updatedName: any;
        if (!eventData.updatedName) {
          const member = addressStore.filterMemberInfoByUserId(
            eventData.updateUserId
          );
          updatedName = member.name;
        } else {
          updatedName = eventData.updatedName;
        }
        return `${updatedName} ${t(
          'message.chat.room.message.tips.update.group'
        )}`;
      }

      case ChatPB.EventType.CHAT_GROUP_MEMBER_INVITED: {
        let invitorName: any;
        if (!eventData.invitorName) {
          const member = addressStore.filterMemberInfoByUserId(
            eventData.invitorUserId
          );
          invitorName = member.name;
        } else {
          invitorName = eventData.invitorName;
        }
        let inviteeNames: any;
        if (!eventData.inviteeNames) {
          const result = eventData.inviteeUserIds
            .map((userId: any) =>
              addressStore.memberList.find(
                (user: any) => user.userId === userId
              )
            )
            .filter(Boolean);
          inviteeNames = objToArrForKey(result, 'name').join('、');
        } else {
          inviteeNames = eventData.inviteeNames;
        }
        return `${invitorName} ${t(
          'message.chat.room.message.tips.invite.group'
        )} ${inviteeNames} ${t(
          'message.chat.room.message.tips.invite.group2'
        )}`;
      }

      case ChatPB.EventType.CHAT_GROUP_MEMBER_REMOVED: {
        let masterName: any;
        if (!eventData.masterName) {
          const member = addressStore.filterMemberInfoByUserId(
            eventData.masterId
          );
          masterName = member.name;
        } else {
          masterName = eventData.masterName;
        }
        let removedNames: any;
        if (!eventData.removedNames) {
          const result = eventData.removedUserIds
            .map((userId: any) =>
              addressStore.memberList.find(
                (user: any) => user.userId === userId
              )
            )
            .filter(Boolean);
          removedNames = objToArrForKey(result, 'name').join('、');
        } else {
          removedNames = eventData.removedNames;
        }
        return `${masterName} ${t(
          'message.chat.room.message.tips.remove.group'
        )} ${removedNames}`;
      }

      case ChatPB.EventType.CHAT_GROUP_MASTER_CHANGED: {
        let oldMasterName: any;
        if (!eventData.oldMasterName) {
          const member = addressStore.filterMemberInfoByUserId(
            eventData.oldMasterId
          );
          oldMasterName = member.name;
        } else {
          oldMasterName = eventData.oldMasterName;
        }
        let newMasterName: any;
        if (!eventData.newMasterName) {
          const member = addressStore.filterMemberInfoByUserId(
            eventData.newMasterId
          );
          newMasterName = member.name;
        } else {
          newMasterName = eventData.newMasterName;
        }
        return `${oldMasterName} ${t(
          'message.chat.room.message.tips.change.group'
        )} ${newMasterName}`;
      }

      case ChatPB.EventType.CHAT_GROUP_DISBANDED: {
        let masterName: any;
        if (!eventData.masterName) {
          const member = addressStore.filterMemberInfoByUserId(
            eventData.masterId
          );
          masterName = member.name;
        } else {
          masterName = eventData.masterName;
        }
        return `${masterName} ${t(
          'message.chat.room.message.tips.disbanded.group'
        )}`;
      }

      case ChatPB.EventType.CHAT_GROUP_MEMBER_QUIT: {
        let quitName: any;
        if (!eventData.quitName) {
          const member = addressStore.filterMemberInfoByUserId(
            eventData.quitUserId
          );
          quitName = member.name;
        } else {
          quitName = eventData.quitName;
        }
        return `${quitName} ${t('message.chat.room.message.tips.quit.group')}`;
      }

      default:
        // 对于未知事件类型，直接返回原始内容
        return newContent;
    }
  };
  watchEffect(() => {
    message.value = props.message;
  });
</script>

<style lang="less" scoped>
  .system-container {
    width: 100%;
    display: flex;
    justify-content: center;
    .system-message {
      flex-shrink: 0;
      width: 80%;
      min-height: 24px;
      display: flex;
      justify-content: center;
      span {
        font-size: 12px;
        color: var(--color-neutral-6);
      }
    }
  }
</style>
