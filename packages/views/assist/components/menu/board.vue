<template>
  <div class="board-menu-container">
    <!-- 关闭 -->
    <MstTooltip
      :content="closeMenu.label"
      class="board-menu-item"
      :offset="25"
      :position="`right`"
    >
      <div class="board-menu-item-m" @click="handleCloseScene">
        <img :src="closeMenu.icon" alt="" />
      </div>
    </MstTooltip>
    <div class="board-menu-line"></div>
    <!-- 画笔 -->
    <MstDropdown
      ref="drawDropdownRef"
      :position="`right`"
      :offset="20"
      trigger="click"
    >
      <MstTooltip
        :content="hbMenu.label"
        class="board-menu-item"
        :offset="25"
        :position="`right`"
      >
        <div class="board-menu-item-m">
          <img :src="hbMenu.icon" alt="" />
        </div>
      </MstTooltip>
      <template #content>
        <div class="hb-options-container">
          <div class="hb-options-c-t">
            {{ t('mst.message.board.menu.dropdown.title') }}
          </div>
          <div class="hb-options-c-m">
            <!-- 类型 -->
            <div class="hb-options-c-m-t">
              <span>{{ t('mst.message.board.menu.dropdown.type') }}</span>
            </div>
            <div v-if="ThMeetingStore.scene !== 3" class="hb-options-c-m-m">
              <template
                v-for="(item, index) in hbTypeList"
                :key="`draw_type_${index}`"
              >
                <div
                  :class="
                    ThMeetingStore.drawStyle.type == item.type ? 'active' : ''
                  "
                  class="hb-options-c-m-mi"
                  @click="handleSelectDrawType(item)"
                >
                  <img :src="item.icon" alt="" />
                </div>
                <div
                  v-if="index < hbTypeList.length - 1"
                  :class="{
                    hide:
                      ThMeetingStore.drawStyle.type - 1 == index ||
                      ThMeetingStore.drawStyle.type == index,
                  }"
                  class="hb-options-c-m-mi-line"
                ></div>
              </template>
            </div>
            <div v-else class="hb-options-c-m-m start">
              <template
                v-for="(item, index) in flashHbTypeList"
                :key="`draw_type_${index}`"
              >
                <div
                  :class="
                    ThMeetingStore.drawStyle.type == item.type ? 'active' : ''
                  "
                  class="hb-options-c-m-mi"
                  @click="handleSelectDrawType(item)"
                >
                  <img :src="item.icon" alt="" />
                </div>
                <div
                  v-if="index < flashHbTypeList.length - 1"
                  :class="{
                    hide:
                      ThMeetingStore.drawStyle.type - 1 == index ||
                      ThMeetingStore.drawStyle.type == index,
                  }"
                  class="hb-options-c-m-mi-line"
                ></div>
              </template>
            </div>
            <!-- 粗细 -->
            <div class="hb-options-c-m-t">
              <span>{{ t('mst.message.board.menu.dropdown.weight') }}</span>
            </div>
            <div class="hb-options-c-m-m">
              <template
                v-for="(item, index) in hbWeightList"
                :key="`draw_type_${index}`"
              >
                <div
                  :class="
                    ThMeetingStore.drawStyle.weight == item.type ? 'active' : ''
                  "
                  class="hb-options-c-m-mi"
                  @click="handleSelectDrawWeight(item)"
                >
                  <img :src="item.icon" alt="" />
                </div>
                <div
                  v-if="index < hbWeightList.length - 1"
                  :class="{
                    hide:
                      ThMeetingStore.drawStyle.weight - 2 == index ||
                      ThMeetingStore.drawStyle.weight - 1 == index,
                  }"
                  class="hb-options-c-m-mi-line"
                ></div>
              </template>
            </div>
            <div class="hb-options-c-m-t">
              <span>{{ t('mst.message.board.menu.dropdown.color') }}</span>
            </div>
            <div class="hb-options-c-m-mc">
              <div
                v-for="(item, index) in hbColorList"
                :key="`draw_color_${index}`"
                :class="index !== 3 && index !== 7 ? 'marginR' : ''"
                class="hb-options-c-m-mci"
                :style="{
                  borderColor:
                    ThMeetingStore.drawStyle.color == item.type
                      ? item.color
                      : 'transparent',
                }"
                @click="handleSelectDrawColor(item)"
              >
                <div
                  class="hb-options-c-m-mci-m"
                  :style="{ background: item.color }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </MstDropdown>

    <!-- 撤销 -->
    <template v-if="ThMeetingStore.scene !== 3">
      <MstTooltip
        :content="cxMenu.label"
        class="board-menu-item"
        :offset="25"
        :position="`right`"
      >
        <div class="board-menu-item-m" @click="handleRevocationBoard">
          <img :src="cxMenu.icon" alt="" />
        </div>
      </MstTooltip>
    </template>

    <!-- 清空 -->
    <template v-if="ThMeetingStore.scene !== 3">
      <MstTooltip
        :content="qkMenu.label"
        class="board-menu-item"
        :offset="25"
        :position="`right`"
      >
        <div class="board-menu-item-m" @click="handleClearBoard">
          <img :src="qkMenu.icon" alt="" />
        </div>
      </MstTooltip>
      <div class="board-menu-line"></div>
    </template>

    <!-- 上传底图 -->
    <template v-if="ThMeetingStore.scene === 1">
      <MstTooltip
        :content="!scdtMenu.status ? scdtMenu.label : scdtMenu.activeLabel"
        class="board-menu-item"
        :offset="25"
        :position="`right`"
      >
        <div class="board-menu-item-m" @click="handleUploadFile">
          <img
            :src="!scdtMenu.status ? scdtMenu.icon : scdtMenu.activeIcon"
            alt=""
          />
        </div>
      </MstTooltip>
      <div class="board-menu-line"></div>
    </template>

    <!-- 录制 -->
    <MstTooltip
      :content="!lpMenu.status ? lpMenu.label : lpMenu.activeLabel"
      class="board-menu-item"
      :offset="25"
      :position="`right`"
    >
      <div class="board-menu-item-m" @click="handleChangeRecord">
        <img :src="!lpMenu.status ? lpMenu.icon : lpMenu.activeIcon" alt="" />
      </div>
    </MstTooltip>
    <!-- 抓屏 -->
    <MstTooltip
      :content="zpMenu.label"
      class="board-menu-item"
      :offset="25"
      :position="`right`"
    >
      <div class="board-menu-item-m" @click="handleBoardCaptureScreen">
        <img :src="zpMenu.icon" alt="" />
      </div>
    </MstTooltip>
    <div class="board-menu-line"></div>
    <!-- 告警 -->
    <MstTooltip
      :content="gjMenu.label"
      class="board-menu-item"
      :offset="25"
      :position="`right`"
    >
      <div class="board-menu-item-m" @click="handleWarning">
        <img :src="gjMenu.icon" alt="" />
      </div>
    </MstTooltip>
    <!-- 隐藏的文件输入元素 -->
    <input
      ref="fileInput"
      style="display: none"
      type="file"
      accept=".png,.jpeg,.jpg"
      @change="handleFileChange"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import * as PB from '../../../../proto/protocol';
  import msg from '../../../../services/msg';
  import { useCos } from '../../../../utils/useCos';
  import useThMeetingStore from '../../../../store';
  import THEventBus from '../../../../services/THEventBus';
  import i18n from '../../../../locale/index';
  import MstTooltip from '../../../../components/tooltip/index.vue';
  import MstDropdown from '../../../../components/dropdown/index.vue';
  import closeMenuClose from '../../assets/board/icon_close.png';
  import closeMenuLeave from '../../assets/board/icon_leave.png';

  import cxIcon from '../../assets/board/icon_cx_0.png';
  import qkIcon from '../../assets/board/icon_qk_0.png';
  import scdtIcon from '../../assets/board/icon_scdt_0.png';
  import qkdtIcon from '../../assets/board/icon_qkdt_0.png';
  import lzIcon from '../../assets/board/icon_lz_0.png';
  import lzCloseIcon from '../../assets/board/icon_lz_1.png';

  import zpIcon from '../../assets/board/icon_zp_0.png';
  import gjIcon from '../../assets/board/icon_gj_0.png';

  import dropTypeIcon1 from '../../assets/board/icon_drop_line.png';
  import dropTypeIcon2 from '../../assets/board/icon_drop_rect.png';
  import dropTypeIcon3 from '../../assets/board/icon_drop_circle.png';
  import dropTypeIcon4 from '../../assets/board/icon_drop_arrows.png';
  import dropTypeIcon5 from '../../assets/board/icon_drop_point.png';

  import dropWeightIcon1 from '../../assets/board/icon_drop_weight_0.png';
  import dropWeightIcon2 from '../../assets/board/icon_drop_weight_1.png';
  import dropWeightIcon3 from '../../assets/board/icon_drop_weight_2.png';
  import dropWeightIcon4 from '../../assets/board/icon_drop_weight_3.png';

  import drawLine1 from '../../assets/board/line/icon_line_1.png';
  import drawLine2 from '../../assets/board/line/icon_line_2.png';
  import drawLine3 from '../../assets/board/line/icon_line_3.png';
  import drawLine4 from '../../assets/board/line/icon_line_4.png';
  import drawLine5 from '../../assets/board/line/icon_line_5.png';
  import drawLine6 from '../../assets/board/line/icon_line_6.png';
  import drawLine7 from '../../assets/board/line/icon_line_7.png';
  import drawLine8 from '../../assets/board/line/icon_line_8.png';

  import drawRect1 from '../../assets/board/rect/icon_rect_1.png';
  import drawRect2 from '../../assets/board/rect/icon_rect_2.png';
  import drawRect3 from '../../assets/board/rect/icon_rect_3.png';
  import drawRect4 from '../../assets/board/rect/icon_rect_4.png';
  import drawRect5 from '../../assets/board/rect/icon_rect_5.png';
  import drawRect6 from '../../assets/board/rect/icon_rect_6.png';
  import drawRect7 from '../../assets/board/rect/icon_rect_7.png';
  import drawRect8 from '../../assets/board/rect/icon_rect_8.png';

  import drawCircle1 from '../../assets/board/circle/icon_circle_1.png';
  import drawCircle2 from '../../assets/board/circle/icon_circle_2.png';
  import drawCircle3 from '../../assets/board/circle/icon_circle_3.png';
  import drawCircle4 from '../../assets/board/circle/icon_circle_4.png';
  import drawCircle5 from '../../assets/board/circle/icon_circle_5.png';
  import drawCircle6 from '../../assets/board/circle/icon_circle_6.png';
  import drawCircle7 from '../../assets/board/circle/icon_circle_7.png';
  import drawCircle8 from '../../assets/board/circle/icon_circle_8.png';

  import drawArrows1 from '../../assets/board/arrows/icon_arrows_1.png';
  import drawArrows2 from '../../assets/board/arrows/icon_arrows_2.png';
  import drawArrows3 from '../../assets/board/arrows/icon_arrows_3.png';
  import drawArrows4 from '../../assets/board/arrows/icon_arrows_4.png';
  import drawArrows5 from '../../assets/board/arrows/icon_arrows_5.png';
  import drawArrows6 from '../../assets/board/arrows/icon_arrows_6.png';
  import drawArrows7 from '../../assets/board/arrows/icon_arrows_7.png';
  import drawArrows8 from '../../assets/board/arrows/icon_arrows_8.png';

  import drawPoint1 from '../../assets/board/point/icon_point_1.png';
  import drawPoint2 from '../../assets/board/point/icon_point_2.png';
  import drawPoint3 from '../../assets/board/point/icon_point_3.png';
  import drawPoint4 from '../../assets/board/point/icon_point_4.png';
  import drawPoint5 from '../../assets/board/point/icon_point_5.png';
  import drawPoint6 from '../../assets/board/point/icon_point_6.png';
  import drawPoint7 from '../../assets/board/point/icon_point_7.png';
  import drawPoint8 from '../../assets/board/point/icon_point_8.png';

  const DrawIcons: any = {
    drawLine1,
    drawLine2,
    drawLine3,
    drawLine4,
    drawLine5,
    drawLine6,
    drawLine7,
    drawLine8,
    drawRect1,
    drawRect2,
    drawRect3,
    drawRect4,
    drawRect5,
    drawRect6,
    drawRect7,
    drawRect8,
    drawCircle1,
    drawCircle2,
    drawCircle3,
    drawCircle4,
    drawCircle5,
    drawCircle6,
    drawCircle7,
    drawCircle8,
    drawArrows1,
    drawArrows2,
    drawArrows3,
    drawArrows4,
    drawArrows5,
    drawArrows6,
    drawArrows7,
    drawArrows8,
    drawPoint1,
    drawPoint2,
    drawPoint3,
    drawPoint4,
    drawPoint5,
    drawPoint6,
    drawPoint7,
    drawPoint8,
  };

  const { t } = i18n.global;
  const ThMeetingStore = useThMeetingStore();
  const fileInput = ref<HTMLInputElement | null>(null);

  const closeMenu = computed(() => {
    return {
      label: t('mst.menu.board.close'),
      icon: ThMeetingStore.lectureInfo?.activeScreenLayout
        ? closeMenuLeave
        : closeMenuClose,
    };
  });
  const handleCloseScene = () => {
    THEventBus.emit('th-board-close');
  };
  // 画笔
  const hbMenu: any = ref({
    label: t('mst.message.board.menu.hb'),
    icon: ThMeetingStore.scene !== 3 ? drawLine1 : drawPoint1,
    activeIcon: null,
    status: false,
  });
  const handleChangeDrawStyle = () => {
    const drawStyleUrl = ref();
    const type = ref('');
    if (ThMeetingStore.scene !== 3) {
      switch (ThMeetingStore.drawStyle.type) {
        case PB.DrawingType.LINE:
          type.value = 'Line';
          break;
        case PB.DrawingType.RECTANGLE:
          type.value = 'Rect';
          break;
        case PB.DrawingType.CIRCLE:
          type.value = 'Circle';
          break;
        case PB.DrawingType.ARROWS:
          type.value = 'Arrows';
          break;

        default:
          type.value = '';
          break;
      }
      drawStyleUrl.value = `draw${type.value}${ThMeetingStore.drawStyle.color}`;
      hbMenu.value.icon = DrawIcons[drawStyleUrl.value];
    } else if (ThMeetingStore.drawStyle.type === PB.DrawingType.LINE) {
      drawStyleUrl.value = `drawLine${ThMeetingStore.drawStyle.color}`;
      hbMenu.value.icon = DrawIcons[drawStyleUrl.value];
    } else if (ThMeetingStore.drawStyle.type === 4) {
      drawStyleUrl.value = `drawPoint${ThMeetingStore.drawStyle.color}`;
      hbMenu.value.icon = DrawIcons[drawStyleUrl.value];
    }
  };
  const hbTypeList = ref([
    {
      label: t('mst.message.board.menu.dropdown.type.line'),
      icon: dropTypeIcon1,
      type: PB.DrawingType.LINE,
    },
    {
      label: t('mst.message.board.menu.dropdown.type.rect'),
      icon: dropTypeIcon2,
      type: PB.DrawingType.RECTANGLE,
    },
    {
      label: t('mst.message.board.menu.dropdown.type.circle'),
      icon: dropTypeIcon3,
      type: PB.DrawingType.CIRCLE,
    },
    {
      label: t('mst.message.board.menu.dropdown.type.arrows'),
      icon: dropTypeIcon4,
      type: PB.DrawingType.ARROWS,
    },
  ]);
  const flashHbTypeList = ref([
    {
      label: t('mst.message.board.menu.dropdown.type.line'),
      icon: dropTypeIcon1,
      type: PB.DrawingType.LINE,
    },
    {
      label: t('mst.message.board.menu.dropdown.type.point'),
      icon: dropTypeIcon5,
      type: 4,
    },
  ]);
  const handleSelectDrawType = (data: any) => {
    console.log('handleSelectDrawType', data);
    ThMeetingStore.updateDrawStyleType(data.type);
    handleChangeDrawStyle();
  };
  const hbWeightList = ref([
    {
      icon: dropWeightIcon1,
      type: '1',
      size: 4,
    },
    {
      icon: dropWeightIcon2,
      type: '2',
      size: 6,
    },
    {
      icon: dropWeightIcon3,
      type: '3',
      size: 8,
    },
    {
      icon: dropWeightIcon4,
      type: '4',
      size: 10,
    },
  ]);
  const handleSelectDrawWeight = (data: any) => {
    ThMeetingStore.updateDrawStyleWeight(data.type);
  };
  const hbColorList = ref([
    {
      color: '#FF4E4E',
      type: '1',
    },
    {
      color: '#FFB84E',
      type: '2',
    },
    {
      color: '#46DC00',
      type: '3',
    },
    {
      color: '#FF6715',
      type: '4',
    },
    {
      color: '#15FFF1',
      type: '5',
    },
    {
      color: '#0000FF',
      type: '6',
    },
    {
      color: '#4415FF',
      type: '7',
    },
    {
      color: '#DE15FF',
      type: '8',
    },
  ]);
  const handleSelectDrawColor = (data: any) => {
    ThMeetingStore.updateDrawStyleColor(data.type);
    handleChangeDrawStyle();
  };

  // 撤销
  const cxMenu = ref({
    label: t('mst.message.board.menu.cx'),
    icon: cxIcon,
    activeIcon: '',
    status: false,
  });
  const handleRevocationBoard = () => {
    THEventBus.emit('th-board-undo');
  };
  // 清空
  const qkMenu = ref({
    label: t('mst.message.board.menu.qk'),
    icon: qkIcon,
    activeIcon: '',
    status: false,
  });
  const handleClearBoard = () => {
    THEventBus.emit('th-board-clear');
  };
  // 上传底图
  const scdtMenu = ref({
    label: t('mst.message.board.menu.scdt'),
    activeLabel: t('mst.message.board.menu.qkdt'),
    icon: scdtIcon,
    activeIcon: qkdtIcon,
    status: false,
  });
  const handleClearBaseImg = () => {
    scdtMenu.value.status = false;
    THEventBus.emit('th-board-upload-map-clear');
  };
  const handleUpload = async (file: File) => {
    try {
      ThMeetingStore.updateUploadFileStatus(true);
      if (file.type === 'image/png' || file.type === 'image/jpeg') {
        const { uploadFile } = useCos();
        // 生成文件名：文件名_时间戳
        const fileName = `${file.name.split('.')[0]}_${Date.now()}.${file.name.split('.').pop()}`;
        
        // 使用新的上传逻辑
        const uploadRes = await uploadFile(file, fileName);
        if (uploadRes.statusCode !== 200) {
          msg.error(t('mst.message.board.menu.scdt.msg2'));
          return;
        }
        
        // 使用objectKey作为资源路径，previewUrl作为预览地址
        const uploadResult = {
          objectKey: uploadRes.objectKey,
          previewUrl: uploadRes.previewUrl,
          statusCode: uploadRes.statusCode,
          Location: uploadRes.previewUrl, // 保持兼容性
        };
        
        // 在这里处理文件上传，例如上传到服务器
        scdtMenu.value.status = true;
        msg.success(t('mst.message.board.menu.scdt.msg3'));
        THEventBus.emit('th-board-upload-map', uploadResult);
      } else {
        msg.error(t('mst.message.board.menu.scdt.msg2'));
      }
    } catch (error) {
      console.log(error);
      msg.error(t('mst.message.board.menu.scdt.msg1'));
    } finally {
      ThMeetingStore.updateUploadFileStatus(false);
    }
  };
  const handleFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      await handleUpload(file);
    }
    input.value = '';
  };
  const handleUploadFile = () => {
    if (!scdtMenu.value.status) {
      if (fileInput.value) {
        fileInput.value.click();
      }
    } else {
      // 清除底图
      handleClearBaseImg();
    }
  };
  const handleChangeScdtMenuStatus = (type: boolean) => {
    scdtMenu.value.status = type;
  };
  // 录制
  const lpMenu = ref({
    label: t('mst.message.board.menu.lp'),
    activeLabel: t('mst.message.board.menu.lp.close'),
    icon: lzIcon,
    activeIcon: lzCloseIcon,
    status: false,
  });
  const handleStartRecording = () => {
    if (!ThMeetingStore.lectureInfo.hasVideo) {
      msg.warning(t('mst.message.board.lp.error1'));
      return;
    }
    lpMenu.value.status = true;
    THEventBus.emit('th-board-screen-record-open');
  };
  const handleStopRecording = () => {
    lpMenu.value.status = false;
    THEventBus.emit('th-board-screen-record-close');
  };
  const handleChangeRecord = () => {
    if (!lpMenu.value.status) {
      handleStartRecording();
    } else {
      handleStopRecording();
    }
  };
  // 抓屏
  const zpMenu = ref({
    label: t('mst.message.board.menu.zp'),
    icon: zpIcon,
    activeIcon: '',
    status: false,
  });
  const handleBoardCaptureScreen = () => {
    if (ThMeetingStore.scene !== 3) {
      THEventBus.emit('th-board-capture-screen');
    } else {
      THEventBus.emit('th-scene-capture-lecture-video');
    }
  };
  // 告警
  const gjMenu = ref({
    label: t('mst.message.board.menu.gj'),
    icon: gjIcon,
    activeIcon: '',
    status: false,
  });
  const handleTimeoutClearWarning = () => {
    setTimeout(() => {
      if (ThMeetingStore.boardStatus.isWarning) {
        ThMeetingStore.updateBoardStatusIsWarning(false);
      }
    }, 1000 * 3);
  };
  const handleWarning = () => {
    ThMeetingStore.ThImEvent.sendWarningFlicker();
    ThMeetingStore.updateBoardStatusIsWarning(true);
    handleTimeoutClearWarning();
  };
  defineExpose({
    hbWeightList,
    hbColorList,
    handleChangeScdtMenuStatus,
  });
</script>

<style lang="less" scoped>
  .board-menu-container {
    width: 50px;
    height: fit-content;
    padding: 14px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .board-menu-item {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin: 10px 0;
      img {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
      }
    }
    .board-menu-line {
      flex-shrink: 0;
      width: 24px;
      height: 1px;
      background-color: #2b3a53;
    }
    .hb-options-container {
      width: 178px;
      overflow: hidden;
      background: #17202e;
      border-radius: 8px 8px 8px 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      .hb-options-c-t {
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
      .hb-options-c-m {
        background: #17202e;
        padding: 10px 14px 7px;
        .hb-options-c-m-t {
          min-height: 18px;
          display: flex;
          align-items: center;
          margin-bottom: 6px;
          span {
            font-weight: 400;
            font-size: 12px;
            color: #ffffff;
          }
        }
        .hb-options-c-m-m {
          height: 32px;
          background: #273449;
          border-radius: 2px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          .hb-options-c-m-mi {
            flex-shrink: 0;
            width: 36px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            img {
              flex-shrink: 0;
              width: 20px;
              height: 20px;
            }
            &.active {
              background: #0267ff;
              border-radius: 2px;
            }
          }
          &.start {
            justify-content: flex-start;
            .hb-options-c-m-mi {
              width: 50%;
            }
          }
          .hb-options-c-m-mi-line {
            flex-shrink: 0;
            width: 1px;
            height: 13px;
            background-color: rgba(255, 255, 255, 0.17);
            &.hide {
              background-color: transparent;
            }
          }
        }
        .hb-options-c-m-mc {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          .hb-options-c-m-mci {
            flex-shrink: 0;
            width: 22px;
            height: 22px;
            border-radius: 100%;
            border-width: 1px;
            border-style: solid;
            background: rgba(0, 0, 0, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-top: 9px;
            margin-bottom: 9px;
            .hb-options-c-m-mci-m {
              flex-shrink: 0;
              width: 12px;
              height: 12px;
              border-radius: 50%;
            }
            &.marginR {
              margin-right: 18px;
            }
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
      .fps-options-c-m {
        background: #17202e;
        padding: 10px 6px 5px 9px;
        .fps-options-c-mi {
          padding: 0 9px;
          min-height: 26px;
          display: flex;
          align-items: center;
          margin-bottom: 5px;
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
            background: #192b42;
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
</style>
