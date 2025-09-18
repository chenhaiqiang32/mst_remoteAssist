<template>
  <div class="container"></div>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useUserStore } from '@/store';
  import { Message } from '@arco-design/web-vue';
  import { useChatIndexedDB } from '@/utils/sdk/chatDB';
  import {
    setToken,
    setTokenType,
    setRefreshToken,
    getToken,
  } from '@/utils/auth';
  import { get } from 'lodash-es';

  const dbName = 'ChatDB';
  const { clearAll } = useChatIndexedDB(dbName);
  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();

  const handleInitLogin = async () => {
    const token = getToken();
    if (route.query.code) {
      // 获取access_token
      const res: any = await userStore.getTokenByCode({
        code: route.query.code,
      });
      if (res.code !== 200 && res.code !== 401) {
        Message.error(res.msg);
        return false;
      }
      await clearAll();
      setTokenType(res.data.tokenType);
      setToken(res.data.token);
      setRefreshToken(res.data.refreshToken);
      router.push({
        name: 'MessageList',
      });
    } else if (token) {
      await clearAll();
      router.push({
        name: 'MessageList',
      });
    }
    return false;
  };
  onMounted(() => {
    handleInitLogin();
  });
</script>

<style lang="less">
  .container {
    width: 100%;
    height: 100%;
  }
</style>
