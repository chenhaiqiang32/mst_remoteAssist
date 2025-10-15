<template>
  <div class="self-menu-container">
    <div class="self-menu-item" @click="handleChangeMkfMenu">
      <div class="self-menu-item-t">
        <img
          :src="
            !ThMeetingStore.roomMenuOptions.audio
              ? mkfMenu.icon
              : mkfMenu.activeIcon
          "
          alt=""
        />
      </div>
      <div class="self-menu-item-b"> {{ mkfMenu.label }} </div>
    </div>

    <div class="self-menu-item-row">
      <div class="self-menu-item-row-l" @click="handleChangeCameraStatus">
        <div class="self-menu-item-t">
          <img
            :src="
              ThMeetingStore.roomMenuOptions.video
                ? sxtMenu.icon
                : sxtMenu.activeIcon
            "
            alt=""
          />
        </div>
        <div class="self-menu-item-b"> {{ sxtMenu.label }} </div>
      </div>
      <MstDropdown
        ref="cameraDropdownRef"
        :offset="20"
        :disable="ThMeetingStore.scene !== 0"
        trigger="click"
      >
        <div class="self-menu-item-row-r" @click="handleGetCameras">
          <img :src="arrowTopIcon" alt="" />
        </div>
        <template #content>
          <div class="sxt-options-container">
            <div class="sxt-options-c-t">
              {{ t('mst.select.camera.title') }} ({{
                ThMeetingStore.roomMenuOptions.video
                  ? t('mst.select.camera.status.open')
                  : t('mst.select.camera.status.close')
              }})
            </div>
            <div class="sxt-options-c-m">
              <!-- 设备列表 -->
              <div
                v-for="(item, index) in cameraList"
                :key="`camera_${index}`"
                class="sxt-options-c-mi"
                @click="handleSelectCamera(index)"
              >
                <div class="sxt-options-c-mi-i">
                  <img
                    v-if="
                      ThMeetingStore?.roomMenuOptions?.video &&
                      ThMeetingStore?.deviceOptions.videoIndex === index
                    "
                    :src="optionsSelectIcon"
                    alt=""
                  />
                </div>
                <div class="sxt-options-c-mi-l">
                  <span>{{ item.name }}</span>
                </div>
              </div>
              <div class="sxt-options-c-m-line"></div>
              <div class="sxt-options-c-mi" @click="handleSelfCloseCamera">
                <div class="sxt-options-c-mi-i">
                  <img :src="cameraSelectIcon" alt="" />
                </div>
                <div class="sxt-options-c-mi-l">
                  <span>{{ t('mst.select.camera.close') }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </MstDropdown>
    </div>
    <div class="self-menu-item" @click="handleChangeYsqMenu">
      <div class="self-menu-item-t">
        <img
          :src="!ysqMenu.status ? ysqMenu.icon : ysqMenu.activeIcon"
          alt=""
        />
      </div>
      <div class="self-menu-item-b"> {{ ysqMenu.label }} </div>
    </div>
    <div
      class="self-menu-item"
      :datatype="ThMeetingStore.lectureInfo.activeScreenLayout ? 'hidden' : ''"
      @click="handleHangup"
    >
      <div class="self-menu-item-t">
        <img :src="gdMenu.icon" alt="" />
      </div>
      <div class="self-menu-item-b"> {{ gdMenu.label }} </div>
    </div>
    <MstDropdown
      ref="InviteDropdownRef"
      :offset="20"
      trigger="click"
      :datatype="ThMeetingStore.lectureInfo.activeScreenLayout ? 'hidden' : ''"
    >
      <div class="self-menu-item">
        <div class="self-menu-item-t">
          <img :src="yqMenu.icon" alt="" />
        </div>
        <div class="self-menu-item-b"> {{ yqMenu.label }} </div>
      </div>
      <template #content>
        <div class="yq-options-container">
          <div class="yq-options-c-t">
            {{ t('mst.select.qy.title') }}
          </div>
          <div class="yq-options-c-m">
            <!-- 邀请组织成员 -->
            <div class="yq-options-c-mi" @click="handleInviteMember">
              <div class="yq-options-c-mi-i">
                <img :src="selectYrIcon1" alt="" />
              </div>
              <div class="yq-options-c-mi-l">
                {{ t('mst.select.qy.yqzzcy') }}
              </div>
            </div>
            <!-- 邀请外部人员 -->
            <div class="yq-options-c-mi" @click="handleLinkShare">
              <div class="yq-options-c-mi-i">
                <img :src="selectYrIcon2" alt="" />
              </div>
              <div class="yq-options-c-mi-l">
                {{ t('mst.select.qy.yqybry') }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </MstDropdown>

    <div
      class="self-menu-item"
      :datatype="ThMeetingStore.lectureInfo.activeScreenLayout ? 'hidden' : ''"
      @click="handleChangeQyjyMenu"
    >
      <div class="self-menu-item-t">
        <img
          :src="
            !ThMeetingStore.allAudioDisable
              ? qyjyMenu.icon
              : qyjyMenu.activeIcon
          "
          alt=""
        />
      </div>
      <div class="self-menu-item-b"> {{ qyjyMenu.label }} </div>
    </div>
    <div
      class="self-menu-item"
      :datatype="ThMeetingStore.lectureInfo.activeScreenLayout ? 'hidden' : ''"
      @click="handleOpenSopDistribute"
    >
      <div class="self-menu-item-t">
        <img :src="lcxfMenu.icon" alt="" />
      </div>
      <div class="self-menu-item-b"> {{ lcxfMenu.label }} </div>
    </div>
    <div class="self-menu-item" @click="() => handleOpenMessage(true)">
      <div class="self-menu-item-t">
        <img :src="xxMenu.icon" alt="" />
      </div>
      <div class="self-menu-item-b"> {{ xxMenu.label }} </div>
    </div>
    <!--    <MstDropdown ref="MessageDropdownRef" :offset="20" trigger="click">-->
    <!--      <template #content>-->
    <!--        <MessageRoom @handle-close="handleCloseMessageDropdown"></MessageRoom>-->
    <!--      </template>-->
    <!--    </MstDropdown>-->
    <a-drawer
      style="--color-mask-bg: transparent"
      :width="328"
      :mask="true"
      :mask-closable="true"
      :visible="ThMeetingStore.meetingPersonListInfo.visible"
      :header="false"
      :footer="false"
      class="msg-drawer-wrapper"
      popup-container="#assist-container"
      unmount-on-close
      @cancel="() => handleOpenMessage(false)"
      @close="() => handleOpenMessage(false)"
    >
      <MessageRoom @handle-close="() => handleOpenMessage(false)"></MessageRoom>
    </a-drawer>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useAddressStore, useMeetingStore } from '@/store';
  import useThMeetingStore from '../../../../store';
  import THEventBus from '../../../../services/THEventBus';
  import MstDropdown from '../../../../components/dropdown/index.vue';
  import MessageRoom from './chat.vue';
  import i18n from '../../../../locale/index';
  import mkfIcon from '../../assets/icons/icon_microphone_0.png';
  import mkfActiveIcon from '../../assets/icons/icon_microphone_1.png';

  import sxtIcon from '../../assets/icons/icon_camera_0.png';
  import sxtActiveIcon from '../../assets/icons/icon_camera_1.png';
  import cameraSelectIcon from '../../assets/icons/icon_select_camera_0.png';
  import optionsSelectIcon from '../../../icons/icon_options_1.png';
  // import cameraSelectActiveIcon from '../../assets/icons/icon_select_camera_1.png';

  import ysqIcon from '../../assets/icons/icon_loudspeaker_0.png';
  import ysqActiveIcon from '../../assets/icons/icon_loudspeaker_1.png';

  import gdIcon from '../../assets/icons/icon_hangup.png';

  import yqIcon from '../../assets/icons/icon_invite.png';

  import qyjyIcon from '../../assets/icons/icon_all_silent_0.png';
  import qyjyActiveIcon from '../../assets/icons/icon_all_silent_1.png';
import xxIcon from '../../assets/icons/icon_message.png';
  import xiafaIcon from '../../assets/icons/icon_xiafa.png';
  import selectYrIcon1 from '../../assets/icons/icon_qy_yqzzcy.png';
  import selectYrIcon2 from '../../assets/icons/icon_qy_yqybry.png';
  import arrowTopIcon from '../../assets/icons/icon_arrow_top.png';
  import msg from '../../../../services/msg';

  const ThMeetingStore = useThMeetingStore();
  const cameraDropdownRef = ref();
  const InviteDropdownRef = ref();
  const MessageDropdownRef = ref();
  const { t } = i18n.global;
  const mkfMenu = ref({
    label: t('mst.menu.mkf'),
    icon: mkfIcon,
    activeIcon: mkfActiveIcon,
  });
  const handleOpenMessage = (v: boolean) => {
    if (v) {
      ThMeetingStore.meetingPersonListInfo.right = 350;
    } else {
      ThMeetingStore.meetingPersonListInfo.right = 30;
    }
    ThMeetingStore.meetingPersonListInfo.visible = v;
  };
  const handleChangeMkfMenu = () => {
    if (
      ThMeetingStore.devicesList.audioDevices &&
      ThMeetingStore.devicesList.audioDevices.length > 0
    ) {
      const status = !ThMeetingStore.roomMenuOptions.audio;
      ThMeetingStore.updateRoomMenuOptionsAudio(status);
      THEventBus.emit('th-self-menu-microphone-change', status);
    } else {
      ThMeetingStore.updateRoomMenuOptionsAudio(false);
      THEventBus.emit('th-self-menu-microphone-change', false);
      msg.error(t('mst.rtc.device.audio.error'));
    }
  };
  const sxtMenu = ref({
    label: t('mst.menu.sxt'),
    icon: sxtIcon,
    activeIcon: sxtActiveIcon,
  });
  const cameraList: any = ref([]);
  const handleGetCameras = () => {
    cameraList.value = ThMeetingStore.devicesList.videoDevices;
  };
  const handleSelfCloseCamera = () => {
    if (ThMeetingStore.isShareScreen) {
      msg.error(t('mst.menu.shareScreen.msg.error2'));
      return;
    }
    ThMeetingStore.updateRoomMenuOptionsVideo(false);
    cameraDropdownRef.value?.closeDropdown();
    THEventBus.emit('th-self-menu-camera-close');
  };
  const handleSelectCamera = (index: number) => {
    handleGetCameras();
    if (ThMeetingStore.isShareScreen) {
      msg.error(t('mst.menu.shareScreen.msg.error2'));
      return;
    }
    if (cameraList.value && cameraList.value.length > 0) {
      ThMeetingStore.updateRoomMenuOptionsVideo(true);
      ThMeetingStore.updateDeviceOptionsVideoIndex(index);
      cameraDropdownRef.value?.closeDropdown();
      THEventBus.emit('th-self-menu-set-camera');
    } else {
      msg.error(t('mst.rtc.device.video.error'));
    }
  };
  const handleChangeCameraStatus = () => {
    if (ThMeetingStore.scene !== 0) {
      msg.error(t('mst.message.menu.disabled.tips'));
      return;
    }
    if (ThMeetingStore.roomMenuOptions.video) {
      handleSelfCloseCamera();
    } else {
      handleSelectCamera(ThMeetingStore.deviceOptions.videoIndex);
    }
  };
  const ysqMenu = ref({
    label: t('mst.menu.ysq'),
    icon: ysqIcon,
    activeIcon: ysqActiveIcon,
    status: ThMeetingStore.roomMenuOptions.loudspeaker,
  });
  const handleChangeYsqMenu = () => {
    ysqMenu.value.status = !ysqMenu.value.status;
    ThMeetingStore.updateRoomMenuOptionsLoudspeaker(ysqMenu.value.status);
    THEventBus.emit('th-self-menu-loudspeaker-change', ysqMenu.value.status);
  };
  const gdMenu = ref({
    label: t('mst.menu.gd'),
    icon: gdIcon,
    activeIcon: gdIcon,
    status: 0,
  });
  const handleHangup = () => {
    console.log('handleHangup----');
    THEventBus.emit('th-self-hangup-meeting');
  };
  const yqMenu = ref({
    label: t('mst.menu.yq'),
    icon: yqIcon,
    activeIcon: yqIcon,
    status: false,
  });
  const qyjyMenu = ref({
    label: t('mst.menu.qyjy'),
    icon: qyjyIcon,
    activeIcon: qyjyActiveIcon,
    status: ThMeetingStore.allAudioDisable,
  });
  const lcxfMenu = ref({
    label: '流程下发',
    icon: xiafaIcon,
    activeIcon: xiafaIcon,
    status: 0,
  });
  const handleChangeQyjyMenu = () => {
    if (
      ThMeetingStore.meetingInfo.masterId !== ThMeetingStore.mineInfo.userId
    ) {
      msg.warning(t('mst.menu.mkf.error.power.msg3'));
      return;
    }

    const status = !ThMeetingStore.allAudioDisable;
    ThMeetingStore.updateAllAudioDisable(status);
    THEventBus.emit('th-self-menu-all-audio-disable', status);
  };
  const addressStore = useAddressStore();
  const meetingStore = useMeetingStore();
  const handleInviteMember = async () => {
    const res: any = await addressStore.getContactsData();
    if (res.code !== 200 && res.code !== 401) {
      return;
    }
    await addressStore.updateMemberList(res.data);
    await meetingStore.ThImEvent.setRoomOnlineListPsn(addressStore.memberList);
    ThMeetingStore.updateInviteMemberList(
      ThMeetingStore.ThImEvent.roomOnlineListPsn
    );

    InviteDropdownRef.value?.closeDropdown();
    THEventBus.emit('th-self-invite-member');
  };
  const handleLinkShare = () => {
    InviteDropdownRef.value?.closeDropdown();
    THEventBus.emit('th-self-link-share');
  };
  const xxMenu = ref({
    label: t('mst.menu.message'),
    icon: xxIcon,
    activeIcon: xxIcon,
    status: 0,
  });
  const handleCloseMessageDropdown = () => {
    MessageDropdownRef.value?.closeDropdown();
  };
  const handleOpenSopDistribute = () => {
    THEventBus.emit('th-self-open-sop-distribute');
  };
  defineExpose({
    handleSelfCloseCamera,
  });
</script>

<style lang="less" scoped>
  .self-menu-container {
    width: fit-content;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .self-menu-item {
      width: 66px;
      height: 66px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin: 0 3px;
      .self-menu-item-t {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        img {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
        }
      }
      .self-menu-item-b {
        width: 100%;
        text-align: center;
        margin-top: 2px;
        font-weight: 400;
        font-size: 12px;
        color: #ffffff;
        overflow: hidden;
      }
    }
    .self-menu-item-row {
      width: 66px;
      height: 66px;
      display: flex;
      justify-content: center;
      cursor: pointer;
      margin: 0 3px;
      .self-menu-item-row-l {
        width: 66px;
        height: 66px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        .self-menu-item-t {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          img {
            flex-shrink: 0;
            width: 24px;
            height: 24px;
          }
        }
        .self-menu-item-b {
          width: 100%;
          text-align: center;
          margin-top: 2px;
          font-weight: 400;
          font-size: 12px;
          color: #ffffff;
          overflow: hidden;
        }
      }
      .self-menu-item-row-r {
        width: 14px;
        height: 14px;
        display: flex;
        align-items: center;
        justify-self: center;
        margin-top: 22px;
        img {
          flex-shrink: 0;
          width: 14px;
          height: 14px;
        }
      }
    }
    .sxt-options-container {
      min-width: 200px;
      overflow: hidden;
      background: #17202e;
      border-radius: 8px 8px 8px 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      .sxt-options-c-t {
        height: 32px;
        padding: 0 15px;
        font-weight: 400;
        font-size: 12px;
        color: #9ca3af;
        text-wrap: nowrap;
        background: rgba(31, 41, 55, 0.5);
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
      .sxt-options-c-m {
        background: #17202e;
        padding: 10px 6px 5px 9px;
        .sxt-options-c-mi {
          padding: 0 9px;
          min-height: 26px;
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          .sxt-options-c-mi-i {
            width: 12px;
            height: 12px;
            margin-right: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .sxt-options-c-mi-l {
            font-weight: 400;
            font-size: 12px;
            color: #ffffff;
          }
          &:hover {
            background: #192b42;
            border-radius: 4px;
          }
        }
        .sxt-options-c-m-line {
          margin: 10px 0 13px;
          width: 100%;
          height: 1px;
          background-color: #293649;
        }
      }
    }
    .yq-options-container {
      min-width: 200px;
      overflow: hidden;
      background: #17202e;
      border-radius: 8px 8px 8px 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      .yq-options-c-t {
        height: 32px;
        padding: 0 15px;
        font-weight: 400;
        font-size: 12px;
        color: #9ca3af;
        text-wrap: nowrap;
        background: rgba(31, 41, 55, 0.5);
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
      .yq-options-c-m {
        background: #17202e;
        padding: 10px 6px 5px 9px;
        .yq-options-c-mi {
          padding: 0 9px;
          height: 26px;
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          .yq-options-c-mi-i {
            width: 12px;
            height: 12px;
            margin-right: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .yq-options-c-mi-l {
            font-weight: 400;
            font-size: 12px;
            color: #ffffff;
          }
          &:hover {
            background: #192b42;
            border-radius: 4px;
          }
        }
      }
    }
  }
</style>
