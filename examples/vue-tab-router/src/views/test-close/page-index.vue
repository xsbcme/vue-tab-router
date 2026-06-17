<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="关闭标签测试">
    <div>
      <div><button @click="handleClose">点我关闭页面</button></div>
    </div>
  </a-card>
</template>
<script lang="ts" setup>
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

const handleClose = () => {
  tabsManager.closeTab();
};
</script>
<style lang="scss" scoped></style>
