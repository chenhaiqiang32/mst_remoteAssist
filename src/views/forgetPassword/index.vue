<template>
  <div
    class="container wsl-scroll"
    :style="{ backgroundImage: `url(${loginBg})` }"
  >
    <div class="top">
      <img class="logo" alt="logo" :src="logoIcon" />
      <div class="top-right">
        <span @click="handleSkipLogin">{{ $t('forget.password.login') }}</span>
      </div>
    </div>
    <div class="content">
      <div class="content-mid">
        <ForgetPassword></ForgetPassword>
      </div>
    </div>
    <div class="footer">
      <Footer />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useRouter } from 'vue-router';

  import loginBg from '@/assets/images/login/bg_login.png';
  import logoIcon from '@/assets/images/logo.png';
  import Footer from '@/components/footer/index.vue';

  import ForgetPassword from './components/forget-form.vue';

  const router = useRouter();

  const handleSkipLogin = () => {
    router.push({
      path: '/login',
    });
  };
</script>

<style lang="less" scoped>
  .container {
    min-width: 800px;
    min-height: 630px;
    height: 100vh;
    position: relative;
    overflow: auto;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-position: center;

    .top {
      width: 100%;
      padding: 0 16px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #ffffff;
      border: 1px solid #e5e6eb;
      .logo {
        flex-shrink: 0;
        width: auto;
        height: 31px;
      }
      .top-right {
        height: 100%;
        display: flex;
        align-items: center;
        span {
          cursor: pointer;
          font-weight: 400;
          font-size: 14px;
          color: #1d2129;
        }
      }
    }
    .content {
      width: 100%;
      height: calc(100% - 60px);
      display: flex;
      align-items: center;
      justify-content: center;
      .content-mid {
        flex-shrink: 0;
        width: 344px;
        height: 404px;
        padding: 20px;
        border-radius: 12px;
        overflow: hidden;
        background-color: var(--color-bg-5);
        box-shadow: 0px 8px 12px 0px rgba(184, 184, 184, 0.25);
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
