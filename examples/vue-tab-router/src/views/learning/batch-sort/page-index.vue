<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="批量与排序">
    <a-space direction="vertical" fill>
      <a-alert type="info"
        >这一页演示首页、置顶、禁拖、批量关闭和排序规则。建议先批量打开一些标签，再尝试移动和关闭。</a-alert
      >

      <a-space wrap>
        <a-button type="primary" @click="openFirstTab">替换首页</a-button>
        <a-button @click="tabsManager.activeFirstTab()">激活首页</a-button>
        <a-button @click="openPinnedAndLockedTabs">添加置顶/禁拖标签</a-button>
        <a-button @click="openManyTabs">批量打开</a-button>
        <a-button @click="swapFirstTwoTabs">交换前两个</a-button>
        <a-button @click="moveActiveBeforeFirstMovable">移动当前到首个可移动标签前</a-button>
      </a-space>

      <a-space wrap>
        <a-button status="warning" @click="tabsManager.closeTabsByLeft(undefined, { continueOnRejected: true })">
          关闭左侧
        </a-button>
        <a-button status="warning" @click="tabsManager.closeTabsByRight(undefined, { continueOnRejected: true })">
          关闭右侧
        </a-button>
        <a-button status="warning" @click="tabsManager.closeTabsByOther(undefined, { continueOnRejected: true })">
          关闭其他
        </a-button>
        <a-button status="danger" @click="clearTabs">清空标签</a-button>
      </a-space>

      <a-table :columns="tabStateColumns" :data="tabStateRows" :pagination="false" row-key="id" :scroll="{ x: 780 }" />
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Message } from "@arco-design/web-vue";
import { useLearningTabs, viewUrls } from "../helpers";

const { tabsManager, openTarget } = useLearningTabs();

const tabStateColumns = [
  { title: "顺序", dataIndex: "index", width: 80, minWidth: 80 },
  { title: "标题", dataIndex: "name", minWidth: 360 },
  { title: "置顶", dataIndex: "pinned", width: 80, minWidth: 80 },
  { title: "禁拖", dataIndex: "noDrag", width: 80, minWidth: 80 },
  { title: "可移到当前前", dataIndex: "canMoveBeforeActive", width: 130, minWidth: 130 },
];

const tabStateRows = computed(() =>
  tabsManager.tabs.map((tab, index) => ({
    id: tab._id,
    index: index + 1,
    name: tab.viewName || tab.viewUrl,
    pinned: tab._pinned ? "是" : "否",
    noDrag: tab._noDrag ? "是" : "否",
    canMoveBeforeActive: tabsManager.canMoveTab(tab._id, tabsManager.activeTab?._id, "before") ? "是" : "否",
  }))
);

const openFirstTab = () => {
  tabsManager.openFirstTab(viewUrls.home, { _viewName: "首页" }, "replace");
};

const openPinnedAndLockedTabs = () => {
  openTarget("置顶可排序", {
    _viewPinned: true,
    sortDemo: "pinned",
  });
  openTarget("禁拖目标", {
    _viewNoDrag: true,
    sortDemo: "locked",
  });
};

const openManyTabs = () => {
  Array.from({ length: 6 }).forEach((_, index) => {
    openTarget(`批量标签 ${index + 1}`, { batchIndex: index });
  });
};

const swapFirstTwoTabs = () => {
  if (tabsManager.tabs.length < 2) return;
  tabsManager.swapTabByIndex(0, 1);
};

const moveActiveBeforeFirstMovable = async () => {
  const activeTab = tabsManager.activeTab;
  const targetTab = tabsManager.tabs.find(
    tab => tab._id !== activeTab?._id && tabsManager.canMoveTab(activeTab?._id, tab._id, "before")
  );
  if (!activeTab || !targetTab) {
    Message.info("没有符合规则的移动目标，可先批量打开或添加置顶/禁拖标签");
    return;
  }
  const moved = await tabsManager.moveTab(activeTab._id, targetTab._id, "before");
  Message[moved ? "success" : "warning"](moved ? "移动成功" : "当前排序规则不允许移动");
};

const clearTabs = () => {
  if (!window.confirm("确认清空所有标签？")) return;
  tabsManager.clear();
};
</script>
