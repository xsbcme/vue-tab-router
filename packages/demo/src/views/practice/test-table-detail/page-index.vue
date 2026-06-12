<template>
  <div class="practice-page">
    <a-card title="列表详情联动" :bordered="false">
      <a-space direction="vertical" fill>
        <a-alert type="info">
          这个页面演示最常见的列表到详情联动：筛选列表、打开多例详情、保存详情后回写列表，并观察缓存状态是否保留。
        </a-alert>
        <a-descriptions :column="{ xs: 1, sm: 1, md: 2 }" bordered>
          <a-descriptions-item label="当前 tabId">{{ tabId || "-" }}</a-descriptions-item>
          <a-descriptions-item label="列表批次">{{ listSeed }}</a-descriptions-item>
          <a-descriptions-item label="加载时间">{{ loadedAt }}</a-descriptions-item>
          <a-descriptions-item label="保存回传次数">{{ saveBackCount }}</a-descriptions-item>
        </a-descriptions>
        <a-space wrap>
          <a-input-search v-model="keyword" :style="{ width: '260px' }" placeholder="搜索客户或负责人" allow-clear />
          <a-button type="primary" @click="regenerateList">刷新列表数据</a-button>
          <a-button @click="openSelectedDetail">打开选中客户详情</a-button>
          <a-button @click="tabsManager.refreshTab()">刷新当前列表页</a-button>
        </a-space>
        <a-alert v-if="lastSavedMessage" type="success">{{ lastSavedMessage }}</a-alert>
        <a-table
          v-model:selected-keys="selectedKeys"
          :columns="columns"
          :data="filteredRows"
          :pagination="false"
          row-key="key"
          :row-selection="{ type: 'radio' }"
          :scroll="{ x: 1120 }"
        >
          <template #level="{ record }">
            <a-tag :color="record.level === '重点' ? 'red' : record.level === '成长' ? 'orange' : 'green'">
              {{ record.level }}
            </a-tag>
          </template>
          <template #updated="{ record }">{{ record.updatedAt || "-" }}</template>
          <template #operate="{ record }">
            <a-space class="operate-links" :size="12">
              <a-link @click="openDetail(record)">打开详情</a-link>
              <a-link @click="openSingleDetail(record)">复用详情</a-link>
            </a-space>
          </template>
        </a-table>
      </a-space>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import type { TableColumnData } from "@arco-design/web-vue";
import { Message } from "@arco-design/web-vue";
import { defineTabEvents, useTabId, useTabsManager } from "@xsbcme/vue-tab-router";

export interface CustomerRecord {
  key: string;
  name: string;
  salary: number;
  address: string;
  email: string;
  owner?: string;
  level?: "重点" | "成长" | "观察";
  remark?: string;
  updatedAt?: string;
}

const tabsManager = useTabsManager();
const tabId = useTabId();
const listSeed = ref(Date.now());
const loadedAt = new Date(listSeed.value).toLocaleTimeString();
const keyword = ref("");
const selectedKeys = ref<string[]>([]);
const saveBackCount = ref(0);
const lastSavedMessage = ref("");

const columns: TableColumnData[] = [
  { title: "客户编号", dataIndex: "key", width: 130, minWidth: 130 },
  { title: "客户名称", dataIndex: "name", minWidth: 150 },
  { title: "客户等级", slotName: "level", width: 110, minWidth: 110 },
  { title: "负责人", dataIndex: "owner", width: 110, minWidth: 110 },
  { title: "预计客单价", dataIndex: "salary", width: 120, minWidth: 120, align: "right" },
  { title: "区域", dataIndex: "address", minWidth: 140 },
  { title: "最近处理", slotName: "updated", width: 120, minWidth: 120 },
  { title: "操作", slotName: "operate", width: 170, minWidth: 170, align: "center" },
];

const createRows = (seed: number): CustomerRecord[] => {
  const offset = seed % 20;
  return [
    { key: `C-${1001 + offset}`, name: "北辰科技", salary: 93000 + offset * 120, address: "华东区", email: "beichen@example.com", owner: "Jane", level: "重点" },
    { key: `C-${1002 + offset}`, name: "远山制造", salary: 76000 + offset * 90, address: "华南区", email: "yuanshan@example.com", owner: "Alisa", level: "成长" },
    { key: `C-${1003 + offset}`, name: "星河零售", salary: 52000 + offset * 70, address: "华北区", email: "xinghe@example.com", owner: "Kevin", level: "观察" },
    { key: `C-${1004 + offset}`, name: "风禾物流", salary: 68000 + offset * 80, address: "西南区", email: "fenghe@example.com", owner: "Ed", level: "成长" },
    { key: `C-${1005 + offset}`, name: "云图咨询", salary: 43000 + offset * 60, address: "华中区", email: "yuntu@example.com", owner: "William", level: "观察" },
  ];
};

const rows = ref<CustomerRecord[]>(createRows(listSeed.value));

const filteredRows = computed(() => {
  const value = keyword.value.trim().toLowerCase();
  if (!value) return rows.value;
  return rows.value.filter(row => `${row.name}${row.owner}${row.address}`.toLowerCase().includes(value));
});

defineTabEvents({
  "customer:saved": data => {
    const payload = data as { key?: string; remark?: string; time?: string; level?: CustomerRecord["level"] };
    const row = rows.value.find(item => item.key === payload.key);
    if (row) {
      row.remark = payload.remark;
      row.updatedAt = payload.time || new Date().toLocaleTimeString();
      row.level = payload.level || row.level;
      lastSavedMessage.value = `客户 ${row.name} 已回写列表，处理时间 ${row.updatedAt}`;
    } else {
      lastSavedMessage.value = `收到详情回传，但列表中未找到客户 ${payload.key || "-"}`;
    }
    saveBackCount.value += 1;
  },
});

const regenerateList = () => {
  listSeed.value = Date.now();
  rows.value = createRows(listSeed.value);
  selectedKeys.value = [];
  lastSavedMessage.value = "";
};

const openDetail = (record: CustomerRecord) => {
  selectedKeys.value = [record.key];
  tabsManager.openTab("/src/views/practice/test-table-detail/table-detail/page-index.vue", {
    _viewName: `客户详情 ${record.name}`,
    record: { ...record },
  });
};

const openSingleDetail = (record: CustomerRecord) => {
  selectedKeys.value = [record.key];
  tabsManager.openTab("/src/views/practice/test-table-detail/table-detail/page-index.vue", {
    _viewName: "客户详情复用",
    _viewSingle: true,
    record: { ...record },
  });
};

const openSelectedDetail = () => {
  const record = rows.value.find(item => item.key === selectedKeys.value[0]);
  if (!record) {
    Message.info("请先选择一条客户记录");
    return;
  }
  openDetail(record);
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

  .practice-page :deep(.arco-input-wrapper) {
    width: 100% !important;
  }
}
</style>
