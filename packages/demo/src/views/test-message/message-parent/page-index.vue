<template>
  <a-card :style="{ height: '100%' }">
    <div>
      <div>当前为A页面的父页面</div>
      <div><button @click="handleToPageA">去A页面并注册事件</button></div>
      <div>子页面传入当前页面的数据：{{ message }}</div>
    </div>
  </a-card>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useTabsManager, defineTabEvents } from "@xsbcme/vue-tab-router";

defineTabEvents({
  "message-parent-to-child": data => {
    message.value = data as string;
  },
});

const tabsManager = useTabsManager();

const message = ref("");
const handleToPageA = () => {
  tabsManager.openTab("/src/views/test-message/message/page-index.vue", {
    _viewName: "通讯测试-A页面",
  });
};
</script>
<style lang="scss" scoped></style>
