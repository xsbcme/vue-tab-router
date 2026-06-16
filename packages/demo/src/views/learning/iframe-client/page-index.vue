<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="Iframe Client">
    <a-space direction="vertical" fill>
      <a-alert type="info">
        这一页演示的是 iframe 页面内部直接使用 `createIframeTabClient()` 的方式。它不是宿主侧的全局消息监听，也不是手写协议示例。
      </a-alert>

      <a-space wrap>
        <a-button type="primary" @click="openIframeClientPage">打开 iframe client 演示</a-button>
        <a-button @click="openOldMessagePage">对照：打开旧版消息演示</a-button>
      </a-space>

      <a-alert>
        iframe client 会自动绑定当前 iframe 所属标签，不需要你在页面里自己猜 tabId。它适合把“打开子页、刷新当前页、更新标题、向来源页签发事件”这类逻辑放回 iframe 页面内部。
      </a-alert>

      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="当前演示入口">{{ activePage || "-" }}</a-descriptions-item>
        <a-descriptions-item label="来源页收到事件">{{ sourceEventMessage || "-" }}</a-descriptions-item>
      </a-descriptions>

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
import { defineTabEvents } from "@xsbcme/vue-tab-router";
import { useLearningTabs, iframeUrls } from "../helpers";
import { iframeLogs } from "@/plugins/tab-router";

const { tabsManager } = useLearningTabs();
const activePage = ref<string>("iframe-client");
const sourceEventMessage = ref("");

defineTabEvents({
  "iframe-client:hello": data => {
    const payload = (data || {}) as { tabId?: string; loadId?: string; time?: string };
    sourceEventMessage.value = `loadId=${payload.loadId || "-"} time=${payload.time || "-"}`;
    iframeLogs.value.unshift(`[${new Date().toLocaleTimeString()}] 来源页收到 iframe client 事件：${sourceEventMessage.value}`);
    iframeLogs.value = iframeLogs.value.slice(0, 30);

    if (payload.tabId) {
      tabsManager.postIframeMessage({
        type: "iframe-client:reply",
        message: "来源页已收到事件",
        time: new Date().toISOString(),
      }, undefined, payload.tabId);
    }
  },
});

const openIframeClientPage = () => {
  activePage.value = "iframe-client";
  tabsManager.openTab(iframeUrls.client, {
    _viewName: "Iframe Client 演示",
    iframeDemo: true,
    pageKind: "iframe-client",
  });
};

const openOldMessagePage = () => {
  activePage.value = "message";
  tabsManager.openTab(iframeUrls.message, {
    _viewName: "Iframe 消息",
    iframeDemo: true,
  });
};
</script>
