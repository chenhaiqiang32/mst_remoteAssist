<template>
  <div class="banner">
    <div class="banner-inner">
      <div class="banner-inner-t">
        <span>远程协助</span>
      </div>
      <div class="banner-inner-b">
        <span>多人AR第一视角协助</span>
      </div>
    </div>
    <div class="banner-bot">
      <img :src="innerImg" alt="" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import innerImg from '@/assets/images/banner_bg.png';
</script>

<style lang="less" scoped>
  .banner {
    width: 100%;
    height: 100%;

    &-inner {
      padding: 60px 42px 0;

      z-index: 1;
      &-t {
        span {
          font-weight: bold;
          font-size: 32px;
          color: #ffffff;
        }
      }
      &-b {
        margin-top: 20px;
        span {
          font-weight: 400;
          font-size: 14px;
          color: #ffffff;
          line-height: 20px;
        }
      }
    }
    &-bot {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        flex-shrink: 0;
        width: 295px;
        height: 314px;
      }
    }
  }
</style>
