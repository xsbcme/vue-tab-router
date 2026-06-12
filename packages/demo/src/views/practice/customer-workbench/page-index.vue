<template>
  <div class="practice-page">
    <a-card title="客户运营工作台" :bordered="false">
      <a-space direction="vertical" fill size="large">
        <a-alert type="info">
          这个页面模拟业务人员每天固定打开的运营工作台，组合演示单例复用、置顶、刷新、更新标题和来源页签事件。
        </a-alert>
        <a-row :gutter="16">
          <a-col v-for="metric in metrics" :key="metric.label" :span="6">
            <a-statistic :title="metric.label" :value="metric.value" :suffix="metric.suffix" show-group-separator />
          </a-col>
        </a-row>
      </a-space>
    </a-card>

    <a-card title="今日待办" :bordered="false">
      <a-list :bordered="false">
        <a-list-item v-for="task in tasks" :key="task.id">
          <a-list-item-meta :title="task.title" :description="task.description" />
          <template #actions>
            <a-button type="text" @click="openCustomer(task)">打开客户标签</a-button>
          </template>
        </a-list-item>
      </a-list>
    </a-card>

    <a-card title="推荐动作" :bordered="false">
      <a-space wrap>
        <a-button type="primary" @click="openOrderCenter">打开订单处理中心</a-button>
        <a-button @click="openOrderDetail">打开待处理订单详情</a-button>
        <a-button @click="openReport">打开运营报表</a-button>
        <a-button @click="pinCurrent">置顶当前工作台</a-button>
        <a-button @click="renameCurrent">更新当前标题</a-button>
        <a-button @click="tabsManager.refreshTab()">刷新当前工作台</a-button>
      </a-space>
    </a-card>

    <a-card title="事件回传" :bordered="false">
      <template #extra>
        <a-tag color="arcoblue">{{ eventMessages.length }} 条</a-tag>
      </template>
      <a-empty v-if="eventMessages.length === 0" description="订单详情保存后会把处理结果回传到这里" />
      <div v-else class="event-list">
        <div v-for="message in eventMessages" :key="message.id" class="event-item">
          <div class="event-item__header">
            <a-tag color="green">已保存</a-tag>
            <span class="event-item__title">订单 {{ message.orderId }}</span>
            <span class="event-item__time">{{ message.time }}</span>
          </div>
          <div class="event-item__content">{{ message.remark }}</div>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { defineTabEvents, useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

interface EventMessage {
  id: string;
  orderId: string;
  time: string;
  remark: string;
}

const eventMessages = ref<EventMessage[]>([]);

defineTabEvents({
  "order:saved": data => {
    const payload = data as { orderId?: string; remark?: string; time?: string };
    eventMessages.value.unshift({
      id: `${payload.orderId || "unknown"}-${Date.now()}`,
      orderId: payload.orderId || "-",
      time: payload.time || "-",
      remark: payload.remark || "详情页已完成保存，并通过来源页签事件回传到当前工作台。",
    });
  },
});

const metrics = [
  { label: "活跃客户", value: 1286, suffix: "人" },
  { label: "待跟进", value: 43, suffix: "项" },
  { label: "本周转化", value: 18.6, suffix: "%" },
  { label: "客单价", value: 932, suffix: "元" },
];

const tasks = [
  { id: "C-1001", title: "华东重点客户续约", description: "合同 7 天后到期，需要确认折扣与开票信息。" },
  { id: "C-1002", title: "试用客户转付费", description: "已完成 3 次产品演示，建议安排方案评审。" },
  { id: "C-1003", title: "沉默客户唤醒", description: "连续 21 天未登录，建议推送行业模板。" },
];

const openCustomer = (task: (typeof tasks)[0]) => {
  tabsManager.openTab("/src/views/practice/test-table-detail/table-detail/page-index.vue", {
    _viewName: `客户跟进 ${task.id}`,
    record: {
      key: task.id,
      name: task.title,
      salary: 0,
      address: "客户运营池",
      email: `${task.id.toLowerCase()}@example.com`,
    },
  });
};

const openOrderCenter = () => {
  tabsManager.openTab("/src/views/practice/order-center/page-index.vue", {
    _viewName: "订单处理中心",
    _viewSingle: true,
  });
};

const openOrderDetail = () => {
  tabsManager.openTab("/src/views/practice/order-center/order-detail/page-index.vue", {
    _viewName: "客户待处理订单",
    order: {
      id: "SO-240699",
      customer: "华东重点客户",
      product: "企业协作套件续约包",
      amount: 156800,
      status: "待审核",
      owner: "Jane",
    },
  });
};

const openReport = () => {
  tabsManager.openTab("/src/views/practice/operations-report/page-index.vue", {
    _viewName: "运营复盘报表",
    _viewSingle: true,
  });
};

const pinCurrent = () => {
  tabsManager.updateTabOptions({
    _viewPinned: true,
    _viewNoDrag: true,
  });
};

const renameCurrent = () => {
  tabsManager.updateTabOptions({
    _viewName: `客户工作台 ${new Date().toLocaleTimeString()}`,
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

.event-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-item {
  padding: 12px 14px;
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  background: var(--color-fill-1);
}

.event-item__header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.event-item__title {
  font-weight: 500;
  color: var(--color-text-1);
}

.event-item__time {
  margin-left: auto;
  color: var(--color-text-3);
  white-space: nowrap;
}

.event-item__content {
  margin-top: 8px;
  line-height: 1.7;
  color: var(--color-text-2);
}
</style>
