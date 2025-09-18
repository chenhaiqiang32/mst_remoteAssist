import { v4 as uuidv4 } from 'uuid';
import * as ChatPB from '@/utils/proto/chatProtocol';
import ChatIMWebSocketService from '@/utils/service/websocketService';
import EventListener from '@/utils/event-listener';
import Long from 'long';

export default class ChatIM {
  private webSocketService: any = null;

  private wssUrl: string;

  public userId: number;

  private token: any;

  private intervalHeart: NodeJS.Timeout | null = null;

  private lastLoginTime: any;

  private messageMap: Map<
    string,
    { timestamp: number; retries: number; data: any }
  > = new Map();

  constructor(data: {
    wssUrl: string;
    userId: number;
    token: any;
    hostUrl?: any;
  }) {
    const { wssUrl, userId, token } = data;
    this.wssUrl = wssUrl;
    this.userId = userId;
    this.token = token;
    this.handleChatWsOpen = this.handleChatWsOpen.bind(this);
    this.handleChatWsMessage = this.handleChatWsMessage.bind(this);
    this.handleChatWsClose = this.handleChatWsClose.bind(this);
    this.handleChatWsError = this.handleChatWsError.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  private handleChatWsOpen() {
    EventListener.emit('ChatWsOpen', 'Chat WebSocket connection opened');
  }

  // eslint-disable-next-line class-methods-use-this
  private handleChatWsMessage(_data: any) {
    const { data } = _data;
    console.log('chat-message--handleChatWsMessage', data);
    const proContent = ChatPB.Protocol.decode(data);
    if (ChatPB.EventType.ACK === proContent.type) {
      const dataContent = ChatPB.AckEvent.decode(proContent.event);
      const messageInfo = this.messageMap.get(dataContent.fp);
      console.log('ChatPB.EventType.ACK', messageInfo);
      if (messageInfo) {
        this.messageMap.delete(dataContent.fp);
        EventListener.emit('ChatMessageStatus', {
          fp: dataContent.fp,
          status: true,
        });
      }
    }
    if (
      ChatPB.EventType.ACK !== proContent.type &&
      ChatPB.EventType.HEARTBEAT_PONG !== proContent.type
    ) {
      // console.log('----handleChatWsMessage----proContent-', proContent);
      // 回复ACK
      this.sendAckMessage({
        fp: proContent.fp,
        timestamp: Long.fromValue(proContent.timestamp).toNumber(),
      });
    }
    if (ChatPB.EventType.LOGIN_SUCCEED === proContent.type) {
      // 登录成功
      const dataContent = ChatPB.LoginSucceedEvent.decode(proContent.event);
      this.lastLoginTime = Long.fromValue(dataContent.lastLoginTime).toNumber();
      console.log('即时通讯-websocket-登录成功-服务端返回值', {
        ...dataContent,
        lastLoginTime: Long.fromValue(dataContent.lastLoginTime).toNumber(),
      });
      EventListener.emit('ChatLoginSuccess', {
        ...dataContent,
        lastLoginTime: Long.fromValue(dataContent.lastLoginTime).toNumber(),
      });
      this.heartInterval();
    }
    if (ChatPB.EventType.TOKEN_EXPIRATION_DATE === proContent.type) {
      const dataContent = ChatPB.TokenExpirationDateEvent.decode(
        proContent.event
      );
      console.log('接收到Token事件-TOKEN_EXPIRATION_DATE', dataContent);
      EventListener.emit('ChatTokenExpirationDate', dataContent);
    }
    if (ChatPB.EventType.LOGOUT_SUCCEED === proContent.type) {
      // 接收到登出成功事件
      const dataContent = ChatPB.LogoutSucceedEvent.decode(proContent.event);
      console.log('接收到登出成功事件-LOGOUT_SUCCEED', dataContent);
      EventListener.emit('ChatLogoutSucceed', dataContent);
    }
    if (ChatPB.EventType.KICK_OUT === proContent.type) {
      const dataContent = ChatPB.KickOutEvent.decode(proContent.event);
      console.log('踢下线事件-KICK_OUT', dataContent);
      EventListener.emit('ChatKickOut', dataContent);
    }
    if (ChatPB.EventType.CONTACT_UPDATED === proContent.type) {
      console.log('通讯录发生变化-CONTACT_UPDATED', proContent);
      EventListener.emit('ChatContactUpdated');
    }

    if (ChatPB.EventType.CHAT_USER_ONLINE === proContent.type) {
      // 用户上线
      const dataContent = ChatPB.UserOnlineEvent.decode(proContent.event);
      // console.log('用户上线-CHAT_USER_ONLINE', dataContent, {
      //   client: dataContent.client,
      //   userId: Long.fromValue(dataContent.userId).toNumber(),
      // });
      EventListener.emit('ChatUserOnline', {
        client: dataContent.client,
        userId: Long.fromValue(dataContent.userId).toNumber(),
      });
    }
    if (ChatPB.EventType.CHAT_USER_OFFLINE === proContent.type) {
      const dataContent = ChatPB.UserOfflineEvent.decode(proContent.event);
      console.log('用户下线-CHAT_USER_OFFLINE', dataContent, {
        client: dataContent.client,
        userId: Long.fromValue(dataContent.userId).toNumber(),
      });
      EventListener.emit('ChatUserOffline', {
        client: dataContent.client,
        userId: Long.fromValue(dataContent.userId).toNumber(),
      });
    }
    if (ChatPB.EventType.CHAT_GROUP_CREATED === proContent.type) {
      const dataContent = ChatPB.GroupCreatedEvent.decode(proContent.event);
      console.log('群组创建事件-CHAT_GROUP_CREATED-dataContent', dataContent);
      const userIds: any = [];
      dataContent.userIds.forEach((userId: any) => {
        userIds.push(Long.fromValue(userId).toNumber());
      });
      const content = {
        eventType: proContent.type,
        eventData: {
          ...dataContent,
          groupId: Long.fromValue(dataContent.groupId).toNumber(),
          masterId: Long.fromValue(dataContent.masterId).toNumber(),
          timestamp: Long.fromValue(dataContent.timestamp).toNumber(),
          userIds,
        },
      };
      EventListener.emit('GroupCreatedEvent', {
        fp: proContent.fp,
        targetId: Long.fromValue(dataContent.groupId).toNumber(),
        chatType: ChatPB.ChatType.GROUP_CHAT,
        targetAvatarUrl: dataContent.avatarUrl,
        targetName: dataContent.groupName,
        name: '',
        messageType: ChatPB.MessageType.SYSTEM,
        content: JSON.stringify(content),
        sendTime: Long.fromValue(dataContent.timestamp).toNumber(),
        unreadCount: 0,
      });
    }
    if (ChatPB.EventType.CHAT_GROUP_INFO_UPDATED === proContent.type) {
      const dataContent = ChatPB.GroupInfoUpdatedEvent.decode(proContent.event);
      console.log('群组信息更新事件-CHAT_GROUP_INFO_UPDATED', dataContent);
      EventListener.emit('GroupChatGroupInfoUpdated', {
        ...dataContent,
        groupId: Long.fromValue(dataContent.groupId).toNumber(),
      });
    }
    if (ChatPB.EventType.CHAT_GROUP_MEMBER_REMOVED === proContent.type) {
      // 群组成员踢出事件
      const dataContent = ChatPB.GroupMemberRemovedEvent.decode(
        proContent.event
      );
      console.log(
        '群组成员踢出事件-CHAT_GROUP_MEMBER_REMOVED-dataContent',
        dataContent
      );
      const removedUserIds: any = [];
      dataContent.removedUserIds.forEach((removeUserId: any) => {
        removedUserIds.push(Long.fromValue(removeUserId).toNumber());
      });
      const content = {
        eventType: proContent.type,
        eventData: {
          groupId: Long.fromValue(dataContent.groupId).toNumber(),
          masterId: Long.fromValue(dataContent.masterId).toNumber(),
          removedUserIds,
        },
      };
      EventListener.emit('ChatGroupMemberRemoved', {
        fingerPrint: proContent.fp,
        chatType: ChatPB.ChatType.GROUP_CHAT,
        content: JSON.stringify(content),
        messageType: ChatPB.MessageType.SYSTEM,
        recipientId: Long.fromValue(dataContent.groupId).toNumber(),
        senderId: ChatPB.Client.SERVER,
        sendTime: Long.fromValue(dataContent.timestamp).toNumber(),
        parentId: `${ChatPB.ChatType.GROUP_CHAT}_${Long.fromValue(
          dataContent.groupId
        ).toNumber()}`,
      });
    }
    if (ChatPB.EventType.CHAT_GROUP_MEMBER_INVITED === proContent.type) {
      // 群组邀请成员事件
      const dataContent = ChatPB.GroupMemberInvitedEvent.decode(
        proContent.event
      );
      console.log('群组邀请成员事件-CHAT_GROUP_MEMBER_INVITED', dataContent);
      const invitedUserIds: any = [];
      dataContent.invitedUserIds.forEach((removeUserId: any) => {
        invitedUserIds.push(Long.fromValue(removeUserId).toNumber());
      });
      const content = {
        eventType: proContent.type,
        eventData: {
          ...dataContent,
          timestamp: Long.fromValue(dataContent.timestamp).toNumber,
          groupId: Long.fromValue(dataContent.groupId).toNumber(),
          groupName: dataContent.groupName,
          inviteeUserIds: invitedUserIds,
          invitorUserId: Long.fromValue(dataContent.invitorUserId).toNumber(),
        },
      };
      EventListener.emit('ChatGroupMemberInvited', {
        fingerPrint: proContent.fp,
        chatType: ChatPB.ChatType.GROUP_CHAT,
        content: JSON.stringify(content),
        messageType: ChatPB.MessageType.SYSTEM,
        recipientId: Long.fromValue(dataContent.groupId).toNumber(),
        senderId: ChatPB.Client.SERVER,
        sendTime: Long.fromValue(dataContent.timestamp).toNumber(),
        parentId: `${ChatPB.ChatType.GROUP_CHAT}_${Long.fromValue(
          dataContent.groupId
        ).toNumber()}`,
      });
    }
    if (ChatPB.EventType.CHAT_GROUP_MASTER_CHANGED === proContent.type) {
      // 群主变更事件
      const dataContent = ChatPB.GroupMasterChangedEvent.decode(
        proContent.event
      );
      console.log('群主变更事件-CHAT_GROUP_MASTER_CHANGED', dataContent);
      const content = {
        eventType: proContent.type,
        eventData: {
          groupId: Long.fromValue(dataContent.groupId).toNumber(),
          newMasterId: Long.fromValue(dataContent.newMasterId).toNumber(),
          oldMasterId: Long.fromValue(dataContent.oldMasterId).toNumber(),
        },
      };
      EventListener.emit('ChatGroupMasterChanged', {
        fingerPrint: proContent.fp,
        chatType: ChatPB.ChatType.GROUP_CHAT,
        content: JSON.stringify(content),
        messageType: ChatPB.MessageType.SYSTEM,
        recipientId: Long.fromValue(dataContent.groupId).toNumber(),
        senderId: ChatPB.Client.SERVER,
        sendTime: Long.fromValue(dataContent.timestamp).toNumber(),
        parentId: `${ChatPB.ChatType.GROUP_CHAT}_${Long.fromValue(
          dataContent.groupId
        ).toNumber()}`,
      });
    }
    if (ChatPB.EventType.CHAT_GROUP_DISBANDED === proContent.type) {
      // 群解散事件
      const dataContent = ChatPB.GroupDisbandedEvent.decode(proContent.event);
      console.log('群解散事件-CHAT_GROUP_DISBANDED', dataContent);
      const content = {
        eventType: proContent.type,
        eventData: {
          groupId: Long.fromValue(dataContent.groupId).toNumber(),
          masterId: Long.fromValue(dataContent.masterId).toNumber(),
          timestamp: Long.fromValue(dataContent.timestamp).toNumber(),
        },
      };
      EventListener.emit('ChatGroupDisbanded', {
        fingerPrint: proContent.fp,
        chatType: ChatPB.ChatType.GROUP_CHAT,
        content: JSON.stringify(content),
        messageType: ChatPB.MessageType.SYSTEM,
        recipientId: Long.fromValue(dataContent.groupId).toNumber(),
        senderId: ChatPB.Client.SERVER,
        sendTime: Long.fromValue(dataContent.timestamp).toNumber(),
        parentId: `${ChatPB.ChatType.GROUP_CHAT}_${Long.fromValue(
          dataContent.groupId
        ).toNumber()}`,
      });
    }
    if (ChatPB.EventType.CHAT_GROUP_MEMBER_QUIT === proContent.type) {
      const dataContent = ChatPB.GroupMemberQuitEvent.decode(proContent.event);
      console.log(
        '群组人员退出-CHAT_GROUP_MEMBER_QUIT-dataContent',
        dataContent
      );
      const content = {
        eventType: proContent.type,
        eventData: {
          groupId: Long.fromValue(dataContent.groupId).toNumber(),
          quitUserId: Long.fromValue(dataContent.quitUserId).toNumber(),
          timestamp: Long.fromValue(dataContent.timestamp).toNumber(),
        },
      };
      EventListener.emit('ChatGroupMemberQuit', {
        fingerPrint: proContent.fp,
        chatType: ChatPB.ChatType.GROUP_CHAT,
        content: JSON.stringify(content),
        messageType: ChatPB.MessageType.SYSTEM,
        recipientId: Long.fromValue(dataContent.groupId).toNumber(),
        senderId: ChatPB.Client.SERVER,
        sendTime: Long.fromValue(dataContent.timestamp).toNumber(),
        parentId: `${ChatPB.ChatType.GROUP_CHAT}_${Long.fromValue(
          dataContent.groupId
        ).toNumber()}`,
      });
    }
    if (ChatPB.EventType.CHAT_MESSAGE_RECEIVED === proContent.type) {
      // 消息接收事件
      const dataContent = ChatPB.ChatMessageReceivedEvent.decode(
        proContent.event
      );
      console.log('消息接收事件-CHAT_MESSAGE_RECEIVED', dataContent);
      this.sendAckMessage({
        fp: proContent.fp,
        timestamp: Long.fromValue(dataContent.timestamp).toNumber(),
      });
      EventListener.emit('ChatMessageReceive', {
        fingerPrint: proContent.fp,
        chatType: dataContent.chatType,
        content: dataContent.content,
        messageType: dataContent.messageType,
        recipientId: Long.fromValue(dataContent.recipientId).toNumber(),
        senderId: Long.fromValue(dataContent.senderId).toNumber(),
        sendTime: Long.fromValue(dataContent.timestamp).toNumber(),
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public handleChatWsError(error: any) {
    this.clearHeartInterval();
    EventListener.emit('ChatWsError', error);
  }

  private handleChatWsClose(data: any) {
    console.log('ChatWebSocket 连接已关闭', data, this);
    this.clearHeartInterval();
    EventListener.emit('ChatWsClose', 'Chat WebSocket connection closed');
  }

  public clearHeartInterval() {
    if (this.intervalHeart) {
      clearInterval(this.intervalHeart);
    }
  }

  private heartInterval() {
    this.intervalHeart = setInterval(() => {
      if (!this.webSocketService) {
        this.clearHeartInterval();
        return;
      }
      const nowTime = Date.now();
      const content = ChatPB.HeartbeatPingEvent.create();
      const enContent = ChatPB.HeartbeatPingEvent.encode(content).finish();
      const ProtocolReq: any = ChatPB.Protocol.create({
        type: ChatPB.EventType.HEARTBEAT_PING,
        fp: uuidv4(),
        event: enContent,
        timestamp: nowTime,
      });
      const enProtocol = ChatPB.Protocol.encode(ProtocolReq).finish();
      this.webSocketService.sendMessage(enProtocol);
    }, 1000 * 30);
  }

  public login() {
    let nowTime: any;
    if (!this.lastLoginTime) {
      nowTime = Date.now();
    } else {
      nowTime = this.lastLoginTime;
    }
    console.log('Chat-login----lastLoginTime', this.lastLoginTime);
    const loginReq: any = ChatPB.LoginRequestEvent.create({
      userId: this.userId,
      client: ChatPB.Client.PC,
      token: this.token,
      lastLoginTime: nowTime,
    });
    const enContent = ChatPB.LoginRequestEvent.encode(loginReq).finish();
    const loginPro: any = ChatPB.Protocol.create({
      type: ChatPB.EventType.LOGIN_REQUEST,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enLoginPro = ChatPB.Protocol.encode(loginPro).finish();
    this.webSocketService?.sendMessage(enLoginPro);
  }

  public refreshToken(data: { token: string }) {
    console.log('Chat-refresh-token', data);
    const nowTime = Date.now();
    const createReq: any = ChatPB.TokenRefreshEvent.create({
      token: data.token,
    });
    const enContent = ChatPB.TokenRefreshEvent.encode(createReq).finish();
    const proCreate: any = ChatPB.Protocol.create({
      type: ChatPB.EventType.TOKEN_REFRESH,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const proEncode = ChatPB.Protocol.encode(proCreate).finish();
    this.webSocketService.sendMessage(proEncode);
  }

  public sendLogoutMessage() {
    const nowTime = Date.now();
    const paramsReq: any = ChatPB.LogoutRequestEvent.create();
    const enContent = ChatPB.LogoutRequestEvent.encode(paramsReq).finish();
    const paramsPro: any = ChatPB.Protocol.create({
      type: ChatPB.EventType.LOGOUT_REQUEST,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enPro = ChatPB.Protocol.encode(paramsPro).finish();
    this.webSocketService.sendMessage(enPro);
  }

  public logout() {
    if (this.webSocketService) {
      this.clearHeartInterval();
      this.handleOffEventBus();
      this.sendLogoutMessage();
      this.webSocketService.close();
    }
  }

  private handleOnEventBus() {
    EventListener.on('im-ws-open', this.handleChatWsOpen);
    EventListener.on('im-ws-message', this.handleChatWsMessage);
    EventListener.on('im-ws-close', this.handleChatWsClose);
    EventListener.on('im-ws-error', this.handleChatWsError);
  }

  private handleOffEventBus() {
    EventListener.off('im-ws-open', this.handleChatWsOpen);
    EventListener.off('im-ws-message', this.handleChatWsMessage);
    EventListener.off('im-ws-close', this.handleChatWsClose);
    EventListener.off('im-ws-error', this.handleChatWsError);
  }

  public initChatWss() {
    this.webSocketService = ChatIMWebSocketService(this.wssUrl);
    this.webSocketService.connect();
    this.handleOnEventBus();
  }

  public chatWssReconnect() {
    if (this.webSocketService) {
      this.webSocketService.stopReconnect();
      this.initChatWss();
    }
  }

  public sendMessage(data: {
    fingerPrint?: string;
    recipientId: number;
    chatType: number;
    messageType: number;
    content: string;
  }) {
    const { fingerPrint, recipientId, chatType, messageType, content } = data;
    const nowTime = Date.now();
    const fp = !fingerPrint ? uuidv4() : fingerPrint;
    const dataContentReq: any = ChatPB.ChatMessageSendEvent.create({
      recipientId,
      chatType,
      messageType,
      content,
    });
    const enContent =
      ChatPB.ChatMessageSendEvent.encode(dataContentReq).finish();
    const PBProtocol: any = ChatPB.Protocol.create({
      type: ChatPB.EventType.CHAT_MESSAGE_SEND,
      fp,
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = ChatPB.Protocol.encode(PBProtocol).finish();
    // 将消息存入映射，初始重试次数为0
    this.messageMap.set(fp, {
      timestamp: nowTime,
      retries: 0,
      data: enProtocol,
    });

    this.webSocketService?.sendMessage(enProtocol);
    this.retryMessage(fp);
  }

  private retryMessage(fp: string) {
    const messageInfo = this.messageMap.get(fp);
    if (!messageInfo) return;

    setTimeout(() => {
      const currentInfo = this.messageMap.get(fp);
      if (!currentInfo) {
        return;
      }
      if (currentInfo.retries >= 3) {
        this.messageMap.delete(fp);
        EventListener.emit('ChatMessageStatus', {
          fp,
          status: false,
        });
        return;
      }
      console.log(`正在重试消息 ${fp}, 尝试次数 ${currentInfo.retries + 1}`);
      this.webSocketService.sendMessage(currentInfo.data);
      this.messageMap.set(fp, {
        ...currentInfo,
        retries: currentInfo.retries + 1,
      });

      this.retryMessage(fp);
    }, 3000); // 3秒后重试
  }

  public sendAckMessage(data: { fp: string; timestamp: number }) {
    const nowTime = Date.now();
    const dataContentReq: any = ChatPB.AckEvent.create(data);
    const enContent = ChatPB.AckEvent.encode(dataContentReq).finish();
    const PBProtocol: any = ChatPB.Protocol.create({
      type: ChatPB.EventType.ACK,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = ChatPB.Protocol.encode(PBProtocol).finish();
    // console.log('sendAckMessage', data);
    this.webSocketService?.sendMessage(enProtocol);
  }

  public sendChatReceivedMessageReadEvent(data: {
    targetId: number;
    chatType: number;
  }) {
    const nowTime = Date.now();
    const dataContentReq: any =
      ChatPB.ChatReceivedMessageReadEvent.create(data);
    const enContent =
      ChatPB.ChatReceivedMessageReadEvent.encode(dataContentReq).finish();
    const PBProtocol: any = ChatPB.Protocol.create({
      type: ChatPB.EventType.CHAT_MESSAGE_READ,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = ChatPB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }
}
