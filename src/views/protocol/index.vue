<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="container wsl-scroll">
    <div v-html="htmlText"></div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useCommonStore } from '@/store';

  import { Message } from '@arco-design/web-vue';

  const commonStore = useCommonStore();
  const htmlText: any = ref('');
  const handleGetPlatformDetail = async () => {
    const domain = window.location.hostname;
    const res: any = await commonStore.getPlatformDetail({
      domain,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      return;
    }
    htmlText.value = res.data.agreement.replace(/\r\n/g, '<br />');
  };
  onMounted(() => {
    handleGetPlatformDetail();
  });
</script>

<style lang="less" scoped>
  .container {
    width: 100%;
    height: 100%;
    padding: 20px;
  }
</style>
