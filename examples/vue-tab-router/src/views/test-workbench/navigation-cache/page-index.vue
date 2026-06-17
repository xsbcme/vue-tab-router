<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="导航与缓存测试">
    <a-space direction="vertical" fill>
      <a-alert type="info"
        >通过当前面板打开目标页，集中验证打开、复用、多开、更新、刷新、关闭、首页、组件缓存与批量操作。</a-alert
      >

      <a-divider orientation="left">打开与复用</a-divider>
      <a-space wrap>
        <a-button type="primary" @click="openSingle(1)">单例 a=1</a-button>
        <a-button @click="openSingle(2)">单例 a=2</a-button>
        <a-button @click="openMultiple(3)">多例 a=3</a-button>
        <a-button @click="openMultiple(4)">多例 a=4</a-button>
        <a-button @click="openMissingView">未注册视图</a-button>
      </a-space>

      <a-divider orientation="left">组件缓存</a-divider>
      <a-space wrap>
        <a-button type="primary" @click="openCacheEnabled">打开缓存启用页</a-button>
        <a-button @click="openCacheDisabled">打开缓存关闭页</a-button>
        <a-button @click="openSwitchTarget">打开切换目标页</a-button>
      </a-space>

      <a-divider orientation="left">页面操作</a-divider>
      <a-space wrap>
        <a-button @click="openRefreshPage">打开刷新测试页</a-button>
        <a-button @click="openUpdatePage">打开更新测试页</a-button>
        <a-button @click="openClosePage">打开关闭测试页</a-button>
        <a-button @click="openLongContentPage">打开长内容测试页</a-button>
        <a-button @click="tabsManager.refreshTab()">刷新当前</a-button>
        <a-button @click="tabsManager.refreshTabAll()">刷新全部</a-button>
        <a-button @click="updateCurrentTitle">更新当前标题</a-button>
      </a-space>

      <a-divider orientation="left">首页与批量</a-divider>
      <a-space wrap>
        <a-button @click="openFirstTab">替换首页</a-button>
        <a-button @click="openFirstTabByMove">移动首页到首位</a-button>
        <a-button status="warning" @click="openFirstTabByClear">清空后打开首页</a-button>
        <a-button @click="tabsManager.activeFirstTab()">激活首页</a-button>
        <a-button @click="openPinnedAndLockedTabs">添加置顶/禁拖标签</a-button>
        <a-button @click="openManyTabs">批量打开</a-button>
        <a-button @click="swapFirstTwoTabs">交换前两个</a-button>
        <a-button @click="swapActiveWithPreviousById">按 ID 交换当前与左侧</a-button>
        <a-button @click="moveActiveBeforeFirstMovable">移动当前到首个可移动标签前</a-button>
        <a-button status="warning" @click="tabsManager.closeTabsByLeft(undefined, { continueOnRejected: true })"
          >关闭左侧</a-button
        >
        <a-button status="warning" @click="tabsManager.closeTabsByRight(undefined, { continueOnRejected: true })"
          >关闭右侧</a-button
        >
        <a-button status="warning" @click="tabsManager.closeTabsByOther(undefined, { continueOnRejected: true })"
          >关闭其他</a-button
        >
        <a-button status="warning" @click="tabsManager.closeTabByAll({ continueOnRejected: true })">关闭全部</a-button>
        <a-button status="danger" @click="clearTabs">清空标签</a-button>
      </a-space>

      <a-divider orientation="left">排序规则状态</a-divider>
      <a-table :columns="tabStateColumns" :data="tabStateRows" :pagination="false" row-key="id" :scroll="{ x: 780 }" />

      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="当前标签数">{{ tabsManager.tabs.length }}</a-descriptions-item>
        <a-descriptions-item label="当前激活页">{{
          tabsManager.activeTab?.viewName || tabsManager.activeTab?.viewUrl || "-"
        }}</a-descriptions-item>
        <a-descriptions-item label="父路径推导">{{
          tabsManager.activeTabParentPaths.join(" / ") || "-"
        }}</a-descriptions-item>
      </a-descriptions>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Message } from "@arco-design/web-vue";
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

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

const openSingle = (a: number) => {
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: `单例目标 a=${a}`,
    _viewSingle: true,
    a,
  });
};

const openMultiple = (a: number) => {
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: `多例目标 a=${a}`,
    a,
  });
};

const openCacheEnabled = () => {
  tabsManager.openTab("/src/views/test-cache/cache-enable/page-index.vue", { _viewName: "组件缓存启用" });
};

const openCacheDisabled = () => {
  tabsManager.openTab("/src/views/test-cache/cache-colse/page-index.vue", {
    _viewName: "组件缓存关闭",
    _viewNoCache: true,
  });
};

const openSwitchTarget = () => {
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: "缓存切换目标页",
    a: Date.now(),
  });
};

const openRefreshPage = () => {
  tabsManager.openTab("/src/views/test-refresh/page-index.vue", { _viewName: "刷新测试" });
};

const openUpdatePage = () => {
  tabsManager.openTab("/src/views/test-update/page-index.vue", { _viewName: "更新测试", a: "init" });
};

const openClosePage = () => {
  tabsManager.openTab("/src/views/test-close/page-index.vue", { _viewName: "关闭测试" });
};

const openLongContentPage = () => {
  tabsManager.openTab("/src/views/test-workbench/long-content/page-index.vue", { _viewName: "长内容滚动测试" });
};

const openFirstTab = () => {
  tabsManager.openFirstTab("/src/views/home/page-index.vue", { _viewName: "首页" }, "replace");
};

const openFirstTabByMove = () => {
  tabsManager.openFirstTab("/src/views/home/page-index.vue", { _viewName: "首页移动模式" }, "move");
};

const openFirstTabByClear = () => {
  if (!window.confirm("确认清空后重新打开首页？")) return;
  tabsManager.openFirstTab("/src/views/home/page-index.vue", { _viewName: "首页清空模式" }, "clear");
};

const openManyTabs = () => {
  Array.from({ length: 8 }).forEach((_, index) => {
    tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
      _viewName: `批量标签 ${index + 1}`,
      batchIndex: index,
    });
  });
};

const openPinnedAndLockedTabs = () => {
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: "置顶可排序",
    _viewPinned: true,
    sortDemo: "pinned",
  });
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: "禁拖目标",
    _viewNoDrag: true,
    sortDemo: "locked",
  });
};

const updateCurrentTitle = () => {
  tabsManager.updateTabOptions({
    _viewName: `已更新 ${new Date().toLocaleTimeString()}`,
  });
};

const swapFirstTwoTabs = () => {
  if (tabsManager.tabs.length < 2) return;
  tabsManager.swapTabByIndex(0, 1);
};

const swapActiveWithPreviousById = () => {
  const activeIndex = tabsManager.tabs.findIndex(tab => tab._id === tabsManager.activeTab?._id);
  if (activeIndex <= 0) {
    Message.info("当前标签左侧没有可交换目标");
    return;
  }
  tabsManager.swapTabById(tabsManager.tabs[activeIndex]._id, tabsManager.tabs[activeIndex - 1]._id);
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
  if (moved) {
    Message.success("移动成功");
    return;
  }
  Message.warning("当前排序规则不允许移动");
};

const openMissingView = () => {
  tabsManager.openTab("/src/views/not-exists/page-index.vue", { _viewName: "未注册视图" }).catch(error => {
    Message.error(error instanceof Error ? error.message : String(error));
  });
};

const clearTabs = () => {
  if (!window.confirm("确认清空所有标签？")) return;
  tabsManager.clear();
};
</script>
