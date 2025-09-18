import { defineStore } from 'pinia';

const useThMeetingStore = defineStore('th-meeting', {
  state: (): any => ({
    roomTranslateInfo: {}, // 本次会议翻译行业信息
    meetingPersonListInfo: {
      right: 30, // 右侧人员列表距离右侧距离
      visible: false, // 人员消息列表是否显示
    },
    limitMember: 17,
    assistNetworkStatus: true,
    uploadFileStatus: false,
    ThImEvent: null, // 全局 im事件
    ThRtcClient: null, // 全局 rtc事件
    devicesList: null, // 设备 摄像头及 麦克风 列表
    deviceOptions: {
      audioIndex: 0, // 当前麦克风
      videoIndex: 0, // 当前摄像头
    },
    mineInfo: null, // 自己的用户信息
    uploadFileNews: false, // 接收远端上传文件时，控制显示红点
    meetingInfo: {
      agoraTokenData: {
        appId: null,
        token: null,
      }, // 声网配置
      meetingId: null, // 会议id
      meetingNo: null, // 会议号
      startTime: null, // 会议开始时间
      subject: null, // 会议主题
    }, // 会议房间信息
    roomMenuOptions: {
      audio: true, // 音频
      video: false, // 视频
      loudspeaker: true, // 扬声器
    }, // 当前房间菜单状态
    allAudioDisable: false, // 全员静音
    inviteMemberList: [], // 协助中的人员列表
    inviteMemberGroup: [], // 协助中的人员分组列表
    inviteListData: [], // 正在邀请中的人员
    lectureInfo: null, // 当前主播信息
    roomAssistMember: [], // 当前房间中人员及状态
    currentMessageList: [], // 即时显示消息
    scene: 0, // 场景 0 主播； 1 画板；2 冻屏； 3 闪点
    sceneDisabled: false,
    isShareScreen: false, // 是否屏幕共享
    anchor: null, // 场景主播
    isRecord: false, // 是否在屏幕录制
    optimizationMode: 'motion', // FPS 设置
    optimizationHd: 3, // hd 设置 默认1080p
    drawStyle: {
      type: 0, // 画笔类型
      weight: '1', // 画笔粗细
      color: '1', // 画笔颜色
    },
    boardInitStyle: {
      initWidth: 0,
      initHeight: 0,
    },
    boardMinScale: 1,
    boardMaxScale: 3,
    boardStepScale: 0.5,
    boardStatus: {
      cursor: 'auto', // auto ； grab 和 grabbing：分别表示手形和正在抓取
      scale: 1,
      dragStart: {
        // 画布拖动 位置
        x: 0,
        y: 0,
      },
      offset: {
        // 相对父级偏移量
        x: 0,
        y: 0,
      },
      isDrag: false, // 是否开启拖动
      isDragging: false, // 是否正在拖动
      isDrawing: false, // 是否正在画线
      baseMap: '', // 底图
      isWarning: false, // 告警UI
    },
  }),

  getters: {},

  actions: {
    updateRoomTranslateInfo(roomTranslateInfo: any) {
      this.$patch({ roomTranslateInfo });
    },
    resetMeetingPersonListInfo() {
      this.$patch({ meetingPersonListInfo: { right: 30, visible: false } });
    },
    updateAssistNetworkStatus(assistNetworkStatus: boolean) {
      this.$patch({ assistNetworkStatus });
    },
    updateUploadFileStatus(uploadFileStatus: boolean) {
      this.$patch({ uploadFileStatus });
    },
    // 赋值ThEventSdk
    updateThImEvent(ThImEvent: any) {
      this.$patch({ ThImEvent });
    },
    // 赋值ThRtcClient
    updateThRtcClient(ThRtcClient: any) {
      this.$patch({ ThRtcClient });
    },
    // 更新协助中硬件设备列表
    updateDevicesList(devicesList: any) {
      this.$patch({ devicesList });
    },
    // 更新当前选择设备
    updateDeviceOptions(deviceOptions: any) {
      this.$patch({ deviceOptions });
    },
    // 更新当前麦克风
    updateDeviceOptionsAudioIndex(audioIndex: number) {
      const newDeviceOptions = { ...this.deviceOptions, audioIndex };
      this.$patch({ deviceOptions: newDeviceOptions });
    },
    // 更新当前摄像头
    updateDeviceOptionsVideoIndex(videoIndex: number) {
      const newDeviceOptions = { ...this.deviceOptions, videoIndex };
      this.$patch({ deviceOptions: newDeviceOptions });
    },

    // 更新自己信息
    updateMineInfo(userId: any) {
      const mineInfo = this.filterMemberInfo(userId);
      this.$patch({ mineInfo });
    },
    filterMemberInfo(userId: any) {
      return this.inviteMemberList.find(
        (member: any) => member.userId === userId
      );
    },
    // 更新上传文件红点显示
    updateUploadFileNews(uploadFileNews: boolean) {
      this.$patch({ uploadFileNews });
    },
    // 更新会议房间信息
    updateMeetingInfo(meetingInfo: any) {
      localStorage.setItem('meetingInfo', JSON.stringify({ ...meetingInfo }));
      this.$patch({ meetingInfo });
    },
    // 更新会议房间信息-声网信息
    updateMeetingInfoAgoraTokenData(agoraTokenData: any) {
      const newData = { ...this.meetingInfo, agoraTokenData };
      this.$patch({ meetingInfo: newData });
    },
    // 更新会议房间信息-会议Id
    updateMeetingInfoMeetingId(meetingId: any) {
      const newData = { ...this.meetingInfo, meetingId };
      this.$patch({ meetingInfo: newData });
    },
    // 更新会议房间信息-会议号
    updateMeetingInfoMeetingNo(meetingNo: any) {
      const newData = { ...this.meetingInfo, meetingNo };
      this.$patch({ meetingInfo: newData });
    },
    // 更新会议房间信息-会议主题
    updateMeetingInfoSubject(subject: any) {
      const newData = { ...this.meetingInfo, subject };
      this.$patch({ meetingInfo: newData });
    },
    // 更新房间菜单按钮状态
    updateRoomMenuOptions(roomMenuOptions: any) {
      this.$patch({ roomMenuOptions });
    },
    updateRoomMenuOptionsAudio(audio: boolean) {
      const newData = { ...this.roomMenuOptions, audio };
      this.$patch({ roomMenuOptions: newData });
    },
    updateRoomMenuOptionsVideo(video: boolean) {
      const newData = { ...this.roomMenuOptions, video };
      this.$patch({ roomMenuOptions: newData });
    },
    updateRoomMenuOptionsLoudspeaker(loudspeaker: number) {
      const newRoomMenuOptions = { ...this.roomMenuOptions, loudspeaker };
      this.$patch({ roomMenuOptions: newRoomMenuOptions });
    },
    updateAllAudioDisable(allAudioDisable: boolean) {
      this.$patch({ allAudioDisable });
    },
    // 更新房间中可被邀请的人员列表
    updateInviteMemberList(inviteMemberList: any) {
      this.$patch({ inviteMemberList });
    },
    // 更新房间中可被邀请的人员分组列表
    updateInviteMemberGroup(inviteMemberGroup: any) {
      this.$patch({ inviteMemberGroup });
    },
    // 更新房间中正式邀请的人员
    updateInviteListData(inviteListData: any) {
      this.$patch({ inviteListData });
    },
    // 更新主播信息
    updateLectureInfo(lectureInfo: any) {
      const deepCopiedLectureInfo = lectureInfo
        ? JSON.parse(JSON.stringify(lectureInfo))
        : lectureInfo;
      this.$patch({ lectureInfo: deepCopiedLectureInfo });
    },
    // 更新协助房间中人员
    updateRoomAssistMember(updateInfo: {
      userId: number;
      hasVideo: boolean;
      hasAudio: boolean;
    }) {
      const { userId, hasVideo, hasAudio } = updateInfo;
      // 查找 inviteMemberList 中是否有对应的 userId
      const inviteMember = this.inviteMemberList.find(
        (member: any) => member.userId === userId
      );
      if (!inviteMember) {
        console.warn(
          `User with userId ${userId} not found in inviteMemberList`
        );
        return;
      }

      // 查找 roomAssistMember 中是否已经存在该用户
      const existingMemberIndex = this.roomAssistMember.findIndex(
        (member: any) => member.userId === userId
      );

      if (existingMemberIndex !== -1) {
        // 如果存在，更新对应字段
        this.roomAssistMember[existingMemberIndex] = {
          ...this.roomAssistMember[existingMemberIndex],
          hasVideo,
          hasAudio,
        };
      } else {
        // 如果不存在，则插入新对象
        this.roomAssistMember.push({
          ...inviteMember,
          hasVideo,
          hasAudio,
        });
      }
    },

    updateRoomAssistMemberClient(updateInfo: {
      userId: number;
      client: number;
    }) {
      const { userId, client } = updateInfo;

      // 查找 inviteMemberList 中是否有对应的 userId
      const inviteMember = this.inviteMemberList.find(
        (member: any) => member.userId === userId
      );
      if (!inviteMember) {
        console.warn(
          `User with userId ${userId} not found in inviteMemberList`
        );
        return;
      }
      // 查找 roomAssistMember 中是否已经存在该用户
      const existingMemberIndex = this.roomAssistMember.findIndex(
        (member: any) => member.userId === userId
      );
      if (existingMemberIndex !== -1) {
        // 如果存在，更新对应字段
        this.roomAssistMember[existingMemberIndex] = {
          ...this.roomAssistMember[existingMemberIndex],
          client,
        };
      } else {
        // 如果不存在，则插入新对象
        this.roomAssistMember.push({
          ...inviteMember,
          client,
        });
      }
    },
    updateRoomAssistMemberDirection(updateInfo: {
      userId: number;
      client: number;
      direction: number;
    }) {
      const { userId, client, direction } = updateInfo;

      // 查找 inviteMemberList 中是否有对应的 userId
      const inviteMember = this.inviteMemberList.find(
        (member: any) => member.userId === userId
      );
      if (!inviteMember) {
        console.warn(
          `User with userId ${userId} not found in inviteMemberList`
        );
        return;
      }
      // 查找 roomAssistMember 中是否已经存在该用户
      const existingMemberIndex = this.roomAssistMember.findIndex(
        (member: any) => member.userId === userId
      );
      if (existingMemberIndex !== -1) {
        // 如果存在，更新对应字段
        this.roomAssistMember[existingMemberIndex] = {
          ...this.roomAssistMember[existingMemberIndex],
          client,
          direction,
        };
      } else {
        // 如果不存在，则插入新对象
        this.roomAssistMember.push({
          ...inviteMember,
          client,
          direction,
        });
      }
    },
    updateRoomAssistSetVideoResolutiondEvent(updateInfo: {
      userId: number;
      optimizationHd: number;
    }) {
      const { userId, optimizationHd } = updateInfo;

      // 查找 inviteMemberList 中是否有对应的 userId
      const inviteMember = this.inviteMemberList.find(
        (member: any) => member.userId === userId
      );
      if (!inviteMember) {
        console.warn(
          `User with userId ${userId} not found in inviteMemberList`
        );
        return;
      }
      // 查找 roomAssistMember 中是否已经存在该用户
      const existingMemberIndex = this.roomAssistMember.findIndex(
        (member: any) => member.userId === userId
      );

      if (existingMemberIndex !== -1) {
        // 如果存在，更新对应字段
        this.roomAssistMember[existingMemberIndex] = {
          ...this.roomAssistMember[existingMemberIndex],
          optimizationHd,
        };
      } else {
        // 如果不存在，则插入新对象
        this.roomAssistMember.push({
          ...inviteMember,
          optimizationHd,
        });
      }
    },
    updateRoomAssistMemberOptimizationMode(updateInfo: {
      userId: number;
      optimizationMode: number;
    }) {
      const { userId, optimizationMode } = updateInfo;

      // 查找 inviteMemberList 中是否有对应的 userId
      const inviteMember = this.inviteMemberList.find(
        (member: any) => member.userId === userId
      );
      if (!inviteMember) {
        console.warn(
          `User with userId ${userId} not found in inviteMemberList`
        );
        return;
      }
      // 查找 roomAssistMember 中是否已经存在该用户
      const existingMemberIndex = this.roomAssistMember.findIndex(
        (member: any) => member.userId === userId
      );

      if (existingMemberIndex !== -1) {
        // 如果存在，更新对应字段
        this.roomAssistMember[existingMemberIndex] = {
          ...this.roomAssistMember[existingMemberIndex],
          optimizationMode,
        };
      } else {
        // 如果不存在，则插入新对象
        this.roomAssistMember.push({
          ...inviteMember,
          optimizationMode,
        });
      }
    },
    removeRoomAssistMember(removeUser: { userId: number }) {
      // 查找要删除的用户在 roomAssistMember 中的索引
      const index = this.roomAssistMember.findIndex(
        (member: any) => member.userId === removeUser.userId
      );

      if (index !== -1) {
        // 如果找到该用户，则从数组中移除
        this.roomAssistMember.splice(index, 1);
        if (removeUser.userId === this.lectureInfo.userId) {
          this.$patch({
            lectureInfo: {
              ...this.mineInfo,
              hasAudio: this.roomMenuOptions.audio,
              hasVideo: this.roomMenuOptions.video,
            },
          });
        }
        // 更新状态
        this.$patch({
          roomAssistMember: [...this.roomAssistMember],
        });
      }
    },
    filterRoomAssistMemberInfo(userId: any) {
      console.log('filterRoomAssistMemberInfo', this.roomAssistMember);
      return this.roomAssistMember.find(
        (member: any) => member.userId === userId
      );
    },
    updateCurrentMessageList(message: any) {
      const newList = this.currentMessageList;
      newList.push(message);
      this.$patch({ currentMessageList: newList });
      console.log('updateCurrentMessageList', this.currentMessageList);
    },
    removeCurrentMessageList() {
      const newList = this.currentMessageList;
      newList.splice(0, 1);
      this.$patch({ currentMessageList: newList });
      console.log('removeCurrentMessageList', this.currentMessageList);
    },
    updateScene(scene: any) {
      this.$patch({ scene });
    },
    updateSceneDisabled(sceneDisabled: boolean) {
      this.$patch({ sceneDisabled });
    },
    updateIsShareScreen(isShareScreen: boolean) {
      this.$patch({ isShareScreen });
    },
    updateAnchor(anchor: any) {
      this.$patch({ anchor });
    },
    updateIsRecord(isRecord: boolean) {
      this.$patch({ isRecord });
    },
    updateDrawStyle(drawStyle: any) {
      this.$patch({ drawStyle });
    },
    updateDrawStyleType(type: number) {
      const newDrawStyle = { ...this.drawStyle, type };
      this.$patch({ drawStyle: newDrawStyle });
    },
    updateDrawStyleWeight(weight: number) {
      const newDrawStyle = { ...this.drawStyle, weight };
      this.$patch({ drawStyle: newDrawStyle });
    },
    updateDrawStyleColor(color: number) {
      const newDrawStyle = { ...this.drawStyle, color };
      this.$patch({ drawStyle: newDrawStyle });
    },
    updateBoardInitStyle(boardInitStyle: any) {
      this.$patch({ boardInitStyle });
    },
    clearDrawStyle() {
      this.$patch({
        drawStyle: {
          type: 0,
          weight: '1',
          color: '1',
        },
      });
    },
    updateBoardStatus(boardStatus: any) {
      this.$patch({ boardStatus });
    },
    updateBoardStatusCursor(cursor: any) {
      const newBoardStatus = { ...this.boardStatus, cursor };
      this.$patch({ boardStatus: newBoardStatus });
    },
    updateBoardStatusScale(scale: number) {
      const newBoardStatus = { ...this.boardStatus, scale };
      this.$patch({ boardStatus: newBoardStatus });
    },
    updateBoardStatusDragStart(dragStart: any) {
      const newBoardStatus = { ...this.boardStatus, dragStart };
      this.$patch({ boardStatus: newBoardStatus });
    },
    updateBoardStatusOffset(offset: any) {
      const newBoardStatus = { ...this.boardStatus, offset };
      this.$patch({ boardStatus: newBoardStatus });
    },
    updateBoardStatusIsDrag(isDrag: boolean) {
      const newBoardStatus = { ...this.boardStatus, isDrag };
      this.$patch({ boardStatus: newBoardStatus });
    },
    updateBoardStatusIsDragging(isDragging: boolean) {
      const newBoardStatus = { ...this.boardStatus, isDragging };
      this.$patch({ boardStatus: newBoardStatus });
    },
    updateBoardStatusIsDrawing(isDrawing: boolean) {
      const newBoardStatus = { ...this.boardStatus, isDrawing };
      this.$patch({ boardStatus: newBoardStatus });
    },
    updateBoardStatusBaseMap(baseMap: any) {
      const newBoardStatus = { ...this.boardStatus, baseMap };
      this.$patch({ boardStatus: newBoardStatus });
    },
    updateBoardStatusIsWarning(isWarning: any) {
      const newBoardStatus = { ...this.boardStatus, isWarning };
      this.$patch({ boardStatus: newBoardStatus });
    },
    clearBoardStatus() {
      this.$patch({
        drawStyle: {
          type: 0, // 画笔类型
          weight: '1', // 画笔粗细
          color: '1', // 画笔颜色
        },
        boardInitStyle: {
          initWidth: 0,
          initHeight: 0,
        },
        boardMinScale: 1,
        boardMaxScale: 3,
        boardStepScale: 0.5,
        boardStatus: {
          cursor: 'auto', // auto ； grab 和 grabbing：分别表示手形和正在抓取
          scale: 1,
          dragStart: {
            // 画布拖动 位置
            x: 0,
            y: 0,
          },
          offset: {
            // 相对父级偏移量
            x: 0,
            y: 0,
          },
          isDrag: false, // 是否开启拖动
          isDragging: false, // 是否正在拖动
          isDrawing: false, // 是否正在画线
          baseMap: '', // 底图
          isWarning: false, // 告警UI
        },
      });
    },
    // 清除所有状态值
    resetState() {
      localStorage.removeItem('meetingInfo');
      this.$patch({
        limitMember: 17,
        assistNetworkStatus: true,
        uploadFileStatus: false,
        ThImEvent: null, // 全局 im事件
        ThRtcClient: null, // 全局 rtc事件
        devicesList: null, // 设备 摄像头及 麦克风 列表
        deviceOptions: {
          audioIndex: 0, // 当前麦克风
          videoIndex: 0, // 当前摄像头
        },
        mineInfo: null, // 自己的用户信息
        uploadFileNews: false, // 接收远端上传文件时，控制显示红点
        meetingInfo: {
          agoraTokenData: {
            appId: null,
            token: null,
          }, // 声网配置
          meetingId: null, // 会议id
          meetingNo: null, // 会议号
          startTime: null, // 会议开始时间
          subject: null, // 会议主题
        }, // 会议房间信息
        roomMenuOptions: {
          audio: true, // 音频
          video: false, // 视频
          loudspeaker: true, // 扬声器
        }, // 当前房间菜单状态
        allAudioDisable: false, // 全员静音
        inviteListData: [], // 正在邀请中的人员
        inviteMemberList: [], // 协助中的人员列表
        inviteMemberGroup: [], // 协助中的人员分组列表
        lectureInfo: null, // 当前主播信息
        roomAssistMember: [], // 当前房间中人员及状态
        currentMessageList: [], // 即时显示消息
        scene: 0, // 场景(主播) 0 画板； 1 冻屏；2 闪点 3
        sceneDisabled: false,
        isShareScreen: false, // 是否屏幕共享
        anchor: null, // 场景主播
        isRecord: false, // 是否在屏幕录制
        optimizationMode: 'motion', // FPS 设置
        optimizationHd: 3, // Hd 设置
        drawStyle: {
          type: 0, // 画笔类型
          weight: '1', // 画笔粗细
          color: '1', // 画笔颜色
        },
        boardInitStyle: {
          initWidth: 0,
          initHeight: 0,
        },
        boardMinScale: 1,
        boardMaxScale: 3,
        boardStepScale: 0.5,
        boardStatus: {
          cursor: 'auto', // auto ； grab 和 grabbing：分别表示手形和正在抓取
          scale: 1,
          dragStart: {
            // 画布拖动 位置
            x: 0,
            y: 0,
          },
          offset: {
            // 相对父级偏移量
            x: 0,
            y: 0,
          },
          isDrag: false, // 是否开启拖动
          isDragging: false, // 是否正在拖动
          isDrawing: false, // 是否正在画线
          baseMap: '', // 底图
          isWarning: false, // 告警UI
        },
      });
    },
  },
});

export default useThMeetingStore;
