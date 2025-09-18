<template>
  <MstModal>
    <div class="board-modal-container">
      <div class="board-fixed" @click="handleClose">
        <img :src="closeIcon" alt="" />
      </div>
      <div class="board-m-t borderB">
        {{ t('mst.board.modal.clear.title') }}
      </div>
      <div class="board-m-m">
        <div class="board-m-m-m">
          <span>{{ t('mst.board.modal.clear.desc') }}</span>
        </div>
      </div>
      <div class="board-m-b">
        <div class="board-m-b-btn">
          <div class="board-m-b-btn-i btn-border" @click="handleCancel">
            <span>{{ t('mst.modal.cancel') }}</span>
          </div>
          <div class="board-m-b-btn-i btn-bg" @click="handleSure">
            <span>{{ t('mst.modal.sure') }}</span>
          </div>
        </div>
      </div>
    </div>
  </MstModal>
</template>

<script lang="ts" setup>
  import i18n from '../../../../locale/index';
  // import THEventBus from '../../../../services/THEventBus';
  import MstModal from '../../../../components/modal/index.vue';

  import closeIcon from '../../assets/icons/icon_close.png';

  const emit = defineEmits(['handleClose', 'handleSure']);
  const { t } = i18n.global;
  const handleClose = () => {
    emit('handleClose');
  };
  const handleCancel = () => {
    handleClose();
  };
  const handleSure = () => {
    emit('handleSure');
  };
</script>

<style lang="less" scoped>
  .board-modal-container {
    width: 551px;
    background: #ffffff;
    border-radius: 8px;
    position: relative;
    .board-fixed {
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
    .board-m-t {
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
    .board-m-m {
      width: 100%;
      padding: 26px 30px 23px;
      max-height: 400px;
      .board-m-m-m {
        width: 100%;
        padding: 28px 24px 31px;
        border-radius: 4px;
        font-weight: 400;
        font-size: 16px;
        color: rgba(52, 64, 80, 1);
        line-height: 16px;
        text-align: center;
      }
    }
    .board-m-b {
      width: 100%;
      height: 96px;
      padding: 0 30px;
      box-shadow: 4px 4px 20px 0px rgba(32, 73, 109, 0.1);
      .board-m-b-btn {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        .board-m-b-btn-i {
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
