<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="API 覆盖检查">
    <a-space direction="vertical" fill>
      <a-alert type="info">此页面用于发布前集中检查核心 API，左侧菜单用于按场景逐项验证。</a-alert>

      <a-descriptions :column="1" bordered title="运行状态">
        <a-descriptions-item label="当前 tabId">{{ tabId || "-" }}</a-descriptions-item>
        <a-descriptions-item label="打开标签数">{{ tabsManager.tabs.length }}</a-descriptions-item>
        <a-descriptions-item label="当前激活页">{{
          tabsManager.activeTab?.viewName || tabsManager.activeTab?.viewUrl || "-"
        }}</a-descriptions-item>
        <a-descriptions-item label="注册页面数">{{ tabsManager.registerTabPaths.length }}</a-descriptions-item>
        <a-descriptions-item label="父路径推导">{{
          tabsManager.activeTabParentPaths.join(" / ") || "-"
        }}</a-descriptions-item>
        <a-descriptions-item label="存储适配器">{{ tabsManager.storage?.constructor.name || "-" }}</a-descriptions-item>
      </a-descriptions>

      <a-divider orientation="left">标签操作覆盖</a-divider>
      <section class="coverage-section">
        <a-alert
          >具体打开、缓存、关闭、刷新、守卫、iframe
          等交互测试已聚合到其它工作台页面；此处只保留发布前总览和工具函数检查。</a-alert
        >
        <a-space wrap>
          <a-button @click="tabsManager.activeFirstTab()">激活首页</a-button>
          <a-button @click="openMissingView">打开未注册视图</a-button>
          <a-button @click="openMetaDefaultView">按 viewMeta 默认配置打开</a-button>
          <a-button @click="openSyncedUrlView">打开 URL 同步示例</a-button>
        </a-space>
      </section>

      <a-divider orientation="left">视图元数据覆盖</a-divider>
      <section class="coverage-section">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="查询页面">{{ metaTargetUrl }}</a-descriptions-item>
          <a-descriptions-item label="元数据标题">{{ metaInfo?.title || "-" }}</a-descriptions-item>
          <a-descriptions-item label="元数据图标">{{ metaInfo?.icon || "-" }}</a-descriptions-item>
          <a-descriptions-item label="元数据默认参数">{{ metaPropsText }}</a-descriptions-item>
          <a-descriptions-item label="元数据路径">{{ metaPathText }}</a-descriptions-item>
        </a-descriptions>
      </section>

      <a-divider orientation="left">菜单 key 规则覆盖</a-divider>
      <section class="coverage-section">
        <a-table :columns="menuKeyColumns" :data="menuKeyRows" :pagination="false" row-key="name" :scroll="{ x: 760 }" />
        <a-typography-paragraph> 归一化结果：{{ normalizedPropsText }} </a-typography-paragraph>
      </section>

      <a-divider orientation="left">自定义菜单映射覆盖</a-divider>
      <section class="coverage-section">
        <a-space wrap>
          <a-button type="primary" @click="openCustomCustomerMenu">openMenu 打开客户工作台</a-button>
          <a-button @click="customTabMenu.handleMenuItemClick(customReportKey)">按 key 打开运营报表</a-button>
        </a-space>
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="自定义菜单 key">{{ customReportKey }}</a-descriptions-item>
          <a-descriptions-item label="findMenu 结果">{{ customFoundMenu?.label || "-" }}</a-descriptions-item>
          <a-descriptions-item label="findMenuPath 结果">{{ customMenuPathText }}</a-descriptions-item>
          <a-descriptions-item label="当前自定义选中">{{ customTabMenu.selectedKeys.value.join(" / ") || "-" }}</a-descriptions-item>
        </a-descriptions>
      </section>

      <a-divider orientation="left">URL 同步覆盖</a-divider>
      <section class="coverage-section">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="queryKey">activeTab</a-descriptions-item>
          <a-descriptions-item label="当前同步值">{{ activeTabQuery || "-" }}</a-descriptions-item>
          <a-descriptions-item label="浏览器标题">{{ documentTitle }}</a-descriptions-item>
        </a-descriptions>
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
import { computed } from "vue";
import { Message } from "@arco-design/web-vue";
import { useRoute } from "vue-router";
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
  useTabMenu,
  useTabId,
  useTabsManager,
} from "@xsbcme/vue-tab-router";
import type { TabMenuItemLike } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();
const tabId = useTabId();
const route = useRoute();

interface CustomDemoMenu {
  code: string;
  label: string;
  route?: string;
  iconName?: string;
  payload?: Record<string, unknown>;
  items?: CustomDemoMenu[];
}

const metaTargetUrl = "/src/views/practice/customer-workbench/page-index.vue";

const customMenus: CustomDemoMenu[] = [
  {
    code: "practice",
    label: "自定义项目实践",
    items: [
      {
        code: "customer-workbench",
        label: "客户工作台",
        route: metaTargetUrl,
        iconName: "IconApps",
        payload: { source: "custom-menu" },
      },
      {
        code: "operations-report",
        label: "运营报表",
        route: "/src/views/practice/operations-report/page-index.vue",
        payload: { source: "custom-menu", report: "month" },
      },
    ],
  },
];

const customTabMenu = useTabMenu<CustomDemoMenu>({
  menus: customMenus,
  getChildren: menu => menu.items,
  getViewUrl: menu => menu.route,
  getViewName: menu => menu.label,
  getViewIcon: menu => menu.iconName,
  getViewProps: menu => menu.payload,
  getMenuKey: menu => menu.route ? createTabMenuKey(menu.route, menu.payload) : menu.code,
});

const customReportKey = createTabMenuKey("/src/views/practice/operations-report/page-index.vue", {
  source: "custom-menu",
  report: "month",
});
const customFoundMenu = computed(() => customTabMenu.findMenu(customReportKey));
const customMenuPathText = computed(() => customTabMenu.findMenuPath(customReportKey).map(menu => menu.label).join(" / "));

const openCustomCustomerMenu = () => {
  const customerMenu = customMenus[0]?.items?.[0];
  if (!customerMenu) {
    Message.warning("客户工作台菜单不存在");
    return;
  }
  customTabMenu.openMenu(customerMenu);
};

const menuKeyColumns = [
  { title: "场景", dataIndex: "name", minWidth: 180 },
  { title: "key", dataIndex: "key", minWidth: 560 },
];

const menuKeyRows = computed(() => [
  {
    name: "内部链接",
    key: createTabMenuKey("http://www.baidu.com/"),
  },
  {
    name: "内部链接带参",
    key: createTabMenuKey("http://www.baidu.com/", { a: 123 }),
  },
  {
    name: "外部链接",
    key: createTabMenuKey("http://www.baidu.com/", { _viewOutside: true }),
  },
  {
    name: "外部链接带参",
    key: createTabMenuKey("http://www.baidu.com/", { _viewOutside: true, a: 123 }),
  },
  {
    name: "相对链接业务 key",
    key: getTabMenuKey({
      url: TabViewUrl.createRelative("./"),
      props: { _viewName: "相对链接", menuKey: "relative-inline" },
    } satisfies Partial<TabMenuItemLike>),
  },
  {
    name: "展示参数参与 key",
    key: createTabMenuKey("/src/views/test-router/router-target/page-index.vue", { _viewName: "标题参与", a: 1 }, {
      includeTabOptionsInKey: true,
    }),
  },
]);

const normalizedPropsText = computed(() =>
  JSON.stringify(
    normalizeTabMenuProps({
      _viewName: "标题不参与默认 key",
      _viewIcon: "IconApps",
      _viewOutside: true,
      menuKey: "business-key",
      a: 123,
    })
  )
);

const defaultThemeVariableCount = computed(() => Object.keys(themeToCssVariables(defaultTheme)).length);
const storedTabsCount = computed(() => tabsManager.storage?.get("tabs", []).length ?? 0);
const metaInfo = computed(() => tabsManager.getViewMeta(metaTargetUrl));
const metaPropsText = computed(() => JSON.stringify(metaInfo.value?.props || {}));
const metaPathText = computed(() => tabsManager.getViewMetaPath(metaTargetUrl).map(item => item.title || item.viewUrl).join(" / "));
const activeTabQuery = computed(() => {
  const value = route.query.activeTab;
  return Array.isArray(value) ? value[0] : value;
});
const documentTitle = computed(() => (typeof document === "undefined" ? "-" : document.title));

const openMissingView = () => {
  tabsManager.openTab("/src/views/not-exists/page-index.vue", { _viewName: "未注册视图", _viewSingle: true }).catch(error => {
    Message.error(error instanceof Error ? error.message : String(error));
  });
};

const openMetaDefaultView = () => {
  tabsManager.openTab(metaTargetUrl);
};

const openSyncedUrlView = () => {
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: `URL 同步 ${new Date().toLocaleTimeString()}`,
    _viewSingle: true,
    source: "url-sync-demo",
  });
};
</script>

<style scoped>
.coverage-section {
  display: block;

  > * + * {
    margin-top: 12px;
  }
}
</style>
