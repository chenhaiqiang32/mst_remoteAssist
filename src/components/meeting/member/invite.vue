<template>
  <div class="invite-join-group-modal-container modal-container">
    <div class="invite-fixed" @click="handleClose">
      <img :src="closeIcon" alt="" />
    </div>
    <div class="invite-m-t"> {{ $t('meeting.member.invite.title') }} </div>
    <div class="invite-m-tabs">
      <div class="invite-m-tabs-main">
        <div
          class="invite-m-tabs-i"
          :class="inviteTabActive === 1 ? 'active' : ''"
          @click="handleSelectTab(1)"
        >
          <span>{{ $t('message.invite.join.group.tabs.all') }}</span>
        </div>
        <div
          class="invite-m-tabs-i"
          :class="inviteTabActive === 2 ? 'active' : ''"
          @click="handleSelectTab(2)"
        >
          <span>{{ $t('message.invite.join.group.tabs.group') }}</span>
        </div>
      </div>
    </div>
    <div class="invite-m-s">
      <a-input
        v-model="searchOptions.condition"
        class="search-input"
        :placeholder="$t('meeting.member.invite.search.placeholder')"
        @input="handleSearch"
      >
        <template #prefix>
          <icon-search />
        </template>
      </a-input>
    </div>
    <div class="invite-m-main wsl-scroll">
      <template v-if="inviteTabActive === 1">
        <div
          v-for="(item, index) in addressStore.memberList"
          :key="`psn_${index}_${item.userId}`"
          class="invite-m-main-i"
          @click="handleSelectRow(item)"
        >
          <div class="invite-m-main-i-l">
            <SelectIcon v-if="isUserSelected(item.userId)"></SelectIcon>
            <SelectNoIcon v-else></SelectNoIcon>
          </div>
          <div class="invite-m-main-i-r">
            <div class="invite-m-main-i-rl">
              <img :src="item.avatarUrl" alt="" />
              <div
                class="invite-m-main-i-rl-s"
                :class="showPsnOnlineType(item)"
              ></div>
            </div>
            <div class="invite-m-main-i-rr">
              <div class="invite-m-main-i-rr-t">
                <span>{{ item.name }}</span>
              </div>
              <div class="invite-m-main-i-rr-b">
                <span>{{ item.alias }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="inviteTabActive === 2">
        <div
          v-for="(gItem, gIndex) in addressStore.memberGroupList"
          :key="`group_${gIndex}`"
          class="invite-m-main-group"
        >
          <div class="invite-main-group-header" @click="toggleGroup(gIndex)">
            <div class="header-main-left">
              <div class="header-main-left-i">
                <img :src="orgIcon" alt="" />
              </div>
              <div class="header-main-title">
                <span>{{ gItem.groupName }} ({{ gItem.contacts.length }})</span>
              </div>
            </div>
            <div
              class="header-main-right"
              :class="{ 'rotate-icon': expandedGroups[gIndex] }"
            >
              <hoverIcon></hoverIcon>
            </div>
          </div>
          <div v-show="expandedGroups[gIndex]" class="invite-main-group-body">
            <div
              v-for="(item, index) in gItem.contacts"
              :key="`group_psn_${index}_${item.userId}`"
              class="invite-m-main-i"
              @click="handleSelectRow(item)"
            >
              <div class="invite-m-main-i-l">
                <SelectIcon v-if="isUserSelected(item.userId)"></SelectIcon>
                <SelectNoIcon v-else></SelectNoIcon>
              </div>
              <div class="invite-m-main-i-r">
                <div class="invite-m-main-i-rl">
                  <img :src="item.avatarUrl" alt="" />
                  <div
                    class="invite-m-main-i-rl-s"
                    :class="showPsnOnlineType(item)"
                  ></div>
                </div>
                <div class="invite-m-main-i-rr">
                  <div class="invite-m-main-i-rr-t">
                    <span>{{ item.name }}</span>
                  </div>
                  <div class="invite-m-main-i-rr-b">
                    <span>{{ item.alias }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="invite-m-bot">
      <div class="invite-m-bot-l">
        <template
          v-for="(item, index) in selectPsnList"
          :key="`invite_m_icon_${index}`"
        >
          <div
            v-if="index < addressStore.showLimitMember"
            class="invite-m-bot-l-i"
            :style="getImageStyle(index)"
          >
            <img :src="item.avatarUrl" alt="" />
          </div>
        </template>
      </div>
      <div class="invite-m-bot-r">
        <div class="invite-m-bot-r-btn" @click="handleInvite">
          <span
            >{{ t('message.invite.join.group.menu.invite') }} ({{
              selectPsnList.length
            }}/{{ addressStore.limitMember }})</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';

  import closeIcon from '@/assets/icons/icon_close.png';
  import orgIcon from '@/assets/icons/icon_org.png';
  import SelectNoIcon from '@/assets/svg/icon_unselected.svg';
  import SelectIcon from '@/assets/svg/icon_select.svg';
  // import SelectDisIcon from '@/assets/svg/icon_select_dis.svg';
  import hoverIcon from '@/assets/svg/icon_hover.svg';

  import {
    useAddressStore,
    //  useUserStore,
  } from '@/store';
  import { Message } from '@arco-design/web-vue';

  const emit = defineEmits(['handleClose', 'handleInvite']);
  const { t } = useI18n();
  const props = defineProps<{
    selectPsn: any;
  }>();
  const handleClose = () => {
    emit('handleClose');
  };
  // 搜索人员
  const searchOptions = ref({
    condition: '',
  });
  const inviteTabActive = ref<number>(1);

  const addressStore = useAddressStore();
  // const userStore = useUserStore();

  const expandedGroups = ref<Record<number, boolean>>({});

  const toggleGroup = (index: number) => {
    expandedGroups.value[index] = !expandedGroups.value[index];
  };

  const showPsnOnlineType = (data: any) => {
    const classType = ref('');
    if (data.pcOnline || data.androidOnline || data.glassOnline) {
      classType.value = 'online';
    } else {
      classType.value = 'outline';
    }
    return classType.value;
  };
  const offsetX = ref(20);
  const getImageStyle = (index: number) => ({
    zIndex: index,
    left: `${index * offsetX.value}px`,
  });
  const handleGetMemberList = async () => {
    const res: any = await addressStore.getContactsData(searchOptions.value);
    if (res.code !== 200 && res.code !== 401) {
      return;
    }
    addressStore.updateMemberList(res.data);
  };
  const handleGetGroupList = async () => {
    const res: any = await addressStore.getContactsGroupData(
      searchOptions.value
    );
    if (res.code !== 200 && res.code !== 401) {
      return;
    }
    addressStore.updateMemberGroupList(res.data);
  };
  const handleSearch = () => {
    console.log('查询人员事件');
    if (inviteTabActive.value === 1) {
      handleGetMemberList();
    } else if (inviteTabActive.value === 2) {
      handleGetGroupList();
    }
  };
  const handleSelectTab = (type: number) => {
    inviteTabActive.value = type;
    searchOptions.value.condition = '';
    handleSearch();
  };
  // 人员选择集合
  const selectPsnList = ref<any[]>(props.selectPsn);
  const isUserSelected = (userId: any) => {
    return selectPsnList?.value.some((item) => item.userId === userId);
  };
  // const isSelf = (userId: any) => {
  //   return selectPsnList?.value.some((item) => item.userId === userId);
  // };
  const handleSelectRow = (data: any) => {
    const index = selectPsnList.value.findIndex(
      (item) => item.userId === data.userId
    );
    if (index === -1) {
      if (selectPsnList.value.length < addressStore.limitMember) {
        // userId 不存在，添加到 selectPsnList 中
        selectPsnList.value.push(data);
      } else {
        Message.error(
          `${t('meeting.member.limit.member.tip')} ${addressStore.limitMember}`
        );
      }
    } else {
      // userId 已存在，从 selectPsnList 中移除
      selectPsnList.value.splice(index, 1);
    }
  };
  const handleInvite = () => {
    emit('handleInvite', selectPsnList.value);
  };
</script>

<style lang="less" scoped>
  .invite-join-group-modal-container {
    width: 100%;
    border-radius: 8px 8px 8px 8px;
    position: relative;
    overflow: hidden;
    .invite-fixed {
      cursor: pointer;
      position: absolute;
      right: 30px;
      top: 22px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--color-neutral-3);
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
      }
    }
    .invite-m-t {
      height: 76px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 20px;
      color: var(--color-neutral-10);
    }
    .invite-m-tabs {
      width: 100%;
      height: 48px;
      padding: 0 30px;
      margin-bottom: 10px;

      .invite-m-tabs-main {
        width: 100%;
        height: 100%;
        padding: 4px;
        background: var(--color-neutral-2);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .invite-m-tabs-i {
          cursor: pointer;
          width: 50%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          span {
            font-weight: 400;
            font-size: 16px;
            color: var(--color-neutral-10);
          }
          &.active {
            background: #0267ff;
            border-radius: 4px;
            span {
              font-weight: bold;
              font-size: 16px;
              color: #fff;
            }
          }
        }
      }
    }
    .invite-m-s {
      height: 42px;
      padding: 0 30px;
      .search-input {
        width: 100%;
        height: 100%;
      }
    }
    .invite-m-main {
      width: calc(100% - 30px);
      padding-left: 30px;
      height: 400px;
      margin-top: 16px;
      .invite-m-main-group {
        width: 100%;
        .invite-main-group-header {
          width: 100%;
          height: 44px;
          padding-right: 5px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          .header-main-left {
            height: 100%;
            display: flex;
            align-items: center;
            .header-main-left-i {
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;
              border: 1px solid #0267ff;
              background-color: #ebf3ff;
              border-radius: 50%;
              img {
                flex-shrink: 0;
                width: 12px;
                height: 12px;
                border-radius: 50%;
              }
            }
          }
          .header-main-right {
            flex-shrink: 0;
            width: 14px;
            height: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
            color: rgb(107, 119, 133);
            &:hover {
              background-color: rgb(242, 243, 245);
              border-radius: var(--border-radius-circle);
            }
            &.rotate-icon {
              transform: rotate(-90deg);
            }
          }
          .header-main-title {
            span {
              font-weight: 500;
              font-size: 16px;
              color: var(--color-neutral-10);
            }
          }
        }
      }
      .invite-main-group-body {
        width: 100%;
      }
      .invite-m-main-i {
        display: flex;
        align-items: center;
        height: 44px;
        margin: 12px 0;
        cursor: pointer;

        .invite-m-main-i-l {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;

          img {
            width: 100%;
            height: 100%;
          }
        }
        .invite-m-main-i-r {
          width: auto;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          .invite-m-main-i-rl {
            width: 36px;
            height: 36px;
            position: relative;
            margin-right: 12px;
            img {
              width: 36px;
              height: 36px;
              border-radius: 50%;
            }
            .invite-m-main-i-rl-s {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              position: absolute;
              bottom: -2px;
              right: 0;
              border: 2px solid #ffffff;
              &.online {
                background: #28c445;
              }
              &.busy {
                background: rgba(246, 118, 0, 1);
              }
              &.outline {
                background-color: rgba(135, 135, 135, 1);
              }
            }
          }
          .invite-m-main-i-rr {
            .invite-m-main-i-rr-t {
              span {
                font-weight: 500;
                font-size: 14px;
                color: ar(--color-neutral-8);
                line-height: 20px;
              }
            }
            .invite-m-main-i-rr-b {
              span {
                font-weight: 400;
                font-size: 12px;
                color: var(--color-neutral-6);
              }
            }
          }
        }
        &:hover {
          .invite-m-main-i-r {
            .invite-m-main-i-rr {
              .invite-m-main-i-rr-t {
                span {
                  font-weight: 600;
                }
              }
              .invite-m-main-i-rr-b {
                span {
                  font-weight: 500;
                }
              }
            }
          }
        }
      }
    }
    .invite-m-bot {
      width: 100%;
      height: 96px;
      padding-left: 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 4px 4px 20px 0px rgba(32, 73, 109, 0.1);
      .invite-m-bot-l {
        width: calc(100% - 182px);
        height: 40px;
        display: flex;
        align-items: center;
        position: relative;
        .invite-m-bot-l-i {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 2px solid #ffffff;
          border-radius: 50%;
          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
          }
        }
      }
      .invite-m-bot-r {
        flex-shrink: 0;
        width: 182px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        .invite-m-bot-r-btn {
          cursor: pointer;
          width: 132px;
          height: 46px;
          background: #0267ff;
          box-shadow: 0px 8px 30px 0px rgba(var(--arcoblue-2), 0.3);
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
</style>
