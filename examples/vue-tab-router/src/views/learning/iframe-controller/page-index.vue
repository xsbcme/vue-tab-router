<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="Iframe Controller">
    <a-space direction="vertical" fill>
      <a-alert type="info">
        这一页演示 iframe controller tab：打开的是 Vue 控制组件路径，实际展示 iframe；iframe
        的样式、加载和消息处理都写在控制组件里。
      </a-alert>

      <a-space wrap>
        <a-button type="primary" @click="openControllerIframe">打开 Controller Iframe</a-button>
        <a-button @click="openSingleLinkControllerIframe">打开单链接 Controller Iframe</a-button>
        <a-button @click="openBaiduControllerIframe">打开百度 Controller Iframe</a-button>
        <a-button @click="sendToControllerIframe">向 Controller Iframe 发送消息</a-button>
      </a-space>

      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="Controller tabId">{{ controllerTabId || "-" }}</a-descriptions-item>
        <a-descriptions-item label="单链接 viewUrl">{{ singleLinkControllerViewUrl }}</a-descriptions-item>
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
import { TabViewUrl } from "@xsbcme/vue-tab-router";
import { iframeLogs } from "@/plugins/tab-router";
import { useLearningTabs, iframeUrls } from "../helpers";

const { tabsManager } = useLearningTabs();
const controllerTabId = ref<string>();
const controllerViewUrl = "/src/views/learning/iframe-controller/controller/page-index.vue";
const baiduControllerViewUrl = "/src/views/learning/iframe-controller/baidu/page-index.vue";
const singleLinkControllerViewUrl = `iframe-controller:${controllerViewUrl}?src=${encodeURIComponent(
  iframeUrls.message
)}&_viewName=${encodeURIComponent("单链接 Controller Iframe")}&controllerDemo=true&source=single-link`;

const pushIframeLog = (message: string) => {
  iframeLogs.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`);
  iframeLogs.value = iframeLogs.value.slice(0, 30);
};

const resolveControllerTabId = () => {
  if (controllerTabId.value && tabsManager.getTabById(controllerTabId.value)) return controllerTabId.value;

  const controllerTab = tabsManager.tabs.find(tab => {
    if (!TabViewUrl.isIframeController(tab.viewUrl)) return false;
    return TabViewUrl.resolveIframeController(tab.viewUrl).controllerUrl === controllerViewUrl;
  });
  controllerTabId.value = controllerTab?._id;
  return controllerTabId.value;
};

const openControllerIframe = async () => {
  controllerTabId.value = await tabsManager.openTab(
    TabViewUrl.createIframeController(controllerViewUrl, iframeUrls.message),
    {
      _viewName: "Iframe Controller 演示",
      controllerDemo: true,
    }
  );
};

const openSingleLinkControllerIframe = async () => {
  const tabId = await tabsManager.openTab(singleLinkControllerViewUrl);
  controllerTabId.value = typeof tabId === "string" ? tabId : undefined;
};

const openBaiduControllerIframe = () => {
  tabsManager.openTab(TabViewUrl.createIframeController(baiduControllerViewUrl), {
    _viewName: "百度 Controller Iframe",
    controllerDemo: true,
  });
};

const sendToControllerIframe = () => {
  const tabId = resolveControllerTabId();
  const sent = tabsManager.postIframeMessage(
    {
      type: "host:controller-message",
      time: new Date().toLocaleTimeString(),
    },
    undefined,
    tabId
  );
  pushIframeLog(sent ? `host message sent ${tabId}` : "host message failed：请先打开 Controller Iframe");
};
</script>
