<template>
  <a-card
    :bordered="false"
    class="message-detail-container"
    :body-style="{ padding: 0, height: '100%' }"
  >
    <div v-if="chatStore.curConversation" class="detail-panel">
      <div class="detail-panel-top">
        <div class="detail-panel-top-title">
          <a-space :size="16">
            <div class="detail-panel-top-title-left">
              <img
                :src="
                  chatStore.curConversation.chatType !==
                  ChatPB.ChatType.GROUP_CHAT
                    ? chatStore.curConversation.targetAvatarUrl
                    : chatStore.curGroupDetail?.avatarUrl
                "
                alt=""
              />
            </div>
            <a-tooltip
              position="bottom"
              :content="
                chatStore.curConversation.chatType !==
                ChatPB.ChatType.GROUP_CHAT
                  ? chatStore.curConversation.targetName
                  : chatStore.curGroupDetail?.groupName
              "
            >
              <div class="detail-panel-top-title-right textEllipsis">
                <span
                  >{{
                    chatStore.curConversation.chatType !==
                    ChatPB.ChatType.GROUP_CHAT
                      ? chatStore.curConversation.targetName
                      : chatStore.curGroupDetail?.groupName
                  }}
                </span>
              </div>
            </a-tooltip>
            <div
              v-if="chatStore?.curGroupDetail?.members"
              class="detail-panel-top-title-right"
            >
              <span>{{
                chatStore.curConversation.chatType === 1
                  ? `(${chatStore?.curGroupDetail?.members?.length})`
                  : ''
              }}</span>
            </div>
          </a-space>
        </div>
        <div class="detail-panel-top-btn">
          <a-space v-if="isMember" :size="16">
            <a-tooltip
              :content="$t('meeting.tooltip.btn.send.meeting')"
              position="bottom"
            >
              <div
                class="detail-panel-top-btn-item"
                @click="handleMeetingInviteMember"
              >
                <assistSvgIcon class="svg-icon"></assistSvgIcon>
              </div>
            </a-tooltip>
            <a-tooltip
              position="bottom"
              :content="
                chatStore.curConversation.chatType === 1
                  ? $t('meeting.tooltip.btn.invite.member')
                  : t('message.chat.room.message.tips.create.group1')
              "
            >
              <div
                class="detail-panel-top-btn-item"
                @click="handleInviteMemberJoinGroupModalOpen"
              >
                <inviteSvgIcon class="svg-icon"></inviteSvgIcon>
              </div>
            </a-tooltip>
            <template v-if="chatStore.curConversation.chatType === 1">
              <a-tooltip
                :content="$t('meeting.tooltip.btn.group.setting')"
                position="bottom"
              >
                <div
                  class="detail-panel-top-btn-item"
                  @click="handleOpenGroupChatSetting"
                >
                  <settingSvgIcon class="svg-icon"></settingSvgIcon>
                </div>
              </a-tooltip>
            </template>
          </a-space>
        </div>
      </div>
      <a-divider :margin="0" />
      <div class="detail-panel-main">
        <div class="detail-panel-main-left">
          <div
            ref="chatContainer"
            class="detail-panel-main-left-body wsl-scroll"
          >
            <div
              v-for="(message, index) in curMessageList"
              :key="index"
              :class="[
                'chat-c-m-i',
                message.senderId == userStore.userId
                  ? 'my-message'
                  : 'other-message',
              ]"
            >
              <systemMsg
                v-if="message.messageType === ChatPB.MessageType.SYSTEM"
                :message="showMessage(message.content)"
              ></systemMsg>
              <template v-else>
                <div class="chat-c-m-i-i-l">
                  <img
                    :src="memberInfo(message, 'avatarUrl')"
                    alt="avatar"
                    class="avatar"
                  />
                </div>
                <div class="chat-c-m-i-r">
                  <div class="chat-c-m-i-r-t">
                    <span class="name">{{ memberInfo(message, 'name') }}</span>
                    <span class="time">{{ formatTime(message.sendTime) }}</span>
                  </div>
                  <div class="chat-c-m-i-r-m">
                    <div v-if="message.status === 1" class="chat-c-m-i-r-m-l">
                      <icon-loading />
                    </div>
                    <div v-if="message.status === 2" class="chat-c-m-i-r-m-l">
                      <icon-info-circle color="red" />
                    </div>
                    <div class="chat-c-m-i-r-m-b">
                      {{ message.content }}
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <div
            v-if="isMember || chatStore.curConversation.chatType === 0"
            class="detail-panel-main-left-send"
          >
            <a-textarea
              v-model="newMessage"
              :auto-size="{
                minRows: 2,
                maxRows: 2,
              }"
              :max-length="commonStore.textInputMaxLength"
              class="ChatMessageSendTextarea"
              :placeholder="$t('message.chat.text.placeholder')"
              @keydown="handleKeydown"
            />
            <div
              class="detail-panel-main-left-send-btn"
              @click="debounceSendMessage"
            >
              <sendIcon></sendIcon>
            </div>
          </div>
          <div v-else class="detail-panel-main-left-no">
            <span>{{ $t('message.chat.room.send.area.no') }}</span>
          </div>
        </div>
        <a-divider direction="vertical" :margin="0" />
        <div
          v-if="chatStore.groupChatSettingVisible"
          class="detail-panel-main-right"
        >
          <GroupSetting
            @handle-close="handleGroupSettingClose"
            @handle-remove-group="handleRemoveMember"
            @handle-invite-join-group="handleInviteMemberJoinGroupModalOpen"
            @handle-transfer-open="handleTransferOpen"
            @handle-sure-exit-group="handleSureExitGroup"
            @handle-sure-disband-group="handleSureDisbandGroup"
          ></GroupSetting>
        </div>
      </div>
    </div>
    <div v-else class="no-data">
      <div class="no-data-body">
        <img :src="messageNoDataIcon" alt="" />
        <div class="no-data-body-text">
          {{ $t('message.chat.detail.no.data') }}
        </div>
      </div>
    </div>
    <!-- 单聊发起 -->
    <a-modal
      v-if="callRoomOptionsVisible"
      v-model:visible="callRoomOptionsVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <optionsCallModal
        @handle-call="handleCall"
        @handle-close="handleOptionsCallClose"
      ></optionsCallModal>
    </a-modal>
    <!-- 群聊发起会议 -->
    <a-modal
      v-if="meetingInviteModalVisible"
      v-model:visible="meetingInviteModalVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <InviteAssistMember
        v-if="meetingInviteModalVisible"
        :select-psn="[
          {
            userId: userStore.userId,
            name: userStore.name,
            avatarUrl: userStore.avatarUrl,
          },
        ]"
        @handle-invite="handleMeetingInviteSuccess"
        @handle-close="handleCloseMeetingInviteModal"
      >
      </InviteAssistMember>
    </a-modal>
    <!-- 邀请人员进群 -->
    <a-modal
      v-if="inviteMemberJoinGroupVisible"
      v-model:visible="inviteMemberJoinGroupVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <InviteJoinGroup
        v-if="inviteMemberJoinGroupVisible"
        :members="curMembers"
        :group-members="curGroupMembers"
        @handle-invite="handleInviteJoinGroup"
        @handle-close="handleInviteMemberJoinGroupModalClose"
      ></InviteJoinGroup>
    </a-modal>
    <!-- 删除群成员 -->
    <a-modal
      v-if="removeMemberVisible"
      v-model:visible="removeMemberVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <RemoveGroupMember
        v-if="removeMemberVisible"
        :members="chatStore.curGroupDetail.members"
        @handle-sure-remove="handleSureRemoveGroupMember"
        @handle-close="handleCloseRemoveGroup"
      ></RemoveGroupMember>
    </a-modal>
    <!-- 转让群主 -->
    <a-modal
      v-if="transferMasterVisible"
      v-model:visible="transferMasterVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <transferMaster
        v-if="transferMasterVisible"
        :members="chatStore.curGroupDetail.members"
        @handle-sure-transfer="handleSureTransferMaster"
        @handle-close="handleCloseTransferMaster"
      ></transferMaster>
    </a-modal>
  </a-card>
</template>

<script lang="ts" setup>
  import {
    ref,
    watch,
    nextTick,
    onMounted,
    onBeforeUnmount,
    computed,
  } from 'vue';
  import dayjs from 'dayjs';
  import AssistErrorType from '@/utils/sdk/assistErrorType';
  import EventListener from '@/utils/event-listener';
  import { v4 as uuidv4 } from 'uuid';
  import * as ChatPB from '@/utils/proto/chatProtocol';
  import { useChatIndexedDB } from '@/utils/sdk/chatDB';
  import { useI18n } from 'vue-i18n';
  import {
    useMeetingStore,
    useChatStore,
    useAddressStore,
    useUserStore,
    useCommonStore,
  } from '@/store';
  import { ObjectTrans, objToArrForKey, sleep } from '@/utils';
  import { debounce } from 'lodash-es';

  import { Message } from '@arco-design/web-vue';

  import assistSvgIcon from '@/assets/svg/icon_assist.svg';
  import inviteSvgIcon from '@/assets/svg/icon_invite.svg';
  import settingSvgIcon from '@/assets/svg/icon_setting.svg';
  import messageNoDataIcon from '@/assets/images/no_data/message/no_message.png';
  import sendIcon from '@/assets/svg/icon_send.svg';

  import InviteAssistMember from '@/components/meeting/member/invite.vue';
  import optionsCallModal from '@/components/meeting/options/send.vue';
  import systemMsg from './components/system.vue';

  import RemoveGroupMember from './remove.vue';

  import InviteJoinGroup from './invite-join-group.vue';

  import GroupSetting from './group-setting.vue';

  import transferMaster from './transfer.vue';
  import useThMeetingStore from '../../../../packages/store';

  const dbName = 'ChatDB';

  const {
    addMessage,
    getAllMessages,
    updateMessageByFingerPrint,
    updateConversations,
  } = useChatIndexedDB(dbName);
  const meetingStore = useMeetingStore();
  const ThMeetingStore = useThMeetingStore();
  const addressStore = useAddressStore();
  const chatStore = useChatStore();
  const userStore = useUserStore();
  const commonStore = useCommonStore();

  const { locale, t } = useI18n();
  const showMessage = (content: any) => {
    const message = JSON.parse(content);
    return message;
  };
  const chatContainer = ref<HTMLElement | null>(null);

  const curMessageList: any = computed(() => {
    return chatStore.messageList;
  });
  const handleScrollBottom = async (type?: boolean) => {
    // 滚动到最底部
    if (!type) {
      await sleep(1000 * 0.5);
    }
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTo({
          top: chatContainer.value.scrollHeight,
          behavior: 'smooth',
        });
      }
    });
  };
  const handleGetAllMessages = async () => {
    if (
      !chatStore.curConversation ||
      !chatStore.curConversation.conversationId
    ) {
      return;
    }

    const messageList: any = await getAllMessages(
      chatStore.curConversation.conversationId
    );
    messageList.forEach((message: any) => {
      if (message.status === 1) {
        updateMessageByFingerPrint(message.fingerPrint, {
          ...message,
          status: 2,
        });
      }
    });
    chatStore.updateMessageList(ObjectTrans(messageList));
    handleScrollBottom();
  };
  const formatTime = (timestamp: number) => {
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

  const newMessage: any = ref('');
  const sendMessage = async () => {
    try {
      if (newMessage.value.trim() !== '') {
        const fingerPrint = uuidv4();
        const sendTime: any = Date.now();
        const message: any = {
          fingerPrint,
          chatType: chatStore.curConversation.chatType,
          recipientId: chatStore.curConversation.targetId,
          name: userStore.name,
          avatarUrl: userStore.avatarUrl,
          parentId: `${chatStore.curConversation.chatType}_${chatStore.curConversation.targetId}`,
          senderId: userStore.userId,
          messageType: ChatPB.MessageType.TEXT,
          content: newMessage.value.trim(),
          sendTime,
          status: 1,
        };
        await addMessage(message, false);
        // 发送消息
        EventListener.emit('ChatSendMessage', {
          fingerPrint,
          recipientId: chatStore.curConversation.targetId,
          chatType: chatStore.curConversation.chatType,
          messageType: ChatPB.MessageType.TEXT,
          content: newMessage.value.trim(),
        });

        // 添加到本地
        newMessage.value = '';
        EventListener.emit('send-refresh-chat-room');
        handleScrollBottom(true);
      }
    } catch (error) {
      console.error('Error adding chat session:', error);
    }
  };
  const debounceSendMessage = debounce(sendMessage, 1000);
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      newMessage.value += '\n';
    } else if (event.key === 'Enter') {
      event.preventDefault();
      sendMessage();
    }
  };
  // 协助会议 房间设置
  const callRoomOptionsVisible = ref(false);
  // 会议邀请人员
  const meetingInviteModalVisible = ref<boolean>(false);
  const handleOptionsCallClose = () => {
    meetingStore.updateRoomOptions(null);
    meetingStore.updateRoomInvitePsn(null);
    callRoomOptionsVisible.value = false;
  };
  const handleOptionCallOpen = (data: any) => {
    callRoomOptionsVisible.value = true;
    meetingStore.updateRoomInvitePsn(data);
    meetingStore.updateRoomOptions({
      meetingName: `${userStore.name} ${t('meeting.room.option.meetingName')}`,
      video: false,
      audio: true,
      loudspeaker: true,
      cloudRecord: false,
      escaping: false,
      abstract: false,
      organizer: userStore.name,
    });
  };
  // 发起呼叫-加入协作
  const handleJoinAssist = async (data: any) => {
    try {
      const res = await meetingStore.ThImEvent.joinMeeting({
        meetingNo: data.meetingNo,
        forceEntryStatus: 0,
        inviters: objToArrForKey(meetingStore.roomInvitePsn, 'userId'),
      });
      ThMeetingStore.updateRoomTranslateInfo({
        ...ThMeetingStore.roomTranslateInfo,
        ...res.data,
        open: !!res.data?.enableTranslation,
      });
      commonStore.updateBtnLoading(false);
      if (res.code !== 200 && res.code !== 401) {
        if (
          res.code === AssistErrorType.OTHER_CLIENT_JOINED_MEETING ||
          res.code === AssistErrorType.OTHER_CLIENT_IN_MEETING
        ) {
          EventListener.emit('Chat-Other-Client-Joined-Meeting');
        } else {
          Message.error(res.msg);
        }
        return;
      }
      // 将业务系统中的获取房间信息，传入ThSDK中
      meetingStore.ThImEvent.roomMenuOptions = {
        video: meetingStore.roomOptions?.video,
        audio: meetingStore.roomOptions?.audio,
        loudspeaker: meetingStore.roomOptions?.loudspeaker,
      };
      meetingStore.ThImEvent.setRoomOnlineListPsn(addressStore.memberList);
      meetingStore.ThImEvent.setRoomOnlineGroupPsn(
        addressStore.memberGroupList
      );
      handleOptionsCallClose();
      meetingStore.updateAssistVisible(true);
    } catch {
      commonStore.updateBtnLoading(false);
    }
  };
  // 发起呼叫-创建实时会议
  const handleCall = async () => {
    try {
      const res: any = await meetingStore.createRealtimeMeeting({
        aiStatus: meetingStore.roomOptions?.abstract ? '1' : '0',
        recordStatus: meetingStore.roomOptions?.cloudRecord ? '1' : '0',
        escaping: meetingStore.roomOptions?.escaping ? '1' : '0',

        subject: meetingStore.roomOptions?.meetingName,
        userIds: objToArrForKey(meetingStore.roomInvitePsn, 'userId'),
        enableTranslation: meetingStore.roomOptions?.escaping ? '1' : '0',
        languageType: ThMeetingStore.roomTranslateInfo?.languageType,
        industryType: ThMeetingStore.roomTranslateInfo?.industryType,
      });
      if (res.code !== 200 && res.code !== 401) {
        commonStore.updateBtnLoading(false);
        Message.error(res.msg);
        return;
      }
      handleJoinAssist(res.data);
    } catch (error) {
      commonStore.updateBtnLoading(false);
    }
  };
  const handleMeetingInviteMember = () => {
    if (meetingStore.answerInfo && meetingStore.answerInfo.meetingNo) {
      Message.error(t('meeting.call.message.tips'));
      return;
    }
    if (chatStore.curConversation.chatType === ChatPB.ChatType.PRIVATE_CHAT) {
      // 单聊
      handleOptionCallOpen([
        {
          userId: chatStore.curConversation.targetId,
          name: chatStore.curConversation.name,
        },
      ]);
    } else if (
      chatStore.curConversation.chatType === ChatPB.ChatType.GROUP_CHAT
    ) {
      // 群聊
      meetingInviteModalVisible.value = true;
    }
  };
  const handleCloseMeetingInviteModal = () => {
    meetingInviteModalVisible.value = false;
  };
  const handleMeetingInviteSuccess = (data: any) => {
    handleCloseMeetingInviteModal();
    handleOptionCallOpen(data);
  };

  // 邀请人员加入群
  const curMembers: any = ref(null);
  const curGroupMembers: any = ref(null);
  const inviteMemberJoinGroupVisible = ref<boolean>(false);
  const isMember = ref(true);
  const handleCurConversationGroupDetail = async () => {
    await handleGetAllMessages();
    if (
      !chatStore.curConversation ||
      chatStore.curConversation.chatType !== ChatPB.ChatType.GROUP_CHAT
    ) {
      return;
    }
    const res: any = await chatStore.getGroupDetail({
      groupId: chatStore.curConversation.targetId,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      if (res.code === 20201) {
        isMember.value = false;
      }
      return;
    }
    if (res.data.status === 1) {
      isMember.value = false;
    } else {
      isMember.value = true;
    }
    const incomingMemberList = res.data.members;
    await addressStore.memberList.forEach((existingMember: any) => {
      const incomingMember = incomingMemberList.find(
        (m: any) => m.userId === existingMember.userId
      );
      if (incomingMember) {
        incomingMember.pcOnline = existingMember.pcOnline;
        incomingMember.glassOnline = existingMember.glassOnline;
        incomingMember.androidOnline = existingMember.androidOnline;
      }
    });
    incomingMemberList.sort((a: any, b: any) => {
      const aOnline = a.pcOnline || a.glassOnline || a.androidOnline ? 1 : 0;
      const bOnline = b.pcOnline || b.glassOnline || b.androidOnline ? 1 : 0;
      return bOnline - aOnline;
    });
    chatStore.updateCurGroupDetail({
      ...res.data,
      members: incomingMemberList,
    });
  };
  const handleInviteMemberJoinGroupModalOpen = () => {
    if (chatStore.curConversation.chatType !== ChatPB.ChatType.GROUP_CHAT) {
      curMembers.value = addressStore.memberList;
      curGroupMembers.value = addressStore.memberGroupList;
    } else if (chatStore.curGroupDetail && chatStore.curGroupDetail.members) {
      curMembers.value = addressStore.filterMembersNotInList(
        chatStore.curGroupDetail.members,
        addressStore.memberList
      );
      curGroupMembers.value = addressStore.filterMembersNotInGroups(
        chatStore.curGroupDetail.members,
        addressStore.memberGroupList
      );
    } else {
      curMembers.value = addressStore.memberList;
      curGroupMembers.value = addressStore.memberGroupList;
    }

    inviteMemberJoinGroupVisible.value = true;
  };
  const handleInviteMemberJoinGroupModalClose = () => {
    inviteMemberJoinGroupVisible.value = false;
    curMembers.value = null;
    curGroupMembers.value = null;
  };
  const handleInviteJoinGroup = async (data: any) => {
    if (chatStore.curConversation.chatType === ChatPB.ChatType.GROUP_CHAT) {
      const res: any = await chatStore.inviteGroupMember({
        groupId: chatStore.curGroupDetail.groupId,
        userIds: objToArrForKey(data, 'userId'),
      });
      if (res.code !== 200 && res.code !== 401) {
        Message.error(res.msg);
        return;
      }
      handleCurConversationGroupDetail();
      handleInviteMemberJoinGroupModalClose();
    } else if (data.length > 0) {
      const groupNameArr = objToArrForKey(data, 'name');
      let groupNameStr = groupNameArr.join('、');
      groupNameStr =
        groupNameStr.length > 50
          ? `${groupNameStr.substring(0, 46)}...`
          : groupNameStr;

      const res: any = await chatStore.createGroup({
        groupName: groupNameStr,
        userIds: objToArrForKey(data, 'userId'),
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
      handleCurConversationGroupDetail();
      handleInviteMemberJoinGroupModalClose();
    } else {
      Message.warning(t('message.invite.join.group.select.psn.warning'));
    }
  };

  // 群聊设置
  const handleOpenGroupChatSetting = async () => {
    chatStore.updateGroupChatSettingVisible(true);
  };
  const handleGroupSettingClose = () => {
    chatStore.updateGroupChatSettingVisible(false);
  };
  const removeMemberVisible = ref<boolean>(false);
  const handleRemoveMember = () => {
    removeMemberVisible.value = true;
  };
  const handleCloseRemoveGroup = () => {
    removeMemberVisible.value = false;
  };
  const handleSureRemoveGroupMember = async (data: any) => {
    const res: any = await chatStore.removeGroupMember({
      groupId: chatStore.curGroupDetail.groupId,
      userIds: objToArrForKey(data, 'userId'),
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      return;
    }
    handleCurConversationGroupDetail();
    handleCloseRemoveGroup();
  };
  const transferMasterVisible = ref<boolean>(false);
  const handleTransferOpen = () => {
    transferMasterVisible.value = true;
  };
  const handleCloseTransferMaster = () => {
    transferMasterVisible.value = false;
  };
  const handleSureTransferMaster = async (data: any) => {
    const res: any = await chatStore.transferGroupMaster({
      groupId: chatStore.curGroupDetail.groupId,
      userId: data[0].userId,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      return;
    }
    handleCloseTransferMaster();
    handleCurConversationGroupDetail();
  };
  const handleSureExitGroup = async () => {
    const res: any = await chatStore.leaveGroup({
      groupId: chatStore.curGroupDetail.groupId,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      return;
    }
    handleCurConversationGroupDetail();
    handleInviteMemberJoinGroupModalClose();
    EventListener.emit('event-exit-group-chat');
  };
  const handleSureDisbandGroup = async () => {
    const res: any = await chatStore.disbandGroup({
      groupId: chatStore.curGroupDetail.groupId,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      return;
    }
    EventListener.emit('event-disband-group-chat');
  };
  const memberInfo = (data: any, key: any) => {
    const member = addressStore.filterMemberInfoByUserId(data.senderId);
    return member[key];
  };
  // 会话中消息状态变更
  const handleChatMessageStatus = async (data: any) => {
    const { fp, status } = data;
    console.log('会话中消息状态变更-handleChatMessageStatus', fp, status);
    await updateMessageByFingerPrint(fp, {
      status: status ? 0 : 2,
    });
    handleGetAllMessages();
  };
  const handleMonitorEvent = () => {
    EventListener.on('group-info-change', handleCurConversationGroupDetail);
    EventListener.on('ChatMessageStatus', handleChatMessageStatus);
  };
  const handleClearMonitorEvent = () => {
    EventListener.off('group-info-change', handleCurConversationGroupDetail);
    EventListener.off('ChatMessageStatus', handleChatMessageStatus);
  };
  const handleClearSceneStatus = () => {
    if (chatStore.groupChatSettingVisible) {
      handleGroupSettingClose();
    }
    if (callRoomOptionsVisible.value) {
      handleOptionsCallClose();
    }
    if (meetingInviteModalVisible.value) {
      handleCloseMeetingInviteModal();
    }
    if (inviteMemberJoinGroupVisible.value) {
      handleInviteMemberJoinGroupModalClose();
    }
    if (removeMemberVisible.value) {
      handleCloseRemoveGroup();
    }
    if (transferMasterVisible.value) {
      handleCloseTransferMaster();
    }
  };
  onMounted(() => {
    console.log('详情页面-updateConversations', chatStore.curConversation);
    if (chatStore.curConversation) {
      updateConversations({
        ...ObjectTrans(chatStore.curConversation),
        unreadCount: 0,
      });
    }

    handleCurConversationGroupDetail();
    handleMonitorEvent();
  });
  onBeforeUnmount(() => {
    handleClearSceneStatus();
    handleClearMonitorEvent();
  });
  // 监听语言
  watch(
    () => locale,
    () => {
      handleGetAllMessages();
    },
    { deep: true }
  );
  // 监听会话变更
  watch(
    () => chatStore.curConversation,
    () => {
      console.log('监听会话变更');
      handleCurConversationGroupDetail();
    },
    { deep: true }
  );
</script>

<style scoped lang="less">
  .message-detail-container {
    width: 100%;
    height: 100%;
    .detail-panel {
      max-width: 100%;
      height: 100%;
      &-top {
        height: 64px;
        padding: 0 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;

        &-title {
          &-left {
            flex-shrink: 0;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--border-radius-circle);

            img {
              flex-shrink: 0;
              width: 100%;
              height: 100%;
            }
          }

          &-right {
            max-width: 200px;
            font-weight: 500;
            font-size: 16px;
            color: var(--color-neutral-10);
          }
        }

        &-btn {
          &-item {
            cursor: pointer;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            // background: #f4f9fd;
            border-radius: var(--border-radius-medium);

            .svg-icon {
              flex-shrink: 0;
              width: 24px;
              height: 24px;
            }
          }
        }
      }

      &-main {
        display: flex;
        height: calc(100vh - 80px - 80px);
        &-left {
          flex: 1;
          padding: 16px 20px 26px 12px;
          &-body {
            height: calc(100% - 64px);
            overflow-y: auto;
            padding: 16px;

            .chat-c-m-i {
              display: flex;
              margin-bottom: 32px;

              .chat-c-m-i-i-l {
                width: 40px;
                margin-right: 12px;

                .avatar {
                  width: 40px;
                  height: 40px;
                  border-radius: 50%;
                }
              }

              .chat-c-m-i-r {
                max-width: 350px;

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
                    font-weight: 500;
                    color: var(--color-neutral-10);
                  }
                }

                .chat-c-m-i-r-m {
                  display: flex;
                  justify-content: flex-start;
                  .chat-c-m-i-r-m-b {
                    padding: 8px 12px;
                    background: var(--color-neutral-3);
                    border-radius: 4px;
                    font-weight: 400;
                    font-size: 14px;
                    color: var(--color-neutral-8);
                    word-break: break-all; /* 强制长单词换行 */
                    white-space: pre-wrap;
                    /* 自动换行 */
                    text-align: left;
                    line-height: 28px;
                  }
                }
              }

              &.my-message {
                flex-direction: row-reverse;
                text-align: right;

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
                  display: flex;
                  justify-content: flex-end;
                  .chat-c-m-i-r-m-l {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 10px;
                  }
                  .chat-c-m-i-r-m-b {
                    background-color: rgb(var(--arcoblue-1));
                  }
                }
              }
            }
          }
          &-send {
            height: 100px;
            position: relative;
            display: flex;
            align-items: center;

            &-btn {
              cursor: pointer;
              width: 40px;
              height: 40px;
              position: absolute;
              right: 25px;
              top: 0;
              bottom: 5px;
              margin: auto;
              box-shadow: 0px 6px 12px 0px rgba(63, 140, 255, 0.26);
              z-index: 9;
            }
          }
          &-no {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100px;
            span {
              font-weight: 400;
              font-size: 12px;
              color: rgb(var(--color-neutral-2));
            }
          }
        }
        &-right {
          flex-shrink: 0;
          width: 276px;
          height: calc(100% - 30px);
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

<style lang="less" scoped>
  // responsive
  @media (max-width: @screen-lg) {
    .detail-panel {
      &-main {
        flex-wrap: wrap;
        &-left {
          flex: 1;
          flex-basis: 100%;
          margin-bottom: 16px;
          &-body {
            height: 300px;
          }
        }
        &-right {
          flex: none;
          flex-basis: 100%;
          padding: 0;
          order: -1;
          height: 100px;
          overflow: scroll;

          /* 使用统一滚动条样式 */
          @extend .custom-scrollbar;
        }
      }
    }
  }
</style>
