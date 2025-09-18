<template>
  <div class="verification-code">
    <input
      v-for="(item, index) in codeLength"
      :key="index"
      v-model="values[index]"
      class="code-input"
      maxlength="1"
      type="text"
      @input="onInput($event, index)"
      @keydown="onKeydown($event, index)"
      @paste="onPaste($event, index)"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, watch } from 'vue';

  export default defineComponent({
    name: 'VerificationCode',
    props: {
      modelValue: {
        type: String,
        default: '',
      },
      codeLength: {
        type: Number,
        default: 9,
      },
    },
    emits: ['update:modelValue', 'finish', 'changing'],
    setup(props, { emit }) {
      const values = ref(Array(props.codeLength).fill(''));

      // Update the local values when modelValue changes
      watch(
        () => props.modelValue,
        (newValue) => {
          values.value = newValue.split('').slice(0, props.codeLength);
        }
      );

      const onInput = (event: Event, index: number) => {
        const input = event.target as HTMLInputElement;
        values.value[index] = input.value;

        if (index < props.codeLength - 1 && input.value) {
          const nextInput = document.querySelectorAll('.code-input')[
            index + 1
          ] as HTMLInputElement;
          nextInput.focus();
        }

        emit('update:modelValue', values.value.join(''));

        if (values.value.join('').length === props.codeLength) {
          emit('finish', values.value.join(''));
        }
      };

      const onKeydown = (event: KeyboardEvent, index: number) => {
        if (event.key === 'Backspace') {
          if (index === props.codeLength - 1 && values.value[index]) {
            // Clear the value of the last input when Backspace is pressed
            values.value[index] = '';
            emit('update:modelValue', values.value.join(''));
            event.preventDefault(); // Prevent default behavior to avoid cursor moving
          } else if (index > 0 && !values.value[index]) {
            // Move focus to previous input if current input is empty and Backspace is pressed
            const prevInput = document.querySelectorAll('.code-input')[
              index - 1
            ] as HTMLInputElement;
            prevInput.focus();
          }
          if (values.value.join('').length <= props.codeLength) {
            emit('changing', values.value.join(''));
          }
        }
      };

      const onPaste = (event: ClipboardEvent, index: number) => {
        const pastedData = (
          event.clipboardData || (window as any).clipboardData
        ).getData('text');

        // Process the pasted data
        const code = pastedData.slice(0, props.codeLength).split('');
        values.value = code.concat(
          Array(props.codeLength - code.length).fill('')
        );

        // Update modelValue
        emit('update:modelValue', values.value.join(''));

        // Move focus to the next input
        const nextInput = document.querySelectorAll('.code-input')[
          code.length
        ] as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
        if (values.value.join('').length === props.codeLength) {
          emit('finish', values.value.join(''));
        }
        event.preventDefault(); // Prevent default paste action
      };

      return {
        values,
        onInput,
        onKeydown,
        onPaste,
      };
    },
  });
</script>

<style scoped>
  .verification-code {
    display: flex;
    gap: 13px;
  }

  .code-input {
    width: 32px;
    height: 32px;
    text-align: center;
    font-size: 14px;
    color: #7d8592;
    border: 1px solid #d8e0f0;
    border-radius: 6px;

    &:focus-visible {
      border-color: #165dff;
    }
  }
</style>
