<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="刷新页面测试">
    <div>
      <div>当前时间：{{ time }}</div>
      <div><button @click="handleToRefresh">点我刷新页面</button></div>
    </div>
  </a-card>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

const time = ref(new Date().toLocaleString());

const handleToRefresh = () => {
  tabsManager.refreshTab();
};
</script>
<style lang="scss" scoped></style>
