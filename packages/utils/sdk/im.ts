import axios from 'axios';

import { v4 as uuidv4 } from 'uuid';
import Long from 'long';
import * as PB from '../../proto/protocol';
import createThWebSocketService from '../../services/ThWebsocketService';
import THEventBus from '../../services/THEventBus';
import i18n from '../../locale';

axios.create({
  timeout: 1000 * 30, // 设置超时时间为1000毫秒（1秒）
  // 其他配置...
});

export default class ThIM {
  private webSocketService: any = null;

  private wssUrl: string;

  public hostUrl: string;

  public userId: number;

  private token: any;

  public meetingInfo: any = null;

  private lastLoginTime: any;

  public roomMenuOptions: any = {
    audio: true,
    video: false,
    loudspeaker: true,
  };

  public roomOnlineListPsn: any = [];

  public roomOnlineGroupPsn: any = [];

  public inviteListData: any = [];

  private intervalHeart: NodeJS.Timeout | null = null;

  constructor(data: {
    wssUrl: string;
    userId: number;
    token: any;
    hostUrl?: any;
  }) {
    const { wssUrl, userId, token, hostUrl = '' } = data;
    this.wssUrl = wssUrl;
    this.userId = userId;
    this.token = token;
    this.hostUrl = hostUrl;
    this.handleThWsOpen = this.handleThWsOpen.bind(this);
    this.handleThWsMessage = this.handleThWsMessage.bind(this);
    this.handleThWsClose = this.handleThWsClose.bind(this);
    this.handleThWsError = this.handleThWsError.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  private handleThWsOpen() {
    console.log('ThImWsOpen 连接已打开');
    THEventBus.emit('ThAssistImWsOpen', 'WebSocket connection opened');
  }

  // eslint-disable-next-line class-methods-use-this
  private handleThWsMessage(data: any) {
    // Handle message
    const proContent = PB.Protocol.decode(data);
    // console.log('即时通讯消息-Message-proContent------', proContent);
    if (
      PB.EventType.ACK !== proContent.type &&
      PB.EventType.HEARTBEAT_PONG !== proContent.type
    ) {
      // 回复ACK
      this.sendAckMessage({
        fp: proContent.fp,
      });
    }
    // 心跳中 房间号，若不相同则提示异常退出房间
    if (PB.EventType.HEARTBEAT_PONG === proContent.type) {
      const dataContent = PB.HeartbeatPongEvent.decode(proContent.event);
      console.log('heartbeat-pong', dataContent, this.meetingInfo);
      if (
        dataContent.meetingNo &&
        dataContent.meetingNo !== this.meetingInfo?.meetingNo
      ) {
        console.log('异常退出', dataContent);
        THEventBus.emit('ThAssistErrorOut', dataContent);
        return;
      }
    }
    // 登录成功
    if (PB.EventType.LOGIN_SUCCEED === proContent.type) {
      const dataContent = PB.LoginSucceedEvent.decode(proContent.event);
      console.log('ThImLogin-succeed', dataContent);
      this.lastLoginTime = Long.fromValue(dataContent.lastLoginTime).toString();
      THEventBus.emit('ThAssistLoginSuccess', {
        ...dataContent,
        lastLoginTime: Long.fromValue(dataContent.lastLoginTime).toString(),
      });
      this.heartInterval();
    }
    if (PB.EventType.KICK_OUT === proContent.type) {
      const dataContent = PB.KickOutEvent.decode(proContent.event);
      console.log('接收到踢下线-KICK_OUT', dataContent);
      THEventBus.emit('ThAssistKickOut', dataContent);
    }
    if (PB.EventType.TOKEN_EXPIRATION_DATE === proContent.type) {
      console.log('接收到Token-即将过期事件');
      THEventBus.emit('ThAssistTokenExpirationDate');
    }
    if (PB.EventType.TOKEN_REFRESHED === proContent.type) {
      console.log('接收到刷新Token 成功');
      THEventBus.emit('ThAssistTokenRefreshed');
    }

    if (PB.EventType.ASSIST_CLOSED === proContent.type) {
      const dataContent = PB.AssistClosedEvent.decode(proContent.event);
      console.log('会议结束-ASSIST_CLOSED', dataContent);
      THEventBus.emit('th-assist-closed', {
        ...dataContent,
        master: Long.fromValue(dataContent.master).toNumber(),
      });
      if (this.userId !== Long.fromValue(dataContent.master).toNumber()) {
        THEventBus.emit('ThAssistClosed', {
          ...dataContent,
          master: Long.fromValue(dataContent.master).toNumber(),
        });
      }
    }
    if (PB.EventType.ASSIST_OTHER_CLIENT_JOINED === proContent.type) {
      const dataContent = PB.AssistOtherClientJoinedEvent.decode(
        proContent.event
      );
      console.log(
        '接收到其他客户端加入-ASSIST_OTHER_CLIENT_JOINED',
        dataContent
      );
      THEventBus.emit('th-assist-other-client-joined', {
        ...dataContent,
      });
    }
    if (PB.EventType.ASSIST_OTHER_CLIENT_ACCEPTED === proContent.type) {
      const dataContent = PB.AssistOtherClientAcceptedEvent.decode(
        proContent.event
      );
      console.log(
        '接收到其他客户端已接听-ASSIST_OTHER_CLIENT_ACCEPTED',
        dataContent
      );
      THEventBus.emit('ThAssistOtherClientAccepted', {
        ...dataContent,
      });
    }
    if (PB.EventType.ASSIST_OTHER_CLIENT_REJECTED === proContent.type) {
      const dataContent = PB.AssistOtherClientRejectedEvent.decode(
        proContent.event
      );
      console.log(
        '接收到其他客户端已拒绝-ASSIST_OTHER_CLIENT_REJECTED',
        dataContent
      );
      THEventBus.emit('ThAssistOtherClientRejected', {
        ...dataContent,
      });
    }
    if (PB.EventType.ASSIST_ALL_AUDIO_DISABLED === proContent.type) {
      const dataContent = PB.AssistAllAudioDisabledEvent.decode(
        proContent.event
      );
      console.log(
        '接收到主持人设置全员静音-ASSIST_ALL_AUDIO_DISABLED',
        dataContent
      );
      THEventBus.emit('th-assist-all-audio-disabled', {
        ...dataContent,
        master: Long.fromValue(dataContent.master).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_ALL_AUDIO_ENABLED === proContent.type) {
      const dataContent = PB.AssistAllAudioEnabledEvent.decode(
        proContent.event
      );
      console.log(
        '接收到主持人关闭全员静音-ASSIST_ALL_AUDIO_ENABLED',
        dataContent
      );
      THEventBus.emit('th-assist-all-audio-enabled', {
        ...dataContent,
        master: Long.fromValue(dataContent.master).toNumber(),
      });
    }
    // 被邀请
    if (PB.EventType.ASSIST_INVITED === proContent.type) {
      const dataContent = PB.AssistInvitedEvent.decode(proContent.event);
      console.log('被邀请-ASSIST_INVITED', dataContent);
      THEventBus.emit('ThAssistInvited', {
        ...dataContent,
        invitor: Long.fromValue(dataContent.invitor).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_INVITEE_BE_BUSY === proContent.type) {
      const dataContent = PB.AssistInviteeBeBusyEvent.decode(proContent.event);
      console.log('被邀请-ASSIST_INVITEE_BE_BUSY', dataContent);
      THEventBus.emit('ThAssistInviteeBeBusy', {
        ...dataContent,
        invitee: Long.fromValue(dataContent.invitee).toNumber(),
      });
      this.updateInvitingList(
        [
          {
            userId: Long.fromValue(dataContent.invitee).toNumber(),
          },
        ],
        'del'
      );
    }
    if (PB.EventType.ASSIST_INVITEE_BE_TIMEOUT === proContent.type) {
      const dataContent = PB.AssistInviteeBeTimeoutEvent.decode(
        proContent.event
      );
      console.log('被邀请人超时未接听-ASSIST_INVITEE_BE_TIMEOUT', dataContent);
      THEventBus.emit('ThAssistInviteeBeTimeout', {
        ...dataContent,
        invitee: Long.fromValue(dataContent.invitee).toNumber(),
      });
      this.updateInvitingList(
        [
          {
            userId: Long.fromValue(dataContent.invitee).toNumber(),
          },
        ],
        'del'
      );
    }
    if (PB.EventType.ASSIST_INVITEE_ACCEPTED === proContent.type) {
      const dataContent = PB.AssistInviteeAcceptedEvent.decode(
        proContent.event
      );
      console.log('被邀请者接受事件-ASSIST_INVITEE_ACCEPTED', dataContent);
      THEventBus.emit('ThAssistInviteeAccepted', {
        ...dataContent,
      });
      this.updateInvitingList(
        [
          {
            userId: Long.fromValue(dataContent.invitee).toNumber(),
          },
        ],
        'del'
      );
    }
    if (PB.EventType.ASSIST_INVITEE_REJECTED === proContent.type) {
      const dataContent = PB.AssistInviteeRejectedEvent.decode(
        proContent.event
      );
      console.log('ASSIST_INVITEE_REJECTED', dataContent);
      THEventBus.emit('th-assist-invitee-rejected', {
        ...dataContent,
        invitee: Long.fromValue(dataContent.invitee).toNumber(),
      });
      this.updateInvitingList(
        [
          {
            userId: Long.fromValue(dataContent.invitee).toNumber(),
          },
        ],
        'del'
      );
    }
    if (PB.EventType.ASSIST_CHAT_MESSAGE_RECEIVE === proContent.type) {
      const dataContent = PB.AssistChatMessageReceiveEvent.decode(
        proContent.event
      );
      console.log('接收到消息文本-ASSIST_CHAT_MESSAGE_RECEIVE', dataContent);
      THEventBus.emit('th-assist-chat-message-receive', {
        ...dataContent,
        sender: Long.fromValue(dataContent.sender).toNumber(),
        timestamp: Long.fromValue(dataContent.timestamp).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_MASTER_CHANGED === proContent.type) {
      const dataContent = PB.AssistMasterChangedEvent.decode(proContent.event);
      console.log('主持人变更事件-ASSIST_MASTER_CHANGED', dataContent);
      THEventBus.emit('ThAssistMasterChangedEvent', {
        ...dataContent,
      });
    }
    if (PB.EventType.ASSIST_AUDIO_CLOSED === proContent.type) {
      const dataContent = PB.AssistAudioClosedEvent.decode(proContent.event);
      console.log(
        '主持人-关闭其他人麦克风事件-ASSIST_AUDIO_CLOSED',
        dataContent
      );
      THEventBus.emit('th-assist-audio-closed', {
        ...dataContent,
        master: Long.fromValue(dataContent.master).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_AUDIO_OPENED === proContent.type) {
      const dataContent = PB.AssistAudioOpenedEvent.decode(proContent.event);
      console.log(
        '主持人-开启其他人麦克风事件-ASSIST_AUDIO_OPENED',
        dataContent
      );
      THEventBus.emit('th-assist-audio-opened', {
        ...dataContent,
        master: Long.fromValue(dataContent.master).toNumber(),
      });
    }

    if (PB.EventType.ASSIST_CAMERA_CLOSED === proContent.type) {
      const dataContent = PB.AssistCameraClosedEvent.decode(proContent.event);
      console.log(
        '主持人-关闭其他人视频流事件-ASSIST_CAMERA_CLOSED',
        dataContent
      );
      THEventBus.emit('th-assist-camera-closed', {
        ...dataContent,
        master: Long.fromValue(dataContent.master).toNumber(),
      });
    }

    if (PB.EventType.ASSIST_CAMERA_OPENED === proContent.type) {
      const dataContent = PB.AssistCameraOpenedEvent.decode(proContent.event);
      console.log(
        '主持人-开启其他人视频流事件-ASSIST_CAMERA_OPENED',
        dataContent
      );
      THEventBus.emit('th-assist-camera-opened', {
        ...dataContent,
        master: Long.fromValue(dataContent.master).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_SET_VIDEO_RESOLUTIOND === proContent.type) {
      const dataContent = PB.AssistSetVideoResolutiondEvent.decode(
        proContent.event
      );
      console.log(
        '接收到主持人设置HD切换事件事件-ASSIST_SET_VIDEO_RESOLUTIOND',
        dataContent
      );
      THEventBus.emit('th-assist-video-transfer-hd-changed', {
        ...dataContent,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
        operator: Long.fromValue(dataContent.operator).toNumber(),
      });
    }
    if (
      PB.EventType.ASSIST_VIDEO_TRANSFER_STRATEGY_CHANGED === proContent.type
    ) {
      const dataContent = PB.AssistVideoTransferStrategyChangedEvent.decode(
        proContent.event
      );
      console.log(
        '接收到主持人设置FPS切换事件事件-ASSIST_VIDEO_TRANSFER_STRATEGY_CHANGED',
        dataContent
      );
      THEventBus.emit('th-assist-video-transfer-strategy-changed', {
        ...dataContent,
        master: Long.fromValue(dataContent.master).toNumber(),
      });
    }
    if (
      PB.EventType.ASSIST_VIDEO_RESOLUTION_UPDATED === proContent.type
    ) {
      const dataContent = PB.AssistVideoResolutionUpdatedEvent.decode(
        proContent.event
      );
      console.log(
        '接收到客户端HD切换事件事件-ASSIST_VIDEO_RESOLUTION_UPDATED',
        {
          ...dataContent,
          anchor: Long.fromValue(dataContent.anchor).toNumber(),
        }
      );
      THEventBus.emit('th-assist-video-transfer-hd-updated', {
        ...dataContent,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
      });
    }
    if (
      PB.EventType.ASSIST_VIDEO_TRANSFER_STRATEGY_UPDATED === proContent.type
    ) {
      const dataContent = PB.AssistVideoTransferStrategyUpdatedEvent.decode(
        proContent.event
      );
      console.log(
        '接收到客户端FPS切换事件事件-ASSIST_VIDEO_TRANSFER_STRATEGY_UPDATED',
        {
          ...dataContent,
          member: Long.fromValue(dataContent.member).toNumber(),
        }
      );
      THEventBus.emit('th-assist-video-transfer-strategy-updated', {
        ...dataContent,
        member: Long.fromValue(dataContent.member).toNumber(),
      });
    }

    if (PB.EventType.ASSIST_MEMBER_CLIENT_CHANGED === proContent.type) {
      const dataContent = PB.AssistMemberClientChangedEvent.decode(
        proContent.event
      );
      console.log(
        '接收其他客户端切换事件-ASSIST_MEMBER_CLIENT_CHANGED',
        dataContent
      );
      THEventBus.emit('th-assist-member-client-changed', {
        ...dataContent,
        member: Long.fromValue(dataContent.member).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_OTHER_CLIENT_INVITED === proContent.type) {
      const dataContent = PB.AssistOtherClientInvitedEvent.decode(
        proContent.event
      );
      console.log(
        '接收自己客户端切换事件-PC不作处理-ASSIST_OTHER_CLIENT_INVITED',
        dataContent
      );
      THEventBus.emit('th-assist-other-client-invited', {
        ...dataContent,
      });
    }
    if (PB.EventType.ASSIST_MEMBER_JOINED === proContent.type) {
      const dataContent = PB.AssistMemberJoinedEvent.decode(proContent.event);
      console.log('接收成员入会事件-ASSIST_MEMBER_JOINED', dataContent);
      THEventBus.emit('th-assist-member-joined', {
        ...dataContent,
        member: Long.fromValue(dataContent.member).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_DRAWING_BOARD_OPENED === proContent.type) {
      const dataContent = PB.AssistDrawingBoardOpenedEvent.decode(
        proContent.event
      );
      console.log('接收画板开启事件-ASSIST_DRAWING_BOARD_OPENED', dataContent);
      THEventBus.emit('th-assist-drawing-board-opened', {
        meetingNo: dataContent.meetingNo,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
        operator: Long.fromValue(dataContent.operator).toNumber(),
        source: Long.fromValue(dataContent.source).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_DRAWING_BOARD_CLOSED === proContent.type) {
      const dataContent = PB.AssistDrawingBoardClosedEvent.decode(
        proContent.event
      );
      console.log('接收画板关闭事件-ASSIST_DRAWING_BOARD_CLOSED', dataContent);
      THEventBus.emit('th-assist-drawing-board-closed', {
        meetingNo: dataContent.meetingNo,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
      });
    }
    // 协助 画布绘制事件
    if (PB.EventType.ASSIST_CANVAS_DREW === proContent.type) {
      const dataContent = PB.AssistCanvasDrewEvent.decode(proContent.event);
      console.log('接收到画板 绘制事件-ASSIST_CANVAS_DREW', dataContent);
      if (dataContent.action === PB.Action.ADD) {
        // 增加线条
        THEventBus.emit('th-assist-canvas-drawing', {
          ...dataContent,
          anchor: Long.fromValue(dataContent.anchor).toNumber(),
          timestamp: Long.fromValue(dataContent.timestamp).toNumber(),
        });
      } else if (dataContent.action === PB.Action.DELETE) {
        THEventBus.emit('th-assist-canvas-delete', {
          ...dataContent,
          anchor: Long.fromValue(dataContent.anchor).toNumber(),
          timestamp: Long.fromValue(dataContent.timestamp).toNumber(),
        });
      }
    }
    if (PB.EventType.ASSIST_CANVAS_CHANGED === proContent.type) {
      const dataContent = PB.AssistCanvasChangedEvent.decode(proContent.event);
      console.log(
        '接口收到标注 拖动、放大缩小-ASSIST_CANVAS_CHANGED',
        dataContent
      );
      THEventBus.emit('th-assist-canvas-changed', {
        ...dataContent,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
        timestamp: Long.fromValue(dataContent.timestamp).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_CANVAS_ERASED === proContent.type) {
      const dataContent = PB.AssistCanvasErasedEvent.decode(proContent.event);
      console.log('接收到画板清除事件-ASSIST_CANVAS_ERASED', dataContent);
      THEventBus.emit('th-assist-canvas-clear', {
        ...dataContent,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_CANVAS_IMAGE_CHANGED === proContent.type) {
      const dataContent = PB.AssistCanvasImageChangedEvent.decode(
        proContent.event
      );
      console.log(
        '接收到画板底图变更事件-ASSIST_CANVAS_IMAGE_CHANGED',
        dataContent
      );
      THEventBus.emit('th-assist-canvas-image-changed', {
        ...dataContent,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_WARING_FLICKERED === proContent.type) {
      const dataContent = PB.AssistWaringFlickeredEvent.decode(
        proContent.event
      );
      console.log('接收到告警事件-ASSIST_WARING_FLICKERED', dataContent);
      THEventBus.emit('th-assist-warning-flickered', {
        ...dataContent,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
      });
    }
    // 协助 冻屏
    if (PB.EventType.ASSIST_SCREEN_FROZEN_OPENED === proContent.type) {
      const dataContent = PB.AssistScreenFrozenOpenedEvent.decode(
        proContent.event
      );
      console.log('接收到冻屏标注-ASSIST_SCREEN_FROZEN_OPENED', dataContent);
      THEventBus.emit('th-assist-screen-frozen-opened', {
        ...dataContent,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
        operator: Long.fromValue(dataContent.operator).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_SCREEN_FROZEN_CLOSED === proContent.type) {
      const dataContent = PB.AssistScreenFrozenClosedEvent.decode(
        proContent.event
      );
      console.log(
        '接收到冻屏标注关闭-ASSIST_SCREEN_FROZEN_CLOSED',
        dataContent
      );
      THEventBus.emit('th-assist-screen-frozen-closed', {
        ...dataContent,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_FLICKER_SCENE_OPENED === proContent.type) {
      const dataContent = PB.AssistFlickerSceneOpenedEvent.decode(
        proContent.event
      );
      console.log('接收到闪点标注-ASSIST_FLICKER_SCENE_OPENED', dataContent);
      THEventBus.emit('th-assist-flicker-scene-opened', {
        ...dataContent,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
        operator: Long.fromValue(dataContent.operator).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_FLICKER_SCENE_CLOSED === proContent.type) {
      const dataContent = PB.AssistFlickerSceneClosedEvent.decode(
        proContent.event
      );
      console.log(
        '接收到闪点场景关闭事件-ASSIST_FLICKER_SCENE_CLOSED',
        dataContent
      );
      THEventBus.emit('th-assist-flicker-scene-closed', {
        ...dataContent,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_POINT_FLICKERED === proContent.type) {
      const dataContent = PB.AssistPointFlickeredEvent.decode(proContent.event);
      console.log('接收到闪点闪闪烁事件-ASSIST_POINT_FLICKERED', dataContent);
      THEventBus.emit('th-assist-point-flickered', {
        ...dataContent,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
      });
    }

    if (PB.EventType.ASSIST_LINE_FLICKERED === proContent.type) {
      const dataContent = PB.AssistLineFlickeredEvent.decode(proContent.event);
      console.log('接收到闪点闪闪烁事件-ASSIST_LINE_FLICKERED', dataContent);
      THEventBus.emit('th-assist-line-flickered', {
        ...dataContent,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
        timestamp: Long.fromValue(dataContent.timestamp).toNumber(),
      });
    }

    // 屏幕分享-开启
    if (PB.EventType.ASSIST_SHARE_SCREEN_OPENED === proContent.type) {
      const dataContent = PB.AssistShareScreenOpenedEvent.decode(
        proContent.event
      );
      console.log(
        '接收到屏幕分享开启事件-ASSIST_SHARE_SCREEN_OPENED',
        dataContent
      );
      THEventBus.emit('th-assist-share-screen-opened', {
        ...dataContent,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
      });
    }
    // 屏幕分享-关闭
    if (PB.EventType.ASSIST_SHARE_SCREEN_CLOSED === proContent.type) {
      const dataContent = PB.AssistShareScreenClosedEvent.decode(
        proContent.event
      );
      console.log(
        '接收到屏幕分享关闭事件-ASSIST_SHARE_SCREEN_CLOSED',
        dataContent
      );
      THEventBus.emit('th-assist-share-screen-closed', {
        ...dataContent,
        anchor: Long.fromValue(dataContent.anchor).toNumber(),
      });
    }
    // 摄像头缩放事件
    if (PB.EventType.ASSIST_CAMERA_ZOOM_CHANGED === proContent.type) {
      const dataContent = PB.AssistCameraZoomChangedEvent.decode(
        proContent.event
      );
      console.log(
        '接收到摄像头缩放事件-ASSIST_CAMERA_ZOOM_CHANGED',
        dataContent
      );
    }
    // 会议即将开始事件
    if (PB.EventType.ASSIST_ABOUT_TO_BEGIN === proContent.type) {
      const dataContent = PB.AssistAboutToBeginEvent.decode(proContent.event);
      console.log('接收到会议即将开始事件-ASSIST_ABOUT_TO_BEGIN', dataContent);
      THEventBus.emit('ThAssistAboutToBegin', {
        ...dataContent,
        startTime: Long.fromValue(dataContent.startTime).toNumber(),
        endTime: Long.fromValue(dataContent.endTime).toNumber(),
        master: Long.fromValue(dataContent.master).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_PLAN_STATUS_UPDATED === proContent.type) {
      const dataContent = PB.AssistPlanStatusUpdatedEvent.decode(
        proContent.event
      );
      console.log(
        '接收到会议计划状态更新-ASSIST_PLAN_STATUS_UPDATED',
        dataContent
      );
      THEventBus.emit('ThAssistPlanStatusUpdated', {
        ...dataContent,
        planId: Long.fromValue(dataContent.planId).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_SCREEN_DIRECTION_UPDATED === proContent.type) {
      const dataContent = PB.AssistScreenDirectionUpdatedEvent.decode(
        proContent.event
      );
      console.log(
        '接收到远端横竖屏切换-assist_screen_direction_updated',
        dataContent
      );
      THEventBus.emit('th-assist-screen-direction-updated', {
        ...dataContent,
        member: Long.fromValue(dataContent.member).toNumber(),
      });
    }
    if (PB.EventType.ASSIST_UPLOAD_FILE_NOTIFIED === proContent.type) {
      const dataContent = PB.AssistUploadFileNotifiedEvent.decode(
        proContent.event
      );
      console.log(
        '接收到远端上传文件-ASSIST_UPLOAD_FILE_NOTIFIED',
        dataContent
      );
      THEventBus.emit('th-assist-upload-file-notified', {
        ...dataContent,
      });
    }
    // 会议状态问询
    if (PB.EventType.ASSIST_MEETING_STATUS_ASK === proContent.type) {
      console.log('接收到服务端会议状态问询', proContent);
      THEventBus.emit('th-assist-meeting-status-answer');
    }
    // 会议翻译
    if (
      PB.EventType.ASSIST_MEETING_REAL_TIME_TRANSLATIOND === proContent.type
    ) {
      const dataContent = PB.AssistMeetingRealTimeTranslationdEvent.decode(
        proContent.event
      );
      console.log('接收到其他人-会议翻译内容', dataContent);
      THEventBus.emit('th-assist-meeting-real-time-translationd', {
        ...dataContent,
        sender: Long.fromValue(dataContent.sender).toNumber(),
      });
    }
    //  todo 会议成员设置语言
    if (
      PB.EventType.ASSIST_MEMBER_LANGUAGE_UPDATED === proContent.type
    ) {
      const dataContent = PB.AssistMemberLanguageUpdatedEvent.decode(
        proContent.event
      );
      console.log('接收到会议成员设置语言', {
        ...dataContent,
        memberLanguageList: dataContent.memberLanguageList.map((item) => ({
          ...item,
          member: Long.fromValue(item.member).toNumber(),
        })),
      });
      // THEventBus.emit('th-assist-meeting-real-time-translationd', {
      //   ...dataContent,
      //   memberLanguageList: dataContent.memberLanguageList.map((item) => ({
      //     ...item,
      //     member: Long.fromValue(item.member).toNumber(),
      //   })),
      // });
    }
    //  todo 会议成员翻译
    if (
      PB.EventType.ASSIST_MEETING_REAL_TIME_MESSAGED === proContent.type
    ) {
      const dataContent = PB.AssistMeetingRealTimeMessagedEvent.decode(
        proContent.event
      );
      console.log('接收到多国语言-会议翻译内容', dataContent);
      THEventBus.emit('th-assist-meeting-real-time-translationd', {
        ...dataContent,
        sender: Long.fromValue(dataContent.sender).toNumber(),
        timestamp: Long.fromValue(dataContent.timestamp).toNumber(),
      });
    }
  }

  private handleOnEventBus() {
    THEventBus.on('ThWsOpen', this.handleThWsOpen);
    THEventBus.on('ThWsMessage', this.handleThWsMessage);
    THEventBus.on('ThWsClose', this.handleThWsClose);
    THEventBus.on('ThWsError', this.handleThWsError);
  }

  private handleOffEventBus() {
    THEventBus.off('ThWsOpen', this.handleThWsOpen);
    THEventBus.off('ThWsMessage', this.handleThWsMessage);
    THEventBus.off('ThWsClose', this.handleThWsClose);
    THEventBus.off('ThWsError', this.handleThWsError);
  }

  public initWss() {
    this.webSocketService = createThWebSocketService(this.wssUrl);
    this.webSocketService?.connect();
    this.handleOnEventBus();
  }

  // eslint-disable-next-line class-methods-use-this
  public login() {
    let nowTime: any;
    if (!this.lastLoginTime) {
      nowTime = Date.now();
    } else {
      nowTime = this.lastLoginTime;
    }
    const loginReq: any = PB.LoginRequestEvent.create({
      userId: this.userId,
      client: PB.Client.PC,
      token: this.token,
      lastLoginTime: nowTime,
    });
    const enContent = PB.LoginRequestEvent.encode(loginReq).finish();
    const loginPro: any = PB.Protocol.create({
      type: PB.EventType.LOGIN_REQUEST,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enLoginPro = PB.Protocol.encode(loginPro).finish();
    console.log('Th-sdk-login--', {
      userId: this.userId,
      client: PB.Client.PC,
      token: this.token,
      lastLoginTime: nowTime,
    });
    this.webSocketService?.sendMessage(enLoginPro);
  }

  public refreshToken(data: { token: string }) {
    console.log('ThAssist-refresh-token', data);
    const nowTime = Date.now();
    const createReq: any = PB.TokenRefreshEvent.create({
      token: data.token,
    });
    const enContent = PB.TokenRefreshEvent.encode(createReq).finish();
    const proCreate: any = PB.Protocol.create({
      type: PB.EventType.TOKEN_REFRESH,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const proEncode = PB.Protocol.encode(proCreate).finish();
    this.webSocketService?.sendMessage(proEncode);
  }

  // eslint-disable-next-line class-methods-use-this
  public handleThWsError() {
    this.clearHeartInterval();
    console.error('ThWebSocket 发生错误');
  }

  private handleThWsClose(data: any) {
    console.log('ThWebSocket 连接已关闭', data, this);
    this.clearHeartInterval();
    // THEventBus.emit('ThAssistImWsClose', 'THWebSocket connection closed');
  }

  public clearHeartInterval() {
    if (this.intervalHeart) {
      clearInterval(this.intervalHeart);
    }
  }

  public setMeetingInfo(data: any) {
    this.meetingInfo = data;
  }

  private heartInterval() {
    this.intervalHeart = setInterval(() => {
      if (!this.webSocketService) {
        this.clearHeartInterval();
        return;
      }
      const nowTime = Date.now();
      const content = PB.HeartbeatPingEvent.create({
        meetingNo: this.meetingInfo?.meetingNo,
      });
      const enContent = PB.HeartbeatPingEvent.encode(content).finish();
      const ProtocolReq: any = PB.Protocol.create({
        type: PB.EventType.HEARTBEAT_PING,
        fp: uuidv4(),
        event: enContent,
        timestamp: nowTime,
      });
      const enProtocol = PB.Protocol.encode(ProtocolReq).finish();
      this.webSocketService?.sendMessage(enProtocol);
    }, 1000 * 60);
  }

  public logout() {
    this.meetingInfo = null;
    if (this.webSocketService) {
      console.log('package-im-logout-webSocketService', this.webSocketService);
      this.clearHeartInterval();
      this.webSocketService.close();
      this.handleOffEventBus();
    }
  }

  public getImInfo() {
    return {
      userId: this.userId,
      meetingInfo: this.meetingInfo?.meetingNo,
    };
  }

  // 发送邀请 信令
  public sendAssistInviteEvent(data: {
    meetingNo: string;
    inviters: string[];
    extraPayload: string;
  }) {
    console.log('IM-发送邀请 信令-sendAssistInviteEvent', data);
    const nowTime = Date.now();
    const AssistInviteReq: any = PB.AssistInviteEvent.create({
      ...data,
    });
    const enContent = PB.AssistInviteEvent.encode(AssistInviteReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_INVITE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    console.log('发送邀请 信令', enProtocol);
    this.webSocketService.sendMessage(enProtocol);
  }

  // eslint-disable-next-line class-methods-use-this
  public setLocalLanguage(lang: any): void {
    i18n.global.locale.value = lang;
  }

  // 获取人员列表
  public setRoomOnlineListPsn(data: any) {
    this.roomOnlineListPsn = data;
  }

  // 更新会议房间内被邀请的员
  public updateInvitingList(list: any, type?: 'add' | 'del') {
    console.log('im-updateInvitingList', list, type);
    if (type === 'add') {
      // 使用 Map 合并并覆盖重复用户
      const userMap = new Map<number, any>(
        this.inviteListData.map((user: any) => [user.userId, user])
      );
      list.forEach((user: any) => userMap.set(user.userId, user));
      this.inviteListData = Array.from(userMap.values());
    } else if (type === 'del') {
      // 使用 Set 过滤需要删除的用户
      const removeIds = new Set(list.map((user: any) => user.userId));
      this.inviteListData = this.inviteListData.filter(
        (user: any) => !removeIds.has(user.userId)
      );
    } else {
      // 默认直接替换列表（根据需求调整）
      this.inviteListData = list;
    }
    THEventBus.emit('th-assist-invite-list-change', this.inviteListData);
  }

  // 获取被邀请人员列表
  public getInvitingList() {
    return this.inviteListData;
  }

  // 人员分组列表（包含人员）
  public setRoomOnlineGroupPsn(data: any) {
    this.roomOnlineGroupPsn = data;
  }

  // 加入会议接口
  private joinMeetingApi(data: any) {
    return new Promise((resolve, reject) => {
      axios
        .post(`${this.hostUrl}/api/meeting/meeting/join`, data)
        .then((response: any) => {
          if (response.code !== 200) {
            this.meetingInfo = null;
          } else {
            this.meetingInfo = response.data;
          }
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private changeCamera(data: { meetingNo: string; status: number }) {
    return new Promise((resolve, reject) => {
      axios
        .post(`${this.hostUrl}/api/meeting/record/camera/status`, data)
        .then((response: any) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // 邀请加入会议业务逻辑
  public async joinMeeting(data: {
    meetingNo: string;
    forceEntryStatus: number;
    inviters: string[];
  }) {
    console.log('IM-邀请加入会议业务逻辑-joinMeeting', data);
    try {
      // 调用 joinMeetingApi 方法
      const res: any = await this.joinMeetingApi({
        meetingNo: data.meetingNo,
        forceEntryStatus: data.forceEntryStatus,
      });
      if (res.code === 200) {
        const inviteData = {
          meetingNo: data.meetingNo,
          inviters: data.inviters || [],
          extraPayload: JSON.stringify({
            eventType: 'inviteMeeting',
            eventValue: {
              invitorId: this.userId,
              meetingNo: data.meetingNo,
            },
          }),
        };
        console.log('IM-邀请加入会议业务逻辑', inviteData);
        this.sendAssistInviteEvent(inviteData);
      }
      return res;
    } catch (error) {
      // 捕获和处理异常
      console.log('joinMeeting', error);
      throw error;
    }
  }

  // 修改语言获取翻译wss url /meeting/changeLanguageType
  public changeLanguageAndIndustryType(params: any) {
    return new Promise((resolve, reject) => {
      axios
        .post(`${this.hostUrl}/api/meeting/meeting/changeLanguageAndIndustryType`, params)
        .then((response: any) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  // 发送协助邀请同意事件
  private sendAssistInviteeAcceptEvent(data: {
    meetingNo: string;
    invitor: number;
  }) {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistInviteeAcceptEvent.create({
      ...data,
    });
    const enContent =
      PB.AssistInviteeAcceptEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_INVITEE_ACCEPT,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 发送忙碌事件
  private sendAssistInviteeBusyEvent(data: {
    meetingNo: string;
    invitor: number;
  }) {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistInviteeBusyEvent.create({
      ...data,
    });
    const enContent = PB.AssistInviteeBusyEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_INVITEE_BUSY,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 发送超时
  private sendAssistInviteeTimeoutEvent(data: {
    meetingNo: string;
    invitor: number;
  }) {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistInviteeTimeoutEvent.create({
      ...data,
    });
    const enContent =
      PB.AssistInviteeTimeoutEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_INVITEE_TIMEOUT,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 同意加入会议
  public async agreeJoinMeeting(data: {
    meetingNo: string;
    invitor: number;
    forceEntryStatus: number;
  }) {
    try {
      // 调用 joinMeetingApi 方法
      const res: any = await this.joinMeetingApi({
        meetingNo: data.meetingNo,
        forceEntryStatus: data.forceEntryStatus,
      });
      if (res.code === 200) {
        this.sendAssistInviteeAcceptEvent(data);
      }
      return res;
    } catch (error) {
      // 捕获和处理异常
      console.log('joinMeeting', error);
      throw error;
    }
  }

  // 结束会议接口
  private async overMeeting(data: { meetingId: string }) {
    this.clearRoomParams();
    return new Promise<void>((resolve, reject) => {
      axios
        .post(`${this.hostUrl}/api/meeting/meeting/close/${data.meetingId}`)
        .then((response: any) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private clearRoomParams() {
    this.meetingInfo = null;
    this.roomOnlineListPsn = [];
    this.roomOnlineGroupPsn = [];
    this.inviteListData = [];
    this.roomMenuOptions = {
      audio: true,
      video: false,
      loudspeaker: true,
    };
  }

  /**
   * 离开会议
   */
  private async leaveMeeting(data: { meetingId: string; userId: number }) {
    if (this.userId === data.userId) {
      this.clearRoomParams();
    }
    return new Promise<void>((resolve, reject) => {
      axios
        .post(`${this.hostUrl}/api/meeting/meeting/leave`, data)
        .then((response: any) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private async getGlassQrCode(data: { meetingNo: string }) {
    return new Promise<void>((resolve, reject) => {
      axios
        .get(
          `${this.hostUrl}/api/meeting/meeting/glass/login/join/code/${data.meetingNo}`
        )
        .then((response: any) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * 获取上传COS相关配置
   */
  private async uploadCosConfig() {
    return new Promise<void>((resolve, reject) => {
      axios
        .get(`${this.hostUrl}/api/meeting/file/upload/credential`)
        .then((response: any) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private async uploadShotScreen(data: {
    meetingId: string;
    screenshotUrl: string;
  }) {
    return new Promise<void>((resolve, reject) => {
      axios
        .post(`${this.hostUrl}/api/meeting/screenshot`, data)
        .then((response: any) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private async uploadRecordScreen(data: {
    meetingId: string;
    recordUrl: string;
  }) {
    return new Promise<void>((resolve, reject) => {
      axios
        .post(`${this.hostUrl}/api/meeting/manual/record`, data)
        .then((response: any) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private async uploadMeetingFile(data: {
    meetingId: number;
    attachmentType: number;
    attachmentUrl: string;
    attachmentName: string;
  }) {
    return new Promise<void>((resolve, reject) => {
      axios
        .post(`${this.hostUrl}/api/meeting/attachment`, data)
        .then((response: any) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private async getMeetingFile(data: {
    meetingId: number;
    attachmentType: string;
  }) {
    return new Promise<void>((resolve, reject) => {
      axios
        .get(
          `${this.hostUrl}/api/meeting/attachment/list?meetingId=${data.meetingId}&attachmentType=${data.attachmentType}`
        )
        .then((response: any) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private async getMeetingShareInfo(data: { meetingNo: string }) {
    return new Promise<void>((resolve, reject) => {
      axios
        .get(`${this.hostUrl}/api/meeting/plan/inviteInfo/${data.meetingNo}`)
        .then((response: any) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // AckMessage
  public sendAckMessage(data: { fp: string }) {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AckEvent.create(data);
    const enContent = PB.AckEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ACK,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  public sendAssistInviteeRejectEvent(data: {
    meetingNo: string;
    invitor: number;
  }) {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistInviteeRejectEvent.create(data);
    const enContent =
      PB.AssistInviteeRejectEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_INVITEE_REJECT,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 协助 全员禁音
  public sendAssistAllAudioDisable(data: { meetingNo: string }) {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistAllAudioDisableEvent.create(data);
    const enContent =
      PB.AssistAllAudioDisableEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_ALL_AUDIO_DISABLE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 协助 关闭 全员禁音
  public sendAssistAllAudioEnable(data: { meetingNo: string }) {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistAllAudioEnableEvent.create(data);
    const enContent =
      PB.AssistAllAudioEnableEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_ALL_AUDIO_ENABLE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 发送聊天消息
  public sendAssistChatMessageSendEvent(data: {
    meetingNo: string;
    type: any;
    message: string;
  }) {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistChatMessageSendEvent.create(data);
    const enContent =
      PB.AssistChatMessageSendEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_CHAT_MESSAGE_SEND,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 发送画板标开启事件
  public sendAssistDrawingBoardOpenEvent(data: {
    meetingNo: string;
    operator: number;
  }) {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistDrawingBoardOpenEvent.create(data);
    const enContent =
      PB.AssistDrawingBoardOpenEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_DRAWING_BOARD_OPEN,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 发送画板关闭事件
  public sendAssistDrawingBoardCloseEvent(data: { meetingNo: string }) {
    console.log('发送画板关闭事件', data);
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistDrawingBoardCloseEvent.create(data);
    const enContent =
      PB.AssistDrawingBoardCloseEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_DRAWING_BOARD_CLOSE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 发送撤销事件
  public sendBoardUndo(lineData: any) {
    console.log('发送撤销事件-sendBoardUndo', {
      ...lineData,
      action: PB.Action.DELETE,
    });
    const nowTime = Date.now();
    const dataReq: any = PB.AssistCanvasDrawingEvent.create({
      ...lineData,
      action: PB.Action.DELETE,
    });
    const enContent = PB.AssistCanvasDrawingEvent.encode(dataReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_CANVAS_DRAWING,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 发送清空事件
  public sendBoardClear(isMaster: boolean) {
    console.log(
      '发送清空事件-sendBoardClear',
      this.meetingInfo?.meetingNo,
      isMaster
    );
    const nowTime = Date.now();
    const dataReq: any = PB.AssistCanvasEraseEvent.create({
      meetingNo: this.meetingInfo?.meetingNo,
      clearAll: isMaster,
    });
    const enContent = PB.AssistCanvasEraseEvent.encode(dataReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_CANVAS_ERASE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 发送 canvas 线条数据
  public sendCanvasLineData(drawData: any) {
    console.log('发送 canvas 线条数据-sendCanvasLineData', drawData);
    const nowTime = Date.now();
    const points: any = [];
    drawData.data.forEach((item: any) => {
      const point: any = PB.DrawingData.create(item);
      points.push(point);
    });
    const CanvasDrawingReq: any = PB.AssistCanvasDrawingEvent.create({
      ...drawData,
      data: points,
    });
    const enContent =
      PB.AssistCanvasDrawingEvent.encode(CanvasDrawingReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_CANVAS_DRAWING,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 发送设置底图
  public sendCanvasImageChanged(data: string) {
    console.log('发送画布变化事件-AssistCanvasImageChangeEvent', data);
    const nowTime = Date.now();
    const createReq: any = PB.AssistCanvasImageChangeEvent.create({
      meetingNo: this.meetingInfo?.meetingNo,
      imageUrl: data,
      timestamp: nowTime,
    });
    const enContent =
      PB.AssistCanvasImageChangeEvent.encode(createReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_CANVAS_IMAGE_CHANGE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 发送画布状态变化事件
  public sendAssistCanvasChangeEvent(data: {
    meetingNo: string;
    scale: string;
    offsetX: string;
    offsetY: string;
    screenWidth: string;
    screenHeight: string;
    timestamp: number;
  }) {
    console.log('发送画布状态变化事件--', data);
    const nowTime = Date.now();
    const createReq: any = PB.AssistCanvasChangeEvent.create({
      ...data,
    });
    const enContent = PB.AssistCanvasChangeEvent.encode(createReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_CANVAS_CHANGE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 发送告警
  public sendWarningFlicker() {
    console.log('发送告警闪烁事件-AssistWaringFlickerEvent');
    const nowTime = Date.now();
    const createReq: any = PB.AssistWaringFlickerEvent.create({
      meetingNo: this.meetingInfo?.meetingNo,
    });
    const enContent = PB.AssistWaringFlickerEvent.encode(createReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_WARING_FLICKER,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 发送冻屏开启
  public sendAssistScreenFrozenOpenEvent = (data: {
    meetingNo: string;
    operator: number;
    imageUrl: string;
  }) => {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistScreenFrozenOpenEvent.create(data);
    const enContent =
      PB.AssistScreenFrozenOpenEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_SCREEN_FROZEN_OPEN,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 发送冻屏关闭 ASSIST_SCREEN_FROZEN_CLOSE
  public sendAssistScreenFrozenCloseEvent = (data: { meetingNo: string }) => {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistScreenFrozenCloseEvent.create(data);
    const enContent =
      PB.AssistScreenFrozenCloseEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_SCREEN_FROZEN_CLOSE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 发送闪点开启-ASSIST_FLICKER_SCENE_OPEN
  public sendAssistFlickerSceneOpenEvent = (data: {
    meetingNo: string;
    operator: number;
  }) => {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistFlickerSceneOpenEvent.create(data);
    const enContent =
      PB.AssistFlickerSceneOpenEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_FLICKER_SCENE_OPEN,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 发送闪点关闭 ASSIST_FLICKER_SCENE_CLOSE
  public sendAssistFlickerSceneCloseEvent = (data: { meetingNo: string }) => {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistFlickerSceneCloseEvent.create(data);
    const enContent =
      PB.AssistFlickerSceneCloseEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_FLICKER_SCENE_CLOSE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 发送闪点点位信息
  public sendAssistPointFlickerEvent = (data: {
    meetingNo: string;
    color: string;
    offsetX: string;
    offsetY: string;
    screenWidth: string;
    screenHeight: string;
  }) => {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistPointFlickerEvent.create(data);
    const enContent =
      PB.AssistPointFlickerEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_POINT_FLICKER,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 发送闪点画线信息
  public sendAssistLineFlickerEvent = (data: {
    meetingNo: string;
    uuid: string;
    color: string;
    width: string;
    data: any;
    screenWidth: string;
    screenHeight: string;
    finished: boolean;
    timestamp: number;
  }) => {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistLineFlickerEvent.create(data);
    const enContent = PB.AssistLineFlickerEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_LINE_FLICKER,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 发送屏幕共享信令-开启
  public sendAssistShareScreenOpenEvent = (data: { meetingNo: string }) => {
    console.log('发送屏幕共享信令-开启', data);
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistShareScreenOpenEvent.create(data);
    const enContent =
      PB.AssistShareScreenOpenEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_SHARE_SCREEN_OPEN,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 发送屏幕共享信令-关闭
  public sendAssistShareScreenCloseEvent = (data: { meetingNo: string }) => {
    console.log('发送屏幕共享信令-关闭', data);
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistShareScreenCloseEvent.create(data);
    const enContent =
      PB.AssistShareScreenCloseEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_SHARE_SCREEN_CLOSE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 发送摄像头缩放
  public sendAssistCameraZoomChangedEvent = (data: {
    meetingNo: string;
    userId: number;
    type: number;
  }) => {
    console.log('发送摄像头缩放', data);
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistCameraZoomChangeEvent.create(data);
    const enContent =
      PB.AssistCameraZoomChangeEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_CAMERA_ZOOM_CHANGE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 主持人变更事件
  public sendAssistMasterChangeEvent = (data: {
    meetingNo: string;
    newMaster: number;
  }) => {
    console.log('发送-主持人变更事件', data);
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistMasterChangeEvent.create(data);
    const enContent =
      PB.AssistMasterChangeEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_MASTER_CHANGE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 主持人-关闭其他人麦克风事件
  public sendAssistAudioCloseEvent = (data: {
    meetingNo: string;
    userId: number;
  }) => {
    console.log('主持人-关闭其他人麦克风事件', data);
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistAudioCloseEvent.create(data);
    const enContent = PB.AssistAudioCloseEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_AUDIO_CLOSE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 主持人-开启其他人麦克风事件
  public sendAssistAudioOpenEvent = (data: {
    meetingNo: string;
    userId: number;
  }) => {
    console.log('主持人-开启其他人麦克风事件', data);
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistAudioOpenEvent.create(data);
    const enContent = PB.AssistAudioOpenEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_AUDIO_OPEN,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 主持人-关闭其他人摄像头事件
  public sendAssistCameraCloseEvent = (data: {
    meetingNo: string;
    userId: number;
  }) => {
    console.log('主持人-关闭其他人摄像头事件', data);
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistCameraCloseEvent.create(data);
    const enContent = PB.AssistCameraCloseEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_CAMERA_CLOSE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 主持人-开启其他人摄像头事件
  public sendAssistCameraOpenEvent = (data: {
    meetingNo: string;
    userId: number;
  }) => {
    console.log('主持人-开启其他人摄像头事件', data);
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistCameraOpenEvent.create(data);
    const enContent = PB.AssistCameraOpenEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_CAMERA_OPEN,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // meetingNo: string;
  // /** 主播ID */
  // anchor: Long;
  // /** 操作员,视频画面所属方 */
  // operator: Long;
  // resolution: VideoResolution;
  // 设置主持人设置-HD 分辨率
  public sendAssistSetVideoResolutionEvent = (data: {
    meetingNo: string;
    anchor: number;
    resolution: number;
  }) => {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistSetVideoResolutionEvent.create(data);
    const enContent =
      PB.AssistSetVideoResolutionEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_SET_VIDEO_RESOLUTION,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 设置主持人设置-FPS：QUALITY_FIRST - 视频质量优先/FLUENCY_FIRST - 视频流畅度优先
  public sendAssistVideoTransferStrategyChangeEvent = (data: {
    meetingNo: string;
    member: number;
    type: number;
  }) => {
    const nowTime = Date.now();
    const dataContentReq: any =
      PB.AssistVideoTransferStrategyChangeEvent.create(data);
    const enContent =
      PB.AssistVideoTransferStrategyChangeEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_VIDEO_TRANSFER_STRATEGY_CHANGE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 客户端更新FPS
  public sendAssistVideoTransferStrategyUpdateEvent = (data: {
    meetingNo: string;
    type: number;
  }) => {
    console.log('客户端更新FPS', data);
    const nowTime = Date.now();
    const dataContentReq: any =
      PB.AssistVideoTransferStrategyUpdateEvent.create(data);
    const enContent =
      PB.AssistVideoTransferStrategyUpdateEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_VIDEO_TRANSFER_STRATEGY_UPDATE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 客户端更新HD分辨率
  public sendAssistVideoResolutionUpdateEvent = (data: {
    meetingNo: string;
    resolution: number;
  }) => {
    console.log('客户端更新HD', data);
    const nowTime = Date.now();
    const dataContentReq: any =
      PB.AssistVideoResolutionUpdateEvent.create(data);
    const enContent =
      PB.AssistVideoResolutionUpdateEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_VIDEO_RESOLUTION_UPDATE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  };

  // 发送会议状态同步请求
  public sendAssistMeetingStatusSyncEvent(data: { meetingNo: string }) {
    console.log('发送会议状态同步请求', data);
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistMeetingStatusSyncEvent.create(data);
    const enContent =
      PB.AssistMeetingStatusSyncEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_STATUS_SYNC_REQUEST,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 发送眼镜端加入会议
  public sendAssistOtherClientInviteEvent(data: {
    meetingNo: string;
    toClient: number;
  }) {
    console.log('发送眼镜端加入会议', data);
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistOtherClientInviteEvent.create(data);
    const enContent =
      PB.AssistOtherClientInviteEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_OTHER_CLIENT_INVITE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 发送上传文件通知
  public sendAssistUploadFileNotifyEvent(data: { meetingNo: string }) {
    console.log('发送上传文件通知', data);
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistUploadFileNotifyEvent.create(data);
    const enContent =
      PB.AssistUploadFileNotifyEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_UPLOAD_FILE_NOTIFY,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 会议状态回答
  private sendAssistMeetingStatusAnswerEvent(data: {
    meetingNo: string;
    client: number;
  }) {
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistMeetingStatusAnswerEvent.create({
      ...data,
    });
    const enContent =
      PB.AssistMeetingStatusAnswerEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_MEETING_STATUS_ANSWER,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  // 会议翻译发送
  public sendAssistMeetingRealTimeTranslation(data: {
    meetingNo: string;
    sourceLanguage: string;
    message: string;
  }) {
    console.log('sendAssistMeetingRealTimeTranslation---', data);
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistMeetingRealTimeTranslationEvent.create(
      {
        ...data,
      }
    );
    const enContent =
      PB.AssistMeetingRealTimeTranslationEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_MEETING_REAL_TIME_TRANSLATION,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }

  //// todo【客户端发送服务端】会议成员设置语言
  public assistMemberLanguageUpdate(data: {
    meetingNo: string;
    language: string;
  }) {
    console.log('AssistMemberLanguageUpdateEvent---', data);
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistMemberLanguageUpdateEvent.create(
      {
        ...data,
      }
    );
    const enContent =
      PB.AssistMemberLanguageUpdateEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_MEMBER_LANGUAGE_UPDATE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }


  //// todo【客户端发送服务端】实时翻译消息
  public assistMeetingRealTimeMessage(data: {
    /** 会议号 */
    meetingNo: string;
    /** 翻译消息 */
    message: string;
    /** 消息发送时间 */
    timestamp: Long;
    /** 翻译消息的语言 */
    messageLanguage: string;
  }) {
    // console.log('AssistMeetingRealTimeMessageEvent---', data);
    const nowTime = Date.now();
    const dataContentReq: any = PB.AssistMeetingRealTimeMessageEvent.create(
      {
        ...data,
      }
    );
    const enContent =
      PB.AssistMeetingRealTimeMessageEvent.encode(dataContentReq).finish();
    const PBProtocol: any = PB.Protocol.create({
      type: PB.EventType.ASSIST_MEETING_REAL_TIME_MESSAGE,
      fp: uuidv4(),
      event: enContent,
      timestamp: nowTime,
    });
    const enProtocol = PB.Protocol.encode(PBProtocol).finish();
    this.webSocketService?.sendMessage(enProtocol);
  }
}
