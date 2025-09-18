<template>
  <div
    class="list-container"
    :class="{
      max: unfoldStatus,
      min: !unfoldStatus,
      activeScreenLayoutVideo:
        ThMeetingStore.lectureInfo?.activeScreenLayout === 1,
      activeScreenLayoutVideoNone:
        ThMeetingStore.lectureInfo?.activeScreenLayout === 2,
    }"
  >
    <div class="list-title">
      <div class="list-t-l">
        <span v-if="unfoldStatus">
          {{ t('mst.meeting.chrs') }} (
          {{ ThMeetingStore.roomAssistMember.length }}
          {{ t('mst.meeting.chrs.unit') }} )</span
        >
        <span v-else>
          {{ ThMeetingStore.roomAssistMember.length }}
        </span>
      </div>
      <div class="list-t-r" @click="handlePsnShowChange">
        <img :src="unfoldStatus ? minIcon : maxIcon" alt="" />
      </div>
    </div>
    <div class="list-main wsl-scroll">
      <!--  todo 改为v-show="unfoldStatus" 用来初始化 dom视频流 和 收起时自动监听展开   -->
      <div v-show="unfoldStatus">
        <!-- 邀请人员 -->
        <div
          v-if="
            ThMeetingStore.inviteListData &&
            ThMeetingStore.inviteListData.length > 0
          "
          class="list-main-invite"
        >
          <div
            v-for="(item, index) in ThMeetingStore.inviteListData"
            :key="`invite_item_${index}`"
            class="list-main-invite-i"
          >
            <div class="list-main-invite-i-l">
              <div class="list-main-invite-i-l-i">
                <img :src="item.avatarUrl" alt="" />
              </div>
              <div class="list-main-invite-i-l-n">
                {{ item.name }}
              </div>
            </div>
            <div class="list-main-invite-i-r">
              <span>{{ t('mst.meeting.psn.status.calling') }}</span>
            </div>
          </div>
        </div>
        <!-- 房间内人员 -->
        <div
          v-for="(item, index) in ThMeetingStore.roomAssistMember"
          :key="`psn_item_${index}`"
          class="list-main-mi"
          :class="{
            active: !(
              !ThMeetingStore.lectureInfo ||
              ThMeetingStore.lectureInfo.userId != item.userId
            ),
            // 冻屏和画板标注时候只要一个右上角
            activeScreenLayoutStatus:
              (!ThMeetingStore.lectureInfo ||
                ThMeetingStore.lectureInfo.userId != item.userId) &&
              ThMeetingStore.lectureInfo?.activeScreenLayout,
          }"
          @click="handleSetLectureInfo(item)"
        >
          <div class="list-main-mi-m">
            <!-- 不是主播&存在视频流 -->
            <div
              v-if="
                ThMeetingStore.lectureInfo.userId != item.userId &&
                item.hasVideo &&
                !ThMeetingStore.lectureInfo?.activeScreenLayout
              "
              :id="`mst-grid-video-${item.userId}`"
              class="list-psn-video"
            ></div>
            <!-- 不是主播&不存在视频流 -->
            <div
              v-if="
                ThMeetingStore.lectureInfo.userId != item.userId &&
                !item.hasVideo
              "
              class="list-psn"
            >
              <img :src="item.avatarUrl" alt="" />
            </div>
            <!-- 是主播&非标注场景 -->
            <div
              v-if="
                ThMeetingStore.lectureInfo.userId === item.userId &&
                ThMeetingStore.scene === 0
              "
              class="list-psn-text"
            >
              <span>{{ t('mst.meeting.psn.all.show') }}</span>
            </div>
            <!-- 是主播&标注场景 -->
            <div
              v-if="
                ThMeetingStore.lectureInfo.userId === item.userId &&
                [1, 2].includes(ThMeetingStore.scene)
              "
              class="list-psn-text"
              style="padding: 0"
            >
              <div
                :id="`mst-assist-lecture-video-marking-rt-${ThMeetingStore.lectureInfo.userId}`"
                style="width: 100%; height: 100%"
              >
              </div>
            </div>
            <div v-show="ThMeetingStore.scene == 3" class="list-psn-text">
              <span
                >{{ t('mst.scene.is.tip') }}{{ item.name
                }}{{ t('mst.scene.view.mark.flash') }}</span
              >
            </div>
            <!--            <div-->
            <!--              v-show="-->
            <!--                !(-->
            <!--                  ThMeetingStore.lectureInfo.userId === item.userId &&-->
            <!--                  ThMeetingStore.scene !== 0-->
            <!--                )-->
            <!--                // ThMeetingStore.lectureInfo?.activeScreenLayout === 1-->
            <!--              "-->
            <!--              class="list-psn-text"-->
            <!--            >-->
            <!--              <span-->
            <!--                >{{ t('mst.meeting.psn.scene.show1') }} {{ showSceneLabel()-->
            <!--                }}{{ t('mst.meeting.psn.scene.show2') }}</span-->
            <!--              >-->
            <!--            </div>-->
            <MstTooltip
              :content="showDevicesLabel(item)"
              :position="`left`"
              :offset="10"
              class="list-psn-device"
            >
              <div class="list-psn-device-m">
                <img :src="showDevicesType(item)" alt="" />
              </div>
            </MstTooltip>
            <div class="list-psn-info">
              <!-- 麦克风 -->
              <div
                class="list-psn-info-mic"
                @click.stop="handleChangeOtherMkf(item)"
              >
                <img :src="!item.hasAudio ? micIcon : micActiveIcon" alt="" />
              </div>
              <!-- 摄像头 -->
              <div
                class="list-psn-info-cam"
                @click.stop="handleChangeOtherSxt(item)"
              >
                <img :src="!item.hasVideo ? camIcon : camActiveIcon" alt="" />
              </div>
              <!-- 身份 -->
              <div
                v-if="item.userId == ThMeetingStore.meetingInfo.masterId"
                class="list-psn-info-ide"
              >
                {{ t('mst.meeting.zcr') }}
              </div>
              <!-- 名称 -->
              <div class="list-psn-info-name">
                {{ item.name }}
              </div>
              <!-- 是否是自己 -->
              <div class="list-psn-info-self">
                {{
                  ThMeetingStore.mineInfo.userId == item.userId
                    ? `(${t('mst.meeting.self')})`
                    : ''
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-show="!unfoldStatus">
        <!-- 邀请人员 -->
        <div
          v-show="!unfoldStatus"
          v-if="
            ThMeetingStore.inviteListData &&
            ThMeetingStore.inviteListData.length > 0
          "
          class="list-main-invite"
        >
          <div
            v-for="(item, index) in ThMeetingStore.inviteListData"
            :key="`invite_item_${index}`"
            class="list-main-invite-i"
          >
            <MstTooltip
              :content="`${item.name} ${t('mst.meeting.psn.status.calling')}`"
              :position="`left`"
              :offset="25"
              class="list-main-invite-i-m"
            >
              <div class="list-main-invite-i-m-m">
                <img :src="item.avatarUrl" alt="" />
                <div class="list-main-invite-i-m-m-s">
                  <span>{{ t('mst.meeting.psn.status.calling') }}</span>
                </div>
              </div>
            </MstTooltip>
          </div>
        </div>
        <!-- 房间内人员 -->
        <div
          v-for="(item, index) in ThMeetingStore.roomAssistMember"
          v-show="!unfoldStatus"
          :key="`psn_item_${index}`"
          class="list-main-mi"
          :class="
            !ThMeetingStore.lectureInfo ||
            ThMeetingStore.lectureInfo.userId != item.userId
              ? ''
              : 'active'
          "
          @click="handleSetLectureInfo(item)"
        >
          <MstTooltip
            :content="item.name"
            :position="`left`"
            :offset="25"
            class="list-main-mi-m"
          >
            <div class="list-main-mi-m-m">
              <img :src="item.avatarUrl" alt="" />
            </div>
          </MstTooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, watchEffect } from 'vue';
  import i18n from '../../../../locale/index';
  import * as PB from '../../../../proto/protocol';
  import MstTooltip from '../../../../components/tooltip/index.vue';
  import { sleep } from '../../../../utils';

  import minIcon from '../../assets/icons/icon_meeting_psn_0.png';
  import maxIcon from '../../assets/icons/icon_meeting_psn_1.png';

  // 设备类型图标
  import devicePcIcon from '../../assets/icons/icon_device_type_1.png';
  import devicePhoneIcon from '../../assets/icons/icon_device_type_0.png';
  import deviceGlassIcon from '../../assets/icons/icon_device_type_2.png';

  // 麦克风
  import micIcon from '../../assets/icons/icon_psn_microphone_0.png';
  import micActiveIcon from '../../assets/icons/icon_psn_microphone_1.png';

  // 摄像头
  import camIcon from '../../assets/icons/icon_psn_camera_0.png';
  import camActiveIcon from '../../assets/icons/icon_psn_camera_1.png';
  import useThMeetingStore from '../../../../store';
  import THEventBus from '../../../../services/THEventBus';

  import msg from '../../../../services/msg';

  const { t } = i18n.global;
  const ThMeetingStore = useThMeetingStore();
  const gridLectureMainRef: any = ref();
  const gridCanvasRef: any = ref();
  let handleRenderGridVideo: any;
  // 用户列表是否收起
  const unfoldStatus: any = ref(true);
  // 展开
  const handleUnfoldPsnList = async () => {
    console.log('展开人员列表业务逻辑');
    await sleep(1000 * 0.5);
    handleRenderGridVideo();
  };
  // 收起
  const handleRetractPsnList = () => {
    console.log('收起人员列表业务逻辑');
  };
  const handlePsnShowChange = () => {
    const nowStatus = !unfoldStatus.value;
    unfoldStatus.value = nowStatus;
    if (nowStatus) {
      // 打开
      handleUnfoldPsnList();
    } else {
      // 收起
      handleRetractPsnList();
    }
  };

  watchEffect(() => {
    // 进到标注页面就不能收起
    if (ThMeetingStore.lectureInfo?.activeScreenLayout) {
      unfoldStatus.value = true;
    }
  });
  // 设备类型
  const showDevicesType = (data: any) => {
    let icon: any = '';
    switch (data.client) {
      case PB.Client.PC:
        icon = devicePcIcon;
        break;

      case PB.Client.ANDROID:
        icon = devicePhoneIcon;
        break;

      case PB.Client.GLASS:
        icon = deviceGlassIcon;
        break;

      default:
        icon = '';
        break;
    }

    return icon;
  };
  const showDevicesLabel = (data: any) => {
    const label = ref('');
    switch (data.client) {
      case PB.Client.PC:
        label.value = t('mst.meeting.psn.online.type.pc');
        break;
      case PB.Client.ANDROID:
        label.value = t('mst.meeting.psn.online.type.phone');
        break;
      case PB.Client.GLASS:
        label.value = t('mst.meeting.psn.online.type.glass');
        break;
      default:
        label.value = '';
        break;
    }
    return label.value;
  };
  const showSceneLabel = () => {
    const label = ref('');
    switch (ThMeetingStore.scene) {
      case 1:
        label.value = t('mst.menu.huaBan');
        break;
      case 2:
        label.value = t('mst.menu.dongPing');
        break;
      case 3:
        label.value = t('mst.menu.shanDian');
        break;
      default:
        label.value = '';
        break;
    }
    return label;
  };

  const handleRenderRemoteStreams = async (member: any) => {
    await sleep(1000 * 0.3);
    ThMeetingStore.ThRtcClient.renderRemoteStreams(
      member.userId,
      `mst-grid-video-${member.userId}`,
      false
    );
  };

  handleRenderGridVideo = () => {
    // 提取相关的用户信息
    console.log('提取相关的用户信息');
    if (ThMeetingStore.lectureInfo && ThMeetingStore.mineInfo) {
      const { userId: lectureUserId } = ThMeetingStore.lectureInfo;
      const { userId: mineUserId } = ThMeetingStore.mineInfo;

      // 遍历成员并处理视频流
      ThMeetingStore.roomAssistMember.forEach((member: any) => {
        if (member.userId !== lectureUserId) {
          if (member.userId === mineUserId) {
            // 本地用户或讲师用户的视频处理
            if (member.hasVideo) {
              THEventBus.emit('th-psn-render-local-stream', member);
            }
          } else if (member.hasVideo) {
            // 处理远端用户的视频流
            handleRenderRemoteStreams(member);
          }
        }
      });
    }
  };
  const handleSetLectureInfo = async (data: any) => {
    if (ThMeetingStore.sceneDisabled) {
      msg.warning(t('mst.scene.opening.tip'));
      return;
    }
    if (ThMeetingStore.scene === 0 && !ThMeetingStore.isShareScreen) {
      await ThMeetingStore.updateLectureInfo(JSON.parse(JSON.stringify(data)));
      THEventBus.emit('th-psn-set-lecture-info');
    } else {
      msg.warning(t('mst.member.psn.tip'));
    }
  };
  const handleChangeOtherMkf = async (data: any) => {
    if (
      ThMeetingStore.meetingInfo.masterId !== ThMeetingStore.mineInfo.userId
    ) {
      return;
    }
    if (ThMeetingStore.scene !== 0) {
      msg.error(t('mst.message.menu.disabled.tips'));
      return;
    }
    if (data.hasAudio) {
      ThMeetingStore.ThImEvent.sendAssistAudioCloseEvent({
        meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        userId: data.userId,
      });
    } else {
      ThMeetingStore.ThImEvent.sendAssistAudioOpenEvent({
        meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        userId: data.userId,
      });
    }
  };
  const handleChangeOtherSxt = async (data: any) => {
    if (
      ThMeetingStore.meetingInfo.masterId !== ThMeetingStore.mineInfo.userId
    ) {
      return;
    }
    if (ThMeetingStore.scene !== 0) {
      msg.error(t('mst.message.menu.disabled.tips'));
      return;
    }
    if (data.hasVideo) {
      ThMeetingStore.ThImEvent.sendAssistCameraCloseEvent({
        meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        userId: data.userId,
      });
    } else {
      ThMeetingStore.ThImEvent.sendAssistCameraOpenEvent({
        meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        userId: data.userId,
      });
    }
  };
  watch(
    () => ThMeetingStore.roomAssistMember,
    (newVal: any) => {
      if (newVal) {
        handleRenderGridVideo();
      }
    },
    { deep: true, immediate: true }
  );
  defineExpose({
    gridLectureMainRef,
    gridCanvasRef,
    handleRenderGridVideo,
  });
</script>

<style lang="less" scoped>
  .list-container {
    &.activeScreenLayoutVideoNone {
      display: none;
    }
    &.activeScreenLayoutVideo {
      padding: 10px;
      .list-main {
        padding: 0 !important;
        .list-main-mi {
          margin-bottom: 0 !important;
          .tooltip-container {
            display: none;
          }
          &.activeScreenLayoutStatus {
            display: none;
          }
        }
      }
      .list-title {
        display: none;
      }
    }
    padding: 0 4px 10px;
    background: rgba(23, 32, 46, 0.85);
    border-radius: 8px;
    .list-title {
      width: 100%;
      height: 30px;
      padding: 0 3px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .list-t-l {
        font-weight: 400;
        font-size: 13px;
        color: #ffffff;
      }
      .list-t-r {
        cursor: pointer;
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
    &.max {
      width: 240px;
      .list-main {
        position: relative;
        width: 100%;
        padding: 0 3px;
        // height: calc(100vh - 200px) !important;
        max-height: 560px;
        overflow: hidden;
        overflow-y: scroll !important;

        /* 使用统一滚动条样式 */
        @extend .custom-scrollbar;
        .list-main-invite {
          width: 100%;
          .list-main-invite-i {
            width: 100%;
            height: 40px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #2c3949;
            padding: 7px;
            margin-bottom: 15px;
            .list-main-invite-i-l {
              display: flex;
              align-items: center;
              .list-main-invite-i-l-i {
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                border-radius: 4px;
                overflow: hidden;
                margin-right: 7px;
                img {
                  width: 100%;
                  height: 100%;
                }
              }
              .list-main-invite-i-l-n {
                font-weight: 400;
                font-size: 13px;
                color: #f5f5f5;
                overflow: hidden;
                white-space: nowrap;
                /*文字超出宽度则显示ellipsis省略号*/
                text-overflow: ellipsis;
              }
            }
            .list-main-invite-i-r {
              flex-shrink: 0;
              margin-left: 7px;
              span {
                font-weight: 400;
                font-size: 12px;
                color: #f5f5f5;
              }
            }
          }
        }
        .list-main-mi {
          cursor: pointer;
          width: 100%;
          height: 133px;
          border-radius: 6px;
          border: 3px solid transparent;
          overflow: hidden;
          margin-bottom: 7px;
          .list-main-mi-m {
            width: 100%;
            height: 100%;
            position: relative;
            background: #2c3949;
            overflow: hidden;
            .list-psn-video {
              width: 100%;
              height: 100%;
              video {
                width: 100%;
                height: 100%;
                object-fit: cover;
              }
            }
            .list-psn-video-canvas {
              width: 100%;
              height: 100%;
              canvas {
                width: 100%;
                height: 100%;
              }
            }
            .list-psn {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              img {
                flex-shrink: 0;
                width: 38px;
                height: 38px;
              }
            }
            .list-psn-text {
              width: 100%;
              height: 100%;
              padding: 0 38px 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              span {
                font-weight: 500;
                font-size: 16px;
                line-height: 24px;
                color: #f5f5f5;
                text-align: center;
              }
            }
            .list-psn-device {
              width: 24px;
              height: 24px;
              position: absolute;
              top: 0;
              right: 0;
              .list-psn-device-m {
                width: 24px;
                height: 24px;
                background: rgba(0, 0, 0, 0.35);
                border-radius: 0px 6px 0px 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                img {
                  flex-shrink: 0;
                  width: 16px;
                  height: 16px;
                }
              }
            }

            .list-psn-info {
              padding: 5px 7px;
              position: absolute;
              bottom: 6px;
              left: 10px;
              display: flex;
              align-items: center;
              background: #111111;
              border-radius: 4px;
              .list-psn-info-mic {
                width: 14px;
                height: 14px;
                display: flex;
                align-items: center;
                margin-right: 4px;
                img {
                  width: 100%;
                  height: 100%;
                }
              }
              .list-psn-info-cam {
                width: 14px;
                height: 14px;
                display: flex;
                align-items: center;
                margin-right: 4px;
                img {
                  width: 100%;
                  height: 100%;
                }
              }
              .list-psn-info-ide {
                flex-shrink: 0;
                padding: 1px 4px;
                background: #0267ff;
                border-radius: 3px;
                font-weight: 400;
                font-size: 12px;
                color: #ffffff;
                margin-right: 4px;
              }
              .list-psn-info-name {
                max-width: 80px;
                font-weight: 400;
                font-size: 13px;
                color: #f5f5f5;
                overflow: hidden;
                white-space: nowrap;
                /*文字超出宽度则显示ellipsis省略号*/
                text-overflow: ellipsis;
              }
              .list-psn-info-self {
                font-weight: 400;
                font-size: 13px;
                color: #f5f5f5;
              }
            }
          }
          &.active {
            border: 3px solid #0267ff;
            box-shadow: 0px 0px 5px 2px rgba(2, 103, 255, 0.19);
          }
          &:hover {
            border: 3px solid #0267ff;
            box-shadow: 0px 0px 5px 2px rgba(2, 103, 255, 0.19);
          }
        }
      }
    }
    &.min {
      width: 63px;
      .list-title {
        padding: 0 6px;
      }
      .list-main {
        width: 100%;
        padding: 0 3px;
        max-height: 560px;
        overflow: hidden;
        overflow-y: scroll !important;
        display: flex;
        flex-direction: column;
        align-items: center;

        /* 使用统一滚动条样式 */
        @extend .custom-scrollbar;
        .list-main-invite {
          width: 100%;
          .list-main-invite-i {
            width: 50px;
            height: 50px;
            margin-bottom: 5px;
            cursor: pointer;
            border-radius: 6px;
            border: 3px solid transparent;
            .list-main-invite-i-m {
              width: 100%;
              .list-main-invite-i-m-m {
                flex-shrink: 0;
                width: 44px;
                height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                img {
                  width: 100%;
                  height: 100%;
                }
                .list-main-invite-i-m-m-s {
                  position: absolute;
                  height: 12px;
                  padding: 0 3px;
                  background: #28c445;
                  border-radius: 2px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  span {
                    font-size: 8px;
                    color: #ffffff;
                  }
                }
              }
            }
          }
        }
        .list-main-mi {
          width: 50px;
          height: 50px;
          margin-bottom: 5px;
          cursor: pointer;
          border-radius: 6px;
          border: 3px solid transparent;
          .list-main-mi-m {
            width: 100%;
            .list-main-mi-m-m {
              flex-shrink: 0;
              width: 44px;
              height: 44px;
              display: flex;
              align-items: center;
              justify-content: center;
              img {
                width: 100%;
                height: 100%;
              }
            }
          }
          &.active {
            border: 3px solid #0267ff;
            box-shadow: 0px 0px 5px 2px rgba(2, 103, 255, 0.19);
          }
          &:hover {
            border: 3px solid #0267ff;
            box-shadow: 0px 0px 5px 2px rgba(2, 103, 255, 0.19);
          }
        }
      }
    }
  }
</style>
