<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="插件 Hook 测试">
    <a-space direction="vertical" fill>
      <a-alert type="success">打开、切换、更新、刷新、关闭标签时，可在下方查看 demo 插件记录的 hook 日志。</a-alert>
      <a-space wrap>
        <a-button type="primary" @click="openTarget">打开目标页</a-button>
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
import { useTabsManager } from "@xsbcme/vue-tab-router";
import { hookLogs } from "@/plugins/tab-router";

const tabsManager = useTabsManager();

const openTarget = () => {
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: `Hook 目标页 ${Date.now()}`,
    hookSource: true,
  });
};

const updateCurrent = () => {
  tabsManager.updateTabOptions({
    _viewName: `Hook 已更新 ${new Date().toLocaleTimeString()}`,
  });
};
</script>
