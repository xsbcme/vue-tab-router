<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="弹窗显示测试">
    <a-space direction="vertical" fill>
      <a-alert type="info">
        打开下方测试页后，在顶部标签栏右键目标标签，可选择“弹窗显示”“置顶/取消置顶”。弹窗内部会使用独立
        TabsManager，关闭/切换其中内容不应改变主工作台标签数量；置顶标签会保持在首页之后、普通标签之前。
      </a-alert>

      <a-card title="右键弹窗内部关闭联动" :bordered="false">
        <a-space direction="vertical" fill>
          <a-alert type="info">
            点击“打开目标并弹窗显示”会模拟在目标标签上右键选择“弹窗显示”。在弹窗内部点击目标页的“关闭当前标签页”时，弹窗和主工作台中的目标标签都应关闭；如果先在弹窗内部打开其它页面，关闭其它页面只影响弹窗内部标签。
          </a-alert>

          <a-space wrap>
            <a-button type="primary" @click="openOwnerDetachedDemo">打开目标并弹窗显示</a-button>
            <a-button @click="openIframeDetachedDemo">打开 Iframe 并弹窗显示</a-button>
            <a-button @click="openOtherDemoTab">打开主工作台干扰页</a-button>
            <a-button status="warning" @click="closeOtherDemoTab">关闭主工作台干扰页</a-button>
          </a-space>

          <a-descriptions :column="1" bordered size="small">
            <a-descriptions-item label="右键目标主标签">{{ ownerTabStatus }}</a-descriptions-item>
            <a-descriptions-item label="主工作台干扰页">{{ otherTabStatus }}</a-descriptions-item>
            <a-descriptions-item label="弹窗显示状态">{{ detachedStatus }}</a-descriptions-item>
          </a-descriptions>
        </a-space>
      </a-card>

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
        验证点：右键菜单能打开弹窗显示和切换置顶；弹窗入口页内点击“关闭当前标签页”会同步关闭主标签和弹窗；弹窗内子标签关闭不会关闭弹窗；弹窗默认全屏，可刷新和退出全屏；标签页可拖拽排序，首页不可拖拽，置顶标签保持在首页之后。
      </a-alert>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Message } from "@arco-design/web-vue";
import { TabViewUrl, useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();
const ownerTabId = ref<string>();
const otherTabId = ref<string>();
let demoSeed = 0;

const ownerTab = computed(() => tabsManager.getTabById(ownerTabId.value));
const otherTab = computed(() => tabsManager.getTabById(otherTabId.value));
const ownerTabStatus = computed(() => ownerTab.value?.viewName || (ownerTabId.value ? "已关闭" : "未打开"));
const otherTabStatus = computed(() => otherTab.value?.viewName || (otherTabId.value ? "已关闭" : "未打开"));
const detachedStatus = computed(() => tabsManager.detachedTab?.viewName || tabsManager.detachedTab?.viewUrl || "未打开");

const openOwnerDetachedDemo = async () => {
  const seed = ++demoSeed;
  const tabId = await tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: "弹窗关闭目标页",
    source: "detached-owner-demo",
    seed,
  });
  ownerTabId.value = tabId;
  await tabsManager.openDetachedTab(tabId);
  Message.success("已打开弹窗，在弹窗内部关闭目标页会同步关闭主标签和弹窗");
};

const openIframeDetachedDemo = async () => {
  const tabId = await tabsManager.openTab(TabViewUrl.createRelative("./iframe-test.html"), {
    _viewName: "弹窗关闭 Iframe 页",
    iframeDemo: true,
    seed: ++demoSeed,
  });
  ownerTabId.value = tabId;
  await tabsManager.openDetachedTab(tabId);
  Message.success("已打开 iframe 弹窗，在 iframe 内请求关闭会同步关闭主标签和弹窗");
};

const openOtherDemoTab = async () => {
  const tabId = await tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: "弹窗干扰页",
    source: "detached-owner-demo-other",
    seed: ++demoSeed,
  });
  otherTabId.value = tabId;
};

const closeOtherDemoTab = async () => {
  if (!otherTabId.value || !tabsManager.getTabById(otherTabId.value)) {
    Message.info("干扰页未打开或已关闭");
    return;
  }
  await tabsManager.closeTab(otherTabId.value);
};

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
