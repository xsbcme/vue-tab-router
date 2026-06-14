<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="插件 Hooks">
    <a-space direction="vertical" fill>
      <a-alert type="info">这一页只观察插件 hook 和全局守卫日志。打开、刷新、更新、关闭目标页后查看日志顺序。</a-alert>

      <a-space wrap>
        <a-button type="primary" @click="openHookTarget">打开 Hook 目标页</a-button>
        <a-button @click="updateCurrent">更新当前页</a-button>
        <a-button @click="tabsManager.refreshTab()">刷新当前页</a-button>
        <a-button status="danger" @click="tabsManager.closeTab()">关闭当前页</a-button>
      </a-space>

      <a-list bordered :data="hookLogs">
        <template #item="{ item }">
          <a-list-item>{{ item }}</a-list-item>
        </template>
      </a-list>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { hookLogs } from "@/plugins/tab-router";
import { useLearningTabs } from "../helpers";

const { tabsManager, openTarget } = useLearningTabs();

const openHookTarget = () => {
  openTarget(`Hook 目标页 ${Date.now()}`, { hookSource: true });
};

const updateCurrent = () => {
  tabsManager.updateTabOptions({
    _viewName: `Hook 已更新 ${new Date().toLocaleTimeString()}`,
  });
};
</script>
