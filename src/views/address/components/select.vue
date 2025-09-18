<template>
  <a-card
    class="general-card select-panel"
    :bordered="false"
    :body-style="{
      height: '100%',
      display: 'flex',
      padding: 0,
      flexFlow: 'column',
    }"
  >
    <div class="select-container">
      <div class="select-top">
        <div
          class="select-top-left"
          :class="selectPsn.length > 0 ? '' : 'disabled'"
        >
          <span>
            {{ $t('meeting.member.right.title') }} ({{ selectPsn.length }}/{{
              limitNum
            }}) {{ $t('meeting.member.right.title.dw') }}</span
          >
        </div>
        <div class="select-top-right">
          <a-space>
            <a-button
              type="primary"
              class="btn-item"
              :disabled="buttonDisabled"
              @click="handleAssist"
            >
              <template #icon>
                <CallIcon></CallIcon>
              </template>
              {{ $t('meeting.member.right.btn.call') }}</a-button
            >
            <a-button
              type="primary"
              class="btn-item"
              :disabled="buttonDisabled"
              @click="handleScheduleMeeting"
            >
              <template #icon> <CalendarIcon></CalendarIcon> </template
              >{{ $t('meeting.member.right.btn.yyhy') }}</a-button
            >
            <a-button
              type="primary"
              class="btn-item"
              :disabled="buttonDisabled"
              @click="handleCreateGroup"
            >
              <template #icon> <MessageIcon></MessageIcon> </template
              >{{
                selectPsn.length > 1
                  ? $t('meeting.member.right.btn.fqql')
                  : $t('meeting.member.right.btn.fqlt')
              }}</a-button
            >
            <a-button
              type="outline"
              class="btn-item"
              status="danger"
              :disabled="buttonDisabled"
              @click="handleClearSelect"
              >{{ $t('meeting.member.right.btn.clear') }}</a-button
            >
          </a-space>
        </div>
      </div>
      <a-divider :margin="0" />
      <div class="select-main wsl-scroll">
        <a-row
          :gutter="[16, 16]"
          :style="{
            marginTop: '10px',
          }"
        >
          <a-col
            v-for="(item, index) in selectPsn"
            :key="`psn_${index}`"
            :xs="12"
            :sm="12"
            :md="12"
            :lg="12"
            :xl="12"
            :xxl="8"
          >
            <a-card class="grid-card" hoverable>
              <div class="block-item-grid">
                <div class="block-item-grid-left">
                  <div class="block-item-grid-left-icon">
                    <img :src="item.avatarUrl" alt="" />
                    <div
                      class="block-item-grid-left-icon-status"
                      :class="
                        item.pcOnline || item.glassOnline || item.androidOnline
                          ? 'online'
                          : 'outline'
                      "
                    >
                    </div>
                  </div>
                </div>
                <div class="block-item-grid-right">
                  <div class="block-item-grid-right-top">
                    <span>{{ item.name }}</span>
                  </div>
                  <div class="block-item-grid-right-bot">
                    <span>{{ item.alias }}</span>
                  </div>
                </div>
              </div>
              <div class="grid-card-fixed" @click="handleDelItem(index, item)">
                <img :src="CloseIcon" alt="" />
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useAddressStore, useChatStore, useUserStore } from '@/store';
  import { useChatIndexedDB } from '@/utils/sdk/chatDB';
  import * as ChatPB from '@/utils/proto/chatProtocol';
  import { ObjectTrans, objToArrForKey } from '@/utils';
  import CallIcon from '@/assets/svg/icon_call.svg';
  import CalendarIcon from '@/assets/svg/icon_calendar.svg';
  import MessageIcon from '@/assets/svg/icon_messages.svg';
  import CloseIcon from '@/assets/icons/icon_close.png';
  import { useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';

  const dbName = 'ChatDB';
  const { addConversation, getAllConversations } = useChatIndexedDB(dbName);
  const userStore = useUserStore();
  const emit = defineEmits(['handleScheduleOpen', 'handleOptionCallOpen']);
  const { t } = useI18n();
  const router = useRouter();
  const addressStore = useAddressStore();
  const chatStore = useChatStore();
  const selectPsn = ref<any[]>(addressStore.selectPsn);

  watch(
    () => addressStore.selectPsn,
    (newVal) => {
      selectPsn.value = newVal;
    },
    { immediate: true, deep: true }
  );

  const buttonDisabled = computed(() => {
    // todo 如果只选的是自己 禁用
    if (
      selectPsn.value.length === 1 &&
      selectPsn.value.some((v) => v.userId === userStore.userId)
    ) {
      return true;
    }
    return !(selectPsn.value.length > 0);
  });
  // 呼叫
  const handleAssist = () => {
    // todo 参数筛选掉自己
    emit(
      'handleOptionCallOpen',
      addressStore.selectPsn.filter((v) => v.userId !== userStore.userId)
    );
  };
  const handleCreateUserConversation = async (data: any) => {
    const conversation = {
      conversationId: `${ChatPB.ChatType.PRIVATE_CHAT}_${data.userId}`,
      targetId: data.userId,
      targetName: data.name,
      targetAvatarUrl: data.avatarUrl,
      unreadCount: 0,
      sendTime: Date.now(),
      name: data.name,
      messageType: ChatPB.MessageType.TEXT,
      content: '',
      chatType: ChatPB.ChatType.PRIVATE_CHAT,
      status: 1,
    };

    await addConversation(conversation);
    const list = await getAllConversations();
    chatStore.updateConversationList(list);
    chatStore.updateCurConversation(ObjectTrans(conversation));
  };
  const handleCreateGroup = async () => {
    // todo 创建筛选掉自己
    const psnData = selectPsn.value.filter(v => v.userId !== userStore.userId)
    if (psnData.length > 1) {
      const groupNameArr = objToArrForKey(psnData, 'name');
      let groupNameStr = groupNameArr.join('、');
      groupNameStr =
        groupNameStr.length > 50
          ? `${groupNameStr.substring(0, 46)}...`
          : groupNameStr;

      const res: any = await chatStore.createGroup({
        groupName: groupNameStr,
        userIds: objToArrForKey(psnData, 'userId'),
      });
      if (res.code !== 200 && res.code !== 401) {
        Message.error(res.msg);
        return;
      }
      Message.success(t('meeting.member.create.group.success'));
      chatStore.updateCurConversation({
        targetId: res.data.groupId,
        targetName: res.data.groupName,
        chatType: ChatPB.ChatType.GROUP_CHAT,
        conversationId: `${ChatPB.ChatType.GROUP_CHAT}_${res.data.groupId}`,
        targetAvatarUrl: res.data.avatarUrl,
      });
      router.push({
        name: 'MessageList',
      });
    } else {
      await handleCreateUserConversation(ObjectTrans(psnData[0]));
      router.push({
        name: 'MessageList',
      });
    }
  };
  const limitNum = ref(addressStore.limitMember);
  const handleDelItem = (index: number, data: any) => {
    // todo自己不可以被删除
    if (data.userId === userStore.userId) {
      Message.info(t('meeting.call.me'));
      return;
    }
    addressStore.selectPsn.splice(index, 1);
  };
  const handleClearSelect = () => {
    // todo 清除选中的要保留自己
    const myInitData = addressStore.selectPsn.filter(v => v.userId === userStore.userId)
    addressStore.clearAddressSelectPsn(myInitData);
  };
  // 预约会议
  const handleScheduleMeeting = () => {
    emit('handleScheduleOpen');
  };
</script>

<style lang="less" scoped>
  .select-panel {
    width: 100%;
    height: 100%;
    .select-container {
      width: 100%;
      height: 100%;
      .select-top {
        width: 100%;
        height: 64px;
        padding: 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        &-left {
          padding: 0;

          span {
            font-weight: 400;
            font-size: 16px;
            color: var(--color-neutral-10);
          }
          &.disabled {
            span {
              color: var(--color-neutral-4);
            }
          }
        }
      }
      .select-main {
        padding: 0 16px 16px;
        height: calc(100vh - 60px - 5px - 64px - 16px);
        .grid-card {
          cursor: pointer;
          padding: 22px 24px;
          position: relative;
          .grid-card-fixed {
            cursor: pointer;
            width: 16px;
            height: 16px;
            border-radius: var(--border-radius-circle);
            background-color: var(--color-neutral-3);
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 8px;
            right: 8px;
            img {
              width: 16px;
              height: 16px;
            }
          }
          .block-item-grid {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;

            &-left {
              flex-shrink: 0;
              width: 48px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 14px;
              &-icon {
                flex-shrink: 0;
                width: 48px;
                height: 48px;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                img {
                  width: 100%;
                  height: 100%;
                  border-radius: var(--border-radius-circle);
                }
                &-status {
                  width: 10px;
                  height: 10px;
                  position: absolute;
                  bottom: 0;
                  right: 0;
                  border: 2px solid var(--color-neutral-2);
                  border-radius: var(--border-radius-circle);
                  &.online {
                    background-color: #28c445;
                  }
                  &.outline {
                    background-color: #878787;
                  }
                }
              }
            }
            &-right {
              flex: 1;
              &-top {
                min-height: 24px;
                margin-bottom: 2px;
                span {
                  font-weight: 500;
                  font-size: 16px;
                  line-height: 24px;
                  color: var(--color-neutral-10);
                }
              }
              &-bot {
                span {
                  font-weight: 400;
                  font-size: 12px;
                  color: var(--color-neutral-5);
                }
              }
            }
          }
        }
      }
    }
    :deep(.arco-btn-icon) {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    :deep(.arco-card-bordered) {
      border-radius: var(--border-radius-large);
    }
    :deep(.arco-card-body) {
      padding: 0;
    }
    :deep(.btn-item) {
      min-width: 120px !important;
    }
  }
</style>
