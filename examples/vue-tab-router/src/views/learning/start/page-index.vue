<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="最小入门">
    <a-space direction="vertical" fill>
      <a-alert type="info">这一页只演示最小闭环：从一个按钮调用 openTab，打开一个已注册的组件页面。</a-alert>

      <a-steps :current="1" size="small">
        <a-step title="注册页面" description="import.meta.glob 扫描 page-index.vue" />
        <a-step title="打开页面" description="openTab(viewUrl, options)" />
        <a-step title="继续增强" description="再学习缓存、守卫和 iframe" />
      </a-steps>

      <a-space wrap>
        <a-button type="primary" @click="openTarget('最小打开页面', { from: 'learning-start' })">打开目标页</a-button>
        <a-button @click="openHome">打开首页</a-button>
      </a-space>

      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="当前标签数">{{ tabsManager.tabs.length }}</a-descriptions-item>
        <a-descriptions-item label="当前激活页">{{ activeName }}</a-descriptions-item>
        <a-descriptions-item label="示例 viewUrl">{{ viewUrls.target }}</a-descriptions-item>
      </a-descriptions>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLearningTabs, viewUrls } from "../helpers";

const { tabsManager, openTarget } = useLearningTabs();

const activeName = computed(() => tabsManager.activeTab?.viewName || tabsManager.activeTab?.viewUrl || "-");

const openHome = () => {
  tabsManager.openTab(viewUrls.home, { _viewName: "首页", _viewSingle: true });
};
</script>
