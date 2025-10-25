<template>
  <MstModal>
    <div class="sop-distribute-modal-container">
      <div class="sop-distribute-fixed" @click="handleClose">
        <img :src="closeIcon" alt="" />
      </div>
      <div class="sop-distribute-m-t">
        <span>{{ t('mst.sop.distribute.title') }}</span>
      </div>
      <div class="sop-distribute-m-content">
        <div class="sop-distribute-m-item">
          <div class="sop-distribute-m-item-label">
            <span>{{ t('mst.sop.distribute.select.process') }}</span>
          </div>
          <a-select
            v-model="selectedSop"
            class="sop-distribute-select"
            :placeholder="t('mst.sop.distribute.select.process.placeholder')"
            :loading="sopListLoading"
          >
            <a-option
              v-for="item in sopList"
              :key="item.sopId"
              :value="item.sopId"
              :label="item.sopName"
            >
              {{ item.sopName }}
            </a-option>
          </a-select>
        </div>
        <div class="sop-distribute-m-item">
          <div class="sop-distribute-m-item-label">
            <span>{{ t('mst.sop.distribute.select.executors') }}</span>
          </div>
          <a-select
            v-model="selectedExecutors"
            class="sop-distribute-select"
            :placeholder="t('mst.sop.distribute.select.executors.placeholder')"
            multiple
            :max-tag-count="2"
          >
            <a-option
              v-for="item in memberList"
              :key="item.userId"
              :value="item.userId"
              :label="item.name"
            >
              {{ item.name }}
            </a-option>
          </a-select>
        </div>
      </div>
      <div class="sop-distribute-m-footer">
        <div class="sop-distribute-btn btn-cancel" @click="handleClose">
          <span>{{ t('mst.modal.cancel') }}</span>
        </div>
        <div
          class="sop-distribute-btn btn-primary"
          :class="{ disabled: !canSubmit }"
          @click="handleDistribute"
        >
          <span>{{ t('mst.sop.distribute.distribute') }}</span>
        </div>
      </div>
    </div>
  </MstModal>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import { getSopList, distributeSop } from '@/api/meeting';
  import MstModal from '../../../../components/modal/index.vue';
  import useThMeetingStore from '../../../../store';
  import closeIcon from '../../assets/icons/icon_close.png';
  import msg from '../../../../services/msg';
  import i18n from '../../../../locale/index';

  const emit = defineEmits(['handleClose']);
  const ThMeetingStore = useThMeetingStore();
  const { t } = i18n.global;

  const selectedSop = ref<number | undefined>();
  const selectedExecutors = ref<number[]>([]);
  const sopList = ref<any[]>([]);
  const sopListLoading = ref(false);

  // 从会议中的人员列表获取
  const memberList = computed(() => {
    return ThMeetingStore.roomAssistMember || [];
  });

  // 是否可以提交
  const canSubmit = computed(() => {
    return selectedSop.value && selectedExecutors.value.length > 0;
  });

  const handleClose = () => {
    emit('handleClose');
  };

  // 获取流程列表
  const fetchSopList = async () => {
    try {
      sopListLoading.value = true;
      const res = await getSopList();
      if (res.code === 200) {
        sopList.value = res.data || [];
      } else {
        msg.error(res.msg || t('mst.sop.distribute.error.fetch'));
      }
    } catch (error) {
      console.error('获取流程列表失败:', error);
      msg.error(t('mst.sop.distribute.error.fetch'));
    } finally {
      sopListLoading.value = false;
    }
  };

  // 下发流程
  const handleDistribute = async () => {
    if (!canSubmit.value) return;

    const selectedSopInfo = sopList.value.find(
      (item) => item.sopId === selectedSop.value
    );
    if (!selectedSopInfo) {
      msg.error(t('mst.sop.distribute.error.select'));
      return;
    }

    const executors = selectedExecutors.value.map((userId) => {
      const member = memberList.value.find((m: any) => m.userId === userId);
      return {
        id: String(userId),
        name: member?.name || '',
      };
    });

    try {
      const params = {
        sopId: selectedSop.value,
        sopName: selectedSopInfo.sopName,
        planId: ThMeetingStore.meetingInfo.planId,
        meetingNo: ThMeetingStore.meetingInfo.meetingNo,
        executors,
      };

      const res = await distributeSop(params);
      if (res.code === 200) {
        msg.success(t('mst.sop.distribute.success'));
        handleClose();
      } else {
        msg.error(res.msg || t('mst.sop.distribute.error'));
      }
    } catch (error) {
      console.error('流程下发失败:', error);
      msg.error(t('mst.sop.distribute.error'));
    }
  };

  onMounted(() => {
    fetchSopList();
  });
</script>

<style lang="less" scoped>
  .sop-distribute-modal-container {
    width: 400px;
    background: #ffffff;
    border-radius: 8px;
    padding: 0 24px 20px;
    position: relative;

    .sop-distribute-fixed {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 24px;
      height: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
      }

      &:hover {
        opacity: 0.8;
      }
    }

    .sop-distribute-m-t {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);

      span {
        font-weight: 500;
        font-size: 18px;
        color: #333f4e;
      }
    }

    .sop-distribute-m-content {
      padding: 20px 0;

      .sop-distribute-m-item {
        margin-bottom: 20px;

        &:last-child {
          margin-bottom: 0;
        }

        .sop-distribute-m-item-label {
          margin-bottom: 8px;

          span {
            font-weight: 400;
            font-size: 14px;
            color: #333f4e;
          }
        }

        .sop-distribute-select {
          width: 100%;
        }
      }
    }

    .sop-distribute-m-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(0, 0, 0, 0.05);

      .sop-distribute-btn {
        cursor: pointer;
        min-width: 80px;
        height: 36px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 16px;

        span {
          font-weight: 400;
          font-size: 14px;
        }

        &.btn-cancel {
          background: #f1f1f1;
          color: #333f4e;

          &:hover {
            background: #e5e5e5;
          }
        }

        &.btn-primary {
          background: #0267ff;
          color: #ffffff;

          &:hover {
            background: darken(#0267ff, 10%);
          }

          &.disabled {
            opacity: 0.5;
            cursor: not-allowed;

            &:hover {
              background: #0267ff;
            }
          }
        }
      }
    }
  }
</style>
