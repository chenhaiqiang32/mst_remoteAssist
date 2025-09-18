<template>
  <div class="mst-modal-mask">
    <div class="mst-modal">
      <div class="mst-modal-body"> <slot></slot> </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="less" scoped>
  .mst-modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 222 !important;
  }

  .mst-modal {
    width: auto;
    height: auto;
  }

  .mst-modal-body {
    width: auto;
    height: auto;
  }
</style>
