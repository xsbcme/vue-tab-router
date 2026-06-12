// @vitest-environment jsdom

import { createApp, h, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import DynamicContainerComponent from "../src/components/dynamic-container";
import { createTabsManager, useTabsManager } from "../src/use-tabs-manager";
import { TabViewUrl } from "../src/utils";
import type { TabsManager } from "../src/tabs-manager";

const iframeViewUrl = TabViewUrl.createRelative("/iframe-test.html");

async function flushTicks(count = 1) {
  for (let index = 0; index < count; index++) {
    await nextTick();
  }
}

function mountDynamicContainer() {
  const host = document.createElement("div");
  document.body.append(host);

  const tabsManager = createTabsManager({
    views: {
      modules: {},
    },
    storage: {
      enabled: false,
    },
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

describe("DynamicContainer iframe rendering", () => {
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
});
