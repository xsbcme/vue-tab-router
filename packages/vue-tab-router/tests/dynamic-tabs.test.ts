// @vitest-environment jsdom

import { createApp, h, nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DynamicTabsComponent from "../src/components/dynamic-tabs/index.vue";
import { createTabsManager, useTabsManager } from "../src/composables";
import type { TabsManager } from "../src/tabs";
import type { TabsManagerRenderOptions, TabsVirtualOptions } from "../src/types";

const moduleComponent = { render: () => null };

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function mockPointerMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query === "(pointer: coarse)" ? matches : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  );
}

function defineDimension(element: Element, key: "clientWidth" | "scrollWidth" | "offsetWidth", value: number) {
  Object.defineProperty(element, key, {
    configurable: true,
    get: () => value,
  });
}

interface DynamicTabsTestProps {
  showIcon?: boolean;
  titleMaxLength?: number;
  draggable?: boolean;
  virtual?: TabsVirtualOptions;
}

function mountDynamicTabs(tabCount: number, render?: TabsManagerRenderOptions, props: DynamicTabsTestProps = {}) {
  const host = document.createElement("div");
  document.body.append(host);

  const modules = Object.fromEntries(Array.from({ length: tabCount }, (_, index) => [`/tab-${index}`, moduleComponent]));
  const tabsManager = createTabsManager({
    views: {
      modules,
    },
    storage: {
      enabled: false,
    },
    render,
  });

  let injectedTabsManager!: TabsManager;
  const app = createApp({
    setup() {
      injectedTabsManager = useTabsManager();
      return () => h(DynamicTabsComponent, { showIcon: false, ...props });
    },
  });
  app.use(tabsManager);
  app.mount(host);
  return { app, host, tabsManager: injectedTabsManager };
}

async function openTabs(tabsManager: TabsManager, count: number) {
  let lastTabId = "";
  for (let index = 0; index < count; index++) {
    lastTabId = await tabsManager.openTab(`/tab-${index}`, { _viewName: `标签 ${index} - ${"内容".repeat((index % 6) + 1)}` });
  }
  await nextTick();
  return lastTabId;
}

function setupViewport(host: HTMLElement, width: number, scrollWidth: number) {
  const viewport = host.querySelector<HTMLElement>(".tabs-scroll__viewport");
  expect(viewport).toBeTruthy();
  defineDimension(viewport!, "clientWidth", width);
  defineDimension(viewport!, "scrollWidth", scrollWidth);
  return viewport!;
}

function applyVariableTabWidths(host: HTMLElement) {
  host.querySelectorAll<HTMLElement>(".tabs-nav__item").forEach((element, index) => {
    defineDimension(element, "offsetWidth", 90 + (index % 7) * 18);
  });
}

describe("DynamicTabsComponent virtual tabs", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    mockPointerMedia(false);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => window.setTimeout(() => callback(0), 0));
    vi.stubGlobal("cancelAnimationFrame", (handle: number) => window.clearTimeout(handle));
    HTMLElement.prototype.scrollTo = vi.fn(function (this: HTMLElement, options?: ScrollToOptions) {
      this.scrollLeft = Number(options?.left || 0);
      this.dispatchEvent(new Event("scroll"));
    });
    HTMLElement.prototype.scrollBy = vi.fn(function (this: HTMLElement, options?: ScrollToOptions) {
      this.scrollLeft += Number(options?.left || 0);
      this.dispatchEvent(new Event("scroll"));
    });
  });

  it("renders only the visible tab window for many variable-width tabs", async () => {
    const { app, host, tabsManager } = mountDynamicTabs(120);

    await openTabs(tabsManager, 120);
    const viewport = setupViewport(host, 360, 18000);
    applyVariableTabWidths(host);
    viewport.dispatchEvent(new Event("scroll"));

    await vi.waitFor(() => {
      const renderedTabs = host.querySelectorAll(".tabs-nav__item");
      expect(renderedTabs.length).toBeGreaterThan(0);
      expect(renderedTabs.length).toBeLessThan(120);
      expect(tabsManager.tabs).toHaveLength(120);
    });

    app.unmount();
    host.remove();
  });

  it("renders all tabs when global virtual tabs are disabled", async () => {
    const { app, host, tabsManager } = mountDynamicTabs(60, { tabs: { virtual: false } });

    await openTabs(tabsManager, 60);
    const viewport = setupViewport(host, 360, 9000);
    applyVariableTabWidths(host);
    viewport.dispatchEvent(new Event("scroll"));

    await vi.waitFor(() => {
      expect(host.querySelectorAll(".tabs-nav__item")).toHaveLength(60);
    });

    app.unmount();
    host.remove();
  });

  it("uses render.tabs virtual options", async () => {
    const { app, host, tabsManager } = mountDynamicTabs(60, {
      tabs: {
        virtual: { enabled: true, threshold: 1 },
      },
    });

    await openTabs(tabsManager, 60);
    const viewport = setupViewport(host, 360, 9000);
    applyVariableTabWidths(host);
    viewport.dispatchEvent(new Event("scroll"));

    await vi.waitFor(() => {
      const renderedTabs = host.querySelectorAll(".tabs-nav__item");
      expect(renderedTabs.length).toBeGreaterThan(0);
      expect(renderedTabs.length).toBeLessThan(60);
    });

    app.unmount();
    host.remove();
  });

  it("uses component virtual options before global options", async () => {
    const { app, host, tabsManager } = mountDynamicTabs(60, { tabs: { virtual: false } }, { virtual: { enabled: true, threshold: 1 } });

    await openTabs(tabsManager, 60);
    const viewport = setupViewport(host, 360, 9000);
    applyVariableTabWidths(host);
    viewport.dispatchEvent(new Event("scroll"));

    await vi.waitFor(() => {
      const renderedTabs = host.querySelectorAll(".tabs-nav__item");
      expect(renderedTabs.length).toBeGreaterThan(0);
      expect(renderedTabs.length).toBeLessThan(60);
    });

    app.unmount();
    host.remove();
  });

  it("uses render.tabs titleMaxLength for title truncation", async () => {
    const { app, host, tabsManager } = mountDynamicTabs(1, { tabs: { titleMaxLength: 8, virtual: false } });

    await tabsManager.openTab("/tab-0", { _viewName: "这是一个非常长的标签标题" });
    await nextTick();

    expect(host.querySelector(".truncated-text")?.textContent?.trim()).toBe("这是...标题");

    app.unmount();
    host.remove();
  });

  it("uses component titleMaxLength and draggable before global tab options", async () => {
    const { app, host, tabsManager } = mountDynamicTabs(
      1,
      { tabs: { titleMaxLength: 20, draggable: false, virtual: false } },
      { titleMaxLength: 8, draggable: true }
    );

    await tabsManager.openTab("/tab-0", { _viewName: "这是一个非常长的标签标题" });
    await nextTick();

    expect(host.querySelector(".truncated-text")?.textContent?.trim()).toBe("这是...标题");
    expect(host.querySelector(".tabs-nav__item")?.getAttribute("draggable")).toBe("true");

    app.unmount();
    host.remove();
  });

  it("disables native tab dragging on coarse pointer devices", async () => {
    mockPointerMedia(true);
    const { app, host, tabsManager } = mountDynamicTabs(1, { tabs: { virtual: false } }, { draggable: true });

    await tabsManager.openTab("/tab-0", { _viewName: "移动端标签" });
    await nextTick();

    expect(host.querySelector(".tabs-nav__item")?.getAttribute("draggable")).toBe("false");

    app.unmount();
    host.remove();
  });

  it("scrolls an off-screen active tab into view by estimated width", async () => {
    const { app, host, tabsManager } = mountDynamicTabs(80);

    const lastTabId = await openTabs(tabsManager, 80);
    const viewport = setupViewport(host, 320, 12000);
    applyVariableTabWidths(host);
    viewport.scrollLeft = 0;
    vi.mocked(HTMLElement.prototype.scrollTo).mockClear();

    await tabsManager.changeActiveTab(tabsManager.tabs[0]._id);
    await tabsManager.changeActiveTab(lastTabId);

    await vi.waitFor(() => {
      expect(HTMLElement.prototype.scrollTo).toHaveBeenCalled();
      expect(viewport.scrollLeft).toBeGreaterThan(0);
    });

    app.unmount();
    host.remove();
  });
});
