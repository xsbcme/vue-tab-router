<template>
  <a-card :style="{ height: '100%' }">
    <a-table :columns="columns" :data="data" :pagination="false">
      <template #operate="{ record }">
        <a-link @click="handleEdit(record)">查看详情</a-link>
      </template>
    </a-table>
  </a-card>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import { TableColumnData } from "@arco-design/web-vue";
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

const columns: TableColumnData[] = [
  {
    title: "序号",
    render: ({ rowIndex }) => rowIndex + 1,
    width: 70,
    align: "center",
  },
  {
    title: "Name",
    dataIndex: "name",
  },
  {
    title: "Salary",
    dataIndex: "salary",
  },
  {
    title: "Address",
    dataIndex: "address",
  },
  {
    title: "Email",
    dataIndex: "email",
  },
  {
    title: "操作",
    slotName: "operate",
    width: 120,
    align: "center",
  },
];
const data = reactive([
  {
    key: "1",
    name: "Jane Doe",
    salary: 23000,
    address: "32 Park Road, London",
    email: "jane.doe@example.com",
  },
  {
    key: "2",
    name: "Alisa Ross",
    salary: 25000,
    address: "35 Park Road, London",
    email: "alisa.ross@example.com",
  },
  {
    key: "3",
    name: "Kevin Sandra",
    salary: 22000,
    address: "31 Park Road, London",
    email: "kevin.sandra@example.com",
  },
  {
    key: "4",
    name: "Ed Hellen",
    salary: 17000,
    address: "42 Park Road, London",
    email: "ed.hellen@example.com",
  },
  {
    key: "5",
    name: "William Smith",
    salary: 27000,
    address: "62 Park Road, London",
    email: "william.smith@example.com",
  },
]);

const handleEdit = (record: (typeof data)[0]) => {
  tabsManager.openTab("/src/views/practice/test-table-detail/table-detail/page-index.vue", {
    _viewName: `详情页【${record.name}】`,
    record,
  });
};
</script>
<style lang="scss" scoped></style>
