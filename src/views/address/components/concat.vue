<template>
  <a-card
    class="general-card concat-panel"
    :bordered="false"
    :body-style="{
      width: '100%',
      height: '100%',
      display: 'flex',
      padding: 0,
      flexFlow: 'column',
    }"
  >
    <div class="concat-container">
      <div class="concat-top">
        <div class="concat-top-left" @click="handleBackAddress">
          <IconArrowsLeft></IconArrowsLeft>
          <span> {{ $t('meeting.member.left.btn.concat.qr') }}</span>
        </div>
        <div class="concat-top-right">
          <a-space>
            <a-input-search
              v-model="searchParams.condition"
              :style="{ width: '100%' }"
              :placeholder="$t('meeting.member.tabs.search')"
              @input="handleSearch"
            />
            <a-button
              type="primary"
              class="btn-item"
              :disabled="!(selectMember.length > 0)"
              @click="handleExportSelect"
              >{{ $t('meeting.member.left.btn.concat.export') }}</a-button
            >
          </a-space>
        </div>
      </div>
      <a-divider :margin="0" />
      <div class="concat-desc">
        <div class="concat-desc-l" @click="handleCheckAll">
          <SelectIcon v-if="isCheckAll"></SelectIcon>
          <SelectNoIcon v-else></SelectNoIcon>
        </div>
        <div class="concat-desc-r">
          <span>{{ t('meeting.member.left.btn.concat.all') }}</span>
        </div>
      </div>
      <div class="concat-main wsl-scroll">
        <a-row
          :gutter="[16, 16]"
          :style="{
            marginTop: '10px',
          }"
        >
          <a-col
            v-for="(item, index) in memberList"
            :key="`psn_${index}`"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="8"
            :xl="6"
            :xxl="6"
            @click="handleSelectRow(item)"
          >
            <a-card class="grid-card" hoverable>
              <div class="block-item-grid">
                <div class="block-item-grid-left">
                  <div class="block-item-grid-left-icon">
                    <img :src="item.avatarUrl" alt="" />
                    <div
                      class="block-item-grid-left-icon-status"
                      :class="
                        item.pcOnline || item.glassOnline || item.androidOnline
                          ? 'online'
                          : 'outline'
                      "
                    >
                    </div>
                  </div>
                </div>
                <div class="block-item-grid-right">
                  <div class="block-item-grid-right-top">
                    <span>{{ item.name }}</span>
                  </div>
                  <div class="block-item-grid-right-bot">
                    <span>{{ item.alias }}</span>
                  </div>
                </div>
              </div>
              <div class="grid-card-fixed">
                <SelectIcon v-if="isUserSelected(item.userId)"></SelectIcon>
                <SelectNoIcon v-else></SelectNoIcon>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useAddressStore, useUserStore } from '@/store';
  import IconArrowsLeft from '@/assets/svg/icon_arrows_left.svg';
  import SelectNoIcon from '@/assets/svg/icon_unselected.svg';
  import SelectIcon from '@/assets/svg/icon_select.svg';
  import { objToArrForKey, downloadFile, ObjectTrans } from '@/utils';
  import { Message } from '@arco-design/web-vue';

  const emit = defineEmits(['handleChangePage']);
  const { t } = useI18n();
  const addressStore = useAddressStore();
  const userStore = useUserStore();
  const memberList: any = ref(addressStore.memberList);
  const selectMember: any = ref([]);
  const searchParams: any = ref({
    condition: '',
  });
  const isCheckAll: any = ref(false);
  const isUserSelected = (userId: any) => {
    return selectMember.value.some((item: any) => item.userId === userId);
  };
  const handleSelectRow = (data: any) => {
    const index = selectMember.value.findIndex(
      (item: any) => item.userId === data.userId
    );
    if (index === -1) {
      // userId 不存在，添加到 selectPsnList 中
      selectMember.value.push(data);
    } else {
      // userId 已存在，从 selectPsnList 中移除
      selectMember.value.splice(index, 1);
    }
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
  const handleSearch = async () => {
    memberList.value = handleSearchMember();
  };
  const handleCheckAll = () => {
    if (isCheckAll.value) {
      isCheckAll.value = false;
      selectMember.value = [];
    } else {
      isCheckAll.value = true;
      selectMember.value = ObjectTrans(memberList.value);
    }
  };
  const handleExportSelect = async () => {
    try {
      const res: any = await userStore.batchExport({
        ids: objToArrForKey(selectMember.value, 'userId'),
      });
      downloadFile(
        res,
        `${t('meeting.member.left.btn.concat.export.name')}.zip`,
        'application/zip'
      );
    } catch {
      Message.error(t('meeting.member.left.btn.concat.export.msg1'));
    }
  };
  const handleBackAddress = () => {
    emit('handleChangePage', 0);
  };
</script>

<style lang="less" scoped>
  .concat-panel {
    width: 100%;
    height: 100%;
    .concat-container {
      width: 100%;
      height: 100%;
      .concat-top {
        width: 100%;
        height: 64px;
        padding: 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        &-left {
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;

          span {
            font-weight: 400;
            font-size: 16px;
            color: var(--color-neutral-10);
          }
        }
      }
      .concat-desc {
        width: 100%;
        height: 50px;
        padding: 0 16px;
        display: flex;
        align-items: center;
        .concat-desc-l {
          cursor: pointer;
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .concat-desc-r {
          display: flex;
          align-items: center;
          margin-left: 7px;
          span {
            font-weight: 400;
            font-size: 16px;
            color: #000000;
          }
        }
      }
      .concat-main {
        padding: 0 16px 16px;
        height: calc(100vh - 60px - 5px - 64px - 16px - 50px);
        .grid-card {
          cursor: pointer;
          padding: 22px 24px;
          position: relative;
          .grid-card-fixed {
            cursor: pointer;
            flex-shrink: 0;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            top: 8px;
            right: 8px;
            img {
              width: 100%;
              height: 100%;
            }
          }
          .block-item-grid {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;

            &-left {
              flex-shrink: 0;
              width: 48px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 14px;
              &-icon {
                flex-shrink: 0;
                width: 48px;
                height: 48px;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                img {
                  width: 100%;
                  height: 100%;
                  border-radius: var(--border-radius-circle);
                }
                &-status {
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
            }
            &-right {
              flex: 1;
              &-top {
                min-height: 24px;
                margin-bottom: 2px;
                span {
                  font-weight: 500;
                  font-size: 16px;
                  line-height: 24px;
                  color: var(--color-neutral-10);
                }
              }
              &-bot {
                span {
                  font-weight: 400;
                  font-size: 12px;
                  color: var(--color-neutral-5);
                }
              }
            }
          }
        }
      }
    }
    :deep(.arco-btn-icon) {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    :deep(.arco-card-bordered) {
      border-radius: var(--border-radius-large);
    }
    :deep(.arco-card-body) {
      padding: 0;
    }
    :deep(.btn-item) {
      min-width: 120px !important;
    }
  }
</style>
