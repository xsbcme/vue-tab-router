import { TabViewUrl, useTabsManager } from "@xsbcme/vue-tab-router";

export const viewUrls = {
  home: "/src/views/home/page-index.vue",
  target: "/src/views/test-router/router-target/page-index.vue",
  cacheEnabled: "/src/views/test-cache/cache-enable/page-index.vue",
  cacheDisabled: "/src/views/test-cache/cache-colse/page-index.vue",
  refresh: "/src/views/test-refresh/page-index.vue",
  update: "/src/views/test-update/page-index.vue",
  close: "/src/views/test-close/page-index.vue",
  longContent: "/src/views/test-workbench/long-content/page-index.vue",
  messageChild: "/src/views/test-message/message/page-index.vue",
  enterGuard: "/src/views/test-guard/before-enter/page-index.vue",
  leaveGuard: "/src/views/test-guard/before-leave/page-index.vue",
  closeGuard: "/src/views/test-guard/before-close/page-index.vue",
  orderCenter: "/src/views/practice/order-center/page-index.vue",
  orderDetail: "/src/views/practice/order-center/order-detail/page-index.vue",
  practiceOverview: "/src/views/practice/overview/page-index.vue",
  customerWorkbench: "/src/views/practice/customer-workbench/page-index.vue",
  operationsReport: "/src/views/practice/operations-report/page-index.vue",
  tableDetail: "/src/views/practice/test-table-detail/page-index.vue",
  preview: "/src/views/test-preview/container/page-index.vue",
  stateComponents: "/src/views/test-theme/state-components/page-index.vue",
};

export const iframeUrls = {
  relativeHome: TabViewUrl.createRelative("./"),
  cache: TabViewUrl.createRelative("./iframe-tests/cache.html"),
  message: TabViewUrl.createRelative("./iframe-tests/message.html"),
  links: TabViewUrl.createRelative("./iframe-tests/links.html"),
  navigationOverview: TabViewUrl.createRelative("./iframe-tests/navigation.html?from=learning#overview"),
  navigationDetail: TabViewUrl.createRelative("./iframe-tests/navigation.html?from=learning#detail"),
};

export const useLearningTabs = () => {
  const tabsManager = useTabsManager();

  const openTarget = (viewName: string, props: Record<string, unknown> = {}) =>
    tabsManager.openTab(viewUrls.target, {
      _viewName: viewName,
      ...props,
    });

  return {
    tabsManager,
    openTarget,
  };
};
