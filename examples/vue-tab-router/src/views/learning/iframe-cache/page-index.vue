<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="Iframe 缓存">
    <a-space direction="vertical" fill>
      <a-alert type="info"
        >这一页只比较缓存 iframe 和不缓存 iframe。打开后切到组件页，再切回来观察 iframe 内计数。</a-alert
      >

      <a-space wrap>
        <a-button type="primary" @click="openCachedIframe">打开缓存 iframe</a-button>
        <a-button @click="openNoCacheIframe">打开不缓存 iframe</a-button>
        <a-button @click="openComponentTab">打开组件页用于切换</a-button>
      </a-space>

      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="缓存 iframe tabId">{{ cachedIframeTabId || "-" }}</a-descriptions-item>
      </a-descriptions>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useLearningTabs, iframeUrls } from "../helpers";

const { tabsManager, openTarget } = useLearningTabs();
const cachedIframeTabId = ref<string>();

const openCachedIframe = async () => {
  cachedIframeTabId.value = await tabsManager.openTab(iframeUrls.cache, {
    _viewName: "缓存 Iframe 测试",
    cacheMode: "enabled",
    iframeDemo: true,
  });
};

const openNoCacheIframe = () => {
  tabsManager.openTab(iframeUrls.cache, {
    _viewName: "不缓存 Iframe 测试",
    _viewNoCache: true,
    cacheMode: "disabled",
    iframeDemo: true,
  });
};

const openComponentTab = () => {
  openTarget("Iframe 切换目标页", { a: Date.now() });
};
</script>
