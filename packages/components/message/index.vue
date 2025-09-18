<template>
  <div v-if="visible" :class="['message', type]" @click="close">
    {{ content }}
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';

  const props = defineProps({
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'info',
    },
    duration: {
      type: Number,
      default: 3000,
    },
  });

  const visible = ref(true);

  const close = () => {
    visible.value = false;
  };

  onMounted(() => {
    setTimeout(() => {
      close();
    }, props.duration);
  });
</script>

<style lang="less" scoped>
  .message {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 20px;
    border-radius: 30px;
    color: #fff;
    background-color: #333;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    z-index: 99999;
    &.info {
      background-color: #333;
    }
    &.success {
      background-color: #52c41a;
    }
    &.warning {
      background-color: #faad14;
    }
    &.error {
      background-color: #f5222d;
    }
  }
</style>
