<template>
  <a-layout
    :class="{
      'layout': true,
      'mobile': appStore.hideMenu,
      'remote-micro-app-layout': isWujieStatus,
    }"
  >
    <div v-if="navbar && !isWujieStatus" class="layout-navbar">
      <NavBar />
    </div>
    <a-layout>
      <a-layout>
        <a-layout-sider
          v-if="renderMenu"
          v-show="!hideMenu"
          class="layout-sider"
          breakpoint="xl"
          :collapsed="collapsed"
          :collapsible="true"
          :width="menuWidth"
          :style="{ paddingTop: navbar ? '60px' : '' }"
          :hide-trigger="true"
          @collapse="setCollapsed"
        >
          <div class="menu-wrapper">
            <Menu />
          </div>
        </a-layout-sider>
        <a-drawer
          v-if="hideMenu"
          :visible="drawerVisible"
          placement="left"
          :footer="false"
          mask-closable
          :closable="false"
          @cancel="drawerCancel"
        >
          <Menu />
        </a-drawer>
        <a-layout class="layout-content" :style="paddingStyle">
          <TabBar v-if="appStore.tabBar" />
          <a-layout-content>
            <PageLayout />
          </a-layout-content>
          <!-- <Footer v-if="footer" /> -->
        </a-layout>
      </a-layout>
    </a-layout>
    <!-- 登出 -->
    <a-modal
      v-model:visible="logoutModalVisible"
      :closable="false"
      :esc-to-close="false"
      :hide-cancel="true"
      :mask-closable="false"
      :footer="false"
    >
      <div class="modal-content">
        <div class="modal-content-top">
          <component :is="modalErrorIcon"></component>
        </div>
        <div class="modal-content-desc">
          <div class="modal-content-desc-b">
            <span>{{ logoutModalTitle }}</span>
          </div>
        </div>
        <div class="errorMessage xxxx">{{ logoutModalDesc }}</div>
        <div class="modal-content-bot">
          <a-button type="primary" @click="handleLogoutOk">{{
            $t('error.logout.btn.label1')
          }}</a-button>
        </div>
      </div>
    </a-modal>
    <!-- WebSocket 断连处理 -->
    <a-modal
      v-model:visible="reconnectModalVisible"
      :modal-class="`custom-modal`"
      width="398px"
      :closable="false"
      :esc-to-close="false"
      :hide-cancel="true"
      :mask-closable="false"
      :footer="false"
    >
      <div class="modal-content">
        <div class="modal-content-top">
          <component :is="modalSocketOffIcon"></component>
        </div>
        <div class="modal-content-desc">
          <div class="modal-content-desc-b">
            <span>{{ $t('error.logout.tip10') }}</span>
          </div>
        </div>
        <div class="errorMessage"
          >{{ $t('error.logout.tip9') }} ({{ retryCount }}/30)</div
        >
        <div class="modal-content-bot">
          <div class="modal-content-bot-i">
            <a-button type="outline" @click="handleCloseReconnectModal">{{
              $t('error.logout.btn.label2')
            }}</a-button>
          </div>
          <div class="modal-content-bot-i">
            <a-button type="primary" @click="handleLogoutOk">{{
              $t('error.logout.btn.label3')
            }}</a-button>
          </div>
        </div>
      </div>
    </a-modal>
    <a-modal
      v-model:visible="reconnectCloseModalVisible"
      :modal-class="`custom-modal`"
      width="398px"
      :closable="false"
      :esc-to-close="false"
      :hide-cancel="true"
      :mask-closable="false"
      :footer="false"
    >
      <div class="modal-content">
        <div class="modal-content-top">
          <component :is="modalSocketCloseIcon"></component>
        </div>
        <div class="modal-content-desc">
          <div class="modal-content-desc-b">
            <span>{{ $t('error.logout.tip11') }}</span>
          </div>
        </div>
        <div class="modal-content-bot">
          <div class="modal-content-bot-i">
            <a-button type="outline" @click="handleServeErrorReconnect">{{
              $t('error.logout.btn.label4')
            }}</a-button>
          </div>
          <div class="modal-content-bot-i">
            <a-button type="primary" @click="handleLogoutOk">{{
              $t('error.logout.btn.label3')
            }}</a-button>
          </div>
        </div>
      </div>
    </a-modal>
    <!-- 接听强制入会 -->
    <a-modal
      v-if="forceEntryModalVisible"
      v-model:visible="forceEntryModalVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <ForceEntryModal
        v-if="forceEntryModalVisible"
        @handle-close="handleForceEntryModalClose"
        @handle-join-meeting="handleForceEntryMeeting"
      ></ForceEntryModal>
    </a-modal>
    <!-- 立即会议弹窗 -->
    <div v-if="MeetingStore.upcomingMeetingVisible" class="upcoming-modal">
      <upcomingModal
        v-if="MeetingStore.upcomingMeetingVisible"
        ref="upcomingModalRef"
      ></upcomingModal>
    </div>
    <!-- 立即会议弹窗 -加入会议相关配置弹窗 -->
    <a-modal
      v-if="upcomingJoinMeetingModalVisible"
      v-model:visible="upcomingJoinMeetingModalVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <joinMeetingModal
        v-if="upcomingJoinMeetingModalVisible"
        @handle-close="handleUpcomingJoinMeetingModalClose"
        @handle-join-meeting="handleUpcomingJoinMeeting"
      ></joinMeetingModal>
    </a-modal>
    <!-- Ar眼镜登录二维码 -->
    <a-modal
      v-if="arQrCodeModalVisible"
      v-model:visible="arQrCodeModalVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <ArQrCodeModal
        v-if="arQrCodeModalVisible"
        @handle-close="handleArQrCodeModalClose"
      ></ArQrCodeModal>
    </a-modal>
  </a-layout>
</template>

<script lang="tsx" setup>
  import { ref, computed, provide, onMounted, onBeforeUnmount } from 'vue';
  import { useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import {
    useAppStore,
    useMeetingStore,
    useAddressStore,
    useUserStore,
    useChatStore,
    useCommonStore,
  } from '@/store';

  import useUser from '@/hooks/user';
  import { useChatIndexedDB } from '@/utils/sdk/chatDB';
  import * as ChatPB from '@/utils/proto/chatProtocol';
  import AssistErrorType from '@/utils/sdk/assistErrorType';
  import { isBucketKey } from '@/utils';
  import { getBatchPreviewUrls } from '@/api/user';

  import modalSocketOffIcon from '@/assets/svg/icon_modal_socket_off.svg';
  import modalSocketCloseIcon from '@/assets/svg/icon_modal_socket_close.svg';

  import modalErrorIcon from '@/assets/svg/icon_modal_error.svg';

  import { Message, Notification, Space, Button } from '@arco-design/web-vue';

  import MessageWs from '@/utils/sdk/message_ws';
  import EventListener from '@/utils/event-listener';

  import {
    getToken,
    getRefreshToken,
    setTokenType,
    setToken,
    setRefreshToken,
    clearToken,
    getLocalTimestamp,
    getSessionTimestamp,
  } from '@/utils/auth';
  // import ringUrl from '@/assets/audio/ring.mp3';
  import NavBar from '@/components/navbar/index.vue';
  import Menu from '@/components/menu/index.vue';

  import TabBar from '@/components/tab-bar/index.vue';
  import ForceEntryModal from '@/components/meeting/options/force_entry.vue';
  import upcomingModal from '@/components/meeting/upcoming/index.vue';
  import joinMeetingModal from '@/components/meeting/options/join_options.vue';
  import ArQrCodeModal from '@/components/ar-qr-code/index.vue';

  import useResponsive from '@/hooks/responsive';

  import modalWarningIcon from '@/assets/svg/icon_modal_warning.svg';
  import useNotification from '@/hooks/useNotification';
  import { isWujie, getSocketHost } from '@/utils/wujie';
  import useLocale from '@/hooks/locale';
  import { useWujieOnChangeLocal, useWujieTools } from '@/utils/wujie/hooks';
  import useThMeetingStore from '../../packages/store';

  import PageLayout from './page-layout.vue';

  import { THImEvent, THEventBus } from '../../packages';

  const { requestPermission, notify } = useNotification();
  const kickOutIcon: any = ref(null);

  const { t } = useI18n();
  const { logout } = useUser();
  const dbName = 'ChatDB';
  const { addConversation, addMessage, getAllConversations, clearAll } =
    useChatIndexedDB(dbName);

  const addressStore = useAddressStore();
  const isInit = ref(false);
  const importantDataReloadNum = ref(0);
  const appStore = useAppStore();
  const userStore = useUserStore();
  const chatStore = useChatStore();
  const commonStore = useCommonStore();
  const router = useRouter();

  const MeetingStore = useMeetingStore();

  const logoutModalVisible = ref(false);
  const logoutModalBtnVisible = ref(false);
  const logoutModalTitle = ref('');
  const logoutModalDesc = ref('');

  const reconnectModalVisible = ref(false);
  const retryCount = ref(0);
  const reconnectCloseModalVisible = ref(false);

  const forceEntryModalVisible = ref(false);
  const upcomingModalRef = ref<any>();
  const upcomingJoinMeetingModalVisible = ref(false);

  let handleClearThImEventStatus: any;
  let handleClearChatImEventStatus: any;

  // 设置异常退出modal信息
  const handleSetLogoutModal = (title: string, desc: string) => {
    logoutModalTitle.value = title;
    logoutModalDesc.value = desc;
  };

  // -- 聊天会议 web socket
  let ChatImSocket: any;
  // 远程协助 web socket
  const ThAssistSocket: any = ref(null);

  useResponsive(true);

  // 页面相关业务
  const navbarHeight = `60px`;
  const isWujieStatus = computed(() => {
    return isWujie();
  });
  const navbar = computed(() => appStore.navbar);
  const renderMenu = computed(() => appStore.menu && !appStore.topMenu);
  const hideMenu = computed(() => {
    if (isWujieStatus.value) return false;
    return appStore.hideMenu;
  });
  const menuWidth = computed(() => {
    return appStore.menuCollapse ? 48 : appStore.menuWidth;
  });
  const collapsed = computed(() => {
    return appStore.menuCollapse;
  });
  const paddingStyle = computed(() => {
    const paddingLeft =
      renderMenu.value && !hideMenu.value
        ? { paddingLeft: `${menuWidth.value}px` }
        : {};
    const paddingTop = navbar.value
      ? { paddingTop: isWujieStatus.value ? 0 : navbarHeight }
      : {};
    return { ...paddingLeft, ...paddingTop };
  });
  const setCollapsed = (val: boolean) => {
    if (!isInit.value) return; // for page initialization menu state problem
    appStore.updateSettings({ menuCollapse: val });
  };

  const drawerVisible = ref(false);
  const drawerCancel = () => {
    drawerVisible.value = false;
  };
  provide('toggleDrawerMenu', () => {
    drawerVisible.value = !drawerVisible.value;
  });

  const showNotification = (title: any, body: any, icon: any) => {
    notify({
      title,
      body,
      icon,
      // vibrate: [200, 100, 200], // 兼容支持震动的设备
    });
  };
  // Ar眼镜二维码
  const arQrCodeModalVisible = ref(false);

  const handleShowArLoginQrCode = () => {
    arQrCodeModalVisible.value = true;
  };
  const handleArQrCodeModalClose = () => {
    arQrCodeModalVisible.value = false;
  };

  // 刷新业务系统token
  const handleChatTokenExpirationDate = async () => {
    console.log('刷新业务系统token-----------');
    const refreshToken = getRefreshToken();
    const res: any = await userStore.userResetLogin({
      refresh_token: refreshToken,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      return;
    }
    if (res.code === 10909 && !logoutModalVisible.value) {
      handleSetLogoutModal(t('error.logout.title1'), t('error.logout.tips2'));
      logoutModalVisible.value = true;
      return;
    }
    setTokenType(res.data.tokenType);
    setToken(res.data.token);
    setRefreshToken(res.data.refreshToken);
    ChatImSocket?.refreshToken({
      token: res.data.token,
    });
    ThAssistSocket.value?.refreshToken({
      token: res.data.token,
    });
  };
  // 异常退出弹窗-退出
  const handleLogoutOk = async () => {
    logoutModalVisible.value = false;
    logoutModalBtnVisible.value = false;
    await logout();
    clearAll();
  };
  const handleClearSocketModal = () => {
    reconnectModalVisible.value = false;
    reconnectCloseModalVisible.value = false;
  };
  const handleCloseReconnectModal = () => {
    reconnectModalVisible.value = false;
  };

  // 被呼叫弹窗业务
  let answerTimeout: any;
  const handleAnswerTimeout = (data: any) => {
    ThAssistSocket.value.sendAssistInviteeTimeoutEvent({
      meetingNo: data.meetingNo,
      invitor: data.invitor,
    });
    MeetingStore.updateAnswerInfo(null);
    MeetingStore.updateAnswerVisible(false);
  };
  // 接收到被邀请业务
const handleAssistInvited = (data: any) => {
    if (
      (MeetingStore.answerInfo && MeetingStore.answerInfo.meetingNo) ||
      (ThAssistSocket.value &&
        ThAssistSocket.value.meetingInfo &&
        ThAssistSocket.value.meetingInfo.meetingNo)
    ) {
      console.log('接收到被邀请业务-已经在被呼叫中', data);
      // 当前存在邀请/协助
      ThAssistSocket.value.sendAssistInviteeBusyEvent({
        meetingNo: data.meetingNo,
        invitor: data.invitor,
      });
      return;
    }
    const inviter = addressStore.filterMemberInfoByUserId(data.invitor);
    MeetingStore.updateAnswerInfo({
      ...inviter,
      meetingNo: data.meetingNo,
    });
    MeetingStore.updateAnswerVisible(true);
    answerTimeout = setTimeout(() => {
      handleAnswerTimeout(data);
    }, 1000 * MeetingStore.answerTimeoutTime);
    showNotification(
      t('notification.title'),
      t('notification.assist.title'),
      MeetingStore.answerInfo.avatarUrl
    );
  };
  const handleClearAnswerTimeout = () => {
    if (answerTimeout) {
      clearTimeout(answerTimeout);
    }
  };
  // 被邀请人忙碌中
  const handleThAssistInviteeBeBusy = async (data: any) => {
    const member: any = await addressStore.filterMemberInfoByUserId(
      data.invitee
    );
    console.log('被邀请人忙碌中-', member, member?.name, data);
    if (member) {
      Message.warning(`${member.name} ${t('meeting.invite.line.msg1')}`);
    } else {
      Message.warning(`${data.invitee} ${t('meeting.invite.line.msg1')}`);
    }
  };
  // 被邀请人超时未接听
  const handleThAssistInviteeBeTimeout = (data: any) => {
    console.log('被邀请人超时未接听-', data);
    const member: any = addressStore.filterMemberInfoByUserId(data.invitee);
    if (member) {
      Message.warning(`${member.name} ${t('meeting.invite.line.msg2')}`);
    } else {
      Message.warning(`${data.invitee} ${t('meeting.invite.line.msg2')}`);
    }
  };
  // 其他客户端同意
  const handleThAssistOtherClientAccepted = () => {
    Message.warning(`${t('meeting.answer.msg1')}`);
    handleClearAnswerTimeout();
    MeetingStore.updateAnswerInfo(null);
    MeetingStore.updateAnswerVisible(false);
  };
  // 其他客户端拒绝
  const handleThAssistOtherClientRejected = () => {
    Message.warning(`${t('meeting.answer.msg2')}`);
    handleClearAnswerTimeout();
    MeetingStore.updateAnswerInfo(null);
    MeetingStore.updateAnswerVisible(false);
  };
  // 接收到协助关闭
  const handleAssistClosed = (data: any) => {
    if (
      MeetingStore.answerVisible &&
      data.meetingNo === MeetingStore.answerInfo.meetingNo
    ) {
      Message.warning(t('meeting.message.over'));
      MeetingStore.updateAnswerInfo(null);
      MeetingStore.updateAnswerVisible(false);
    }
  };
  // 强制加入会议弹窗-开启
  const handleForceEntryModalOpen = () => {
    forceEntryModalVisible.value = true;
  };
  // 强制加入会议弹窗-关闭
  const handleForceEntryModalClose = (type?: boolean) => {
    forceEntryModalVisible.value = false;
    if (commonStore.notificationId) {
      Notification.remove(commonStore.notificationId);
    }
    if (!type) {
      localStorage.removeItem('meetingInfo');
    }
  };
  const handleForceEntryMeeting = async () => {
    handleForceEntryModalClose(true);
    const res: any = await ThAssistSocket.value.agreeJoinMeeting({
      meetingNo: MeetingStore.forceEntryMeetingInfo.meetingNo,
      invitor: MeetingStore.forceEntryMeetingInfo.userId,
      forceEntryStatus: 1,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      return;
    }
    // todo 加入会议后会的参数 要存到会议翻译的store里
    ThMeetingStore.updateRoomTranslateInfo({
      ...ThMeetingStore.roomTranslateInfo,
      ...res.data,
      open: !!res.data?.enableTranslation
    })
    ThAssistSocket.value.setRoomOnlineListPsn(addressStore.memberList);
    ThAssistSocket.value.setRoomOnlineGroupPsn(addressStore.memberGroupList);
    MeetingStore.updateAnswerVisible(false);
    MeetingStore.updateAnswerInfo(null);
    MeetingStore.updateForceEntryMeetingInfo(null);
    MeetingStore.updateAssistVisible(true);
  };
  const handleChatOtherClientJoinedMeeting = () => {
    handleClearAnswerTimeout();
    handleForceEntryModalOpen();
  };
  // 即将会议弹窗
  const handleThAssistAboutToBegin = (data: any) => {
    MeetingStore.addUpcomingMeetingList(data);
    MeetingStore.updateUpcomingMeetingInfo(data);
    MeetingStore.updateUpcomingMeetingVisible(true);
  };
  const handleOpenUpcomingJoinMeetingModal = async () => {
    if (MeetingStore.answerInfo && MeetingStore.answerInfo.meetingNo) {
      Message.error(t('meeting.call.message.tips'));
      return;
    }
    const data = MeetingStore.upcomingMeetingInfo;
    const member: any = addressStore.filterMemberInfoByUserId(data.master);

    MeetingStore.updateRoomOptions({
      meetingName: data?.subject,
      meetingNo: data?.meetingNo,
      organizer: member?.name,
      cloudRecord: data?.recordStatus === 1,
      abstract: data?.aiStatus === 1,
      escaping: data.escaping === 1,
      video: false,
      audio: true,
      loudspeaker: true,
    });
    upcomingJoinMeetingModalVisible.value = true;
    if (upcomingModalRef.value) {
      upcomingModalRef.value.handleClose();
    }
  };
  const handleUpcomingJoinMeetingModalClose = () => {
    upcomingJoinMeetingModalVisible.value = false;
  };
  const handleUpcomingJoinMeeting = async (data: any) => {
    const res = await ThAssistSocket.value.joinMeeting({
      meetingNo: data.meetingNo,
      forceEntryStatus: 0,
      inviters: [],
    });
    if (res.code !== 200 && res.code !== 401) {
      if (
        res.code === AssistErrorType.OTHER_CLIENT_JOINED_MEETING ||
        res.code === AssistErrorType.OTHER_CLIENT_IN_MEETING
      ) {
        MeetingStore.updateForceEntryMeetingInfo({
          meetingNo: data.meetingNo,
          invitor: [],
        });
        // todo 加入会议后会的参数 要存到会议翻译的store里
        ThMeetingStore.updateRoomTranslateInfo({
          ...ThMeetingStore.roomTranslateInfo,
          ...res.data,
          open: !!res.data?.enableTranslation
        })
        EventListener.emit('Chat-Other-Client-Joined-Meeting');
      } else {
        Message.error(res.msg);
      }
      return;
    }
    // 将业务系统中的获取房间信息，传入ThSDK中
    ThAssistSocket.value.roomMenuOptions = {
      video: MeetingStore.roomOptions?.video,
      audio: MeetingStore.roomOptions?.audio,
      loudspeaker: MeetingStore.roomOptions?.loudspeaker,
    };
    ThAssistSocket.value.setRoomOnlineListPsn(addressStore.memberList);
    ThAssistSocket.value.setRoomOnlineGroupPsn(addressStore.memberGroupList);
    if (upcomingJoinMeetingModalVisible.value) {
      handleUpcomingJoinMeetingModalClose();
    }
    if (upcomingJoinMeetingModalVisible.value) {
      handleUpcomingJoinMeetingModalClose();
    }
    MeetingStore.updateAssistVisible(true);
  };
  const handleThAssistPlanStatusUpdated = () => {
    EventListener.emit('meeting-list-update');
  };
  
  // 处理邀请加入会议
const handleInvitationJoinMeeting = async (data: any) => {
    console.log('收到 invitation-join-meeting 事件，数据:', data);
    if (data.meetingToken) {
      // 如果有 meetingToken，需要先调用 joinMeeting API
      try {
        const { joinMeeting } = await import('@/api/invitation');
        const response = await joinMeeting({
          meetingToken: data.meetingToken,
        });

        if (response.data.code === 200) {
          // 成功获取会议号，执行加入会议逻辑
          const meetingData = {
            meetingNo: response.data.data.meetingNo,
          };
          await handleUpcomingJoinMeeting(meetingData);
        } else {
          Message.error(response.data.msg || '加入会议失败');
        }
      } catch (error: any) {
        console.error('加入会议失败:', error);
        Message.error('加入会议失败');
      }
    } else if (data.meetingNo) {
      // 如果直接有 meetingNo，直接执行加入会议逻辑
      await handleUpcomingJoinMeeting(data);
    }
  };
  const ThMeetingStore = useThMeetingStore();
  const handleThAssistKickOut = (data: any) => {
    if (data.reason === 8) {
      kickOutIcon.value = modalWarningIcon;
      handleSetLogoutModal(t('error.logout.tips3'), t('error.logout.tips6'));
      logoutModalVisible.value = true;
    }
    ThMeetingStore.updateRoomMenuOptionsVideo(false);
    THEventBus.emit('th-self-menu-camera-close');
  };
  // 断线重新登录
  const handleAssistSceneRejoinMeeting = async () => {
    const meetingInfoStr = localStorage.getItem('meetingInfo');
    if (meetingInfoStr) {
      const meetingInfo = JSON.parse(meetingInfoStr);
      const res: any = await ThAssistSocket.value.joinMeeting({
        meetingNo: meetingInfo.meetingNo,
        forceEntryStatus: 0,
        inviters: [],
      });
      if (res.code !== 200 && res.code !== 401) {
        if (
          res.code === AssistErrorType.OTHER_CLIENT_JOINED_MEETING ||
          res.code === AssistErrorType.OTHER_CLIENT_IN_MEETING
        ) {
          MeetingStore.updateForceEntryMeetingInfo({
            meetingNo: meetingInfo.meetingNo,
            invitor: [],
          });
          EventListener.emit('Chat-Other-Client-Joined-Meeting');
        } else {
          // Message.error(res.msg);
          Notification.remove(commonStore.notificationId);
          localStorage.removeItem('meetingInfo');
          THEventBus.emit('th-assist-closed');
        }
        return;
      }
      // 将业务系统中的获取房间信息，传入ThSDK中
      ThAssistSocket.value.roomMenuOptions = {
        video: MeetingStore.roomOptions?.video,
        audio: MeetingStore.roomOptions?.audio,
        loudspeaker: MeetingStore.roomOptions?.loudspeaker,
      };
      ThAssistSocket.value.setRoomOnlineListPsn(addressStore.memberList);
      ThAssistSocket.value.setRoomOnlineGroupPsn(addressStore.memberGroupList);
      ThAssistSocket.value.sendAssistMeetingStatusSyncEvent({
        meetingNo: meetingInfo.meetingNo,
      });
    }
  };

  const handleAssistRejoinMeeting = async () => {
    const meetingInfoStr = localStorage.getItem('meetingInfo');
    if (meetingInfoStr) {
      const meetingInfo = JSON.parse(meetingInfoStr);
      const res: any = await ThAssistSocket.value.joinMeeting({
        meetingNo: meetingInfo.meetingNo,
        forceEntryStatus: 0,
        inviters: [],
      });
      if (res.code !== 200 && res.code !== 401) {
        if (
          res.code === AssistErrorType.OTHER_CLIENT_JOINED_MEETING ||
          res.code === AssistErrorType.OTHER_CLIENT_IN_MEETING
        ) {
          MeetingStore.updateForceEntryMeetingInfo({
            meetingNo: meetingInfo.meetingNo,
            invitor: [],
          });
          EventListener.emit('Chat-Other-Client-Joined-Meeting');
          // todo 加入会议后会的参数 要存到会议翻译的store里
          ThMeetingStore.updateRoomTranslateInfo({
            ...ThMeetingStore.roomTranslateInfo,
            ...meetingInfo,
            open: !!res.data?.enableTranslation
          })
        } else {
          Message.error(res.msg);
          Notification.remove(commonStore.notificationId);
          localStorage.removeItem('meetingInfo');
        }
        return;
      }

      // todo 加入会议后会的参数 要存到会议翻译的store里
      ThMeetingStore.updateRoomTranslateInfo({
        ...ThMeetingStore.roomTranslateInfo,
        languageType: res.data?.languageType,
        industryType: res.data?.industryType,
        ...res.data,
        open: !!res.data?.enableTranslation
      })
      // 将业务系统中的获取房间信息，传入ThSDK中
      ThAssistSocket.value.roomMenuOptions = {
        video: MeetingStore.roomOptions?.video,
        audio: MeetingStore.roomOptions?.audio,
        loudspeaker: MeetingStore.roomOptions?.loudspeaker,
      };
      ThAssistSocket.value.setRoomOnlineListPsn(addressStore.memberList);
      ThAssistSocket.value.setRoomOnlineGroupPsn(addressStore.memberGroupList);
      Notification.remove(commonStore.notificationId);
      MeetingStore.updateAssistVisible(true);
    }
  };

  const handleAssistJoinNotification = () => {
    if (MeetingStore.assistVisible) {
      handleAssistSceneRejoinMeeting();
      return;
    }
    commonStore.updateNotificationId(`${Date.now()}`);
    const meetingInfoStr = localStorage.getItem('meetingInfo');
    if (meetingInfoStr) {
      const meetingInfo = JSON.parse(meetingInfoStr);
      Notification.info({
        id: commonStore.notificationId,
        title: t('notification.assist.join.hint'),
        content: `${t('notification.assist.join.title')} ${
          meetingInfo.subject
        }, ${t('notification.assist.join.title1')}`,
        duration: 0,
        footer: () => (
          <Space>
            <Button
              type="secondary"
              size="small"
              onClick={() => {
                localStorage.removeItem('meetingInfo');
                Notification.remove(commonStore.notificationId);
              }}
            >
              {t('notification.assist.join.label1')}
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={handleAssistRejoinMeeting}
            >
              {t('notification.assist.join.label2')}
            </Button>
          </Space>
        ),
      });
    }
  };

  // 重要数据-人员列表
  const handleGetMemberList = async () => {
    const res: any = await addressStore.getContactsData();
    if (res.code !== 200 && res.code !== 401) {
      return res;
    }
    addressStore.addMemberList(res.data);
    return res;
  };
  // 重要数据-分组
  const handleGetGroupList = async () => {
    const res: any = await addressStore.getContactsGroupData();
    if (res.code !== 200 && res.code !== 401) {
      return res;
    }
    addressStore.addGroupMemberList(res.data);
    return res;
  };
  // 次要数据-获取最近消息
  const handleGetRecentMessage = async (data: {
    groupId?: number;
    userId?: number;
    pageNo: number;
    pageSize: number;
  }) => {
    const res: any = await chatStore.getChatMessageList(data);
    if (res.code !== 200 && res.code !== 401) {
      return res;
    }
    console.log('加载次要数据--最近消息-res', res);
    if (res.data && res.data.length > 0) {
      res.data.forEach(async (message: any) => {
        if (message.chatType === ChatPB.ChatType.GROUP_CHAT) {
          const newMessage = {
            ...message,
            parentId: `${message.chatType}_${data.groupId}`,
          };
          await addMessage(newMessage, false);
        } else {
          const newMessage = {
            ...message,
            parentId: `${message.chatType}_${data.userId}`,
          };
          await addMessage(newMessage, false);
        }
      });
    }
    return res;
  };
  // 重要数据-会话列表
  const handleGetConversationList = async () => {
    const res: any = await chatStore.getChatConversationList();
    if (res.code !== 200 && res.code !== 401) {
      return res;
    }
    console.log('加载重要数据--会话列表-api-res', res);
    if (res.data && res.data.length > 0) {
      await res.data.forEach(async (conversation: any) => {
        await addConversation({
          ...conversation,
          conversationId: `${conversation.chatType}_${conversation.targetId}`,
          status: 1,
        });
        await handleGetRecentMessage({
          userId: conversation.targetId,
          pageNo: 1,
          pageSize: !conversation.unreadCount ? 10 : conversation.unreadCount,
        });
      });
      const conversationList: any = await getAllConversations();
      console.log(
        '加载重要数据--会话列表-db-conversationList',
        conversationList
      );
      chatStore.updateConversationList(conversationList);
    }
    return res;
  };
  // 次要数据-离线消息
  const handleGetOfflineMessage = async () => {
    const params = {
      groupId: '',
      userId: '',
    };
    const res: any = await chatStore.getChatOffLineMessageList(params);
    if (res.code !== 200 && res.code !== 401) {
      return res;
    }
    console.log('加载次要数据--离线消息-res', res);
    if (res.data && res.data.length > 0) {
      await res.data.forEach(async (message: any) => {
        const newMessage = {
          ...message,
          parentId: `${message.chatType}_${
            message.chatType === ChatPB.ChatType.GROUP_CHAT
              ? message.recipientId
              : message.senderId
          }`,
        };
        await addMessage(newMessage, true);
      });
    }
    return res;
  };

  // 远程协助Websocket相关业务初始化
  const handleThImEventOpen = () => {
    console.log('远程协助-Websocket连接打开:Th-im-open-success');
    ThAssistSocket.value.login();
  };
  const handleThLoginSuccess = (data: any) => {
    console.log(
      '远程协助Websocket登录成功:Th-login-success',
      data.lastLoginTime
    );
    commonStore.updateSocketStatus(3);
    const meetingInfoStr = localStorage.getItem('meetingInfo');
    if (meetingInfoStr) {
      const curMeetingInfo = JSON.parse(meetingInfoStr);
      if (curMeetingInfo.selfUserId === userStore.userId) {
        handleAssistJoinNotification();
      } else {
        localStorage.removeItem('meetingInfo');
      }
    }
  };
  const handleSocketReconnect = (data: any) => {
    console.log('Socket异常连接关闭触发-重新连接中-layout...', data);
    retryCount.value = data.retryCount;
    if (retryCount.value !== 0) {
      return;
    }
    reconnectModalVisible.value = true;
  };
  // Socket异常连接关闭
  const handleServeErrorClose = (data: any) => {
    if (reconnectModalVisible.value) {
      reconnectModalVisible.value = false;
    }
    console.log('Socket异常连接关闭-业务逻辑', data);
    reconnectCloseModalVisible.value = true;
    ChatImSocket?.logout();
  };
  // Socket重新结束后-重新连接事件
  const handleServeErrorReconnect = () => {
    reconnectCloseModalVisible.value = false;
    ChatImSocket.chatWssReconnect();
  };
  // 远程协助Websocket监听事件
  const handleMonitorImEvent = () => {
    THEventBus.on('ThAssistImWsOpen', handleThImEventOpen);
    THEventBus.on('ThAssistLoginSuccess', handleThLoginSuccess);
    // THEventBus.on('ThAssistImWsClose', handleServeErrorClose);
    THEventBus.on('ThAssistInvited', handleAssistInvited);
    THEventBus.on('ThAssistInviteeBeBusy', handleThAssistInviteeBeBusy);
    THEventBus.on('ThAssistInviteeBeTimeout', handleThAssistInviteeBeTimeout);
    THEventBus.on(
      'ThAssistOtherClientAccepted',
      handleThAssistOtherClientAccepted
    );
    THEventBus.on(
      'ThAssistOtherClientRejected',
      handleThAssistOtherClientRejected
    );
    THEventBus.on('ThAssistClosed', handleAssistClosed);
    THEventBus.on('ThAssistAboutToBegin', handleThAssistAboutToBegin);
    THEventBus.on('ThAssistPlanStatusUpdated', handleThAssistPlanStatusUpdated);
    THEventBus.on('ThAssistKickOut', handleThAssistKickOut);
  };
  // 远程协助Websocket监听事件-移除
  const handleMonitorImEventOff = () => {
    THEventBus.off('ThAssistImWsOpen', handleThImEventOpen);
    THEventBus.off('ThAssistLoginSuccess', handleThLoginSuccess);
    // THEventBus.off('ThAssistImWsClose', handleServeErrorClose);
    THEventBus.off('ThAssistInvited', handleAssistInvited);
    THEventBus.off('ThAssistInviteeBeBusy', handleThAssistInviteeBeBusy);
    THEventBus.off('ThAssistInviteeBeTimeout', handleThAssistInviteeBeTimeout);
    THEventBus.off(
      'ThAssistOtherClientAccepted',
      handleThAssistOtherClientAccepted
    );
    THEventBus.off(
      'ThAssistOtherClientRejected',
      handleThAssistOtherClientRejected
    );
    THEventBus.off('ThAssistClosed', handleAssistClosed);
    THEventBus.off('ThAssistAboutToBegin', handleThAssistAboutToBegin);
    THEventBus.off(
      'ThAssistPlanStatusUpdated',
      handleThAssistPlanStatusUpdated
    );
    THEventBus.off('ThAssistKickOut', handleThAssistKickOut);
  };
  const { appConfig } = useWujieTools();
  // 远程协助Websocket-初始化建立连接
  const handleInitTHImEvent = async () => {
    let wssUrl = '';
    if (isWujie()) {
      wssUrl = `wss://${getSocketHost()}/socket`;
    } else {
      wssUrl = `wss://${getSocketHost()}/socket`;
    }
    ThAssistSocket.value = new THImEvent({
      wssUrl,
      userId: userStore.userId as number,
      token: getToken(),
    });
    MeetingStore.updateThImEvent(ThAssistSocket.value);
    ThAssistSocket.value.initWss();
    handleMonitorImEvent();
  };
  // 即时通讯websocket相关业务初始化
  const handleChatWsOpen = () => {
    console.log('即时通讯-websocket-连接打开:handleChatWsOpen');
    commonStore.updateSocketStatus(2);
    ChatImSocket.login();
  };
  // 即时通讯websocket-登录成功
  const handleChatLoginSuccess = async (data: any) => {
    await handleClearThImEventStatus();
    commonStore.updateLastLoginTime(data.lastLoginTime);
    handleClearSocketModal();
    handleInitTHImEvent();
  };
  // 接收到登出成功事件
  const handleChatLogoutSucceed = (data: any) => {
    console.log('接收到登出成功事件-业务逻辑', data);
  };

  // 发生异常-被踢下线事件
  const handleChatKickOut = (data: any) => {
    if (logoutModalVisible.value) {
      return;
    }
    console.log(
      '接收到被踢下线事件-业务逻辑',
      data,
      ChatPB.KickOutReason.DUPLICATE_LOGIN
    );
    if (data.reason === ChatPB.KickOutReason.DUPLICATE_LOGIN) {
      kickOutIcon.value = modalWarningIcon;
      handleSetLogoutModal(t('error.logout.tips3'), t('error.logout.tips3'));
      logoutModalBtnVisible.value = true;
    } else {
      handleSetLogoutModal(t('error.logout.title'), t('error.logout.tips5'));
      logoutModalBtnVisible.value = true;
    }

    logoutModalVisible.value = true;
    ChatImSocket?.logout();
  };
  // Chat发生异常
  const handelChatWsError = () => {
    commonStore.updateSocketStatus(1);
  };
  // 创建群事件
  const handleChatGroupCreated = async (data: any) => {
    // 处理存储桶key转换
    const conversationData = {
      conversationId: `${data.chatType}_${data.targetId}`,
      ...data,
      status: 1,
      unreadCount: 0,
    };

    // 如果 targetAvatarUrl 是存储桶key，需要转换为预览URL
    const { targetAvatarUrl } = data;
    if (targetAvatarUrl && isBucketKey(targetAvatarUrl)) {
      try {
        const response = await getBatchPreviewUrls({
          objectKeys: [targetAvatarUrl],
        });

        if (response?.data?.[targetAvatarUrl]?.previewUrl) {
          conversationData.targetAvatarUrl = response.data[targetAvatarUrl].previewUrl;
        }
      } catch (error) {
        console.error('转换存储桶key为预览URL失败:', error);
      }
    }

    await addConversation(conversationData);
    
    const parentId = `${data.chatType}_${
      data.chatType === ChatPB.ChatType.GROUP_CHAT
        ? data.targetId
        : data.senderId
    }`;
    await addMessage(
      {
        chatType: data.chatType,
        recipientId: data.targetId,
        content: data.content,
        fingerPrint: data.fp,
        messageType: data.messageType,
        sendTime: data.sendTime,
        senderId: ChatPB.Client.SERVER,
        parentId,
        status: 0,
        name: '',
        avatarUrl: '',
      },
      !chatStore.curConversation ||
        !chatStore.curConversation.conversationId ||
        chatStore.curConversation.conversationId !== parentId
    );
    // 更新会议列表数据
    const list = await getAllConversations();
    chatStore.updateConversationList(list);
  };
  // 群组信息更新事件
  const handleGroupChatGroupInfoUpdated = async (data: any) => {
    console.log('群组信息更新事件', data, chatStore.conversationList);
    const conversation: any = chatStore.conversationList.find(
      (item: any) =>
        item.conversationId === `${ChatPB.ChatType.GROUP_CHAT}_${data.groupId}`
    );
    console.log('群组信息更新事件-conversation', conversation);

    // 处理存储桶key转换
    const { avatarUrl: originalAvatarUrl, groupName } = data;
    let avatarUrl = originalAvatarUrl;
    if (avatarUrl && isBucketKey(avatarUrl)) {
      try {
        const response = await getBatchPreviewUrls({
          objectKeys: [avatarUrl],
        });

        if (response?.data?.[avatarUrl]?.previewUrl) {
          avatarUrl = response.data[avatarUrl].previewUrl;
        }
      } catch (error) {
        console.error('转换存储桶key为预览URL失败:', error);
      }
    }

    chatStore.updateConversations({
      ...conversation,
      targetAvatarUrl: avatarUrl,
      targetName: groupName,
    });
    EventListener.emit('group-info-change');
  };
  const handleShowMessageNotify = async (data: any) => {
    const member = await addressStore.filterMemberInfoByUserId(data.senderId);
    showNotification(t('notification.title'), data.content, member?.avatarUrl);
  };
  // 接收聊天信息
  const handleChatMessageReceive = async (data: any) => {
    let newData: any;
    if (data.chatType === ChatPB.ChatType.GROUP_CHAT) {
      console.log('接收聊天信息-群聊', data);
      newData = {
        ...data,
        parentId: `${data.chatType}_${data.recipientId}`,
      };
    } else if (data.chatType === ChatPB.ChatType.PRIVATE_CHAT) {
      console.log('接收聊天信息-单聊');
      const member = await addressStore.filterMemberInfoByUserId(data.senderId);
      newData = {
        ...data,
        parentId: `${data.chatType}_${data.senderId}`,
        sendId: data.senderId,
        name: member?.name,
        avatarUrl: member?.avatarUrl,
      };
    }
    addMessage(
      newData,
      !chatStore.curConversation ||
        !chatStore.curConversation.conversationId ||
        chatStore.curConversation.conversationId !== newData.parentId
    );

    const conversationList = await getAllConversations();
    chatStore.updateConversationList(conversationList);
    EventListener.emit('group-info-change');
    handleShowMessageNotify(data);
  };
  // 人员上线事件
  const handleChatUserOnline = (data: any) => {
    addressStore.updateMemberStatus(data, true);
  };
  // 人员下线事件
  const handleChatUserOffline = (data: any) => {
    addressStore.updateMemberStatus(data, false);
  };
  // 通讯录更新-事件
  const handleChatContactUpdated = () => {
    handleGetMemberList();
    handleGetGroupList();
  };
  // 群成员踢出事件
  const handleChatGroupMemberRemoved = (data: any) => {
    console.log('群成员踢出事件-handleChatGroupMemberRemoved', data);
    addMessage(
      data,
      !chatStore.curConversation ||
        !chatStore.curConversation.conversationId ||
        chatStore.curConversation.conversationId !== data.parentId
    );
    EventListener.emit('group-info-change', data);
  };
  // 群成员邀请事件
  const handleChatGroupMemberInvited = async (data: any) => {
    console.log('群成员邀请事件：handleChatGroupMemberInvited', data);
    await addMessage(
      data,
      !chatStore.curConversation ||
        !chatStore.curConversation.conversationId ||
        chatStore.curConversation.conversationId !== data.parentId
    );
    EventListener.emit('group-info-change', data);
  };
  // 群主变更事件
  const handleChatGroupMasterChanged = (data: any) => {
    console.log('群主变更事件：handleChatGroupMasterChanged', data);
    addMessage(
      data,
      !chatStore.curConversation ||
        !chatStore.curConversation.conversationId ||
        chatStore.curConversation.conversationId !== data.parentId
    );
    EventListener.emit('group-info-change', data);
  };
  // 群失效事件
  const handleChatGroupDisbanded = (data: any) => {
    console.log('群失效事件：handleChatGroupDisbanded', data);
    addMessage(
      data,
      !chatStore.curConversation ||
        !chatStore.curConversation.conversationId ||
        chatStore.curConversation.conversationId !== data.parentId
    );
    EventListener.emit('group-info-change', data);
  };
  // 群成员退出
  const handleChatGroupMemberQuit = (data: any) => {
    addMessage(
      data,
      !chatStore.curConversation ||
        !chatStore.curConversation.conversationId ||
        chatStore.curConversation.conversationId !== data.parentId
    );
    EventListener.emit('group-info-change', data);
  };
  // 回复聊天消息ACK
  const handleChatSendAckMessage = (data: any) => {
    ChatImSocket.sendAckMessage(data);
  };
  // 发送聊天消息
  const handleChatSendMessage = (message: any) => {
    console.log('发送聊天消息', message);
    ChatImSocket.sendMessage(message);
  };
  const handleChatConversationRead = (data: any) => {
    ChatImSocket.sendChatReceivedMessageReadEvent({
      targetId: data.targetId,
      chatType: data.chatType,
    });
  };
  // 限时通讯websocket关闭事件
  const handleChatWsClose = () => {
    commonStore.updateSocketStatus(1);
  };
  // 清除   Notification
  const handleClearNotification = () => {
    if (commonStore.notificationId) {
      Notification.remove(commonStore.notificationId);
    }
  };
  // 即时通讯聊天Socket事件监听事件
  const handleMonitorChatEvent = async () => {
    EventListener.on('ChatWsOpen', handleChatWsOpen);
    EventListener.on('ChatLoginSuccess', handleChatLoginSuccess);
    EventListener.on('ChatWsClose', handleChatWsClose);
    EventListener.on('im-ws-reconnect-start', handleSocketReconnect);
    EventListener.on('im-ws-reconnect-failed', handleServeErrorClose);
    EventListener.on('ChatWsError', handelChatWsError);
    EventListener.on('ChatTokenExpirationDate', handleChatTokenExpirationDate);
    EventListener.on('ChatLogoutSucceed', handleChatLogoutSucceed);
    EventListener.on('ChatKickOut', handleChatKickOut);
    EventListener.on('GroupCreatedEvent', handleChatGroupCreated);
    EventListener.on(
      'GroupChatGroupInfoUpdated',
      handleGroupChatGroupInfoUpdated
    );
    EventListener.on('ChatImSendAckMessage', handleChatSendAckMessage);
    EventListener.on('ChatSendMessage', handleChatSendMessage);
    EventListener.on('ChatConversationRead', handleChatConversationRead);
    EventListener.on('ChatMessageReceive', handleChatMessageReceive);
    EventListener.on('ChatGroupMemberRemoved', handleChatGroupMemberRemoved);
    EventListener.on('ChatGroupMemberInvited', handleChatGroupMemberInvited);
    EventListener.on('ChatGroupMasterChanged', handleChatGroupMasterChanged);
    EventListener.on('ChatGroupDisbanded', handleChatGroupDisbanded);
    EventListener.on('ChatGroupMemberQuit', handleChatGroupMemberQuit);
    EventListener.on('ChatUserOnline', handleChatUserOnline);
    EventListener.on('ChatUserOffline', handleChatUserOffline);
    EventListener.on('ChatContactUpdated', handleChatContactUpdated);
    EventListener.on('Chat-answer-agree', handleClearAnswerTimeout);
    EventListener.on('Chat-answer-hangup', handleClearAnswerTimeout);
    EventListener.on(
      'Chat-Other-Client-Joined-Meeting',
      handleChatOtherClientJoinedMeeting
    );
    EventListener.on(
      'Chat-upcoming-meeting-join',
      handleOpenUpcomingJoinMeetingModal
    );
    EventListener.on('navbar-show-ar-login-qr-code', handleShowArLoginQrCode);
    EventListener.on('meeting-notification-close', handleClearNotification);
  };
  // 即时通讯聊天Socket事件监听事件-清除
  const handleClearMonitorChatEvent = async () => {
    EventListener.off('ChatWsOpen', handleChatWsOpen);
    EventListener.off('ChatLoginSuccess', handleChatLoginSuccess);
    EventListener.off('ChatWsClose', handleChatWsClose);
    EventListener.off('im-ws-reconnect-start', handleSocketReconnect);
    EventListener.off('im-ws-reconnect-failed', handleServeErrorClose);
    EventListener.off('ChatWsError', handelChatWsError);
    EventListener.off('ChatTokenExpirationDate', handleChatTokenExpirationDate);
    EventListener.off('ChatLogoutSucceed', handleChatLogoutSucceed);
    EventListener.off('ChatKickOut', handleChatKickOut);
    EventListener.off('GroupCreatedEvent', handleChatGroupCreated);
    EventListener.off(
      'GroupChatGroupInfoUpdated',
      handleGroupChatGroupInfoUpdated
    );
    EventListener.off('ChatImSendAckMessage', handleChatSendAckMessage);
    EventListener.off('ChatSendMessage', handleChatSendMessage);
    EventListener.off('ChatConversationRead', handleChatConversationRead);
    EventListener.off('ChatMessageReceive', handleChatMessageReceive);
    EventListener.off('ChatGroupMemberRemoved', handleChatGroupMemberRemoved);
    EventListener.off('ChatGroupMemberInvited', handleChatGroupMemberInvited);
    EventListener.off('ChatGroupMasterChanged', handleChatGroupMasterChanged);
    EventListener.off('ChatGroupDisbanded', handleChatGroupDisbanded);
    EventListener.off('ChatGroupMemberQuit', handleChatGroupMemberQuit);
    EventListener.off('ChatUserOnline', handleChatUserOnline);
    EventListener.off('ChatUserOffline', handleChatUserOffline);
    EventListener.off('ChatContactUpdated', handleChatContactUpdated);
    EventListener.off('Chat-answer-agree', handleClearAnswerTimeout);
    EventListener.off('Chat-answer-hangup', handleClearAnswerTimeout);
    EventListener.off(
      'Chat-Other-Client-Joined-Meeting',
      handleChatOtherClientJoinedMeeting
    );
    EventListener.off(
      'Chat-upcoming-meeting-join',
      handleOpenUpcomingJoinMeetingModal
    );
    EventListener.off('navbar-show-ar-login-qr-code', handleShowArLoginQrCode);
    EventListener.off('meeting-notification-close', handleClearNotification);
    EventListener.off('invitation-join-meeting', handleInvitationJoinMeeting);
  };
  // 即时通讯 websocket 初始化建立连接
  const handleInitChatImEvent = async () => {
    console.log('即时通讯-初始化建-websocket');
    commonStore.updateSocketStatus(2);
    let wssChatUrl = '';
    if (isWujie()) {
      wssChatUrl = `wss://${getSocketHost()}/chat-socket`;
    } else {
      wssChatUrl = `wss://${getSocketHost()}/chat-socket`;
    }

    ChatImSocket = new MessageWs({
      wssUrl: wssChatUrl,
      userId: userStore.userId as number,
      token: getToken(),
    });
    ChatImSocket.initChatWss();
    handleMonitorChatEvent();
  };
  //
  const handleClearInitEvent = () => {
    handleClearThImEventStatus();
    handleClearChatImEventStatus();
  };
  handleClearThImEventStatus = async () => {
    handleMonitorImEventOff();
    if (ThAssistSocket.value) {
      await ThAssistSocket.value.logout();
    }
    MeetingStore.updateThImEvent(null);
  };
  handleClearChatImEventStatus = () => {
    handleClearMonitorChatEvent();
    if (ChatImSocket) {
      ChatImSocket.logout();
    }
    chatStore.updateChatImEvent(null);
  };
  const handleSysNoPermissionAccess = () => {
    window.open('/assist/#/NoPermission', '_self');
  };
  // 加载重要数据
  const handleInitImportantData = async () => {
    commonStore.updateSocketStatus(2);
    importantDataReloadNum.value += 1;
    if (importantDataReloadNum.value > 3) {
      handleSetLogoutModal(t('error.logout.title1'), t('error.logout.tips4'));
      if (logoutModalVisible.value) {
        return;
      }
      logoutModalVisible.value = true;
      return;
    }
    const [memberRes, groupListRes] = await Promise.all([
      await handleGetMemberList(),
      await handleGetGroupList(),
    ]);
    console.log('加载重要数据-memberRes&groupListRes', memberRes, groupListRes);
    if (memberRes.code === 403 || groupListRes.code === 403) {
      handleSysNoPermissionAccess();
      return;
    }
    if (memberRes.code === 200 && groupListRes.code === 200) {
      const conversationRes = await handleGetConversationList();
      console.log('加载重要数据-conversationRes', conversationRes);
      if (conversationRes.code === 200) {
        await handleGetOfflineMessage();
        handleInitChatImEvent();
        importantDataReloadNum.value = 0;
      } else {
        handleInitImportantData();
      }
    } else if (memberRes.code !== 401 || groupListRes.code !== 401) {
      handleInitImportantData();
    }
  };
  const handleNetworkStatusChange = () => {
    console.log('handleNetworkStatusChange', navigator.onLine);
    commonStore.updateNetworkStatus(navigator.onLine);
    addressStore.updateMemberStatus(
      {
        client: ChatPB.Client.PC,
        userId: userStore.userId as number,
      },
      navigator.onLine
    );
  };
  // 在线状态-在线
  const handleNetworkOnline = () => {
    handleNetworkStatusChange();
  };
  // 在线状态-离线
  const handleNetworkOffline = () => {
    handleNetworkStatusChange();
  };
  const handleAddNetworkListeners = () => {
    window.addEventListener('online', handleNetworkOnline);
    window.addEventListener('offline', handleNetworkOffline);
  };
  const handleClearNetworkListeners = () => {
    window.removeEventListener('online', handleNetworkOnline);
    window.removeEventListener('offline', handleNetworkOffline);
  };

  // const reloadNum = ref(0);
  // const handleSysResetLogin = async () => {
  //   if (logoutModalVisible.value) {
  //     return;
  //   }
  //   const refreshToken = getRefreshToken();
  //   const res: any = await userStore.userResetLogin({
  //     refresh_token: refreshToken,
  //   });

  //   if (res.code !== 200 && res.code !== 401) {
  //     if (res.code !== 10909) {
  //       reloadNum.value += 1;
  //       if (reloadNum.value > 5 || res.code !== 20401) {
  //         if (logoutModalVisible.value) {
  //           return;
  //         }
  //         handleSetLogoutModal(
  //           t('error.logout.title1'),
  //           t('error.logout.tips2')
  //         );
  //         logoutModalVisible.value = true;
  //         return;
  //       }
  //       setTimeout(() => {
  //         handleSysResetLogin();
  //       }, 1000 * 10);
  //     } else {
  //       if (logoutModalVisible.value) {
  //         return;
  //       }
  //       handleSetLogoutModal(t('error.logout.title1'), t('error.logout.tips2'));
  //       logoutModalVisible.value = true;
  //     }
  //   } else if (res.code === 200) {
  //     setTokenType(res.data.tokenType);
  //     setToken(res.data.token);
  //     setRefreshToken(res.data.refreshToken);
  //     if (ChatImSocket && ThAssistSocket.value) {
  //       ChatImSocket?.refreshToken({
  //         token: res.data.token,
  //       });
  //       ThAssistSocket.value?.refreshToken({
  //         token: res.data.token,
  //       });
  //     } else {
  //       window.location.reload();
  //     }
  //   }
  // };

  const handleSysResetLogin = async () => {
    console.log(sessionStorage.getItem('refreshTokenStatus'));
    if (sessionStorage.getItem('refreshTokenStatus') !== '1') {
      sessionStorage.setItem('refreshTokenStatus', '1');
      const res: any = await userStore.userResetLogin({
        refresh_token: getRefreshToken() ? getRefreshToken() : '',
      });
      sessionStorage.setItem('refreshTokenStatus', '0');
      if (res.code === 200) {
        setTokenType(res.data.tokenType);
        setToken(res.data.token);
        setRefreshToken(res.data.refreshToken);
        if (ChatImSocket && ThAssistSocket.value) {
          ChatImSocket?.refreshToken({
            token: res.data.token,
          });
          ThAssistSocket.value?.refreshToken({
            token: res.data.token,
          });
        } else {
          window.location.reload();
        }
      } else {
        clearToken();
        router.push({
          path: '/login',
        });
      }
    }
  };
  const handleSysApplicationDisabled = () => {
    if (logoutModalVisible.value) {
      return;
    }
    handleSetLogoutModal(t('error.logout.title1'), t('error.logout.tips6'));
    logoutModalVisible.value = true;
  };

  const handleMonitorSystemEventListener = () => {
    EventListener.on('sys-user-reset-login', handleSysResetLogin);
    EventListener.on('sys-application-disabled', handleSysApplicationDisabled);
    EventListener.on('sys-no-permission-access', handleSysNoPermissionAccess);
  };
  const handleClearMonitorSystemEventListener = () => {
    EventListener.off('sys-user-reset-login', handleSysResetLogin);
    EventListener.off('sys-application-disabled', handleSysApplicationDisabled);
    EventListener.off('sys-no-permission-access', handleSysNoPermissionAccess);
  };
  window.addEventListener('storage', (e) => {
    // 检查当前是否在邀请页面，如果是则跳过冲突检测
    const currentPath = window.location.hash;
    if (currentPath.includes('#/invitation')) {
      return;
    }
    
    const tokenValue = ref(getToken());
    const localTime: any = getLocalTimestamp();
    const sessionTime: any = getSessionTimestamp();
    if (e.key === 'token') {
      if (localTime !== sessionTime) {
        router.push({
          name: 'login',
        });
      } else {
        tokenValue.value = e.newValue;
        window.location.reload();
      }
    }
    // if (e.key === 'arco-locale') {
    //   if (
    //     localStorage.getItem('mst-locale') &&
    //     localStorage.getItem('arco-locale') !==
    //       localStorage.getItem('mst-locale')
    //   ) {
    //     localStorage.setItem(
    //       'mst-locale',
    //       localStorage.getItem('arco-locale') ?? ''
    //     );
    //   }
    // }
    if (e.key === 'ASSIST_APP') {
      if (localTime !== sessionTime) {
        router.push({
          name: 'login',
        });
      }
    }
  });
  /**
   * @description 获取语言列表和行业列表
   */
  async function fetchTransLateInfo() {
    const languageRes: any = await MeetingStore.getLanguageList();
    const industryRes: any = await MeetingStore.getIndustryList();
    if (languageRes.code === 200 && industryRes.code === 200) {
      MeetingStore.updateLanguageList(languageRes.data);
      MeetingStore.updateIndustryList(industryRes.data);
    }
  }
  onMounted(async () => {
    requestPermission();
    handleMonitorSystemEventListener();
    handleNetworkStatusChange();
    handleAddNetworkListeners();
    
    // 立即注册事件监听器，确保能接收到邀请加入会议事件
    EventListener.on('invitation-join-meeting', handleInvitationJoinMeeting);
    console.log('已注册 invitation-join-meeting 事件监听器');
    
    // 获取重要数据
    if (!isInit.value) {
      console.log('首次加载重要数据');
      // 首次
      await clearAll();
      await handleInitImportantData();
      //
      // setTimeout(() => {
      // }, 1000)
    }
    isInit.value = true;
    fetchTransLateInfo();
  });
  onBeforeUnmount(() => {
    handleClearMonitorSystemEventListener();
    handleClearInitEvent();
    handleClearNotification();
    handleClearNetworkListeners();
    EventListener.off('invitation-join-meeting', handleInvitationJoinMeeting);
    importantDataReloadNum.value = 0;
    isInit.value = false;
    logoutModalBtnVisible.value = false;
  });

  // todo 监听微应用切换语言事件
  useWujieOnChangeLocal();
</script>

<style scoped lang="less">
  @nav-size-height: 60px;
  @layout-max-width: 1100px;

  .layout {
    width: 100%;
    height: 100%;
    &.remote-micro-app-layout {
      .layout-sider {
        position: unset;
        padding-top: 0 !important;
        height: unset;
        background-color: var(--color-fill-2);
        box-shadow: unset !important;
      }
      .arco-layout {
        height: 100%;
      }
      .layout-content {
        min-height: 100%;
        padding-left: 0 !important;
      }
    }
  }

  .layout-navbar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    height: @nav-size-height;
  }

  .layout-sider {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
    height: 100%;
    transition: all 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);

    &::after {
      position: absolute;
      top: 0;
      right: -1px;
      display: block;
      width: 1px;
      height: 100%;
      background-color: var(--color-border);
      content: '';
    }

    > :deep(.arco-layout-sider-children) {
      overflow-y: hidden;
    }
  }

  .menu-wrapper {
    height: 100%;
    overflow: auto;
    overflow-x: hidden;

    :deep(.arco-menu) {
      ::-webkit-scrollbar {
        width: 12px;
        height: 4px;
      }

      ::-webkit-scrollbar-thumb {
        border: 4px solid transparent;
        background-clip: padding-box;
        border-radius: 7px;
        background-color: var(--color-text-4);
      }

      ::-webkit-scrollbar-thumb:hover {
        background-color: var(--color-text-3);
      }
    }
  }

  .layout-content {
    min-height: 100vh;
    overflow-y: hidden;
    background-color: var(--color-fill-2);
    transition: padding 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);
  }
  .modal-content {
    .modal-content-top {
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .modal-content-desc {
      margin-bottom: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      .modal-content-desc-b {
        max-width: 300px;
        span {
          font-weight: 500;
          font-size: 16px;
          color: #333f4e;
        }
      }
    }
    .errorMessage {
      margin-bottom: 27px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 400;
      font-size: 12px;
      color: #6c747f;
    }
    .modal-content-bot {
      display: flex;
      align-items: center;
      justify-content: center;
      .modal-content-bot-i {
        margin: 0 6px;
        min-width: 82px;
        button {
          width: 100%;
        }
      }
    }
  }

  .custom-modal {
    width: 398px !important;
    .modal-content {
      padding-top: 37px;
      .modal-content-bot {
        margin-top: 52px;
      }
    }
  }
  .upcoming-modal {
    position: absolute;
    z-index: 50;
    bottom: 14px;
    right: 12px;
    width: 276px;
    min-height: 173px;
  }
</style>
