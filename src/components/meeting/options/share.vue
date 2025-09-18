<template>
  <div class="link-modal-container">
    <div class="link-fixed" @click="handleClose">
      <img :src="closeIcon" alt="" />
    </div>
    <div class="link-m-t borderB">
      {{ t('meeting.invite.link.modal.title') }}
    </div>
    <div class="link-m-m">
      <div class="link-m-m-m">
        <div class="link-m-m-mt">
          <span class="name">{{ linkInfo?.name }}</span>
          <span>{{ t('meeting.invite.link.modal.text1') }}</span>
        </div>
        <div class="link-m-m-md">
          <span>{{ t('meeting.invite.link.modal.text2') }}:</span>
          <span>{{ linkInfo?.subject }}</span>
        </div>
        <div class="link-m-m-mm">
          <span>{{ t('meeting.invite.link.modal.text5') }}:</span>
          <span v-if="linkInfo?.planType === 1 || linkInfo?.planType === 0">
            {{ handleGetYMD(linkInfo?.startTime) }}
            {{ handleGetHM(linkInfo?.startTime) }}
            {{ linkInfo?.endTime ? '~' : '' }}
            {{ handleGetYMD(linkInfo?.endTime) }}
            {{ handleGetHM(linkInfo?.endTime) }}</span
          >
          <span v-if="linkInfo?.planType === 2">{{
            t('meeting.invite.link.modal.text6')
          }}</span>
        </div>
        <div class="link-m-m-mf">
          <span>{{ t('meeting.invite.link.modal.text4') }}:</span>
          <span>{{ linkInfo?.meetingNo }}</span>
        </div>
        <div class="link-m-m-mb">
          <span>{{ t('meeting.invite.link.modal.text3') }}:</span>
          <span>{{ linkInfo?.inviteUrl }}</span>
        </div>
      </div>
    </div>
    <div class="link-m-b">
      <div class="link-m-b-btn">
        <div class="link-m-b-btn-i btn-border" @click="handleCopyAll">
          <span>{{ t('meeting.invite.link.modal.btn.copy.all') }}</span>
        </div>
        <div class="link-m-b-btn-i btn-bg" @click="handelCopyLink">
          <span>{{ t('meeting.invite.link.modal.btn.copy.link') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useMeetingStore, useUserStore } from '@/store';
  import { useI18n } from 'vue-i18n';

  import closeIcon from '@/assets/icons/icon_close.png';

  import { Message } from '@arco-design/web-vue';
  import { useWujieTools } from '@/utils/wujie/hooks';

  const emit = defineEmits(['handleClose']);
  const meetingStore = useMeetingStore();
  const userStore = useUserStore();
  const { t } = useI18n();
  const props = defineProps<{
    meetingDetail: any;
  }>();
  const meetingDetail = ref({
    ...props.meetingDetail,
  });
  const linkInfo: any = ref(null);
  const handleClose = () => {
    emit('handleClose');
  };
  const handleGetMeetingShareInfo = async () => {
    const res: any = await meetingStore.getMeetingShareInfo({
      meetingNo: meetingDetail.value.meetingNo,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      return;
    }
    linkInfo.value = res.data;
  };
  const handleGetHM = (timestamp: any) => {
    if (!timestamp) {
      return '';
    }
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${
      minutes < 10 ? '0' : ''
    }${minutes}`;
    return formattedTime;
  };
  const handleGetYMD = (timestamp: any) => {
    if (!timestamp) {
      return '';
    }
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 注意：月份从0开始，所以要加1
    const day = date.getDate();
    const formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${
      day < 10 ? '0' : ''
    }${day}`;
    return formattedDate;
  };
  const { isWujie, Copy } = useWujieTools();
  const handleCopyAll = () => {
    const time =
      linkInfo?.value.planType === 1 || linkInfo?.value.planType === 0
        ? `${handleGetYMD(linkInfo?.value.startTime)} ${handleGetHM(
            linkInfo?.value.startTime
          )} ～ ${handleGetYMD(linkInfo?.value.endTime)} ${handleGetHM(
            linkInfo?.value.endTime
          )}`
        : t('meeting.invite.link.modal.text6');
    const message = `${userStore.name} ${t(
      'meeting.invite.link.modal.text1'
    )} \n${t('meeting.invite.link.modal.text2')}: ${
      linkInfo.value.subject
    } \n${t('meeting.invite.link.modal.text5')}: ${time} \n${t(
      'meeting.invite.link.modal.text4'
    )}: ${linkInfo.value.meetingNo} \n${t(
      'meeting.invite.link.modal.text3'
    )}: ${linkInfo.value.inviteUrl} `;

    if (isWujie.value) {
      Copy(message);
      Message.success(t('meeting.invite.link.modal.msg.copy.success'));
      return;
    }
    navigator.clipboard
      .writeText(message)
      .then(() => {
        Message.success(t('meeting.invite.link.modal.msg.copy.success'));
      })
      .catch((err: any) => {
        console.log(err);
        Message.error(t('meeting.invite.link.modal.msg.copy.fail'));
      });
  };

  const handelCopyLink = () => {
    const message = `${linkInfo.value.inviteUrl}`;
    if (isWujie.value) {
      Copy(message);
      Message.success(t('meeting.invite.link.modal.msg.copy.success'));
      return;
    }
    navigator.clipboard
      .writeText(message)
      .then(() => {
        Message.success(t('meeting.invite.link.modal.msg.copy.success'));
      })
      .catch((err: any) => {
        console.log(err);
        Message.error(t('meeting.invite.link.modal.msg.copy.fail'));
      });
  };
  onMounted(() => {
    handleGetMeetingShareInfo();
  });
</script>

<style lang="less" scoped>
  .link-modal-container {
    width: 100%;
    background: #ffffff;
    border-radius: 8px;
    position: relative;
    .link-fixed {
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
    .link-m-t {
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
    .link-m-m {
      width: 100%;
      padding: 26px 30px 23px;
      max-height: 400px;
      .link-m-m-m {
        width: 100%;
        padding: 28px 24px 31px;
        background: #f4f6fb;
        border-radius: 4px;
        font-weight: 400;
        font-size: 14px;
        color: rgba(52, 64, 80, 1);
        line-height: 16px;
        .link-m-m-mt {
          span {
            &.name {
              color: rgba(2, 103, 255, 1);
              margin-right: 5px;
            }
          }
        }
        .link-m-m-md {
          margin-top: 15px;
        }
        .link-m-m-mm {
          margin-top: 12px;
        }
        .link-m-m-mf {
          margin-top: 12px;
        }
        .link-m-m-mb {
          margin-top: 28px;
        }
      }
    }
    .link-m-b {
      width: 100%;
      height: 96px;
      padding: 0 30px;
      box-shadow: 4px 4px 20px 0px rgba(32, 73, 109, 0.1);
      .link-m-b-btn {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        .link-m-b-btn-i {
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
