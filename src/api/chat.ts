import axios from 'axios';

// 获取所有群员
export function getGroupMember(params: any) {
  return axios.get<any>(`/api/chat/group/member/${params.groupId}`);
}
// 邀请群组成员
export function inviteGroupMember(data: any) {
  return axios.post<any>(`/api/chat/group/member/invite`, data);
}
// 退出群组
export function leaveGroup(params: any) {
  return axios.delete<any>(`/api/chat/group/member/quit/${params.groupId}`);
}

/**
 * 移除群成员
 * data: { groupId: number; userIds: [0] }
 * */
export function removeGroupMember(data: any) {
  return axios.delete<any>(`/api/chat/group/member/remove`, { data });
}

/**
 * 解散群聊
 */
export function disbandGroup(data: any) {
  return axios.delete<any>(`/api/chat/group/disband/${data.groupId}`);
}
/**
 * 创建群组
 * data: { "groupName": "string","userIds": [0]}
 * */

export function createGroup(data: any) {
  return axios.post<any>(`/api/chat/group`, data);
}

// 获取群组详情列表
export function getGroupDetail(params: any) {
  return axios.get<any>(`/api/chat/group/detail/${params.groupId}`);
}

/**
 * 修改群组名称接口
 * data: {groupId: 0, groupName: 'string'}
 */
export function revampGroupName(data: any) {
  return axios.put<any>(`/api/chat/group/name`, data);
}

/**
 * 转移群主
 * data: {groupId: 0, userId: 0}
 */
export function transferGroupMaster(data: any) {
  return axios.put<any>(`/api/chat/group/transferMaster`, data);
}

/**
 * 消息列表接口(条件筛选客户端本地完成)
 */
export function getChatConversationList() {
  return axios.get<any>(`/api/chat/message/list`);
}
/**
 * 聊天室消息列表接口（所有）
 * @param params
 * @returns
 */
export function getChatMessageList(params: any) {
  return axios.get<any>(`/api/chat/message/detail/all`, {
    params,
  });
}
/**
 *  聊天室消息列表接口（所有,分页）
 * @param params
 * @returns
 */
export function getChatMessagePageList(params: any) {
  return axios.get<any>(`/api/chat/message/detail/list`, {
    params,
  });
}
/**
 * 聊天室消息列表接口（离线）
 */
export function getChatOffLineMessageList(params: any) {
  return axios.get<any>(`/api/chat/offline/message/list`, {
    params,
  });
}
