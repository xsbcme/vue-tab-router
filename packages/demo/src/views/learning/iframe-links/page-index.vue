<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="链接打开方式">
    <a-space direction="vertical" fill>
      <a-alert type="info">这一页只比较链接在工作台内 iframe 打开和浏览器新窗口打开的区别。</a-alert>

      <a-space wrap>
        <a-button type="primary" @click="openHttpInline">内部 http 链接</a-button>
        <a-button @click="openRelativeInline">内部相对链接</a-button>
        <a-button @click="openHttpOutside">外部 http 链接</a-button>
        <a-button @click="openRelativeOutside">外部相对链接</a-button>
      </a-space>

      <a-alert>不传 _viewOutside 会创建内部 iframe tab；传 _viewOutside: true 会调用 window.open。</a-alert>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { useLearningTabs, iframeUrls } from "../helpers";

const { tabsManager } = useLearningTabs();

const openHttpInline = () => {
  tabsManager.openTab("https://www.baidu.com/", { _viewName: "内部 http 链接" });
};

const openRelativeInline = () => {
  tabsManager.openTab(iframeUrls.relativeHome, {
    _viewName: "内部相对链接",
    menuKey: "learning-relative-inline",
  });
};

const openHttpOutside = () => {
  tabsManager.openTab("https://www.baidu.com/", {
    _viewOutside: true,
    _viewOutsideProps: { target: "_blank", features: "noopener,noreferrer" },
  });
};

const openRelativeOutside = () => {
  tabsManager.openTab(iframeUrls.relativeHome, {
    _viewOutside: true,
    menuKey: "learning-relative-outside",
  });
};
</script>
