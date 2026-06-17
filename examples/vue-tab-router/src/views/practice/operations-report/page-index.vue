<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="运营复盘报表">
    <div class="practice-page">
      <a-space direction="vertical" fill size="large">
        <a-alert type="info">
          这个实践页组合演示长内容滚动、iframe
          报表、postMessage、弹窗显示和批量标签管理，刷新报表时指标和渠道数据会重新生成。
        </a-alert>
        <a-descriptions :column="{ xs: 1, sm: 1, md: 2 }" bordered>
          <a-descriptions-item label="当前 tabId">{{ tabId || "-" }}</a-descriptions-item>
          <a-descriptions-item label="报表版本">v{{ reportVersion }}</a-descriptions-item>
          <a-descriptions-item label="生成时间">{{ generatedAt }}</a-descriptions-item>
          <a-descriptions-item label="当前筛选">{{ activeRange }} / {{ activeChannel }}</a-descriptions-item>
        </a-descriptions>
        <a-space wrap>
          <a-select v-model="activeRange" :style="{ width: '160px' }" @change="generateReport">
            <a-option value="本周">本周</a-option>
            <a-option value="本月">本月</a-option>
            <a-option value="本季度">本季度</a-option>
          </a-select>
          <a-select v-model="activeChannel" :style="{ width: '180px' }" @change="generateReport">
            <a-option value="全部渠道">全部渠道</a-option>
            <a-option value="搜索投放">搜索投放</a-option>
            <a-option value="内容运营">内容运营</a-option>
            <a-option value="客户转介绍">客户转介绍</a-option>
          </a-select>
          <a-button type="primary" @click="generateReport">模拟拉取报表</a-button>
          <a-button @click="openIframeReport">打开 iframe 报表</a-button>
          <a-button @click="openLongReport">打开长内容明细</a-button>
          <a-button @click="tabsManager.openDetachedTab()">弹窗显示当前页</a-button>
          <a-button @click="tabsManager.refreshTab()">刷新当前报表</a-button>
          <a-button status="warning" @click="tabsManager.closeTabsByOther(undefined, { continueOnRejected: true })">
            保留当前标签
          </a-button>
        </a-space>
      </a-space>

      <a-row :gutter="16">
        <a-col v-for="item in metrics" :key="item.label" :xs="24" :sm="12" :md="6">
          <a-card :bordered="false">
            <a-statistic :title="item.label" :value="item.value" :suffix="item.suffix" show-group-separator />
          </a-card>
        </a-col>
      </a-row>

      <a-card title="渠道复盘" :bordered="false">
        <a-table :columns="columns" :data="rows" :pagination="false" row-key="channel" :scroll="{ x: 900 }">
          <template #trend="{ record }">
            <a-tag :color="record.trend >= 0 ? 'green' : 'red'"
              >{{ record.trend >= 0 ? "+" : "" }}{{ record.trend }}%</a-tag
            >
          </template>
        </a-table>
      </a-card>

      <a-card v-for="section in sections" :key="section.title" :title="section.title" :bordered="false">
        <a-space direction="vertical" fill>
          <p v-for="line in section.lines" :key="line">{{ line }}</p>
        </a-space>
      </a-card>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { TableColumnData } from "@arco-design/web-vue";
import { TabViewUrl, useTabId, useTabsManager } from "@xsbcme/vue-tab-router";

interface ReportRow {
  channel: string;
  visits: number;
  leads: number;
  orders: number;
  trend: number;
  summary: string;
}

const tabsManager = useTabsManager();
const tabId = useTabId();
const reportVersion = ref(1);
const generatedAt = ref(new Date().toLocaleTimeString());
const activeRange = ref("本月");
const activeChannel = ref("全部渠道");
const reportSeed = ref(Date.now());

const metrics = computed(() => {
  const offset = reportSeed.value % 1000;
  return [
    { label: "访问量", value: 284260 + offset * 13, suffix: "次" },
    { label: "新增线索", value: 1632 + (offset % 320), suffix: "条" },
    { label: "成交订单", value: 386 + (offset % 90), suffix: "单" },
    { label: "转化率", value: Number((18 + (offset % 120) / 10).toFixed(1)), suffix: "%" },
  ];
});

const columns: TableColumnData[] = [
  { title: "渠道", dataIndex: "channel", minWidth: 140 },
  { title: "访问", dataIndex: "visits", minWidth: 120, align: "right" },
  { title: "线索", dataIndex: "leads", minWidth: 120, align: "right" },
  { title: "订单", dataIndex: "orders", minWidth: 120, align: "right" },
  { title: "趋势", slotName: "trend", width: 100, minWidth: 100, align: "center" },
  { title: "复盘结论", dataIndex: "summary", minWidth: 300 },
];

const createRows = (seed: number): ReportRow[] => {
  const offset = seed % 120;
  const rows = [
    {
      channel: "搜索投放",
      visits: 96200 + offset * 9,
      leads: 486 + (offset % 50),
      orders: 108 + (offset % 16),
      trend: (offset % 18) - 6,
      summary: "高意向词稳定，低意向词需要收缩预算。",
    },
    {
      channel: "内容运营",
      visits: 73400 + offset * 7,
      leads: 362 + (offset % 42),
      orders: 84 + (offset % 12),
      trend: (offset % 14) - 4,
      summary: "行业模板文章带来持续长尾流量。",
    },
    {
      channel: "客户转介绍",
      visits: 12800 + offset * 3,
      leads: 143 + (offset % 30),
      orders: 62 + (offset % 10),
      trend: (offset % 20) - 3,
      summary: "客单价高，适合继续做激励机制。",
    },
    {
      channel: "线下活动",
      visits: 41200 + offset * 5,
      leads: 528 + (offset % 38),
      orders: 96 + (offset % 14),
      trend: (offset % 16) - 8,
      summary: "转化周期长，需要补充销售跟进节奏。",
    },
  ];
  return activeChannel.value === "全部渠道" ? rows : rows.filter(row => row.channel === activeChannel.value);
};

const rows = computed(() => createRows(reportSeed.value));

const sections = computed(() =>
  Array.from({ length: 8 }).map((_, index) => ({
    title: `复盘段落 ${index + 1} - v${reportVersion.value}`,
    lines: [
      `当前筛选为 ${activeRange.value} / ${activeChannel.value}，报表生成时间 ${generatedAt.value}。`,
      "切换到其他标签后再回来，缓存页面会保留当前筛选、滚动位置和报表版本。",
      "点击刷新当前报表会重建页面，加载时间和报表版本会回到新实例的初始状态。",
    ],
  }))
);

const generateReport = () => {
  reportVersion.value += 1;
  reportSeed.value = Date.now();
  generatedAt.value = new Date().toLocaleTimeString();
};

const openIframeReport = () => {
  tabsManager.openTab(TabViewUrl.createRelative("./iframe-tests/cache.html"), {
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
  min-height: 100%;
}

.practice-page p {
  margin: 0;
  line-height: 1.8;
  color: var(--color-text-2);
}

@media (max-width: 768px) {
  .practice-page {
    gap: 10px;
  }

  .practice-page :deep(.arco-select) {
    width: 100% !important;
  }
}
</style>
