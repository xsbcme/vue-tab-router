<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="多例路由测试">
    <div>
      <div>单例路由 - 多例模式</div>
      <div>
        <ul>
          <li><button @click="handleToPage({ a: 3 })">打开目标页面参数为{a:3}</button></li>
          <li><button @click="handleToPage({ a: 4 })">打开目标页面参数为{a:4}</button></li>
        </ul>
      </div>
    </div>
  </a-card>
</template>
<script lang="ts" setup>
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

const handleToPage = (props: Record<string, number>) => {
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: `路由测试-目标页面-a=${props.a}`,
    ...props,
  });
};
</script>
<style lang="scss" scoped></style>
