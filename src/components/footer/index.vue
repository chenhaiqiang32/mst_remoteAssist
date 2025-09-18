<template>
  <a-layout-footer class="footer">
    <div class="footer-top">
      <span>{{ $t('footer.label') }}</span>
    </div>
    <div class="footer-bot">
      <span>{{ commonStore.platformConfig?.icp }}</span>
    </div>
  </a-layout-footer>
</template>

<script lang="ts" setup>
  import { useCommonStore } from '@/store';

  const commonStore: any = useCommonStore();
</script>

<style lang="less" scoped>
  .footer {
    color: var(--color-text-2);
    text-align: center;
    .footer-top {
      margin-bottom: 2px;
      span {
        font-weight: 400;
        font-size: 12px;
        color: #7d8592;
      }
    }
    .footer-bot {
      span {
        font-weight: 400;
        font-size: 12px;
        color: #7d8592;
      }
    }
  }
</style>
