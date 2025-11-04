<template>
  <div
    class="tooltip-container"
    @mouseenter="updateTooltipPosition"
    @mousemove="updateTooltipPosition"
    @mouseleave="showTooltip = false"
  >
    <div class="slot-wrapper">
      <slot></slot>
    </div>
    <teleport to="body">
      <div v-if="showTooltip" :style="tooltipContainerStyle">
        <div class="tooltip" :class="positionClass" :style="computedTooltipStyle">
          <div class="tooltip-arrow"></div>
          {{ content }}
        </div>
      </div>
    </teleport>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, computed } from 'vue';

  export default defineComponent({
    props: {
      content: {
        type: String,
        required: true,
      },
      position: {
        type: String,
        default: 'top',
        validator: (value: string) =>
          ['top', 'left', 'right', 'bottom'].includes(value),
      },
      offset: {
        type: Number,
        default: 5,
      },
    },
    setup(props) {
      const showTooltip = ref(false);
      const tooltipContainerStyle = ref({});

      const positionClass = computed(() => {
        return `tooltip-${props.position}`;
      });

      const updateTooltipPosition = (event: MouseEvent) => {
        const target = event.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();

        const style: { [key: string]: string } = {
          position: 'fixed',
          zIndex: '9999',
        };

        switch (props.position) {
          case 'top':
            style.top = `${rect.top - props.offset}px`;
            style.left = `${rect.left + rect.width / 2}px`;
            style.transform = 'translateX(-50%) translateY(-100%)';
            break;
          case 'left':
            style.top = `${rect.top + rect.height / 2}px`;
            style.left = `${rect.left - props.offset}px`;
            style.transform = 'translateX(-100%) translateY(-50%)';
            break;
          case 'right':
            style.top = `${rect.top + rect.height / 2}px`;
            style.left = `${rect.right + props.offset}px`;
            style.transform = 'translateY(-50%)';
            break;
          case 'bottom':
            style.top = `${rect.bottom + props.offset}px`;
            style.left = `${rect.left + rect.width / 2}px`;
            style.transform = 'translateX(-50%)';
            break;
          default:
            break;
        }

        tooltipContainerStyle.value = style;
        showTooltip.value = true;
      };

      const computedTooltipStyle = computed(() => {
        return {
          padding: '8px',
          backgroundColor: 'rgba(23, 32, 46, 0.76)',
          color: '#fff',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
        };
      });

      return {
        showTooltip,
        positionClass,
        computedTooltipStyle,
        tooltipContainerStyle,
        updateTooltipPosition,
      };
    },
  });
</script>

<style scoped>
  .tooltip-container {
    position: relative;
    display: inline-block;
    cursor: pointer;
  }

  .slot-wrapper {
    display: inline-block;
  }

  .tooltip {
    display: inline-block;
    color: #fff;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 12px;
  }

  .tooltip-arrow {
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    z-index: 1000;
  }

  .tooltip-top .tooltip-arrow {
    bottom: -6px;
    left: 50%;
    margin-left: -6px;
    border-width: 6px 6px 0 6px;
    border-color: rgba(23, 32, 46, 0.76) transparent transparent transparent;
  }

  .tooltip-bottom .tooltip-arrow {
    top: -6px;
    left: 50%;
    margin-left: -6px;
    border-width: 0 6px 6px 6px;
    border-color: transparent transparent rgba(23, 32, 46, 0.76) transparent;
  }

  .tooltip-left .tooltip-arrow {
    right: -6px;
    top: 50%;
    margin-top: -6px;
    border-width: 6px 0 6px 6px;
    border-color: transparent transparent transparent rgba(23, 32, 46, 0.76);
  }

  .tooltip-right .tooltip-arrow {
    left: -6px;
    top: 50%;
    margin-top: -6px;
    border-width: 6px 6px 6px 0;
    border-color: transparent rgba(23, 32, 46, 0.76) transparent transparent;
  }
</style>
