<template>
  <a-card
    class="general-card record-panel"
    :bordered="false"
    :body-style="{
      height: '100%',
      display: 'flex',
      padding: 0,
      flexFlow: 'column',
    }"
  >
    <div class="record-panel-top">
      <span>{{ $t('meeting.record.title') }}</span>
      <div class="search-container">
        <a-input
          v-model="searchOptions.keywords"
          :placeholder="$t('meeting.record.search.placeholder')"
          allow-clear
          @change="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <icon-search />
          </template>
        </a-input>
      </div>
    </div>
    <a-divider :margin="0" />
    <template v-if="recordStore.noRecord">
      <div
        ref="scrollContainer"
        class="record-panel-content wsl-scroll"
        @scroll="handleScroll"
      >
        <div
          v-for="(item, index) in meetingList"
          :key="index"
          class="record-panel-content-item"
          :class="
            recordStore.curMeeting?.meetingId === item.meetingId ? 'active' : ''
          "
          @click="handleSelectMeeting(item)"
        >
          <div class="record-panel-content-item-left">
            <MeetingDefaultIcon></MeetingDefaultIcon>
          </div>
          <div class="record-panel-content-item-right" fill>
            <div class="record-panel-content-item-right-top">
              <a-tooltip :content="item.subject">
                <div
                  class="record-panel-content-item-right-top-name textEllipsis"
                >
                  {{ item.subject }}
                </div>
              </a-tooltip>
              <div class="record-panel-content-item-right-top-time">
                {{ formatTimestamp(item.startTime, 'today') }}
              </div>
            </div>
            <div class="record-panel-content-item-right-bot">
              {{ $t('meeting.list.meeting.time') }}
              {{ formatDuration(item.startTime, item.endTime) }}
            </div>
          </div>
        </div>
        <div v-if="loading" class="loading-spinner">{{
          $t('meeting.list.loading')
        }}</div>
      </div>
    </template>
    <div v-else class="no-data">
      <div class="no-data-body">
        <img :src="recordNoDataIcon" alt="" />
        <div class="no-data-body-text"> {{ $t('meeting.no.data.text') }} </div>
      </div>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  // import { useI18n } from 'vue-i18n';

  import { formatDuration, formatTimestamp } from '@/utils';
  import MeetingDefaultIcon from '@/assets/svg/meeting/icon-default-meeting.svg';
  import recordNoDataIcon from '@/assets/images/no_data/record/no_record.png';
  import { IconSearch } from '@arco-design/web-vue/es/icon';

  import { useMeetingStore, useRecordStore } from '@/store';
  import { Message } from '@arco-design/web-vue';

  // const { t } = useI18n();
  const meetingStore = useMeetingStore();
  const recordStore = useRecordStore();
  const meetingList = ref<any[]>([]);
  const total = ref<number>(0);
  const searchOptions = ref({
    pageSize: 20,
    pageNo: 1,
    keywords: '',
  });
  const loading = ref(false);
  const isMore = ref(true);
  const handleGetMeetingList = async () => {
    console.log('开始加载数据:', {
      isMore: isMore.value,
      loading: loading.value,
      pageNo: searchOptions.value.pageNo,
    });
    if (!isMore.value) return;
    if (loading.value) return;
    try {
      const res: any = await meetingStore.getMeetingRecordList({
        pageNo: searchOptions.value.pageNo,
        pageSize: searchOptions.value.pageSize,
        keywords: searchOptions.value.keywords,
      });
      if (res.code !== 200 && res.code !== 401) {
        Message.error(res.msg);
        return;
      }
      // 如果是第一页（搜索或初始化），直接替换列表
      if (searchOptions.value.pageNo === 1) {
        meetingList.value = res.data.data;
      } else {
        // 否则追加到现有列表
        meetingList.value = [...meetingList.value, ...res.data.data];
      }
      total.value = res.data.total;
      // 先计算是否还有更多数据，再增加页码
      const currentPage = searchOptions.value.pageNo;
      isMore.value = currentPage * searchOptions.value.pageSize < total.value;
      console.log('分页信息:', {
        currentPage,
        pageSize: searchOptions.value.pageSize,
        total: total.value,
        isMore: isMore.value,
        calculated: currentPage * searchOptions.value.pageSize,
      });
      searchOptions.value.pageNo += 1;
    } catch (error) {
      console.error('Failed to load meetings', error);
    } finally {
      loading.value = false;

      console.log(isMore.value);
      if (total.value > 0) {
        recordStore.updateNoRecord(true);
      } else {
        recordStore.updateNoRecord(false);
      }
    }
  };
  const handleInitMeetingList = () => {
    meetingList.value = [];
    total.value = 0;
    searchOptions.value.pageNo = 1;
    isMore.value = true;
    handleGetMeetingList();
  };
  const handleSelectMeeting = (data: any) => {
    recordStore.updateCurMeeting(data);
  };

  const handleSearch = () => {
    searchOptions.value.pageNo = 1;
    meetingList.value = [];
    total.value = 0;
    isMore.value = true;
    handleGetMeetingList();
  };

  const scrollContainer = ref<HTMLElement>();
  let scrollTimer: number | null = null;

  const handleScroll = () => {
    console.log('滚动检查:', {
      isMore: isMore.value,
      loading: loading.value,
      hasContainer: !!scrollContainer.value,
    });
    if (!scrollContainer.value || !isMore.value || loading.value) return;
    // 清除之前的定时器
    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }

    // 防抖处理，200ms后执行
    scrollTimer = window.setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value!;
      // 当滚动到距离底部100px时触发加载
      if (scrollHeight - scrollTop - clientHeight < 100) {
        handleGetMeetingList();
      }
    }, 200);
  };

  onMounted(async () => {
    handleInitMeetingList();
  });

  onBeforeUnmount(() => {
    // 清理定时器
    if (scrollTimer) {
      clearTimeout(scrollTimer);
      scrollTimer = null;
    }
  });
  defineExpose({
    meetingList,
    handleInitMeetingList,
  });
</script>

<style lang="less" scoped>
  .record-panel {
    display: flex;
    flex-direction: column;
    height: 100%;

    &-top {
      flex-shrink: 0;
      height: 64px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      span {
        font-weight: 500;
        font-size: 16px;
        color: var(--color-neutral-10);
      }
      .search-container {
        width: 200px;
      }
    }
    &-content {
      margin: 12px 0;
      height: calc(100vh - 64px - 24px - 80px);
      overflow-y: scroll;
      padding: 0 8px;

      /* 使用统一滚动条样式 */
      @extend .custom-scrollbar;
      &-item {
        cursor: pointer;
        width: 100%;
        padding: 12px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2px;
        &-left {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--border-radius-circle);
          background-color: #ebf3ff;
          margin-right: 14px;
          img {
            flex-shrink: 0;
            width: 28px;
            height: 28px;
          }
        }
        &-right {
          width: 100%;
          &-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            &-name {
              max-width: 120px;
              font-size: 14px;
              color: var(--color-neutral-10);
              font-weight: 500;
              min-height: 24px;
              line-height: 24px;
            }
            &-time {
              font-weight: 400;
              font-size: 12px;
              color: var(--color-neutral-4);
            }
          }
          &-bot {
            margin-top: 2px;
            min-height: 18px;
            font-weight: 400;
            font-size: 12px;
            color: var(--color-neutral-6);
          }
        }
        &:hover {
          background-color: var(--color-neutral-2);
          border-radius: var(--border-radius-medium);
        }
        &.active {
          background-color: var(--color-neutral-2);
          border-radius: var(--border-radius-medium);
          position: relative;
          &::after {
            content: '';
            position: absolute;
            width: 4px;
            height: 100%;
            top: 0;
            bottom: 0;
            right: -8px;
            background-color: rgb(var(--arcoblue-7));
            border-radius: var(--border-radius-medium);
          }
        }
      }
    }
    .loading-spinner {
      text-align: center;
      padding: 10px;
    }
  }
</style>
