<template>
  <div class="change-password-container modal-container">
    <div class="modal-fixed" @click="handleClose">
      <img :src="closeIcon" alt="" />
    </div>
    <div class="modal-title"> {{ $t('password.modal.title') }} </div>
    <div class="modal-main wsl-scroll">
      <a-form :model="form" layout="vertical">
        <a-form-item field="password" :label="$t('password.modal.new')">
          <a-input-password
            v-model="form.password"
            :placeholder="$t('password.modal.placeholder.new')"
            allow-clear
          />
        </a-form-item>
        <a-form-item field="surePassword" :label="$t('password.modal.sure')">
          <a-input-password
            v-model="form.surePassword"
            :placeholder="$t('password.modal.placeholder.sure')"
            allow-clear
          />
        </a-form-item>
      </a-form>
    </div>
    <div class="modal-bot">
      <a-button class="modal-btn-item" @click="handleClose">{{
        $t('password.form.btn.cancel')
      }}</a-button>
      <a-button
        class="modal-btn-item"
        :disabled="!form.password || !form.surePassword"
        type="primary"
        @click="handleConfirmation"
        >{{ $t('password.form.btn.sure') }}</a-button
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onBeforeUnmount } from 'vue';
  import { useI18n } from 'vue-i18n';
  import closeIcon from '@/assets/icons/icon_close.png';
  import { useUserStore } from '@/store';

  import { Message } from '@arco-design/web-vue';

  const { t } = useI18n();

  const emit = defineEmits(['handleClose', 'handleConfirmation']);
  const userStore = useUserStore();
  const form = ref({
    password: '',
    surePassword: '',
  });

  const handleClearFormData = () => {
    form.value = {
      password: '',
      surePassword: '',
    };
  };

  const handleClose = () => {
    handleClearFormData();
    emit('handleClose');
  };
  const handleConfirmation = async () => {
    if (!form.value.password) {
      Message.warning(t('password.modal.placeholder.new'));
      return;
    }
    if (!form.value.surePassword) {
      Message.warning(t('password.modal.placeholder.sure'));
      return;
    }
    if (form.value.password !== form.value.surePassword) {
      Message.warning(t('password.form.btn.inconformity'));
      return;
    }
    const res: any = await userStore.revampPassword({
      newPassword: form.value.password,
    });
    if (res.code !== 200 && res.code !== 401) {
      Message.error(res.msg);
      return;
    }
    Message.success(t('password.form.btn.success'));
    handleClose();
    emit('handleConfirmation');
  };
  onBeforeUnmount(() => {
    handleClearFormData();
  });
</script>

<style scoped lang="less">
  .change-password-container {
    width: 100%;
    height: 100%;
  }
</style>
