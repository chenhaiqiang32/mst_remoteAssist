export interface ChatState {
  ChatImEvent: any;
  curConversation: any;
  conversationList: any;
  curGroupDetail: any;
  groupChatSettingVisible: boolean;
  messageList: any;
}

export interface MessageListVO {
  chatType: number; // 聊天类型 0.单聊 1.群聊
  messageType: number; // 消息类型: 0.文本 1.图片 2.语音. 3.视频 4.文件
}
