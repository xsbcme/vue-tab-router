<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="页面守卫">
    <a-space direction="vertical" fill>
      <a-alert type="info"
        >这一页只演示进入、离开、关闭三个页面级守卫。打开目标页后，按页面提示尝试切换或关闭。</a-alert
      >

      <a-space wrap>
        <a-button type="primary" @click="openEnterGuardPage">打开进入守卫页</a-button>
        <a-button @click="openLeaveGuardPage">打开离开守卫页</a-button>
        <a-button @click="openCloseGuardPage">打开关闭守卫页</a-button>
        <a-button @click="openSwitchTarget">打开切换目标页</a-button>
      </a-space>

      <a-alert>预期：守卫返回 false 时，进入、离开或关闭流程会被中断。</a-alert>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { useLearningTabs, viewUrls } from "../helpers";

const { tabsManager, openTarget } = useLearningTabs();

const openEnterGuardPage = () => {
  tabsManager.openTab(viewUrls.enterGuard, { _viewName: "进入守卫测试" });
};

const openLeaveGuardPage = () => {
  tabsManager.openTab(viewUrls.leaveGuard, { _viewName: "离开守卫测试" });
};

const openCloseGuardPage = () => {
  tabsManager.openTab(viewUrls.closeGuard, { _viewName: "关闭守卫测试" });
};

const openSwitchTarget = () => {
  openTarget("守卫切换目标页", { a: Date.now() });
};
</script>
