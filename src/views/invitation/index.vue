<template>
  <div class="invitation-page">
    <div class="top">
      <div class="top_i">
        <img
          class="top_l_icon"
          src="@/assets/invitation/icon_language.png"
          alt=""
        />
        <div class="top_lm">
          <span class="t9">{{ langData.t9 }}</span>
        </div>
        <div class="top_lr">
          <img src="@/assets/invitation/Polygon.png" alt="" />
        </div>
      </div>
      <!-- <div class="top_m">
        <img src="@/assets/invitation/logo1.png" alt="" />
      </div> -->
      <div class="top_i"></div>
    </div>

    <div class="main">
      <div class="main_f" @click="showQrCode">
        <img src="@/assets/invitation/icon_qrCode.png" alt="" />
      </div>
      <div class="main_t">
        <img alt="logo" src="@/assets/images/logo.png" />
      </div>
      <div class="main_tt">
        <span class="meetingName">{{ detailData?.meetingName || '' }}</span>
      </div>
      <div class="main_tm">
        <span class="meetingNo">{{
          formatMeetingNo(detailData?.meetingNo)
        }}</span>
        <input
          id="MeetingNoValue"
          type="text"
          :value="detailData?.meetingNo"
          style="display: none"
        />
        <img
          class="main_tmi"
          src="@/assets/invitation/icon.png"
          alt=""
          @click="copyMeetingNo"
        />
      </div>
      <div class="main_m">
        <div class="main_mi">
          <div class="main_mit">
            <span class="startTime">{{
              formatTime(detailData?.startTime)
            }}</span>
          </div>
          <div class="main_mib">
            <span class="startDate">{{
              formatDate(detailData?.startTime)
            }}</span>
          </div>
        </div>
        <div class="main_mm">
          <div class="main_mmi"></div>
          <div class="main_mmm">
            <div class="main_mmmit meetingStatus">
              <span :class="getStatusClass(detailData?.planStatus)">{{
                getStatusText(detailData?.planStatus)
              }}</span>
            </div>
            <div class="main_mmmib">
              <span class="duration">{{ detailData?.duration || '' }}</span>
            </div>
          </div>
          <div class="main_mmi"></div>
        </div>
        <div v-if="detailData?.planType !== 2" class="main_mi">
          <div class="main_mit">
            <span class="endTime">{{
              detailData?.endTime
                ? formatTime(detailData.endTime)
                : langData.t21
            }}</span>
          </div>
          <div class="main_mib">
            <span class="endDate">{{
              detailData?.endTime ? formatDate(detailData.endTime) : ''
            }}</span>
          </div>
        </div>
        <div v-else class="main_mi">
          <div class="main_mit">
            <span class="duration">--</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 协作未结束 -->
    <div v-if="!isMeetingEnded" class="footer">
      <div class="f_m" @click="joinRoom">
        <span class="t8">{{ langData.t8 }}</span>
      </div>
      <div class="f_b">
        <span class="t10">{{ langData.t10 }}&nbsp;</span>
        <span class="t11 blue">{{ langData.t11 }}</span>
        <span class="t12">,&nbsp;</span>
      </div>
    </div>

    <!-- 协作结束 -->
    <div v-if="isMeetingEnded" class="footer_s">
      <div class="f_s">
        <div class="f_s_i"></div>
        <div class="f_s_m">
          <span class="t13">{{ langData.t13 }}</span>
        </div>
        <div class="f_s_i"></div>
      </div>
    </div>

    <!-- 显示二维码 -->
    <div v-if="showQrCodeModal" class="roomQRCode" @click="closeQrCode">
      <div class="room_qr_m" @click.stop>
        <div class="room_qr_c">
          <img
            src="@/assets/invitation/icon_close.png"
            alt=""
            @click="closeQrCode"
          />
        </div>
        <div class="room_qr_mt">
          <div class="main_tt">
            <span class="meetingName">{{ detailData?.meetingName || '' }}</span>
          </div>
          <div class="main_tm">
            <span class="meetingNo">{{
              formatMeetingNo(detailData?.meetingNo)
            }}</span>
          </div>
          <div class="main_m">
            <div class="main_mi">
              <div class="main_mit">
                <span class="startTime">{{
                  formatTime(detailData?.startTime)
                }}</span>
              </div>
              <div class="main_mib">
                <span class="startDate">{{
                  formatDate(detailData?.startTime)
                }}</span>
              </div>
            </div>
            <div class="main_mm">
              <div class="main_mmi"></div>
              <div class="main_mmm">
                <div class="main_mmmit meetingStatus">
                  <span :class="getStatusClass(detailData?.planStatus)">{{
                    getStatusText(detailData?.planStatus)
                  }}</span>
                </div>
                <div class="main_mmmib">
                  <span class="duration">{{ detailData?.duration || '' }}</span>
                </div>
              </div>
              <div class="main_mmi"></div>
            </div>
            <div class="main_mi">
              <div class="main_mit">
                <span class="endTime">{{
                  detailData?.endTime
                    ? formatTime(detailData.endTime)
                    : langData.t21
                }}</span>
              </div>
              <div class="main_mib">
                <span class="endDate">{{
                  detailData?.endTime ? formatDate(detailData.endTime) : ''
                }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="room_qr_mm">
          <div class="room_qr_mmi">
            <div ref="qrCodeContainer"></div>
          </div>
          <div class="room_qr_mmb">
            <span class="t14">{{ langData.t14 }}</span>
          </div>
        </div>
        <div class="room_qr_mb">
          <span class="t15">{{ langData.t15 }}</span>
        </div>
      </div>
    </div>

    <!-- 微信浏览器遮罩 -->
    <div v-if="isWeChat" class="cover" @touchstart.prevent>
      <img src="@/assets/invitation/cover.png" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed, nextTick } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import QRCode from 'qrcode';
  import { getMeetingDetailByToken, joinMeeting } from '@/api/invitation';
  import EventListener from '@/utils/event-listener';

  // 扩展Window接口
  declare global {
    interface Window {
      WebViewJavascriptBridge?: {
        callHandler: (
          method: string,
          data: any,
          callback?: (response: any) => void
        ) => void;
      };
    }
  }

  const route = useRoute();
  const router = useRouter();

  // 响应式数据
  const detailData = ref<any>(null);
  const showQrCodeModal = ref(false);
  const langData = ref<any>({});
  const isWeChat = ref(false);
  const qrCodeContainer = ref<HTMLElement | null>(null);

  // 语言配置
  const zhLang = {
    dTitle: '会议邀请',
    t1: '年',
    t2: '月',
    t3: '日',
    t4: '进行中',
    t5: '未开始',
    t6: '已结束',
    t8: '加入会议',
    t9: '语言',
    t10: '点击',
    t11: '加入会议',
    t12: '按钮',
    t13: '会议已结束',
    t14: '扫码加入会议',
    t15: '请使用手机扫描二维码加入会议',
    t16: '已复制',
    t17: '复制失败',
    t21: '--',
    t22: '已取消',
  };

  const enLang = {
    dTitle: 'Meeting Invitation',
    t1: '/',
    t2: '/',
    t3: '',
    t4: 'In Progress',
    t5: 'Not Started',
    t6: 'Ended',
    t8: 'Join Meeting',
    t9: 'Language',
    t10: 'Click',
    t11: 'Join Meeting',
    t12: 'button',
    t13: 'Meeting Ended',
    t14: 'Scan to Join Meeting',
    t15: 'Please scan the QR code with your phone to join the meeting',
    t16: 'Copied',
    t17: 'Copy Failed',
    t21: '--',
    t22: 'Cancelled',
  };

  // 计算属性
  const isMeetingEnded = computed(() => {
    return detailData.value?.status === 2 || detailData.value?.status === 3;
  });

  // 获取URL参数
  const getParameterByName = (name: string) => {
    return (route.query[name] as string) || null;
  };

  // 处理语言
  const handleLang = (type: string | null) => {
    if (!type || type === 'zh-CN') {
      langData.value = zhLang;
    } else {
      langData.value = enLang;
    }
    document.title = langData.value.dTitle;
  };

  // 检查是否微信浏览器
  const checkWeChat = () => {
    const ua = navigator.userAgent.toLowerCase();
    isWeChat.value = ua.includes('micromessenger');
  };

  // 获取会议详情
  const handleGetMeetingDetail = async () => {
    const token = getParameterByName('token');
    if (!token) {
      Message.error('缺少会议token');
      return;
    }

    try {
      const response = await getMeetingDetailByToken(token);
      if (response.code !== 200) {
        return;
      }
      detailData.value = response.data;
    } catch (error: any) {
      console.error('获取会议详情失败:', error);
      Message.error('获取会议详情失败');
    }
  };

  // 生成二维码
  const generateQRCode = async () => {
    if (!detailData.value?.qrCode) return;

    try {
      // 等待DOM更新
      await nextTick();
      if (qrCodeContainer.value) {
        qrCodeContainer.value.innerHTML = '';
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, detailData.value.qrCode, {
          width: 180,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        qrCodeContainer.value.appendChild(canvas);
      }
    } catch (error) {
      console.error('生成二维码失败:', error);
    }
  };

  // 格式化会议号
  const formatMeetingNo = (meetingNo: string) => {
    if (!meetingNo) return '';
    return meetingNo.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  };

  // 格式化日期
  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}${langData.value.t1}${month < 10 ? '0' : ''}${month}${
      langData.value.t2
    }${day < 10 ? '0' : ''}${day}${langData.value.t3}`;
  };

  // 获取状态样式类
  const getStatusClass = (status: number) => {
    switch (status) {
      case 1:
        return 'blue';
      case 2:
      case 3:
        return 'red';
      default:
        return 'orange';
    }
  };

  // 获取状态文本
  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return langData.value.t4;
      case 2:
        return langData.value.t6;
      case 3:
        return langData.value.t22;
      default:
        return langData.value.t5;
    }
  };

  // 显示二维码
  const showQrCode = async () => {
    showQrCodeModal.value = true;
    // 等待弹窗显示后再生成二维码
    await nextTick();
    await generateQRCode();
  };

  // 关闭二维码
  const closeQrCode = () => {
    showQrCodeModal.value = false;
  };

  // 复制会议号
  const copyMeetingNo = async () => {
    const meetingNo = detailData.value?.meetingNo;
    if (!meetingNo) return;

    try {
      if (navigator.userAgent.match(/android/i)) {
        // Android WebView 处理
        if (window.WebViewJavascriptBridge) {
          window.WebViewJavascriptBridge.callHandler(
            'writeToClipboard',
            meetingNo,
            (responseData: any) => {
              console.log('writeToClipboard-responseData', responseData);
              Message.success(`${langData.value.t16}: ${meetingNo}`);
            }
          );
        } else {
          Message.error(langData.value.t17);
        }
      } else {
        // 普通浏览器处理
        await navigator.clipboard.writeText(meetingNo);
        Message.success(`${langData.value.t16}: ${meetingNo}`);
      }
    } catch (error) {
      console.error('复制失败:', error);
      Message.error(langData.value.t17);
    }
  };

  // 加入会议
  const joinRoom = async () => {
    const token = getParameterByName('token');
    if (!token) {
      Message.error('缺少会议token');
      return;
    }
    try {
      const response = await joinMeeting({
        meetingToken: token,
      });
      if (response.code === 200) {
        // 已登录，直接跳转到会议列表并执行加入会议逻辑
        const meetingData = {
          meetingNo: detailData.value?.meetingNo,
        };

        // 跳转到会议列表页面
        router.push('/Meeting-list');

        // 等待路由跳转完成后执行加入会议逻辑
        await nextTick();
        // 延迟一点时间确保 default-layout 完全加载
        setTimeout(() => {
          console.log('发送 invitation-join-meeting 事件，数据:', meetingData);
          EventListener.emit('invitation-join-meeting', meetingData);
        }, 500);
      } else if (response.code === 401) {
        // 未登录，跳转到登录页面
        router.push({
          path: '/login',
          query: {
            redirect: '/Meeting-list',
            meetingToken: token,
            meetingNo: detailData.value?.meetingNo,
          },
        });
      } else {
        // 其他错误状态
        Message.error(response.msg || '加入会议失败');
      }
    } catch (error: any) {
      console.error('加入会议失败:', error);
      Message.error('加入会议失败');
    }
  };

  // 初始化页面
  onMounted(async () => {
    const langType = getParameterByName('lang');
    handleLang(langType);
    checkWeChat();
    await handleGetMeetingDetail();
  });
</script>

<style lang="less" scoped>
  @import './invitation.less';
</style>
