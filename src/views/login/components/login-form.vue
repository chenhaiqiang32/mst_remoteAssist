<template>
  <div class="login-form-wrapper">
    <div class="login-form-title">{{ $t('login.form.title') }}</div>
    <a-form
      ref="loginForm"
      :model="userInfo"
      class="login-form"
      layout="vertical"
      @submit="handleSubmit"
    >
      <a-form-item
        field="companyNo"
        :rules="[
          { required: true, message: $t('login.form.userCompany.errMsg') },
        ]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input
          v-model="userInfo.companyNo"
          size="large"
          :placeholder="$t('login.form.userCompany.placeholder')"
        >
        </a-input>
      </a-form-item>
      <a-form-item
        field="username"
        :rules="[{ required: true, message: $t('login.form.userName.errMsg') }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input
          v-model="userInfo.username"
          size="large"
          :placeholder="$t('login.form.userName.placeholder')"
        >
        </a-input>
      </a-form-item>
      <a-form-item
        field="password"
        :rules="[{ required: true, message: $t('login.form.password.errMsg') }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input-password
          v-model="userInfo.password"
          size="large"
          :placeholder="$t('login.form.password.placeholder')"
          allow-clear
        >
        </a-input-password>
      </a-form-item>
      <div class="login-form-forget-password">
        <span class="text-no-select" @click="handleSkipForgetPassword">{{
          $t('login.form.forget.password')
        }}</span>
      </div>
      <a-space :size="48" direction="vertical" class="btn-main">
        <a-button
          type="primary"
          size="large"
          html-type="submit"
          long
          :loading="loading"
        >
          {{ $t('login.form.login') }}
        </a-button>
      </a-space>
      <a-space :size="48">
        <div class="login-form-protocol-actions">
          <a-checkbox
            v-model="userInfo.agreeProtocol"
            checked="agreeProtocol"
            @change="setAgreeProtocol as any"
          >
            <span> {{ $t('login.form.agreeProtocol') }}</span>
          </a-checkbox>
          <span class="protocolBlue" @click="handleSkipProtocol">
            {{ $t('login.form.agreeProtocol.text') }}</span
          >
        </div>
      </a-space>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  import { useI18n } from 'vue-i18n';
  import {
    setToken,
    setTokenType,
    setRefreshToken,
    setTimestamp,
  } from '@/utils/auth';
  import { useStorage } from '@vueuse/core';
  import { useUserStore } from '@/store';
  import useLoading from '@/hooks/loading';
  import type { LoginData } from '@/api/user';
  import { Message } from '@arco-design/web-vue';

  const { t } = useI18n();
  const router = useRouter();
  const errorMessage = ref('');
  const { loading, setLoading } = useLoading();
  const userStore = useUserStore();
  const loginConfig: any = useStorage('login-config', {
    companyNo: '',
    username: '',
    password: '',
    agreeProtocol: true,
  });

  // 只在 localStorage 没有值时才设置默认值
  const userInfo = ref({
    ...loginConfig.value,
  });

  const handleSubmit = async ({
    errors,
    values,
  }: {
    errors: Record<string, ValidatedError> | undefined;
    values: Record<string, any>;
  }) => {
    if (loading.value) return;
    if (!errors) {
      if (!values.agreeProtocol) {
        Message.warning(t('login.form.agreeProtocol.text1'));
        return;
      }
      setLoading(true);
      try {
        const res: any = await userStore.login(values as LoginData);
        if (res.code !== 200 && res.code !== 401) {
          Message.error(res.msg);
          return;
        }
        loginConfig.value = {
          ...values,
        };
        setTimestamp();
        setTokenType(res.data.tokenType);
        setToken(res.data.token);
        setRefreshToken(res.data.refreshToken);
        router.push({
          name: 'MessageList',
        });
      } catch (err) {
        errorMessage.value = (err as Error).message;
      } finally {
        setLoading(false);
      }
    }
  };
  const setAgreeProtocol = (value: boolean) => {
    userInfo.value.agreeProtocol = value;
  };
  const handleSkipForgetPassword = () => {
    router.push({
      path: '/ForgetPassword',
    });
  };
  const handleSkipProtocol = () => {
    const url = router.resolve({ path: '/Protocol' }).href; // 解析 URL
    window.open(url, '_blank');
  };
</script>

<style lang="less" scoped>
  .login-form {
    width: 100%;
    height: 100%;
    &-wrapper {
      width: 100%;
      height: 100%;
      padding: 57px 62px 0;
    }

    &-title {
      color: var(--color-text-1);
      font-weight: 500;
      font-size: 32px;
      margin-bottom: 46px;
    }

    &-sub-title {
      color: var(--color-text-3);
      font-size: 16px;
      line-height: 24px;
    }

    &-error-msg {
      height: 32px;
      color: rgb(var(--red-6));
      line-height: 32px;
    }
    &-forget-password {
      cursor: pointer;
      display: flex;
      justify-content: flex-end;
      margin-bottom: 37px;
      span {
        font-weight: 400;
        font-size: 14px;
        color: #0267ff;
      }
    }
    &-password-actions {
      display: flex;
      justify-content: space-between;
    }

    .login-form-protocol-actions {
      display: flex;
      align-items: center;
    }

    .protocolBlue {
      cursor: pointer;
      color: rgb(var(--primary-6)) !important;
    }
    .btn-main {
      width: 100%;
      margin-bottom: 20px;
    }
    &-register-btn {
      color: var(--color-text-3) !important;
    }
  }
</style>
