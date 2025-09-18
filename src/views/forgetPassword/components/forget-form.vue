<template>
  <div class="forget-form-wrapper">
    <div class="forget-form-title">{{ $t('forget.password.title') }}</div>
    <a-form
      ref="forgetForm"
      :model="forgetPasswordForm"
      class="forget-form"
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
          v-model="forgetPasswordForm.companyNo"
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
          v-model="forgetPasswordForm.username"
          size="large"
          :placeholder="$t('login.form.userName.placeholder')"
        >
        </a-input>
      </a-form-item>
      <div class="concat-info">
        <div v-if="contactInfo.mobile" class="concat-info-body">
          <div class="concat-info-top">
            <span>{{ $t('forget.password.concat.title') }}</span>
          </div>
          <div class="concat-info-bot">
            <div class="concat-info-bot-i">
              <span class="concat-info-bot-i-label"
                >{{ $t('forget.password.concat.key.label1') }}:</span
              >
              <span class="concat-info-bot-i-value">{{
                contactInfo.name
              }}</span>
            </div>
            <div class="concat-info-bot-i">
              <span class="concat-info-bot-i-label"
                >{{ $t('forget.password.concat.key.label2') }}:</span
              >
              <span class="concat-info-bot-i-value">{{
                contactInfo.mobile
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <a-space :size="48" direction="vertical" class="btn-main">
        <a-button
          :disabled="
            !forgetPasswordForm.companyNo || !forgetPasswordForm.username
          "
          type="primary"
          size="large"
          html-type="submit"
          long
          :loading="loading"
        >
          {{ $t('forget.password.btn') }}
        </a-button>
      </a-space>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  import { useI18n } from 'vue-i18n';
  import { useUserStore } from '@/store';
  import useLoading from '@/hooks/loading';
  import { Message } from '@arco-design/web-vue';

  const errorMessage = ref('');
  const { t } = useI18n();
  const userStore = useUserStore();
  const { loading, setLoading } = useLoading();
  const forgetPasswordForm = reactive({
    companyNo: '',
    username: '',
  });
  const contactInfo = ref({
    mobile: '',
    name: '',
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
      setLoading(true);
      try {
        const res: any = await userStore.getMasterInfo({
          companyNo: forgetPasswordForm.companyNo,
          username: forgetPasswordForm.companyNo,
        });
        if (res.code !== 200 && res.code !== 401) {
          Message.error(res.msg);
          return;
        }
        contactInfo.value = res.data;
      } catch (err) {
        errorMessage.value = (err as Error).message;
      } finally {
        setLoading(false);
      }
    }
  };
</script>

<style lang="less" scoped>
  .forget-form {
    width: 100%;
    height: 100%;
    &-wrapper {
      width: 100%;
      height: 100%;
    }

    &-title {
      color: var(--color-text-1);
      font-weight: 500;
      font-size: 26px;
      text-align: center;
      margin-top: 7px;
      margin-bottom: 27px;
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

    .blue {
      color: rgb(var(--primary-6)) !important;
    }
    .btn-main {
      width: 100%;
      margin-bottom: 20px;
    }
    .concat-info {
      width: 100%;
      height: 96px;
      margin-bottom: 56px;
      .concat-info-body {
        width: 100%;
        height: 100%;
        background: #f2f3f5;
        border-radius: 4px;

        padding: 11px;
        .concat-info-top {
          margin-bottom: 8px;
          span {
            font-weight: 400;
            font-size: 14px;
            color: #7d8592;
            line-height: 16px;
          }
        }
        .concat-info-bot {
          .concat-info-bot-i {
            margin-bottom: 6px;
            span {
              font-weight: 400;
              font-size: 12px;
              color: #7d8592;
              line-height: 14px;
            }
            .concat-info-bot-i-label {
              margin-right: 3px;
            }
            .concat-info-bot-i-value {
              color: #0267ff;
            }
          }
        }
      }
    }
  }
</style>
