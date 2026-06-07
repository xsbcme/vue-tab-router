<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="Iframe 通信测试">
    <a-space direction="vertical" fill>
      <a-alert>缓存 iframe 切换标签后应保留加载标识和页面内计数；不缓存 iframe 切换回来会重新加载。</a-alert>

      <a-divider orientation="left">链接打开方式</a-divider>
      <a-space wrap>
        <a-button type="primary" @click="openHttpInline">内部链接</a-button>
        <a-button @click="openHttpInlineWithParams">内部链接带参</a-button>
        <a-button @click="openHttpOutside">外部链接</a-button>
        <a-button @click="openHttpOutsideWithParams">外部链接带参</a-button>
        <a-button @click="openRelativeInline">内部相对链接</a-button>
        <a-button @click="openRelativeInlineWithParams">内部相对链接带参</a-button>
        <a-button @click="openRelativeOutside">外部相对链接</a-button>
        <a-button @click="openRelativeOutsideWithParams">外部相对链接带参</a-button>
      </a-space>

      <a-divider orientation="left">Iframe 通信与缓存</a-divider>
      <a-space wrap>
        <a-button type="primary" @click="openCachedIframe">打开缓存 iframe</a-button>
        <a-button @click="openNoCacheIframe">打开不缓存 iframe</a-button>
        <a-button @click="openComponentTab">打开组件页用于切换</a-button>
        <a-button @click="sendToActiveIframe">向当前 iframe 发送消息</a-button>
        <a-button @click="sendToCachedIframeById">按 tabId 发送消息</a-button>
        <a-button @click="openCachedIframe">打开 iframe 后在页面内测试免 tabId</a-button>
      </a-space>
      <a-list bordered :data="iframeLogs">
        <template #item="{ item }">
          <a-list-item>{{ item }}</a-list-item>
        </template>
      </a-list>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { TabViewUrl, useTabsManager } from "@xsbcme/vue-tab-router";
import { iframeLogs } from "@/plugins/tab-router";

const tabsManager = useTabsManager();
const cachedIframeTabId = ref<string>();

const openHttpInline = () => {
  tabsManager.openTab("https://www.baidu.com/", { _viewName: "内部链接" });
};

const openHttpInlineWithParams = () => {
  tabsManager.openTab("https://www.baidu.com/", { _viewName: "内部链接带参", a: 123 });
};

const openHttpOutside = () => {
  tabsManager.openTab("https://www.baidu.com/", { _viewOutside: true });
};

const openHttpOutsideWithParams = () => {
  tabsManager.openTab("https://www.baidu.com/", { _viewOutside: true, a: 123 });
};

const openRelativeInline = () => {
  tabsManager.openTab(TabViewUrl.createRelative("./"), {
    _viewName: "内部相对链接",
    menuKey: "relative-inline",
  });
};

const openRelativeInlineWithParams = () => {
  tabsManager.openTab(TabViewUrl.createRelative("./"), {
    _viewName: "内部相对链接带参",
    menuKey: "relative-inline-with-params",
    a: 123,
  });
};

const openRelativeOutside = () => {
  tabsManager.openTab(TabViewUrl.createRelative("./"), {
    _viewOutside: true,
    menuKey: "relative-outside",
  });
};

const openRelativeOutsideWithParams = () => {
  tabsManager.openTab(TabViewUrl.createRelative("./"), {
    _viewOutside: true,
    menuKey: "relative-outside-with-params",
    a: 123,
  });
};

const openCachedIframe = async () => {
  cachedIframeTabId.value = await tabsManager.openTab(TabViewUrl.createRelative("/iframe-test.html"), {
    _viewName: "缓存 Iframe 通信",
    cacheMode: "enabled",
    iframeDemo: true,
  });
};

const openNoCacheIframe = () => {
  tabsManager.openTab(TabViewUrl.createRelative("/iframe-test.html"), {
    _viewName: "不缓存 Iframe 通信",
    _viewNoCache: true,
    cacheMode: "disabled",
    iframeDemo: true,
  });
};

const openComponentTab = () => {
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: "Iframe 切换目标页",
    a: Date.now(),
  });
};

const sendToActiveIframe = () => {
  tabsManager.postActiveIframeMessage({
    type: "host:active-message",
    time: new Date().toLocaleTimeString(),
  });
};

const sendToCachedIframeById = () => {
  tabsManager.postIframeMessage(cachedIframeTabId.value, {
    type: "host:tab-id-message",
    time: new Date().toLocaleTimeString(),
  });
};
</script>
