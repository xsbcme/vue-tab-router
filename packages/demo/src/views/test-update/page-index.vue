<template>
  <a-card :style="{ height: '100%' }">
    <div>
      <div>当前页面参数：{{ props }}</div>
      <a-space wrap>
        <a-button @click="handleUpdateParams">更新页面参数</a-button>
        <a-button status="danger" @click="handleClose">关闭当前标签页</a-button>
      </a-space>
    </div>
  </a-card>
</template>
<script lang="ts" setup>
import { useTabsManager } from "@xsbcme/vue-tab-router";

const props = defineProps<{
  a?: string;
}>();

const tabsManager = useTabsManager();

const handleUpdateParams = () => {
  tabsManager.updateTabOptions({
    a: new Date().getTime().toString(),
  });
};

const handleClose = () => {
  tabsManager.closeTab();
};
</script>
<style lang="scss" scoped></style>
