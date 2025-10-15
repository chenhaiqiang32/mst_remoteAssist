<template>
  <div class="schedule-options-container modal-container">
    <div class="modal-fixed" @click="handleClose">
      <img :src="closeIcon" alt="" />
    </div>
    <div class="modal-title"> {{ $t('meeting.schedule.modal.title') }} </div>
    <div class="modal-main wsl-scroll">
      <a-form :model="form" layout="vertical">
        <a-form-item
          field="subject"
          :label="$t('meeting.schedule.form.subject')"
        >
          <a-input
            v-model="form.subject"
            :max-length="255"
            :placeholder="$t('meeting.schedule.form.placeholder.schedule')"
          />
        </a-form-item>
        <a-form-item
          field="startDate"
          :label="$t('meeting.schedule.form.startDate')"
        >
          <a-range-picker
            v-model="rangDate"
            class="schedule-picker-time"
            show-time
            :time-picker-props="timePickerProps"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            :disabled-date="disabledDate"
            :disabled-time="disabledTime"
            @ok="handleSureRangeDateSelect"
          />
        </a-form-item>
        <div class="users-main">
          <div class="users-main-header">
            <div class="user-main-header-left">
              <span>{{ $t('meeting.schedule.form.member') }}</span>
            </div>
            <div class="user-main-header-right" @click="handleInviteOpen">
              <div class="user-main-header-right-icon">
                <icon-plus-circle />
              </div>
              <div class="user-main-header-right-label">
                <span>{{ $t('meeting.schedule.form.btn.add') }}</span>
              </div>
            </div>
          </div>
          <div class="users-main-body">
            <template v-if="form.userIds && form.userIds.length > 0">
              <div class="users-main-body-main">
                <a-space :size="10" wrap>
                  <div
                    v-for="(item, index) in meetingStore.schedulePsn"
                    :key="`user_${item.userId}_${index}`"
                    class="users-main-body-main-item"
                  >
                    <div class="users-main-body-main-item-top">
                      <img :src="item.avatarUrl" alt="avatar" />
                    </div>
                    <a-tooltip :content="item.name">
                      <div class="users-main-body-main-item-bot textEllipsis">
                        {{ item.name }}
                      </div>
                    </a-tooltip>
                    <div
                      class="users-main-body-main-item-fixed"
                      @click="handleDelInvite(index)"
                    >
                      <img :src="delIcon" alt="del" />
                    </div>
                  </div>
                </a-space>
              </div>
            </template>
            <div v-else class="users-main-body-no-data">
              <span>{{ $t('meeting.schedule.form.placeholder.member') }}</span>
            </div>
          </div>
        </div>
        <a-form-item
          style="margin-bottom: 0"
          content-class="schedule-checkbox schedule-checkbox-voice"
        >
          <div class="bx">
            <span>{{ $t('meeting.schedule.form.voiceTranslation') }}</span>
            <a-switch v-model="form.voiceTranslation" size="small" />
          </div>
          <div class="ax" v-if="form.voiceTranslation">
            <div class="label">{{
              $t('meeting.schedule.form.myLanguage')
            }}</div>
            <div>
              <a-select v-model="form.languageType">
                <a-option
                  class="st-img"
                  :value="item.value"
                  v-for="item in countryList"
                  ><img :src="item.ctry" /><span>{{
                    item.label
                  }}</span></a-option
                >
              </a-select>
            </div>
          </div>
          <div class="ax" v-if="form.voiceTranslation && wordList.length > 0">
            <div class="label">{{ $t('meeting.schedule.form.thesaurus') }}</div>
            <div>
              <a-select v-model="form.industryType" :options="wordList" />
            </div>
            <div class="des">
              {{ $t('meeting.schedule.form.desc') }}
            </div>
          </div>
        </a-form-item>
        <a-form-item
          content-class="schedule-checkbox"
          field="recordStatus"
          hide-label
        >
          <!-- <div class="bx">
            <span>{{ $t('meeting.schedule.form.cloud.record') }}</span>
            <a-switch v-model="recordStatus" size="small" />
          </div>
          <div class="bx">
            <span>{{ $t('meeting.schedule.form.ai.summary') }}</span>
            <a-switch v-model="aiStatus" size="small" />
          </div> -->
          <!--          <div class="bx">-->
          <!--            <span>{{ $t('meeting.schedule.form.ai.translation') }}</span> <a-switch v-model="escaping" size="small"/>-->
          <!--          </div>-->
        </a-form-item>
      </a-form>
    </div>
    <div class="modal-bot">
      <a-button class="modal-btn-item" @click="handleClose">{{
        $t('meeting.schedule.form.btn.cancel')
      }}</a-button>
      <a-button
        class="modal-btn-item"
        type="primary"
        @click="handleScheduleInvite"
        >{{ $t('meeting.schedule.form.btn.schedule') }}</a-button
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    ref,
    onMounted,
    onBeforeUnmount,
    watch,
    computed,
    watchEffect,
  } from 'vue';
  import dayjs from 'dayjs';
  import { useMeetingStore } from '@/store';
  import { useI18n } from 'vue-i18n';
  import { scheduleFormOV } from '@/store/modules/meeting/types';
  import closeIcon from '@/assets/icons/icon_close.png';
  import delIcon from '@/assets/icons/icon_del.png';
  import { objToArrForKey, formatTimestamp } from '@/utils';
  import { Message } from '@arco-design/web-vue';
  import useThMeetingStore from '../../../../packages/store';

  const meetingStore = useMeetingStore();
  const ThMeetingStore = useThMeetingStore();
  const { t, locale } = useI18n();

  const wordList = computed(() => {
    return meetingStore.industryList?.map((item) => {
      return {
        label: locale.value === 'zh-CN' ? item.value : item.english,
        value: item.label,
      };
    });
  });
  const countryList = computed(() => {
    return meetingStore.languageList?.map((item) => {
      return {
        ...item,
        label: locale.value === 'zh-CN' ? item.value : item.english,
        value: item.label,
        ctry: item.flagUrl,
      };
    });
  });
  const emit = defineEmits(['handleClose', 'handleInviteOpen']);
  const props = defineProps<{
    meetingDetail?: any;
  }>();
  const form = ref<scheduleFormOV & Record<any, any>>({
    subject: '',
    userIds: [],
    startTime: '',
    endTime: '',
    recordStatus: '0',
    aiStatus: '0',
    escaping: '0',
    voiceTranslation: false, //开启语音
    languageType: 'cn', //我的语言
    industryType: 'default', // 行业词库
  });
  watchEffect(() => {
    const isAliun = countryList.value?.some((v: any) => v.type === 'aliyun');
    if (isAliun) {
      form.value.languageType = 'zh';
    }
  });
  // 计算时间选择器属性
  const timePickerProps = computed(() => {
    const now = dayjs();
    const addThirtyMinutes = now.add(30, 'minute');

    // 判断加 30 分钟后是否超过当天结束时间
    const defaultEnd = addThirtyMinutes.isAfter(now.endOf('day'))
      ? ['00:00:00', '01:00:00'] // 如果超过当天时间，则设置为当天开始时间
      : [
          `${now.format('HH:mm')}:00`,
          `${addThirtyMinutes.format('HH:mm:')}:00`,
        ];

    return {
      defaultValue: defaultEnd,
      hideDisabledOptions: true,
    };
  });

  const disabledDate = (current: any) => {
    // 禁用当前日期之前的日期
    return current && dayjs(current).isBefore(dayjs(), 'day');
  };
  const disabledTime: any = (current: Date) => {
    const now = dayjs();

    if (dayjs(current).isSame(now, 'day')) {
      // 禁用当前时间之前的小时和分钟
      return {
        disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
        disabledMinutes: (hour: number) => {
          if (hour === now.hour()) {
            return Array.from({ length: now.minute() }, (_, i) => i);
          }
          return [];
        },
        disabledSeconds: () => [], // 确保始终返回 disabledSeconds
      };
    }

    return {
      disabledHours: () => [],
      disabledMinutes: () => [],
      disabledSeconds: () => [],
    };
  };

  const rangDate = ref<any>([]);
  const recordStatus = ref<boolean>(form.value.recordStatus === '1');
  const aiStatus = ref<boolean>(form.value.aiStatus === '1');
  const escaping = ref<boolean>(form.value.escaping === '1');

  const handleSureRangeDateSelect = (data: any) => {
    if (data) {
      form.value.startTime = `${data[0]}:00`;
      form.value.endTime = `${data[1]}:00`;
    }
  };
  const handleInitFormData = () => {
    if (!props.meetingDetail) {
      form.value.userIds = objToArrForKey(meetingStore.schedulePsn, 'userId');
    } else {
      meetingStore.updateSchedulePsn(props.meetingDetail.invitees);
      const startTime = formatTimestamp(
        props.meetingDetail.startTime,
        'YYYY-MM-DD HH:mm'
      );
      const endTime = formatTimestamp(
        props.meetingDetail.endTime,
        'YYYY-MM-DD HH:mm'
      );
      rangDate.value = [startTime, endTime];
      console.log('handleInitFormData---', props.meetingDetail, rangDate);
      form.value = {
        planId: props.meetingDetail.planId,
        subject: props.meetingDetail.subject,
        userIds: objToArrForKey(meetingStore.schedulePsn, 'userId'),
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        recordStatus: props.meetingDetail.recordStatus.toString(),
        aiStatus: props.meetingDetail.aiStatus.toString(),
        escaping: props.meetingDetail.escaping.toString(),
        planType: props.meetingDetail.planType,
      };
      recordStatus.value = props.meetingDetail.recordStatus.toString() === '1';
      aiStatus.value = props.meetingDetail.aiStatus.toString() === '1';
      escaping.value = props.meetingDetail.escaping.toString() === '1';
    }
  };
  const handleClearFormData = () => {
    form.value = {
      subject: '',
      userIds: [],
      startTime: '',
      endTime: '',
      recordStatus: '0',
      aiStatus: '0',
      escaping: '0',
    };
    meetingStore.updateSchedulePsn([]);
  };

  const handleClose = () => {
    handleClearFormData();
    emit('handleClose');
  };
  const handleInviteOpen = () => {
    emit('handleInviteOpen');
  };
  const handleDelInvite = (index: number) => {
    meetingStore.schedulePsn.splice(index, 1);
  };
  // 确定预约
  const handleScheduleInvite = async () => {
    // 调用预约会议接口
    if (!form.value.subject) {
      Message.warning(t('meeting.schedule.form.placeholder.schedule'));
      return;
    }
    if (!form.value.startTime) {
      Message.warning(t('meeting.schedule.form.placeholder.startDate'));
      return;
    }
    if (!form.value.userIds || form.value.userIds.length === 0) {
      Message.warning(t('meeting.schedule.form.placeholder.member'));
      return;
    }
    form.value.aiStatus = aiStatus.value ? '1' : '0';
    form.value.recordStatus = recordStatus.value ? '1' : '0';
    form.value.escaping = recordStatus.value ? '1' : '0';
    if (!form.value.planId) {
      const res: any = await meetingStore.createScheduleMeeting({
        ...form.value,
        enableTranslation: form.value?.escaping ? '1' : '0',
      });
      if (res.code !== 200 && res.code !== 401) {
        Message.error(res.msg);
        return;
      }
      Message.success(t('meeting.schedule.message.success'));
    } else {
      const res: any = await meetingStore.updateMeetingPlan(form.value);
      if (res.code !== 200 && res.code !== 401) {
        Message.error(res.msg);
        return;
      }
      Message.success(t('meeting.schedule.form.btn.update.schedule'));
    }
    handleClose();
  };
  watch(
    () => meetingStore.schedulePsn,
    (newVal) => {
      if (newVal) {
        handleInitFormData();
      }
    },
    { deep: true }
  );
  onMounted(() => {
    handleInitFormData();
  });
  onBeforeUnmount(() => {
    handleClearFormData();
  });
</script>

<style scoped lang="less">
  .schedule-options-container {
    width: 100%;
    height: 100%;
    .users-main {
      width: 100%;
      .users-main-header {
        width: 100%;
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        .users-main-header-left {
          color: var(--color-text-2);
          font-size: 14px;
          white-space: normal;
        }
        .user-main-header-right {
          cursor: pointer;
          flex-shrink: 0;
          padding: 0 5px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: rgb(var(--primary-6));

          .user-main-header-right-icon {
            margin-right: 6px;
          }
          .user-main-header-right-label {
            font-weight: 400;
            font-size: 14px;
          }
        }
      }
      .users-main-body {
        min-height: 68px;
        width: 100%;
        border-radius: var(--border-radius-medium);
        border: 1px solid var(--color-fill-2);
        .users-main-body-no-data {
          width: 100%;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: center;
          span {
            font-weight: 400;
            font-size: 14px;
            color: var(--color-neutral-4);
          }
        }
        .users-main-body-main {
          width: 100%;
          padding: 10px;
          .users-main-body-main-item {
            flex-shrink: 0;
            width: 44px;
            height: 48px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: var(--color-fill-2);
            border-radius: var(--border-radius-medium);
            position: relative;
            .users-main-body-main-item-fixed {
              flex-shrink: 0;
              width: 12px;
              height: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: var(--border-radius-circle);
              cursor: pointer;
              position: absolute;
              top: -3px;
              right: -3px;
              img {
                width: 100%;
                height: 100%;
                border-radius: var(--border-radius-circle);
              }
            }
            .users-main-body-main-item-top {
              height: 30px;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              img {
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                border-radius: var(--border-radius-circle);
              }
            }
            .users-main-body-main-item-bot {
              height: 18px;
              line-height: 18px;
              font-weight: 400;
              font-size: 12px;
              color: var(--color-neutral-8);
            }
          }
        }
      }
    }
  }
  :deep(.schedule-checkbox) {
    &.schedule-checkbox-voice {
      .ax {
        &:last-child {
          margin-bottom: 20px;
        }
        width: 100%;
        .label {
          padding-bottom: 8px;
        }
        .des {
          font-weight: 400;
          font-size: 12px;
          color: #9ca3af;
          padding-top: 8px;
        }
      }
    }
    .bx {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .st-img {
    :deep(.arco-select-option-content) {
      img {
        width: 20px;
        height: 15px;
      }
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
</style>
