// @vitest-environment jsdom

import { ref, type Ref } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTabsManager } from "../src/use-tabs-manager";
import {
  createTabUrlSyncPlugin,
  type CreateTabUrlSyncPluginOptions,
  type TabUrlSyncRoute,
  type TabUrlSyncRouter,
} from "../src/tab-url-sync-plugin";
import { TabViewUrl } from "../src/utils";

type RouteQuery = NonNullable<TabUrlSyncRoute["query"]>;
type RouterStub = TabUrlSyncRouter & {
  currentRoute: Ref<TabUrlSyncRoute>;
  push: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
};

function createRouterStub(initialRoute: TabUrlSyncRoute = { path: "/dashboard", query: {} }): RouterStub {
  const currentRoute = ref<TabUrlSyncRoute>(initialRoute);
  const afterEachHandlers: Array<(to: TabUrlSyncRoute, from: TabUrlSyncRoute) => void> = [];
  const updateRoute = async (to: { query?: RouteQuery }) => {
    const from = currentRoute.value;
    const nextRoute: TabUrlSyncRoute = {
      ...from,
      ...to,
      query: to.query || {},
    };
    currentRoute.value = nextRoute;
    afterEachHandlers.forEach(handler => handler(nextRoute, from));
    return nextRoute;
  };

  return {
    currentRoute,
    push: vi.fn(updateRoute),
    replace: vi.fn(updateRoute),
    afterEach: handler => {
      afterEachHandlers.push(handler);
      return () => {
        const index = afterEachHandlers.indexOf(handler);
        if (index >= 0) afterEachHandlers.splice(index, 1);
      };
    },
  };
}

function createTestTabsManager() {
  return createTabsManager({
    views: {
      modules: {},
    },
    storage: {
      enabled: false,
    },
  });
}

function setupUrlSyncPlugin(
  router: TabUrlSyncRouter,
  options: CreateTabUrlSyncPluginOptions = {},
  tabsManager = createTestTabsManager()
) {
  const plugin = createTabUrlSyncPlugin(router, {
    routePath: "/dashboard",
    ...options,
  });
  const setupPlugin = typeof plugin === "function" ? plugin : plugin.setup;

  const cleanup = setupPlugin({
    app: {} as never,
    tabsManager,
    hooks: tabsManager.hooks,
    onDispose: () => {},
  });

  return { tabsManager, cleanup };
}

function createSyncedTabsManager(router: TabUrlSyncRouter, options: CreateTabUrlSyncPluginOptions = {}) {
  return setupUrlSyncPlugin(router, options);
}

afterEach(() => {
  vi.restoreAllMocks();
  document.title = "";
});

describe("createTabUrlSyncPlugin", () => {
  it("serializes tab state with unpadded base64url query values", async () => {
    const router = createRouterStub();
    const { tabsManager } = createSyncedTabsManager(router);

    await tabsManager.openTab(TabViewUrl.createRelative("/reports/summary?a=1&b=2"), {
      _viewName: "统计报表",
      _viewSingle: true,
      page: 2,
      keyword: "中文 + / =",
    });

    const value = router.currentRoute.value.query?.tab;
    expect(typeof value).toBe("string");
    expect(value).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(value).not.toContain("=");
  });

  it("opens the target tab from a serialized route query", async () => {
    const sourceRouter = createRouterStub();
    const { tabsManager: sourceManager } = createSyncedTabsManager(sourceRouter);
    const viewUrl = TabViewUrl.createRelative("/practice/detail?id=100&name=%E6%B5%8B%E8%AF%95");

    await sourceManager.openTab(viewUrl, {
      _viewName: "项目实践",
      _viewSingle: true,
      id: 100,
      text: "中文 + / =",
    });

    const queryValue = sourceRouter.currentRoute.value.query?.tab as string;
    const targetRouter = createRouterStub({ path: "/dashboard", query: { tab: queryValue } });
    const { tabsManager: targetManager } = createSyncedTabsManager(targetRouter);

    await expect.poll(() => targetManager.activeTab?.viewUrl).toBe(viewUrl);
    expect(targetManager.activeTab?.viewName).toBe("项目实践");
    expect(targetManager.activeTab?.viewProps).toEqual({ id: 100, text: "中文 + / =" });
  });

  it("removes invalid serialized query values", async () => {
    const router = createRouterStub({ path: "/dashboard", query: { tab: "not-valid-base64url" } });
    createSyncedTabsManager(router);
    await Promise.resolve();

    expect(router.replace).toHaveBeenCalledWith({ query: {} });
    expect(router.currentRoute.value.query?.tab).toBeUndefined();
  });

  it("supports custom query keys", async () => {
    const router = createRouterStub();
    const { tabsManager } = createSyncedTabsManager(router, { queryKey: "activeTab" });

    await tabsManager.openTab(TabViewUrl.createRelative("/reports/summary"), {
      _viewName: "统计报表",
    });

    const queryValue = router.currentRoute.value.query?.activeTab;
    expect(typeof queryValue).toBe("string");
    expect(router.currentRoute.value.query?.tab).toBeUndefined();

    const targetRouter = createRouterStub({ path: "/dashboard", query: { activeTab: queryValue as string } });
    const { tabsManager: targetManager } = createSyncedTabsManager(targetRouter, { queryKey: "activeTab" });

    await expect.poll(() => targetManager.activeTab?.viewName).toBe("统计报表");
  });

  it("syncs http iframe tabs with props when external urls are allowed", async () => {
    const router = createRouterStub();
    const { tabsManager } = createSyncedTabsManager(router, { allowExternal: true });

    await tabsManager.openTab("https://www.baidu.com/", {
      _viewName: "内部链接带参",
      a: 123,
    });

    const queryValue = router.currentRoute.value.query?.tab;
    expect(queryValue).toEqual(expect.any(String));

    const targetRouter = createRouterStub({ path: "/dashboard", query: { tab: queryValue as string } });
    const { tabsManager: targetManager } = createSyncedTabsManager(targetRouter, { allowExternal: true });

    await expect.poll(() => targetManager.activeTab?.viewUrl).toBe("https://www.baidu.com/");
    expect(targetManager.activeTab?.viewName).toBe("内部链接带参");
    expect(targetManager.activeTab?.viewProps).toEqual({ a: 123 });
  });

  it("removes invalid serialized values from custom query keys", async () => {
    const router = createRouterStub({ path: "/dashboard", query: { activeTab: "not-valid-base64url", tab: "keep" } });
    createSyncedTabsManager(router, { queryKey: "activeTab" });
    await Promise.resolve();

    expect(router.replace).toHaveBeenCalledWith({ query: { tab: "keep" } });
    expect(router.currentRoute.value.query?.activeTab).toBeUndefined();
    expect(router.currentRoute.value.query?.tab).toBe("keep");
  });

  it("syncs the initial active tab to the route by default", async () => {
    const router = createRouterStub();
    const tabsManager = createTestTabsManager();

    await tabsManager.openTab(TabViewUrl.createRelative("/home"), { _viewName: "首页" });
    setupUrlSyncPlugin(router, {}, tabsManager);

    await expect.poll(() => router.currentRoute.value.query?.tab).toEqual(expect.any(String));
    expect(router.replace).toHaveBeenCalled();
  });

  it("syncs the initial active tab after entering the matched route", async () => {
    const router = createRouterStub({ path: "/login", query: {} });
    const tabsManager = createTestTabsManager();

    await tabsManager.openTab(TabViewUrl.createRelative("/home"), { _viewName: "首页" });
    setupUrlSyncPlugin(router, {}, tabsManager);
    await Promise.resolve();
    expect(router.currentRoute.value.query?.tab).toBeUndefined();

    await router.replace({ path: "/dashboard", query: {} });

    await expect.poll(() => router.currentRoute.value.query?.tab).toEqual(expect.any(String));
  });

  it("can disable initial active tab route sync", async () => {
    const router = createRouterStub();
    const tabsManager = createTestTabsManager();

    await tabsManager.openTab(TabViewUrl.createRelative("/home"), { _viewName: "首页" });
    setupUrlSyncPlugin(router, { syncInitialActiveTab: false }, tabsManager);
    await Promise.resolve();

    expect(router.currentRoute.value.query?.tab).toBeUndefined();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("syncs document title with the active tab by default", async () => {
    const router = createRouterStub();
    const { tabsManager } = createSyncedTabsManager(router);

    await tabsManager.openTab(TabViewUrl.createRelative("/reports"), { _viewName: "统计报表" });
    expect(document.title).toBe("统计报表");

    await tabsManager.openTab(TabViewUrl.createRelative("/settings"), { _viewName: "系统设置" });
    expect(document.title).toBe("系统设置");

    await tabsManager.clear();
    expect(document.title).toBe("");
  });

  it("supports custom document title formatting", async () => {
    const router = createRouterStub();
    const { tabsManager } = createSyncedTabsManager(router, {
      formatDocumentTitle: tab => (tab?.viewName ? `${tab.viewName} - Demo` : "Demo"),
    });

    await tabsManager.openTab(TabViewUrl.createRelative("/reports"), { _viewName: "统计报表" });

    expect(document.title).toBe("统计报表 - Demo");
  });

  it("syncs same-origin iframe navigation back to the route query", async () => {
    const router = createRouterStub();
    const { tabsManager } = createSyncedTabsManager(router);

    await tabsManager.openTab(TabViewUrl.createRelative("/iframe/start.html"), { _viewName: "内联页面" });
    const initialQueryValue = router.currentRoute.value.query?.tab;

    await tabsManager.hooks.call("iframe:load", {
      event: new Event("load"),
      iframe: {
        contentWindow: {
          location: {
            href: "http://localhost/iframe/detail.html?id=2#section",
          },
        },
      } as unknown as HTMLIFrameElement,
      tab: tabsManager.activeTab!,
    });

    const queryValue = router.currentRoute.value.query?.tab;
    expect(queryValue).toEqual(expect.any(String));
    expect(queryValue).not.toBe(initialQueryValue);
    expect(tabsManager.activeTab?.viewUrl).toBe(TabViewUrl.createRelative("/iframe/detail.html?id=2#section"));

    const targetRouter = createRouterStub({ path: "/dashboard", query: { tab: queryValue as string } });
    const { tabsManager: targetManager } = createSyncedTabsManager(targetRouter);
    await expect.poll(() => targetManager.activeTab?.viewUrl).toBe(
      TabViewUrl.createRelative("/iframe/detail.html?id=2#section")
    );
  });

  it("does not fail when iframe navigation cannot be inspected", async () => {
    const router = createRouterStub();
    const { tabsManager } = createSyncedTabsManager(router);

    await tabsManager.openTab(TabViewUrl.createRelative("/iframe/start.html"), { _viewName: "内联页面" });
    const initialQueryValue = router.currentRoute.value.query?.tab;

    await tabsManager.hooks.call("iframe:load", {
      event: new Event("load"),
      iframe: {
        get contentWindow() {
          throw new Error("cross-origin");
        },
      } as unknown as HTMLIFrameElement,
      tab: tabsManager.activeTab!,
    });

    expect(router.currentRoute.value.query?.tab).toBe(initialQueryValue);
    expect(tabsManager.activeTab?.viewUrl).toBe(TabViewUrl.createRelative("/iframe/start.html"));
  });
});
