<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="Iframe 消息">
    <a-space direction="vertical" fill>
      <a-alert type="info">
        这一页只保留全局 iframe load/message 日志和宿主主动发消息。刷新、关闭、打开 tab 这类业务处理请看 Iframe
        Controller 演示。
      </a-alert>

      <a-space wrap>
        <a-button type="primary" @click="openMessageIframe">打开通信 iframe</a-button>
        <a-button @click="sendToActiveIframe">向当前 iframe 发送消息</a-button>
        <a-button @click="sendToSavedIframe">按 tabId 发送消息</a-button>
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
import { useLearningTabs, iframeUrls } from "../helpers";
import { iframeLogs } from "@/plugins/tab-router";

const { tabsManager } = useLearningTabs();
const messageIframeTabId = ref<string>();

const openMessageIframe = async () => {
  messageIframeTabId.value = await tabsManager.openTab(iframeUrls.message, {
    _viewName: "Iframe 通信测试",
    iframeDemo: true,
  });
};

const sendToActiveIframe = () => {
  tabsManager.postIframeMessage({
    type: "host:active-message",
    time: new Date().toLocaleTimeString(),
  });
};

const sendToSavedIframe = () => {
  tabsManager.postIframeMessage(
    {
      type: "host:tab-id-message",
      time: new Date().toLocaleTimeString(),
    },
    undefined,
    messageIframeTabId.value
  );
};
</script>
