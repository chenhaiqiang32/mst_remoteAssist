<template>
  <a-card
    class="general-card member-panel"
    :bordered="false"
    :body-style="{
      height: '100%',
      display: 'flex',
      padding: 0,
      flexFlow: 'column',
    }"
  >
    <div class="member-container">
      <div class="member-top">
        <div class="member-top-btn">
          <div class="member-tabs">
            <div
              class="member-tab"
              :class="tabActive === 1 ? 'active' : ''"
              @click="handleSelectTab(1)"
            >
              <span>{{ $t('meeting.member.tabs.all') }}</span>
            </div>
            <div
              class="member-tab"
              :class="tabActive === 2 ? 'active' : ''"
              @click="handleSelectTab(2)"
            >
              <span>{{ $t('meeting.member.tabs.group') }}</span>
            </div>
          </div>
          <div class="member-top-btn-r">
            <a-button @click="handleShowConcat">
              <span>{{ t('meeting.member.left.btn.concat.qr') }}</span>
            </a-button>
          </div>
        </div>

        <a-divider :margin="0"></a-divider>
        <div class="member-search">
          <a-input-search
            v-model="searchParams.condition"
            size="large"
            :style="{ width: '100%' }"
            :placeholder="$t('meeting.member.tabs.search')"
            @input="handleSearch"
          />
        </div>
      </div>
      <div class="member-content wsl-scroll">
        <template v-if="tabActive === 1">
          <template
            v-for="(item, index) in memberList"
            :key="`member_${index}`"
          >
            <div
              class="member-content-item"
              :class="isUserSelected(item.userId) ? 'selected' : ''"
              @click="handleSelectRow(item)"
            >
              <div class="member-content-item-left">
                <SelectIcon v-if="isUserSelected(item.userId)"></SelectIcon>
                <SelectNoIcon v-else></SelectNoIcon>
              </div>
              <div class="member-content-item-right">
                <div class="member-content-item-right-left">
                  <img :src="item.avatarUrl" alt="" />
                  <div
                    class="member-online"
                    :class="
                      item.pcOnline || item.glassOnline || item.androidOnline
                        ? 'online'
                        : 'outline'
                    "
                  >
                  </div>
                </div>
                <div class="member-content-item-right-right">
                  <div class="member-content-item-right-right-top">
                    <span>{{ item.name }}</span>
                  </div>
                  <div class="member-content-item-right-right-bot">
                    <span>{{ item.alias }}</span>
                  </div>
                </div>
              </div>
              <div
                :class="{
                  'member-content-item-btn': true,
                  'member-content-item-btn-my': item.userId === userStore.userId,
                }"
                @click.stop="handleCall(item)"
              >
                <CallIcon></CallIcon>
              </div>
            </div>
          </template>
        </template>
        <template v-else>
          <a-collapse
            :bordered="false"
            :expand-icon-position="collapsePosition"
          >
            <a-collapse-item
              v-for="(group, groupIndex) in memberGroupList"
              :key="`group_${groupIndex}`"
            >
              <template #header>
                <div class="header-main">
                  <div class="header-main-left">
                    <img :src="orgIcon" alt="" />
                  </div>
                  <div class="header-main-title">
                    <span
                      >{{ group.groupName }} ({{ group.contacts.length }})</span
                    >
                  </div>
                </div>
              </template>
              <template
                v-for="(item, index) in group.contacts"
                :key="`member_${index}`"
              >
                <div
                  class="member-content-item"
                  :class="isUserSelected(item.userId) ? 'selected' : ''"
                  @click="handleSelectRow(item)"
                >
                  <div class="member-content-item-left">
                    <SelectIcon
                      v-if="isUserSelected(item.userId)"
                      size="12"
                    ></SelectIcon>
                    <SelectNoIcon v-else size="12"></SelectNoIcon>
                  </div>
                  <div class="member-content-item-right">
                    <div class="member-content-item-right-left">
                      <img :src="item.avatarUrl" alt="" />
                      <div
                        class="member-online"
                        :class="
                          item.pcOnline ||
                          item.glassOnline ||
                          item.androidOnline
                            ? 'online'
                            : 'outline'
                        "
                      >
                      </div>
                    </div>
                    <div class="member-content-item-right-right">
                      <div class="member-content-item-right-right-top">
                        <span>{{ item.name }}</span>
                      </div>
                      <div class="member-content-item-right-right-bot">
                        <span>{{ item.alias }}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    :class="{
                      'member-content-item-btn': true,
                      'member-content-item-btn-my': item.userId === userStore.userId,
                    }"
                    @click.stop="handleCall(item)"
                  >
                    <CallIcon></CallIcon>
                  </div>
                </div>
              </template>
            </a-collapse-item>
          </a-collapse>
        </template>
      </div>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
  import { useI18n } from 'vue-i18n';
  import SelectNoIcon from '@/assets/svg/icon_unselected.svg';
  import SelectIcon from '@/assets/svg/icon_select.svg';
  import orgIcon from '@/assets/icons/icon_org.png';
  import CallIcon from '@/assets/svg/icon_psn_call.svg';

  import { useAddressStore, useUserStore } from '@/store';

  import { Message } from '@arco-design/web-vue';

  const emit = defineEmits(['handleOptionCallOpen', 'handleChangePage']);

  const { t } = useI18n();
  const addressStore = useAddressStore();
  const userStore = useUserStore();
  const tabActive: any = ref(1);
  const memberList: any = ref([]);
  const memberGroupList: any = ref([]);
  const selectMember: any = ref(addressStore.selectPsn);
  const searchParams: any = ref({
    condition: '',
  });

  const handleGetMemberList = async () => {
    memberList.value = addressStore.memberList;
  };
  const handleGetGroupList = async () => {
    memberGroupList.value = addressStore.memberGroupList;
  };
  const handleSearchMember = () => {
    if (!searchParams.value.condition) {
      return addressStore.memberList;
    }
    const searchQuery = searchParams.value.condition.toLowerCase();
    return addressStore.memberList.filter((user: any) =>
      user.name.toLowerCase().includes(searchQuery)
    );
  };
  const handleSearchGroupMember = () => {
    if (!searchParams.value.condition) {
      return addressStore.memberGroupList;
    }
    const searchQuery = searchParams.value.condition.toLowerCase();
    return addressStore.memberGroupList
      .map((group: any) => ({
        ...group,
        contacts: group.contacts.filter((contact: any) =>
          contact.name.toLowerCase().includes(searchQuery)
        ),
      }))
      .filter((group: any) => group.contacts.length > 0);
  };
  const handleSearch = async () => {
    if (tabActive.value === 1) {
      memberList.value = handleSearchMember();
    } else if (tabActive.value === 2) {
      memberGroupList.value = handleSearchGroupMember();
    }
  };
  const handleSelectTab = (data: any) => {
    tabActive.value = data;
    searchParams.value.condition = '';
    if (tabActive.value === 2) {
      handleGetGroupList();
    } else {
      handleGetMemberList();
    }
  };
  const isUserSelected = (userId: any) => {
    return selectMember.value.some((item: any) => item.userId === userId);
  };
  const handleSelectRow = (data: any, init?: boolean) => {
    // todo 自己不可以被选中
    if (data.userId === userStore.userId && !init) {
      Message.info(t('meeting.call.me'));
      return;
    }
    const index = selectMember.value.findIndex(
      (item: any) => item.userId === data.userId
    );
    if (index === -1) {
      // userId 不存在，添加到 selectPsnList 中
      if (selectMember.value.length < addressStore.limitMember) {
        // userId 不存在，添加到 selectPsnList 中
        selectMember.value.push(data);
      } else {
        Message.error(
          `${t('meeting.member.limit.member.tip')} ${addressStore.limitMember}`
        );
      }
    } else {
      // userId 已存在，从 selectPsnList 中移除
      selectMember.value.splice(index, 1);
    }
    addressStore.updateAddressSelectPsn(selectMember.value);
  };
  const collapsePosition: any = ref('right');
  // 发起呼叫
  const handleCall = (data: any) => {
    emit('handleOptionCallOpen', [data]);
  };
  const handleClearSelect = () => {
    selectMember.value = [];
    addressStore.updateAddressSelectPsn([]);
  };
  // 显示通讯录二维码
  const handleShowConcat = () => {
    emit('handleChangePage', 1);
  };
  watch(
    () => [addressStore.selectPsn, addressStore.memberList],
    (newVal) => {
      if (newVal[0]) {
        selectMember.value = addressStore.selectPsn;
      }
      if (newVal[1]) {
        handleSelectTab(tabActive.value);
      }
    }
  );
  // todo初始化选中自己展示用
  const handleInitSelectMe = () => {
    setTimeout(() => {
      const myData = addressStore.memberList.find(v => v.userId === userStore.userId)
      handleSelectRow(myData, true);
    }, 500);
  }
  onMounted(() => {
    handleGetMemberList();
    handleInitSelectMe()
  });
  onBeforeUnmount(() => {
    handleClearSelect();
  });
</script>

<style lang="less" scoped>
  .member-container {
    width: 100%;

    .member-top {
      height: calc(64px + 66px);
      .member-top-btn {
        display: flex;
        justify-content: space-between;
        padding: 0 16px;
        .member-tabs {
          height: 63px;
          display: flex;
          .member-tab {
            cursor: pointer !important;
            flex-shrink: 0;
            padding: 0 7px;
            height: 100%;
            display: flex;
            align-items: center;
            margin-right: 20px;

            span {
              color: var(--color-neutral-6);
              font-weight: 400;
              font-size: 16px;
            }

            &.active {
              position: relative;

              span {
                font-weight: 500;
                color: rgb(var(--primary-6));
              }

              &::after {
                content: '';
                width: 50px;
                height: 3px;
                background-color: rgb(var(--primary-6));
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                margin: auto;
              }
            }
          }
        }
        .member-top-btn-r {
          display: flex;
          align-items: center;
        }
      }

      .member-search {
        display: flex;
        padding: 16px 16px 10px;
      }
    }

    .member-content {
      height: calc(100vh - 64px - 66px - 80px - 8px);
      overflow-y: scroll;
      padding: 0 16px 8px;

      /* 使用统一滚动条样式 */
      @extend .custom-scrollbar;

      .header-main {
        display: flex;
        align-items: center;

        &-left {
          width: 24px;
          height: 24px;
          border-radius: var(--border-radius-circle);
          border: 1px solid #0267ff;
          background-color: #ebf3ff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;

          img {
            flex-shrink: 0;
            width: 12px;
            height: 12px;
            border-radius: var(--border-radius-circle);
          }
        }

        &-title {
          span {
            font-weight: 500;
            font-size: 16px;
            color: var(--color-neutral-10);
          }
        }
      }

      &-item {
        cursor: pointer;
        width: 100%;
        // padding: 15px 14px;
        padding: 12px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2px;

        &-left {
          margin-right: 12px;
          flex-shrink: 0;
          width: 18px;
          height: 18px;

          img {
            width: 100%;
            height: 100%;
          }
        }

        &-right {
          flex: 1;
          display: flex;
          align-items: center;
          height: 100%;

          &-left {
            flex-shrink: 0;
            // width: 44px;
            // height: 44px;
            width: 36px;
            height: 36px;

            position: relative;
            margin-right: 12px;

            img {
              width: 100%;
              height: 100%;
              border-radius: var(--border-radius-circle);
            }

            .member-online {
              width: 10px;
              height: 10px;
              position: absolute;
              bottom: 0;
              right: 0;
              border: 2px solid var(--color-neutral-2);
              border-radius: var(--border-radius-circle);

              &.online {
                background-color: #28c445;
              }

              &.outline {
                background-color: #878787;
              }
            }
          }

          &-right {
            flex: 1;

            &-top {
              margin-bottom: 2px;
              span {
                font-weight: 500;
                font-size: 14px;
                line-height: 22px;
                color: var(--color-neutral-10);
              }
            }

            &-bot {
              display: flex;
              align-items: flex-end;
              span {
                font-weight: 400;
                font-size: 12px;
                color: var(--color-neutral-5);
              }
            }
          }
        }

        &-btn {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: var(--border-radius-medium);
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          img {
            flex-shrink: 0;
            width: 18px;
            height: 18px;
          }
        }

        &:hover {
          background-color: var(--color-neutral-2);
          border-radius: var(--border-radius-medium);

          .member-content-item-btn {
            display: flex;
            &.member-content-item-btn-my {
              display: none;
            }
          }
        }
        &.selected {
          background-color: var(--color-neutral-2);
          border-radius: var(--border-radius-medium);
        }
      }
    }

    :deep(.arco-collapse-item) {
      border: none !important;

      .arco-collapse-item-header {
        border-color: transparent !important;
      }

      .arco-collapse-item-content {
        background-color: transparent !important;
        padding: 0;
      }
    }
  }
</style>
