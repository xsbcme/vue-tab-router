import { createApp, h } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import { describe, expect, it } from "vitest";
import { createTabsManager, StorageAdapter } from "@xsbcme/vue-tab-router";
import { createRouteViewUrl } from "../src/route-descriptor";
import { createVueRouterTabsPlugin } from "../src/plugin";
import { resolveRouteTabDescriptor } from "../src/route-descriptor";

const storageKey = "router-tab-restore-test";

function createRoute(route: Partial<RouteLocationNormalizedLoaded>): RouteLocationNormalizedLoaded {
  return {
    name: undefined,
    path: "/",
    fullPath: "/",
    params: {},
    query: {},
    hash: "",
    matched: [],
    redirectedFrom: undefined,
    meta: {},
    ...route,
  };
}

function createStoredRouteTab(viewUrl: string, fullPath: string) {
  return {
    _id: viewUrl,
    _isActive: false,
    viewName: fullPath,
    viewUrl,
    viewProps: {
      route: {
        fullPath,
        location: fullPath,
      },
    },
  };
}

describe("createVueRouterTabsPlugin", () => {
  it("registers restored route tab views on setup", async () => {
    const restoredCustomersViewUrl = createRouteViewUrl("record:customers");
    const restoredOrdersViewUrl = createRouteViewUrl("record:orders");
    sessionStorage.setItem(
      storageKey,
      JSON.stringify([
        createStoredRouteTab(restoredCustomersViewUrl, "/customers"),
        createStoredRouteTab(restoredOrdersViewUrl, "/orders"),
      ])
    );

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", name: "home", component: { render: () => h("div", "home") } },
        { path: "/customers", name: "customers", component: { render: () => h("div", "customers") } },
      ],
    });

    await router.push("/");
    await router.isReady();

    const tabsManager = createTabsManager({
      views: {
        modules: {},
      },
      storage: {
        adapter: new StorageAdapter(sessionStorage),
        key: storageKey,
      },
      plugins: [createVueRouterTabsPlugin(router)],
    });

    const app = createApp({ render: () => h("div") });
    app.use(router);
    app.use(tabsManager);

    expect(app.component(restoredCustomersViewUrl)).toBeTruthy();
    expect(app.component(restoredOrdersViewUrl)).toBeTruthy();

    app.unmount();
    sessionStorage.removeItem(storageKey);
  });

  it("uses meta.tab for title and icon without merging tab props", () => {
    const route = createRoute({
      name: "detail",
      path: "/orders/1001",
      fullPath: "/orders/1001",
      params: { id: "1001" },
      query: {},
      hash: "",
      meta: {
        title: "Vue Router 页面标题",
        icon: "RouteIcon",
        tab: {
          title: "标签标题",
          icon: "TabIcon",
          ...({
            props: {
              legacy: true,
            },
          } as Record<string, unknown>),
        },
      },
    });

    const descriptor = resolveRouteTabDescriptor(route);

    expect(descriptor?.openOptions._viewName).toBe("标签标题");
    expect(descriptor?.openOptions._viewIcon).toBe("TabIcon");
    expect(descriptor?.openOptions.legacy).toBeUndefined();
  });

  it("falls back to route name instead of route meta title", () => {
    const route = createRoute({
      name: "orders",
      path: "/orders",
      fullPath: "/orders",
      meta: {
        ...({
          title: "Vue Router 页面标题",
        } as Record<string, unknown>),
      },
    });

    const descriptor = resolveRouteTabDescriptor(route);

    expect(descriptor?.openOptions._viewName).toBe("orders");
  });
});
