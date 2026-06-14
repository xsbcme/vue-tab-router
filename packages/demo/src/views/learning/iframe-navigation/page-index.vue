<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="Iframe 导航同步">
    <a-space direction="vertical" fill>
      <a-alert type="info"
        >这一页只演示 iframe 内部链接和 hash 导航。打开后观察地址栏 activeTab query 与 iframe load 日志。</a-alert
      >

      <a-space wrap>
        <a-button type="primary" @click="openLinkIframe">打开链接 iframe</a-button>
        <a-button @click="openHashIframeOverview">打开 hash 概览</a-button>
        <a-button @click="openHashIframeDetail">切换 hash 详情</a-button>
        <a-button @click="copySyncedUrl">复制当前同步链接</a-button>
      </a-space>

      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="activeTab query">{{ activeTabQuery || "-" }}</a-descriptions-item>
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
import { computed } from "vue";
import { Message } from "@arco-design/web-vue";
import { useRoute } from "vue-router";
import { useLearningTabs, iframeUrls } from "../helpers";
import { iframeLogs } from "@/plugins/tab-router";

const { tabsManager } = useLearningTabs();
const route = useRoute();

const activeTabQuery = computed(() => {
  const value = route.query.activeTab;
  return Array.isArray(value) ? value[0] : value;
});

const openLinkIframe = () => {
  tabsManager.openTab(iframeUrls.links, {
    _viewName: "Iframe 链接测试",
    iframeDemo: true,
  });
};

const openHashIframeOverview = () => {
  tabsManager.openTab(iframeUrls.navigationOverview, {
    _viewName: "hash 加载概览",
    iframeDemo: true,
  });
};

const openHashIframeDetail = () => {
  tabsManager.openTab(iframeUrls.navigationDetail, {
    _viewName: "hash 加载详情",
    iframeDemo: true,
  });
};

const copySyncedUrl = async () => {
  await navigator.clipboard.writeText(window.location.href);
  Message.success("已复制当前同步链接");
};
</script>
