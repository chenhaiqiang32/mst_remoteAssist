<template>
  <div class="container">
    <div class="main">
      <div class="main-top">
        <img :src="noPermissionImg" alt="" />
      </div>
      <div class="main-desc">
        <span>{{ $t('error.logout.tip7') }}</span>
      </div>
      <div class="main-desc-t">
        <span>{{ $t('error.logout.tip8') }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import noPermissionImg from '@/assets/images/no_data/noPermission.png';
</script>

<style scoped lang="less">
  .container {
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    .main {
      display: flex;
      flex-direction: column;
      justify-content: center;
      .main-top {
        flex-shrink: 0;
        width: 604px;
        height: 308px;
        img {
          width: 100%;
          height: 100%;
        }
      }
      .main-desc {
        display: flex;
        justify-content: center;
        margin-top: 31px;
        font-weight: bold;
        span {
          font-size: 16px;
        }
      }
      .main-desc-t {
        display: flex;
        justify-content: center;
        margin: 10px 0 20px;
        span {
          font-size: 14px;
        }
      }
      .main-btn {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>
