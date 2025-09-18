<template>
  <MstModal>
    <div class="glass-qr-modal-container">
      <div class="glass-qr-fixed" @click="handleClose">
        <img :src="closeIcon" alt="" />
      </div>
      <div class="glass-qr-m-t borderB">
        {{ t('mst.glass.modal.title') }}
      </div>
      <div class="glass-qr-m-m">
        <div class="qr-code-main-mid-body">
          <!-- 二维码 -->
          <div ref="qrCodeContainer" class="qr-code-container"></div>
        </div>
        <div class="qr-code-main-mid-desc">
          <span>{{ t('mst.glass.modal.desc') }}</span>
        </div>
      </div>
    </div>
  </MstModal>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import QRCode from 'qrcode';
  import i18n from '../../../../locale/index';
  import useThMeetingStore from '../../../../store';
  // import THEventBus from '../../../../services/THEventBus';
  import MstModal from '../../../../components/modal/index.vue';

  import closeIcon from '../../assets/icons/icon_close.png';
  import logoIcon from '../../assets/icons/icon_glass_qr_logo.png';
  import Msg from '../../../../services/msg';

  const qrCodeContainer = ref<HTMLDivElement | null>(null);
  const emit = defineEmits(['handleClose']);
  const { t } = i18n.global;
  const ThMeetingStore = useThMeetingStore();
  const handleClose = () => {
    emit('handleClose');
  };
  const handleInitQrCode = async () => {
    const res: any = await ThMeetingStore.ThImEvent.getGlassQrCode({
      meetingNo: ThMeetingStore.meetingInfo.meetingNo,
    });
    if (res.code !== 200 && res.code !== 401) {
      Msg.error(res.msg);
      return;
    }
    if (qrCodeContainer.value) {
      // 创建二维码
      QRCode.toCanvas(
        res.data,
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
  onMounted(() => {
    handleInitQrCode();
  });
</script>

<style lang="less" scoped>
  .glass-qr-modal-container {
    width: 551px;
    background: #ffffff;
    border-radius: 8px;
    position: relative;
    .glass-qr-fixed {
      cursor: pointer;
      position: absolute;
      right: 30px;
      top: 22px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #f4f6fd;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
      }
    }
    .glass-qr-m-t {
      height: 76px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      font-weight: 500;
      font-size: 20px;
      color: #333f4e;
      &.borderB {
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
    }
    .glass-qr-m-m {
      width: 100%;
      padding: 26px 30px 23px;
      max-height: 400px;
      .qr-code-main-mid-body {
        display: flex;
        align-items: center;
        justify-content: center;
        .qr-code-container {
          width: fit-content;
          border-radius: 10px;
          border: 1px solid #dbdbdb;
          overflow: hidden;
        }
      }
      .qr-code-main-mid-desc {
        margin-top: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        span {
          font-weight: 400;
          font-size: 16px;
          color: #333f4e;
          text-align: center;
        }
      }
    }
    .glass-qr-m-b {
      width: 100%;
      height: 96px;
      padding: 0 30px;
      box-shadow: 4px 4px 20px 0px rgba(32, 73, 109, 0.1);
      .glass-qr-m-b-btn {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        .glass-qr-m-b-btn-i {
          cursor: pointer;
          flex-shrink: 0;
          width: 236px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #0267ff;
          border-radius: 4px;
          margin: 0 8px;
          span {
            font-weight: 500;
            font-size: 15px;
          }

          &.btn-border {
            box-shadow: 0px 8px 30px 0px rgba(65, 89, 214, 0.3);
            border-radius: 4px;
            span {
              color: #0267ff;
            }
          }
          &.btn-bg {
            background: #0267ff;
            box-shadow: 0px 8px 30px 0px rgba(65, 89, 214, 0.3);
            span {
              color: #ffffff;
            }
          }
        }
      }
    }
  }
</style>
