<template>
  <div class="container">
    <div class="layout">
      <div class="layout-left-side">
        <chatVue></chatVue>
      </div>
      <a-divider
        direction="vertical"
        :style="{
          margin: 0,
        }"
      />
      <div class="layout-content">
        <detailVue></detailVue>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import chatVue from './components/chat.vue';
  import detailVue from './components/detail.vue';
</script>

<style scoped lang="less">
  .container {
    background-color: var(--color-fill-2);
    height: calc(100% - 12px);
    padding: 16px 20px;
    padding-bottom: 0;
    display: flex;
  }

  .layout {
    width: 100%;
    height: 100%;
    display: flex;
    border-radius: var(--border-radius-medium);
    overflow: hidden;

    &-left-side {
      flex-basis: 350px;
    }

    &-content {
      flex: 1;
    }
  }
</style>

<style lang="less" scoped>
  // responsive
  @media (max-width: @screen-lg) {
    .layout {
      flex-wrap: wrap;
      &-left-side {
        flex: 1;
        flex-basis: 100%;
        margin-bottom: 16px;
      }

      &-content {
        flex: none;
        flex-basis: 100%;
        padding: 0;
        order: 1;
      }
    }
  }
</style>
