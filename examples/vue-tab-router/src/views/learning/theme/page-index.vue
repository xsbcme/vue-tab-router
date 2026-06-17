<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="主题与图标">
    <a-space direction="vertical" fill>
      <a-alert type="info">这一页只演示主题变量、动态图标和内置标签组件配置。</a-alert>

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
      </a-space>

      <a-divider orientation="left">内置组件配置</a-divider>
      <a-space wrap>
        <a-button @click="showDemoIcon = !showDemoIcon">切换标签图标</a-button>
        <a-button @click="hideFirstTab = !hideFirstTab">切换隐藏首页</a-button>
        <a-button @click="openLongTitleTab">打开长标题页</a-button>
      </a-space>
      <DynamicTabsComponent type="card" :show-icon="showDemoIcon" :hide-first="hideFirstTab" default-icon="IconApps" />
      <DynamicBreadcrumbComponent separator=">" show-icon />
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  DynamicBreadcrumbComponent,
  DynamicIconComponent,
  DynamicTabsComponent,
  applyTheme,
  darkTheme,
  defaultTheme,
  lightTheme,
} from "@xsbcme/vue-tab-router";
import { useLearningTabs } from "../helpers";

const { openTarget } = useLearningTabs();
const svgIcon = '<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#00b42a"/></svg>';
const showDemoIcon = ref(true);
const hideFirstTab = ref(false);

const openLongTitleTab = () => {
  openTarget("这是一个用于验证标题最大显示长度的超长标签标题", {
    _viewIcon: "IconApps",
    longTitleDemo: true,
  });
};
</script>
