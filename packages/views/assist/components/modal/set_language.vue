<script setup lang="ts">
  import useThMeetingStore from '../../../../store';
  import { reactive, onMounted, computed, ref } from 'vue';
  import { useMeetingStore } from '../../../../../src/store';
  import THEventBus from '../../../../services/THEventBus';
  import msg from '../../../../services/msg';
  import { useI18n } from 'vue-i18n';
  const { t, locale } = useI18n();
  const ThMeetingStore = useThMeetingStore();
  const meetingStore = useMeetingStore();
  const visible = computed(() => {
    return !!ThMeetingStore.lectureInfo?.transState?.transModalVisible;
  });

  const form = reactive({
    languageType: '',
    industryType: '',
  });
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
        label: locale.value === 'zh-CN' ? item.value : item.english,
        value: item.label,
        ctry: item.flagUrl,
      };
    });
  });
  const handleCancel = () => {
    ThMeetingStore.lectureInfo.transState.transModalVisible = !visible.value;
  };
  const handleOk = () => {
    handleCancel();
    ThMeetingStore.roomTranslateInfo.industryType = form.industryType;
    ThMeetingStore.roomTranslateInfo.languageType = form.languageType;
    THEventBus.emit('th-self-reconnect-translate');
  };

  function notMasterClick() {
    // 非主持人点击时提示
    if (
      ThMeetingStore.meetingInfo.masterId !== ThMeetingStore.mineInfo.userId
    ) {
      msg.warning(t('meeting.notMaster.tips'));
    }
  }
  onMounted(() => {
    form.industryType = ThMeetingStore.roomTranslateInfo?.industryType;
    form.languageType = ThMeetingStore.roomTranslateInfo?.languageType;
  });
</script>
<template>
  <a-modal
    width="auto"
    hide-title
    :footer="false"
    hide-cancel
    v-model:visible="visible"
  >
    <a-form :model="form" :style="{ width: '269px' }" layout="vertical">
      <a-form-item
        field="languageType"
        :label="$t('meeting.schedule.form.myLanguage')"
      >
        <a-select v-model="form.languageType" allow-search>
          <a-option
            class="st-img"
            :value="item.value"
            v-for="item in countryList"
          >
            <img class="ctry_img" :src="item.ctry" />
            <a-tooltip :content="item.label" position="right">
              <div class="ctry_label">{{ item.label }}</div>
            </a-tooltip>
          </a-option>
        </a-select>
      </a-form-item>
      <!-- 非主持人禁用 -->
      <a-form-item
        v-if="wordList.length > 0"
        style="margin-bottom: 7px"
        field="industryType"
        :label="$t('meeting.schedule.form.thesaurus')"
        @click="notMasterClick"
      >
        <a-select
          :disabled="
            ThMeetingStore.meetingInfo.masterId !==
            ThMeetingStore.mineInfo.userId
          "
          v-model="form.industryType"
          :options="wordList"
          allow-search
        />
      </a-form-item>
      <div class="des" v-if="wordList.length > 0">
        {{ $t('meeting.schedule.form.desc') }}
      </div>
      <div class="btns">
        <a-button @click="handleCancel">{{
          $t('message.chat.group.exit.cancel')
        }}</a-button>
        <a-button @click="handleOk" type="primary">{{
          $t('message.chat.group.exit.ok')
        }}</a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<style scoped lang="less">
  .st-img {
    :deep(.arco-select-option-content) {
      .ctry_img {
        width: 20px;
        height: 15px;
      }
      .ctry_label {
        width: calc(100% - 20px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
  .des {
    font-weight: 400;
    font-size: 10px;
    color: #9ca3af;
  }
  .btns {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding-top: 23px;
    :deep(.arco-btn) {
      width: 100%;
    }
  }
</style>
