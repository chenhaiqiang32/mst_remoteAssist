import { defineStore } from 'pinia';
import { useChatIndexedDB } from '@/utils/sdk/chatDB';
import {
  getGroupMember as getGroupMemberApi,
  getChatConversationList as getChatConversationListApi,
  inviteGroupMember as inviteGroupMemberApi,
  leaveGroup as leaveGroupApi,
  disbandGroup as disbandGroupApi,
  removeGroupMember as removeGroupMemberApi,
  createGroup as createGroupApi,
  getGroupDetail as getGroupDetailApi,
  revampGroupName as revampGroupNameApi,
  transferGroupMaster as transferGroupMasterApi,
  getChatMessageList as getChatMessageListApi,
  getChatMessagePageList as getChatMessagePageListApi,
  getChatOffLineMessageList as getChatOffLineMessageListApi,
} from '@/api/chat';
import { ChatState } from './types';

const dbName = 'ChatDB';
const { updateConversations } = useChatIndexedDB(dbName);
const useChatStore = defineStore('chat', {
  state: (): ChatState => ({
    ChatImEvent: null,
    conversationList: null, // 会话列表
    curConversation: null, // 当前选择的会话
    groupChatSettingVisible: false, // 群聊设置显示
    curGroupDetail: null, // 群聊设置参数
    messageList: [],
  }),

  getters: {},

  actions: {
    updateChatImEvent(ChatImEvent: any) {
      this.$patch({ ChatImEvent });
    },
    updateCurConversation(curConversation: any) {
      this.$patch({ curConversation });
    },
    updateConversationList(conversationList: any) {
      this.$patch({ conversationList });
    },
    // 变更显示群聊设置
    updateGroupChatSettingVisible(groupChatSettingVisible: boolean) {
      this.$patch({ groupChatSettingVisible });
    },
    updateCurGroupDetail(curGroupDetail: any) {
      this.$patch({ curGroupDetail });
    },
    // 更新
    updateMessageList(messageList: any) {
      const newMessageList = JSON.parse(JSON.stringify(messageList));
      this.$patch({ messageList: newMessageList });
    },
    updateConversations(conversation: any) {
      updateConversations(conversation);
    },
    getGroupMember(params: any) {
      return new Promise<void>((resolve, reject) => {
        getGroupMemberApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    },
    inviteGroupMember(params: any) {
      return new Promise<void>((resolve, reject) => {
        inviteGroupMemberApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    },
    leaveGroup(params: any) {
      return new Promise<void>((resolve, reject) => {
        leaveGroupApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    },
    disbandGroup(params: any) {
      return new Promise<void>((resolve, reject) => {
        disbandGroupApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    },
    removeGroupMember(params: any) {
      return new Promise<void>((resolve, reject) => {
        removeGroupMemberApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    },
    createGroup(params: any) {
      return new Promise<void>((resolve, reject) => {
        createGroupApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    },
    getGroupDetail(params: any) {
      return new Promise<void>((resolve, reject) => {
        getGroupDetailApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    },
    revampGroupName(params: any) {
      return new Promise<void>((resolve, reject) => {
        revampGroupNameApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    },
    transferGroupMaster(params: any) {
      return new Promise<void>((resolve, reject) => {
        transferGroupMasterApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    },
    getChatConversationList() {
      return new Promise<void>((resolve, reject) => {
        getChatConversationListApi()
          .then((res: any) => {
            resolve(res);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    },
    getChatMessagePageList(params: any) {
      return new Promise<void>((resolve, reject) => {
        getChatMessagePageListApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    },
    getChatMessageList(params: any) {
      return new Promise<void>((resolve, reject) => {
        getChatMessageListApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    },
    getChatOffLineMessageList(params: any) {
      return new Promise<void>((resolve, reject) => {
        getChatOffLineMessageListApi(params)
          .then((res: any) => {
            resolve(res);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    },
  },
});

export default useChatStore;
