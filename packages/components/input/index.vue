<template>
  <div class="icon-input-wrapper">
    <img class="pre-icon" :src="searchIcon" alt="" />
    <input
      :value="modelValue"
      :placeholder="placeholder"
      class="icon-input"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />
    <div v-if="modelValue && isFocused" class="icon-clear" @click="clearInput">
      <img :src="clearIcon" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import searchIcon from './assets/Search.png';
  import clearIcon from './assets/Clear.png';

  const props = defineProps({
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '请输入',
    },
  });

  const emit = defineEmits(['update:modelValue', 'input', 'focus', 'blur']);

  const isFocused = ref(false);

  const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
    emit('input', target.value);
  };

  const onFocus = (event: FocusEvent) => {
    isFocused.value = true;
    emit('focus', event);
  };

  const onBlur = (event: FocusEvent) => {
    isFocused.value = false;
    emit('blur', event);
  };

  const clearInput = () => {
    emit('update:modelValue', '');
    emit('input', '');
  };
</script>

<style lang="less" scoped>
  .icon-input-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
  }

  .icon-input {
    all: unset;
    width: 100%;
    height: 100%;
    padding: 0 40px; /* space for the icon */
    box-sizing: border-box;
  }

  .icon-clear {
    position: absolute;
    right: 16px;
    cursor: pointer;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #f4f6fd;
    img {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
    }
  }
  .pre-icon {
    position: absolute;
    left: 16px;
    width: 20px;
    height: 20px;
  }
</style>
