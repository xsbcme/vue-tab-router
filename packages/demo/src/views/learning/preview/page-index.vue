<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="预览容器">
    <a-space direction="vertical" fill>
      <a-alert type="info">这一页只作为预览容器入口。点击按钮后打开完整 PreviewContainerComponent 演示页。</a-alert>

      <a-space wrap>
        <a-button type="primary" @click="openPreviewDemo">打开预览容器演示</a-button>
      </a-space>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { useLearningTabs, viewUrls } from "../helpers";

const { tabsManager } = useLearningTabs();

const openPreviewDemo = () => {
  tabsManager.openTab(viewUrls.preview, {
    _viewName: "预览容器测试",
  });
};
</script>
