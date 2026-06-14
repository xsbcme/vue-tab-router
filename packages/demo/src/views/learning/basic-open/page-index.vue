<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="打开与复用">
    <a-space direction="vertical" fill>
      <a-alert type="info">这一页只比较单例复用和多开。先观察标签数量，再观察目标页收到的 props。</a-alert>

      <a-space wrap>
        <a-button type="primary" @click="openSingle(1)">单例 a=1</a-button>
        <a-button @click="openSingle(2)">单例 a=2</a-button>
        <a-button @click="openMultiple(3)">多开 a=3</a-button>
        <a-button @click="openMultiple(4)">多开 a=4</a-button>
        <a-button status="warning" @click="openMissingView">打开未注册视图</a-button>
      </a-space>

      <a-alert>预期：单例页面会优先复用同一路径标签；多开页面会按不同 props 产生多个标签。</a-alert>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { useLearningTabs } from "../helpers";

const { tabsManager, openTarget } = useLearningTabs();

const openSingle = (a: number) => {
  openTarget(`单例目标 a=${a}`, {
    _viewSingle: true,
    a,
  });
};

const openMultiple = (a: number) => {
  openTarget(`多开目标 a=${a}`, { a });
};

const openMissingView = () => {
  tabsManager.openTab("/src/views/not-exists/page-index.vue", { _viewName: "未注册视图" }).catch(error => {
    Message.error(error instanceof Error ? error.message : String(error));
  });
};
</script>
