<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="弹窗显示测试">
    <a-space direction="vertical" fill>
      <a-alert type="info">
        打开下方测试页后，在顶部标签栏右键目标标签，选择“弹窗显示”。弹窗内部会使用独立
        TabsManager，关闭/切换其中内容不应改变主工作台标签数量。
      </a-alert>

      <a-space wrap>
        <a-button type="primary" @click="openTarget('弹窗显示目标 A', 1)">打开目标 A</a-button>
        <a-button @click="openTarget('弹窗显示目标 B', 2)">打开目标 B</a-button>
        <a-button @click="openPinnedTarget">打开置顶目标</a-button>
        <a-button @click="openPreviewDemo">打开预览容器测试</a-button>
        <a-button @click="openCurrentDetached">弹窗显示当前标签</a-button>
      </a-space>

      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="主实例标签数">{{ tabsManager.tabs.length }}</a-descriptions-item>
        <a-descriptions-item label="当前激活标签">{{
          tabsManager.activeTab?.viewName || tabsManager.activeTab?.viewUrl || "-"
        }}</a-descriptions-item>
        <a-descriptions-item label="弹窗显示状态">{{
          tabsManager.detachedTab?.viewName || tabsManager.detachedTab?.viewUrl || "未打开"
        }}</a-descriptions-item>
      </a-descriptions>

      <a-alert type="success">
        验证点：右键菜单能打开弹窗显示；弹窗默认全屏，可刷新和退出全屏；标签页可拖拽排序，首页不可拖拽，置顶标签保持在首页之后。
      </a-alert>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

const openTarget = (name: string, a: number) => {
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: name,
    a,
    source: "popup-demo",
  });
};

const openPinnedTarget = () => {
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: "置顶目标页",
    _viewPinned: true,
    pinnedDemo: true,
    source: "popup-demo",
  });
};

const openPreviewDemo = () => {
  tabsManager.openTab("/src/views/test-preview/container/page-index.vue", {
    _viewName: "预览容器测试",
  });
};

const openCurrentDetached = () => {
  tabsManager.openDetachedTab().catch(error => {
    Message.error(error instanceof Error ? error.message : String(error));
  });
};
</script>
