/**
 * Remote Assist SDK 使用示例
 * 演示如何使用各个SDK模块
 */

// 导入SDK模块
import ChatIM from './src/utils/sdk/message_ws';
import ThIM from './packages/utils/sdk/im';
import ThRTC from './packages/utils/sdk/rtc';
import { useChatIndexedDB } from './src/utils/sdk/chatDB';
import EventListener from './src/utils/event-listener';
import THEventBus from './packages/services/THEventBus';

/**
 * SDK配置
 */
const SDK_CONFIG = {
  // WebSocket配置
  chatWssUrl: 'wss://chat.example.com/ws',
  meetingWssUrl: 'wss://meeting.example.com/ws',
  
  // 用户信息
  userId: 12345,
  token: 'your-auth-token',
  
  // API配置
  hostUrl: 'https://api.example.com',
  
  // Agora配置
  agoraAppId: 'your-agora-app-id',
  agoraToken: 'your-agora-token',
  
  // 数据库配置
  dbName: 'RemoteAssistDB'
};

/**
 * 聊天SDK示例
 */
class ChatSDKDemo {
  constructor() {
    this.chatIM = null;
    this.isConnected = false;
  }

  /**
   * 初始化聊天SDK
   */
  async initChatSDK() {
    try {
      console.log('🚀 初始化聊天SDK...');
      
      // 创建ChatIM实例
      this.chatIM = new ChatIM({
        wssUrl: SDK_CONFIG.chatWssUrl,
        userId: SDK_CONFIG.userId,
        token: SDK_CONFIG.token
      });

      // 监听事件
      this.setupChatEventListeners();

      // 初始化WebSocket连接
      this.chatIM.initChatWss();
      
      console.log('✅ 聊天SDK初始化完成');
      return true;
    } catch (error) {
      console.error('❌ 聊天SDK初始化失败:', error);
      return false;
    }
  }

  /**
   * 设置聊天事件监听
   */
  setupChatEventListeners() {
    // 监听WebSocket连接状态
    EventListener.on('ChatWsOpen', () => {
      console.log('🔗 聊天WebSocket连接已打开');
      this.isConnected = true;
    });

    EventListener.on('ChatWsClose', () => {
      console.log('🔌 聊天WebSocket连接已关闭');
      this.isConnected = false;
    });

    EventListener.on('ChatWsError', (error) => {
      console.error('❌ 聊天WebSocket错误:', error);
      this.isConnected = false;
    });

    // 监听登录事件
    EventListener.on('ChatLoginSuccess', (data) => {
      console.log('✅ 聊天登录成功:', data);
      this.onLoginSuccess(data);
    });

    // 监听消息事件
    EventListener.on('ChatMessageReceive', (message) => {
      console.log('📨 收到消息:', message);
      this.onMessageReceive(message);
    });

    EventListener.on('ChatMessageStatus', (status) => {
      console.log('📊 消息状态:', status);
      this.onMessageStatus(status);
    });

    // 监听用户状态
    EventListener.on('ChatUserOnline', (user) => {
      console.log('👤 用户上线:', user);
    });

    EventListener.on('ChatUserOffline', (user) => {
      console.log('👤 用户下线:', user);
    });

    // 监听群组事件
    EventListener.on('GroupCreatedEvent', (data) => {
      console.log('👥 群组创建:', data);
    });
  }

  /**
   * 登录聊天
   */
  async login() {
    if (!this.chatIM) {
      console.error('❌ 聊天SDK未初始化');
      return false;
    }

    try {
      console.log('🔐 开始登录聊天...');
      this.chatIM.login();
      return true;
    } catch (error) {
      console.error('❌ 聊天登录失败:', error);
      return false;
    }
  }

  /**
   * 发送消息
   */
  sendMessage(recipientId, content, messageType = 1) {
    if (!this.chatIM || !this.isConnected) {
      console.error('❌ 聊天SDK未连接');
      return false;
    }

    try {
      const messageData = {
        recipientId: recipientId,
        chatType: 1, // 单聊
        messageType: messageType, // 1: 文本, 2: 图片, 3: 文件
        content: content
      };

      console.log('📤 发送消息:', messageData);
      this.chatIM.sendMessage(messageData);
      return true;
    } catch (error) {
      console.error('❌ 发送消息失败:', error);
      return false;
    }
  }

  /**
   * 发送群组消息
   */
  sendGroupMessage(groupId, content, messageType = 1) {
    if (!this.chatIM || !this.isConnected) {
      console.error('❌ 聊天SDK未连接');
      return false;
    }

    try {
      const messageData = {
        recipientId: groupId,
        chatType: 2, // 群聊
        messageType: messageType,
        content: content
      };

      console.log('📤 发送群组消息:', messageData);
      this.chatIM.sendMessage(messageData);
      return true;
    } catch (error) {
      console.error('❌ 发送群组消息失败:', error);
      return false;
    }
  }

  /**
   * 登出聊天
   */
  logout() {
    if (this.chatIM) {
      console.log('👋 登出聊天...');
      this.chatIM.logout();
      this.isConnected = false;
    }
  }

  // 事件回调方法
  onLoginSuccess(data) {
    console.log('登录成功，用户信息:', data);
  }

  onMessageReceive(message) {
    console.log('收到新消息:', message);
    // 这里可以更新UI显示消息
  }

  onMessageStatus(status) {
    console.log('消息状态更新:', status);
    // 这里可以更新消息状态显示
  }
}

/**
 * 会议SDK示例
 */
class MeetingSDKDemo {
  constructor() {
    this.thIM = null;
    this.isConnected = false;
    this.meetingInfo = null;
  }

  /**
   * 初始化会议SDK
   */
  async initMeetingSDK() {
    try {
      console.log('🚀 初始化会议SDK...');
      
      // 创建ThIM实例
      this.thIM = new ThIM({
        wssUrl: SDK_CONFIG.meetingWssUrl,
        userId: SDK_CONFIG.userId,
        token: SDK_CONFIG.token,
        hostUrl: SDK_CONFIG.hostUrl
      });

      // 监听事件
      this.setupMeetingEventListeners();

      // 初始化WebSocket连接
      this.thIM.initWss();
      
      console.log('✅ 会议SDK初始化完成');
      return true;
    } catch (error) {
      console.error('❌ 会议SDK初始化失败:', error);
      return false;
    }
  }

  /**
   * 设置会议事件监听
   */
  setupMeetingEventListeners() {
    // 监听WebSocket连接状态
    THEventBus.on('ThAssistImWsOpen', () => {
      console.log('🔗 会议WebSocket连接已打开');
      this.isConnected = true;
    });

    // 监听登录事件
    THEventBus.on('ThAssistLoginSuccess', (data) => {
      console.log('✅ 会议登录成功:', data);
    });

    // 监听会议邀请
    THEventBus.on('ThAssistInvited', (data) => {
      console.log('📨 收到会议邀请:', data);
      this.onMeetingInvited(data);
    });

    // 监听成员加入
    THEventBus.on('th-assist-member-joined', (data) => {
      console.log('👤 成员加入会议:', data);
    });

    // 监听画板事件
    THEventBus.on('th-assist-canvas-drawing', (data) => {
      console.log('🎨 画板绘制:', data);
      this.onCanvasDrawing(data);
    });

    // 监听屏幕共享
    THEventBus.on('th-assist-share-screen-opened', (data) => {
      console.log('🖥️ 屏幕共享开启:', data);
    });

    THEventBus.on('th-assist-share-screen-closed', (data) => {
      console.log('🖥️ 屏幕共享关闭:', data);
    });

    // 监听聊天消息
    THEventBus.on('th-assist-chat-message-receive', (data) => {
      console.log('💬 会议聊天消息:', data);
    });
  }

  /**
   * 登录会议
   */
  async login() {
    if (!this.thIM) {
      console.error('❌ 会议SDK未初始化');
      return false;
    }

    try {
      console.log('🔐 开始登录会议...');
      this.thIM.login();
      return true;
    } catch (error) {
      console.error('❌ 会议登录失败:', error);
      return false;
    }
  }

  /**
   * 加入会议
   */
  async joinMeeting(meetingNo, forceEntryStatus = 1, inviters = []) {
    if (!this.thIM || !this.isConnected) {
      console.error('❌ 会议SDK未连接');
      return false;
    }

    try {
      console.log('🚪 加入会议:', meetingNo);
      
      const meetingData = {
        meetingNo: meetingNo,
        forceEntryStatus: forceEntryStatus,
        inviters: inviters
      };

      const result = await this.thIM.joinMeeting(meetingData);
      
      if (result.code === 200) {
        this.meetingInfo = result.data;
        console.log('✅ 成功加入会议:', this.meetingInfo);
        return true;
      } else {
        console.error('❌ 加入会议失败:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ 加入会议异常:', error);
      return false;
    }
  }

  /**
   * 开启画板
   */
  openDrawingBoard() {
    if (!this.thIM || !this.meetingInfo) {
      console.error('❌ 会议未加入');
      return false;
    }

    try {
      console.log('🎨 开启画板...');
      this.thIM.sendAssistDrawingBoardOpenEvent({
        meetingNo: this.meetingInfo.meetingNo,
        operator: SDK_CONFIG.userId
      });
      return true;
    } catch (error) {
      console.error('❌ 开启画板失败:', error);
      return false;
    }
  }

  /**
   * 发送画板数据
   */
  sendCanvasData(drawData) {
    if (!this.thIM || !this.meetingInfo) {
      console.error('❌ 会议未加入');
      return false;
    }

    try {
      console.log('🎨 发送画板数据:', drawData);
      this.thIM.sendCanvasLineData({
        meetingNo: this.meetingInfo.meetingNo,
        ...drawData
      });
      return true;
    } catch (error) {
      console.error('❌ 发送画板数据失败:', error);
      return false;
    }
  }

  /**
   * 开启屏幕共享
   */
  startScreenShare() {
    if (!this.thIM || !this.meetingInfo) {
      console.error('❌ 会议未加入');
      return false;
    }

    try {
      console.log('🖥️ 开启屏幕共享...');
      this.thIM.sendAssistShareScreenOpenEvent({
        meetingNo: this.meetingInfo.meetingNo
      });
      return true;
    } catch (error) {
      console.error('❌ 开启屏幕共享失败:', error);
      return false;
    }
  }

  /**
   * 发送会议聊天消息
   */
  sendMeetingMessage(message, type = 1) {
    if (!this.thIM || !this.meetingInfo) {
      console.error('❌ 会议未加入');
      return false;
    }

    try {
      console.log('💬 发送会议消息:', message);
      this.thIM.sendAssistChatMessageSendEvent({
        meetingNo: this.meetingInfo.meetingNo,
        type: type,
        message: message
      });
      return true;
    } catch (error) {
      console.error('❌ 发送会议消息失败:', error);
      return false;
    }
  }

  // 事件回调方法
  onMeetingInvited(data) {
    console.log('收到会议邀请，邀请人:', data.invitor);
    // 这里可以显示邀请弹窗
  }

  onCanvasDrawing(data) {
    console.log('画板绘制数据:', data);
    // 这里可以更新画板显示
  }
}

/**
 * 音视频SDK示例
 */
class RTCSDKDemo {
  constructor() {
    this.thRTC = null;
    this.isInRoom = false;
    this.localAudioTrack = null;
    this.localVideoTrack = null;
  }

  /**
   * 初始化音视频SDK
   */
  async initRTCSDK() {
    try {
      console.log('🚀 初始化音视频SDK...');
      
      // 创建ThRTC实例
      this.thRTC = new ThRTC({
        appId: SDK_CONFIG.agoraAppId,
        channel: 'meeting-room-001',
        token: SDK_CONFIG.agoraToken,
        uid: SDK_CONFIG.userId
      });

      // 监听事件
      this.setupRTCEventListeners();
      
      console.log('✅ 音视频SDK初始化完成');
      return true;
    } catch (error) {
      console.error('❌ 音视频SDK初始化失败:', error);
      return false;
    }
  }

  /**
   * 设置音视频事件监听
   */
  setupRTCEventListeners() {
    // 监听用户加入
    THEventBus.on('mst-agora-user-joined', (user) => {
      console.log('👤 用户加入房间:', user);
      this.onUserJoined(user);
    });

    // 监听用户离开
    THEventBus.on('mst-agora-user-left', (data) => {
      console.log('👤 用户离开房间:', data);
      this.onUserLeft(data);
    });

    // 监听音视频发布
    THEventBus.on('mst-agora-user-published', (data) => {
      console.log('📹 用户发布媒体:', data);
      this.onUserPublished(data);
    });

    // 监听音频轨道状态
    THEventBus.on('mst-agora-audio-track-open', () => {
      console.log('🔊 音频轨道开启');
    });

    THEventBus.on('mst-agora-audio-track-close', () => {
      console.log('🔇 音频轨道关闭');
    });
  }

  /**
   * 加入RTC房间
   */
  async joinRoom() {
    if (!this.thRTC) {
      console.error('❌ 音视频SDK未初始化');
      return false;
    }

    try {
      console.log('🚪 加入RTC房间...');
      await this.thRTC.joinRtcRoom();
      this.isInRoom = true;
      console.log('✅ 成功加入RTC房间');
      return true;
    } catch (error) {
      console.error('❌ 加入RTC房间失败:', error);
      return false;
    }
  }

  /**
   * 创建媒体流
   */
  async createMediaStream() {
    if (!this.thRTC || !this.isInRoom) {
      console.error('❌ 未加入RTC房间');
      return false;
    }

    try {
      console.log('📹 创建媒体流...');
      await this.thRTC.createMediaTrack('1080p');
      
      // 推送音频流
      this.thRTC.localAudioTrackPush();
      
      // 推送视频流
      this.thRTC.localVideoTrackPush();
      
      // 渲染本地视频
      this.thRTC.renderLocalStreams('local-video');
      
      console.log('✅ 媒体流创建成功');
      return true;
    } catch (error) {
      console.error('❌ 创建媒体流失败:', error);
      return false;
    }
  }

  /**
   * 开启屏幕共享
   */
  async startScreenShare() {
    if (!this.thRTC || !this.isInRoom) {
      console.error('❌ 未加入RTC房间');
      return false;
    }

    try {
      console.log('🖥️ 开启屏幕共享...');
      await this.thRTC.createScreenVideoTrack();
      this.thRTC.localScreenTrackPush();
      this.thRTC.renderLocalScreenStreams('screen-share');
      console.log('✅ 屏幕共享开启成功');
      return true;
    } catch (error) {
      console.error('❌ 开启屏幕共享失败:', error);
      return false;
    }
  }

  /**
   * 控制音频开关
   */
  toggleAudio(enabled) {
    if (!this.thRTC) {
      console.error('❌ 音视频SDK未初始化');
      return false;
    }

    try {
      console.log('🔊 切换音频状态:', enabled ? '开启' : '关闭');
      this.thRTC.localAudioTrackMuted(!enabled);
      return true;
    } catch (error) {
      console.error('❌ 切换音频失败:', error);
      return false;
    }
  }

  /**
   * 切换摄像头
   */
  async switchCamera(deviceId) {
    if (!this.thRTC) {
      console.error('❌ 音视频SDK未初始化');
      return false;
    }

    try {
      console.log('📹 切换摄像头:', deviceId);
      await this.thRTC.localSetCameraTrack(deviceId);
      return true;
    } catch (error) {
      console.error('❌ 切换摄像头失败:', error);
      return false;
    }
  }

  /**
   * 离开房间
   */
  leaveRoom() {
    if (this.thRTC) {
      console.log('👋 离开RTC房间...');
      this.thRTC.leaveRtcRoom();
      this.isInRoom = false;
    }
  }

  // 事件回调方法
  onUserJoined(user) {
    console.log('用户加入:', user.uid);
    // 这里可以渲染远端用户视频
  }

  onUserLeft(data) {
    console.log('用户离开:', data.user.uid);
    // 这里可以移除远端用户视频
  }

  onUserPublished(data) {
    console.log('用户发布媒体:', data.mediaType);
    // 这里可以订阅远端媒体流
  }
}

/**
 * 存储SDK示例
 */
class StorageSDKDemo {
  constructor() {
    this.chatDB = null;
  }

  /**
   * 初始化存储SDK
   */
  async initStorageSDK() {
    try {
      console.log('🚀 初始化存储SDK...');
      
      // 创建存储实例
      this.chatDB = useChatIndexedDB(SDK_CONFIG.dbName);
      
      console.log('✅ 存储SDK初始化完成');
      return true;
    } catch (error) {
      console.error('❌ 存储SDK初始化失败:', error);
      return false;
    }
  }

  /**
   * 添加会话
   */
  async addConversation(conversationData) {
    if (!this.chatDB) {
      console.error('❌ 存储SDK未初始化');
      return false;
    }

    try {
      console.log('💾 添加会话:', conversationData);
      await this.chatDB.addConversation(conversationData);
      console.log('✅ 会话添加成功');
      return true;
    } catch (error) {
      console.error('❌ 添加会话失败:', error);
      return false;
    }
  }

  /**
   * 添加消息
   */
  async addMessage(messageData, isNoRead = false) {
    if (!this.chatDB) {
      console.error('❌ 存储SDK未初始化');
      return false;
    }

    try {
      console.log('💾 添加消息:', messageData);
      await this.chatDB.addMessage(messageData, isNoRead);
      console.log('✅ 消息添加成功');
      return true;
    } catch (error) {
      console.error('❌ 添加消息失败:', error);
      return false;
    }
  }

  /**
   * 获取所有会话
   */
  async getAllConversations() {
    if (!this.chatDB) {
      console.error('❌ 存储SDK未初始化');
      return [];
    }

    try {
      console.log('📋 获取会话列表...');
      const conversations = await this.chatDB.getAllConversations();
      console.log('✅ 获取会话列表成功:', conversations);
      return conversations;
    } catch (error) {
      console.error('❌ 获取会话列表失败:', error);
      return [];
    }
  }

  /**
   * 获取会话消息
   */
  async getConversationMessages(conversationId) {
    if (!this.chatDB) {
      console.error('❌ 存储SDK未初始化');
      return [];
    }

    try {
      console.log('📋 获取会话消息:', conversationId);
      const messages = await this.chatDB.getAllMessages(conversationId);
      console.log('✅ 获取会话消息成功:', messages);
      return messages;
    } catch (error) {
      console.error('❌ 获取会话消息失败:', error);
      return [];
    }
  }

  /**
   * 清空数据
   */
  async clearAllData() {
    if (!this.chatDB) {
      console.error('❌ 存储SDK未初始化');
      return false;
    }

    try {
      console.log('🗑️ 清空所有数据...');
      await this.chatDB.clearAll();
      console.log('✅ 数据清空成功');
      return true;
    } catch (error) {
      console.error('❌ 清空数据失败:', error);
      return false;
    }
  }
}

/**
 * 综合SDK演示类
 */
class RemoteAssistSDKDemo {
  constructor() {
    this.chatSDK = new ChatSDKDemo();
    this.meetingSDK = new MeetingSDKDemo();
    this.rtcSDK = new RTCSDKDemo();
    this.storageSDK = new StorageSDKDemo();
  }

  /**
   * 初始化所有SDK
   */
  async initAllSDKs() {
    console.log('🚀 开始初始化所有SDK...');
    
    const results = await Promise.allSettled([
      this.chatSDK.initChatSDK(),
      this.meetingSDK.initMeetingSDK(),
      this.rtcSDK.initRTCSDK(),
      this.storageSDK.initStorageSDK()
    ]);

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    console.log(`✅ SDK初始化完成: ${successCount}/4 成功`);
    
    return successCount === 4;
  }

  /**
   * 登录所有服务
   */
  async loginAllServices() {
    console.log('🔐 开始登录所有服务...');
    
    const results = await Promise.allSettled([
      this.chatSDK.login(),
      this.meetingSDK.login()
    ]);

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    console.log(`✅ 服务登录完成: ${successCount}/2 成功`);
    
    return successCount === 2;
  }

  /**
   * 演示完整流程
   */
  async runFullDemo() {
    console.log('🎬 开始完整演示流程...');
    
    try {
      // 1. 初始化所有SDK
      const initSuccess = await this.initAllSDKs();
      if (!initSuccess) {
        throw new Error('SDK初始化失败');
      }

      // 2. 登录服务
      const loginSuccess = await this.loginAllServices();
      if (!loginSuccess) {
        throw new Error('服务登录失败');
      }

      // 3. 演示聊天功能
      console.log('💬 演示聊天功能...');
      this.chatSDK.sendMessage(67890, 'Hello, World!');
      this.chatSDK.sendGroupMessage(12345, '群组消息测试');

      // 4. 演示会议功能
      console.log('🎥 演示会议功能...');
      await this.meetingSDK.joinMeeting('MEETING_001');
      this.meetingSDK.openDrawingBoard();
      this.meetingSDK.sendMeetingMessage('会议聊天测试');

      // 5. 演示音视频功能
      console.log('📹 演示音视频功能...');
      await this.rtcSDK.joinRoom();
      await this.rtcSDK.createMediaStream();

      // 6. 演示存储功能
      console.log('💾 演示存储功能...');
      const conversation = {
        conversationId: 'conv_001',
        targetId: 67890,
        targetName: '张三',
        targetAvatarUrl: 'avatar.jpg',
        unreadCount: 0,
        sendTime: Date.now(),
        messageType: 1,
        content: 'Hello',
        chatType: 1,
        status: 1
      };
      await this.storageSDK.addConversation(conversation);

      console.log('🎉 完整演示流程完成！');
      return true;
    } catch (error) {
      console.error('❌ 演示流程失败:', error);
      return false;
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    console.log('🧹 清理资源...');
    
    this.chatSDK.logout();
    this.meetingSDK.logout();
    this.rtcSDK.leaveRoom();
    
    console.log('✅ 资源清理完成');
  }
}

// 导出演示类
export {
  ChatSDKDemo,
  MeetingSDKDemo,
  RTCSDKDemo,
  StorageSDKDemo,
  RemoteAssistSDKDemo,
  SDK_CONFIG
};

// 使用示例
if (typeof window !== 'undefined') {
  // 浏览器环境下的全局使用示例
  window.RemoteAssistSDK = {
    ChatSDKDemo,
    MeetingSDKDemo,
    RTCSDKDemo,
    StorageSDKDemo,
    RemoteAssistSDKDemo,
    SDK_CONFIG
  };

  // 创建全局演示实例
  window.sdkDemo = new RemoteAssistSDKDemo();
  
  console.log('🎯 Remote Assist SDK 演示已加载');
  console.log('💡 使用 window.sdkDemo.runFullDemo() 开始完整演示');
}
