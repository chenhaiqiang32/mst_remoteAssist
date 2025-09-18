<template>
  <div class="qr-code-modal-container">
    <div class="qr-code-fixed" @click="handleClose">
      <closeIcon></closeIcon>
    </div>
    <div class="qr-code-main">
      <div
        class="qr-code-main-top"
        :style="{ backgroundImage: `url(${bgModalTop})` }"
      >
        <div class="qr-code-main-top-title">
          <span>{{ meetingDetail.subject }}</span>
        </div>
        <div class="qr-code-main-top-desc">
          <span>{{ t('meeting.qr.code.modal.desc') }}</span>
        </div>
        <div class="qr-code-main-top-bot">
          <span>{{ formattedMeetingNo(meetingDetail.meetingNo) }}</span>
        </div>
      </div>
      <div
        class="qr-code-main-mid"
        :style="{ backgroundImage: `url(${bgModalBot})` }"
      >
        <div class="qr-code-main-mid-body">
          <!-- 二维码 -->
          <div ref="qrCodeContainer" class="qr-code-container"></div>
        </div>
      </div>
    </div>
    <div class="qr-code-main-bot">
      <div class="qr-code-main-bot-desc">
        <span>{{ t('meeting.qr.code.modal.desc1') }}</span>
      </div>
      <div class="qr-code-main-bot-b" @click="handleDownloadQrCode">
        <div class="qr-code-main-bot-b-l">
          <IconDownloadImage></IconDownloadImage>
        </div>
        <div class="qr-code-main-bot-b-r">
          <span>{{ t('meeting.qr.code.modal.desc2') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onBeforeUnmount, onMounted } from 'vue';
  import QRCode from 'qrcode';
  import html2canvas from 'html2canvas';

  import { useI18n } from 'vue-i18n';
  import { formattedMeetingNo } from '@/utils';

  import closeIcon from '@/assets/svg/meeting/icon_share_close.svg';
  import IconDownloadImage from '@/assets/svg/icon_image_down.svg';
  import bgModalTop from '@/assets/images/qr_code/bg_modal_1.png';
  import bgModalBot from '@/assets/images/qr_code/bg_modal_2.png';
  import logoIcon from '@/assets/images/logo_icon.png';

  const qrCodeContainer = ref<HTMLDivElement | null>(null);

  const emit = defineEmits(['handleClose']);
  const { t } = useI18n();
  const isDownloading = ref(true);
  const handleClose = () => {
    emit('handleClose');
  };
  const props = defineProps<{
    meetingDetail: any;
  }>();
  const meetingDetail = ref({
    ...props.meetingDetail,
  });
  const handleInitQrCode = () => {
    if (qrCodeContainer.value) {
      // 创建二维码
      QRCode.toCanvas(
        meetingDetail.value.qrCodeStr,
        {
          errorCorrectionLevel: 'H', // 高级纠错能力，以便插入 icon
          width: 180, // 二维码宽度
          margin: 2, //
        },
        (err: any, canvas: any) => {
          if (err) {
            console.error(err);
            return;
          }
          // 将二维码添加到容器中
          if (qrCodeContainer.value) {
            qrCodeContainer.value.appendChild(canvas);
          }

          // 插入 icon (SVG)
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const iconSize = 30; // icon 大小
            const centerX = (canvas.width - iconSize) / 2;
            const centerY = (canvas.height - iconSize) / 2;
            // 绘制圆角矩形
            ctx.beginPath();
            ctx.moveTo(centerX + 5, centerY); // 左上角的弧
            ctx.lineTo(centerX + iconSize - 5, centerY); // 上边线
            ctx.quadraticCurveTo(
              centerX + iconSize,
              centerY,
              centerX + iconSize,
              centerY + 5
            ); // 右上角的弧
            ctx.lineTo(centerX + iconSize, centerY + iconSize - 5); // 右边线
            ctx.quadraticCurveTo(
              centerX + iconSize,
              centerY + iconSize,
              centerX + iconSize - 5,
              centerY + iconSize
            ); // 右下角的弧
            ctx.lineTo(centerX + 5, centerY + iconSize); // 下边线
            ctx.quadraticCurveTo(
              centerX,
              centerY + iconSize,
              centerX,
              centerY + iconSize - 5
            ); // 左下角的弧
            ctx.lineTo(centerX, centerY + 5); // 左边线
            ctx.quadraticCurveTo(centerX, centerY, centerX + 5, centerY); // 左上角的弧
            ctx.closePath();

            // 填充白色背景
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            // 绘制黑色边框
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 插入 icon 图标
            const img = new Image();
            img.src = logoIcon;
            img.onload = () => {
              ctx.drawImage(
                img,
                centerX + 2.5,
                centerY + 2.5,
                iconSize - 5,
                iconSize - 5
              ); // 留一点 padding
            };
          }
        }
      );
    }
  };
  const handleDownloadQrCode = () => {
    isDownloading.value = false;
    const qrCodeMain = document.querySelector('.qr-code-main') as HTMLElement;
    if (qrCodeMain) {
      html2canvas(qrCodeMain, {
        backgroundColor: null, // 设置背景为透明
        useCORS: true, // 确保跨域图片正常加载
      })
        .then((canvas) => {
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `${meetingDetail.value.meetingNo}.png`;
          link.click();
          isDownloading.value = true;
        })
        .catch(() => {
          isDownloading.value = true;
        });
    }
  };
  onMounted(() => {
    handleInitQrCode();
  });
  onBeforeUnmount(() => {
    meetingDetail.value = null;
  });
</script>

<style lang="less" scoped>
  .qr-code-modal-container {
    width: 100%;
    border-radius: 8px;
    position: relative;
    .qr-code-fixed {
      cursor: pointer;
      position: absolute;
      right: 0;
      top: 0px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-code-main {
      padding-top: 40px;
      .qr-code-main-top {
        width: 100%;
        min-height: 180px;
        background-repeat: no-repeat;
        background-size: 100% 100%;
        padding: 40px 40px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .qr-code-main-top-title {
          text-align: center;
          span {
            font-size: 20px;
            color: #000;
            font-weight: 400;
          }
        }
        .qr-code-main-top-desc {
          margin-top: 16px;
          margin-bottom: 4px;
          text-align: center;
          span {
            font-weight: 400;
            font-size: 14px;
            color: #93a1c0;
          }
        }
        .qr-code-main-top-bot {
          min-height: 48px;
          line-height: 48px;
          text-align: center;
          span {
            font-weight: 400;
            font-size: 32px;
            color: #000000;
          }
        }
      }
      .qr-code-main-mid {
        height: 307px;
        background-repeat: no-repeat;
        background-size: 100% 100%;
        .qr-code-main-mid-body {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 31px 0 21px;
          .qr-code-container {
            width: fit-content;
            border-radius: 10px;
            border: 1px solid #dbdbdb;
            overflow: hidden;
          }
        }
      }
    }
    .qr-code-main-bot {
      width: 100%;
      cursor: pointer;
      position: absolute;
      bottom: 24px;
      .qr-code-main-bot-desc {
        margin-bottom: 15px;
        text-align: center;
        span {
          font-weight: 400;
          font-size: 12px;
          color: #000000;
        }
      }
      .qr-code-main-bot-b {
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        .qr-code-main-bot-b-l {
          flex-shrink: 0;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qr-code-main-bot-b-r {
          margin-left: 4px;
          span {
            font-weight: 400;
            font-size: 12px;
            color: #0267ff;
          }
        }
      }
    }
  }
</style>
