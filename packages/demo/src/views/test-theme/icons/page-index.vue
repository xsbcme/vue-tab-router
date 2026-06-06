<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="插件与主题测试">
    <a-space direction="vertical" fill>
      <a-alert type="info">集中验证主题变量、动态图标、内置标签栏图标和插件 hook 日志。</a-alert>

      <a-divider orientation="left">主题</a-divider>
      <a-space wrap>
        <a-button type="primary" @click="applyTheme(lightTheme)">浅色主题</a-button>
        <a-button @click="applyTheme(darkTheme)">深色主题</a-button>
        <a-button @click="applyTheme(defaultTheme)">默认主题</a-button>
      </a-space>

      <a-divider orientation="left">图标</a-divider>
      <a-space wrap>
        <span>组件图标：</span><DynamicIconComponent icon="IconApps" width="20px" height="20px" />
        <span>SVG 字符串：</span><DynamicIconComponent :icon="svgIcon" width="20px" height="20px" />
        <span>图片路径：</span><DynamicIconComponent icon="/favicon.ico" width="20px" height="20px" />
        <span>未知图标：</span><DynamicIconComponent icon="NotExistsIcon" width="20px" height="20px" />
      </a-space>
      <DynamicTabsComponent type="card" show-icon default-icon="IconApps" />

      <a-divider orientation="left">插件 Hooks</a-divider>
      <a-space wrap>
        <a-button type="primary" @click="openTarget">打开目标页</a-button>
        <a-button @click="updateCurrent">更新当前页</a-button>
        <a-button @click="tabsManager.refreshTab()">刷新当前页</a-button>
        <a-button status="danger" @click="tabsManager.closeTab()">关闭当前页</a-button>
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
import {
  DynamicIconComponent,
  DynamicTabsComponent,
  applyTheme,
  darkTheme,
  defineTabOptions,
  defaultTheme,
  lightTheme,
  useTabsManager,
} from "@xsbcme/vue-tab-router";
import { hookLogs } from "@/plugins/tab-router";

const svgIcon = '<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#00b42a"/></svg>';
const tabsManager = useTabsManager();

defineTabOptions({
  viewName: "插件与主题",
  viewIcon: "IconApps",
});

const openTarget = () => {
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: `Hook 目标页 ${Date.now()}`,
    hookSource: true,
  });
};

const updateCurrent = () => {
  tabsManager.updateTabOptions({
    _viewName: `插件与主题 ${new Date().toLocaleTimeString()}`,
  });
};
</script>
