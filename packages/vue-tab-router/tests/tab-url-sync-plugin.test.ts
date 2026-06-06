import { ref, type Ref } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTabsManager } from "../src/use-tabs-manager";
import { createTabUrlSyncPlugin, type TabUrlSyncRoute, type TabUrlSyncRouter } from "../src/tab-url-sync-plugin";
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

function createSyncedTabsManager(router: TabUrlSyncRouter) {
  const tabsManager = createTabsManager({
    views: {
      modules: {},
    },
    storage: {
      enabled: false,
    },
  });
  const plugin = createTabUrlSyncPlugin(router, {
    routePath: "/dashboard",
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

afterEach(() => {
  vi.restoreAllMocks();
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
});
