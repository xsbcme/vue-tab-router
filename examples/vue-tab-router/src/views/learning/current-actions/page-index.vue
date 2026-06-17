<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="当前页操作">
    <a-space direction="vertical" fill>
      <a-alert type="info">这一页只演示当前标签的刷新、更新标题和关闭。先打开目标页，再操作当前标签。</a-alert>

      <a-space wrap>
        <a-button type="primary" @click="openRefreshPage">打开刷新页</a-button>
        <a-button @click="openUpdatePage">打开更新页</a-button>
        <a-button @click="openClosePage">打开关闭页</a-button>
        <a-button @click="openLongContentPage">打开长内容页</a-button>
      </a-space>

      <a-space wrap>
        <a-button @click="tabsManager.refreshTab()">刷新当前</a-button>
        <a-button @click="tabsManager.refreshTabAll()">刷新全部</a-button>
        <a-button @click="updateCurrentTitle">更新当前标题</a-button>
        <a-button status="danger" @click="tabsManager.closeTab()">关闭当前</a-button>
      </a-space>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { useLearningTabs, viewUrls } from "../helpers";

const { tabsManager } = useLearningTabs();

const openRefreshPage = () => {
  tabsManager.openTab(viewUrls.refresh, { _viewName: "刷新测试" });
};

const openUpdatePage = () => {
  tabsManager.openTab(viewUrls.update, { _viewName: "更新测试", a: "init" });
};

const openClosePage = () => {
  tabsManager.openTab(viewUrls.close, { _viewName: "关闭测试" });
};

const openLongContentPage = () => {
  tabsManager.openTab(viewUrls.longContent, { _viewName: "长内容滚动测试" });
};

const updateCurrentTitle = () => {
  tabsManager.updateTabOptions({
    _viewName: `已更新 ${new Date().toLocaleTimeString()}`,
  });
};
</script>
