<template>
  <MstModal>
    <div class="download-modal-container">
      <div class="download-fixed" @click="handleClose">
        <img :src="closeIcon" alt="" />
      </div>
      <div class="download-m-t"> {{ t('mst.download.file.modal.title') }} </div>
      <div class="download-m-tab">
        <div class="download-m-t-m">
          <div
            :class="fileType === 0 ? 'active' : ''"
            class="download-m-t-i"
            @click="handleSelectType(0)"
          >
            <span>{{ t('mst.download.file.modal.tab.img') }}</span>
          </div>
          <div
            :class="fileType === 1 ? 'active' : ''"
            class="download-m-t-i"
            @click="handleSelectType(1)"
          >
            <span>{{ t('mst.download.file.modal.tab.video') }}</span>
          </div>
          <div
            :class="fileType === 2 ? 'active' : ''"
            class="download-m-t-i"
            @click="handleSelectType(2)"
          >
            <span>{{ t('mst.download.file.modal.tab.file') }}</span>
          </div>
        </div>
      </div>
      <div
        v-if="fileList && fileList.length > 0"
        :class="fileType === 1 ? 'max' : ''"
        class="download-m-m wsl-scroll"
      >
        <div
          v-for="(item, index) in fileList"
          :key="`file_${index}_${item.fileId}`"
          class="download-m-m-i"
          @click="handleDownload(item)"
        >
          <!-- <div
            v-if="fileType !== 1"
            class="download-m-m-i-l"
            @click="handleSelectRow(item)"
          >
            <img
              :src="isFileSelected(item.fileId) ? selectActiveIcon : selectIcon"
              alt="avatar"
            />
          </div> -->
          <div class="download-m-m-i-r">
            <div class="download-m-m-i-rl" @click.stop="handleCheck(item)">
              <img
                v-if="item.attachmentType === 0"
                :src="item.attachmentUrl"
                alt=""
              />
              <SvgMp4Icon v-if="item.attachmentType === 1"></SvgMp4Icon>
              <SvgPdfIcon v-if="item.attachmentType === 2"></SvgPdfIcon>
              <SvgExcelIcon v-if="item.attachmentType === 3"></SvgExcelIcon>
              <SvgWordIcon
                v-if="item.attachmentType === 4 || item.attachmentType === 5"
              ></SvgWordIcon>
              <SvgPackageIcon v-if="item.attachmentType === 6"></SvgPackageIcon>
              <SvgPptIcon v-if="item.attachmentType === 7"></SvgPptIcon>
              <SvgUnknownIcon
                v-if="item.attachmentType === -1"
              ></SvgUnknownIcon>
            </div>
            <div class="download-m-m-i-rm">
              <div class="download-m-m-i-rm-t text-ellipsis">
                {{ item.attachmentName }}
              </div>
              <div class="download-m-m-i-rm-b">
                <span>{{ showMasterName(item.masterId) }} &nbsp;</span>
                <span>{{ showTime(item.createdTime) }}</span>
              </div>
            </div>
            <div class="download-m-m-i-rr">
              <img :src="downloadIcon" alt="" />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="download-m-m-no-data">
        <span>{{ t('mst.menu.scene.file.msg.desc1') }}</span>
      </div>
      <!-- <div v-if="fileType !== 1" class="download-m-b">
        <div class="download-m-b-l">
          <span> {{ t('mst.download.file.modal.selected') }} &nbsp;</span>
          <span class="num"> {{ selectFileList.length }}</span>
        </div>
        <div class="download-m-b-r">
          <div class="download-m-b-r-btn" @click="handleDownload">
            <span>{{ t('mst.download.file.modal.download') }}</span>
          </div>
        </div>
      </div> -->
    </div>
  </MstModal>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import useThMeetingStore from '../../../../store';
  import { downloadFile } from '../../../../utils';
  import msg from '../../../../services/msg';

  import i18n from '../../../../locale/index';
  import MstModal from '../../../../components/modal/index.vue';
  import closeIcon from '../../assets/icons/icon_close.png';
  // import selectIcon from '../../../icons/icon_select_no.png';
  // import selectActiveIcon from '../../../icons/icon_select.png';
  import downloadIcon from '../../../icons/icon_download.png';
  import SvgExcelIcon from '../../assets/board/file/icon_excel.svg';
  import SvgMp4Icon from '../../assets/board/file/icon_mp4.svg';
  import SvgPackageIcon from '../../assets/board/file/icon_package.svg';
  import SvgPdfIcon from '../../assets/board/file/icon_pdf.svg';
  import SvgPptIcon from '../../assets/board/file/icon_ppt.svg';
  import SvgUnknownIcon from '../../assets/board/file/icon_unknown.svg';
  import SvgWordIcon from '../../assets/board/file/icon_word.svg';

  const emit = defineEmits(['handleClose']);
  const { t } = i18n.global;
  const ThMeetingStore = useThMeetingStore();
  const handleClose = () => {
    emit('handleClose');
  };
  const fileType: any = ref(0);
  // 文件列表
  const fileList: any = ref([]);
  const handleGetFile = async () => {
    const res: any = await ThMeetingStore.ThImEvent.getMeetingFile({
      meetingId: ThMeetingStore.meetingInfo.meetingId,
      attachmentType: fileType.value,
    });
    if (res.code !== 200 && res.code !== 401) {
      msg.error(res.msg);
      return;
    }
    fileList.value = res.data;
  };
  const handleCheck = (data: any) => {
    if (
      fileType.value === 0 ||
      fileType.value === 1 ||
      fileType.value === 2 ||
      fileType.value === 5
    ) {
      window.open(data.attachmentUrl, '_blank');
    }
  };
  const handleSelectType = (type: any) => {
    fileType.value = type;
    handleGetFile();
  };

  // 文件选择集合
  // const selectFileList = ref<any[]>([]);
  // const isFileSelected = (fileId: any) => {
  //   return selectFileList.value.some((item) => item.fileId === fileId);
  // };
  // const handleSelectRow = (data: any) => {
  //   const index = selectFileList.value.findIndex(
  //     (item) => item.fileId === data.fileId
  //   );
  //   if (index === -1) {
  //     // fileId 不存在，添加到 selectFileList 中
  //     selectFileList.value.push(data);
  //   } else {
  //     // fileId 已存在，从 selectFileList 中移除
  //     selectFileList.value.splice(index, 1);
  //   }
  // };
  const handleDownload = async (data: any) => {
    // 获取文件的 URL
    // const url = data.attachmentUrl;
    const response = await fetch(data.attachmentUrl);
    if (!response.ok) {
      throw new Error('文件下载失败');
    }
    // 将响应转为 Blob
    const blob = await response.blob();
    downloadFile(blob, data.attachmentName, blob.type);
  };

  const showMasterName = (userId: number) => {
    const member = ThMeetingStore.filterMemberInfo(userId);
    return member?.name;
  };
  const showTime = (time: number) => {
    const date = new Date(time);

    // 获取年份、月份、日期、小时、分钟和秒
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // 返回格式化的日期字符串，格式为：YYYY-MM-DD HH:mm:ss
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  onMounted(() => {
    handleGetFile();
  });
</script>

<style lang="less" scoped>
  .download-modal-container {
    width: 551px;
    background: #ffffff;
    border-radius: 8px 8px 8px 8px;
    position: relative;
    overflow: hidden;
    .download-fixed {
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
    .download-m-t {
      height: 76px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 20px;
      color: #333f4e;
    }
    .download-m-tab {
      height: 48px;
      padding: 0 30px;
      .download-m-t-m {
        width: 100%;
        height: 100%;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f3f9ff;
        border-radius: 4px;
        .download-m-t-i {
          cursor: pointer;
          width: calc(100% / 3);
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          span {
            font-weight: 400;
            font-size: 16px;
            color: #0a1629;
          }
          &.active {
            background: #0267ff;
            border-radius: 4px;
            span {
              font-weight: bold;
              font-size: 16px;
              color: #ffffff;
            }
          }
        }
      }
    }
    .download-m-m {
      width: 100%;
      padding: 0 30px;
      max-height: 400px;
      min-height: 400px;
      margin-top: 11px;
      .download-m-m-i {
        cursor: pointer;
        display: flex;
        align-items: center;
        height: 79px;
        margin: 2px 0;
        padding: 0 12px 0 14px;
        border-radius: 4px;
        .download-m-m-i-l {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          cursor: pointer;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .download-m-m-i-r {
          width: auto;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          .download-m-m-i-rl {
            flex-shrink: 0;
            width: 100px;
            height: 56px;
            border-radius: 4px 4px 4px 4px;
            border: 1px solid #d1d8e3;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            background: #f3f9ff;
            border-radius: 4px;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .download-m-m-i-rm {
            width: 300px;
            .download-m-m-i-rm-t {
              min-height: 20px;
              width: 100%;
              font-weight: 400;
              font-size: 14px;
              color: #333f4e;
              line-height: 20px;
              margin-bottom: 2px;
            }
            .download-m-m-i-rm-b {
              min-height: 20px;
              span {
                font-weight: 400;
                font-size: 12px;
                color: #a1a7ae;
              }
            }
          }
          .download-m-m-i-rr {
            width: 24px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            img {
              flex-shrink: 0;
              display: none;
              width: 24px;
              height: 24px;
            }
          }
        }
        &:hover {
          background: #f5f5f5;
          .download-m-m-i-r {
            .download-m-m-i-rr {
              img {
                display: inline-block;
              }
            }
          }
        }
      }
      &.max {
        max-height: 496px;
        padding-bottom: 12px;
        .download-m-m-i-rm {
          width: 330px !important;
        }
      }
    }
    .download-m-m-no-data {
      width: 100%;
      padding: 0 30px;
      max-height: 400px;
      min-height: 400px;
      margin-top: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        color: #a1a7ae;
        font-size: 12px;
      }
    }
    .download-m-b {
      width: 100%;
      height: 96px;
      padding-left: 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff;
      box-shadow: 4px 4px 20px 0px rgba(32, 73, 109, 0.1);
      .download-m-b-l {
        width: calc(100% - 182px);
        height: 40px;
        display: flex;
        align-items: center;
        span {
          font-weight: 400;
          font-size: 16px;
          color: #333f4e;
          &.num {
            color: #0267ff;
          }
        }
      }
      .download-m-b-r {
        flex-shrink: 0;
        width: 182px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        .download-m-b-r-btn {
          cursor: pointer;
          width: 132px;
          height: 46px;
          background: #0267ff;
          box-shadow: 0px 8px 30px 0px rgba(65, 89, 214, 0.3);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          span {
            font-weight: 500;
            font-size: 15px;
            color: #ffffff;
          }
        }
      }
    }
  }
  .text-ellipsis {
    overflow: hidden;
    white-space: nowrap;
    /*文字超出宽度则显示ellipsis省略号*/
    text-overflow: ellipsis;
  }
</style>
