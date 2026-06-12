<template>
  <div class="practice-page">
    <a-card title="订单处理中心" :bordered="false">
      <a-space direction="vertical" fill>
        <a-alert type="info">
          这个页面模拟列表到详情的常见后台流程，组合演示多开、单例复用、详情传参、关闭守卫和来源页签事件。
        </a-alert>
        <a-descriptions :column="{ xs: 1, sm: 1, md: 2 }" bordered>
          <a-descriptions-item label="当前 tabId">{{ tabId || "-" }}</a-descriptions-item>
          <a-descriptions-item label="列表批次">{{ listSeed }}</a-descriptions-item>
          <a-descriptions-item label="生成时间">{{ generatedAt }}</a-descriptions-item>
          <a-descriptions-item label="详情回传次数">{{ savedCount }}</a-descriptions-item>
        </a-descriptions>
        <a-alert v-if="savedMessage" type="success">{{ savedMessage }}</a-alert>
        <a-space wrap>
          <a-button type="primary" @click="regenerateOrders">重新生成订单列表</a-button>
          <a-button @click="openFirstOrderPair">同一订单多例/单例对照</a-button>
          <a-button @click="tabsManager.refreshTab()">刷新订单中心</a-button>
        </a-space>
        <a-table :columns="columns" :data="orders" :pagination="false" row-key="id" :scroll="{ x: 1080 }">
          <template #status="{ record }">
            <a-tag :color="statusColor[record.status]">{{ record.status }}</a-tag>
          </template>
          <template #amount="{ record }">￥{{ record.amount.toLocaleString() }}</template>
          <template #updated="{ record }">{{ record.updatedAt || "-" }}</template>
          <template #operate="{ record }">
            <a-space class="operate-links" :size="12">
              <a-link @click="openDetail(record)">多开详情</a-link>
              <a-link @click="openDetailSingle(record)">复用详情</a-link>
            </a-space>
          </template>
        </a-table>
      </a-space>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { TableColumnData } from "@arco-design/web-vue";
import { defineTabEvents, useTabId, useTabsManager } from "@xsbcme/vue-tab-router";

type OrderStatus = "待审核" | "处理中" | "已发货" | "异常" | "已保存";

interface OrderRecord {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: OrderStatus;
  owner: string;
  updatedAt?: string;
  remark?: string;
}

const tabsManager = useTabsManager();
const tabId = useTabId();
const listSeed = ref(Date.now());
const generatedAt = ref(new Date(listSeed.value).toLocaleTimeString());
const savedMessage = ref("");
const savedCount = ref(0);

const statusColor: Record<OrderStatus, string> = {
  待审核: "orange",
  处理中: "blue",
  已发货: "green",
  异常: "red",
  已保存: "arcoblue",
};

const columns: TableColumnData[] = [
  { title: "订单号", dataIndex: "id", width: 140, minWidth: 140 },
  { title: "客户", dataIndex: "customer", minWidth: 140 },
  { title: "商品", dataIndex: "product", minWidth: 180 },
  { title: "金额", slotName: "amount", width: 120, minWidth: 120, align: "right" },
  { title: "状态", slotName: "status", width: 110, minWidth: 110 },
  { title: "负责人", dataIndex: "owner", width: 110, minWidth: 110 },
  { title: "最近处理", slotName: "updated", width: 120, minWidth: 120 },
  { title: "操作", slotName: "operate", width: 210, minWidth: 210, align: "center" },
];

const createOrders = (seed: number): OrderRecord[] => {
  const offset = seed % 40;
  return [
    { id: `SO-${240601 + offset}`, customer: "北辰科技", product: "企业协作套件", amount: 128600 + offset, status: "待审核", owner: "Jane" },
    { id: `SO-${240602 + offset}`, customer: "远山制造", product: "数据看板服务", amount: 86400 + offset * 3, status: "处理中", owner: "Alisa" },
    { id: `SO-${240603 + offset}`, customer: "星河零售", product: "门店运营系统", amount: 45200 + offset * 5, status: "已发货", owner: "Kevin" },
    { id: `SO-${240604 + offset}`, customer: "风禾物流", product: "调度优化模块", amount: 67300 + offset * 7, status: "异常", owner: "Ed" },
    { id: `SO-${240605 + offset}`, customer: "云图咨询", product: "客户成功包", amount: 31900 + offset * 11, status: "处理中", owner: "William" },
  ];
};

const orders = ref<OrderRecord[]>(createOrders(listSeed.value));

defineTabEvents({
  "order:saved": data => {
    const payload = data as { orderId?: string; remark?: string; time?: string };
    const order = orders.value.find(item => item.id === payload.orderId);
    if (order) {
      order.status = "已保存";
      order.updatedAt = payload.time || new Date().toLocaleTimeString();
      order.remark = payload.remark;
    }
    savedCount.value += 1;
    savedMessage.value = `收到详情页回传：${payload.orderId || "-"} 已保存，时间 ${payload.time || "-"}`;
  },
});

const regenerateOrders = () => {
  listSeed.value = Date.now();
  generatedAt.value = new Date(listSeed.value).toLocaleTimeString();
  orders.value = createOrders(listSeed.value);
  savedMessage.value = "";
};

const openDetail = (order: OrderRecord) => {
  tabsManager.openTab("/src/views/practice/order-center/order-detail/page-index.vue", {
    _viewName: `订单 ${order.id}`,
    order: { ...order },
  });
};

const openDetailSingle = (order: OrderRecord) => {
  tabsManager.openTab("/src/views/practice/order-center/order-detail/page-index.vue", {
    _viewName: "订单详情复用",
    _viewSingle: true,
    order: { ...order },
  });
};

const openFirstOrderPair = () => {
  const firstOrder = orders.value[0];
  if (!firstOrder) return;
  openDetail(firstOrder);
  openDetailSingle(firstOrder);
};
</script>

<style scoped>
.practice-page {
  padding: 16px;
  min-height: 100%;
  background: #f7f8fa;
}

.operate-links {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .practice-page {
    padding: 8px;
  }
}
</style>
