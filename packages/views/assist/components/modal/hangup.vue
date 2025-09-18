<template>
  <MstModal>
    <div class="hangup-modal-container">
      <div class="hangup-m-t">
        <span>{{ t('mst.modal.hangup.title') }}</span>
      </div>
      <div class="hangup-m-d">
        <span
          v-if="
            ThMeetingStore.meetingInfo.masterId ===
            ThMeetingStore.mineInfo.userId
          "
          >{{ t('mst.modal.hangup.desc') }}</span
        >
        <span v-else>{{ t('mst.modal.hangup.desc1') }}</span>
      </div>
      <div class="hangup-m-m">
        <div
          v-if="
            ThMeetingStore.meetingInfo.masterId ===
            ThMeetingStore.mineInfo.userId
          "
          class="hangup-m-m-i btn-warning"
          @click="handleOver"
        >
          <span> {{ t('mst.modal.hangup.end') }}</span>
        </div>
        <div class="hangup-m-m-i btn-warning-border" @click="handleLeave">
          <span> {{ t('mst.modal.hangup.leave') }}</span>
        </div>
        <div class="hangup-m-m-i btn-normal" @click="handleCancel">
          <span> {{ t('mst.modal.cancel') }}</span>
        </div>
      </div>
    </div>
  </MstModal>
</template>

<script lang="ts" setup>
  import i18n from '../../../../locale/index';
  import MstModal from '../../../../components/modal/index.vue';
  import THEventBus from '../../../../services/THEventBus';
  import IndexDBService from '../../../../utils/db';
  import useThMeetingStore from '../../../../store';

  const emit = defineEmits(['handleClose']);
  const { t } = i18n.global;
  const ThMeetingStore = useThMeetingStore();
  const handleClose = () => {
    const messageDB = new IndexDBService();
    messageDB.deleteChatSessionsTable();
    emit('handleClose');
  };
  const handleOver = async () => {
    handleClose();
    THEventBus.emit('th-hangup-over-meeting');
  };
  const handleLeave = () => {
    handleClose();
    THEventBus.emit('th-hangup-leave-meeting');
  };
  const handleCancel = () => {
    handleClose();
  };
</script>

<style lang="less" scoped>
  .hangup-modal-container {
    width: 301px;
    background: #ffffff;
    border-radius: 8px 8px 8px 8px;
    padding: 0 35px 20px;
    .hangup-m-t {
      height: 76px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      font-weight: 500;
      font-size: 20px;
      color: #333f4e;
    }
    .hangup-m-d {
      min-height: 54px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        font-weight: 400;
        font-size: 14px;
        color: #344050;
        line-height: 16px;
      }
    }
    .hangup-m-m {
      width: 100%;
      .hangup-m-m-i {
        cursor: pointer;
        width: 236px;
        height: 46px;
        margin-bottom: 14px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        span {
          font-weight: 500;
          font-size: 15px;
        }
      }
    }
  }
  .btn-warning {
    background: #ff3939;
    color: #ffffff;
    &:hover {
      background: darken(#ff3939, 10%);
    }
  }

  .btn-warning-border {
    background: #ffffff;
    color: #ff3939;
    border: 1px solid #ff3939;
    &:hover {
      background: #fff3f3;
    }
  }

  .btn-normal {
    background: #f1f1f1;
    color: #333f4e;
    &:hover {
      background: #f1f1f1;
    }
  }
</style>
