<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="缓存对照">
    <a-space direction="vertical" fill>
      <a-alert type="info"
        >这一页只比较组件缓存和禁用缓存。打开两个页面后，切到其它标签再回来观察计数和生命周期。</a-alert
      >

      <a-space wrap>
        <a-button type="primary" @click="openCacheEnabled">打开缓存启用页</a-button>
        <a-button @click="openCacheDisabled">打开缓存关闭页</a-button>
        <a-button @click="openSwitchTarget">打开切换目标页</a-button>
      </a-space>

      <a-alert>预期：缓存启用页切回来保留现场；禁用缓存页切回来会重新创建。</a-alert>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { useLearningTabs, viewUrls } from "../helpers";

const { tabsManager, openTarget } = useLearningTabs();

const openCacheEnabled = () => {
  tabsManager.openTab(viewUrls.cacheEnabled, { _viewName: "组件缓存启用" });
};

const openCacheDisabled = () => {
  tabsManager.openTab(viewUrls.cacheDisabled, {
    _viewName: "组件缓存关闭",
    _viewNoCache: true,
  });
};

const openSwitchTarget = () => {
  openTarget("缓存切换目标页", { a: Date.now() });
};
</script>
