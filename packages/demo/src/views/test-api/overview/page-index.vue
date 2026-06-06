<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="API 覆盖检查">
    <a-space direction="vertical" fill>
      <a-alert type="info">此页面用于发布前集中检查核心 API，左侧菜单用于按场景逐项验证。</a-alert>

      <a-descriptions :column="1" bordered title="运行状态">
        <a-descriptions-item label="当前 tabId">{{ tabId || '-' }}</a-descriptions-item>
        <a-descriptions-item label="打开标签数">{{ tabsManager.tabs.length }}</a-descriptions-item>
        <a-descriptions-item label="当前激活页">{{ tabsManager.activeTab?.viewName || tabsManager.activeTab?.viewUrl || '-' }}</a-descriptions-item>
        <a-descriptions-item label="注册页面数">{{ tabsManager.registerTabPaths.length }}</a-descriptions-item>
        <a-descriptions-item label="父路径推导">{{ tabsManager.activeTabParentPaths.join(' / ') || '-' }}</a-descriptions-item>
        <a-descriptions-item label="存储适配器">{{ tabsManager.storage?.constructor.name || '-' }}</a-descriptions-item>
      </a-descriptions>

      <a-divider orientation="left">标签操作覆盖</a-divider>
      <section class="coverage-section">
        <a-alert>具体打开、缓存、关闭、刷新、守卫、iframe 等交互测试已聚合到其它工作台页面；此处只保留发布前总览和工具函数检查。</a-alert>
        <a-space wrap>
          <a-button @click="tabsManager.activeFirstTab()">激活首页</a-button>
          <a-button @click="openMissingView">打开未注册视图</a-button>
        </a-space>
      </section>

      <a-divider orientation="left">菜单 key 规则覆盖</a-divider>
      <section class="coverage-section">
        <a-table :columns="menuKeyColumns" :data="menuKeyRows" :pagination="false" row-key="name" />
        <a-typography-paragraph>
          归一化结果：{{ normalizedPropsText }}
        </a-typography-paragraph>
      </section>

      <a-divider orientation="left">主题与存储覆盖</a-divider>
      <section class="coverage-section">
        <a-space direction="vertical" fill>
          <a-space wrap>
            <a-button @click="applyTheme(defaultTheme)">默认主题</a-button>
            <a-button @click="applyTheme(lightTheme)">浅色主题</a-button>
            <a-button @click="applyTheme(darkTheme)">深色主题</a-button>
          </a-space>
          <a-descriptions :column="1" bordered>
            <a-descriptions-item label="默认主题变量数">{{ defaultThemeVariableCount }}</a-descriptions-item>
            <a-descriptions-item label="当前存储标签数">{{ storedTabsCount }}</a-descriptions-item>
          </a-descriptions>
        </a-space>
      </section>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Message } from '@arco-design/web-vue';
import {
  applyTheme,
  createTabMenuKey,
  darkTheme,
  defaultTheme,
  getTabMenuKey,
  lightTheme,
  normalizeTabMenuProps,
  TabViewUrl,
  themeToCssVariables,
  useTabId,
  useTabsManager,
} from '@xsbcme/vue-tab-router';
import type { TabMenuItemLike } from '@xsbcme/vue-tab-router';

const tabsManager = useTabsManager();
const tabId = useTabId();

const menuKeyColumns = [
  { title: '场景', dataIndex: 'name' },
  { title: 'key', dataIndex: 'key' },
];

const menuKeyRows = computed(() => [
  {
    name: '内部链接',
    key: createTabMenuKey('http://www.baidu.com/'),
  },
  {
    name: '内部链接带参',
    key: createTabMenuKey('http://www.baidu.com/', { a: 123 }),
  },
  {
    name: '外部链接',
    key: createTabMenuKey('http://www.baidu.com/', { _viewOutside: true }),
  },
  {
    name: '外部链接带参',
    key: createTabMenuKey('http://www.baidu.com/', { _viewOutside: true, a: 123 }),
  },
  {
    name: '相对链接业务 key',
    key: getTabMenuKey({ url: TabViewUrl.createRelative('./'), props: { _viewName: '相对链接', menuKey: 'relative-inline' } } satisfies Partial<TabMenuItemLike>),
  },
]);

const normalizedPropsText = computed(() =>
  JSON.stringify(
    normalizeTabMenuProps({
      _viewName: '标题不参与默认 key',
      _viewIcon: 'IconApps',
      _viewOutside: true,
      menuKey: 'business-key',
      a: 123,
    })
  )
);

const defaultThemeVariableCount = computed(() => Object.keys(themeToCssVariables(defaultTheme)).length);
const storedTabsCount = computed(() => tabsManager.storage?.get('tabs', []).length ?? 0);

const openMissingView = () => {
  tabsManager.openTab('/src/views/not-exists/page-index.vue', { _viewName: '未注册视图' }).catch(error => {
    Message.error(error instanceof Error ? error.message : String(error));
  });
};
</script>

<style scoped>
.coverage-section {
  display: block;
}
</style>
