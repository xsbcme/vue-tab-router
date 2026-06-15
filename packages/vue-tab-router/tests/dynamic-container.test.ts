// @vitest-environment jsdom

import { createApp, defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import DynamicIframeComponent from "../src/components/dynamic-iframe.vue";
import DynamicContainerComponent from "../src/components/dynamic-container";
import { AbstractStorageAdapter } from "../src/storage";
import { createIframeTabClient } from "../src/iframe-client";
import { createIframeTabClientRequest, createIframeTabClientResponse } from "../src/iframe-client";
import { createTabsManager, useTabsManager } from "../src/composables";
import { TabViewUrl } from "../src/shared";
import type { TabsManager } from "../src/tabs";
import type { TabsManagerOptions } from "../src/types";

const iframeViewUrl = TabViewUrl.createRelative("/iframe-test.html");
const missingViewUrl = "/missing-view.vue";
const missingTabState = [
  {
    _id: "missing-tab",
    _isActive: true,
    viewName: "缺失页面",
    viewUrl: missingViewUrl,
    viewProps: {},
  },
];

const LongScrollView = defineComponent({
  setup() {
    return () =>
      h("div", { style: { height: "2000px" } }, [
        h(
          "div",
          {
            class: "inner-scroll",
            style: { height: "100px", overflow: "auto" },
          },
          h("div", { style: { height: "800px" } }, "内部长内容")
        ),
      ]);
  },
});

const OtherView = defineComponent({
  setup() {
    return () => h("div", "其他页面");
  },
});

class TestStorageAdapter extends AbstractStorageAdapter {
  constructor(private readonly data: Record<string, unknown> = {}) {
    super();
  }

  get<T = unknown>(key: string, def?: T): T {
    return (key in this.data ? this.data[key] : def) as T;
  }

  set<T = unknown>(key: string, val: T): this {
    this.data[key] = val;
    return this;
  }

  del(key: string): this {
    delete this.data[key];
    return this;
  }
}

function createMissingTabStorage() {
  return new TestStorageAdapter({ tabs: missingTabState });
}

async function flushTicks(count = 1) {
  for (let index = 0; index < count; index++) {
    await nextTick();
  }
}

function mountDynamicContainer(options: Partial<TabsManagerOptions> = {}) {
  const host = document.createElement("div");
  document.body.append(host);

  const tabsManager = createTabsManager({
    views: {
      modules: {},
      ...options.views,
    },
    storage: {
      enabled: false,
      ...options.storage,
    },
    render: options.render,
    iframe: options.iframe,
    plugins: options.plugins,
    guards: options.guards,
    detached: options.detached,
  });

  let injectedTabsManager!: TabsManager;
  const app = createApp({
    setup() {
      injectedTabsManager = useTabsManager();
      return () => h(DynamicContainerComponent);
    },
  });

  app.use(tabsManager);
  app.mount(host);

  return { app, host, rootTabsManager: tabsManager, tabsManager: injectedTabsManager };
}

function mountDynamicIframe(initialLink: string) {
  const host = document.createElement("div");
  document.body.append(host);

  const link = ref(initialLink);
  const loadEvents: Event[] = [];
  const app = createApp({
    setup() {
      return () => h(DynamicIframeComponent, { link: link.value, onLoad: (event: Event) => loadEvents.push(event) });
    },
  });

  app.mount(host);

  return { app, host, link, loadEvents };
}

describe("DynamicContainer iframe rendering", () => {
  it("uses the default empty component and lets render override it", async () => {
    const CustomEmpty = defineComponent({
      setup() {
        return () => h("div", "自定义空状态");
      },
    });

    const defaultEmpty = mountDynamicContainer();
    await flushTicks(2);

    expect(defaultEmpty.host.textContent).toContain("暂无打开的页面");

    defaultEmpty.app.unmount();
    defaultEmpty.host.remove();

    const customEmpty = mountDynamicContainer({ render: { noActiveComponent: CustomEmpty } });
    await flushTicks(2);

    expect(customEmpty.host.textContent).toContain("自定义空状态");

    customEmpty.app.unmount();
    customEmpty.host.remove();
  });

  it("uses the default not-found component and lets render override it", async () => {
    const CustomNotFound = defineComponent({
      setup() {
        return () => h("div", "自定义未找到");
      },
    });

    const defaultNotFound = mountDynamicContainer({ storage: { adapter: createMissingTabStorage(), enabled: true } });
    await flushTicks(2);

    expect(defaultNotFound.host.textContent).toContain("页面不存在");

    defaultNotFound.app.unmount();
    defaultNotFound.host.remove();

    const customNotFound = mountDynamicContainer({
      storage: { adapter: createMissingTabStorage(), enabled: true },
      render: { noExistComponent: CustomNotFound },
    });
    await flushTicks(2);

    expect(customNotFound.host.textContent).toContain("自定义未找到");

    customNotFound.app.unmount();
    customNotFound.host.remove();
  });

  it("uses the default error component and lets render override it", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const failingViewUrl = "/failing-view.vue";
    const FallbackError = defineComponent({
      setup() {
        return () => h("div", "自定义失败组件");
      },
    });

    try {
      const defaultError = mountDynamicContainer({
        views: {
          modules: {
            [failingViewUrl]: () => Promise.reject(new Error("load failed")),
          },
          source: { delay: 0, timeout: 1 },
        },
      });
      await defaultError.tabsManager.openTab(failingViewUrl, { _viewName: "失败页面" });
      await flushTicks(4);

      await expect.poll(() => defaultError.host.textContent).toContain("页面加载失败");

      defaultError.app.unmount();
      defaultError.host.remove();

      const customError = mountDynamicContainer({
        views: {
          modules: {
            [failingViewUrl]: () => Promise.reject(new Error("load failed")),
          },
          source: { delay: 0, timeout: 1 },
        },
        render: { errorComponent: FallbackError },
      });
      await customError.tabsManager.openTab(failingViewUrl, { _viewName: "失败页面" });
      await flushTicks(4);

      await expect.poll(() => customError.host.textContent).toContain("自定义失败组件");

      customError.app.unmount();
      customError.host.remove();
    } finally {
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });

  it("shows component loading immediately on first open", async () => {
    const pendingViewUrl = "/pending-view.vue";
    const { app, host, tabsManager } = mountDynamicContainer({
      views: {
        modules: {
          [pendingViewUrl]: () => new Promise(() => {}),
        },
      },
    });

    await tabsManager.openTab(pendingViewUrl, { _viewName: "加载中页面" });
    await flushTicks(2);

    expect(host.textContent).toContain("加载中...");

    app.unmount();
    host.remove();
  });

  it("keeps same-document iframe hash updates out of the loading state while emitting load", async () => {
    const { app, host, link, loadEvents } = mountDynamicIframe("/iframe-test.html#overview");
    await flushTicks(2);

    const iframe = host.querySelector("iframe");
    expect(iframe).toBeInstanceOf(HTMLIFrameElement);
    expect(host.querySelector(".dynamic-iframe-loading")?.textContent).toBe("加载中...");

    iframe!.dispatchEvent(new Event("load"));
    await flushTicks(2);

    expect(loadEvents).toHaveLength(1);
    expect(host.querySelector(".dynamic-iframe-loading")).toBeNull();

    link.value = "/iframe-test.html#detail";
    await flushTicks(3);

    expect(loadEvents).toHaveLength(2);
    expect(host.querySelector(".dynamic-iframe-loading")).toBeNull();

    app.unmount();
    host.remove();
  });

  it("uses render loading as the iframe default and lets iframe override it", async () => {
    const RenderLoading = defineComponent({
      setup() {
        return () => h("div", "统一加载中");
      },
    });
    const IframeLoading = defineComponent({
      setup() {
        return () => h("div", "Iframe 加载中");
      },
    });

    const renderDefault = mountDynamicContainer({ render: { loadingComponent: RenderLoading } });
    await renderDefault.tabsManager.openTab(iframeViewUrl, { _viewName: "Iframe 测试" });
    await flushTicks(2);

    expect(renderDefault.host.querySelector(".dynamic-iframe-loading")?.textContent).toBe("统一加载中");

    renderDefault.app.unmount();
    renderDefault.host.remove();

    const iframeOverride = mountDynamicContainer({
      render: { loadingComponent: RenderLoading },
      iframe: { loadingComponent: IframeLoading },
    });
    await iframeOverride.tabsManager.openTab(iframeViewUrl, { _viewName: "Iframe 测试" });
    await flushTicks(2);

    expect(iframeOverride.host.querySelector(".dynamic-iframe-loading")?.textContent).toBe("Iframe 加载中");

    iframeOverride.app.unmount();
    iframeOverride.host.remove();
  });

  it("allows component views to scroll while keeping the iframe layer clipped", async () => {
    const { app, host, tabsManager } = mountDynamicContainer();

    await tabsManager.openTab(iframeViewUrl, { _viewName: "Iframe 测试" });
    await flushTicks(2);

    expect(host.querySelector<HTMLElement>(".dynamic-container__view-layer")?.style.overflow).toBe("auto");
    expect(host.querySelector<HTMLElement>(".dynamic-container__iframe-layer")?.style.overflow).toBe("hidden");

    app.unmount();
    host.remove();
  });

  it("restores component view scroll position when switching cached tabs", async () => {
    const firstViewUrl = "/long-view.vue";
    const secondViewUrl = "/other-view.vue";
    const { app, host, tabsManager } = mountDynamicContainer({
      views: {
        modules: {
          [firstViewUrl]: () => Promise.resolve(LongScrollView),
          [secondViewUrl]: () => Promise.resolve(OtherView),
        },
      },
    });

    const firstTabId = await tabsManager.openTab(firstViewUrl, { _viewName: "长页面" });
    await flushTicks(4);

    const viewLayer = host.querySelector<HTMLElement>(".dynamic-container__view-layer");
    expect(viewLayer).toBeInstanceOf(HTMLElement);
    const innerScroll = host.querySelector<HTMLElement>(".inner-scroll");
    expect(innerScroll).toBeInstanceOf(HTMLElement);

    viewLayer!.scrollTop = 480;
    innerScroll!.scrollTop = 260;

    await tabsManager.openTab(secondViewUrl, { _viewName: "其他页面" });
    await flushTicks(4);

    expect(viewLayer!.scrollTop).toBe(0);

    await tabsManager.changeActiveTab(firstTabId);
    await flushTicks(4);

    expect(viewLayer!.scrollTop).toBe(480);
    expect(host.querySelector<HTMLElement>(".inner-scroll")?.scrollTop).toBe(260);

    app.unmount();
    host.remove();
  });

  it("does not restore component view scroll position for non-cached tabs", async () => {
    const firstViewUrl = "/no-cache-long-view.vue";
    const secondViewUrl = "/no-cache-other-view.vue";
    const { app, host, tabsManager } = mountDynamicContainer({
      views: {
        modules: {
          [firstViewUrl]: () => Promise.resolve(LongScrollView),
          [secondViewUrl]: () => Promise.resolve(OtherView),
        },
      },
    });

    const firstTabId = await tabsManager.openTab(firstViewUrl, { _viewName: "不缓存长页面", _viewNoCache: true });
    await flushTicks(4);

    const viewLayer = host.querySelector<HTMLElement>(".dynamic-container__view-layer");
    expect(viewLayer).toBeInstanceOf(HTMLElement);
    const innerScroll = host.querySelector<HTMLElement>(".inner-scroll");
    expect(innerScroll).toBeInstanceOf(HTMLElement);

    viewLayer!.scrollTop = 480;
    innerScroll!.scrollTop = 260;

    await tabsManager.openTab(secondViewUrl, { _viewName: "其他页面" });
    await flushTicks(4);

    await tabsManager.changeActiveTab(firstTabId);
    await flushTicks(4);

    expect(viewLayer!.scrollTop).toBe(0);
    expect(host.querySelector<HTMLElement>(".inner-scroll")?.scrollTop).toBe(0);

    app.unmount();
    host.remove();
  });

  it("rebuilds cached iframe tabs when the manager refreshes them", async () => {
    const { app, host, tabsManager } = mountDynamicContainer();

    const tabId = await tabsManager.openTab(iframeViewUrl, { _viewName: "Iframe 测试" });
    await flushTicks(2);

    const firstIframe = host.querySelector("iframe");
    expect(firstIframe).toBeInstanceOf(HTMLIFrameElement);
    expect(tabsManager.postIframeMessage(tabId, { type: "ping" })).toBe(true);

    await tabsManager.refreshTab(tabId);
    await flushTicks(3);

    const refreshedIframe = host.querySelector("iframe");
    expect(refreshedIframe).toBeInstanceOf(HTMLIFrameElement);
    expect(refreshedIframe).not.toBe(firstIframe);
    expect(tabsManager.postIframeMessage(tabId, { type: "ping" })).toBe(true);

    app.unmount();
    host.remove();
  });

  it("removes cached iframe tabs and messenger refs when the manager closes them", async () => {
    const { app, host, tabsManager } = mountDynamicContainer();

    const tabId = await tabsManager.openTab(iframeViewUrl, { _viewName: "Iframe 测试" });
    await flushTicks(2);

    expect(host.querySelector("iframe")).toBeInstanceOf(HTMLIFrameElement);
    expect(tabsManager.postIframeMessage(tabId, { type: "ping" })).toBe(true);

    await tabsManager.closeTab(tabId);
    await flushTicks(2);

    expect(host.querySelector("iframe")).toBeNull();
    expect(tabsManager.getTabById(tabId)).toBeUndefined();
    expect(tabsManager.postIframeMessage(tabId, { type: "ping" })).toBe(false);

    app.unmount();
    host.remove();
  });

  it("updates the rendered iframe layer when the root manager instance closes a tab", async () => {
    const { app, host, rootTabsManager, tabsManager } = mountDynamicContainer();

    const tabId = await rootTabsManager.openTab(iframeViewUrl, { _viewName: "Iframe 测试" });
    await flushTicks(2);

    expect(host.querySelector("iframe")).toBeInstanceOf(HTMLIFrameElement);
    expect(tabsManager.getTabById(tabId)).toBeDefined();

    await rootTabsManager.closeTab(tabId);
    await flushTicks(2);

    expect(host.querySelector("iframe")).toBeNull();
    expect(tabsManager.getTabById(tabId)).toBeUndefined();

    app.unmount();
    host.remove();
  });

  it("handles iframe tab client requests without global message branching", async () => {
    const globalMessageHandler = vi.fn();
    const { app, host, tabsManager } = mountDynamicContainer({ iframe: { onMessage: globalMessageHandler } });

    const tabId = await tabsManager.openTab(iframeViewUrl, { _viewName: "Iframe 测试" });
    await flushTicks(2);

    const iframe = host.querySelector("iframe");
    expect(iframe?.contentWindow).toBeDefined();
    const postMessageSpy = vi.spyOn(iframe!.contentWindow!, "postMessage");

    window.dispatchEvent(
      new MessageEvent("message", {
        data: createIframeTabClientRequest("update-title", "tab:update", { options: { _viewName: "Iframe 内更新" } }),
        origin: window.location.origin,
        source: iframe!.contentWindow,
      })
    );
    await flushTicks(3);

    expect(tabsManager.getTabById(tabId)?.viewName).toBe("Iframe 内更新");
    expect(host.querySelector("iframe")).toBe(iframe);
    expect(globalMessageHandler).not.toHaveBeenCalled();
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: "update-title", ok: true }),
      window.location.origin
    );

    window.dispatchEvent(
      new MessageEvent("message", {
        data: createIframeTabClientRequest("open-child", "tab:open", {
          viewUrl: TabViewUrl.createRelative("/iframe-child.html"),
          options: { _viewName: "Iframe 内打开" },
        }),
        origin: window.location.origin,
        source: iframe!.contentWindow,
      })
    );
    await expect.poll(() => tabsManager.tabs.map(tab => tab.viewName)).toContain("Iframe 内打开");

    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: "open-child", ok: true, data: expect.any(String) }),
      window.location.origin
    );

    postMessageSpy.mockRestore();
    app.unmount();
    host.remove();
  });
});

describe("Iframe tab client", () => {
  it("ignores responses from unexpected windows or origins", async () => {
    const parentWindow = { postMessage: vi.fn() } as unknown as Window;
    const attackerWindow = { postMessage: vi.fn() } as unknown as Window;
    const client = createIframeTabClient({ currentWindow: window, parentWindow, targetOrigin: window.location.origin });

    const requestPromise = client.getTab();
    const sentRequest = (parentWindow.postMessage as ReturnType<typeof vi.fn>).mock.calls[0][0] as ReturnType<
      typeof createIframeTabClientRequest
    >;

    window.dispatchEvent(
      new MessageEvent("message", {
        data: createIframeTabClientResponse(sentRequest, true, { _id: "attacker-tab" }),
        origin: window.location.origin,
        source: attackerWindow,
      })
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        data: createIframeTabClientResponse(sentRequest, true, { _id: "wrong-origin-tab" }),
        origin: "https://attacker.example.com",
        source: parentWindow,
      })
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        data: createIframeTabClientResponse(sentRequest, true, { _id: "safe-tab" }),
        origin: window.location.origin,
        source: parentWindow,
      })
    );

    await expect(requestPromise).resolves.toEqual({ _id: "safe-tab" });

    client.dispose();
  });
});
