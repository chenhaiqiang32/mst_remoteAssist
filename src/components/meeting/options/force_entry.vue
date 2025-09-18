<template>
  <div class="room-options-container">
    <div class="room-fixed" @click="handleClose">
      <img :src="closeIcon" alt="" />
    </div>
    <div class="link-m-t borderB">
      <span>{{ t('meeting.modal.title') }}</span>
    </div>
    <div class="room-options-main">
      <span>{{ t('meeting.modal.force.desc') }}</span>
    </div>
    <div class="link-m-b">
      <div class="link-m-b-btn">
        <div class="link-m-b-btn-i btn-border" @click="handleClose">
          <span>{{ t('meeting.modal.btn.cancel') }}</span>
        </div>
        <div class="link-m-b-btn-i btn-bg" @click="debounceJoinMeeting">
          <span>{{ t('meeting.modal.btn.sure') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { debounce } from 'lodash-es';

  import closeIcon from '@/assets/options/icon_close.png';

  import { useI18n } from 'vue-i18n';

  const emit = defineEmits(['handleClose', 'handleJoinMeeting']);

  const { t } = useI18n();

  const handleClose = () => {
    emit('handleClose');
  };
  const handleJoinMeeting = async () => {
    emit('handleJoinMeeting');
  };
  const debounceJoinMeeting = debounce(handleJoinMeeting, 1000);
</script>

<style lang="less" scoped>
  .room-options-container {
    width: 100%;
    background: #ffffff;
    border-radius: 8px;
    position: relative;
    .room-fixed {
      cursor: pointer;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 19px;
      right: 16px;
      background: #f4f6fd;
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
    .room-options-main {
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 30px 43px;
      display: flex;
      align-items: center;
      justify-content: center;
      span {
        font-weight: 400;
        font-size: 14px;
        color: rgba(52, 64, 80, 1);
        text-align: center;
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

  .text-ellipsis {
    overflow: hidden;
    white-space: nowrap;
    /*文字超出宽度则显示ellipsis省略号*/
    text-overflow: ellipsis;
  }
</style>
