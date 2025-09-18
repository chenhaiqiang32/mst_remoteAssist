<template>
  <div class="remove-modal-container">
    <div class="remove-fixed" @click="handleClose">
      <img :src="closeIcon" alt="" />
    </div>
    <div class="remove-m-t"> {{ $t('meeting.select.tr.title') }} </div>
    <div class="remove-m-s">
      <a-input
        v-model="searchOptions.condition"
        class="search-input"
        @input="handleSearch"
      >
        <template #prefix>
          <icon-search />
        </template>
      </a-input>
    </div>
    <div class="remove-m-m wsl-scroll">
      <div
        v-for="(item, index) in memberList"
        :key="`invite_psn_${index}_${item.userId}`"
        class="remove-m-m-i"
        @click="handleSelectRow(item)"
      >
        <div class="remove-m-m-i-l">
          <img
            :src="isUserSelected(item.userId) ? selectActiveIcon : selectIcon"
            alt="avatar"
          />
        </div>
        <div class="remove-m-m-i-r">
          <div class="remove-m-m-i-rl">
            <img :src="item.avatarUrl" alt="" />
            <div class="remove-m-m-i-rl-s" :class="showPsnOnlineType(item)">
            </div>
          </div>
          <div class="remove-m-m-i-rr">
            <div class="remove-m-m-i-rr-t">
              <span>{{ item.name }}</span>
            </div>
            <div class="remove-m-m-i-rr-b">
              <span>{{ item.alias }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="remove-m-b">
      <div class="remove-m-b-l">
        <template
          v-for="(item, index) in selectPsnList"
          :key="`invite_m_icon_${index}`"
        >
          <div
            v-if="index < addressStore.limitMember"
            class="remove-m-b-l-i"
            :style="getImageStyle(index)"
          >
            <img :src="item.avatarUrl" alt="" />
          </div>
        </template>
      </div>
      <div class="remove-m-b-r">
        <div class="remove-m-b-r-btn" @click="handleSureRemove">
          <span>{{ t('meeting.menu.btn.remove') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { useAddressStore } from '@/store';

  import { useI18n } from 'vue-i18n';
  import closeIcon from '@/assets/icons/icon_close.png';
  import selectIcon from '@/assets/icons/icon_select_no.png';
  import selectActiveIcon from '@/assets/icons/icon_select.png';
  import { Message } from '@arco-design/web-vue';

  const addressStore = useAddressStore();
  const emit = defineEmits(['handleClose', 'handleSureRemove']);
  const { t } = useI18n();
  const handleClose = () => {
    emit('handleClose');
  };
  // 人员列表
  const props = defineProps<{
    members?: any;
  }>();

  // 人员选择集合
  const selectPsnList = ref<any[]>([]);
  const isUserSelected = (userId: any) => {
    return selectPsnList.value.some((item) => item.userId === userId);
  };
  const handleSelectRow = (data: any) => {
    const index = selectPsnList.value.findIndex(
      (item) => item.userId === data.userId
    );
    if (index === -1) {
      // userId 不存在，添加到 selectPsnList 中
      selectPsnList.value.push(data);
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
  const memberList: any = ref([]);
  // 搜索人员
  const searchOptions = ref({
    condition: '',
  });
  const handleGetMemberList = () => {
    if (!searchOptions.value.condition) {
      return props.members;
    }
    const searchQuery = searchOptions.value.condition.toLowerCase();
    return props.members.filter((user: any) =>
      user.name.toLowerCase().includes(searchQuery)
    );
  };
  const handleSearch = () => {
    memberList.value = handleGetMemberList();
    console.log('查询人员事件', memberList.value);
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
  const handleSureRemove = () => {
    if (selectPsnList.value && selectPsnList.value.length > 0) {
      emit('handleSureRemove', selectPsnList.value);
    } else {
      Message.warning(t('message.invite.join.group.select.psn.warning'));
    }
  };
  const handleClearOption = () => {
    selectPsnList.value = [];
  };
  onMounted(() => {
    handleSearch();
  });
  onBeforeUnmount(() => {
    handleClearOption();
  });
</script>

<style lang="less" scoped>
  .remove-modal-container {
    width: 100%;
    background: #ffffff;
    border-radius: 8px 8px 8px 8px;
    position: relative;
    overflow: hidden;
    .remove-fixed {
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
    .remove-m-t {
      height: 76px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      font-size: 20px;
      color: #333f4e;
    }
    .remove-m-s {
      height: 42px;
      padding: 0 30px;
      .search-input {
        width: 100%;
        height: 100%;
      }
    }
    .remove-m-m {
      width: calc(100% - 30px);
      padding-left: 30px;
      height: 400px;
      margin-top: 16px;
      .remove-m-m-i {
        display: flex;
        align-items: center;
        height: 44px;
        margin: 12px 0;
        cursor: pointer;

        .remove-m-m-i-l {
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
        .remove-m-m-i-r {
          width: auto;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          .remove-m-m-i-rl {
            width: 44px;
            height: 44px;
            position: relative;
            margin-right: 12px;
            img {
              width: 44px;
              height: 44px;
              border-radius: 50%;
            }
            .remove-m-m-i-rl-s {
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
          .remove-m-m-i-rr {
            .remove-m-m-i-rr-t {
              span {
                font-weight: 500;
                font-size: 14px;
                color: #333f4e;
                line-height: 20px;
              }
            }
            .remove-m-m-i-rr-b {
              span {
                font-weight: 400;
                font-size: 14px;
                color: #a3b2c7;
              }
            }
          }
        }
        &:hover {
          .remove-m-m-i-r {
            .remove-m-m-i-rr {
              .remove-m-m-i-rr-t {
                span {
                  font-weight: 600;
                }
              }
              .remove-m-m-i-rr-b {
                span {
                  font-weight: 500;
                }
              }
            }
          }
        }
      }
    }
    .remove-m-b {
      width: 100%;
      height: 96px;
      padding-left: 30px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff;
      box-shadow: 4px 4px 20px 0px rgba(32, 73, 109, 0.1);
      .remove-m-b-l {
        width: calc(100% - 182px);
        height: 40px;
        display: flex;
        align-items: center;
        position: relative;
        .remove-m-b-l-i {
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
      .remove-m-b-r {
        flex-shrink: 0;
        width: 182px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        .remove-m-b-r-btn {
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
