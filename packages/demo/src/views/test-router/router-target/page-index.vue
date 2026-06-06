<template>
  <a-card :style="{ height: '100%' }">
    <a-space direction="vertical" fill>
      <div>这里是路由目标页面</div>
      <div>页面接收参数：{{ props }}</div>
      <a-button @click="openInnerTab">在当前容器内打开其它页面</a-button>
    </a-space>
  </a-card>
</template>
<script lang="ts" setup>
import { useTabsManager } from "@xsbcme/vue-tab-router";

const props = defineProps<{
  a?: number;
}>();

const tabsManager = useTabsManager();

const openInnerTab = () => {
  tabsManager.openTab("/src/views/test-update/page-index.vue", {
    _viewName: "容器内打开页",
    from: "router-target",
    time: Date.now(),
  });
};
</script>
<style lang="scss" scoped></style>
