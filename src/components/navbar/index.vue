<template>
  <div class="navbar">
    <div class="left-side">
      <a-space>
        <img alt="logo" :src="commonStore.platformConfig?.oneToOneLogo" />
        <a-typography-title
          :style="{ margin: 0, fontSize: '18px' }"
          :heading="5"
        >
          {{ $t('platform.title') }}
        </a-typography-title>
        <icon-menu-fold
          v-if="!topMenu && appStore.device === 'mobile'"
          style="font-size: 22px; cursor: pointer"
          @click="toggleDrawerMenu"
        />
      </a-space>
    </div>
    <div class="center-side">
      <Menu v-if="topMenu" />
    </div>
    <ul class="right-side">
      <!-- <li>
        <a-tooltip :content="$t('settings.search')">
          <a-button class="nav-btn" type="outline" :shape="'circle'">
            <template #icon>
              <icon-search />
            </template>
          </a-button>
        </a-tooltip>
      </li> -->
      <li>
        <a-tooltip :content="$t('settings.language')">
          <a-button
            class="nav-btn"
            type="outline"
            :shape="'circle'"
            @click="setDropDownVisible"
          >
            <template #icon>
              <icon-language />
            </template>
          </a-button>
        </a-tooltip>
        <a-dropdown trigger="click" @select="changeLocale as any">
          <div ref="triggerBtn" class="trigger-btn"></div>
          <template #content>
            <a-doption
              v-for="item in locales"
              :key="item.value"
              :value="item.value"
            >
              <template #icon>
                <icon-check v-show="item.value === currentLocale" />
              </template>
              {{ item.label }}
            </a-doption>
          </template>
        </a-dropdown>
      </li>
      <li>
        <a-dropdown @popup-visible-change="handleInitQuitList">
          <a-tooltip :content="$t('settings.application')">
            <a-button class="nav-btn" type="outline" :shape="'circle'">
              <template #icon>
                <icon-apps />
              </template>
            </a-button>
          </a-tooltip>
          <template #content>
            <div class="quick_access_main">
              <div
                v-for="(link, lIndex) in companyStore.quickEnters"
                :key="`quick_${lIndex}`"
                class="quick_access_main_item"
                @click="handleSkip(link)"
              >
                <div class="quick_access_main_item_main">
                  <img
                    class="quick_access_main_item_m_icon"
                    :src="link.iconUrl"
                    alt=""
                  />
                  <div class="quick_access_main_item_m_label">
                    <span> {{ showQuickItem(link) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </a-dropdown>
      </li>
      <li>
        <a-badge :count="messageNum" dot>
          <a-button
            class="nav-btn"
            type="outline"
            :shape="'circle'"
            @click="handleSkipInterior('/Message-List')"
          >
            <icon-notification />
          </a-button>
        </a-badge>
      </li>
      <li>
        <a-tooltip :content="$t('messageBox.ar.logo.title')">
          <a-button
            class="nav-btn"
            type="outline"
            :shape="'circle'"
            @click="handleArLoginQrCode"
          >
            <template #icon>
              <icon-qrcode />
            </template>
          </a-button>
        </a-tooltip>
      </li>
      <!-- <li>
        <a-tooltip
          :content="
            isFullscreen
              ? $t('settings.navbar.screen.toExit')
              : $t('settings.navbar.screen.toFull')
          "
        >
          <a-button
            class="nav-btn"
            type="outline"
            :shape="'circle'"
            @click="toggleFullScreen"
          >
            <template #icon>
              <icon-fullscreen-exit v-if="isFullscreen" />
              <icon-fullscreen v-else />
            </template>
          </a-button>
        </a-tooltip>
      </li> -->
      <li>
        <a-avatar :size="32" :style="{ marginRight: '8px', cursor: 'pointer' }">
          <img alt="avatar" :src="avatar" />
        </a-avatar>
        <a-dropdown trigger="click" position="br">
          <div class="user-info">
            <div class="user-info-name">
              <span>{{ name }}</span>
            </div>
            <div class="user-info-bot">
              <template v-if="commonStore.networkStatus">
                <!-- 存在网络 -->
                <div
                  v-if="commonStore.socketStatus == 3"
                  class="user-info-bot-i"
                  :class="commonStore.networkStatus ? 'online' : 'outline'"
                ></div>
                <a-spin
                  v-if="commonStore.socketStatus === 2"
                  :size="12"
                ></a-spin>
                <div class="user-info-bot-l">
                  {{
                    commonStore.socketStatus === 2
                      ? socketStatus
                      : $t('meeting.invite.line.status.online')
                  }}</div
                >
              </template>
              <!-- 不存在网络 -->
              <template v-else>
                <div class="user-info-bot-i outline"></div>
                <div class="user-info-bot-l"
                  >{{ $t('meeting.invite.line.status.outline') }}
                </div>
              </template>
            </div>
          </div>
          <template #content>
            <!-- <a-doption>
              <a-space @click="$router.push({ name: 'Info' })">
                <icon-user />
                <span>
                  {{ $t('messageBox.userCenter') }}
                </span>
              </a-space>
            </a-doption> -->
            <a-doption>
              <a-space>
                <img
                  :style="{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                  }"
                  :src="avatar"
                  alt=""
                />
                <span>
                  {{ name }}
                </span>
              </a-space>
            </a-doption>
            <a-doption @click="handleChangePassword">
              <a-space>
                <IconChangePassword />
                <span>
                  {{ $t('messageBox.change.password') }}
                </span>
              </a-space>
            </a-doption>
            <a-doption @click="handleLogout">
              <a-space>
                <icon-export />
                <span>
                  {{ $t('messageBox.logout') }}
                </span>
              </a-space>
            </a-doption>
          </template>
        </a-dropdown>
      </li>
    </ul>
    <!-- dialog password -->
    <a-modal
      v-if="changePasswordModalVisible"
      v-model:visible="changePasswordModalVisible"
      :footer="false"
      :closable="false"
      class="customModal"
    >
      <changePasswordModal
        @handle-close="handleCloseChangePassword"
        @handle-confirmation="handleChangePasswordConfirmation"
      ></changePasswordModal>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, inject, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useChatIndexedDB } from '@/utils/sdk/chatDB';
  // import { useFullscreen } from '@vueuse/core'; // useDark, useToggle,
  import {
    useAppStore,
    useUserStore,
    useCommonStore,
    useChatStore,
    useCompanyStore,
  } from '@/store';
  import { LOCALE_OPTIONS } from '@/locale';
  import useLocale from '@/hooks/locale';
  import useUser from '@/hooks/user';
  import Menu from '@/components/menu/index.vue';
  import EventListener from '@/utils/event-listener';
  // import MessageBox from '../message-box/index.vue';
  import changePasswordModal from '@/components/password/chang.vue';

  import IconChangePassword from '@/assets/icons/icon_change_password.svg';
  import { Message } from '@arco-design/web-vue';

  import { useRouter } from 'vue-router';

  const appStore = useAppStore();
  const userStore = useUserStore();
  const commonStore = useCommonStore();
  const chatStore = useChatStore();
  const companyStore = useCompanyStore();
  const router = useRouter();

  const { t, locale } = useI18n();
  const dbName = 'ChatDB';
  const { getAllConversations } = useChatIndexedDB(dbName);
  const { clearAll } = useChatIndexedDB(dbName);

  const { logout } = useUser();
  const { changeLocale, currentLocale } = useLocale();
  // const { isFullscreen, toggle: toggleFullScreen } = useFullscreen();
  const locales = [...LOCALE_OPTIONS];
  const avatar = computed(() => {
    return userStore.avatarUrl;
  });
  const name = computed(() => {
    return userStore.name;
  });
  const socketStatus = computed(() => {
    if (commonStore.socketStatus === 1) {
      return t('socket.status1');
    }
    if (commonStore.socketStatus === 2) {
      return t('socket.status2');
    }
    return '';
  });

  const topMenu = computed(() => appStore.topMenu && appStore.menu);

  const triggerBtn = ref();

  const handleLogout = async () => {
    await logout();
    clearAll();
  };
  const setDropDownVisible = () => {
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    triggerBtn.value.dispatchEvent(event);
  };
  const toggleDrawerMenu = inject('toggleDrawerMenu') as () => void;
  const changePasswordModalVisible = ref(false);
  const handleChangePassword = () => {
    changePasswordModalVisible.value = true;
  };
  const handleCloseChangePassword = () => {
    changePasswordModalVisible.value = false;
  };
  const handleChangePasswordConfirmation = () => {
    handleCloseChangePassword();
  };
  // 二维码登录
  const handleArLoginQrCode = () => {
    EventListener.emit('navbar-show-ar-login-qr-code');
  };
  const messageNum = ref(0);
  const conversationList: any = ref([]);
  const handleComputedMessageNum = async () => {
    messageNum.value = 0;
    conversationList.value = await getAllConversations();
    if (conversationList.value) {
      conversationList.value.forEach((c: any) => {
        messageNum.value += c.unreadCount;
      });
    } else {
      messageNum.value = 0;
    }
  };
  const showQuickItem = (data: any) => {
    const nameObj = JSON.parse(data.entryName);
    return nameObj[locale.value];
  };

  const handleInitQuitList = async (status: any) => {
    console.log('handleInitQuitList', status);
    if (status) {
      const res: any = await companyStore.getQuickList();
      if (res.code !== 200 && res.code !== 401) {
        if (res.code === 20408) {
          return;
        }
        Message.error(res.msg);
        return;
      }
      companyStore.updateQuickEnters(res.data);
    }
  };

  const handleSkip = async (data: any) => {
    if (data.isOwnApp === 0) {
      window.open(data.entryUri, '_blank');
    } else {
      const res: any = await userStore.getApplicationCode({
        client_id: data.appId,
        redirect_uri: data.entryUri,
        scope: 'snsapi_base',
      });
      if (res.code !== 200 && res.code !== 401) {
        if (res.code === 20408) {
          return false;
        }
        Message.error(res.msg);
        return false;
      }
      window.open(`${data.entryUri}?code=${res.data.code}`, '_blank');
    }
    return false;
  };
  const handleSkipInterior = (path: string) => {
    router.push({
      path,
    });
  };
  watch(
    () => chatStore.conversationList,
    (newVal) => {
      if (newVal) {
        handleComputedMessageNum();
      }
    },
    {
      deep: true,
      immediate: true,
    }
  );
</script>

<style scoped lang="less">
  .navbar {
    display: flex;
    justify-content: space-between;
    height: 100%;
    background-color: var(--color-bg-2);
    border-bottom: 1px solid var(--color-border);
  }

  .left-side {
    display: flex;
    align-items: center;
    padding-left: 20px;
    img {
      width: 33px;
      height: 33px;
    }
  }

  .center-side {
    flex: 1;
  }

  .right-side {
    display: flex;
    padding-right: 20px;
    list-style: none;
    :deep(.locale-select) {
      border-radius: 20px;
    }
    li {
      display: flex;
      align-items: center;
      padding: 0 10px;
    }

    a {
      color: var(--color-text-1);
      text-decoration: none;
    }
    .nav-btn {
      border-color: rgb(var(--gray-2));
      color: rgb(var(--gray-8));
      font-size: 16px;
    }
    .trigger-btn,
    .ref-btn {
      position: absolute;
      bottom: 14px;
    }
    .trigger-btn {
      margin-left: 14px;
    }
  }
  .user-info {
    cursor: pointer;
    .user-info-name {
      margin-bottom: 4px;
      span {
        font-weight: 500;
        font-size: 14px;
        color: #1d2129;
      }
    }
    .user-info-bot {
      display: flex;
      align-items: center;
      .user-info-bot-i {
        flex-shrink: 0;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        &.online {
          background-color: #28c445;
        }

        &.outline {
          background-color: #9ca3af;
        }
      }
      .user-info-bot-l {
        margin-left: 3px;
        font-weight: 400;
        font-size: 12px;
        color: #77797e;
      }
    }
  }
</style>

<style lang="less">
  .message-popover {
    .arco-popover-content {
      margin-top: 0;
    }
  }
  .quick_access_main {
    width: 245px;
    border-radius: 6px;
    margin: 0;
    overflow-y: overlay;
    padding: 0 10px;
    scrollbar-width: thin;
    .quick_access_main_item {
      box-sizing: border-box;
      padding: 12px 2px;
      width: 108px;
      display: inline-grid;
      cursor: pointer;
      margin-bottom: 5px;
      .quick_access_main_item_main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .quick_access_main_item_m_icon {
          flex-shrink: 0;
          height: 40px;
          margin-bottom: 4px;
          width: 40px;
        }
        .quick_access_main_item_m_label {
          span {
            display: inline-block;
            font-size: 14px;
            height: 22px;
            line-height: 22px;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
      &:hover {
        background-color: #f2f3f5;
      }
    }
  }
</style>
