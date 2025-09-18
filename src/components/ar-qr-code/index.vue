<template>
  <div class="ar-qr-code-modal-container">
    <div class="ar-qr-code-fixed" @click="handleClose">
      <img :src="closeIcon" alt="" />
    </div>
    <div class="ar-qr-code-main">
      <div class="ar-qr-code-main-top">
        <span>{{ t('ar.qr.code.modal.title') }}</span>
      </div>
      <div class="ar-qr-code-main-mid-body">
        <!-- 二维码 -->
        <div ref="qrCodeContainer" class="ar-qr-code-container"></div>
      </div>
    </div>
    <div class="ar-qr-code-main-bot">
      <div class="ar-qr-code-main-bot-desc">
        <span>{{ t('ar.qr.code.modal.desc1') }}</span>
      </div>
      <!-- <div class="ar-qr-code-main-bot-b" @click="handleDownloadQrCode">
        <div class="ar-qr-code-main-bot-b-l">
          <IconDownloadImage></IconDownloadImage>
        </div>
        <div class="ar-qr-code-main-bot-b-r">
          <span>{{ t('ar.qr.code.modal.desc2') }}</span>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onBeforeUnmount, onMounted } from 'vue';
  import QRCode from 'qrcode';
  import html2canvas from 'html2canvas';

  import { useI18n } from 'vue-i18n';

  import IconDownloadImage from '@/assets/svg/icon_image_down.svg';
  import closeIcon from '@/assets/options/icon_close.png';
  import { useUserStore, useCommonStore } from '@/store';
  import { Message } from '@arco-design/web-vue';

  const qrCodeContainer = ref<HTMLDivElement | null>(null);

  const emit = defineEmits(['handleClose']);
  const { t } = useI18n();
  const isDownloading = ref(true);
  const handleClose = () => {
    emit('handleClose');
  };
  const userStore = useUserStore();
  const commonStore = useCommonStore();
  const qrCodeDetail = ref('');
  const handleLoadQrCodeText = async () => {
    const res: any = await userStore.getArLoginQrCode({
      command: 0,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      return;
    }
    qrCodeDetail.value = res.data;
  };
  const handleInitQrCode = async () => {
    if (qrCodeContainer.value) {
      await handleLoadQrCodeText();

      // 清除之前的二维码和名字
      qrCodeContainer.value.innerHTML = '';

      // 创建二维码
      QRCode.toCanvas(
        qrCodeDetail.value,
        {
          errorCorrectionLevel: 'H', // 高级纠错能力，以便插入 icon
          width: 180, // 二维码宽度
          margin: 2,
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
            img.src = commonStore.platformConfig?.oneToOneLogo;
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

          // 添加人员名称并居中
          if (qrCodeContainer.value) {
            const nameElement = document.createElement('div');
            nameElement.textContent = userStore.name ? userStore.name : ''; // 替换为实际的人员名称
            nameElement.style.textAlign = 'center';
            qrCodeContainer.value.appendChild(nameElement);
          }
        }
      );
    }
  };

  const handleDownloadQrCode = () => {
    isDownloading.value = false;
    const qrCodeMain = document.querySelector(
      '.ar-qr-code-main'
    ) as HTMLElement;
    if (qrCodeMain) {
      html2canvas(qrCodeMain, {
        backgroundColor: null, // 设置背景为透明
        useCORS: true, // 确保跨域图片正常加载
      })
        .then((canvas) => {
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = `${userStore.name}.png`;
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
    qrCodeDetail.value = '';
  });
</script>

<style lang="less" scoped>
  .ar-qr-code-modal-container {
    width: 100%;
    border-radius: 8px;
    position: relative;
    .ar-qr-code-fixed {
      cursor: pointer;
      position: absolute;
      right: 25px;
      top: 20px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f4f6fd;
      border-radius: 50%;
    }
    .ar-qr-code-main {
      padding-top: 40px;
      .ar-qr-code-main-top {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        span {
          text-align: center;
          font-size: 20px;
          color: #000;
          font-weight: 400;
        }
      }
      .ar-qr-code-main-mid-body {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 31px 0 100px;
        .ar-qr-code-container {
          width: fit-content;
          border-radius: 10px;
          border: 1px solid #dbdbdb;
          overflow: hidden;
        }
      }
    }
    .ar-qr-code-main-bot {
      width: 100%;
      cursor: pointer;
      position: absolute;
      bottom: 24px;
      .ar-qr-code-main-bot-desc {
        margin-bottom: 15px;
        text-align: center;
        span {
          font-weight: 400;
          font-size: 12px;
          color: #000000;
        }
      }
      .ar-qr-code-main-bot-b {
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        .ar-qr-code-main-bot-b-l {
          flex-shrink: 0;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ar-qr-code-main-bot-b-r {
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
