<template>
  <div class="practice-page">
    <a-card title="运营复盘报表" :bordered="false">
      <a-space direction="vertical" fill size="large">
        <a-alert type="info">
          这个实践页组合演示长内容滚动、iframe 报表、postMessage、弹窗显示和批量标签管理，适合验证复杂工作台页面不会互相干扰。
        </a-alert>
        <a-space wrap>
          <a-button type="primary" @click="openIframeReport">打开 iframe 报表</a-button>
          <a-button @click="openLongReport">打开长内容明细</a-button>
          <a-button @click="tabsManager.openDetachedTab()">弹窗显示当前页</a-button>
          <a-button @click="tabsManager.refreshTab()">刷新当前报表</a-button>
          <a-button status="warning" @click="tabsManager.closeTabsByOther(undefined, { continueOnRejected: true })">
            保留当前标签
          </a-button>
        </a-space>
      </a-space>
    </a-card>

    <a-row :gutter="16">
      <a-col v-for="item in metrics" :key="item.label" :span="6">
        <a-card :bordered="false">
          <a-statistic :title="item.label" :value="item.value" :suffix="item.suffix" show-group-separator />
        </a-card>
      </a-col>
    </a-row>

    <a-card title="渠道复盘" :bordered="false">
      <a-table :columns="columns" :data="rows" :pagination="false" row-key="channel" />
    </a-card>

    <a-card v-for="section in sections" :key="section.title" :title="section.title" :bordered="false">
      <a-space direction="vertical" fill>
        <p v-for="line in section.lines" :key="line">{{ line }}</p>
      </a-space>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import type { TableColumnData } from "@arco-design/web-vue";
import { TabViewUrl, useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

const metrics = [
  { label: "访问量", value: 284260, suffix: "次" },
  { label: "新增线索", value: 1632, suffix: "条" },
  { label: "成交订单", value: 386, suffix: "单" },
  { label: "转化率", value: 23.6, suffix: "%" },
];

const columns: TableColumnData[] = [
  { title: "渠道", dataIndex: "channel" },
  { title: "访问", dataIndex: "visits", align: "right" },
  { title: "线索", dataIndex: "leads", align: "right" },
  { title: "订单", dataIndex: "orders", align: "right" },
  { title: "复盘结论", dataIndex: "summary" },
];

const rows = [
  { channel: "搜索投放", visits: 96200, leads: 486, orders: 108, summary: "高意向词稳定，低意向词需要收缩预算。" },
  { channel: "内容运营", visits: 73400, leads: 362, orders: 84, summary: "行业模板文章带来持续长尾流量。" },
  { channel: "客户转介绍", visits: 12800, leads: 143, orders: 62, summary: "客单价高，适合继续做激励机制。" },
  { channel: "线下活动", visits: 41200, leads: 528, orders: 96, summary: "转化周期长，需要补充销售跟进节奏。" },
];

const sections = Array.from({ length: 8 }).map((_, index) => ({
  title: `复盘段落 ${index + 1}`,
  lines: [
    "报表内容较长时，组件页面应在内容层内部滚动，不应该被工作台外框裁剪。",
    "切换到其他标签后再回来，缓存页面会保留当前阅读位置和已经加载的数据。",
    "需要临时对照报表时，可以通过右键标签弹窗显示，或在页面内主动打开弹窗容器。",
  ],
}));

const openIframeReport = () => {
  tabsManager.openTab(TabViewUrl.createRelative("/iframe-test.html"), {
    _viewName: "iframe 经营看板",
    _viewSingle: true,
    iframeDemo: true,
  });
};

const openLongReport = () => {
  tabsManager.openTab("/src/views/test-workbench/long-content/page-index.vue", {
    _viewName: "长内容经营明细",
    _viewSingle: true,
  });
};
</script>

<style scoped>
.practice-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  min-height: 100%;
  background: #f7f8fa;
}

.practice-page p {
  margin: 0;
  line-height: 1.8;
  color: var(--color-text-2);
}
</style>
