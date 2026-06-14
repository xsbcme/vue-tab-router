<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="菜单与层级">
    <a-space direction="vertical" fill>
      <a-alert type="info"
        >这一页演示菜单入口和非菜单详情页的层级关系。打开订单中心后，再打开订单详情观察面包屑。</a-alert
      >

      <a-space wrap>
        <a-button type="primary" @click="openOrderCenter">打开订单处理中心</a-button>
        <a-button @click="openOrderDetail">打开订单详情</a-button>
        <a-button @click="openPracticeOverview">打开能力组合总览</a-button>
      </a-space>

      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="当前激活页">{{ activeName }}</a-descriptions-item>
        <a-descriptions-item label="父路径推导">{{
          tabsManager.activeTabParentPaths.join(" / ") || "-"
        }}</a-descriptions-item>
      </a-descriptions>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLearningTabs, viewUrls } from "../helpers";

const { tabsManager } = useLearningTabs();

const activeName = computed(() => tabsManager.activeTab?.viewName || tabsManager.activeTab?.viewUrl || "-");

const openOrderCenter = () => {
  tabsManager.openTab(viewUrls.orderCenter, { _viewName: "订单处理中心", _viewSingle: true });
};

const openOrderDetail = () => {
  tabsManager.openTab(viewUrls.orderDetail, {
    _viewName: "订单详情",
    orderId: "A1024",
  });
};

const openPracticeOverview = () => {
  tabsManager.openTab(viewUrls.practiceOverview, { _viewName: "能力组合总览", _viewSingle: true });
};
</script>
