<template>
  <div class="practice-page">
    <a-card title="项目实践能力矩阵" :bordered="false">
      <a-space direction="vertical" fill size="large">
        <a-alert type="info">
          项目实践把插件能力按业务流程组合演示，适合观察菜单、面包屑、缓存、守卫、通信、iframe、弹窗显示、URL 同步和标签管理如何协同工作。
        </a-alert>
        <a-table :columns="columns" :data="scenarios" :pagination="false" row-key="key">
          <template #abilities="{ record }">
            <a-space wrap>
              <a-tag v-for="ability in record.abilities" :key="ability" color="arcoblue">{{ ability }}</a-tag>
            </a-space>
          </template>
          <template #operate="{ record }">
            <a-button type="text" @click="openScenario(record)">打开实践</a-button>
          </template>
        </a-table>
      </a-space>
    </a-card>

    <a-card title="插件能力清单" :bordered="false">
      <a-row :gutter="16">
        <a-col v-for="group in abilityGroups" :key="group.title" :span="6">
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
}

const tabsManager = useTabsManager();

const columns: TableColumnData[] = [
  { title: "实践入口", dataIndex: "name", width: 170 },
  { title: "业务场景", dataIndex: "scene" },
  { title: "覆盖能力", slotName: "abilities", width: 430 },
  { title: "操作", slotName: "operate", width: 120, align: "center" },
];

const scenarios: ScenarioRecord[] = [
  {
    key: "customer",
    name: "客户运营工作台",
    scene: "固定工作台、待办处理、跨页回传和主标签维护。",
    url: "/src/views/practice/customer-workbench/page-index.vue",
    viewName: "客户运营工作台",
    abilities: ["单例复用", "置顶", "父子通信", "刷新", "更新标题", "面包屑"],
  },
  {
    key: "order",
    name: "订单处理中心",
    scene: "列表进入多个订单详情，区分多开和复用详情。",
    url: "/src/views/practice/order-center/page-index.vue",
    viewName: "订单处理中心",
    abilities: ["多标签打开", "单例复用", "详情传参", "关闭守卫", "来源页签事件"],
  },
  {
    key: "report",
    name: "运营复盘报表",
    scene: "长内容报表、iframe 看板、弹窗显示和批量标签管理。",
    url: "/src/views/practice/operations-report/page-index.vue",
    viewName: "运营复盘报表",
    abilities: ["长内容滚动", "iframe", "postMessage", "弹窗显示", "批量关闭", "URL 同步"],
  },
  {
    key: "table",
    name: "列表详情联动",
    scene: "基础列表到详情示例，保留最小接入方式。",
    url: "/src/views/practice/test-table-detail/page-index.vue",
    viewName: "列表详情联动",
    abilities: ["openTab", "动态标题", "详情参数", "面包屑层级"],
  },
];

const abilityGroups = [
  { title: "标签运行时", items: ["打开/激活/刷新/关闭", "单例复用与多开", "首页/置顶/不可拖拽", "批量关闭和排序"] },
  { title: "页面渲染", items: ["组件页面", "iframe/外部链接", "keep-alive 缓存", "无缓存刷新"] },
  { title: "业务协作", items: ["菜单联动", "动态面包屑", "父子页签事件", "页面级与全局守卫"] },
  { title: "扩展集成", items: ["状态持久化", "URL 同步", "插件 hooks", "弹窗和预览容器"] },
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
</style>
