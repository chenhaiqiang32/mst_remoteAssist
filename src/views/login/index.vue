<template>
  <div
    class="container wsl-scroll"
    :style="{ backgroundImage: `url(${loginBg})` }"
  >
    <!-- <div class="logo">
      <img alt="logo" :src="commonStore.platformConfig.logo" />
    </div> -->

    <div class="content">
      <div class="content-left">
        <LoginBanner />
      </div>
      <div class="content-right">
        <LoginForm />
      </div>
    </div>
    <div class="footer">
      <Footer />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useCommonStore } from '@/store';
  import loginBg from '@/assets/images/login/bg_login.png';
  import Footer from '@/components/footer/index.vue';
  import LoginBanner from './components/banner.vue';
  import LoginForm from './components/login-form.vue';
  import { onMounted } from 'vue'
  import { isWujie } from '@/utils/wujie';
  const commonStore: any = useCommonStore();
  onMounted(() => {
    if (isWujie()) {
      window?.$wujie?.bus?.$emit('REPEAT_LOGIN', {
        name: 'login',
      })
    }
  })
</script>

<style lang="less" scoped>
  .container {
    min-width: 800px;
    min-height: 630px;
    height: 100vh;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-position: center;

    .logo {
      position: absolute;
      top: 35px;
      left: 35px;
      height: 52px;
      img {
        width: auto;
        height: 100%;
      }
    }
    .content {
      width: 800px;
      height: 460px;
      display: flex;
      border-radius: 12px;
      overflow: hidden;
      background-color: var(--color-bg-5);
      box-shadow: 0px 8px 12px 0px rgba(184, 184, 184, 0.25);
      .content-left {
        width: 360px;
        height: 100%;
        background: #165dff;
      }
      .content-right {
        width: 440px;
        height: 100%;
      }
    }

    .footer {
      width: 100%;
      height: auto;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 16px;
      margin: 0 auto;
      z-index: 2;
    }
  }
</style>
