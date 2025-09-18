<template>
  <div
    class="dropdown-container"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="dropdown-trigger" @click="toggleDropdown">
      <slot></slot>
    </div>
    <div
      v-if="isOpen"
      :class="['dropdown-content', position]"
      :style="dropdownStyle"
      @click.stop
    >
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
  import THEventBus from '../../services/THEventBus';

  interface DropdownProps {
    position: string;
    trigger: string;
    offset: number;
    disable: boolean;
  }

  const propsWithDefaults = withDefaults(defineProps<DropdownProps>(), {
    position: 'top',
    trigger: 'hover',
    offset: 0,
    disable: false,
  });

  const isOpen = ref(false);

  const toggleDropdown = (event: MouseEvent) => {
    if (propsWithDefaults.disable) return;
    if (propsWithDefaults.trigger === 'click') {
      if (isOpen.value) {
        isOpen.value = false;
      } else {
        THEventBus.emit('closeAllDropdowns'); // 通知关闭所有下拉菜单
        isOpen.value = true;
      }
      event.stopPropagation(); // 阻止事件传播
    }
  };

  const handleMouseEnter = () => {
    if (propsWithDefaults.trigger === 'hover') {
      isOpen.value = true;
    }
  };

  const handleMouseLeave = () => {
    if (propsWithDefaults.trigger === 'hover') {
      isOpen.value = false;
    }
  };

  const closeDropdown = () => {
    isOpen.value = false;
  };

  const handleDocumentClick = () => {
    if (propsWithDefaults.trigger === 'click' && isOpen.value) {
      closeDropdown();
    }
  };

  watch(
    () => isOpen.value,
    (newVal) => {
      if (newVal && propsWithDefaults.trigger === 'click') {
        document.addEventListener('click', handleDocumentClick);
      } else {
        document.removeEventListener('click', handleDocumentClick);
      }
    }
  );

  onMounted(() => {
    document.addEventListener('click', handleDocumentClick);
    THEventBus.on('closeAllDropdowns', closeDropdown); // 监听关闭所有下拉菜单的事件
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick);
    THEventBus.off('closeAllDropdowns', closeDropdown); // 移除事件监听
  });

  const dropdownStyle = computed(() => {
    let style = {};

    switch (propsWithDefaults.position) {
      case 'bottom':
        style = {
          ...style,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: `${propsWithDefaults.offset}px`,
        };
        break;
      case 'top':
        style = {
          ...style,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: `${propsWithDefaults.offset}px`,
        };
        break;
      case 'left':
        style = {
          ...style,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: `${propsWithDefaults.offset}px`,
        };
        break;
      case 'right':
        style = {
          ...style,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: `${propsWithDefaults.offset}px`,
        };
        break;
      default:
        style = {};
        break;
    }

    return style;
  });
  defineExpose({
    closeDropdown,
  });
</script>

<style scoped>
  .dropdown-container {
    position: relative;
    display: inline-block;
  }

  .dropdown-trigger {
    cursor: pointer;
  }

  .dropdown-content {
    position: absolute;
    cursor: pointer;
    z-index: 1000;
  }

  .dropdown-content.bottom {
    top: 100%;
  }

  .dropdown-content.top {
    bottom: 100%;
  }

  .dropdown-content.left {
    right: 100%;
  }

  .dropdown-content.right {
    left: 100%;
  }

  .dropdown-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    z-index: 1001;
  }

  .dropdown-content.bottom .dropdown-arrow {
    top: -6px;
    left: 50%;
    margin-left: -6px;
    border-width: 0 6px 6px 6px;
    border-color: transparent transparent rgba(23, 32, 46, 0.76) transparent;
  }

  .dropdown-content.top .dropdown-arrow {
    bottom: -6px;
    left: 50%;
    margin-left: -6px;
    border-width: 6px 6px 0 6px;
    border-color: rgba(23, 32, 46, 0.76) transparent transparent transparent;
  }

  .dropdown-content.left .dropdown-arrow {
    right: -6px;
    top: 50%;
    margin-top: -6px;
    border-width: 6px 0 6px 6px;
    border-color: transparent transparent transparent rgba(23, 32, 46, 0.76);
  }

  .dropdown-content.right .dropdown-arrow {
    left: -6px;
    top: 50%;
    margin-top: -6px;
    border-width: 6px 6px 6px 0;
    border-color: transparent rgba(23, 32, 46, 0.76) transparent transparent;
  }
</style>
