<template>
  <a-config-provider :locale="locale">
    <router-view />
    <global-setting />
    <MeetingAssist />
    <MeetingAnswer />
  </a-config-provider>
</template>

<script lang="ts" setup>
  import enUS from '@arco-design/web-vue/es/locale/lang/en-us';
  import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn';
  import GlobalSetting from '@/components/global-setting/index.vue';
  import MeetingAnswer from '@/components/meeting/answer/index.vue';
  import MeetingAssist from '@/components/meeting/assist/index.vue';

  import faviconIco from '@/assets/favicon.ico';
  import useLocale from '@/hooks/locale';
  import { Message } from '@arco-design/web-vue';

  import { onMounted, computed } from 'vue';
  import { useCommonStore } from './store';

  const commonStore = useCommonStore();

  const { currentLocale } = useLocale();
  const locale = computed(() => {
    switch (currentLocale.value) {
      case 'zh-CN':
        return zhCN;
      case 'en-US':
        return enUS;
      default:
        return enUS;
    }
  });
  const handleHeaderLink = () => {
    const link: any =
      document.querySelector('link[rel~="icon"]') ||
      document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = faviconIco;
    document.getElementsByTagName('head')[0].appendChild(link);
    // document.title = commonStore.platformConfig?.companyName;
  };
  const handleGetPlatformDetail = async () => {
    const domain = window.location.hostname;
    const res: any = await commonStore.getPlatformDetail({
      domain,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      return;
    }
    // document.title = res.data.companyName;
    commonStore.updatePlatformConfig(res.data);
    handleHeaderLink();
  };
  onMounted(() => {
    handleGetPlatformDetail();
  });
</script>
