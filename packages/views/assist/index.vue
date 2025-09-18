<template>
  <div ref="assistContainerRef" class="th-ma-container">
    <!-- 存在视频流主播画面 -->
    <div
      v-if="ThMeetingStore.lectureInfo && ThMeetingStore.lectureInfo.hasVideo"
      :id="`mst-assist-lecture-video-${ThMeetingStore.lectureInfo.userId}`"
      ref="lectureVideoRef"
      class="th-ma-lecture-main"
      :class="
        ThMeetingStore.lectureInfo.direction === PB.ScreenDirection.VERTICAL
          ? 'portrait-screen'
          : ''
      "
      :style="lectureVideoStyle"
    >
    </div>
    <!-- 不存在视频流主播画面 -->
    <div v-else ref="lectureVideoRef" class="th-ma-lecture-main no-video">
      <div class="th-ma-lecture-main-body">
        <img :src="ThMeetingStore.lectureInfo?.avatarUrl" alt="" />
        <div class="th-ma-lecture-main-body-name">
          <span>{{ ThMeetingStore.lectureInfo?.name }}</span>
        </div>
      </div>
    </div>
    <!-- 会议主题+会议时长 -->
    <div class="th-ma-title">
      <div class="th-ma-t-main">
        <div class="th-ma-t-l">
          <div
            class="th-ma-t-l-status"
            :class="ThMeetingStore.assistNetworkStatus ? 'online' : 'outline'"
          ></div>
          <span
            v-if="!ThMeetingStore.assistNetworkStatus"
            class="th-ma-t-l-status-label"
            >{{ t('mst.meeting.status.outline') }}</span
          >
          {{ ThMeetingStore.meetingInfo.subject }}
        </div>
        <div class="th-ma-t-m"></div>
        <div class="th-ma-t-r"
          ><span>{{ currentTimestamp }}</span></div
        >
        <!-- 文件上传状态显示 -->
        <div
          v-if="ThMeetingStore.uploadFileStatus"
          class="th-ma-file-upload-status"
        >
          <div class="th-ma-file-upload-status-i">
            <IconUpload></IconUpload>
          </div>
          <div class="th-ma-file-upload-status-l">
            {{ t('mst.scene.upload.tip') }}
          </div>
        </div>
      </div>
    </div>
    <!-- 录制屏幕计时 -->
    <div v-if="ThMeetingStore.isRecord" class="th-ma-record-time">
      <div class="th-ma-record-t-l">
        <div class="th-ma-record-t-lm"></div>
      </div>
      <div class="th-ma-record-t-r">
        <span> {{ recordTimestamp }}</span>
      </div>
    </div>
    <!-- 左侧主播场景功能按钮 -->
    <div v-if="ThMeetingStore.scene === 0" class="th-ma-menu-scene">
      <sceneMenu ref="sceneMenuRef"></sceneMenu>
    </div>
    <!-- 左侧标注场景功能按钮 -->
    <div
      v-else
      :class="{
        'th-ma-menu-board': true,
        'th-ma-menu-board-marking-layout-operate':
          !!ThMeetingStore.lectureInfo?.activeScreenLayout,
      }"
    >
      <boardMenu ref="boardMenuRef"></boardMenu>
    </div>
    <!-- 标注，放大、缩小、拖动 -->
    <div class="th-ma-board-menu th-ma-board-menu-operate"
         :class="{
      // todo这个class是链接眼镜或者安卓端 下方 摄像头缩放 被重合
      'th-ma-board-menu_camara_layout': ThMeetingStore.scene === 0 &&
        (ThMeetingStore.lectureInfo?.client === PB.Client.ANDROID ||
          ThMeetingStore.lectureInfo?.client === PB.Client.GLASS)
    }">
      <div
        v-if="ThMeetingStore.scene === 1 || ThMeetingStore.scene === 2"
        class="th-ma-board-menu-option"
      >
        <div class="th-ma-board-m-i" @click="handleChangeDrag">
          <img
            v-if="!ThMeetingStore.boardStatus.isDrag"
            :src="dragIcon"
            alt=""
          />
          <img v-else :src="dragIngIcon" alt="" />
        </div>
        <div class="th-ma-board-m-i" @click="handleBoardCanvasZoom(true)">
          <img :src="zoomAddIcon" alt="" />
        </div>
        <div class="th-ma-board-m-i" @click="handleBoardCanvasZoom(false)">
          <img :src="zoomSubtractIcon" alt="" />
        </div>
      </div>
      <div
        v-if="ThMeetingStore.scene === 1 || ThMeetingStore.scene === 2"
        class="th-ma-board-menu-option"
      >
        <MstTooltip
          :content="t('mst.scene.split.view')"
          :position="`bottom`"
          :offset="25"
          class=""
        >
          <div class="th-ma-board-m-i" @click="handleCanvasLayout(1)">
            <img
              v-if="ThMeetingStore.lectureInfo?.activeScreenLayout === 1"
              :src="fffRT"
              alt=""
            />
            <img v-else :src="grayRT" alt="" />
          </div>
        </MstTooltip>
        <MstTooltip
          :content="t('mst.scene.window.view')"
          :position="`bottom`"
          :offset="25"
          class=""
        >
          <div class="th-ma-board-m-i" @click="handleCanvasLayout(2)">
            <img
              v-if="ThMeetingStore.lectureInfo?.activeScreenLayout !== 1"
              :src="fffMiddle"
              alt=""
            />
            <img v-else :src="grayMiddle" alt="" />
          </div>
        </MstTooltip>
      </div>
      <div
        :datatype="ThMeetingStore.roomTranslateInfo?.enableTranslation"
        v-show="!!ThMeetingStore.roomTranslateInfo?.enableTranslation"
        :class="{
          'th-ma-board-menu-option': true,
          'th-ma-board-menu-option-translate': ThMeetingStore.roomTranslateInfo?.enableTranslation
        }"
      >
        <div style="display:flex;align-items: center;gap: 8px">
          <MstTooltip
            :content="t('mst.scene.trans')"
            :position="`bottom`"
            :offset="25"
            class=""
          >
            <div
              @click="toogleTransState"
              :class="{
                'th-ma-board-m-i': true,
                // 'th-ma-board-m-i_selected': !!ThMeetingStore.lectureInfo?.transState?.transModalVisible
                'th-ma-board-m-i_selected': !!ThMeetingStore?.roomTranslateInfo?.open,
              }"
            >
              <img :src="transIcon" />
            </div>
          </MstTooltip>
          <div @click="handleTransLate" style="display:flex;align-items: center;gap: 6px;cursor: pointer">
            <span style="color: #fff">{{mapperLanguage || ''}}</span>
            <img :src="xiaIcon" style="width: 10px" />
          </div>
        </div>
      </div>
    </div>
    <!-- 摄像头缩放 -->
    <div
      v-if="
        ThMeetingStore.scene === 0 &&
        (ThMeetingStore.lectureInfo?.client === PB.Client.ANDROID ||
          ThMeetingStore.lectureInfo?.client === PB.Client.GLASS)
      "
      class="th-ma-board-menu"
    >
      <div class="th-ma-board-m-i" @click="handleLectureCanvasZoom(true)">
        <img :src="zoomAddIcon" alt="" />
      </div>
      <div class="th-ma-board-m-i" @click="handleLectureCanvasZoom(false)">
        <img :src="zoomSubtractIcon" alt="" />
      </div>
    </div>
    <!-- 新增消息气泡-->
    <div
      :class="{
        'th-ma-message-bubble': true,
        'th-ma-message-bubble-operate':
          !!ThMeetingStore.lectureInfo?.activeScreenLayout,
      }"
      :style="`--bubble-content-height: ${
        bubbleMsgRef?.allMessagesList?.length ? '100%' : 'auto'
      }`"
    >
      <MessageBubble ref="bubbleMsgRef" />
    </div>
    <!-- 底部 设备音视频、挂断、全员静音等功能按钮 -->
    <div
      class="th-ma-menu-self"
      :class="{
        'marking-layout-operate':
          !!ThMeetingStore.lectureInfo?.activeScreenLayout,
      }"
    >
      <selfMenu ref="selfMenuRef"></selfMenu>
    </div>
    <!-- 右侧 人员列表 -->
    <div
      class="th-ma-psn-list"
      :style="`--meeting-right-person-list: ${ThMeetingStore.meetingPersonListInfo.right}px;`"
    >
      <meetingPsnList ref="gridContainerRef"></meetingPsnList>
    </div>

    <!-- 标注场景 Canvas -->
    <div
      v-if="ThMeetingStore.scene !== 0"
      ref="boardMainContainerRef"
      class="th-ma-board-canvas"
      :class="{
        'bg': ThMeetingStore.scene !== 3,
        'col-2-flex': ThMeetingStore.lectureInfo?.activeScreenLayout === 2,
      }"
    >
      <!-- 实时画面-->
      <div
        v-if="ThMeetingStore.lectureInfo?.activeScreenLayout === 2"
        class="col-2-video"
        :style="`color: #fff;--video-realtime-footage: ${boardCanvasMainStyle.height};`"
      >
        <!-- 存在视频流主播画面 -->
        <div
          v-show="ThMeetingStore.lectureInfo?.activeScreenLayout == 2"
          class="view-tips-name"
        >
          {{ t('mst.scene.footage.view') }}
        </div>
        <div
          :id="`mst-assist-lecture-video-marking-${ThMeetingStore.lectureInfo.userId}`"
          style="width: 100%; height: 100%"
        >
        </div>
      </div>
      <div class="boardCanvas-content">
        <div
          v-show="ThMeetingStore.lectureInfo?.activeScreenLayout == 2"
          class="view-tips-name"
          style="color: #fff; text-align: center; padding-bottom: 8px"
          >{{
            t(
              ThMeetingStore.scene === 1
                ? 'mst.scene.annotate.view'
                : 'mst.scene.frozen.view'
            )
          }}</div
        >
        <div
          ref="boardCanvasMainRef"
          class="th-ma-board-canvas-main"
          :class="{
            'flex-1-canvas':
              ThMeetingStore.lectureInfo?.activeScreenLayout === 2,
          }"
          :style="boardCanvasMainStyle"
        >
          <canvas
            ref="boardCanvasRef"
            :style="{
              ...boardCanvasStyle,
              cursor: ThMeetingStore.boardStatus.cursor,
            }"
            @mousedown="boardCanvasMouseDownAction"
            @mousemove="boardCanvasMouseMoveAction"
            @mouseup="boardCanvasMouseUpAction"
            @click="boardCanvasClickAction"
          ></canvas>
          <!-- 画线时显示对方名称 -->
          <template
            v-for="(user, index) in drawingUser"
            :key="`drawing_user_${index}`"
          >
            <div
              v-if="
                (ThMeetingStore.scene === 1 ||
                  ThMeetingStore.scene === 2 ||
                  ThMeetingStore.scene === 3) &&
                isExist(user.userId)
              "
              class="drawing-user"
              :class="`drawing-user-${index}`"
              :style="{
                top: user.top + 'px',
                left: user.left + 'px',
              }"
            >
              <div class="drawing-user-icon">
                <img :src="requireDrawingUserCursorUrl(index)" alt="" />
              </div>
              <div class="drawing-user-name">{{ user.name }}</div>
            </div></template
          >
        </div>
      </div>
    </div>

    <!-- 退出modal -->
    <HangupModal
      v-if="hangupModalVisible"
      :modal-visible="hangupModalVisible"
      @handle-close="handleHangupModalClose"
    >
    </HangupModal>
    <!-- 邀请内部人员 -->
    <InviteMemberModal
      v-if="inviteMemberVisible"
      @handle-invite="handleAgainInvite"
      @handle-close="handleInviteMemberModalClose"
    ></InviteMemberModal>
    <!-- 链接分享 -->
    <LinkShareModal
      v-if="linkShareVisible"
      @handle-close="handleLinkShareModalClose"
    ></LinkShareModal>
    <!-- 下载文件 -->
    <DownloadFileModal
      v-if="downloadFileVisible"
      @handle-close="handleDownloadFileModalClose"
    ></DownloadFileModal>
    <!-- 画板标注进入弹窗 -->
    <BoardDrawingModal
      v-if="boardDrawingVisible"
      @handle-close="handleBoardDrawingModalClose"
      @handle-sure="handleBoardDrawingModalSure"
    ></BoardDrawingModal>
    <BoardFlashModal
      v-if="boardFlashVisible"
      @handle-close="handleBoardFlashModalClose"
      @handle-sure="handleBoardFlashModalSure"
    ></BoardFlashModal>
    <BoardScreenModal
      v-if="boardScreenVisible"
      @handle-close="handleBoardScreenModalClose"
      @handle-sure="handleBoardScreenModalSure"
    ></BoardScreenModal>
    <BoardClearModal
      v-if="boardClearVisible"
      @handle-close="handleBoardClearModalClose"
      @handle-sure="handleBoardClearModalSure"
    ></BoardClearModal>
    <BoardCloseModal
      v-if="boardCloseVisible"
      @handle-close="handleBoardCloseModalClose"
      @handle-sure="handleBoardCloseModalSure"
    >
    </BoardCloseModal>
    <!-- 其他客户端入会 -->
    <OtherJoinModal
      v-if="otherJoinVisible"
      @handle-sure="handleOtherJoinModalSure"
    >
    </OtherJoinModal>
    <!-- 眼镜端加入确定弹窗 -->
    <GlassJoinModal
      v-if="glassJoinVisible"
      @handle-close="handleGlassJoinModalClose"
      @handle-sure="handleGlassJoinModalSure"
    ></GlassJoinModal>
    <!-- 眼镜端登录二维弹窗-->
    <GlassQrCode
      v-if="glassQrCodeVisible"
      @handle-close="handleGlassCodeModalClose"
    ></GlassQrCode>

    <!--    设置语言弹窗-->
    <SetLanguageModal v-if="!!ThMeetingStore.lectureInfo?.transState?.transModalVisible"/>
    <canvas ref="canvasElement" style="display: none"></canvas>
    <!-- 告警页面 -->
    <div
      v-if="ThMeetingStore.boardStatus.isWarning"
      class="th-warning-container"
      :style="{ backgroundImage: `url(${publicPath}${warningContainer})` }"
      @click="handleCloseWarning"
    >
      <div class="th-warning-main">
        <img :src="warningMainBg" alt="" />
        <div class="th-warning-m-m">
          <div class="th-warning-main-t">
            <span>{{ t('mst.message.waring.title') }}</span>
          </div>
          <div class="th-warning-main-m">
            <span>{{ t('mst.message.waring.content') }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 翻译 -->
    <div
      v-if="transWssInfo.url && transLanguages.length > 0 && ThMeetingStore?.roomTranslateInfo?.open"
      class="trans-language-txt"
    >
      <div
        v-for="(item, index) in transLanguages"
        :key="index"
        class="trans-language-txt-i"
      >
        <span class="orange">{{ item.name }}</span
        >: <span>{{ item.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    ref,
    onBeforeUnmount,
    onMounted,
    watch,
    watchEffect,
    nextTick,
    computed,
  } from 'vue';
  import { v4 as uuidv4 } from 'uuid';
  import Long from 'long';
  import { useWujieTools } from '@/utils/wujie/hooks';
  import * as PB from '../../proto/protocol';
  import ThRTC from '../../utils/sdk/rtc';
  import IndexDBService from '../../utils/db';

  import i18n from '../../locale';
  import {
    calculateElapsedTime,
    toNumber,
    objToArrForKey,
    sleep,
    dataURItoBlob,
    getMillisecond,
    to16kHz,
    to16BitPCM,
    removeFirstSpecialChar,
  } from '../../utils';
  import { useCos } from '../../utils/useCos';
  import MstTooltip from '../../components/tooltip/index.vue';
  import useThMeetingStore from '../../store';
  import THEventBus from '../../services/THEventBus';
  import MessageBubble from './components/menu/message-bubble.vue';
  import SceneMenu from './components/menu/scene.vue';
  import BoardMenu from './components/menu/board.vue';
  import SelfMenu from './components/menu/self.vue';
  import meetingPsnList from './components/psn/index.vue';
  import HangupModal from './components/modal/hangup.vue';
  import InviteMemberModal from './components/modal/invite.vue';
  import LinkShareModal from './components/modal/linkShare.vue';
  import DownloadFileModal from './components/modal/download.vue';
  import BoardDrawingModal from './components/modal/board_drawing.vue';
  import BoardFlashModal from './components/modal/board_flash.vue';
  import BoardScreenModal from './components/modal/board_screen.vue';
  import BoardClearModal from './components/modal/board_clear.vue';
  import BoardCloseModal from './components/modal/board_close.vue';
  import OtherJoinModal from './components/modal/other_join.vue';
  import GlassJoinModal from './components/modal/glass_join.vue';
  import GlassQrCode from './components/modal/glass_qr_code.vue';
  import SetLanguageModal from './components/modal/set_language.vue';

  import dragIcon from './assets/board/icon_drag.png';
  import dragIngIcon from './assets/board/icon_drag_1.png';
  import zoomAddIcon from './assets/icons/icon_zoom_add.png';
  import zoomSubtractIcon from './assets/icons/icon_zoom_subtract.png';
  import warningMainBg from './assets/icons/icon_warning.png';
  import warningContainer from './assets/icons/icon_warning_bg.png';

  import IconUpload from '../icons/svg/icon_uploading.svg';

  import iconCursor0 from './assets/cursor/icon_cursor_0.png';
  import iconCursor1 from './assets/cursor/icon_cursor_1.png';
  import iconCursor2 from './assets/cursor/icon_cursor_2.png';
  import iconCursor3 from './assets/cursor/icon_cursor_3.png';
  import iconCursor4 from './assets/cursor/icon_cursor_4.png';
  import iconCursor5 from './assets/cursor/icon_cursor_5.png';
  import iconCursor6 from './assets/cursor/icon_cursor_6.png';
  import iconCursor7 from './assets/cursor/icon_cursor_7.png';
  import iconCursor8 from './assets/cursor/icon_cursor_8.png';
  import iconCursor9 from './assets/cursor/icon_cursor_9.png';
  import iconCursor10 from './assets/cursor/icon_cursor_10.png';
  import iconCursor11 from './assets/cursor/icon_cursor_11.png';
  import iconCursor12 from './assets/cursor/icon_cursor_12.png';
  import iconCursor13 from './assets/cursor/icon_cursor_13.png';
  import iconCursor14 from './assets/cursor/icon_cursor_14.png';
  import iconCursor15 from './assets/cursor/icon_cursor_15.png';
  import iconCursor16 from './assets/cursor/icon_cursor_16.png';
  import grayRT from './assets/icons/icon_000_tr.png';
  import grayMiddle from './assets/icons/icon_000_middle.png';
  import fffMiddle from './assets/icons/icon_fff_middle.png';
  import fffRT from './assets/icons/icon_fff_rt.png';
  import transIcon from '@/assets/options/icon_translate.png';
  import xiaIcon from '@/assets/options/icon_xiajiantou.png';
  import msg from '../../services/msg';
  import { AssistCanvasDrawingSet, DrawingData } from '../../utils/crdt/index';
  import { VideoResolution } from '../../proto/protocol';
  import { useMeetingStore } from '@/store';

  const { publicPath } = useWujieTools();
  const bubbleMsgRef = ref(null);
  // const activeScreenLayout = ref(1); // 1: 右上角小屏幕， 2：中间平均分

  const transWss: any = ref(null);
  const transWssInfo = ref<{
    url: string;
    translateVendor: 'xunfei' | 'aliyun' | string; // 供应商 xunfei, aliyun
  }>({
    url: '',
    translateVendor: '',
  });
  const transWssInterval: any = ref(null);
  const audioDataArray: any = ref([]);
  const transLanguages: any = ref([]);
  const isTransWssOpen: any = ref(false);

  const sceneMenuRef: any = ref();
  const selfMenuRef: any = ref();
  const gridContainerRef: any = ref();
  const assistContainerRef: any = ref();
  const lectureVideoRef: any = ref();
  const curLectureInfo: any = ref();

  const ThMeetingStore = useThMeetingStore();
  const meetingStore = useMeetingStore();
  const messageDB = new IndexDBService();
  const cursorIconList = ref([
    iconCursor0,
    iconCursor1,
    iconCursor2,
    iconCursor3,
    iconCursor4,
    iconCursor5,
    iconCursor6,
    iconCursor7,
    iconCursor8,
    iconCursor9,
    iconCursor10,
    iconCursor11,
    iconCursor12,
    iconCursor13,
    iconCursor14,
    iconCursor15,
    iconCursor16,
  ]);
  let AssistCanvasSet: any;
  // 标注业务中 正在标的人员
  const drawingUser = ref<any>([]);

  // 标注画线
  const boardMenuRef: any = ref();
  const boardMainContainerRef: any = ref();
  const boardCanvasMainRef: any = ref();
  const boardCanvasRef: any = ref();
  const boardCanvasImages: any = ref([]);
  let boardCtx: any;
  const boardCanvasStyle: any = ref({
    position: 'absolute',
    left: '0px',
    top: '0px',
  });
  // let handleInitCanvas: any;
  // let handleRenderBoardBgImgCanvas: any;
  // 标注相关申明
  const boardDrawingVisible = ref(false);
  const boardScreenVisible = ref(false);
  const boardFlashVisible = ref(false);
  const boardClearVisible = ref(false);
  const boardCloseVisible = ref(false);

  const flashPoints = ref<any>([]);
  let flashAnimationFrame: any;
  let updateFlashPoints: any;
  let handleFlashSceneClose: any;
  // 屏幕分享
  let handleSceneCloseShareScreen: any;

  const mapperLanguage = computed(() => {
    const result = meetingStore.languageList.reduce((acc, item) => {
      acc[item.label] = item.local || item.value;
      return acc;
    }, {});
    const languageType = ThMeetingStore.roomTranslateInfo?.languageType;
    return result[languageType || ''];
  })
  const props = defineProps<{
    sdkEvent: any;
  }>();

  let ThImEvent: any = props.sdkEvent;
  // 将业务系统层sdkEvent，赋值到sdk中
  ThMeetingStore.updateThImEvent(ThImEvent);
  // 存储会议房间信息
  ThMeetingStore.updateMeetingInfo({
    ...ThMeetingStore.ThImEvent.meetingInfo,
    selfUserId: ThMeetingStore.ThImEvent.userId,
  });
  // 变更当前房间菜单状态
  ThMeetingStore.updateRoomMenuOptions(
    ThMeetingStore.ThImEvent.roomMenuOptions
  );
  // 更新初始化时正在被邀请的人员
  ThMeetingStore.updateInviteListData(ThMeetingStore.ThImEvent.inviteListData);
  // 更新房间中可邀请的人员及分组列表
  ThMeetingStore.updateInviteMemberList(
    ThMeetingStore.ThImEvent.roomOnlineListPsn
  );
  // 更新可邀请人员分组
  ThMeetingStore.updateInviteMemberGroup(
    ThMeetingStore.ThImEvent.roomOnlineGroupPsn
  );
  // 更新自己的信息
  ThMeetingStore.updateMineInfo(ThMeetingStore.ThImEvent.userId);
  // 更新房间协助人员
  ThMeetingStore.updateRoomAssistMember({
    userId: ThMeetingStore.mineInfo.userId,
    hasAudio: ThMeetingStore.roomMenuOptions.audio,
    hasVideo: ThMeetingStore.roomMenuOptions.video,
  });
  // 将自己设置为主播
  ThMeetingStore.updateLectureInfo({
    ...ThMeetingStore.mineInfo,
    hasAudio: ThMeetingStore.roomMenuOptions.audio,
    hasVideo: ThMeetingStore.roomMenuOptions.video,
    optimizationMode: PB.StrategyType.FLUENCY_FIRST,
    optimizationHd: PB.VideoResolution.VIDEO_RESOLUTION_1080P,
    client: PB.Client.PC,
  });
  curLectureInfo.value = JSON.parse(JSON.stringify(ThMeetingStore.lectureInfo));
  // 申明 rtc
  const ThRtcClient: any = new ThRTC({
    appId: ThImEvent.meetingInfo.agoraTokenData.appId,
    channel: ThImEvent.meetingInfo.meetingNo,
    token: ThImEvent.meetingInfo.agoraTokenData.token,
    uid: ThImEvent.userId,
  });
  ThMeetingStore.updateThRtcClient(ThRtcClient);
  const { t, locale } = i18n.global;
  let calculateInterval: any;
  // 获取当前时间
  const meetingStartTime: any = ThImEvent.meetingInfo.startTime;
  // 计算页面时间
  const currentTimestamp: any = ref('00:00:00');
  const handleCalculateTime = () => {
    calculateInterval = setInterval(() => {
      currentTimestamp.value = calculateElapsedTime(meetingStartTime);
    }, 1000);
  };
  const handleClearCalculateTime = () => {
    if (calculateInterval) {
      clearInterval(calculateInterval);
    }
  };

  const handleLectureCanvasZoom = (type: boolean) => {
    if (!type) {
      ThImEvent.sendAssistCameraZoomChangedEvent({
        meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        userId: ThMeetingStore.lectureInfo?.userId,
        type: PB.ZoomType.DECREMENT,
      });
    } else {
      ThImEvent.sendAssistCameraZoomChangedEvent({
        meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        userId: ThMeetingStore.lectureInfo?.userId,
        type: PB.ZoomType.INCREMENT,
      });
    }
  };
  // 计算 lectureVideoRef 的宽高，并使其居中
  const lectureVideoStyle = computed(() => {
    if (!assistContainerRef.value) return {};
    const containerWidth = assistContainerRef.value.clientWidth;
    const containerHeight = assistContainerRef.value.clientHeight;
    const aspectRatio = 16 / 9;

    let width = containerWidth;
    let height = width / aspectRatio;
    if (!ThMeetingStore.isShareScreen) {
      if (height < containerHeight) {
        height = containerHeight;
        width = height * aspectRatio;
      }
    } else if (height > containerHeight) {
      height = containerHeight;
      width = height * aspectRatio;
    }
    console.log('计算 lectureVideoRef 的宽高，并使其居中', width, height);
    return {
      width: `${Math.floor(width)}px`,
      height: `${Math.floor(height)}px`,
    };
  });
  // 获取设备的麦克风与摄像头
  const handleGetDevicesList = async () => {
    const devices = await ThRtcClient.getDevices();
    console.log('获取设备的麦克风与摄像头', devices);
    devices?.videoDevices.forEach((d: any, index: number) => {
      d.name = `${t('mst.menu.sxt')} ${index + 1}`;
    });
    ThMeetingStore.updateDevicesList(devices);
  };
  // 调用用户自己的音频
  const handleLocalAudioTrack = async () => {
    // 获取当前设备列表
    const audioDevices: any = ThMeetingStore.devicesList?.audioDevices;
    if (audioDevices && audioDevices.length > 0) {
      await ThRtcClient.createMicrophoneAudioTrack(
        audioDevices[ThMeetingStore.deviceOptions.audioIndex].deviceId
      );
      ThRtcClient.localAudioTrackPush();
    } else {
      msg.error(t('mst.rtc.device.audio.error'));
      ThMeetingStore.updateRoomMenuOptionsAudio(false);
      ThMeetingStore.updateRoomAssistMember({
        userId: ThMeetingStore.mineInfo.userId,
        hasAudio: false,
        hasVideo: ThMeetingStore.roomMenuOptions.video,
      });
    }
  };
  // 设置本地为主播时视频画面
  const handleLocalVideoTrack = async () => {
    console.log('设置本地为主播时视频画面---');
    // 获取当前设备列表
    const videoDevices: any = ThMeetingStore.devicesList?.videoDevices;
    if (videoDevices && videoDevices.length > 0) {
      if (!ThRtcClient.localVideoTrack) {
        await ThRtcClient.createCameraVideoTrack(
          videoDevices[ThMeetingStore.deviceOptions.videoIndex].deviceId
        );
        ThRtcClient.localVideoTrackPush();
      }
      if (
        ThMeetingStore.lectureInfo?.userId === ThMeetingStore.mineInfo?.userId
      ) {
        const mapper = {
          1: 'mst-assist-lecture-video-marking-rt-',
          2: 'mst-assist-lecture-video-marking-',
        };
        // 判断标注场景存在的视频流id前缀
        const prefix =
          mapper[ThMeetingStore.lectureInfo?.activeScreenLayout] ||
          'mst-assist-lecture-video-';
        ThRtcClient.renderLocalStreams(
          `${prefix}${ThMeetingStore.lectureInfo.userId}`,
          false
        );
      }
    } else {
      msg.error(t('mst.rtc.device.video.error'));
      ThMeetingStore.updateRoomMenuOptionsVideo(false);
      ThMeetingStore.updateRoomAssistMember({
        userId: ThMeetingStore.mineInfo.userId,
        hasAudio: ThMeetingStore.roomMenuOptions.audio,
        hasVideo: false,
      });
    }
  };
  // 人员加入
  const handleRoomJoinUser = async (user: any) => {
    ThMeetingStore.updateRoomAssistMember({
      userId: user.uid,
      hasVideo: user.hasVideo,
      hasAudio: user.hasAudio,
    });
  };
  const handleChangeLecture = async () => {
    if (ThMeetingStore.lectureInfo.hasVideo && lectureVideoRef.value) {
      lectureVideoRef.value.innerHTML = ''; // 清空内部的内容
    }
    await sleep(1000 * 0.1);
    // 渲染主播视频内容
    if (
      ThMeetingStore.lectureInfo?.userId === ThMeetingStore.mineInfo?.userId
    ) {
      if (ThMeetingStore.roomMenuOptions.video) {
        handleLocalVideoTrack();
      }
    } else if (ThMeetingStore.lectureInfo.hasVideo) {
      const mapper = {
        1: 'mst-assist-lecture-video-marking-rt-',
        2: 'mst-assist-lecture-video-marking-',
      };
      // 判断标注场景存在的视频流id前缀
      const prefix =
        mapper[ThMeetingStore.lectureInfo?.activeScreenLayout] ||
        'mst-assist-lecture-video-';
      ThRtcClient.renderRemoteStreams(
        ThMeetingStore.lectureInfo.userId,
        `${prefix}${ThMeetingStore.lectureInfo.userId}`,
        true
      );
    }
  };
  // 人员离开
  const handlerRtcRoomUserLeft = async (user: any) => {
    if (user.uid === ThMeetingStore.lectureInfo.userId) {
      if (ThMeetingStore.isShareScreen) {
        ThMeetingStore.updateIsShareScreen(false);
      }
      const member = await ThMeetingStore.roomAssistMember.find(
        (m: any) => m.userId === ThMeetingStore.mineInfo.userId
      );
      curLectureInfo.value = JSON.parse(JSON.stringify(member));
      ThMeetingStore.updateLectureInfo(JSON.parse(JSON.stringify(member)));
    }
    ThMeetingStore.removeRoomAssistMember({
      userId: user.uid,
    });
    ThImEvent.leaveMeeting({
      meetingId: ThMeetingStore.meetingInfo.meetingId,
      userId: user.uid,
    });
  };

  // 接收到人员推流事件-变更房间人员状态
  const handleChangeRoomPsnStatus = async (user: any, mediaType?: string) => {
    await ThMeetingStore.updateRoomAssistMember({
      userId: user.uid,
      hasVideo: user.hasVideo,
      hasAudio: user.hasAudio,
    });
    if (
      ThMeetingStore.allAudioDisable &&
      user.uid !== ThMeetingStore.meetingInfo.masterId &&
      user.hasAudio
    ) {
      ThMeetingStore.updateAllAudioDisable(false);
    }
    if (user.uid === ThMeetingStore.lectureInfo.userId) {
      ThMeetingStore.updateLectureInfo({
        ...ThMeetingStore.lectureInfo,
        hasVideo: user.hasVideo,
        hasAudio: user.hasAudio,
      });
      curLectureInfo.value = JSON.parse(
        JSON.stringify(ThMeetingStore.lectureInfo)
      );
      if (mediaType === 'video') {
        handleChangeLecture();
      }
    }
  };
  const handleMstRtcAgoraUserLeft = async (data: any) => {
    const { user, reason } = data;
    console.log('assist: mst-agora-user-left', user, reason);
    handlerRtcRoomUserLeft(user);
  };
  const handleMstRtcAgoraUserPublished = async (data: any) => {
    const { user, mediaType } = data;
    console.log('assist: mst-agora-user-published', user, mediaType);
    // 变更房间人员 音频视频状态
    handleChangeRoomPsnStatus(user, mediaType);
    if (!ThMeetingStore.roomMenuOptions.loudspeaker) {
      ThRtcClient.stopAudioTrack();
    }
  };
  const handleMstRtcAgoraUserUnpublished = async (data: any) => {
    const { user, mediaType } = data;
    console.log('assist: mst-agora-user-unpublished', user, mediaType);
    handleChangeRoomPsnStatus(user, mediaType);
  };
  const handleMstRtcAgoraUserJoined = async (user: any) => {
    console.log('assist: mst-agora-user-joined', user);
    handleRoomJoinUser(user);
  };
  const handleMstRtcAgoraShareTrackEnded = async (user: any) => {
    console.log('分享屏幕关闭', user);
    handleSceneCloseShareScreen();
  };

  // 发送run-task指令
  function sendRunTask() {
    const TASK_ID = uuidv4().replace(/-/g, '').slice(0, 32);
    const runTaskMessage = {
      header: {
        action: 'run-task',
        task_id: TASK_ID,
        streaming: 'duplex'
      },
      payload: {
        task_group: 'audio',
        task: 'asr',
        function: 'recognition',
        model: 'gummy-realtime-v1',
        parameters: {
          sample_rate: 16000,
          format: 'wav',
          transcription_enabled: true,
          translation_enabled: true,
          translation_target_languages: ['zh']
        },
        input: {}
      }
    };
    transWss.value.send(JSON.stringify(runTaskMessage));
  }
  const handleTransWssOpen = () => {
    console.log('trans-wss-open');
    isTransWssOpen.value = true;
  };
  function sendAudioStream() {
    handleTransInterval()
  }
  // 翻译socket 事件
  const handleTransWssMessage = (message: any) => {
    if (message.data) {
      const dataObj: any = JSON.parse(message.data);
      console.log('>>>>>>>>>>>>>>>>>tarnslate data', dataObj, transWssInfo.value.translateVendor);
      // 阿里云走新的逻辑
      if (transWssInfo.value.translateVendor === 'aliyun') {
        switch (dataObj.header.event) {
          // 服务端的厂商wss连接成功 发送阿里云任务
          case 'connection-created':
            sendRunTask();
            break;
          case 'task-started':
            sendAudioStream();
            break;
          case 'result-generated':
            // 解析payload中的translations
            if (dataObj.payload.output.translations && dataObj.payload.output.translations.length > 0) {
              dataObj.payload.output.translations.forEach(translation => {
                if (translation.sentence_end) {
                  const text = translation.text;
                  ThImEvent.assistMeetingRealTimeMessage({
                    /** 会议号 */
                    meetingNo: ThMeetingStore.meetingInfo.meetingNo,
                    /** 翻译消息 */
                    message: text,
                    /** 消息发送时间 */
                    timestamp: Date.now(),
                    /** 翻译消息的语言 */
                    messageLanguage: 'cn',
                  })
                }
              });
            }
            break;
          case 'task-finished':
            console.error('任务完成');
            transWss.value.close();
            break;
          case 'task-failed':
            console.error('任务失败：', dataObj.header.error_message);
            transWss.value.close();
            break;
          default:
            console.error('未知事件：', dataObj.header.event);
        }
      }
      // 讯飞走原来的逻辑
      if (transWssInfo.value.translateVendor === 'xunfei') {
        if (dataObj.code === '0') {
          console.log('翻译socket 事件-dataObj.data', dataObj);
          if (dataObj.data) {
            const data: any = JSON.parse(dataObj.data);
            if (data.dst && data.type === 0) {
              const text: any = removeFirstSpecialChar(data.dst);
              console.log('>>>>>>>>>>>>>>>>> result', data.dst, text);
              if (text) {
                // ThImEvent.sendAssistMeetingRealTimeTranslation({
                //   meetingNo: ThMeetingStore.meetingInfo.meetingNo,
                //   sourceLanguage: locale.value,
                //   message: text,
                // });
                // 【客户端发送服务端】实时翻译消息 上面原来的翻译不要了
                ThImEvent.assistMeetingRealTimeMessage({
                  /** 会议号 */
                  meetingNo: ThMeetingStore.meetingInfo.meetingNo,
                  /** 翻译消息 */
                  message: text,
                  /** 消息发送时间 */
                  timestamp: Date.now(),
                  /** 翻译消息的语言 */
                  messageLanguage: 'cn',
                })
              }
            }
          }
        } else {
          handleInitTransLanguage();
        }
      }
    }
  };
  const handleTransWssClose = (err: any) => {
    console.log('handleTransWssClose', err);
    isTransWssOpen.value = false;
  };
  const handleMonitorTransWssRtc = () => {
    transWss.value?.addEventListener('open', handleTransWssOpen);
    transWss.value?.addEventListener('message', handleTransWssMessage);
    transWss.value?.addEventListener('close', handleTransWssClose);
  };
  const handleClearTransWssMonitor = () => {
    transWss.value?.removeEventListener('open', handleTransWssOpen);
    transWss.value?.removeEventListener('message', handleTransWssMessage);
    transWss.value?.removeEventListener('close', handleTransWssClose);
  };
  /**
   * todo 创建声明wss周期 ，获取声网音频数据后发送给服务商
   */
  const handleTransInterval = () => {
    transWssInterval.value = setInterval(() => {
      if (isTransWssOpen.value && transWss.value?.readyState === 1) {
        const chunkSize = transWssInfo.value.translateVendor === 'aliyun' ? 640 : 1280; // 40ms数据块
        const audioData: any = audioDataArray.value.splice(0, chunkSize);
        if (audioData.length > 0) {
          transWss.value?.send(new Int8Array(audioData));
        }
      }
    }, 40);
  };
  const handleStartAudioFrameCallback = async () => {
    if (!ThRtcClient.localAudioTrack) {
      return;
    }
    ThRtcClient.localAudioTrack.setAudioFrameCallback((buffer: AudioBuffer) => {
      const currentChannelData = buffer.getChannelData(0);
      const bufTo16kHz = to16kHz(currentChannelData);
      const bufTo16BitPCM = to16BitPCM(bufTo16kHz);
      audioDataArray.value = bufTo16BitPCM;
    }, 2048);
    await sleep(1000 * 1);
    // todo 讯飞才走直接发语音流，阿里云翻译应该在自定义socket发起语音流
    if (transWssInfo.value.translateVendor === 'xunfei') {
      handleTransInterval();
    }
  };
  const handleMstRtcAgoraAudioTrackClose = async () => {
    console.log('翻译转换关闭');
    handleClearTransWssMonitor();
    transWss.value?.close();
    transWss.value = null;
    if (transWssInterval.value) {
      clearInterval(transWssInterval.value);
      transWssInterval.value = null;
    }
  };
  async function handleInitTransLanguage() {
    if (
      transWssInfo.value &&
      // transWssInfo.value.escaping === '1' &&
      transWssInfo.value.url
    ) {
      transWss.value = new WebSocket(transWssInfo.value.url);
      handleMonitorTransWssRtc();
      handleStartAudioFrameCallback();
    } else {
      handleMstRtcAgoraAudioTrackClose();
    }
    // return true;
  }
  const handleMstRtcAgoraAudioTrackOpen = async () => {
    await handleInitTransLanguage();
  };

  // 监听到人员修改翻译语言
  async function handleReconnectTranslate() {
    // todo 1: 无论开不开麦克风 修改语言的信息 要重新连接翻译socket
    // 1：重置翻译语言信息
    await handleMstRtcAgoraAudioTrackClose();
    // 2:初始化翻译语言
    await getTranslateSocketServer();
    // 3:重新连接翻译socket
    handleInitTransLanguage();
  }
  // todo 设置hd
  const handleSceneSetOptimizationHd = async (data: { type: number }) => {
    const { type } = data;
    ThMeetingStore.updateLectureInfo({
      ...ThMeetingStore.lectureInfo,
      optimizationHd: type,
    });
    curLectureInfo.value = JSON.parse(
      JSON.stringify(ThMeetingStore.lectureInfo)
    );
    ThMeetingStore.updateRoomAssistSetVideoResolutiondEvent({
      userId: ThMeetingStore.lectureInfo.userId,
      optimizationHd: type,
    });
    if (ThMeetingStore.lectureInfo.userId === ThMeetingStore.mineInfo.userId) {
      const mapper = {
        [`${PB.VideoResolution.VIDEO_RESOLUTION_360P}`]: '360p',
        [`${PB.VideoResolution.VIDEO_RESOLUTION_720P}`]: '720p',
        [`${PB.VideoResolution.VIDEO_RESOLUTION_1080P}`]: '1080p',
      };
      ThRtcClient.localSetVideoProfile(mapper[type]);
    }
    // 不是主持人

    if (
      ThMeetingStore.meetingInfo.masterId !== ThMeetingStore.mineInfo.userId
    ) {
      ThImEvent.sendAssistVideoResolutionUpdateEvent({
        meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        resolution: type,
      });
    } else if (
      //   是主持人 并且当前视频 是我
      ThMeetingStore.mineInfo.userId === ThMeetingStore.lectureInfo.userId
    ) {
      ThImEvent.sendAssistVideoResolutionUpdateEvent({
        meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        resolution: type,
      });
    } else {
      //   是主持人 并且当前视频 不是我
      ThImEvent.sendAssistSetVideoResolutionEvent({
        meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        anchor: ThMeetingStore.lectureInfo.userId,
        resolution: type,
      });
    }
  };
  // 设置FPS
  const handleSceneSetOptimizationMode = async (data: { type: number }) => {
    const { type } = data;
    ThMeetingStore.updateLectureInfo({
      ...ThMeetingStore.lectureInfo,
      optimizationMode: type,
    });
    curLectureInfo.value = JSON.parse(
      JSON.stringify(ThMeetingStore.lectureInfo)
    );
    ThMeetingStore.updateRoomAssistMemberOptimizationMode({
      userId: ThMeetingStore.lectureInfo.userId,
      optimizationMode: type,
    });
    if (ThMeetingStore.lectureInfo.userId === ThMeetingStore.mineInfo.userId) {
      ThRtcClient.localSetOptimizationMode(
        type === PB.StrategyType.QUALITY_FIRST ? 'detail' : 'motion'
      );
    }
    if (
      ThMeetingStore.meetingInfo.masterId !== ThMeetingStore.mineInfo.userId
    ) {
      ThImEvent.sendAssistVideoTransferStrategyUpdateEvent({
        meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        type,
      });
    } else if (
      ThMeetingStore.mineInfo.userId === ThMeetingStore.lectureInfo.userId
    ) {
      ThImEvent.sendAssistVideoTransferStrategyUpdateEvent({
        meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        type,
      });
    } else {
      ThImEvent.sendAssistVideoTransferStrategyChangeEvent({
        meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        member: ThMeetingStore.lectureInfo.userId,
        type,
      });
    }
  };
  const handleMonitorThRtcClientEvent = () => {
    THEventBus.on('mst-agora-user-left', handleMstRtcAgoraUserLeft);
    THEventBus.on('mst-agora-user-published', handleMstRtcAgoraUserPublished);
    THEventBus.on(
      'mst-agora-user-unpublished',
      handleMstRtcAgoraUserUnpublished
    );
    THEventBus.on('mst-agora-user-joined', handleMstRtcAgoraUserJoined);
    THEventBus.on(
      'mst-agora-share-track-ended',
      handleMstRtcAgoraShareTrackEnded
    );
    THEventBus.on(
      'mst-agora-audio-track-open',
      handleMstRtcAgoraAudioTrackOpen
    );
    THEventBus.on(
      'mst-agora-audio-track-close',
      handleMstRtcAgoraAudioTrackClose
    );
  };
  const handleClearMonitorThRtcClientEvent = () => {
    THEventBus.off('mst-agora-user-left', handleMstRtcAgoraUserLeft);
    THEventBus.off('mst-agora-user-published', handleMstRtcAgoraUserPublished);
    THEventBus.off(
      'mst-agora-user-unpublished',
      handleMstRtcAgoraUserUnpublished
    );
    THEventBus.off('mst-agora-user-joined', handleMstRtcAgoraUserJoined);
    THEventBus.off(
      'mst-agora-share-track-ended',
      handleMstRtcAgoraShareTrackEnded
    );
    THEventBus.off(
      'mst-agora-audio-track-close',
      handleMstRtcAgoraAudioTrackClose
    );
    THEventBus.off(
      'mst-agora-audio-track-open',
      handleMstRtcAgoraAudioTrackOpen
    );
  };
  const handleInitLocalAudioTrack = () => {
    if (ThMeetingStore.roomMenuOptions.audio) {
      if (!ThRtcClient.localAudioTrack) {
        handleLocalAudioTrack();
      }
    }
  };
  const handleInitLocalVideoTrack = () => {
    if (ThMeetingStore.roomMenuOptions.video) {
      if (!ThRtcClient.localVideoTrack) {
        handleLocalVideoTrack();
      }
      ThImEvent.changeCamera({
        meetingNo: ThImEvent.meetingInfo.meetingNo,
        status: 1,
      });
    }
  };
  async function getTranslateSocketServer() {
    const resData: any = await ThImEvent.changeLanguageAndIndustryType({
      meetingId: ThMeetingStore.meetingInfo.meetingId,
      languageType: ThMeetingStore.roomTranslateInfo?.languageType,
      industryType: ThMeetingStore.roomTranslateInfo?.industryType,
    });
    if (resData.code !== 200) {
      msg.error(resData.msg);
    }
    transWssInfo.value = {
      url: resData.data?.url,
      translateVendor: resData.data?.type,
    };
  }
  const handleInitThRtcClient = async () => {
    // 注册RTC监听
    handleMonitorThRtcClientEvent();
    // 加入房间
    if (ThRtcClient) {
      await ThRtcClient.joinRtcRoom();
      ThImEvent.sendAssistMeetingStatusSyncEvent({
        meetingNo: ThImEvent.meetingInfo.meetingNo,
      });
      ThMeetingStore.updateRoomAssistMemberClient({
        userId: ThMeetingStore.mineInfo.userId,
        client: PB.Client.PC,
      });
      ThMeetingStore.updateRoomAssistMemberOptimizationMode({
        userId: ThMeetingStore.mineInfo.userId,
        optimizationMode: PB.StrategyType.FLUENCY_FIRST,
      });
      ThMeetingStore.updateRoomAssistSetVideoResolutiondEvent({
        userId: ThMeetingStore.mineInfo.userId,
        optimizationHd: PB.VideoResolution.VIDEO_RESOLUTION_1080P,
      });

      if (ThMeetingStore.roomTranslateInfo?.enableTranslation) {
        await getTranslateSocketServer();
      }
      handleInitLocalAudioTrack();
      handleInitLocalVideoTrack();
    }
  };

  // 本地菜单控制摄像头业务
  const handleChangeCamera = () => {
    if (ThMeetingStore.lectureInfo.userId === ThMeetingStore.mineInfo.userId) {
      ThMeetingStore.updateLectureInfo({
        ...ThMeetingStore.lectureInfo,
        hasVideo: true,
      });
      curLectureInfo.value = JSON.parse(
        JSON.stringify(ThMeetingStore.lectureInfo)
      );
    }
    ThMeetingStore.updateRoomAssistMember({
      userId: ThMeetingStore.mineInfo.userId,
      hasAudio: ThMeetingStore.roomMenuOptions.audio,
      hasVideo: true,
    });
    const videoDevices: any = ThMeetingStore.devicesList?.videoDevices;
    ThRtcClient.localSetCameraTrack(
      videoDevices[ThMeetingStore.deviceOptions.videoIndex].deviceId
    );
    ThImEvent.changeCamera({
      meetingNo: ThImEvent.meetingInfo.meetingNo,
      status: 1,
    });
  };
  const handleRenderLocalStream = async (member: any) => {
    const localHtml: any = document.getElementById(
      `mst-grid-video-${member.userId}`
    );
    console.log('handleRenderLocalStream-', localHtml);
    if (!localHtml) {
      setTimeout(() => {
        handleRenderLocalStream(member);
      }, 1000 * 0.5);
    } else if (ThRtcClient.localVideoTrack) {
      localHtml.innerHTML = '';
      ThRtcClient.renderLocalStreams(`mst-grid-video-${member.userId}`, true);
    } else {
      const videoDevices: any = ThMeetingStore.devicesList?.videoDevices;
      await ThRtcClient.createCameraVideoTrack(
        videoDevices[ThMeetingStore.deviceOptions.videoIndex].deviceId
      );
      ThRtcClient.localVideoTrackPush();
      localHtml.innerHTML = '';
      ThRtcClient.renderLocalStreams(`mst-grid-video-${member.userId}`, true);
    }
  };
  // 自动切换主播逻辑
  const handleAutoSwitchLecture = async () => {
    // 等待一段时间确保成员列表已加载
    await sleep(1000);
    const members = ThMeetingStore.roomAssistMember;
    if (!members || members.length === 0) {
      console.log('成员列表为空，保持当前主播');
      return;
    }
    let targetMember: any = null;
    // 优先级1: 有人开启了摄像头同时开启了冻屏标注、画板标注、闪点标记、屏幕共享功能之一
    const membersWithVideoAndFeatures = members.filter(
      (member: any) =>
        member.hasVideo &&
        (member.activeScreenLayout || // 冻屏标注、画板标注、闪点标记
          (member.userId === ThMeetingStore.lectureInfo?.userId &&
            ThMeetingStore.isShareScreen)) // 屏幕共享
    );
    if (membersWithVideoAndFeatures.length > 0) {
      [targetMember] = membersWithVideoAndFeatures;
      console.log('找到开启摄像头且有标注功能的成员:', targetMember.name);
    } else {
      // 优先级2: 有人开启了摄像头同时眼镜端在线
      const membersWithVideoAndGlass = members.filter(
        (member: any) => member.hasVideo && member.client === PB.Client.GLASS
      );
      if (membersWithVideoAndGlass.length > 0) {
        [targetMember] = membersWithVideoAndGlass;
        console.log('找到开启摄像头且眼镜端在线的成员:', targetMember.name);
      } else {
        // 优先级3: 有人开启了摄像头
        const membersWithVideo = members.filter(
          (member: any) => member.hasVideo
        );
        if (membersWithVideo.length > 0) {
          [targetMember] = membersWithVideo;
          console.log('找到第一个开启摄像头的成员:', targetMember.name);
        }
      }
    }
    // 如果找到目标成员且不是当前主播，则切换
    if (
      targetMember &&
      targetMember.userId !== ThMeetingStore.lectureInfo?.userId
    ) {
      console.log('自动切换主播到:', targetMember.name);
      await ThMeetingStore.updateLectureInfo(
        JSON.parse(JSON.stringify(targetMember))
      );
      curLectureInfo.value = JSON.parse(JSON.stringify(targetMember));
      // 如果是自己，需要特殊处理
      if (targetMember.userId === ThMeetingStore.mineInfo.userId) {
        ThMeetingStore.updateLectureInfo({
          ...targetMember,
          hasVideo: ThMeetingStore.roomMenuOptions.video,
          hasAudio: ThMeetingStore.roomMenuOptions.audio,
        });
        curLectureInfo.value = JSON.parse(
          JSON.stringify(ThMeetingStore.lectureInfo)
        );
      }
    } else if (targetMember) {
      console.log('无需切换主播，保持当前状态');
    } else {
      console.log('没有找到符合条件的成员，保持当前状态');
    }
  };

  // Psn 选择人员作为主播时触发事件
  const handleSetLectureInfo = () => {
    curLectureInfo.value = JSON.parse(
      JSON.stringify(ThMeetingStore.lectureInfo)
    );
  };
  // 关闭本地视频流
  const handleCloseCamera = () => {
    if (ThMeetingStore.lectureInfo.userId === ThMeetingStore.mineInfo.userId) {
      ThMeetingStore.updateLectureInfo({
        ...ThMeetingStore.lectureInfo,
        hasVideo: false,
      });
      curLectureInfo.value = JSON.parse(
        JSON.stringify(ThMeetingStore.lectureInfo)
      );
    }
    console.log('关闭本地视频流----', ThRtcClient.localVideoTrack);
    if (ThRtcClient.localVideoTrack) {
      ThRtcClient.closeCameraVideoTrack();
    }
    ThMeetingStore.updateRoomAssistMember({
      userId: ThMeetingStore.mineInfo.userId,
      hasAudio: ThMeetingStore.roomMenuOptions.audio,
      hasVideo: false,
    });
    ThImEvent.changeCamera({
      meetingNo: ThImEvent.meetingInfo.meetingNo,
      status: 0,
    });
  };
  const handleChangeMicrophone = (data: any) => {
    handleInitLocalAudioTrack();
    ThRtcClient.localAudioTrackMuted(data);
    ThMeetingStore.updateRoomAssistMember({
      userId: ThMeetingStore.mineInfo.userId,
      hasAudio: data,
      hasVideo: ThMeetingStore.roomMenuOptions.video,
    });
  };
  // 扬声器变更事件
  const handleChangeLoudspeaker = (data: any) => {
    if (data) {
      ThRtcClient.playAudioTrack();
    } else {
      ThRtcClient.stopAudioTrack();
    }
  };
  // 全员静音
  const handleChangeAllAudioDisable = (data: any) => {
    if (data) {
      ThImEvent.sendAssistAllAudioDisable({
        meetingNo: ThMeetingStore?.meetingInfo.meetingNo,
      });
    } else {
      ThImEvent.sendAssistAllAudioEnable({
        meetingNo: ThMeetingStore?.meetingInfo.meetingNo,
      });
    }
  };
  const handleAssistAllAudioDisabled = (data: any) => {
    if (data.master === ThMeetingStore.mineInfo.userId) {
      return;
    }
    msg.warning(`${t('mst.menu.mkf.error.no.power')}`);
    ThMeetingStore.updateAllAudioDisable(true);
    ThMeetingStore.updateRoomMenuOptionsAudio(false);
    handleChangeMicrophone(false);
  };
  const handleAssistAllAudioEnabled = (data: any) => {
    if (data.master === ThMeetingStore.mineInfo.userId) {
      return;
    }
    const master = ThMeetingStore.filterMemberInfo(data.master);
    msg.warning(`${master.name} ${t('mst.menu.mkf.error.power')}`);
    ThMeetingStore.updateAllAudioDisable(false);
  };
  // 接收到主持人开启用户麦克风事件
  const handleAssistAudioOpenedEvent = (data: any) => {
    const master = ThMeetingStore.filterMemberInfo(data.master);
    msg.warning(`${master?.name} ${t('mst.menu.mkf.error.power.msg2')}`);
    handleChangeMicrophone(true);
    ThMeetingStore.updateRoomMenuOptionsAudio(true);
  };
  // 接收到主持人关闭用户麦克风事件
  const handleAssistAudioClosedEvent = (data: any) => {
    handleChangeMicrophone(false);
    ThMeetingStore.updateRoomMenuOptionsAudio(false);
    const master = ThMeetingStore.filterMemberInfo(data.master);
    msg.warning(`${master?.name} ${t('mst.menu.mkf.error.power.msg1')}`);
  };
  // 接收到主持人关闭用户视频事件
  const handleAssistCameraClosedEvent = (data: any) => {
    const master = ThMeetingStore.filterMemberInfo(data.master);
    msg.warning(`${master?.name} ${t('mst.menu.sxt.error.power.msg1')}`);
    if (sceneMenuRef.value.shareScreenMenu.status) {
      handleSceneCloseShareScreen();
    } else {
      ThMeetingStore.updateRoomMenuOptionsVideo(false);
      handleCloseCamera();
    }
  };
  // 接收到主持人开启用户视频事件
  const handleAssistCameraOpenedEvent = (data: any) => {
    const master = ThMeetingStore.filterMemberInfo(data.master);
    msg.warning(`${master?.name} ${t('mst.menu.sxt.error.power.msg2')}`);
    ThMeetingStore.updateRoomMenuOptionsVideo(true);
    ThMeetingStore.updateDeviceOptionsVideoIndex(0);
    handleChangeCamera();
  };
  // 接收到主持人修改hd分辨率
  const handleAssistVideoTransHdChangedEvent = (data: any) => {
    if (ThMeetingStore.lectureInfo.userId === ThMeetingStore.mineInfo.userId) {
      ThMeetingStore.updateLectureInfo({
        ...ThMeetingStore.lectureInfo,
        optimizationHd: data.resolution,
      });
      curLectureInfo.value = JSON.parse(
        JSON.stringify(ThMeetingStore.lectureInfo)
      );
    }
    const mapper = {
      [`${PB.VideoResolution.VIDEO_RESOLUTION_360P}`]: '360p',
      [`${PB.VideoResolution.VIDEO_RESOLUTION_720P}`]: '720p',
      [`${PB.VideoResolution.VIDEO_RESOLUTION_1080P}`]: '1080p',
    };

    ThRtcClient.localSetVideoProfile(mapper[data.resolution]);
    ThMeetingStore.updateRoomAssistSetVideoResolutiondEvent({
      userId: ThMeetingStore.mineInfo.userId,
      optimizationHd: data.resolution,
    });
    ThImEvent.sendAssistVideoResolutionUpdateEvent({
      meetingNo: ThMeetingStore.meetingInfo.meetingNo,
      resolution: data.resolution,
    });
  };
  // 接收到主持人切换FPS事件
  const handleAssistVideoTransferStrategyChangedEvent = (data: any) => {
    if (ThMeetingStore.lectureInfo.userId === ThMeetingStore.mineInfo.userId) {
      ThMeetingStore.updateLectureInfo({
        ...ThMeetingStore.lectureInfo,
        optimizationMode: data.type,
      });
      curLectureInfo.value = JSON.parse(
        JSON.stringify(ThMeetingStore.lectureInfo)
      );
    }
    ThRtcClient.localSetOptimizationMode(
      data.type === PB.StrategyType.QUALITY_FIRST ? 'detail' : 'motion'
    );
    ThMeetingStore.updateRoomAssistMemberOptimizationMode({
      userId: ThMeetingStore.mineInfo.userId,
      optimizationMode: data.type,
    });
    ThImEvent.sendAssistVideoTransferStrategyUpdateEvent({
      meetingNo: ThMeetingStore.meetingInfo.meetingNo,
      type: data.type,
    });
  };
  // 接收到成员FPS更新事件
  const handleAssistVideoTransferStrategyUpdatedEvent = (data: any) => {
    if (ThMeetingStore.lectureInfo.userId === data.member) {
      ThMeetingStore.updateLectureInfo({
        ...ThMeetingStore.lectureInfo,
        optimizationMode: data.type,
      });
      curLectureInfo.value = JSON.parse(
        JSON.stringify(ThMeetingStore.lectureInfo)
      );
    }
    ThMeetingStore.updateRoomAssistMemberOptimizationMode({
      userId: data.member,
      optimizationMode: data.type,
    });
    console.log('接收到成员FPS更新事件-', ThMeetingStore.roomAssistMember);
  };

  // 接收到成员HD更新事件
  const handleAssistVideoTransferHdUpdatedEvent = (data: any) => {
    if (ThMeetingStore.lectureInfo.userId === data.anchor) {
      ThMeetingStore.updateLectureInfo({
        ...ThMeetingStore.lectureInfo,
        optimizationHd: data.resolution,
      });
      curLectureInfo.value = JSON.parse(
        JSON.stringify(ThMeetingStore.lectureInfo)
      );
    }
    ThMeetingStore.updateRoomAssistSetVideoResolutiondEvent({
      userId: data.anchor,
      optimizationHd: data.resolution,
    });
    console.log('接收到成员HD更新事件-', ThMeetingStore.roomAssistMember);
  };
  // 接收到其他客户端切换入会事件
  const handleAssistMemberClientChangedEvent = (data: any) => {
    const member = ThMeetingStore.filterMemberInfo(data.member);
    msg.warning(`${member?.name} ${t('mst.message.join.msg1')}`);
  };

  // 接收到成员入会事件
  const handleAssistMemberJoinedEvent = (data: any) => {
    ThMeetingStore.updateRoomAssistMemberClient({
      userId: data.member,
      client: data.client,
    });
  };
  // 接收到成员切换横竖屏
  const handleAssistScreenDirectionUpdated = (data: any) => {
    ThMeetingStore.updateRoomAssistMemberDirection({
      userId: data.member,
      client: data.client,
      direction: data.direction,
    });
  };
  const currentMessageContainer = ref<HTMLElement | null>(null);
  const handleCurrentMessageContainerScrollBottom = () => {
    // 滚动到最底部
    nextTick(() => {
      if (currentMessageContainer.value) {
        currentMessageContainer.value.scrollTo({
          top: currentMessageContainer.value.scrollHeight,
          behavior: 'smooth',
        });
      }
    });
  };
  // 接收到聊天消息
  const handleAssistChatMessageReceiveEvent = async (data: any) => {
    if (data.sender === ThMeetingStore.mineInfo.userId) {
      return;
    }
    const user = await ThMeetingStore.filterMemberInfo(data.sender);
    const message: any = {
      name: user.name,
      avatarUrl: user.avatarUrl,
      meetingNo: ThMeetingStore.meetingInfo.meetingNo,
      message: data.message,
      type: data.type,
      fp: data.fp,
      timestamp: data.timestamp,
      sender: data.sender,
    };

    messageDB.addChatSession(message);
    ThMeetingStore.updateCurrentMessageList(message);
    THEventBus.emit('updateChatMessage');
    handleCurrentMessageContainerScrollBottom();
    setTimeout(() => {
      ThMeetingStore.removeCurrentMessageList();
    }, 1000 * 3);
  };
  // 接收到人员拒绝
  const handleAssistInviteeRejectedEvent = async (data: any) => {
    const invitee = await ThMeetingStore.filterMemberInfo(data.invitee);
    msg.warning(`${invitee.name} ${t('mst.message.msg.reject')}`);
  };

  // 挂断Modal业务
  const hangupModalVisible = ref(false);
  const handleHangupMeeting = () => {
    console.log('handleHangupMeeting---true');
    hangupModalVisible.value = true;
  };
  const handleHangupModalClose = () => {
    hangupModalVisible.value = false;
  };
  // 结束会议
  const handleHangupOverMeeting = (data: any) => {
    console.log(data, t('mst.modal.hangup.end'));
    handleHangupModalClose();
    handleClearMonitorThRtcClientEvent();
    ThRtcClient.leaveRtcRoom();
    THEventBus.emit('mst-over-meeting');
    ThImEvent.overMeeting({
      meetingId: ThMeetingStore.meetingInfo.meetingId,
    });
    ThImEvent.meetingInfo = null;
    ThMeetingStore.updateThImEvent(null);
    ThMeetingStore.resetState();
  };
  // 离开会议
  const handleHangupLeaveMeeting = () => {
    handleHangupModalClose();
    handleClearMonitorThRtcClientEvent();
    ThRtcClient.leaveRtcRoom();
    THEventBus.emit('mst-leave-meeting');
    ThImEvent.leaveMeeting({
      meetingId: ThMeetingStore.meetingInfo.meetingId,
      userId: ThMeetingStore.mineInfo.userId,
    });
    ThImEvent.meetingInfo = null;
    ThMeetingStore.updateThImEvent(null);
    ThMeetingStore.resetState();
  };
  const handleAssistClosed = () => {
    handleHangupLeaveMeeting();
  };
  const handleErrorLeaveMeeting = () => {
    handleHangupModalClose();
    handleClearMonitorThRtcClientEvent();
    ThRtcClient.leaveRtcRoom();
    THEventBus.emit('mst-error-leave-meeting');
    ThImEvent.leaveMeeting({
      meetingId: ThMeetingStore.meetingInfo.meetingId,
      userId: ThMeetingStore.mineInfo.userId,
    });
    ThImEvent.meetingInfo = null;
    ThMeetingStore.updateThImEvent(null);
    ThMeetingStore.resetState();
  };
  const otherJoinVisible = ref(false);
  // 接收到其他客户端入会
  const handleAssistOtherClientJoinedEvent = () => {
    handleClearMonitorThRtcClientEvent();
    ThRtcClient.leaveRtcRoom();
    ThMeetingStore.updateThImEvent(null);
    ThMeetingStore.resetState();
    otherJoinVisible.value = true;
  };
  const handleOtherJoinModalSure = () => {
    otherJoinVisible.value = false;
    THEventBus.emit('mst-leave-meeting');
  };
  const glassJoinVisible = ref(false);
  // 切换眼镜端加入会议-开启确认弹窗
  const handleGlassJoinModalOpen = () => {
    glassJoinVisible.value = true;
  };
  // 切换眼镜端加入会议-关闭确认弹窗
  const handleGlassJoinModalClose = () => {
    glassJoinVisible.value = false;
  };
  // 切换眼镜端加入会议-确认发起
  const handleGlassJoinModalSure = () => {
    handleGlassJoinModalClose();
    ThImEvent.sendAssistOtherClientInviteEvent({
      meetingNo: ThMeetingStore.meetingInfo.meetingNo,
      toClient: PB.Client.GLASS,
    });
  };
  const glassQrCodeVisible = ref(false);
  const handleGlassCodeModalOpen = () => {
    glassQrCodeVisible.value = true;
  };
  const handleGlassCodeModalClose = () => {
    glassQrCodeVisible.value = false;
  };

  // 邀请Modal业务
  const inviteMemberVisible = ref(false);
  const handleOpenInviteMemberModal = () => {
    inviteMemberVisible.value = true;
  };
  const handleInviteMemberModalClose = () => {
    inviteMemberVisible.value = false;
  };
  // 再次邀请人员
  const handleAgainInvite = (data: any) => {
    if (!ThMeetingStore.assistNetworkStatus) {
      msg.warning(t('mst.message.network.error'));
      return;
    }
    handleInviteMemberModalClose();
    ThImEvent.sendAssistInviteEvent({
      meetingNo: ThMeetingStore.meetingInfo.meetingNo,
      inviters: objToArrForKey(data, 'userId'),
      extraPayload: JSON.stringify({
        eventType: 'inviteMeeting',
        eventValue: {
          invitorId: ThMeetingStore.mineInfo.userId,
          meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        },
      }),
    });
    ThMeetingStore.ThImEvent.updateInvitingList(data, 'add');
  };
  // 链接分享Modal业务
  const linkShareVisible = ref(false);
  const handleOpenLinkShareModal = () => {
    linkShareVisible.value = true;
  };
  const handleLinkShareModalClose = () => {
    linkShareVisible.value = false;
  };
  // 下载文件Modal业务
  const downloadFileVisible = ref(false);
  const handleOpenDownloadFileModal = () => {
    downloadFileVisible.value = true;
    ThMeetingStore.updateUploadFileNews(false);
  };
  const handleDownloadFileModalClose = () => {
    downloadFileVisible.value = false;
  };
  const handleSceneUploadFile = () => {
    ThImEvent.sendAssistUploadFileNotifyEvent({
      meetingNo: ThMeetingStore.meetingInfo.meetingNo,
    });
  };
  // 标注中屏幕录制业务
  const canvasElement = ref<HTMLCanvasElement | null>(null);
  let mediaRecorder: any;
  const recordTimestamp: any = ref('00:00:00');
  const recordStartTime = ref<any>(Date.now());
  let calculateRecordTimeInterval: any;
  const handleCalculateRecordTime = () => {
    calculateRecordTimeInterval = setInterval(() => {
      recordTimestamp.value = calculateElapsedTime(recordStartTime.value);
    }, 1000);
  };
  const handleClearCalculateRecordTime = () => {
    if (calculateRecordTimeInterval) {
      clearInterval(calculateRecordTimeInterval);
    }
  };
  const handleRecordingClose = () => {
    ThMeetingStore.updateIsRecord(false);
    handleClearCalculateRecordTime();
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    recordStartTime.value = Date.now();
    recordTimestamp.value = '00:00:00';
  };
  const handleRecordingStart = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      ThMeetingStore.updateIsRecord(true);
      recordStartTime.value = Date.now();
      handleCalculateRecordTime();
    }
  };
  const handleRecordDownload = async (chunks: any) => {
    try {
      ThMeetingStore.updateUploadFileStatus(true);
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const nowMillisecond = getMillisecond();
      const cosConfigRes = await ThImEvent.uploadCosConfig();
      if (cosConfigRes.code !== 200) {
        msg.error(t('mst.message.board.menu.scdt.msg1'));
        return;
      }
      const { uploadFile } = useCos({
        ...cosConfigRes.data,
        basicPath: `${cosConfigRes.data.basicPath}meeting/${ThMeetingStore.meetingInfo.meetingNo}/LocalRecord/`,
      });
      const uploadRes = await uploadFile(blob, `Record${nowMillisecond}.mp4`);
      if (uploadRes.statusCode !== 200) {
        msg.error(t('mst.message.board.menu.scdt.msg2'));
        ThMeetingStore.updateUploadFileStatus(false);
        return;
      }

      const res = await ThImEvent.uploadRecordScreen({
        meetingId: ThMeetingStore.meetingInfo.meetingId,
        recordUrl: uploadRes.Location,
      });
      if (res.code !== 200 && res.code !== 401) {
        msg.error(res.msg);
        return;
      }
      msg.success(t('mst.message.board.menu.scdt.msg3'));
    } catch (error) {
      console.log('handleRecordDownload', error);
    } finally {
      ThMeetingStore.updateUploadFileStatus(false);
    }
  };
  const handleRecordingOpen = async () => {
    try {
      const lectureVideo = lectureVideoRef.value;
      if (!lectureVideo) return;

      let video: any = lectureVideo.querySelector(
        'video'
      ) as HTMLVideoElement | null;

      // 如果获取不到video，从其他DOM元素中获取
      if (!video) {
        // 从标注场景的DOM元素中获取
        const markingRtElement = document.getElementById(
          `mst-assist-lecture-video-marking-rt-${ThMeetingStore.lectureInfo.userId}`
        );
        if (markingRtElement) {
          video = markingRtElement.querySelector(
            'video'
          ) as HTMLVideoElement | null;
        }

        // 如果还是没有获取到，从实时画面DOM元素中获取
        if (!video) {
          const markingElement = document.getElementById(
            `mst-assist-lecture-video-marking-${ThMeetingStore.lectureInfo.userId}`
          );
          if (markingElement) {
            video = markingElement.querySelector(
              'video'
            ) as HTMLVideoElement | null;
          }
        }
      }

      // 如果获取不到video，从其他DOM元素中获取
      if (!video) {
        // 从标注场景的DOM元素中获取
        const markingRtElement = document.getElementById(
          `mst-assist-lecture-video-marking-rt-${ThMeetingStore.lectureInfo.userId}`
        );
        if (markingRtElement) {
          video = markingRtElement.querySelector(
            'video'
          ) as HTMLVideoElement | null;
        }

        // 如果还是没有获取到，从实时画面DOM元素中获取
        if (!video) {
          const markingElement = document.getElementById(
            `mst-assist-lecture-video-marking-${ThMeetingStore.lectureInfo.userId}`
          );
          if (markingElement) {
            video = markingElement.querySelector(
              'video'
            ) as HTMLVideoElement | null;
          }
        }
      }

      const canvas = canvasElement.value;
      if (!video || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 设置 canvas 的宽高与视频保持一致
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // 获取视频流
      const videoStream = video.captureStream();

      // 获取音频流，用户麦克风音频
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // 合并音频轨道到视频流中
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(), // 添加视频轨道
        ...audioStream.getAudioTracks(), // 添加音频轨道
      ]);
      // todo 调优码率
      const optimizedConfig = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2.5 * 1024 * 1024,
        // 编码器调优参数
        encoderConfig: {
          latencyMode: 'realtime', // 低延迟模式
          complexity: 6, // 中等复杂度(0-10)
          frameRate: 30, // 建议限制最高帧率
        },
      };
      // todo 安全的配置，防止浏览器崩溃录制失败
      const safeConfig = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2 * 1024 * 1024, // 保守起见的码率
        audioBitsPerSecond: 128 * 1024, // 音频码率
        bitsPerSecond: 2 * 1024 * 1024, // 总码率(可选)
      };
      // 创建 MediaRecorder
      mediaRecorder = new MediaRecorder(combinedStream, optimizedConfig);
      const chunks: Blob[] = [];

      // 当有数据可用时保存数据
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      // 当录制停止时，处理录制数据
      mediaRecorder.onstop = () => {
        handleRecordDownload(chunks);
      };

      // 开始录制
      handleRecordingStart();
    } catch (error) {
      // 错误处理
      handleRecordingClose();
    } finally {
      // 更新录制状态和开始时间
      ThMeetingStore.updateIsRecord(true);
      recordStartTime.value = Date.now();
      handleCalculateRecordTime();
    }
  };
  // 标注业务
  let handlePrintAllLines: any; // 绘制所有线条

  const handleCloseBoard = () => {
    handleRecordingClose();
    AssistCanvasSet?.cleanup();
    drawingUser.value = [];
    switch (ThMeetingStore.scene) {
      case 1:
        msg.success(t('mst.message.board.close.draw'));
        ThImEvent.sendAssistDrawingBoardCloseEvent({
          meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        });
        break;
      case 2:
        msg.success(t('mst.message.board.close.screen'));
        ThImEvent.sendAssistScreenFrozenCloseEvent({
          meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        });
        break;
      case 3:
        msg.success(t('mst.message.board.close.flash'));
        handleFlashSceneClose();
        ThImEvent.sendAssistFlickerSceneCloseEvent({
          meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        });
        break;

      default:
        break;
    }
    ThMeetingStore.updateScene(0);
  };
  const handleBoardCloseModalOpen = () => {
    boardCloseVisible.value = true;
  };
  const handleBoardCloseModalClose = () => {
    boardCloseVisible.value = false;
  };
  const handleBoardCloseModalSure = () => {
    ThMeetingStore.clearBoardStatus();
    boardCanvasStyle.value.left = `0px`;
    boardCanvasStyle.value.top = `0px`;
    handleBoardCloseModalClose();
    handleCloseBoard();
    ThMeetingStore.lectureInfo.activeScreenLayout = '';
    if (ThMeetingStore.lectureInfo.userId === ThMeetingStore.mineInfo.userId) {
      //   将自己的视屏渲染到新的id容器上
      handleLocalVideoTrack();
    } else {
      //  将别人的视屏渲染到新的id容器上
      handleChangeLecture();
    }
    // 关闭标注弹出grid的视频
    nextTick(() => {
      gridContainerRef.value?.handleRenderGridVideo();
    });
  };

  // 初始化标注CRDT集合
  const handleInitAssistCanvasSet = () => {
    AssistCanvasSet = new AssistCanvasDrawingSet();
  };
  // 清除CRDT数据集合
  const handleClearAssistCanvasSet = () => {
    AssistCanvasSet?.cleanup();
    AssistCanvasSet = null;
  };
  const handleDrawAllUserSet = () => {
    const allLineList: any = ref(Array.from(AssistCanvasSet?.lookup()));
    handlePrintAllLines(allLineList.value, 'reset');
  };

  const boardCanvasMainStyle = computed(() => {
    // 计算宽高，确保按16:9比例
    let width: any;
    let height: any;
    if (ThMeetingStore.scene !== 3) {
      const videoWidth = assistContainerRef?.value?.clientWidth;
      const videoHeight = assistContainerRef?.value?.clientHeight;
      const aspectRatio = 16 / 9;
      if (videoWidth / videoHeight > aspectRatio) {
        // 如果视频的宽高比大于16:9，则以视频高度为基准
        if (ThMeetingStore.lectureInfo?.activeScreenLayout === 2) {
          width = videoWidth / 2;
          height = videoWidth / (aspectRatio * 2);
        } else {
          height = videoHeight;
          width = height * aspectRatio;
        }
      } else {
        // 否则，以视频宽度为基准
        width =
          ThMeetingStore.lectureInfo?.activeScreenLayout === 2
            ? videoWidth / 2
            : videoWidth;
        height = width / aspectRatio;
      }
    } else {
      width = lectureVideoRef?.value?.clientWidth;
      height = lectureVideoRef?.value?.clientHeight;
    }
    return {
      width: `${Math.floor(width)}px`,
      height: `${Math.floor(height)}px`,
    };
  });
  // 重新渲染 Canvas，考虑拖拽的偏移量
  const renderCanvas = () => {
    if (!boardCtx || !boardCanvasRef.value) return;
    // 左侧偏移量limitLeft - 0
    const limitLeft =
      boardCanvasMainRef.value.clientWidth - boardCanvasRef.value.width;
    // 上侧偏移量limitTop  - 0
    const limitTop =
      boardCanvasMainRef.value.clientHeight - boardCanvasRef.value.height;
    let offset = {
      x: ThMeetingStore.boardStatus.offset.x,
      y: ThMeetingStore.boardStatus.offset.y,
    };
    if (ThMeetingStore.boardStatus.scale !== 1) {
      if (offset.x < limitLeft) {
        offset.x = limitLeft;
      } else if (offset.x > 0) {
        offset.x = 0;
      }
      if (offset.y < limitTop) {
        offset.y = limitTop;
      } else if (offset.y > 0) {
        offset.y = 0;
      }
    } else {
      offset = {
        x: 0,
        y: 0,
      };
    }
    boardCanvasStyle.value.left = `${offset.x}px`;
    boardCanvasStyle.value.top = `${offset.y}px`;
    ThMeetingStore.updateBoardStatusOffset(offset);
    ThImEvent.sendAssistCanvasChangeEvent({
      meetingNo: ThMeetingStore.meetingInfo.meetingNo,
      scale: ThMeetingStore.boardStatus.scale.toString(),
      offsetX: ThMeetingStore.boardStatus.offset.x.toString(),
      offsetY: ThMeetingStore.boardStatus.offset.y.toString(),
      screenWidth: boardCanvasRef.value.width.toString(),
      screenHeight: boardCanvasRef.value.height.toString(),
      timestamp: Date.now(),
    });
  };
  // 居中显示 canvas
  const centerCanvas = () => {
    if (!boardCanvasRef.value || !boardCanvasMainRef.value) return;

    const containerWidth = boardCanvasMainRef.value.clientWidth;
    const containerHeight = boardCanvasMainRef.value.clientHeight;

    const canvasWidth = boardCanvasRef.value.width;
    const canvasHeight = boardCanvasRef.value.height;

    // 计算居中位置
    const left =
      (containerWidth - canvasWidth) / 2 + ThMeetingStore.boardStatus.offset.x;
    const top =
      (containerHeight - canvasHeight) / 2 +
      ThMeetingStore.boardStatus.offset.y;

    // 设置 canvas 的位置
    boardCanvasStyle.value.left = `${left}px`;
    boardCanvasStyle.value.top = `${top}px`;
    ThMeetingStore.updateBoardStatusOffset({
      x: left,
      y: top,
    });
  };

  // 初始化Canvas
  const handleInitCanvas = () => {
    console.log('handleInitCanvas', boardCanvasMainRef.value);
    if (!boardCanvasRef.value) {
      console.log('boardCanvasRef-不存在', boardCanvasRef.value);
      return;
    }
    const canvasWidth = boardCanvasMainRef.value.clientWidth;
    const canvasHeight = boardCanvasMainRef.value.clientHeight;
    console.log(
      '初始化Canvas',
      canvasWidth,
      canvasHeight,
      ThMeetingStore.boardStatus.scale
    );
    boardCanvasRef.value.width = Math.floor(
      canvasWidth * ThMeetingStore.boardStatus.scale
    );
    boardCanvasRef.value.height = Math.floor(
      canvasHeight * ThMeetingStore.boardStatus.scale
    );

    boardCtx = boardCanvasRef.value?.getContext('2d');
    if (!boardCtx) {
      console.log('boardCtx-不存在', boardCanvasRef.value);
      return;
    }
    // 清空并重新绘制画布内容
    boardCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    boardCanvasImages.value = [];
    handleDrawAllUserSet();
  };
  // 初始化画板Canvas底图
  const handleRenderBoardBgImgCanvas = (type?: string) => {
    if (boardCtx) {
      boardCanvasImages.value = [];
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.src = ThMeetingStore.boardStatus.baseMap; // 替换成你的图片路径
      console.log('img.src', img.src);
      img.onload = async () => {
        if (type === 'shotScreen') {
          boardCtx.clearRect(
            0,
            0,
            boardCanvasRef.value.width,
            boardCanvasRef.value.height
          );
          boardCtx.drawImage(
            img,
            0,
            0,
            boardCanvasRef.value.width,
            boardCanvasRef.value.height
          );
          boardCanvasImages.value.push({
            img,
            offsetX: 0,
            offsetY: 0,
            drawWidth: boardCanvasRef.value.width,
            drawHeight: boardCanvasRef.value.height,
          });
        } else {
          const canvasWidth = boardCanvasRef.value.width;
          const canvasHeight = boardCanvasRef.value.height;
          const imgWidth = img.width;
          const imgHeight = img.height;

          let drawWidth = imgWidth;
          let drawHeight = imgHeight;
          let offsetX = 0;
          let offsetY = 0;
          const widthRatio = canvasWidth / imgWidth;
          const heightRatio = canvasHeight / imgHeight;
          const ratio = Math.min(widthRatio, heightRatio);

          drawWidth = imgWidth * ratio;
          drawHeight = imgHeight * ratio;
          // 计算居中偏移量
          offsetX = (canvasWidth - drawWidth) / 2;
          offsetY = (canvasHeight - drawHeight) / 2;
          // 清除画布，绘制图片
          boardCtx.clearRect(0, 0, canvasWidth, canvasHeight);
          boardCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          boardCanvasImages.value.push({
            img,
            offsetX,
            offsetY,
            drawWidth,
            drawHeight,
          });
        }

        handleDrawAllUserSet();
      };
      img.onerror = (err) => {
        console.error('Failed to load image', err);
      };
    }
  };
  // 初始化闪点
  const handleInitFlashingCanvas = async () => {
    if (!boardCanvasRef.value) {
      console.log('boardCanvasRef-不存在', boardCanvasRef.value);
      return;
    }
    await sleep(1000 * 0.3);
    boardCanvasRef.value.width = toNumber(
      lectureVideoRef.value.style.width.substring(
        0,
        lectureVideoRef.value.style.width.length - 2
      )
    );
    boardCanvasRef.value.height = toNumber(
      lectureVideoRef.value.style.height.substring(
        0,
        lectureVideoRef.value.style.height.length - 2
      )
    );
    boardCtx = boardCanvasRef.value?.getContext('2d');
    boardCtx.clearRect(
      0,
      0,
      boardCanvasRef.value.width,
      boardCanvasRef.value.height
    );
    centerCanvas();
  };

  const toogleTransState = () => {
    ThMeetingStore.roomTranslateInfo.open = !ThMeetingStore?.roomTranslateInfo?.open
  }
  // todo 点击翻译按钮
  const handleTransLate = () => {
    // - 关闭状态下
    // - 点击后显示弹窗，选择我的语言，以及词库
    // - 开启状态下点击图标，操作为关闭
    // - 点击右侧语言弹出字幕翻译的弹窗
    ThMeetingStore.lectureInfo.transState = {
      transModalVisible: !ThMeetingStore.lectureInfo?.transState?.transModalVisible,
    };
  }
  // todo 切换布局 重新绘制所有线条
  const handleCanvasLayout = (aKey: number) => {
    ThMeetingStore.lectureInfo.activeScreenLayout = aKey;
    renderCanvas();
    nextTick(() => {
      handleInitCanvas();
      handleRenderBoardBgImgCanvas();
      if (
        ThMeetingStore.lectureInfo.userId === ThMeetingStore.mineInfo.userId
      ) {
        //   将自己的视屏渲染到新的id容器上
        handleLocalVideoTrack();
      } else {
        //  将别人的视屏渲染到新的id容器上
        handleChangeLecture();
      }
    });
  };
  // 重置Canvas
  const resetCanvas = async () => {
    if (boardCtx && boardCanvasRef.value) {
      boardCtx.clearRect(
        0,
        0,
        boardCanvasRef.value.width,
        boardCanvasRef.value.height
      );
      if (ThMeetingStore.boardStatus.baseMap && boardCanvasImages.value[0]) {
        const { img, offsetX, offsetY, drawWidth, drawHeight } =
          boardCanvasImages.value[0];
        boardCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
      handleDrawAllUserSet();
    }
  };
  // 状态同步-接收到画板开启
  const handleAssistDrawingBoardOpenedEvent = async (data: any) => {
    console.log('接收到画板开启---', data);
    if (
      PB.Client.SERVER === data.source &&
      data.operator === ThMeetingStore.mineInfo.userId &&
      ThMeetingStore.scene !== 1
    ) {
      ThImEvent.sendAssistDrawingBoardCloseEvent({
        meetingNo: ThMeetingStore.meetingInfo?.meetingNo,
      });
      return;
    }
    const anchor = await ThMeetingStore.filterMemberInfo(data.anchor);
    // msg.warning(`${anchor.name} ${t('mst.message.board.open.draw')}`);
    await ThMeetingStore.updateScene(1);
    ThMeetingStore.updateAnchor(anchor);
    if (ThMeetingStore.lectureInfo.userId !== data.operator) {
      const lectureInfo = await ThMeetingStore.filterRoomAssistMemberInfo(
        data.operator
      );
      console.log('接收到画板开启---', lectureInfo);
      await ThMeetingStore.updateLectureInfo(lectureInfo);
      curLectureInfo.value = JSON.parse(
        JSON.stringify(ThMeetingStore.lectureInfo)
      );
    }
    // todo 设置冻屏状态 开始视频轨道
    ThMeetingStore.lectureInfo.activeScreenLayout = 1;
    if (ThMeetingStore.lectureInfo.userId === ThMeetingStore.mineInfo.userId) {
      //   将自己的视屏渲染到新的id容器上
      nextTick(() => {
        handleLocalVideoTrack();
      });
    } else {
      //  将别人的视屏渲染到新的id容器上
      nextTick(() => {
        handleChangeLecture();
      });
    }
    handleInitAssistCanvasSet();
    await sleep(1000 * 0.3);
    handleInitCanvas();
    // 更新grid
    gridContainerRef.value?.handleRenderGridVideo();
  };
  // 接收到画板关闭
  const handleAssistDrawingBoardClosedEvent = async (data: any) => {
    if (data.anchor === ThMeetingStore.mineInfo.userId) {
      return;
    }
    ThMeetingStore.lectureInfo.activeScreenLayout = '';

    const anchor = await ThMeetingStore.filterMemberInfo(data.anchor);
    if (ThMeetingStore.scene === 1) {
      msg.warning(`${anchor.name} ${t('mst.message.board.close.draw')}`);
    }
    await ThMeetingStore.updateScene(0);
    boardCanvasStyle.value.left = `0px`;
    boardCanvasStyle.value.top = `0px`;
    ThMeetingStore.clearBoardStatus();
    ThMeetingStore.updateAnchor(null);
    handleClearAssistCanvasSet();
    handleRecordingClose();
    ThMeetingStore.lectureInfo.activeScreenLayout = '';
    handleBoardCloseModalSure();
  };

  // 画板弹窗

  const handleBoardDrawingModalClose = () => {
    boardDrawingVisible.value = false;
  };
  const handleBoardDrawingModalSure = async () => {
    handleBoardDrawingModalClose();
    ThImEvent.sendAssistDrawingBoardOpenEvent({
      meetingNo: ThMeetingStore.meetingInfo.meetingNo,
      operator: ThMeetingStore.lectureInfo.userId,
    });
    // await ThMeetingStore.updateScene(1);
    // handleInitAssistCanvasSet();
    // handleInitCanvas();
  };
  // todo 标注>>>>>>> 画板开启
  const handleOpenDrawBoard = async () => {
    // boardDrawingVisible.value = true;
    if (ThMeetingStore.sceneDisabled) {
      msg.warning(t('mst.scene.opening.tip'));
      return;
    }
    handleBoardDrawingModalSure();
    // todo 设置冻屏状态 开始视频轨道
    ThMeetingStore.lectureInfo.activeScreenLayout = 1;
    if (ThMeetingStore.lectureInfo.userId === ThMeetingStore.mineInfo.userId) {
      //   将自己的视屏渲染到新的id容器上
      nextTick(() => {
        handleLocalVideoTrack();
      });
    } else {
      //  将别人的视屏渲染到新的id容器上
      nextTick(() => {
        handleChangeLecture();
      });
    }
  };
  // 状态同步-接收到冻屏开启
  const handleAssistScreenFrozenOpenedEvent = async (data: any) => {
    if (
      PB.Client.SERVER === data.source &&
      data.operator === ThMeetingStore.mineInfo.userId &&
      ThMeetingStore.scene !== 2
    ) {
      ThImEvent.sendAssistScreenFrozenCloseEvent({
        meetingNo: ThMeetingStore.meetingInfo?.meetingNo,
      });
      return;
    }
    const anchor = await ThMeetingStore.filterMemberInfo(data.anchor);
    // msg.warning(`${anchor.name} ${t('mst.message.board.open.screen')}`);

    ThMeetingStore.updateAnchor(anchor);
    if (ThMeetingStore.lectureInfo.userId !== data.operator) {
      const lectureInfo = await ThMeetingStore.filterRoomAssistMemberInfo(
        data.operator
      );
      await ThMeetingStore.updateLectureInfo(lectureInfo);
      curLectureInfo.value = JSON.parse(
        JSON.stringify(ThMeetingStore.lectureInfo)
      );
    }
    ThMeetingStore.updateBoardStatusBaseMap(data.imageUrl);
    await ThMeetingStore.updateScene(2);
    // todo 设置冻屏状态 开始视频轨道
    ThMeetingStore.lectureInfo.activeScreenLayout = 1;

    if (ThMeetingStore.lectureInfo.userId === ThMeetingStore.mineInfo.userId) {
      //   将自己的视屏渲染到新的id容器上
      nextTick(() => {
        handleLocalVideoTrack();
      });
    } else {
      //  将别人的视屏渲染到新的id容器上
      nextTick(() => {
        handleChangeLecture();
      });
    }

    handleInitAssistCanvasSet();
    await sleep(1000 * 0.3);
    handleInitCanvas();
    handleRenderBoardBgImgCanvas('shotScreen');
  };
  // 接收到冻屏关闭事件
  const handleAssistScreenFrozenClosedEvent = async (data: any) => {
    if (data.anchor === ThMeetingStore.mineInfo.userId) {
      return;
    }
    ThMeetingStore.lectureInfo.activeScreenLayout = '';

    const anchor = await ThMeetingStore.filterMemberInfo(data.anchor);
    if (ThMeetingStore.scene === 2) {
      msg.warning(`${anchor.name} ${t('mst.message.board.close.screen')}`);
    }
    await ThMeetingStore.updateScene(0);
    ThMeetingStore.updateAnchor(null);
    boardCanvasStyle.value.left = `0px`;
    boardCanvasStyle.value.top = `0px`;
    ThMeetingStore.clearBoardStatus();
    handleClearAssistCanvasSet();
    handleRecordingClose();
    handleBoardCloseModalSure();
  };
  const handleBoardScreenModalClose = () => {
    boardScreenVisible.value = false;
  };
  const handleBoardScreenModalSure = async () => {
    handleBoardScreenModalClose();
    // 发送冻屏业务信令
    ThImEvent.sendAssistScreenFrozenOpenEvent({
      meetingNo: ThMeetingStore.meetingInfo.meetingNo,
      operator: ThMeetingStore.lectureInfo.userId,
      imageUrl: ThMeetingStore.boardStatus.baseMap,
    });
    // await ThMeetingStore.updateScene(2);
    // handleInitAssistCanvasSet();
    // handleInitCanvas();
    // handleRenderBoardBgImgCanvas('shotScreen');
  };
  // 冻屏开启
  const handleOpenScreenBoard = async () => {
    if (ThMeetingStore.sceneDisabled) {
      msg.warning(t('mst.scene.opening.tip'));
      return;
    }
    try {
      ThMeetingStore.updateSceneDisabled(true);
      ThMeetingStore.updateUploadFileStatus(true);
      if (!ThMeetingStore.lectureInfo.hasVideo) {
        msg.warning(t('mst.menu.dongPing.msg.error'));
        throw new Error('noHasVideo');
      }
      const lectureHtml: any = document.querySelector(
        `[id*=mst-assist-lecture-video-${ThMeetingStore.lectureInfo.userId}]`
      );
      if (!lectureHtml) {
        msg.warning(t('mst.menu.dongPing.msg.error2'));
        throw new Error('noLectureHtml');
      }
      const video: any = lectureHtml.querySelector(
        'video'
      ) as HTMLVideoElement | null;
      if (!video) {
        msg.warning(t('mst.menu.dongPing.msg.error2'));
        throw new Error('noVideo');
      }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx: any = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Data = canvas.toDataURL('image/jpeg', 1.0); // 封装blob对
      const blob = dataURItoBlob(base64Data);
      // 冻屏开启上传
      const nowMillisecond = getMillisecond();
      const cosConfigRes = await ThImEvent.uploadCosConfig();
      if (cosConfigRes.code !== 200) {
        msg.error(t('mst.message.board.menu.scdt.msg1'));
        throw new Error('cosConfigRes error');
      }
      const { uploadFile } = useCos({
        ...cosConfigRes.data,
        basicPath: `${cosConfigRes.data.basicPath}meeting/${ThMeetingStore.meetingInfo.meetingNo}/Screenshot/`,
      });
      const uploadRes = await uploadFile(
        blob,
        `ShotScreen${nowMillisecond}.png`
      );
      if (uploadRes.statusCode !== 200) {
        msg.warning(t('mst.menu.dongPing.msg.error2'));
        throw new Error('uploadRes error');
      }
      ThMeetingStore.updateBoardStatusBaseMap(uploadRes.Location);
      // boardScreenVisible.value = true;
      handleBoardScreenModalSure();

      // todo 设置冻屏状态 开始视频轨道
      ThMeetingStore.lectureInfo.activeScreenLayout = 1;
      if (
        ThMeetingStore.lectureInfo.userId === ThMeetingStore.mineInfo.userId
      ) {
        //   将自己的视屏渲染到新的id容器上
        nextTick(() => {
          handleLocalVideoTrack();
        });
      } else {
        //  将别人的视屏渲染到新的id容器上
        nextTick(() => {
          handleChangeLecture();
        });
      }
    } catch (error: any) {
      console.log(error);
      if (error.message === 'upload-timeout') {
        msg.error(t('mst.message.board.menu.scdt.msg1'));
      }
    } finally {
      ThMeetingStore.updateUploadFileStatus(false);
      ThMeetingStore.updateSceneDisabled(false);
    }
  };

  // 状态同步-接收到闪点场景开启事件
  const handleAssistFlickerSceneOpenedEvent = async (data: any) => {
    if (
      PB.Client.SERVER === data.source &&
      data.operator === ThMeetingStore.mineInfo.userId &&
      ThMeetingStore.scene !== 3
    ) {
      ThImEvent.sendAssistFlickerSceneCloseEvent({
        meetingNo: ThMeetingStore.meetingInfo?.meetingNo,
      });
      return;
    }
    const anchor = await ThMeetingStore.filterMemberInfo(data.anchor);
    // msg.warning(`${anchor.name} ${t('mst.message.board.open.flash')}`);

    ThMeetingStore.updateAnchor(anchor);
    ThMeetingStore.updateDrawStyleType(4);
    if (ThMeetingStore.lectureInfo.userId !== data.operator) {
      const lectureInfo = await ThMeetingStore.filterRoomAssistMemberInfo(
        data.operator
      );
      await ThMeetingStore.updateLectureInfo(lectureInfo);
      curLectureInfo.value = JSON.parse(
        JSON.stringify(ThMeetingStore.lectureInfo)
      );
    }
    handleInitAssistCanvasSet();
    await ThMeetingStore.updateScene(3);
    await handleInitFlashingCanvas();
    requestAnimationFrame(updateFlashPoints);
    // 布局改为和冻屏一致
    ThMeetingStore.lectureInfo.activeScreenLayout = 1;
  };
  // 接收到其他人关闭闪点场景事件
  const handleAssistFlickerSceneClosedEvent = async (data: any) => {
    if (data.anchor === ThMeetingStore.mineInfo.userId) {
      return;
    }
    const anchor = await ThMeetingStore.filterMemberInfo(data.anchor);
    if (ThMeetingStore.scene === 3) {
      msg.warning(`${anchor.name} ${t('mst.message.board.close.flash')}`);
    }
    handleFlashSceneClose();
    ThMeetingStore.lectureInfo.activeScreenLayout = '';
  };
  handleFlashSceneClose = async () => {
    await ThMeetingStore.updateScene(0);
    ThMeetingStore.clearDrawStyle();
    ThMeetingStore.updateAnchor(null);
    if (flashAnimationFrame) {
      cancelAnimationFrame(flashAnimationFrame);
      flashAnimationFrame = null;
    }
    handleRecordingClose();
  };
  // 发起闪点场景modal-关闭
  const handleBoardFlashModalClose = () => {
    boardFlashVisible.value = false;
  };
  // 发起闪点场景modal-确认
  const handleBoardFlashModalSure = async () => {
    handleBoardFlashModalClose();
    ThImEvent.sendAssistFlickerSceneOpenEvent({
      meetingNo: ThMeetingStore.meetingInfo.meetingNo,
      operator: ThMeetingStore.lectureInfo.userId,
    });
    // handleInitAssistCanvasSet();
    // ThMeetingStore.updateDrawStyleType(4);
    // await ThMeetingStore.updateScene(3);
    // 发送闪点业务信令
    await handleInitFlashingCanvas();
    requestAnimationFrame(updateFlashPoints);
  };
  // 发起闪点场景modal-开启
  const handleSceneOpenFlashBoard = () => {
    if (ThMeetingStore.sceneDisabled) {
      msg.warning(t('mst.scene.opening.tip'));
      return;
    }
    if (!ThMeetingStore.lectureInfo.hasVideo) {
      msg.warning(t('mst.menu.dongPing.msg.error'));
      return;
    }
    // 布局改为和冻屏一致
    ThMeetingStore.lectureInfo.activeScreenLayout = 1;
    // boardFlashVisible.value = true;
    handleBoardFlashModalSure();
  };
  // 抓屏-主播场景
  const handleSceneCaptureLectureVideo = async () => {
    try {
      ThMeetingStore.updateUploadFileStatus(true);
      if (!ThMeetingStore.lectureInfo.hasVideo) {
        msg.warning(t('mst.menu.zuaPing.msg.error1'));
        throw new Error('noHasVideo');
      }
      const lectureHtml: any = document.querySelector(
        `[id*=mst-assist-lecture-video-${ThMeetingStore.lectureInfo.userId}]`
      );
      if (!lectureHtml) {
        msg.warning(t('mst.menu.dongPing.msg.error2'));
        throw new Error('noLectureHtml');
      }
      const video: any = lectureHtml.querySelector(
        'video'
      ) as HTMLVideoElement | null;
      if (!video) {
        msg.warning(t('mst.menu.dongPing.msg.error2'));
        throw new Error('noVideo');
      }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx: any = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Data = canvas.toDataURL('image/jpeg', 1.0); // 封装blob对
      const blob = dataURItoBlob(base64Data);
      // 主播画面开启上传
      const nowMillisecond = getMillisecond();
      const cosConfigRes = await ThImEvent.uploadCosConfig();
      if (cosConfigRes.code !== 200) {
        msg.error(t('mst.message.board.menu.scdt.msg1'));
        throw new Error('cosConfigRes error');
      }
      const { uploadFile } = useCos({
        ...cosConfigRes.data,
        basicPath: `${cosConfigRes.data.basicPath}meeting/${ThMeetingStore.meetingInfo.meetingNo}/Screenshot/`,
      });
      const uploadRes = await uploadFile(
        blob,
        `ShotScreen${nowMillisecond}.png`
      );
      if (uploadRes.statusCode !== 200) {
        msg.warning(t('mst.menu.dongPing.msg.error2'));
        throw new Error('uploadRes error');
      }
      const res = await ThImEvent.uploadShotScreen({
        meetingId: ThMeetingStore.meetingInfo.meetingId,
        screenshotUrl: uploadRes.Location,
      });
      if (res.code !== 200 && res.code !== 401) {
        msg.error(res.msg);
        return;
      }
      msg.success(t('mst.message.board.menu.scdt.msg3'));
    } catch (error: any) {
      console.log(error);
    } finally {
      ThMeetingStore.updateUploadFileStatus(false);
    }
  };
  // 开启屏幕分享
  const handleSceneOpenShareScreen = async () => {
    if (ThMeetingStore.sceneDisabled) {
      msg.warning(t('mst.scene.opening.tip'));
      return;
    }
    try {
      if (ThMeetingStore.roomMenuOptions.video) {
        ThMeetingStore.updateRoomMenuOptionsVideo(false);
        ThMeetingStore.updateLectureInfo({
          ...ThMeetingStore.mineInfo,
          hasAudio: ThMeetingStore.roomMenuOptions.audio,
          hasVideo: false,
        });
        curLectureInfo.value = JSON.parse(
          JSON.stringify(ThMeetingStore.lectureInfo)
        );
        handleCloseCamera();
      }
      ThMeetingStore.updateIsShareScreen(true);
      if (sceneMenuRef.value) {
        sceneMenuRef.value.shareScreenMenu.status = true;
      }
      ThImEvent.sendAssistShareScreenOpenEvent({
        meetingNo: ThMeetingStore.meetingInfo.meetingNo,
      });

      ThMeetingStore.updateLectureInfo({
        ...ThMeetingStore.mineInfo,
        hasAudio: ThMeetingStore.roomMenuOptions.audio,
        hasVideo: true,
      });
      curLectureInfo.value = JSON.parse(
        JSON.stringify(ThMeetingStore.lectureInfo)
      );
      await ThRtcClient.createScreenVideoTrack();
      await ThRtcClient.localScreenTrackPush();
      ThRtcClient.renderLocalScreenStreams(
        `mst-assist-lecture-video-${ThMeetingStore.lectureInfo.userId}`
      );

      // 更新grid
      gridContainerRef.value?.handleRenderGridVideo();
    } catch (error) {
      console.log(error);
    }
  };
  // 关闭屏幕分享
  handleSceneCloseShareScreen = () => {
    if (ThMeetingStore.sceneDisabled) {
      msg.warning(t('mst.scene.opening.tip'));
      return;
    }
    ThImEvent.sendAssistShareScreenCloseEvent({
      meetingNo: ThMeetingStore.meetingInfo.meetingNo,
    });

    ThMeetingStore.updateIsShareScreen(false);
    ThMeetingStore.updateLectureInfo({
      ...ThMeetingStore.mineInfo,
      hasAudio: ThMeetingStore.roomMenuOptions.audio,
      hasVideo: false,
    });
    curLectureInfo.value = JSON.parse(
      JSON.stringify(ThMeetingStore.lectureInfo)
    );
    if (sceneMenuRef.value) {
      sceneMenuRef.value.shareScreenMenu.status = false;
    }
    ThRtcClient.closeScreenVideoTrack();
  };
  // 状态同步-接收到屏幕分享
  const handleAssistShareScreenOpenedEvent = async (data: any) => {
    if (
      PB.Client.SERVER === data.source &&
      data.anchor === ThMeetingStore.mineInfo.userId &&
      !ThMeetingStore.isShareScreen
    ) {
      ThImEvent.sendAssistShareScreenCloseEvent({
        meetingNo: ThMeetingStore.meetingInfo?.meetingNo,
      });
      return;
    }
    console.log('开始屏幕分享', data);
    if (data.anchor === ThMeetingStore.mineInfo.userId) {
      return;
    }
    // if (ThMeetingStore.isShareScreen) {
    //   handleSceneCloseShareScreen();
    // }
    const member = await ThMeetingStore.filterRoomAssistMemberInfo(data.anchor);
    // msg.warning(`${member?.name} ${t('mst.menu.shareScreen.msg.success1')}`);
    await ThMeetingStore.updateIsShareScreen(true);
    ThMeetingStore.updateLectureInfo(member);
    curLectureInfo.value = JSON.parse(
      JSON.stringify(ThMeetingStore.lectureInfo)
    );
    // 更新grid
    gridContainerRef.value?.handleRenderGridVideo();
  };
  const handleAssistShareScreenClosedEvent = async (data: any) => {
    if (!data.anchor) {
      console.log('分享屏幕关闭-anchor 为空', data);
      return;
    }
    if (data.anchor === ThMeetingStore.mineInfo.userId) {
      return;
    }
    const member = await ThMeetingStore.filterRoomAssistMemberInfo(data.anchor);
    if (ThMeetingStore.isShareScreen) {
      msg.warning(`${member?.name} ${t('mst.menu.shareScreen.msg.success2')}`);
    }
    ThMeetingStore.updateIsShareScreen(false);
  };
  // 撤销线条
  const handleBoardUndo = () => {
    const lastLine = AssistCanvasSet.removeLastLineByAnchor(
      ThMeetingStore.mineInfo.userId
    );
    resetCanvas();
    ThImEvent.sendBoardUndo(lastLine);
  };
  // 清空线条弹窗
  const handleBoardClear = () => {
    boardClearVisible.value = true;
  };
  const handleBoardClearModalClose = () => {
    boardClearVisible.value = false;
  };
  const handleBoardClearModalSure = () => {
    handleBoardClearModalClose();
    // 发送清空业务信令

    ThImEvent.sendBoardClear(
      ThMeetingStore.meetingInfo.masterId === ThMeetingStore.mineInfo.userId
    );
  };
  // 画板上传底图
  const handleBoardUploadMap = (data: any) => {
    ThMeetingStore.updateBoardStatusBaseMap(data.Location);
    ThImEvent.sendCanvasImageChanged(data.Location.toString());
    handleRenderBoardBgImgCanvas();
  };
  // 清除画板底图
  const handleBoardUploadMapClear = () => {
    ThMeetingStore.updateBoardStatusBaseMap('');
    ThImEvent.sendCanvasImageChanged('');
    handleInitCanvas();
  };
  // 接收远端设置画板标注底图
  const handleAssistCanvasImageChangedEvent = async (data: any) => {
    console.log('接收远端设置画板标注底图', data, ThMeetingStore.mineInfo);
    if (ThMeetingStore.mineInfo.userId !== data.anchor) {
      if (data.imageUrl) {
        handleInitCanvas();
        await sleep(500);
        await ThMeetingStore.updateBoardStatusBaseMap(data.imageUrl);
        handleRenderBoardBgImgCanvas();
        boardMenuRef.value.handleChangeScdtMenuStatus(true);
      } else {
        boardMenuRef.value.handleChangeScdtMenuStatus(false);
        ThMeetingStore.updateBoardStatusBaseMap('');
        handleInitCanvas();
      }
    }
  };

  const isDrawing = ref(false);
  const isMoveDown = ref(false);
  const X = ref();
  const Y = ref();
  const X1 = ref();
  const Y1 = ref();
  const startX = ref();
  const startY = ref();
  const lineList: any = ref([]);
  const currentWeight: any = ref();
  const lineUuid: any = ref('');
  const currentColor: any = ref();
  // 实时标注人员信息
  const handleDrawingUser = async (userId: number, x?: number, y?: number) => {
    console.log('实时标注人员信息', userId, x, y);
    const existingMemberIndex = drawingUser.value.findIndex(
      (member: any) => member.userId === userId
    );
    if (existingMemberIndex === -1) {
      const user: any = await ThMeetingStore.filterMemberInfo(userId);
      drawingUser.value.push(user);
    } else if (ThMeetingStore.scene !== 3) {
      drawingUser.value[existingMemberIndex] = {
        ...drawingUser.value[existingMemberIndex],
        left: x + ThMeetingStore.boardStatus.offset.x + 34,
        top: y + ThMeetingStore.boardStatus.offset.y + 34,
      };
    } else if (x && y) {
      const rectX =
        (lectureVideoRef.value.clientWidth -
          boardCanvasMainRef.value.clientWidth) /
        2;
      const rectY =
        (lectureVideoRef.value.clientHeight -
          boardCanvasMainRef.value.clientHeight) /
        2;
      drawingUser.value[existingMemberIndex] = {
        ...drawingUser.value[existingMemberIndex],
        left: x + ThMeetingStore.boardStatus.offset.x + rectX + 34,
        top: y + ThMeetingStore.boardStatus.offset.y + rectY + 34,
      };
    }
  };
  // 清除实时标人员信息
  const handleRemoveDrawingUser = async (userId: number) => {
    console.log('handleRemoveDrawingUser', userId);
    await sleep(1000 * 1);
    const existingMemberIndex = drawingUser.value.findIndex(
      (member: any) => member.userId === userId
    );
    if (existingMemberIndex !== -1) {
      drawingUser.value.splice(existingMemberIndex, 1);
    }
  };
  const drawLine = (
    x: any,
    y: any,
    x1: any,
    y1: any,
    size: any,
    color: any
  ) => {
    // console.log('drawLine-------------', size, color);
    if (boardCtx) {
      boardCtx.beginPath();
      boardCtx.moveTo(x, y);
      boardCtx.lineWidth = toNumber(size) * ThMeetingStore.boardStatus.scale;
      boardCtx.strokeStyle = color;
      boardCtx.lineCap = 'round';
      boardCtx.lineJoin = 'round';
      boardCtx.lineTo(x1, y1);
      boardCtx.stroke();
    }
  };
  const drawCircle = (
    x: any,
    y: any,
    x1: any,
    y1: any,
    size: any,
    color: any
  ) => {
    if (boardCtx) {
      boardCtx.beginPath();
      // 计算圆心
      const centerX = (x + x1) / 2;
      const centerY = (y + y1) / 2;

      // 计算半径
      const dx = x1 - x;
      const dy = y1 - y;
      const radius = Math.sqrt(dx * dx + dy * dy) / 2;
      boardCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      boardCtx.lineWidth = toNumber(size) * ThMeetingStore.boardStatus.scale;
      boardCtx.strokeStyle = color;
      boardCtx.stroke();
    }
  };
  const drawRect = (
    x: any,
    y: any,
    x1: any,
    y1: any,
    size: any,
    color: any
  ) => {
    if (boardCtx) {
      boardCtx.beginPath();
      const width: any = x1 - x;
      const height: any = y1 - y;
      boardCtx.rect(x, y, width, height);
      // 设置线条的宽度和颜色
      boardCtx.lineWidth = toNumber(size) * ThMeetingStore.boardStatus.scale;
      boardCtx.lineCap = 'round';
      boardCtx.lineJoin = 'round';
      boardCtx.strokeStyle = color;
      boardCtx.stroke();
    }
  };
  const drawArrows = (
    x: any,
    y: any,
    x1: any,
    y1: any,
    size: any,
    color: any
  ) => {
    if (boardCtx) {
      boardCtx.beginPath();
      const l = 10; //
      const a = Math.atan2(y1 - y, x1 - x);
      const x2 = x1 - l * Math.cos(a + (30 * Math.PI) / 180); // θ=30
      const y2 = y1 - l * Math.sin(a + (30 * Math.PI) / 180);
      const x3 = x1 - l * Math.cos(a - (30 * Math.PI) / 180);
      const y3 = y1 - l * Math.sin(a - (30 * Math.PI) / 180);
      boardCtx.moveTo(x, y);
      boardCtx.lineTo(x1, y1);
      boardCtx.moveTo(x2, y2);
      boardCtx.lineTo(x1, y1);
      boardCtx.lineTo(x3, y3);
      boardCtx.lineCap = 'round';
      boardCtx.lineJoin = 'round';
      boardCtx.lineWidth = toNumber(size) * ThMeetingStore.boardStatus.scale;
      boardCtx.strokeStyle = color;
      boardCtx.stroke();
    }
  };

  const drawFlashPoint = (
    x: number,
    y: number,
    size: number,
    opacity: number,
    color: string
  ) => {
    if (boardCtx) {
      boardCtx.beginPath();
      boardCtx.arc(x, y, size, 0, Math.PI * 2); // 绘制一个圆
      boardCtx.fillStyle = color; // 设置填充颜色
      boardCtx.shadowBlur = 10; // 设置阴影模糊半径
      boardCtx.shadowColor = 'rgba(255, 165, 0, 1)'; // 设置阴影颜色
      boardCtx.fill(); // 填充圆
      boardCtx.closePath();
    }
  };

  /**
   * 更新所有闪烁点的状态，并在每一帧重新绘制
   */
  updateFlashPoints = async () => {
    console.log('更新所有闪烁点的状态，并在每一帧重新绘制', updateFlashPoints);
    if (boardCtx && boardCanvasRef.value) {
      // 清空 canvas
      boardCtx.clearRect(
        0,
        0,
        boardCanvasRef.value.width,
        boardCanvasRef.value.height
      );
      // 遍历所有闪烁点
      flashPoints.value.forEach((point: any, index: any) => {
        point.size += 1; // 每一帧增大点的大小
        point.opacity -= 0.1; // 逐渐减小点的透明度
        const penColors = ref(boardMenuRef.value.hbColorList);
        const color = ref('');
        const penItem = penColors.value.find(
          (pen: any) => pen.type === point.color
        );
        color.value = penItem.color;
        drawFlashPoint(
          Math.floor(toNumber(point.x)),
          Math.floor(toNumber(point.y)),
          point.size,
          Math.floor(point.opacity),
          color.value
        ); // 重新绘制点
        // 如果点的大小大于 10 或者透明度小于等于 0，则移除该点
        if (point.size > 10 || point.opacity <= 0) {
          flashPoints.value.splice(index, 1);
        }
      });
      // 使用 requestAnimationFrame 进行下一帧的更新
      await sleep(1000 * 0.05);
      flashAnimationFrame = requestAnimationFrame(updateFlashPoints);
    }
  };

  const requireDrawingUserCursorUrl = (index: number) => {
    return cursorIconList.value[index];
  };
  const isExist = (userId: number) => {
    return drawingUser?.value.some((item: any) => item.userId === userId);
  };

  handlePrintAllLines = async (allLineList: any, type?: string) => {
    console.log('handlePrintAllLines---allLineList', allLineList, type);
    for (let lineIndex = 0; lineIndex < allLineList.length; lineIndex += 1) {
      const lineItem: any = ref(allLineList[lineIndex]);
      const curCoordinates = ref(lineItem.value.points);
      const penColors = ref(boardMenuRef.value.hbColorList);
      const penWeights = ref(boardMenuRef.value.hbWeightList);
      const ratioX =
        boardCanvasRef.value.width / toNumber(lineItem.value.screenWidth);

      const ratioY =
        boardCanvasRef.value.height / toNumber(lineItem.value.screenHeight);
      const weight = ref('');
      const color = ref('');
      const weightItem = penWeights.value.find(
        (pen: any) => pen.type === lineItem.value.width
      );
      weight.value = weightItem.size;
      const penItem = penColors.value.find(
        (pen: any) => pen.type === lineItem.value.color
      );
      color.value = penItem.color;
      if (lineItem.value.type === PB.DrawingType.ARROWS) {
        drawArrows(
          curCoordinates.value[0].x * ratioX,
          curCoordinates.value[0].y * ratioY,
          curCoordinates.value[curCoordinates.value.length - 1].x * ratioX,
          curCoordinates.value[curCoordinates.value.length - 1].y * ratioY,
          weight.value,
          color.value
        );
      } else if (lineItem.value.type === PB.DrawingType.CIRCLE) {
        drawCircle(
          toNumber(curCoordinates.value[0].x) * ratioX,
          toNumber(curCoordinates.value[0].y) * ratioY,
          toNumber(curCoordinates.value[curCoordinates.value.length - 1].x) *
            ratioX,
          toNumber(curCoordinates.value[curCoordinates.value.length - 1].y) *
            ratioY,
          weight.value,
          color.value
        );
      } else if (lineItem.value.type === PB.DrawingType.RECTANGLE) {
        drawRect(
          curCoordinates.value[0].x * ratioX,
          curCoordinates.value[0].y * ratioY,
          curCoordinates.value[curCoordinates.value.length - 1].x * ratioX,
          curCoordinates.value[curCoordinates.value.length - 1].y * ratioY,
          weight.value,
          color.value
        );
      } else if (lineItem.value.type === PB.DrawingType.LINE) {
        // console.log('Line-------------weight-color', weight.value, color.value);
        for (
          let poiIndex = 0;
          poiIndex < curCoordinates.value.length - 1;
          poiIndex += 1
        ) {
          drawLine(
            toNumber(curCoordinates.value[poiIndex].x) * ratioX,
            toNumber(curCoordinates.value[poiIndex].y) * ratioY,
            curCoordinates.value[poiIndex + 1]?.x
              ? toNumber(curCoordinates.value[poiIndex + 1].x) * ratioX
              : 0,
            curCoordinates.value[poiIndex + 1]?.y
              ? toNumber(curCoordinates.value[poiIndex + 1].y) * ratioY
              : 0,
            weight.value,
            color.value
          );
        }
      }
    }
  };

  const drawCurrentLines = async (data: any) => {
    console.log('drawCurrentLines---', data);
    const ratioX = boardCanvasRef.value.width / toNumber(data.screenWidth);

    const ratioY = boardCanvasRef.value.height / toNumber(data.screenHeight);
    const weight = ref('');
    const color = ref('');
    const penColors = ref(boardMenuRef.value.hbColorList);
    const penWeights = ref(boardMenuRef.value.hbWeightList);
    const weightItem = penWeights.value.find(
      (pen: any) => pen.type === data.width
    );
    weight.value = weightItem.size;
    const penItem = penColors.value.find((pen: any) => pen.type === data.color);
    color.value = penItem.color;
    if (!data.finished) {
      if (data.data.length > 0) {
        const x = toNumber(data.data[data.data.length - 1].x) * ratioY;
        const y = toNumber(data.data[data.data.length - 1].y) * ratioY;
        handleDrawingUser(data.anchor, x, y);
        for (let i = 0; i < data.data.length; i += 1) {
          const cItem = data.data[i];
          if (i === data.data.length - 1) {
            return;
          }
          const c1Item = data.data[i + 1];
          drawLine(
            toNumber(cItem.x) * ratioX,
            toNumber(cItem.y) * ratioY,
            toNumber(c1Item.x) * ratioX,
            toNumber(c1Item.y) * ratioY,
            weight.value,
            color.value
          );
        }
      }
    } else {
      handleRemoveDrawingUser(data.anchor);
      if (data.type === PB.DrawingType.RECTANGLE) {
        drawRect(
          data.data[0].x * ratioX,
          data.data[0].y * ratioY,
          data.data[1].x * ratioX,
          data.data[1].y * ratioY,
          weight.value,
          color.value
        );
      } else if (data.type === PB.DrawingType.ARROWS) {
        drawArrows(
          data.data[0].x * ratioX,
          data.data[0].y * ratioY,
          data.data[1].x * ratioX,
          data.data[1].y * ratioY,
          weight.value,
          color.value
        );
      } else if (data.type === PB.DrawingType.CIRCLE) {
        drawCircle(
          data.data[0].x * ratioX,
          data.data[0].y * ratioY,
          data.data[1].x * ratioX,
          data.data[1].y * ratioY,
          weight.value,
          color.value
        );
      }
    }
  };
  const addDrawing = (
    points: any,
    lineType: any,
    finished: boolean,
    timestamp: any
  ) => {
    const drawing = new DrawingData(
      ThMeetingStore.meetingInfo.meetingNo,
      ThMeetingStore.mineInfo.userId,
      lineType,
      lineUuid.value,
      ThMeetingStore.drawStyle.color,
      ThMeetingStore.drawStyle.weight,
      boardCanvasRef.value.width,
      boardCanvasRef.value.height,
      timestamp,
      points,
      finished
    );
    AssistCanvasSet.add(drawing);
  };
  const sendPointScene = (points: any, lineType: any, finished: boolean) => {
    const timestamp = Date.now();
    ThImEvent.sendAssistLineFlickerEvent({
      meetingNo: ThMeetingStore.meetingInfo.meetingNo,
      uuid: lineUuid.value,
      color: ThMeetingStore.drawStyle.color.toString(),
      width: ThMeetingStore.drawStyle.weight.toString(),
      data: points,
      screenWidth: boardCanvasRef.value.width.toString(),
      screenHeight: boardCanvasRef.value.height.toString(),
      finished,
      timestamp,
    });
  };
  const boardCanvasMouseDownAction = (e: any) => {
    if (ThMeetingStore.drawStyle.type === 4) {
      // 闪点场景下-圆点画笔禁用画线
      return;
    }
    // 标注场景-画线-按下
    if (!ThMeetingStore.boardStatus.isDrag && !isMoveDown.value) {
      lineUuid.value = uuidv4();
      isMoveDown.value = true;
      currentWeight.value = boardMenuRef.value.hbWeightList.find(
        (pen: any) => ThMeetingStore.drawStyle.weight === pen.type
      );

      currentColor.value = boardMenuRef.value.hbColorList.find(
        (pen: any) => ThMeetingStore.drawStyle.color === pen.type
      );
      lineList.value = [];
      X.value = e.offsetX;
      Y.value = e.offsetY;
      if (ThMeetingStore.scene !== 3) {
        startX.value = e.offsetX;
        startY.value = e.offsetY;
      }
    }
    if (
      ThMeetingStore.boardStatus.isDrag &&
      !ThMeetingStore.boardStatus.isDragging
    ) {
      ThMeetingStore.updateBoardStatusIsDragging(true);
      ThMeetingStore.updateBoardStatusDragStart({
        x: e.clientX,
        y: e.clientY,
      });
      renderCanvas();
    }
    console.log('boardCanvasMouseDownAction-lineList', lineList.value);
  };
  const boardCanvasMouseMoveAction = async (e: any) => {
    if (ThMeetingStore.drawStyle.type === 4) {
      // 闪点场景下-圆点画笔禁用画线
      return;
    }
    // 标场景-画线-移动
    if (!ThMeetingStore.boardStatus.isDrag && isMoveDown.value) {
      X1.value = e.offsetX;
      Y1.value = e.offsetY;
      if (ThMeetingStore.drawStyle.type === PB.DrawingType.LINE) {
        drawLine(
          X.value,
          Y.value,
          X1.value,
          Y1.value,
          currentWeight.value.size,
          currentColor.value.color
        );
        lineList.value.push({
          x: e.offsetX.toString(),
          y: e.offsetY.toString(),
        });
        if (ThMeetingStore.scene !== 3 && lineList.value.length > 2) {
          const timestamp = new Date().getTime();
          ThImEvent.sendCanvasLineData({
            meetingNo: ThMeetingStore.meetingInfo.meetingNo,
            anchor: ThMeetingStore.mineInfo.userId,
            type: ThMeetingStore.drawStyle.type,
            uuid: lineUuid.value,
            color: ThMeetingStore.drawStyle.color.toString(),
            width: ThMeetingStore.drawStyle.weight.toString(),
            data: lineList.value,
            timestamp,
            finished: false,
            action: '1',
            screenWidth: boardCanvasRef.value.width.toString(),
            screenHeight: boardCanvasRef.value.height.toString(),
          });
          addDrawing(
            lineList.value,
            ThMeetingStore.drawStyle.type,
            false,
            timestamp
          );
          lineList.value = [
            {
              x: e.offsetX.toString(),
              y: e.offsetY.toString(),
            },
          ];
        } else if (ThMeetingStore.scene === 3 && lineList.value.length > 10) {
          sendPointScene(lineList.value, ThMeetingStore.drawStyle.type, false);
          lineList.value = [
            {
              x: e.offsetX.toString(),
              y: e.offsetY.toString(),
            },
          ];
        }
        X.value = e.offsetX;
        Y.value = e.offsetY;
      } else if (ThMeetingStore.drawStyle.type === PB.DrawingType.RECTANGLE) {
        resetCanvas();
        drawRect(
          startX.value,
          startY.value,
          X1.value,
          Y1.value,
          currentWeight.value.size,
          currentColor.value.color
        );
      } else if (ThMeetingStore.drawStyle.type === PB.DrawingType.CIRCLE) {
        resetCanvas();
        drawCircle(
          startX.value,
          startY.value,
          X1.value,
          Y1.value,
          currentWeight.value.size,
          currentColor.value.color
        );
      } else if (ThMeetingStore.drawStyle.type === PB.DrawingType.ARROWS) {
        resetCanvas();
        drawArrows(
          startX.value,
          startY.value,
          X1.value,
          Y1.value,
          currentWeight.value.size,
          currentColor.value.color
        );
      }
      isDrawing.value = true;
    }
    if (
      ThMeetingStore.boardStatus.isDrag &&
      ThMeetingStore.boardStatus.isDragging
    ) {
      const dx = e.clientX - ThMeetingStore.boardStatus.dragStart.x;
      const dy = e.clientY - ThMeetingStore.boardStatus.dragStart.y;
      ThMeetingStore.updateBoardStatusOffset({
        x: ThMeetingStore.boardStatus.offset.x + dx,
        y: ThMeetingStore.boardStatus.offset.y + dy,
      });
      // 更新起始位置
      ThMeetingStore.updateBoardStatusDragStart({
        x: e.clientX,
        y: e.clientY,
      });
      // 重新渲染画布
      renderCanvas();
    }
  };
  const boardCanvasMouseUpAction = async (e: any) => {
    if (ThMeetingStore.drawStyle.type === 4) {
      // 闪点场景下-圆点画笔禁用画线
      return;
    }
    // 标场景-画线-抬起
    if (!ThMeetingStore.boardStatus.isDrag && isMoveDown.value) {
      if (ThMeetingStore.scene !== 3) {
        if (ThMeetingStore.drawStyle.type === PB.DrawingType.LINE) {
          lineList.value.push({
            x: e.offsetX.toString(),
            y: e.offsetY.toString(),
          });
        } else {
          lineList.value = [
            {
              x: startX.value.toString(),
              y: startY.value.toString(),
            },
            {
              x: e.offsetX.toString(),
              y: e.offsetY.toString(),
            },
          ];
        }
        const timestamp = new Date().getTime();
        ThImEvent.sendCanvasLineData({
          meetingNo: ThMeetingStore.meetingInfo.meetingNo,
          anchor: ThMeetingStore.mineInfo.userId,
          type: ThMeetingStore.drawStyle.type,
          uuid: lineUuid.value,
          color: ThMeetingStore.drawStyle.color.toString(),
          width: ThMeetingStore.drawStyle.weight.toString(),
          data: lineList.value,
          timestamp,
          finished: true,
          action: '1',
          screenWidth: boardCanvasRef.value.width.toString(),
          screenHeight: boardCanvasRef.value.height.toString(),
        });
        addDrawing(
          lineList.value,
          ThMeetingStore.drawStyle.type,
          true,
          timestamp
        );
      } else {
        lineList.value.push({
          x: e.clientX.toString(),
          y: e.clientY.toString(),
        });
        sendPointScene(lineList.value, ThMeetingStore.drawStyle.type, true);
      }
      lineList.value = [];
      isDrawing.value = false;
      isMoveDown.value = false;
      startX.value = 0;
      startY.value = 0;
    } else {
      ThMeetingStore.updateBoardStatusIsDragging(false);
    }
  };
  // 闪点业务点击事件
  const boardCanvasClickAction = async (e: any) => {
    // 闪点场景下-闪点-点击
    if (ThMeetingStore.scene !== 3 || ThMeetingStore.drawStyle.type !== 4) {
      return;
    }
    console.log('boardCanvasClickAction-ThMeetingStore', ThMeetingStore);
    // 获取 canvas 的边界框（用于计算相对位置）
    const canvasRect = boardCanvasRef.value.getBoundingClientRect();

    // 计算点击相对于 canvas 的坐标
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    flashPoints.value.push({
      x,
      y,
      size: 0,
      opacity: 1,
      color: ThMeetingStore.drawStyle.color,
    });
    ThImEvent.sendAssistPointFlickerEvent({
      meetingNo: ThMeetingStore.meetingInfo.meetingNo,
      color: ThMeetingStore.drawStyle.color,
      offsetX: x.toString(),
      offsetY: y.toString(),
      screenWidth: boardCanvasRef.value.width.toString(),
      screenHeight: boardCanvasRef.value.height.toString(),
    });
    isMoveDown.value = false;
  };
  // 接收到闪点闪烁事件
  const handleAssistPointFlickeredEvent = async (data: any) => {
    if (data.anchor === ThMeetingStore.mineInfo.userId) {
      return;
    }
    const ratioX = boardCanvasRef.value.width / toNumber(data.screenWidth);
    const ratioY = boardCanvasRef.value.height / toNumber(data.screenHeight);
    // 获取点击位置相对于 canvas 的左上角的坐标
    const clickX = Math.floor(toNumber(data.offsetX) * ratioX);
    const clickY = Math.floor(toNumber(data.offsetY) * ratioY);
    console.log(clickX, clickY);
    flashPoints.value.push({
      x: clickX,
      y: clickY,
      size: 0,
      opacity: 1,
      color: data.color,
    });
  };
  // 接收到闪点画线事件
  const handleAssistLineFlickeredEvent = async (data: any) => {
    if (data.anchor === ThMeetingStore.mineInfo.userId) {
      return;
    }
    const ratioX = boardCanvasRef.value.width / toNumber(data.screenWidth);

    const ratioY = boardCanvasRef.value.height / toNumber(data.screenHeight);
    const weight = ref('');
    const color = ref('');
    const penColors = ref(boardMenuRef.value.hbColorList);
    const penWeights = ref(boardMenuRef.value.hbWeightList);
    const weightItem = penWeights.value.find(
      (pen: any) => pen.type === data.width
    );
    weight.value = weightItem.size;
    const penItem = penColors.value.find((pen: any) => pen.type === data.color);
    color.value = penItem.color;
    resetCanvas();
    if (!data.finished) {
      if (data.data.length > 0) {
        for (let i = 0; i < data.data.length; i += 1) {
          const cItem = data.data[i];
          let c1Item: any;
          if (i < data.data.length - 2) {
            c1Item = data.data[i + 1];
          } else {
            c1Item = cItem;
          }
          drawLine(
            toNumber(cItem.x) * ratioX,
            toNumber(cItem.y) * ratioY,
            toNumber(c1Item.x) * ratioX,
            toNumber(c1Item.y) * ratioY,
            weight.value,
            color.value
          );
        }
      }
      // const rect = boardCanvasRef.value.getBoundingClientRect();      const x = toNumber(data.data[0].x) * ratioX;
      const x = toNumber(data.data[data.data.length - 1].x) * ratioY;
      const y = toNumber(data.data[data.data.length - 1].y) * ratioY;
      handleDrawingUser(data.anchor, x, y);
    } else {
      handleRemoveDrawingUser(data.anchor);
    }
  };

  // 拖动业务
  const handleChangeDrag = () => {
    if (!ThMeetingStore.boardStatus.isDrag) {
      ThMeetingStore.updateBoardStatusCursor('grab');
      ThMeetingStore.updateBoardStatusIsDrag(true);
    } else {
      ThMeetingStore.updateBoardStatusCursor('auto');
      ThMeetingStore.updateBoardStatusIsDrag(false);
    }
  };
  // 标注放大缩小
  const handleBoardCanvasZoom = (zoomIn: boolean) => {
    if (zoomIn) {
      if (ThMeetingStore.boardStatus.scale < ThMeetingStore.boardMaxScale) {
        ThMeetingStore.updateBoardStatusScale(
          ThMeetingStore.boardStatus.scale + ThMeetingStore.boardStepScale
        );
      } else {
        ThMeetingStore.updateBoardStatusScale(ThMeetingStore.boardMaxScale);
      }
    }
    if (!zoomIn) {
      if (ThMeetingStore.boardStatus.scale > ThMeetingStore.boardMinScale) {
        ThMeetingStore.updateBoardStatusScale(
          ThMeetingStore.boardStatus.scale - ThMeetingStore.boardStepScale
        );
      } else {
        ThMeetingStore.updateBoardStatusOffset({
          x: 0,
          y: 0,
        });
        ThMeetingStore.updateBoardStatusScale(ThMeetingStore.boardMinScale);
      }
    }
    if (ThMeetingStore.scene === 2) {
      handleInitCanvas();
      handleRenderBoardBgImgCanvas('shotScreen');
    } else if (ThMeetingStore.scene === 1) {
      handleInitCanvas();
      if (ThMeetingStore.boardStatus.baseMap) {
        handleRenderBoardBgImgCanvas();
      }
    }
    if (
      ThMeetingStore.boardStatus.dragStart.x === 0 &&
      ThMeetingStore.boardStatus.dragStart.y === 0
    ) {
      centerCanvas();
    }
    renderCanvas();
  };
  // 接收到对方拖动放大缩小事件
  const handleAssistCanvasChangedEvent = (data: any) => {
    if (data.anchor === ThMeetingStore.mineInfo.userId) {
      return;
    }
    console.log('接收到对方拖动放大缩小事件---', data);

    ThMeetingStore.updateBoardStatusScale(toNumber(data.scale));

    if (ThMeetingStore.scene === 2) {
      handleInitCanvas();
      handleRenderBoardBgImgCanvas('shotScreen');
    } else if (ThMeetingStore.scene === 1) {
      handleInitCanvas();
      if (ThMeetingStore.boardStatus.baseMap) {
        handleRenderBoardBgImgCanvas();
      }
    }
    const ratioX = boardCanvasRef.value.width / toNumber(data.screenWidth);
    const ratioY = boardCanvasRef.value.height / toNumber(data.screenHeight);
    boardCanvasStyle.value.left = `${Math.floor(
      toNumber(data.offsetX) * ratioX
    )}px`;
    boardCanvasStyle.value.top = `${Math.floor(
      toNumber(data.offsetY) * ratioY
    )}px`;
    ThMeetingStore.updateBoardStatusOffset({
      x: Math.floor(toNumber(data.offsetX) * ratioX),
      y: Math.floor(toNumber(data.offsetY) * ratioY),
    });
  };

  // 抓屏业务
  const handleBoardCaptureScreen = async () => {
    try {
      ThMeetingStore.updateUploadFileStatus(true);
      if (boardCanvasRef.value) {
        const base64Data = boardCanvasRef.value.toDataURL('image/jpeg', 1.0);
        const blob: any = dataURItoBlob(base64Data);
        const nowMillisecond = getMillisecond();
        const cosConfigRes = await ThImEvent.uploadCosConfig();
        if (cosConfigRes.code !== 200) {
          msg.error(t('mst.message.board.menu.scdt.msg1'));
          return;
        }
        const { uploadFile } = useCos({
          ...cosConfigRes.data,
          basicPath: `${cosConfigRes.data.basicPath}meeting/${ThMeetingStore.meetingInfo.meetingNo}/Photograph/`,
        });
        const uploadRes = await uploadFile(
          blob,
          `Photograph${nowMillisecond}.png`
        );
        if (uploadRes.statusCode !== 200) {
          msg.error(t('mst.message.board.menu.scdt.msg2'));
          return;
        }
        const res = await ThImEvent.uploadShotScreen({
          meetingId: ThMeetingStore.meetingInfo.meetingId,
          screenshotUrl: uploadRes.Location,
        });
        if (res.code !== 200 && res.code !== 401) {
          msg.error(res.msg);
          return;
        }
        msg.success(t('mst.message.board.menu.scdt.msg3'));
      }
    } catch (error) {
      console.log(error);
    } finally {
      ThMeetingStore.updateUploadFileStatus(false);
    }
  };

  // 告警
  const handleCloseWarning = () => {
    ThMeetingStore.updateBoardStatusIsWarning(false);
  };
  const handleTimeoutClearWarning = () => {
    setTimeout(() => {
      if (ThMeetingStore.boardStatus.isWarning) {
        handleCloseWarning();
      }
    }, 1000 * 3);
  };
  const handleAssistWaringFlickeredEvent = async (data: any) => {
    if (ThMeetingStore.mineInfo.userId !== data.anchor) {
      const member = await ThMeetingStore.filterMemberInfo(data.anchor);
      msg.warning(
        `${member.name}:${t('mst.message.waring.send')} ${t(
          'mst.message.waring.content'
        )}`
      );
      ThMeetingStore.updateBoardStatusIsWarning(true);
      handleTimeoutClearWarning();
    }
  };

  // 接收到其他人员绘制
  const handleAssistCanvasDrawingEvent = (data: any) => {
    console.log('接收到其他人员绘制---', data);
    if (data.anchor === ThMeetingStore.mineInfo.userId) {
      return;
    }
    const drawing = new DrawingData(
      data.meetingNo,
      data.anchor,
      data.type,
      data.uuid,
      data.color,
      data.width,
      data.screenWidth,
      data.screenHeight,
      data.timestamp,
      data.data,
      data.finished
    );
    AssistCanvasSet?.addOtherSet(drawing);
    drawCurrentLines(data);
  };
  // 接收到其他人撤销
  const handleAssistCanvasDeleteEvent = (data: any) => {
    if (data.anchor === ThMeetingStore.mineInfo.userId) {
      return;
    }
    AssistCanvasSet?.removeLastLineByAnchor(data.anchor);
    resetCanvas();
  };
  // 接收到画板清除事件
  const handleAssistCanvasClearEvent = async (data: any) => {
    const memberInfo = await ThMeetingStore.filterMemberInfo(data.anchor);
    if (data.anchor === ThMeetingStore.meetingInfo.masterId) {
      AssistCanvasSet?.cleanup();
      msg.warning(
        `[${t('mst.meeting.zcr')}]${memberInfo.name} ${t(
          'mst.board.msg.board.clear'
        )}`
      );
    } else {
      AssistCanvasSet?.removeSetByAnchor(data.anchor);
      msg.warning(`${memberInfo.name} ${t('mst.board.msg.board.clear')}`);
    }
    resetCanvas();
  };
  const handleAssistUploadFileNotified = () => {
    ThMeetingStore.updateUploadFileNews(true);
  };

  const handleAssistImEventChange = () => {
    // 处理 IM 事件变更
  };
  // 会议问询
  const handleAssistMeetingStatusAnswer = () => {
    ThImEvent.sendAssistMeetingStatusAnswerEvent({
      meetingNo: ThMeetingStore.meetingInfo.meetingNo,
      client: PB.Client.PC,
    });
  };
  // 渲染翻译文本
  const handleRenderTransLanguages = async (data: any) => {
    console.log(
      '渲染翻译文本----data & meetingInfo',
      data,
      ThImEvent.meetingInfo,
      ThMeetingStore.mineInfo,
    );
    if (data.meetingNo === ThImEvent.meetingInfo.meetingNo) {
      // 翻译非自己的信息
      if (
        data.sender !== ThMeetingStore.mineInfo.userId
      ) {
        const userInfo = await ThMeetingStore.filterMemberInfo(data.sender);
        transLanguages.value.push({
          ...data,
          name: userInfo?.name,
        });
        if (transLanguages.value.length > 3) {
          transLanguages.value.shift();
        }
      }
    }
  };
  const handleInviteListChange = async (data: any) => {
    ThMeetingStore.updateInviteListData(data);
  };
  // 监听子组件业务事件
  const handleMonitorNodeEvent = () => {
    console.log('监听子组件业务事件-handleMonitorNodeEvent');
    THEventBus.on('th-self-reconnect-translate', handleReconnectTranslate);
    THEventBus.on('th-self-hangup-meeting', handleHangupMeeting);
    THEventBus.on('th-self-menu-set-camera', handleChangeCamera);
    THEventBus.on('th-self-menu-camera-close', handleCloseCamera);
    THEventBus.on('th-self-menu-microphone-change', handleChangeMicrophone);
    THEventBus.on('th-self-menu-loudspeaker-change', handleChangeLoudspeaker);
    THEventBus.on(
      'th-self-menu-all-audio-disable',
      handleChangeAllAudioDisable
    );
    THEventBus.on('th-self-invite-member', handleOpenInviteMemberModal);
    THEventBus.on('th-self-link-share', handleOpenLinkShareModal);
    THEventBus.on('th-psn-render-local-stream', handleRenderLocalStream);
    THEventBus.on('th-psn-set-lecture-info', handleSetLectureInfo);

    THEventBus.on('th-hangup-over-meeting', handleHangupOverMeeting);
    THEventBus.on('th-hangup-leave-meeting', handleHangupLeaveMeeting);

    THEventBus.on('th-scene-download-file', handleOpenDownloadFileModal);
    THEventBus.on('th-scene-upload-file', handleSceneUploadFile);

    THEventBus.on('th-scene-open-draw-board', handleOpenDrawBoard);
    THEventBus.on('th-scene-open-screen-board', handleOpenScreenBoard);
    THEventBus.on('th-scene-open-flash-board', handleSceneOpenFlashBoard);
    THEventBus.on(
      'th-scene-capture-lecture-video',
      handleSceneCaptureLectureVideo
    );
    THEventBus.on('th-scene-open-share-screen', handleSceneOpenShareScreen);
    THEventBus.on('th-scene-close-share-screen', handleSceneCloseShareScreen);
    THEventBus.on('th-scene-set-optimization-mode', (data: any) => {
      handleSceneSetOptimizationMode(data);
    });
    THEventBus.on('th-scene-set-optimization-hd', (data: any) => {
      handleSceneSetOptimizationHd(data);
    });
    THEventBus.on('th-scene-change-client', handleGlassJoinModalOpen);
    THEventBus.on('th-scene-glass-login', handleGlassCodeModalOpen);
    THEventBus.on('th-board-close', handleBoardCloseModalOpen);
    THEventBus.on('th-board-screen-record-open', handleRecordingOpen);
    THEventBus.on('th-board-screen-record-close', handleRecordingClose);
    THEventBus.on('th-board-capture-screen', handleBoardCaptureScreen);
    THEventBus.on('th-board-undo', handleBoardUndo);
    THEventBus.on('th-board-clear', handleBoardClear);
    THEventBus.on('th-board-upload-map', handleBoardUploadMap);
    THEventBus.on('th-board-upload-map-clear', handleBoardUploadMapClear);

    THEventBus.on(
      'th-assist-invitee-rejected',
      handleAssistInviteeRejectedEvent
    );
    THEventBus.on('th-assist-closed', handleAssistClosed);
    THEventBus.on('ThAssistErrorOut', handleErrorLeaveMeeting);
    THEventBus.on(
      'th-assist-other-client-joined',
      handleAssistOtherClientJoinedEvent
    );
    THEventBus.on('th-assist-all-audio-disabled', handleAssistAllAudioDisabled);
    THEventBus.on('th-assist-all-audio-enabled', handleAssistAllAudioEnabled);
    THEventBus.on('th-assist-audio-closed', handleAssistAudioClosedEvent);
    THEventBus.on('th-assist-audio-opened', handleAssistAudioOpenedEvent);
    THEventBus.on('th-assist-camera-closed', handleAssistCameraClosedEvent);
    THEventBus.on('th-assist-camera-opened', handleAssistCameraOpenedEvent);
    THEventBus.on(
      'th-assist-video-transfer-strategy-changed',
      handleAssistVideoTransferStrategyChangedEvent
    );
    THEventBus.on(
      'th-assist-video-transfer-hd-changed',
      handleAssistVideoTransHdChangedEvent
    );
    THEventBus.on(
      'th-assist-video-transfer-strategy-updated',
      handleAssistVideoTransferStrategyUpdatedEvent
    );
    THEventBus.on(
      'th-assist-video-transfer-hd-updated',
      handleAssistVideoTransferHdUpdatedEvent
    );
    THEventBus.on(
      'th-assist-member-client-changed',
      handleAssistMemberClientChangedEvent
    );
    THEventBus.on('th-assist-member-joined', handleAssistMemberJoinedEvent);
    THEventBus.on(
      'th-assist-chat-message-receive',
      handleAssistChatMessageReceiveEvent
    );
    THEventBus.on(
      'th-assist-drawing-board-opened',
      handleAssistDrawingBoardOpenedEvent
    );
    THEventBus.on(
      'th-assist-drawing-board-closed',
      handleAssistDrawingBoardClosedEvent
    );
    THEventBus.on('th-assist-canvas-changed', handleAssistCanvasChangedEvent);
    THEventBus.on('th-assist-canvas-drawing', handleAssistCanvasDrawingEvent);
    THEventBus.on('th-assist-canvas-delete', handleAssistCanvasDeleteEvent);
    THEventBus.on('th-assist-canvas-clear', handleAssistCanvasClearEvent);
    THEventBus.on('th-assist-point-flickered', handleAssistPointFlickeredEvent);
    THEventBus.on('th-assist-line-flickered', handleAssistLineFlickeredEvent);
    THEventBus.on(
      'th-assist-canvas-image-changed',
      handleAssistCanvasImageChangedEvent
    );
    THEventBus.on(
      'th-assist-warning-flickered',
      handleAssistWaringFlickeredEvent
    );
    THEventBus.on(
      'th-assist-screen-frozen-opened',
      handleAssistScreenFrozenOpenedEvent
    );
    THEventBus.on(
      'th-assist-screen-frozen-closed',
      handleAssistScreenFrozenClosedEvent
    );
    THEventBus.on(
      'th-assist-flicker-scene-opened',
      handleAssistFlickerSceneOpenedEvent
    );
    THEventBus.on(
      'th-assist-flicker-scene-closed',
      handleAssistFlickerSceneClosedEvent
    );
    THEventBus.on(
      'th-assist-share-screen-opened',
      handleAssistShareScreenOpenedEvent
    );
    THEventBus.on(
      'th-assist-share-screen-closed',
      handleAssistShareScreenClosedEvent
    );
    THEventBus.on(
      'th-assist-screen-direction-updated',
      handleAssistScreenDirectionUpdated
    );
    THEventBus.on(
      'th-assist-upload-file-notified',
      handleAssistUploadFileNotified
    );
    THEventBus.on('th-assist-im-event-change', handleAssistImEventChange);
    THEventBus.on(
      'th-assist-meeting-status-answer',
      handleAssistMeetingStatusAnswer
    );
    THEventBus.on(
      'th-assist-meeting-real-time-translationd',
      handleRenderTransLanguages
    );
    THEventBus.on('th-assist-invite-list-change', handleInviteListChange);
  };
  const handleClearMonitorNodeEvent = () => {
    console.log('清除监听子组件业务事件-handleClearMonitorNodeEvent');
    THEventBus.off('th-self-reconnect-translate', handleReconnectTranslate);
    THEventBus.off('th-self-hangup-meeting', handleHangupMeeting);
    THEventBus.off('th-self-menu-set-camera', handleChangeCamera);
    THEventBus.off('th-self-menu-camera-close', handleCloseCamera);
    THEventBus.off('th-self-menu-microphone-change', handleChangeMicrophone);
    THEventBus.off('th-self-menu-loudspeaker-change', handleChangeLoudspeaker);
    THEventBus.off(
      'th-self-menu-all-audio-disable',
      handleChangeAllAudioDisable
    );
    THEventBus.off('th-self-invite-member', handleOpenInviteMemberModal);
    THEventBus.off('th-self-link-share', handleOpenLinkShareModal);
    THEventBus.off('th-psn-render-local-stream', handleRenderLocalStream);
    THEventBus.off('th-psn-set-lecture-info', handleSetLectureInfo);

    THEventBus.off('th-hangup-over-meeting', handleHangupOverMeeting);
    THEventBus.off('th-hangup-leave-meeting', handleHangupLeaveMeeting);

    THEventBus.off('th-scene-download-file', handleOpenDownloadFileModal);
    THEventBus.off('th-scene-upload-file', handleSceneUploadFile);
    THEventBus.off('th-scene-open-draw-board', handleOpenDrawBoard);
    THEventBus.off('th-scene-open-screen-board', handleOpenScreenBoard);
    THEventBus.off('th-scene-open-flash-board', handleSceneOpenFlashBoard);
    THEventBus.off(
      'th-scene-capture-lecture-video',
      handleSceneCaptureLectureVideo
    );
    THEventBus.off('th-scene-open-share-screen', handleSceneOpenShareScreen);
    THEventBus.off('th-scene-close-share-screen', handleSceneCloseShareScreen);
    THEventBus.off('th-scene-set-optimization-mode', (data: any) => {
      handleSceneSetOptimizationMode(data);
    });
    THEventBus.off('th-scene-set-optimization-hd', (data: any) => {
      handleSceneSetOptimizationHd(data);
    });
    THEventBus.off('th-scene-change-client', handleGlassJoinModalOpen);
    THEventBus.off('th-scene-glass-login', handleGlassCodeModalOpen);
    THEventBus.off('th-board-close', handleBoardCloseModalOpen);
    THEventBus.off('th-board-screen-record-open', handleRecordingOpen);
    THEventBus.off('th-board-screen-record-close', handleRecordingClose);
    THEventBus.off('th-board-capture-screen', handleBoardCaptureScreen);
    THEventBus.off('th-board-undo', handleBoardUndo);
    THEventBus.off('th-board-clear', handleBoardClear);
    THEventBus.off('th-board-upload-map', handleBoardUploadMap);
    THEventBus.off('th-board-upload-map-clear', handleBoardUploadMapClear);
    THEventBus.off(
      'th-assist-screen-direction-updated',
      handleAssistScreenDirectionUpdated
    );

    THEventBus.off(
      'th-assist-invitee-rejected',
      handleAssistInviteeRejectedEvent
    );
    THEventBus.off('th-assist-closed', handleAssistClosed);
    THEventBus.off('ThAssistErrorOut', handleErrorLeaveMeeting);
    THEventBus.off(
      'th-assist-other-client-joined',
      handleAssistOtherClientJoinedEvent
    );
    THEventBus.off(
      'th-assist-all-audio-disabled',
      handleAssistAllAudioDisabled
    );
    THEventBus.off('th-assist-all-audio-enabled', handleAssistAllAudioEnabled);
    THEventBus.off('th-assist-audio-closed', handleAssistAudioClosedEvent);
    THEventBus.off('th-assist-audio-opened', handleAssistAudioOpenedEvent);
    THEventBus.off('th-assist-camera-closed', handleAssistCameraClosedEvent);
    THEventBus.off('th-assist-camera-opened', handleAssistCameraOpenedEvent);
    THEventBus.off(
      'th-assist-video-transfer-strategy-changed',
      handleAssistVideoTransferStrategyChangedEvent
    );
    THEventBus.off(
      'th-assist-video-transfer-hd-changed',
      handleAssistVideoTransHdChangedEvent
    );
    THEventBus.off(
      'th-assist-video-transfer-strategy-updated',
      handleAssistVideoTransferStrategyUpdatedEvent
    );
    THEventBus.off(
      'th-assist-video-transfer-hd-updated',
      handleAssistVideoTransferHdUpdatedEvent
    );
    THEventBus.off(
      'th-assist-member-client-changed',
      handleAssistMemberClientChangedEvent
    );
    THEventBus.off('th-assist-member-joined', handleAssistMemberJoinedEvent);
    THEventBus.off(
      'th-assist-chat-message-receive',
      handleAssistChatMessageReceiveEvent
    );
    THEventBus.off(
      'th-assist-drawing-board-opened',
      handleAssistDrawingBoardOpenedEvent
    );
    THEventBus.off(
      'th-assist-drawing-board-closed',
      handleAssistDrawingBoardClosedEvent
    );
    THEventBus.off('th-assist-canvas-changed', handleAssistCanvasChangedEvent);
    THEventBus.off('th-assist-canvas-drawing', handleAssistCanvasDrawingEvent);
    THEventBus.off('th-assist-canvas-delete', handleAssistCanvasDeleteEvent);
    THEventBus.off('th-assist-canvas-clear', handleAssistCanvasClearEvent);
    THEventBus.off(
      'th-assist-point-flickered',
      handleAssistPointFlickeredEvent
    );
    THEventBus.off('th-assist-line-flickered', handleAssistLineFlickeredEvent);
    THEventBus.off(
      'th-assist-canvas-image-changed',
      handleAssistCanvasImageChangedEvent
    );
    THEventBus.off(
      'th-assist-warning-flickered',
      handleAssistWaringFlickeredEvent
    );
    THEventBus.off(
      'th-assist-screen-frozen-opened',
      handleAssistScreenFrozenOpenedEvent
    );
    THEventBus.off(
      'th-assist-screen-frozen-closed',
      handleAssistScreenFrozenClosedEvent
    );
    THEventBus.off(
      'th-assist-flicker-scene-opened',
      handleAssistFlickerSceneOpenedEvent
    );
    THEventBus.off(
      'th-assist-flicker-scene-closed',
      handleAssistFlickerSceneClosedEvent
    );
    THEventBus.off(
      'th-assist-share-screen-opened',
      handleAssistShareScreenOpenedEvent
    );
    THEventBus.off(
      'th-assist-share-screen-closed',
      handleAssistShareScreenClosedEvent
    );
    THEventBus.off(
      'th-assist-upload-file-notified',
      handleAssistUploadFileNotified
    );
    THEventBus.off('th-assist-im-event-change', handleAssistImEventChange);
    THEventBus.off(
      'th-assist-meeting-status-answer',
      handleAssistMeetingStatusAnswer
    );
    THEventBus.off(
      'th-assist-meeting-real-time-translationd',
      handleRenderTransLanguages
    );
    THEventBus.off('th-assist-invite-list-change', handleInviteListChange);
  };
  const handleNetworkStatusChange = () => {
    ThMeetingStore.updateAssistNetworkStatus(navigator.onLine);
  };
  // 在线状态-在线
  const handleNetworkOnline = () => {
    handleNetworkStatusChange();
  };
  // 在线状态-离线
  const handleNetworkOffline = () => {
    handleNetworkStatusChange();
  };
  const handleAddNetworkListeners = () => {
    window.addEventListener('online', handleNetworkOnline);
    window.addEventListener('offline', handleNetworkOffline);
  };
  const handleRemoveNetworkListeners = () => {
    window.removeEventListener('online', handleNetworkOnline);
    window.removeEventListener('offline', handleNetworkOffline);
  };
  // 初始化协助相关事件
  const handleInitThMeeting = () => {
    // 获取当前硬件设备
    handleGetDevicesList();
    // 初始化RTC
    handleInitThRtcClient();
    console.log('初始化协助相关事件', ThMeetingStore);
  };
  watchEffect(() => {
    // 获取并更新 sdkEvent
    ThImEvent = props.sdkEvent;
    ThMeetingStore.updateThImEvent(ThImEvent);
  });
  watch(
    () => curLectureInfo.value,
    (newVal, oldVal) => {
      const nVal = newVal ? JSON.parse(JSON.stringify(newVal)) : newVal;
      const oVal = oldVal ? JSON.parse(JSON.stringify(oldVal)) : oldVal;
      if (
        !oVal ||
        nVal.userId !== oVal.userId ||
        (nVal.userId === oVal.userId && nVal.hasVideo !== oVal.hasVideo)
      ) {
        handleChangeLecture();
        // 更新grid
        gridContainerRef.value?.handleRenderGridVideo();
      }
    },
    { deep: true }
  );
  onMounted(() => {
    handleAddNetworkListeners();
    handleCalculateTime();
    document.body.style.overflow = 'hidden';
    handleInitThMeeting();
    handleMonitorNodeEvent();
    // 初始化时自动切换主播
    handleAutoSwitchLecture();
  });
  onBeforeUnmount(() => {
    handleRemoveNetworkListeners();
    handleClearCalculateTime();
    document.body.style.overflow = 'unset';
    handleClearMonitorNodeEvent();
    handleClearMonitorThRtcClientEvent();
    handleMstRtcAgoraAudioTrackClose();
    transWssInfo.value = {
      url: '',
      translateVendor: '',
    };
    transLanguages.value = [];
  });
</script>

<style lang="less" scoped>
  .th-ma-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    user-select: none; /* Chrome, Opera, Safari */
    -moz-user-select: none; /* Firefox */
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* Internet Explorer */
    img {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    svg {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    .th-ma-lecture-main {
      video {
        width: 100%;
        height: 100%;
        object-fit: cover !important;
      }

      &.no-video {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .th-ma-lecture-main-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          img {
            flex-shrink: 0;
            width: 78px;
            height: 78px;
            border-radius: 6px;
          }

          .th-ma-lecture-main-body-name {
            margin-top: 15px;

            span {
              font-weight: 400;
              font-size: 16px;
              color: #f5f5f5;
            }
          }
        }
      }
    }

    .th-ma-title {
      flex-shrink: 0;
      position: absolute;
      top: 30px;
      left: 0;
      right: 0;
      margin: auto;
      display: flex;
      align-items: center;
      justify-content: center;

      .th-ma-t-main {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        padding: 0 15px;
        height: 35px;
        background: rgba(23, 32, 46, 0.76);
        border-radius: 49px 49px 49px 49px;
        border: 1px solid rgba(75, 85, 99, 0.5);
        z-index: 10;

        .th-ma-t-l {
          display: flex;
          align-items: center;
          max-width: 200px;
          padding: 0 12px 0 0;
          overflow: hidden;
          white-space: nowrap;
          /*文字超出宽度则显示ellipsis省略号*/
          text-overflow: ellipsis;

          font-weight: 400;
          font-size: 14px;
          color: #d1d5db;
          .th-ma-t-l-status {
            flex-shrink: 0;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            margin-right: 5px;
            &.online {
              background-color: #28c445;
            }

            &.outline {
              background-color: #9ca3af;
            }
          }
          .th-ma-t-l-status-label {
            margin-right: 5px;
          }
        }

        .th-ma-t-m {
          flex-shrink: 0;
          width: 1px;
          height: 20px;
          background-color: #5d6777;
        }

        .th-ma-t-r {
          padding: 0 0 0 12px;

          span {
            font-weight: 400;
            font-size: 14px;
            color: #d1d5db;
          }
        }
        .th-ma-file-upload-status {
          margin-left: 10px;
          width: fit-content;
          display: flex;
          align-items: center;
          .th-ma-file-upload-status-i {
            width: 12px;
            height: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 5px 0 10px;
            animation: infinite-rotation 2s linear infinite;

            svg {
              width: 100%;
              height: 100%;
            }
          }
          .th-ma-file-upload-status-l {
            font-weight: 400;
            font-size: 14px;
            color: #d1d5db;
          }
        }
      }
    }

    .th-ma-record-time {
      width: fit-content;
      height: 38px;
      padding: 7px 15px;
      position: absolute;
      top: 30px;
      left: 30px;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(23, 32, 46, 0.76);
      border-radius: 49px 49px 49px 49px;
      border: 1px solid rgba(75, 85, 99, 0.5);

      .th-ma-record-t-l {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #ef4444;
        margin-right: 14px;

        .th-ma-record-t-lm {
          width: 10px;
          height: 10px;
          background: #ef4444;
          border-radius: 50%;
          box-shadow: 0px 0px 12px 0px rgba(239, 68, 68, 0.5);
        }
      }

      .th-ma-record-t-r {
        display: flex;
        align-items: center;
        justify-content: end;

        span {
          font-weight: 400;
          font-size: 14px;
          color: #d1d5db;
        }
      }
    }

    .th-ma-board-menu {
      position: absolute;
      top: 75px;
      left: 0;
      right: 0;
      margin: auto;
      width: fit-content;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px;
      height: 35px;
      background: rgba(23, 32, 46, 0.76);
      border-radius: 49px 49px 49px 49px;
      border: 1px solid rgba(75, 85, 99, 0.5);
      z-index: 10;
      &.th-ma-board-menu_camara_layout {
        left: 270px !important;
      }
      &.th-ma-board-menu-operate {
        background: unset;
        border: none;
        gap: 12px;
        .th-ma-board-menu-option {
          background: rgba(23, 32, 46, 0.76);
          border-radius: 4px;
          border: 1px solid rgba(75, 85, 99, 0.5);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          padding: 4px 12px;
          &.th-ma-board-menu-option-translate {
            padding-left: 4px;
          }
        }
      }
      .th-ma-board-m-i {
        cursor: pointer;
        width: 44px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        &.th-ma-board-m-i_selected {
          background-color: rgba(2, 103, 255, 1);
          border-radius: 2px;
        }
        img {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
        }
        &:active {
          transform: scale(1.1);
        }
      }
    }

    .th-ma-menu-scene {
      width: 56px;
      height: 408px;
      background: rgba(23, 32, 46, 0.76);
      border-radius: 8px 8px 8px 8px;
      position: absolute;
      z-index: 10;
      top: 0;
      bottom: 0;
      left: 30px;
      margin: auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .th-ma-menu-board {
      &.th-ma-menu-board-marking-layout-operate {
        border: 1px solid rgba(75, 85, 99, 0.5);
        width: fit-content;
        top: unset;
        left: 50%;
        transform: translateX(-50%);
        bottom: 30px;
        .board-menu-container {
          width: unset;
          flex-direction: unset;
          padding: 0 12px;
          gap: 24px;
          :deep(.board-menu-line) {
            //transform: rotate(90deg);
            width: 1px;
            height: 24px;
          }
          :deep(.dropdown-container) {
            .dropdown-content {
              left: -90px !important;
              top: -160px !important;
            }
          }
        }
      }
      width: 56px;
      height: fit-content;
      background: rgba(23, 32, 46, 0.76);
      border-radius: 8px 8px 8px 8px;
      position: absolute;
      z-index: 10;
      top: 0;
      bottom: 0;
      left: 30px;
      margin: auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .th-ma-menu-self {
      &.marking-layout-operate {
        left: unset;
        right: 30px;
        height: unset;
        margin: 0;
        .self-menu-container {
          gap: 24px;
          padding: 0 12px;
        }
        :deep(.dropdown-container) {
          &.dropdown-container[datatype='hidden'] {
            display: none;
          }
        }
        :deep(.self-menu-item) {
          &.self-menu-item[datatype='hidden'] {
            display: none;
          }
          width: 24px;
          height: 24px;
          margin: 10px 0;
          .self-menu-item-b {
            display: none;
          }
        }
        :deep(.self-menu-item-row) {
          width: unset !important;
          height: unset !important;
          .self-menu-item-row-r {
            margin-top: 8px !important;
          }
          .self-menu-item-row-l {
            width: unset !important;
            height: unset !important;
          }
          .self-menu-item-b {
            display: none;
          }
        }
      }
      // width: 531px;
      width: fit-content;
      height: 80px;
      background: rgba(23, 32, 46, 0.76);
      border-radius: 8px 8px 8px 8px;
      border: 1px solid rgba(75, 85, 99, 0.5);
      position: absolute;
      z-index: 10;
      bottom: 30px;
      left: 0;
      right: 0;
      margin: auto;
    }

    .th-ma-message-bubble {
      position: absolute;
      bottom: 30px;
      left: 100px;
      max-height: 250px;
      height: var(--bubble-content-height);
      width: 250px;
      z-index: 11;
      &.th-ma-message-bubble-operate {
        left: 30px;
      }
    }
    .th-ma-psn-list {
      position: absolute;
      z-index: 10;
      top: 30px;
      right: var(--meeting-right-person-list, 30px);
    }

    .th-ma-board-canvas {
      width: 100%;
      height: 100%;

      z-index: 5;
      overflow: hidden;
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      .boardCanvas-content {
        position: relative;
        .view-tips-name {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: -25px;
          color: #fff;
        }
      }
      &.col-2-flex {
        gap: 12px;
        display: flex;
        .flex-1-canvas {
          flex: 1;
        }
        .col-2-video {
          flex: 1;
          height: var(--video-realtime-footage);
          position: relative;
          .view-tips-name {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: -25px;
            color: #fff;
          }
        }
      }
      &.bg {
        background-color: rgb(6, 6, 6);
      }
      .th-ma-board-canvas-main {
        flex-shrink: 0;
        position: relative;
        overflow: hidden;
        // canvas {
        //   border: 1px solid rgba(230, 233, 237, 0.1);
        // }
      }
    }

    .th-warning-container {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      background-position: center;
      background-size: 100% 100%;
      background-repeat: no-repeat;

      .th-warning-main {
        flex-shrink: 0;
        width: 319px;
        height: 203px;
        position: relative;
        animation: fadeInOut 0.5s infinite;

        img {
          width: 100%;
          height: 100%;
        }

        .th-warning-m-m {
          position: absolute;
          top: 0;
          width: 319px;
          height: 203px;

          .th-warning-main-t {
            padding-left: 64px;
            height: 61px;
            display: flex;
            align-items: center;

            span {
              font-weight: 400;
              font-size: 16px;
              color: #ff3939;
            }
          }

          .th-warning-main-m {
            height: 120px;
            padding: 0 63px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;

            span {
              font-weight: 400;
              font-size: 32px;
              color: #ff0000;
            }
          }
        }
      }
    }

    .drawing-user {
      position: absolute;
      z-index: 12;
      .drawing-user-icon {
        width: 32px;
        height: 32px;
        position: absolute;
        top: -34px;
        left: -34px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .drawing-user-name {
        padding: 5px 10px;
        color: #d1d5db;
        font-size: 12px;
        border-radius: 4px;
      }
      &-0 {
        .drawing-user-name {
          background-color: #684aff;
        }
      }
      &-1 {
        .drawing-user-name {
          background-color: #00b5ce;
        }
      }
      &-2 {
        .drawing-user-name {
          background-color: #ef5533;
        }
      }
      &-3 {
        .drawing-user-name {
          background-color: #ffc700;
        }
      }
      &-4 {
        .drawing-user-name {
          background-color: #d24aff;
        }
      }
      &-5 {
        .drawing-user-name {
          background-color: #8fff4a;
        }
      }
      &-6 {
        .drawing-user-name {
          background-color: #ff4a4a;
        }
      }
      &-7 {
        .drawing-user-name {
          background-color: #4aa7ff;
        }
      }
      &-8 {
        .drawing-user-name {
          background-color: #33699b;
        }
      }
      &-9 {
        .drawing-user-name {
          background-color: #339b43;
        }
      }
      &-10 {
        .drawing-user-name {
          background-color: #9b9833;
        }
      }
      &-11 {
        .drawing-user-name {
          background-color: #9b4333;
        }
      }
      &-12 {
        .drawing-user-name {
          background-color: #339b7a;
        }
      }
      &-13 {
        .drawing-user-name {
          background-color: #4d006b;
        }
      }
      &-14 {
        .drawing-user-name {
          background-color: #6b4f00;
        }
      }
      &-15 {
        .drawing-user-name {
          background-color: #365c6c;
        }
      }
      &-16 {
        .drawing-user-name {
          background-color: #6c364a;
        }
      }
    }
    .trans-language-txt {
      max-width: 50%;
      position: absolute;
      top: 120px;
      left: 0;
      right: 0;
      margin: 0 auto;
      width: fit-content;

      background: rgba(0, 0, 0, 0.5);
      border-radius: 8px 8px 8px 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 5px 10px;
      border-radius: 5px;
      z-index: 20;

      .trans-language-txt-i {
        span {
          font-size: 14px;
          color: #ffffff;

          &.orange {
            margin-right: 5px;
            color: #ff7d20;
          }
        }
      }
    }
  }
  /* 定义动画 */
  @keyframes fadeInOut {
    0% {
      opacity: 0; /* 开始时隐藏 */
    }
    50% {
      opacity: 1; /* 中间显示 */
    }
    100% {
      opacity: 0; /* 结束时隐藏 */
    }
  }
  /** 旋转 */
  @keyframes infinite-rotation {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
