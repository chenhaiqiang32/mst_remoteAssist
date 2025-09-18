<template>
  <div class="scene-menu-container">
    <MstTooltip
      :content="dongPingMenu.label"
      :position="`right`"
      :offset="25"
      class="scene-menu-item"
    >
      <div class="scene-menu-item-m" @click="handleOpenScreenBoard">
        <img :src="dongPingMenu.icon" alt="" />
      </div>
    </MstTooltip>
    <MstTooltip
      :content="shanDianMenu.label"
      :position="`right`"
      :offset="25"
      class="scene-menu-item"
    >
      <div class="scene-menu-item-m" @click="handleSceneOpenFlashBoard">
        <img :src="shanDianMenu.icon" alt="" />
      </div>
    </MstTooltip>
    <MstTooltip
      :content="huaBanMenu.label"
      class="scene-menu-item"
      :offset="25"
      :position="`right`"
    >
      <div class="scene-menu-item-m" @click="handleOpenDrawBoard">
        <img :src="huaBanMenu.icon" alt="" />
      </div>
    </MstTooltip>
    <MstTooltip
      :content="zuaPingMenu.label"
      :position="`right`"
      :offset="25"
      class="scene-menu-item"
    >
      <div class="scene-menu-item-m" @click="handleShotScreen">
        <img :src="zuaPingMenu.icon" alt="" />
      </div>
    </MstTooltip>
    <MstTooltip
      :content="
        !shareScreenMenu.status
          ? shareScreenMenu.label
          : shareScreenMenu.activeLabel
      "
      :position="`right`"
      :offset="25"
      class="scene-menu-item"
    >
      <div class="scene-menu-item-m" @click="handleShareScreen">
        <img
          :src="
            !shareScreenMenu.status
              ? shareScreenMenu.icon
              : shareScreenMenu.activeIcon
          "
          alt=""
        />
      </div>
    </MstTooltip>
    <MstDropdown
      ref="FileDropdownRef"
      :position="`right`"
      :offset="20"
      trigger="click"
    >
      <MstTooltip
        :content="fileManageMenu.label"
        :position="`right`"
        :offset="25"
        class="scene-menu-item"
      >
        <div class="scene-menu-item-m">
          <img :src="fileManageMenu.icon" alt="" />
          <div
            v-if="ThMeetingStore.uploadFileNews"
            class="scene-menu-item-m-fixed"
          ></div>
        </div>
      </MstTooltip>
      <template #content>
        <div class="dd-options-container">
          <div class="dd-options-c-t">
            {{ t('mst.menu.scene.file.title') }}
          </div>
          <div class="dd-options-c-m">
            <!-- 下载文件 -->
            <div class="dd-options-c-mi" @click="handleDownload">
              <div class="dd-options-c-mi-i">
                <img :src="fileDownloadIcon" alt="" />
              </div>
              <div class="dd-options-c-mi-l">
                {{ t('mst.menu.scene.file.download') }}
              </div>
            </div>
            <!-- 上传文件 -->
            <div class="dd-options-c-mi" @click="handleUploadFile">
              <div class="dd-options-c-mi-i">
                <img :src="fileUploadIcon" alt="" />
              </div>
              <div class="dd-options-c-mi-l">
                {{ t('mst.menu.scene.file.upload') }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </MstDropdown>
    <MstDropdown
      ref="FpsDropdownRef"
      :position="`right`"
      :offset="20"
      trigger="click"
    >
      <MstTooltip
        :content="fpsMenu.label"
        :position="`right`"
        :offset="25"
        class="scene-menu-item"
      >
        <div class="scene-menu-item-m">
          <img :src="fpsMenu.icon" alt="" />
        </div>
      </MstTooltip>
      <template #content>
        <div class="fps-options-container">
          <div class="fps-options-c-t">
            {{ t('mst.menu.scene.fps.title') }}
          </div>
          <div class="fps-hd-content">
            <div class="fps-title">FPS</div>
            <div class="fps-options-c-m">
              <!-- FPS列表 -->
              <div
                :class="{
                  cp: true,
                  active:
                    PB.StrategyType.FLUENCY_FIRST ===
                    ThMeetingStore.lectureInfo.optimizationMode,
                }"
              >
                <div
                  :class="{
                    'fps-options-c-mi': true,
                  }"
                  @click="handleSelectFps(PB.StrategyType.FLUENCY_FIRST)"
                >
                  <div class="fps-options-c-mi-i">
                    <img
                      v-if="
                        PB.StrategyType.FLUENCY_FIRST ===
                        ThMeetingStore.lectureInfo.optimizationMode
                      "
                      :src="optionsSelectIcon"
                      alt=""
                    />
                  </div>
                  <div class="fps-options-c-mi-l">
                    <span>{{ t('mst.menu.scene.fps.liuchang') }}</span>
                  </div>
                </div>
              </div>
              <div
                :class="{
                  cp: true,
                  active:
                    PB.StrategyType.QUALITY_FIRST ===
                    ThMeetingStore.lectureInfo.optimizationMode,
                }"
              >
                <div
                  :class="{
                    'fps-options-c-mi': true,
                    'active':
                      PB.StrategyType.QUALITY_FIRST ===
                      ThMeetingStore.lectureInfo.optimizationMode,
                  }"
                  @click="handleSelectFps(PB.StrategyType.QUALITY_FIRST)"
                >
                  <div class="fps-options-c-mi-i">
                    <img
                      v-if="
                        PB.StrategyType.QUALITY_FIRST ===
                        ThMeetingStore.lectureInfo.optimizationMode
                      "
                      :src="optionsSelectIcon"
                      alt=""
                    />
                  </div>
                  <div class="fps-options-c-mi-l">
                    <span>{{ t('mst.menu.scene.fps.huazi') }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="hd-title" >{{ t('mst.menu.scene.fps') }}</div>
            <div :class="{
              'fps-options-c-hdr': true,
              'disabled': !isCanModifyHd,
            }">
              <div
                :class="{
                  'disabled-click':!isCanModifyHd,
                  'hd-options-c-mi': true,
                  'active': PB.VideoResolution.VIDEO_RESOLUTION_360P ===
                    ThMeetingStore.lectureInfo.optimizationHd
                }"
                @click="
                  handleSelectHd(PB.VideoResolution.VIDEO_RESOLUTION_360P)
                "
              >
                <img
                  v-if="
                    PB.VideoResolution.VIDEO_RESOLUTION_360P ===
                    ThMeetingStore.lectureInfo.optimizationHd
                  "
                  :src="optionsSelectIcon"
                  alt=""
                />
                <span>360p</span>
              </div>
              <div
                :class="{
                  'disabled-click':!isCanModifyHd,
                  'hd-options-c-mi': true,
                  'active': PB.VideoResolution.VIDEO_RESOLUTION_720P ===
                    ThMeetingStore.lectureInfo.optimizationHd
                }"
                @click="
                  handleSelectHd(PB.VideoResolution.VIDEO_RESOLUTION_720P)
                "
              >
                <img
                  v-if="
                    PB.VideoResolution.VIDEO_RESOLUTION_720P ===
                    ThMeetingStore.lectureInfo.optimizationHd
                  "
                  :src="optionsSelectIcon"
                  alt=""
                />
                <span>720p</span>
              </div>
              <div
                :class="{
                  'disabled-click':!isCanModifyHd,
                  'hd-options-c-mi': true,
                  'active': PB.VideoResolution.VIDEO_RESOLUTION_1080P ===
                    ThMeetingStore.lectureInfo.optimizationHd
                }"
                @click="
                  handleSelectHd(PB.VideoResolution.VIDEO_RESOLUTION_1080P)
                "
              >
                <img
                  v-if="
                    PB.VideoResolution.VIDEO_RESOLUTION_1080P ===
                    ThMeetingStore.lectureInfo.optimizationHd
                  "
                  :src="optionsSelectIcon"
                  alt=""
                />
                <span>1080p</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </MstDropdown>
    <!-- 切换眼镜端 -->
    <MstTooltip
      :content="changeClientMenu.label"
      :position="`right`"
      :offset="25"
      class="scene-menu-item"
    >
      <div class="scene-menu-item-m" @click="handleChangeClient">
        <img :src="changeClientMenu.icon" alt="" />
      </div>
    </MstTooltip>
    <!-- 隐藏的文件输入元素 -->
    <input
      ref="fileInput"
      style="display: none"
      type="file"
      @change="handleFileChange"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue';
  import { useCos } from '../../../../utils/useCos';
  import useThMeetingStore from '../../../../store';
  import THEventBus from '../../../../services/THEventBus';
  import * as PB from '../../../../proto/protocol';
  import i18n from '../../../../locale/index';
  import MstTooltip from '../../../../components/tooltip/index.vue';
  import MstDropdown from '../../../../components/dropdown/index.vue';
  import huaBanIcon from '../../assets/icons/icon_label_h_0.png';
  import huaBanActiveIcon from '../../assets/icons/icon_label_h_1.png';
  import dongPingIcon from '../../assets/icons/icon_label_d_0.png';
  import dongPingActiveIcon from '../../assets/icons/icon_label_d_1.png';
  import shanDianIcon from '../../assets/icons/icon_flash_mark_0.png';
  import shanDianActiveIcon from '../../assets/icons/icon_flash_mark_1.png';
  import zuaPingIcon from '../../assets/icons/icon_label_z_0.png';
  import zuaPingActiveIcon from '../../assets/icons/icon_label_z_1.png';
  import shareScreenIcon from '../../assets/icons/icon_screen_share_0.png';
  import shareScreenActiveIcon from '../../assets/icons/icon_screen_share_1.png';
  import fileManageIcon from '../../assets/icons/icon_file_0.png';
  import fpsIcon from '../../assets/icons/icon_hd_x1.png';
  import glassIcon from '../../assets/icons/icon_label_yj_0.png';
  import fileDownloadIcon from '../../assets/icons/icon_download.png';
  import fileUploadIcon from '../../assets/icons/icon_upload.png';
  import optionsSelectIcon from '../../../icons/icon_options_1.png';

  import msg from '../../../../services/msg';


  const { t } = i18n.global;
  const ThMeetingStore = useThMeetingStore();
  const FileDropdownRef = ref();
  const FpsDropdownRef = ref();
  const fileInput = ref<HTMLInputElement | null>(null);
  const huaBanMenu = ref({
    label: t('mst.menu.huaBan'),
    icon: huaBanIcon,
    activeIcon: huaBanActiveIcon,
    status: 0,
  });
  //
  const isCanModifyHd = computed(() => {
    // 是主持人 都可以修改
    if (ThMeetingStore.meetingInfo.masterId === ThMeetingStore.mineInfo.userId) {
      return true
    }
    // 不是主持人 只能修改当前自己
    if (ThMeetingStore.meetingInfo.masterId !== ThMeetingStore.mineInfo.userId) {
      return ThMeetingStore.mineInfo.userId === ThMeetingStore.lectureInfo.userId;
    }
  })
  // 画板标注
  const handleOpenDrawBoard = () => {
    // msg.success(t('mst.message.board.open.draw'));
    THEventBus.emit('th-scene-open-draw-board');
    ThMeetingStore.resetMeetingPersonListInfo();
  };
  const dongPingMenu = ref({
    label: t('mst.menu.dongPing'),
    icon: dongPingIcon,
    activeIcon: dongPingActiveIcon,
    status: 0,
  });
  // 冻屏标注
  const handleOpenScreenBoard = () => {
    THEventBus.emit('th-scene-open-screen-board');
    ThMeetingStore.resetMeetingPersonListInfo();
  };
  const shanDianMenu = ref({
    label: t('mst.menu.shanDian'),
    icon: shanDianIcon,
    activeIcon: shanDianActiveIcon,
    status: 0,
  });
  // 闪点标记
  const handleSceneOpenFlashBoard = () => {
    // msg.success(t('mst.message.board.open.flash'));
    THEventBus.emit('th-scene-open-flash-board');
    ThMeetingStore.resetMeetingPersonListInfo();
  };
  const zuaPingMenu = ref({
    label: t('mst.menu.zuaPing'),
    icon: zuaPingIcon,
    activeIcon: zuaPingActiveIcon,
    status: 0,
  });
  const handleShotScreen = async () => {
    THEventBus.emit('th-scene-capture-lecture-video');
  };
  const shareScreenMenu = ref({
    label: t('mst.menu.shareScreen'),
    activeLabel: t('mst.menu.shareScreen.close'),
    icon: shareScreenIcon,
    activeIcon: shareScreenActiveIcon,
    status:
      ThMeetingStore.lectureInfo.userId === ThMeetingStore.mineInfo.userId &&
      ThMeetingStore.isShareScreen,
  });
  const handleShareScreen = async () => {
    if (shareScreenMenu.value.status) {
      THEventBus.emit('th-scene-close-share-screen');
    } else {
      if (ThMeetingStore.isShareScreen) {
        msg.error(t('mst.menu.shareScreen.msg.error1'));
        return;
      }
      THEventBus.emit('th-scene-open-share-screen');
    }
  };
  const fileManageMenu = ref({
    label: t('mst.menu.fileManage'),
    icon: fileManageIcon,
    activeIcon: fileManageIcon,
    status: 0,
  });
  const fpsMenu = ref({
    label: t('mst.menu.fps'),
    icon: fpsIcon,
    activeIcon: fpsIcon,
    status: 0,
  });
  const handleSelectHd = (hdType: number) => {
    FpsDropdownRef.value?.closeDropdown();
    if (
      ThMeetingStore.lectureInfo.userId === ThMeetingStore.mineInfo.userId ||
      ThMeetingStore.meetingInfo.masterId === ThMeetingStore.mineInfo.userId
    ) {
      THEventBus.emit('th-scene-set-optimization-hd', {
        type: hdType,
      });
    } else {
      msg.warning(t('mst.message.change.fps.msg2'));
    }
  };
  const handleSelectFps = (type: number) => {
    FpsDropdownRef.value?.closeDropdown();
    if (
      ThMeetingStore.lectureInfo.userId === ThMeetingStore.mineInfo.userId ||
      ThMeetingStore.meetingInfo.masterId === ThMeetingStore.mineInfo.userId
    ) {
      THEventBus.emit('th-scene-set-optimization-mode', {
        type,
      });
    } else {
      msg.warning(t('mst.message.change.fps.msg1'));
    }
  };
  const handleUpload = async (file: File) => {
    try {
      ThMeetingStore.updateUploadFileStatus(true);
      const fileType = ref(-1); // 默认其他文件类型
      // 根据 MIME 类型区分文件类型 0: 图片、1:视频、2:PDF、3:Excel、4:Word、5:Txt、6:压缩包、7:PPT、-1:其他文件
      if (file.type.startsWith('image/')) {
        fileType.value = 0; // 图片
      } else if (file.type.startsWith('video/')) {
        fileType.value = 1; // 视频
      } else if (file.type === 'application/pdf') {
        fileType.value = 2; // PDF
      } else if (
        file.type === 'application/vnd.ms-excel' ||
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        fileType.value = 3; // Excel
      } else if (
        file.type === 'application/msword' ||
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        fileType.value = 4; // Word
      } else if (file.type === 'text/plain') {
        fileType.value = 5; // TXT
      } else if (
        file.type === 'application/zip' ||
        file.type === 'application/x-zip-compressed' ||
        file.type === 'application/x-rar-compressed' ||
        file.type === 'application/x-7z-compressed' ||
        file.type === 'application/x-tar'
      ) {
        fileType.value = 6; // ZIP
      } else if (
        file.type === 'application/vnd.ms-powerpoint' ||
        file.type ===
          'application/vnd.openxmlformats-officedocument.presentational.presentation'
      ) {
        fileType.value = 7; // PPT
      } else {
        fileType.value = -1; // 其他文件类型
      }

      const cosConfigRes = await ThMeetingStore.ThImEvent.uploadCosConfig();
      if (cosConfigRes.code !== 200) {
        msg.error(t('mst.message.board.menu.scdt.msg1'));
        return;
      }

      const { uploadFile } = useCos({
        ...cosConfigRes.data,
        basicPath: `${cosConfigRes.data.basicPath}meeting/${ThMeetingStore.meetingInfo.meetingNo}/FileUpload/`,
      });

      // 自定义文件上传逻辑
      const uploadRes = await uploadFile(file, `${Date.now()}_${file.name}`);
      if (uploadRes.statusCode !== 200) {
        msg.error(t('mst.message.board.menu.scdt.msg2'));
        return;
      }

      const res: any = await ThMeetingStore.ThImEvent.uploadMeetingFile({
        meetingId: ThMeetingStore.meetingInfo.meetingId,
        attachmentType: fileType.value,
        attachmentUrl: uploadRes.Location,
        attachmentName: `${Date.now()}_${file.name}`,
      });
      if (res.code !== 200 && res.code !== 401) {
        msg.error(res.msg);
        return;
      }
      msg.success(t('mst.message.board.menu.scdt.msg3'));
      THEventBus.emit('th-scene-upload-file');
    } catch (error: any) {
      if (error.message === 'upload-timeout') {
        msg.error(t('mst.message.board.menu.scdt.msg1'));
      }
    } finally {
      ThMeetingStore.updateUploadFileStatus(false);
    }
  };

  const handleFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      handleUpload(file);
    }
    input.value = '';
  };
  const handleUploadFile = () => {
    FileDropdownRef.value?.closeDropdown();
    if (fileInput.value) {
      fileInput.value.click();
    }
  };
  const handleDownload = () => {
    FileDropdownRef.value?.closeDropdown();
    THEventBus.emit('th-scene-download-file');
  };
  const changeClientMenu = ref({
    label: t('mst.menu.client'),
    icon: glassIcon,
    activeIcon: glassIcon,
    status: 0,
  });
  const handleChangeClient = () => {
    if (!ThMeetingStore.mineInfo.glassOnline) {
      THEventBus.emit('th-scene-glass-login');
    } else {
      THEventBus.emit('th-scene-change-client');
    }
  };
  defineExpose({
    shareScreenMenu,
  });
</script>

<style lang="less" scoped>
  .scene-menu-container {
    width: 50px;
    height: 380px;
    padding: 14px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .scene-menu-item {
      width: 30px;
      height: 30px;
      flex-shrink: 0;
      display: flex;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin: 10px 0;
      position: relative;
      .scene-menu-item-m-fixed {
        position: absolute;
        top: 0;
        right: 0;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #f65160;
      }
      img {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
      }
    }
    .dd-options-container {
      min-width: 200px;
      overflow: hidden;
      background: #17202e;
      border-radius: 8px 8px 8px 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      .dd-options-c-t {
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
      .dd-options-c-m {
        background: #17202e;
        padding: 10px 6px 5px 9px;
        .dd-options-c-mi {
          padding: 0 9px;
          height: 26px;
          display: flex;
          align-items: center;
          margin-bottom: 5px;
          .dd-options-c-mi-i {
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
          .dd-options-c-mi-l {
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
    .fps-options-container {
      min-width: 200px;
      overflow: hidden;
      background: #17202e;
      border-radius: 8px 8px 8px 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      .fps-options-c-t {
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
      .fps-hd-content {
        width: 250px;
        padding: 0 15px;
        padding-bottom: 15px;
        .hd-title {
          padding-top: 5px;
          padding-bottom: 4px;
          font-weight: 400;
          font-size: 12px;
          color: #9ca3af;
        }
        .fps-options-c-hdr {
          &.disabled {
            cursor: not-allowed;
          }
          padding: 4px 0 0 0;
          display: flex;
          gap: 8px;
          .hd-options-c-mi {
            &.disabled-click {
              pointer-events: none;
            }
            flex: 1;
            background: #192b42;
            border-radius: 4px 4px 4px 4px;
            height: 26px;
            display: flex;
            justify-content: center;
            font-weight: 400;
            font-size: 12px;
            color: #ffffff;
            align-items: center;
            &.active {
              background-color: rgba(2, 103, 255, 1);
              border-radius: 4px;
            }
          }
        }
        .fps-title {
          padding-top: 9px;
          padding-bottom: 4px;
          font-weight: 400;
          font-size: 12px;
          color: #9ca3af;
        }
        .fps-options-c-m {
          background: #17202e;
          padding: 4px 0;
          display: flex;
          gap: 8px;
          .cp {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            &.active {
              background-color: rgba(2, 103, 255, 1);
              border-radius: 4px;
            }
          }

          .fps-options-c-mi {
            min-height: 26px;
            display: flex;
            align-items: center;
            .fps-options-c-mi-i {
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
            .fps-options-c-mi-l {
              font-weight: 400;
              font-size: 12px;
              color: #ffffff;
            }
            &:hover {
              //background: #192b42;
              border-radius: 4px;
            }
          }
          .fps-options-c-m-line {
            margin: 10px 0 13px;
            width: 100%;
            height: 1px;
            background-color: #293649;
          }
        }
      }
    }
  }
</style>
