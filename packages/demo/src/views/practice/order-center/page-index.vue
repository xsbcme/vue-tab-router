<template>
  <div class="practice-page">
    <a-card title="订单处理中心" :bordered="false">
      <a-space direction="vertical" fill>
        <a-alert type="info">
          这个页面模拟列表到详情的常见后台流程，组合演示多开、单例复用、详情传参、关闭守卫和来源页签事件。
        </a-alert>
        <a-alert v-if="savedMessage" type="success">{{ savedMessage }}</a-alert>
        <a-table :columns="columns" :data="orders" :pagination="false" row-key="id">
          <template #status="{ record }">
            <a-tag :color="statusColor[record.status]">{{ record.status }}</a-tag>
          </template>
          <template #amount="{ record }">￥{{ record.amount.toLocaleString() }}</template>
          <template #operate="{ record }">
            <a-space class="operate-links" :size="12">
              <a-link @click="openDetail(record)">查看详情</a-link>
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
import { defineTabEvents, useTabsManager } from "@xsbcme/vue-tab-router";

type OrderStatus = "待审核" | "处理中" | "已发货" | "异常";

interface OrderRecord {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: OrderStatus;
  owner: string;
}

const tabsManager = useTabsManager();
const savedMessage = ref("");

defineTabEvents({
  "order:saved": data => {
    const payload = data as { orderId?: string; remark?: string; time?: string };
    savedMessage.value = `收到详情页回传：${payload.orderId || "-"} 已保存，时间 ${payload.time || "-"}`;
  },
});

const statusColor: Record<OrderStatus, string> = {
  待审核: "orange",
  处理中: "blue",
  已发货: "green",
  异常: "red",
};

const columns: TableColumnData[] = [
  { title: "订单号", dataIndex: "id", width: 140 },
  { title: "客户", dataIndex: "customer" },
  { title: "商品", dataIndex: "product" },
  { title: "金额", slotName: "amount", width: 120, align: "right" },
  { title: "状态", slotName: "status", width: 110 },
  { title: "负责人", dataIndex: "owner", width: 110 },
  { title: "操作", slotName: "operate", width: 210, align: "center" },
];

const orders: OrderRecord[] = [
  { id: "SO-240601", customer: "北辰科技", product: "企业协作套件", amount: 128600, status: "待审核", owner: "Jane" },
  { id: "SO-240602", customer: "远山制造", product: "数据看板服务", amount: 86400, status: "处理中", owner: "Alisa" },
  { id: "SO-240603", customer: "星河零售", product: "门店运营系统", amount: 45200, status: "已发货", owner: "Kevin" },
  { id: "SO-240604", customer: "风禾物流", product: "调度优化模块", amount: 67300, status: "异常", owner: "Ed" },
  { id: "SO-240605", customer: "云图咨询", product: "客户成功包", amount: 31900, status: "处理中", owner: "William" },
];

const openDetail = (order: OrderRecord) => {
  tabsManager.openTab("/src/views/practice/order-center/order-detail/page-index.vue", {
    _viewName: `订单 ${order.id}`,
    order,
  });
};

const openDetailSingle = (order: OrderRecord) => {
  tabsManager.openTab("/src/views/practice/order-center/order-detail/page-index.vue", {
    _viewName: "订单详情复用",
    _viewSingle: true,
    order,
  });
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
</style>
