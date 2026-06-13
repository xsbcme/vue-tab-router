<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="单例路由测试">
    <div>
      <div>单例路由 - 覆盖模式 - 默认使用多例模式</div>
      <div>
        <ul>
          <li><button @click="handleToPage({ a: 1 })">打开目标页面参数为{a:1}</button></li>
          <li><button @click="handleToPage({ a: 2 })">打开目标页面参数为{a:2}</button></li>
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
    _viewSingle: true,
    ...props,
  });
};
</script>
<style lang="scss" scoped></style>
