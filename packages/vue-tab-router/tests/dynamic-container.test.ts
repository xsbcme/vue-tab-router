// @vitest-environment jsdom

import { createApp, defineComponent, h, nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";
import DynamicIframeComponent from "../src/components/dynamic-iframe.vue";
import DynamicContainerComponent from "../src/components/dynamic-container";
import { AbstractStorageAdapter } from "../src/storage";
import { createIframeTabClient } from "../src/iframe-client";
import { createIframeTabClientRequest, createIframeTabClientResponse } from "../src/iframe-client";
import { createTabsManager, useTabsManager } from "../src/composables";
import { defineIframeOptions } from "../src/composables";
import { TabViewUrl } from "../src/shared";
import type { TabsManager } from "../src/tabs";
import type { TabsManagerOptions } from "../src/types";

const iframeViewUrl = TabViewUrl.createRelative("/iframe-test.html");
const iframeControllerViewUrl = "/iframe-controller.vue";
const iframeControllerSrc = "/iframe-controller.html";
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

const IframeControllerView = defineComponent({
  setup() {
    const tabsManager = useTabsManager();
    defineIframeOptions({
      src: iframeControllerSrc,
      styles: "body { margin: 0; color: rgb(22, 93, 255); }",
      onLoad: ({ tab }) => {
        tabsManager.updateTabOptions({ controllerLoaded: tab.viewName }, tab._id);
      },
      onMessage: async ({ data, reply }) => {
        if ((data as { type?: string })?.type === "controller:open") {
          const viewUrl = (data as { viewUrl?: string }).viewUrl;
          if (viewUrl) await tabsManager.openTab(viewUrl, { _viewName: "controller 打开" });
          reply({ type: "controller:done" });
        }
      },
    });

    return () => h("div", "控制组件不直接展示");
  },
});

const BlockingIframeControllerView = defineComponent({
  setup() {
    defineIframeOptions({
      src: iframeControllerSrc,
      onMessage: message => {
        if ((message.data as { type?: string })?.type === "controller:block-global") return false;
      },
    });

    return () => null;
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
  it("使用默认空状态组件，并允许 render 配置覆盖", async () => {
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

  it("没有 iframe 或 controller 内容时不渲染空层", async () => {
    const { app, host } = mountDynamicContainer();
    await flushTicks(2);

    expect(host.querySelector(".dynamic-container__iframe-layer")).toBeNull();
    expect(host.querySelector(".dynamic-container__controller-layer")).toBeNull();

    app.unmount();
    host.remove();
  });

  it("使用默认未找到组件，并允许 render 配置覆盖", async () => {
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

  it("普通组件页不渲染 iframe 和 controller 空层", async () => {
    const viewUrl = "/normal-view.vue";
    const { app, host, tabsManager } = mountDynamicContainer({
      views: {
        modules: {
          [viewUrl]: OtherView,
        },
      },
    });

    await tabsManager.openTab(viewUrl, { _viewName: "普通页面" });
    await flushTicks(3);

    expect(host.querySelector(".dynamic-container__iframe-layer")).toBeNull();
    expect(host.querySelector(".dynamic-container__controller-layer")).toBeNull();

    app.unmount();
    host.remove();
  });

  it("使用默认错误组件，并允许 render 配置覆盖", async () => {
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

  it("首次打开异步组件时立即显示加载状态", async () => {
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

  it("同文档 iframe hash 变化不会进入加载状态，但会触发 load", async () => {
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

  it("iframe 默认使用 render loading，并允许 iframe 配置覆盖", async () => {
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

  it("组件视图允许滚动，同时保持 iframe 层裁剪", async () => {
    const { app, host, tabsManager } = mountDynamicContainer();

    await tabsManager.openTab(iframeViewUrl, { _viewName: "Iframe 测试" });
    await flushTicks(2);

    expect(host.querySelector<HTMLElement>(".dynamic-container__view-layer")?.style.overflow).toBe("auto");
    expect(host.querySelector<HTMLElement>(".dynamic-container__iframe-layer")?.style.overflow).toBe("hidden");

    app.unmount();
    host.remove();
  });

  it("切换缓存组件 tab 时恢复滚动位置", async () => {
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

  it("非缓存组件 tab 不恢复滚动位置", async () => {
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

  it("管理器刷新 iframe tab 时重建缓存 iframe", async () => {
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

  it("关闭 iframe tab 时移除缓存 iframe 和消息引用", async () => {
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

  it("根管理器关闭 tab 时同步更新 iframe 渲染层", async () => {
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

  it("处理 iframe tab client 请求时不进入全局消息分支", async () => {
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

  it("iframe controller 会隐藏挂载控制组件，并使用局部 src、样式和回调", async () => {
    const globalLoadHandler = vi.fn();
    const globalMessageHandler = vi.fn();
    const { app, host, tabsManager } = mountDynamicContainer({
      views: {
        modules: {
          [iframeControllerViewUrl]: IframeControllerView,
        },
      },
      iframe: {
        onLoad: globalLoadHandler,
        onMessage: globalMessageHandler,
      },
    });

    const tabId = await tabsManager.openTab(
      TabViewUrl.createIframeController(iframeControllerViewUrl, "/fallback.html"),
      { _viewName: "Iframe 控制器" }
    );
    await flushTicks(4);

    const iframe = host.querySelector<HTMLIFrameElement>("iframe");
    expect(iframe).toBeInstanceOf(HTMLIFrameElement);
    expect(iframe?.getAttribute("src")).toBe(iframeControllerSrc);
    expect(host.querySelector(".dynamic-container__iframe-item")?.firstElementChild?.className).toBe("dynamic-iframe");
    expect(host.querySelector<HTMLElement>(".dynamic-container__controller-layer")?.style.display).toBe("none");

    iframe!.dispatchEvent(new Event("load"));
    await flushTicks(3);

    expect(tabsManager.getTabById(tabId)?.viewProps?.controllerLoaded).toBe("Iframe 控制器");
    expect(globalLoadHandler).toHaveBeenCalled();

    await expect.poll(() => host.querySelector<HTMLIFrameElement>("iframe")?.contentWindow).toBeDefined();
    const currentIframe = host.querySelector<HTMLIFrameElement>("iframe");
    expect(currentIframe?.contentWindow).toBeDefined();

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "controller:open", viewUrl: TabViewUrl.createRelative("/controller-child.html") },
        origin: window.location.origin,
        source: currentIframe!.contentWindow,
      })
    );
    await expect.poll(() => tabsManager.tabs.map(tab => tab.viewName)).toContain("controller 打开");

    expect(globalMessageHandler).toHaveBeenCalled();

    app.unmount();
    host.remove();
  });

  it("iframe controller 可以把内嵌 relative src 解析为真实 iframe 地址", async () => {
    const { app, host, tabsManager } = mountDynamicContainer({
      views: {
        modules: {
          [iframeControllerViewUrl]: defineComponent({
            setup() {
              defineIframeOptions({});
              return () => null;
            },
          }),
        },
      },
    });

    await tabsManager.openTab(
      TabViewUrl.createIframeController(iframeControllerViewUrl, TabViewUrl.createRelative("./iframe-tests/message.html")),
      { _viewName: "Iframe 控制器" }
    );
    await flushTicks(4);

    expect(host.querySelector<HTMLIFrameElement>("iframe")?.getAttribute("src")).toBe("./iframe-tests/message.html");

    app.unmount();
    host.remove();
  });

  it("iframe controller onMessage 返回 false 时阻止全局 iframe onMessage", async () => {
    const globalMessageHandler = vi.fn();
    const { app, host, tabsManager } = mountDynamicContainer({
      views: {
        modules: {
          [iframeControllerViewUrl]: BlockingIframeControllerView,
        },
      },
      iframe: {
        onMessage: globalMessageHandler,
      },
    });

    await tabsManager.openTab(TabViewUrl.createIframeController(iframeControllerViewUrl, iframeControllerSrc), {
      _viewName: "Iframe 控制器",
    });
    await flushTicks(4);

    await expect.poll(() => host.querySelector<HTMLIFrameElement>("iframe")?.contentWindow).toBeDefined();
    const iframe = host.querySelector<HTMLIFrameElement>("iframe");
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "controller:block-global" },
        origin: window.location.origin,
        source: iframe!.contentWindow,
      })
    );
    await flushTicks(3);

    expect(globalMessageHandler).not.toHaveBeenCalled();

    app.unmount();
    host.remove();
  });

  it("iframe controller 可以配置局部消息来源", async () => {
    const controllerMessageHandler = vi.fn();
    const { app, host, tabsManager } = mountDynamicContainer({
      views: {
        modules: {
          [iframeControllerViewUrl]: defineComponent({
            setup() {
              defineIframeOptions({
                src: iframeControllerSrc,
                messageOrigins: ["https://iframe.example.com"],
                onMessage: controllerMessageHandler,
              });
              return () => null;
            },
          }),
        },
      },
    });

    await tabsManager.openTab(TabViewUrl.createIframeController(iframeControllerViewUrl, iframeControllerSrc), {
      _viewName: "Iframe 控制器",
    });
    await flushTicks(4);

    const iframe = host.querySelector<HTMLIFrameElement>("iframe");
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "controller:allowed-origin" },
        origin: "https://iframe.example.com",
        source: iframe!.contentWindow,
      })
    );
    await flushTicks(3);

    expect(controllerMessageHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { type: "controller:allowed-origin" },
        origin: "https://iframe.example.com",
      })
    );

    app.unmount();
    host.remove();
  });

  it("iframe controller 未配置局部消息来源时仍使用全局来源校验", async () => {
    const controllerMessageHandler = vi.fn();
    const { app, host, tabsManager } = mountDynamicContainer({
      views: {
        modules: {
          [iframeControllerViewUrl]: defineComponent({
            setup() {
              defineIframeOptions({
                src: iframeControllerSrc,
                onMessage: controllerMessageHandler,
              });
              return () => null;
            },
          }),
        },
      },
    });

    await tabsManager.openTab(TabViewUrl.createIframeController(iframeControllerViewUrl, iframeControllerSrc), {
      _viewName: "Iframe 控制器",
    });
    await flushTicks(4);

    const iframe = host.querySelector<HTMLIFrameElement>("iframe");
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "controller:blocked-origin" },
        origin: "https://iframe.example.com",
        source: iframe!.contentWindow,
      })
    );
    await flushTicks(3);

    expect(controllerMessageHandler).not.toHaveBeenCalled();

    app.unmount();
    host.remove();
  });

  it("更新 iframe controller 配置时不会重建 iframe 节点", async () => {
    const { app, host, tabsManager } = mountDynamicContainer({
      views: {
        modules: {
          [iframeControllerViewUrl]: defineComponent({
            setup() {
              const tabs = useTabsManager();
              defineIframeOptions({
                src: iframeControllerSrc,
                onMessage: async message => {
                  if ((message.data as { type?: string })?.type === "controller:update-src") {
                    tabs.updateTabOptions({ controllerFlag: Date.now() }, message.tabId);
                  }
                },
              });
              return () => null;
            },
          }),
        },
      },
    });

    const tabId = await tabsManager.openTab(TabViewUrl.createIframeController(iframeControllerViewUrl, "about:blank"), {
      _viewName: "Iframe 控制器",
    });
    await flushTicks(4);

    const firstIframe = host.querySelector("iframe");
    expect(firstIframe).toBeInstanceOf(HTMLIFrameElement);

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "controller:update-src" },
        origin: window.location.origin,
        source: firstIframe!.contentWindow,
      })
    );
    await flushTicks(4);

    expect(host.querySelector("iframe")).toBe(firstIframe);
    expect(tabsManager.getTabById(tabId)?.viewProps?.controllerFlag).toBeTypeOf("number");

    app.unmount();
    host.remove();
  });

  it("iframe controller 配置更新 src 时不会重建 iframe 节点", async () => {
    const { app, host, tabsManager } = mountDynamicContainer({
      views: {
        modules: {
          [iframeControllerViewUrl]: defineComponent({
            setup() {
              return () => null;
            },
          }),
        },
      },
    });

    const tabId = await tabsManager.openTab(
      TabViewUrl.createIframeController(iframeControllerViewUrl, "/fallback.html"),
      { _viewName: "Iframe 控制器" }
    );
    await flushTicks(4);

    const firstIframe = host.querySelector<HTMLIFrameElement>("iframe");
    expect(firstIframe).toBeInstanceOf(HTMLIFrameElement);
    expect(firstIframe?.getAttribute("src")).toBe("/fallback.html");

    firstIframe!.dispatchEvent(new Event("load"));
    await flushTicks(2);

    tabsManager._setIframeControllerOptions(tabId, {
      src: iframeControllerSrc,
    });
    await flushTicks(4);

    expect(host.querySelector("iframe")).toBe(firstIframe);
    expect(firstIframe?.getAttribute("src")).toBe(iframeControllerSrc);

    app.unmount();
    host.remove();
  });

  it("iframe controller 样式晚注册时会补注入已加载 iframe", async () => {
    const { app, host, tabsManager } = mountDynamicContainer({
      views: {
        modules: {
          [iframeControllerViewUrl]: defineComponent({
            setup() {
              return () => null;
            },
          }),
        },
      },
    });

    const tabId = await tabsManager.openTab(TabViewUrl.createIframeController(iframeControllerViewUrl, iframeControllerSrc), {
      _viewName: "Iframe 控制器",
    });
    await flushTicks(4);

    const firstIframe = host.querySelector<HTMLIFrameElement>("iframe");
    expect(firstIframe).toBeInstanceOf(HTMLIFrameElement);
    firstIframe!.dispatchEvent(new Event("load"));
    await flushTicks(2);

    tabsManager._setIframeControllerOptions(tabId, {
      src: "about:blank",
      styles: "body { margin: 0; color: rgb(22, 93, 255); }",
    });
    await flushTicks(4);

    expect(host.querySelector("iframe")).toBe(firstIframe);
    expect(firstIframe?.contentDocument?.head.querySelector("style[data-tab-router-iframe-controller]")?.textContent).toBe(
      "body { margin: 0; color: rgb(22, 93, 255); }"
    );

    app.unmount();
    host.remove();
  });

  it("切回缓存的 iframe controller tab 时保留局部配置和消息处理", async () => {
    const otherViewUrl = "/other-view.vue";
    const controllerStyles = "body { margin: 0; color: rgb(22, 93, 255); }";
    const controllerMessageHandler = vi.fn(() => false);
    const globalMessageHandler = vi.fn();
    const { app, host, tabsManager } = mountDynamicContainer({
      views: {
        modules: {
          [iframeControllerViewUrl]: defineComponent({
            setup() {
              defineIframeOptions({
                src: "about:blank",
                styles: controllerStyles,
                onMessage: controllerMessageHandler,
              });
              return () => null;
            },
          }),
          [otherViewUrl]: OtherView,
        },
      },
      iframe: {
        onMessage: globalMessageHandler,
      },
    });

    const controllerTabId = await tabsManager.openTab(TabViewUrl.createIframeController(iframeControllerViewUrl, "about:blank"), {
      _viewName: "Iframe 控制器",
    });
    await flushTicks(4);

    const iframe = host.querySelector<HTMLIFrameElement>("iframe");
    expect(iframe).toBeInstanceOf(HTMLIFrameElement);
    iframe!.dispatchEvent(new Event("load"));
    await flushTicks(2);
    expect(iframe?.contentDocument?.head.querySelector("style[data-tab-router-iframe-controller]")?.textContent).toBe(
      controllerStyles
    );

    await tabsManager.openTab(otherViewUrl, { _viewName: "其他页面" });
    await flushTicks(2);
    expect(tabsManager._getIframeControllerOptions(controllerTabId)?.styles).toBe(controllerStyles);
    await tabsManager.changeActiveTab(controllerTabId);
    await flushTicks(4);
    expect(tabsManager._getIframeControllerOptions(controllerTabId)?.styles).toBe(controllerStyles);

    expect(host.querySelector("iframe")).toBe(iframe);
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "controller:after-active" },
        origin: window.location.origin,
        source: iframe!.contentWindow,
      })
    );
    await flushTicks(3);

    expect(controllerMessageHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { type: "controller:after-active" },
        tabId: controllerTabId,
      })
    );
    expect(globalMessageHandler).not.toHaveBeenCalled();

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
