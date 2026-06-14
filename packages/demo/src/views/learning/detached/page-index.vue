<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="弹窗显示">
    <a-space direction="vertical" fill>
      <a-alert type="info">这一页只演示把当前标签弹窗显示。弹窗内部使用独立 manager，不会污染主工作台标签组。</a-alert>

      <a-space wrap>
        <a-button type="primary" @click="openTargetTab">打开弹窗目标页</a-button>
        <a-button @click="openCurrentDetached">弹窗显示当前标签</a-button>
        <a-button @click="openPinnedTarget">打开置顶目标</a-button>
      </a-space>

      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="主实例标签数">{{ tabsManager.tabs.length }}</a-descriptions-item>
        <a-descriptions-item label="弹窗显示状态">{{ detachedName }}</a-descriptions-item>
      </a-descriptions>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Message } from "@arco-design/web-vue";
import { useLearningTabs } from "../helpers";

const { tabsManager, openTarget } = useLearningTabs();

const detachedName = computed(() => tabsManager.detachedTab?.viewName || tabsManager.detachedTab?.viewUrl || "未打开");

const openTargetTab = () => {
  openTarget("弹窗显示目标", { source: "learning-detached" });
};

const openPinnedTarget = () => {
  openTarget("置顶目标页", {
    _viewPinned: true,
    source: "learning-detached",
  });
};

const openCurrentDetached = () => {
  tabsManager.openDetachedTab().catch(error => {
    Message.error(error instanceof Error ? error.message : String(error));
  });
};
</script>
