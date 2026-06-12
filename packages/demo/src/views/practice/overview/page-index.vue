<template>
  <div class="practice-page">
    <a-card title="项目实践覆盖状态" :bordered="false">
      <a-space direction="vertical" fill size="large">
        <a-alert type="info">
          项目实践把插件能力放进接近真实后台的流程里，重点观察刷新是否重建、缓存是否保留、详情是否回传、单例和多例是否符合预期。
        </a-alert>
        <a-table :columns="columns" :data="scenarios" :pagination="false" row-key="key" :scroll="{ x: 1280 }">
          <template #abilities="{ record }">
            <a-space wrap>
              <a-tag v-for="ability in record.abilities" :key="ability" color="arcoblue">{{ ability }}</a-tag>
            </a-space>
          </template>
          <template #coverage="{ record }">
            <a-space wrap>
              <a-tag v-for="item in record.coverage" :key="item" color="green">{{ item }}</a-tag>
            </a-space>
          </template>
          <template #operate="{ record }">
            <a-button type="text" @click="openScenario(record)">打开实践</a-button>
          </template>
        </a-table>
      </a-space>
    </a-card>

    <a-card title="动态验证建议" :bordered="false">
      <a-row :gutter="16">
        <a-col v-for="group in validationGroups" :key="group.title" :xs="24" :sm="12" :md="6">
          <a-list :bordered="false" size="small">
            <template #header>{{ group.title }}</template>
            <a-list-item v-for="item in group.items" :key="item">{{ item }}</a-list-item>
          </a-list>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import type { TableColumnData } from "@arco-design/web-vue";
import { useTabsManager } from "@xsbcme/vue-tab-router";

interface ScenarioRecord {
  key: string;
  name: string;
  scene: string;
  url: string;
  viewName: string;
  abilities: string[];
  coverage: string[];
}

const tabsManager = useTabsManager();

const columns: TableColumnData[] = [
  { title: "实践入口", dataIndex: "name", width: 170, minWidth: 170 },
  { title: "业务场景", dataIndex: "scene", minWidth: 300 },
  { title: "插件能力", slotName: "abilities", width: 360, minWidth: 360 },
  { title: "动态验证点", slotName: "coverage", width: 360, minWidth: 360 },
  { title: "操作", slotName: "operate", width: 120, minWidth: 120, align: "center" },
];

const scenarios: ScenarioRecord[] = [
  {
    key: "customer",
    name: "客户运营工作台",
    scene: "固定工作台、待办处理、跨页回传和主标签维护。",
    url: "/src/views/practice/customer-workbench/page-index.vue",
    viewName: "客户运营工作台",
    abilities: ["单例复用", "置顶", "父子通信", "刷新", "更新标题", "面包屑"],
    coverage: ["加载批次", "模拟拉取", "无缓存对照", "事件回传"],
  },
  {
    key: "order",
    name: "订单处理中心",
    scene: "列表进入多个订单详情，保存详情后回写列表状态。",
    url: "/src/views/practice/order-center/page-index.vue",
    viewName: "订单处理中心",
    abilities: ["多标签打开", "单例复用", "详情传参", "关闭守卫", "来源页签事件"],
    coverage: ["列表批次", "重新生成", "保存回写", "单例/多例对照"],
  },
  {
    key: "report",
    name: "运营复盘报表",
    scene: "长内容报表、iframe 看板、弹窗显示和批量标签管理。",
    url: "/src/views/practice/operations-report/page-index.vue",
    viewName: "运营复盘报表",
    abilities: ["长内容滚动", "iframe", "postMessage", "弹窗显示", "批量关闭", "URL 同步"],
    coverage: ["报表版本", "筛选变更", "指标重算", "缓存滚动"],
  },
  {
    key: "table",
    name: "列表详情联动",
    scene: "客户列表筛选、打开详情、保存后回写来源列表。",
    url: "/src/views/practice/test-table-detail/page-index.vue",
    viewName: "列表详情联动",
    abilities: ["openTab", "动态标题", "详情参数", "面包屑层级", "页面级关闭守卫"],
    coverage: ["列表批次", "筛选保留", "详情保存", "回写列表"],
  },
];

const validationGroups = [
  { title: "刷新可见性", items: ["观察加载批次和加载时间", "点击刷新当前页", "无缓存页切回会重建"] },
  { title: "缓存保留", items: ["修改筛选或备注", "切换到其它标签", "返回后状态应保留"] },
  { title: "来源回传", items: ["从列表打开详情", "保存详情", "来源列表出现处理时间"] },
  { title: "组合能力", items: ["单例和多例对照", "iframe 与弹窗显示", "URL 同步和标题更新"] },
];

const openScenario = (record: ScenarioRecord) => {
  tabsManager.openTab(record.url, {
    _viewName: record.viewName,
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

@media (max-width: 768px) {
  .practice-page {
    gap: 10px;
    padding: 8px;
  }
}
</style>
