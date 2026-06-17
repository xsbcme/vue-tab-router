<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="父子通信">
    <a-space direction="vertical" fill>
      <a-alert type="info">这一页只演示来源页和子页之间的事件通信。先打开通信子页，再从子页或当前页发送事件。</a-alert>

      <a-space wrap>
        <a-button type="primary" @click="openChildMessagePage">打开通信子页</a-button>
        <a-button @click="emitToSource">向来源页发送测试事件</a-button>
      </a-space>

      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="子页回传数据">{{ childMessage || "-" }}</a-descriptions-item>
      </a-descriptions>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { defineTabEvents } from "@xsbcme/vue-tab-router";
import { useLearningTabs, viewUrls } from "../helpers";

const { tabsManager } = useLearningTabs();
const childMessage = ref("");

defineTabEvents({
  "message-parent-to-child": data => {
    childMessage.value = String(data ?? "");
  },
});

const openChildMessagePage = () => {
  tabsManager.openTab(viewUrls.messageChild, {
    _viewName: "通信子页",
  });
};

const emitToSource = () => {
  tabsManager.emit("message-parent-to-child", `来自父子通信页 ${new Date().toLocaleTimeString()}`);
};
</script>
