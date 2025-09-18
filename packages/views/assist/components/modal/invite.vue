<template>
  <MstModal>
    <div class="invite-modal-container">
      <div class="invite-fixed" @click="handleClose">
        <img :src="closeIcon" alt="" />
      </div>
      <div class="invite-m-t"> {{ t('mst.select.qy.yqzzcy') }} </div>
      <div class="invite-m-tabs">
        <div class="invite-m-tabs-main">
          <div
            class="invite-m-tabs-i"
            :class="inviteTabActive === 1 ? 'active' : ''"
            @click="handleSelectTab(1)"
          >
            <span>{{ t('mst.invite.tabs.all') }}</span>
          </div>
          <div
            class="invite-m-tabs-i"
            :class="inviteTabActive === 2 ? 'active' : ''"
            @click="handleSelectTab(2)"
          >
            <span>{{ t('mst.invite.tabs.group') }}</span>
          </div>
        </div>
      </div>
      <div class="invite-m-s">
        <MstInput
          v-model="searchOptions.condition"
          class="search-input"
          :placeholder="t('mst.select.placeholder')"
          @input="handleSearch"
        >
        </MstInput>
      </div>
      <div class="invite-m-main wsl-scroll">
        <template v-if="inviteTabActive === 1">
          <div
            v-for="(item, index) in psnList"
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
            v-for="(gItem, gIndex) in groupList"
            :key="`group_${gIndex}`"
            class="invite-m-main-group"
          >
            <div class="invite-main-group-header" @click="toggleGroup(gIndex)">
              <div class="header-main-left">
                <div class="header-main-left-i">
                  <img :src="orgIcon" alt="" />
                </div>
                <div class="header-main-title">
                  <span
                    >{{ gItem.groupName }} ({{ gItem.contacts?.length }})</span
                  >
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
      <div class="invite-m-b">
        <div class="invite-m-b-l">
          <div
            v-for="(item, index) in selectPsnList"
            :key="`invite_m_icon_${index}`"
            class="invite-m-b-l-i"
            :style="getImageStyle(index)"
          >
            <img :src="item.avatarUrl" alt="" />
          </div>
        </div>
        <div class="invite-m-b-r">
          <div class="invite-m-b-r-btn" @click="handleInvite">
            <span>{{ t('mst.menu.yq') }}</span>
          </div>
        </div>
      </div>
    </div>
  </MstModal>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import useThMeetingStore from '../../../../store';
  import i18n from '../../../../locale/index';
  import MstModal from '../../../../components/modal/index.vue';
  import MstInput from '../../../../components/input/index.vue';

  import orgIcon from '../../assets/icons/icon_org.png';
  import closeIcon from '../../assets/icons/icon_close.png';
  import SelectNoIcon from '../../../icons/svg/icon_unselected.svg';
  import SelectIcon from '../../../icons/svg/icon_select.svg';
  import hoverIcon from '../../../icons/svg/icon_hover.svg';

  import msg from '../../../../services/msg';

  const emit = defineEmits(['handleInvite', 'handleClose']);
  const ThMeetingStore = useThMeetingStore();
  const { t } = i18n.global;
  const handleClose = () => {
    emit('handleClose');
  };

  const inviteTabActive = ref<number>(1);
  const expandedGroups = ref<Record<number, boolean>>({});

  const toggleGroup = (index: number) => {
    expandedGroups.value[index] = !expandedGroups.value[index];
  };

  // 搜索人员
  const searchOptions: any = ref({
    condition: '',
  });
  // 人员列表
  const psnList: any = ref([]);
  const groupList: any = ref([]);
  const handleGetMemberList = () => {
    if (!searchOptions.value.condition) {
      return ThMeetingStore.inviteMemberList;
    }
    const searchQuery = searchOptions.value.condition.toLowerCase();
    return ThMeetingStore.inviteMemberList.filter((user: any) =>
      user.name.toLowerCase().includes(searchQuery)
    );
  };
  const handleGetGroupList = async () => {
    if (!searchOptions.value.condition) {
      return ThMeetingStore.inviteMemberGroup;
    }
    const searchQuery = searchOptions.value.condition.toLowerCase();
    return ThMeetingStore.inviteMemberGroup
      .map((group: any) => ({
        ...group,
        contacts: group.contacts.filter((contact: any) =>
          contact.name.toLowerCase().includes(searchQuery)
        ),
      }))
      .filter((group: any) => group.contacts.length > 0);
  };
  const handleSearch = async () => {
    if (inviteTabActive.value === 1) {
      psnList.value = await handleGetMemberList();
    } else if (inviteTabActive.value === 2) {
      groupList.value = await handleGetGroupList();
    }
  };
  const handleSelectTab = (type: number) => {
    inviteTabActive.value = type;
    searchOptions.value.condition = '';
    handleSearch();
  };
  // 人员选择集合
  const selectPsnList = ref<any[]>([]);
  const isUserSelected = (userId: any) => {
    const isHas =
      selectPsnList.value.some((item) => item.userId === userId) ||
      ThMeetingStore.roomAssistMember.some(
        (item: any) => item.userId === userId
      );
    return isHas;
  };
  const handleSelectRow = (data: any) => {
    const isHasRoomAssist = ThMeetingStore.roomAssistMember.some(
      (item: any) => item.userId === data.userId
    );
    if (isHasRoomAssist) return;
    const index = selectPsnList.value.findIndex(
      (item) => item.userId === data.userId
    );
    if (index === -1) {
      // userId 不存在，添加到 selectPsnList 中
      if (
        selectPsnList.value.length + ThMeetingStore.roomAssistMember.length <=
        ThMeetingStore.limitMember
      ) {
        // userId 不存在，添加到 selectPsnList 中
        selectPsnList.value.push(data);
      } else {
        msg.error(
          `${t('mst.member.limit.member.tip')} ${ThMeetingStore.limitMember}`
        );
      }
    } else {
      // userId 已存在，从 selectPsnList 中移除
      selectPsnList.value.splice(index, 1);
    }
  };
  const offsetX = ref(20);
  const getImageStyle = (index: number) => ({
    zIndex: index,
    left: `${index * offsetX.value}px`,
  });
  const showPsnOnlineType = (data: any) => {
    const classType = ref('');
    if (data.pcOnline || data.androidOnline || data.glassOnline) {
      classType.value = 'online';
    } else {
      classType.value = 'outline';
    }
    return classType.value;
  };
  const handleInvite = () => {
    emit('handleInvite', selectPsnList.value);
  };
  onMounted(() => {
    handleSearch();
  });
</script>

<style lang="less" scoped>
  .invite-modal-container {
    width: 551px;
    background: #ffffff;
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
    .invite-m-t {
      height: 76px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 20px;
      color: #333f4e;
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
        background: #f3f9ff;
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
            color: #0a1629;
          }
          &.active {
            background: #0267ff;
            border-radius: 4px;
            span {
              font-weight: bold;
              font-size: 16px;
              color: #ffffff;
            }
          }
        }
      }
    }
    .invite-m-s {
      height: 52px;
      padding: 0 30px;
      .search-input {
        background: #ffffff;
        box-shadow: 0px 0px 30px 0px rgba(89, 104, 178, 0.06),
          0px 30px 40px 0px rgba(89, 104, 178, 0.06);
        border-radius: 4px;
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
              border-radius: 50%;
            }
            &.rotate-icon {
              transform: rotate(-90deg);
            }
          }
          .header-main-title {
            span {
              font-weight: 500;
              font-size: 16px;
              color: rgb(29, 33, 41);
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
            width: 44px;
            height: 44px;
            position: relative;
            margin-right: 12px;
            img {
              width: 44px;
              height: 44px;
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
                color: #333f4e;
                line-height: 20px;
              }
            }
            .invite-m-main-i-rr-b {
              span {
                font-weight: 400;
                font-size: 14px;
                color: #a3b2c7;
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
    .invite-m-b {
      width: 100%;
      height: 96px;
      padding-left: 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff;
      box-shadow: 4px 4px 20px 0px rgba(32, 73, 109, 0.1);
      .invite-m-b-l {
        width: calc(100% - 182px);
        height: 40px;
        display: flex;
        align-items: center;
        position: relative;
        .invite-m-b-l-i {
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
      .invite-m-b-r {
        flex-shrink: 0;
        width: 182px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        .invite-m-b-r-btn {
          cursor: pointer;
          width: 132px;
          height: 46px;
          background: #0267ff;
          box-shadow: 0px 8px 30px 0px rgba(65, 89, 214, 0.3);
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
