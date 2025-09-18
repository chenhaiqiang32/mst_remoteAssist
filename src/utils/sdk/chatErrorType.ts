const ChatErrorType = {
  USER_NOT_EXIST: 20001, // 用户不存在
  GROUP_NOT_EXIST: 20101, // 群组不存在
  NOT_GROUP_MASTER: 20102, // 你不是群主
  ALREADY_MASTER: 20103, // 你已经是群主了
  NOT_GROUP_MEMBER: 20201, // 你不是群成员
  MASTER_CANNOT_QUIT_GROUP: 20202, // 你是群主，不能退出群组
  USER_NOT_GROUP_MEMBER: 20203, // 该用户不是群成员
  ALREADY_GROUP_MEMBER: 20204, // 已经是群成员了
};
export default ChatErrorType;
