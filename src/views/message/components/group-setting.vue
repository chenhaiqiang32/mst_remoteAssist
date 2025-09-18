<template>
  <div class="group-container">
    <div class="group-container-top">
      <div class="group-container-top-left">
        <span>{{ $t('message.chat.group.title') }}</span>
      </div>
      <div class="group-container-top-right" @click="handleClose">
        <img :src="closeIcon" alt="" />
      </div>
    </div>
    <a-divider :margin="0"></a-divider>
    <div class="group-container-main">
      <div class="group-container-main-top">
        <div class="group-container-main-top-left">
          <img :src="chatStore.curGroupDetail.avatarUrl" alt="" />
        </div>
        <div class="group-container-main-top-right">
          <template v-if="!groupNameEdit">
            <a-tooltip :content="chatStore.curGroupDetail.groupName">
              <div class="group-container-main-top-right-n">
                {{ chatStore.curGroupDetail.groupName }}
              </div>
            </a-tooltip>

            <a-tooltip :content="t('message.chat.group.revamp.name.btn')">
              <icon-edit
                v-if="chatStore.curGroupDetail.masterId === userStore.userId"
                @click="handleEditGroupName"
              />
            </a-tooltip>
          </template>
          <a-input
            v-else
            ref="GroupInfoNameRef"
            v-model="chatStore.curGroupDetail.groupName"
            @blur="handleGroupNameBlur"
          ></a-input>
        </div>
      </div>
      <div class="group-container-main-divider">
        <a-divider :margin="0"></a-divider>
      </div>

      <div class="group-container-main-mid">
        <div class="group-container-main-mid-top">
          {{ $t('message.chat.group.mid.top') }} ({{
            chatStore.curGroupDetail.members.length
          }}{{ $t('message.chat.group.mid.dw') }})
        </div>
        <div class="group-container-main-mid-body wsl-scroll">
          <div
            v-for="(item, index) in chatStore.curGroupDetail.members"
            :key="`group_psn_${index}_${item.userId}`"
            class="group-container-main-mid-body-item"
          >
            <div class="group-container-main-mid-body-item-top">
              <img :src="item.avatarUrl" alt="" />
              <div
                v-if="item.isMaster == 1"
                class="group-container-main-mid-body-item-top-fixed"
              >
                <a-tooltip :content="$t('message.chat.group.owner')">
                  <img :src="groupMasterIcon" alt="" />
                </a-tooltip>
              </div>
            </div>
            <a-tooltip :content="item.name">
              <div class="group-container-main-mid-body-item-bot">
                {{ item.name }}
              </div>
            </a-tooltip>
          </div>
          <div key="group_add" class="group-container-main-mid-body-item">
            <div
              class="group-container-main-mid-body-item-top btn"
              @click="handleInviteJoinGroup"
            >
              <img :src="groupAddPsnIcon" alt="" />
            </div>
          </div>
          <template
            v-if="chatStore.curGroupDetail.masterId === userStore.userId"
          >
            <div key="group_layoff" class="group-container-main-mid-body-item">
              <div
                class="group-container-main-mid-body-item-top btn"
                @click="handleRemoveGroup"
              >
                <img :src="groupLayOffPsnIcon" alt="" />
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="group-container-main-divider">
        <a-divider :margin="0"></a-divider>
      </div>
      <div class="group-container-main-menu">
        <a-button
          v-if="chatStore.curGroupDetail.masterId === userStore.userId"
          @click="handleTransferMaster"
        >
          <span>{{ $t('meeting.menu.btn.transfer') }}</span></a-button
        >

        <a-popconfirm
          v-if="chatStore.curGroupDetail.masterId === userStore.userId"
          :content="`${$t('message.chat.group.js.tips')}`"
          type="warning"
          :ok-text="$t('message.chat.group.exit.ok')"
          :cancel-text="$t('message.chat.group.exit.cancel')"
          @ok="handleSureDisbandGroup"
        >
          <a-button type="primary" status="danger">
            <span>{{ $t('message.chat.group.js.btn') }}</span></a-button
          >
        </a-popconfirm>
        <a-popconfirm
          v-else
          :content="`${$t('message.chat.group.exit.tips')}`"
          type="warning"
          :ok-text="$t('message.chat.group.exit.ok')"
          :cancel-text="$t('message.chat.group.exit.cancel')"
          @ok="handleSureExitGroup"
        >
          <a-button type="primary" status="danger">
            <span>{{ $t('meeting.menu.btn.exit') }}</span></a-button
          >
        </a-popconfirm>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useChatStore, useUserStore } from '@/store';
  import closeIcon from '@/assets/icons/icon_close.png';
  import groupMasterIcon from '@/assets/images/user-octagon.png';
  import groupAddPsnIcon from '@/assets/images/psn_add.png';
  import groupLayOffPsnIcon from '@/assets/images/psn_layoff.png';
  import { Message } from '@arco-design/web-vue';

  const { t } = useI18n();
  const chatStore = useChatStore();
  const userStore = useUserStore();
  const emit = defineEmits([
    'handleClose',
    'handleRemoveGroup',
    'handleInviteJoinGroup',
    'handleTransferOpen',
    'handleSureExitGroup',
    'handleSureDisbandGroup',
  ]);
  const handleClose = () => {
    emit('handleClose');
  };
  const GroupInfoNameRef = ref<any>();

  const groupNameEdit = ref<boolean>(false);
  const handleEditGroupName = () => {
    groupNameEdit.value = true;
    setTimeout(() => {
      GroupInfoNameRef?.value.focus();
    }, 100);
  };
  const handleUpdateConversation = () => {
    chatStore.updateCurConversation({
      ...chatStore.curConversation,
      targetName: chatStore.curGroupDetail.groupName,
    });
    chatStore.conversationList.forEach((item: any) => {
      if (item.targetId === chatStore.curGroupDetail.groupId) {
        item.targetName = chatStore.curGroupDetail.groupName;
      }
    });
  };
  const handleGroupNameBlur = async () => {
    if (!chatStore.curGroupDetail.groupName) {
      Message.error(t('message.chat.group.revamp.name.tips'));
      return;
    }
    const res: any = await chatStore.revampGroupName({
      groupId: chatStore.curGroupDetail.groupId,
      groupName: chatStore.curGroupDetail.groupName,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      return;
    }
    Message.success(t('message.chat.group.revamp.name'));
    groupNameEdit.value = false;
    handleUpdateConversation();
  };
  const handleRemoveGroup = () => {
    emit('handleRemoveGroup');
  };
  const handleInviteJoinGroup = () => {
    emit('handleInviteJoinGroup');
  };
  const handleTransferMaster = () => {
    emit('handleTransferOpen');
  };
  const handleSureExitGroup = () => {
    emit('handleSureExitGroup');
  };
  const handleSureDisbandGroup = () => {
    emit('handleSureDisbandGroup');
  };
</script>

<style lang="less" scoped>
  .group-container {
    width: 100%;
    height: 100%;
    &-top {
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px 0 20px;
      &-left {
        flex: 1;
        span {
          font-size: 16px;
          color: var(--color-neutral-10);
          font-weight: 400;
        }
      }
      &-right {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        img {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
        }
      }
    }
    &-main {
      height: calc(100% - 52px);
      &-top {
        padding: 0 16px;
        height: 68px;
        display: flex;
        align-items: center;
        &-left {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          margin-right: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--border-radius-circle);
          img {
            width: 100%;
            height: 100%;
            border-radius: var(--border-radius-circle);
          }
        }
        &-right {
          display: flex;
          align-items: center;

          &-n {
            max-width: 180px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            font-weight: 400;
            font-size: 14px;
            color: var(--color-neutral-10);
            margin-right: 2px;
          }

          .arco-icon {
            cursor: pointer;
            color: var(--color-neutral-4);
          }
        }
      }
      &-divider {
        padding: 0 16px;
      }
      &-mid {
        height: calc(100% - 68px - 60px);
        padding: 14px 0;
        &-top {
          padding: 0 16px;
          font-weight: 400;
          font-size: 14px;
          color: var(--color-neutral-8);
          margin-bottom: 13px;
        }
        &-body {
          width: 100%;
          height: calc(100% - 22px - 13px);
          padding: 0 6px;
          display: flex;
          align-content: flex-start;
          flex-wrap: wrap;
          overflow: hidden;
          overflow-y: scroll;

          /* 使用统一滚动条样式 */
          @extend .custom-scrollbar;
          &-item {
            flex-shrink: 0;
            width: calc(100% / 5);
            height: 54px;
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            &-top {
              flex-shrink: 0;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              img {
                width: 100%;
                height: 100%;
                border-radius: var(--border-radius-circle);
              }
              &-fixed {
                cursor: pointer;
                width: 13px;
                height: 13px;
                position: absolute;
                bottom: 0;
                right: 0;
                display: flex;
                img {
                  width: 100%;
                  height: 100%;
                }
              }
              &.btn {
                cursor: pointer;
                border-radius: var(--border-radius-circle);
                border: 1px solid var(--color-neutral-3);
                img {
                  flex-shrink: 0;
                  width: 24px;
                  height: 24px;
                }
              }
            }
            &-bot {
              cursor: pointer;
              width: 35px;
              margin-top: 4px;
              height: 18px;
              color: var(--color-neutral-8);
              overflow: hidden;
              text-overflow: ellipsis;
              text-align: center;
            }
          }
        }
      }
      &-menu {
        padding: 0 6px;
        height: 60px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        margin: 0 6px;
        .arco-btn {
          margin: 6px;
          width: 100%;
        }
      }
    }
  }
</style>
