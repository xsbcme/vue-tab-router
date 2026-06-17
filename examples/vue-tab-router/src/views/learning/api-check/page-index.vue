<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="API 覆盖检查">
    <a-space direction="vertical" fill>
      <a-alert type="info">这一页是维护者检查入口，用最新演示主线回看核心 API 是否都能被覆盖。</a-alert>

      <a-table :columns="columns" :data="rows" :pagination="false" row-key="api" />

      <a-space wrap>
        <a-button type="primary" @click="openStart">打开最小入门</a-button>
        <a-button @click="openStateComponents">打开状态组件演示</a-button>
      </a-space>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { useLearningTabs, viewUrls } from "../helpers";

const { tabsManager } = useLearningTabs();

const columns = [
  { title: "API / 能力", dataIndex: "api", minWidth: 220 },
  { title: "最新演示入口", dataIndex: "entry", minWidth: 220 },
  { title: "验证点", dataIndex: "check", minWidth: 320 },
];

const rows = [
  { api: "createTabsManager / openTab", entry: "最小入门", check: "能打开已注册组件页面" },
  { api: "_viewSingle / viewProps", entry: "最小入门 / 打开与复用", check: "单例复用和多开互不混淆" },
  {
    api: "refreshTab / updateTabOptions / closeTab",
    entry: "基础操作 / 当前页操作",
    check: "当前页可刷新、改名和关闭",
  },
  { api: "_viewNoCache / KeepAlive", entry: "基础操作 / 缓存对照", check: "缓存页保留现场，不缓存页重新创建" },
  { api: "useTabMenu / views.meta", entry: "菜单与层级", check: "菜单入口和详情页面包屑一致" },
  { api: "defineTabEvents / emit", entry: "通信与守卫 / 父子通信", check: "子页能向来源页回传事件" },
  { api: "onBeforeTabEnter / Leave / Close", entry: "通信与守卫 / 页面守卫", check: "守卫可中断进入、离开和关闭" },
  { api: "TabViewUrl / iframe message", entry: "链接与 Iframe", check: "iframe 打开、缓存、通信和导航同步可用" },
  { api: "openDetachedTab / PreviewContainer", entry: "弹窗与预览", check: "弹窗和预览容器互不污染主标签组" },
  { api: "plugins / hooks / applyTheme", entry: "扩展与外观", check: "hook 日志、主题和图标正常" },
];

const openStart = () => {
  tabsManager.openTab("/src/views/learning/start/page-index.vue", { _viewName: "最小打开页面", _viewSingle: true });
};

const openStateComponents = () => {
  tabsManager.openTab(viewUrls.stateComponents, { _viewName: "状态组件" });
};
</script>
