<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="通信与守卫测试">
    <a-space direction="vertical" fill>
      <a-alert type="info">集中验证父子 tab 通信、页面级守卫、全局守卫日志和插件 hook 日志。</a-alert>

      <a-divider orientation="left">父子通信</a-divider>
      <a-space wrap>
        <a-button type="primary" @click="openChildMessagePage">打开通信子页</a-button>
        <a-button @click="emitToSource">向来源页发送测试事件</a-button>
      </a-space>
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="子页回传数据">{{ childMessage || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider orientation="left">页面级守卫</a-divider>
      <a-space wrap>
        <a-button @click="openEnterGuardPage">打开进入守卫页</a-button>
        <a-button @click="openLeaveGuardPage">打开离开守卫页</a-button>
        <a-button @click="openCloseGuardPage">打开关闭守卫页</a-button>
        <a-button @click="openSwitchTarget">打开切换目标页</a-button>
      </a-space>

      <a-divider orientation="left">插件与全局守卫日志</a-divider>
      <a-space wrap>
        <a-button @click="openHookTarget">打开 Hook 目标页</a-button>
        <a-button @click="tabsManager.refreshTab()">刷新当前</a-button>
        <a-button status="danger" @click="tabsManager.closeTab()">关闭当前</a-button>
      </a-space>
      <a-list bordered :data="hookLogs">
        <template #item="{ item }">
          <a-list-item>{{ item }}</a-list-item>
        </template>
      </a-list>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { defineTabEvents, useTabsManager } from "@xsbcme/vue-tab-router";
import { hookLogs } from "@/plugins/tab-router";

const tabsManager = useTabsManager();
const childMessage = ref("");

defineTabEvents({
  "message-parent-to-child": data => {
    childMessage.value = String(data ?? "");
  },
});

const openChildMessagePage = () => {
  tabsManager.openTab("/src/views/test-message/message/page-index.vue", {
    _viewName: "通信子页",
  });
};

const emitToSource = () => {
  tabsManager.emit("message-parent-to-child", `来自通信面板 ${new Date().toLocaleTimeString()}`);
};

const openEnterGuardPage = () => {
  tabsManager.openTab("/src/views/test-guard/before-enter/page-index.vue", { _viewName: "进入守卫测试" });
};

const openLeaveGuardPage = () => {
  tabsManager.openTab("/src/views/test-guard/before-leave/page-index.vue", { _viewName: "离开守卫测试" });
};

const openCloseGuardPage = () => {
  tabsManager.openTab("/src/views/test-guard/before-close/page-index.vue", { _viewName: "关闭守卫测试" });
};

const openSwitchTarget = () => {
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: "守卫切换目标页",
    a: Date.now(),
  });
};

const openHookTarget = () => {
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: `Hook 目标 ${new Date().toLocaleTimeString()}`,
    hookSource: true,
  });
};
</script>