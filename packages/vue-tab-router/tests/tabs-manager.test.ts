import { describe, expect, it } from "vitest";
import { AbstractStorageAdapter } from "../src/abstract-storage-adapter";
import { createTabsManager } from "../src/use-tabs-manager";
import { stableStringify, TabViewUrl } from "../src/utils";

class CountingStorageAdapter extends AbstractStorageAdapter {
  private readonly data = new Map<string, unknown>();
  public setCount = 0;

  get<T = unknown>(key: string, def?: T): T {
    return (this.data.has(key) ? this.data.get(key) : def) as T;
  }

  set<T = unknown>(key: string, val: T): this {
    this.setCount++;
    this.data.set(key, val);
    return this;
  }

  del(key: string): this {
    this.data.delete(key);
    return this;
  }
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

function createMetaTabsManager() {
  const viewUrl = TabViewUrl.createRelative("/practice");
  return createTabsManager({
    views: {
      modules: {},
      meta: [
        {
          title: "项目实践",
          icon: "IconApps",
          viewUrl,
          props: {
            _viewSingle: true,
            source: "view-meta",
          },
        },
      ],
    },
    storage: {
      enabled: false,
    },
  });
}

describe("TabsManager pinned tabs", () => {
  it("keeps pinned tabs after the first tab and before normal tabs when updated", async () => {
    const tabsManager = createTestTabsManager();
    await tabsManager.openFirstTab(TabViewUrl.createRelative("/home"), { _viewName: "首页" });
    const normalTabId = await tabsManager.openTab(TabViewUrl.createRelative("/normal"), { _viewName: "普通标签" });
    const pinnedTabId = await tabsManager.openTab(TabViewUrl.createRelative("/pinned"), { _viewName: "置顶标签" });

    await tabsManager.updateTabOptions({ _viewPinned: true }, pinnedTabId);

    expect(tabsManager.tabs.map(tab => tab.viewName)).toEqual(["首页", "置顶标签", "普通标签"]);
    expect(tabsManager.getTabById(pinnedTabId)?._pinned).toBe(true);

    await tabsManager.updateTabOptions({ _viewPinned: false }, pinnedTabId);

    expect(tabsManager.tabs.map(tab => tab.viewName)).toEqual(["首页", "置顶标签", "普通标签"]);
    expect(tabsManager.getTabById(pinnedTabId)?._pinned).toBe(false);
    expect(tabsManager.getTabById(normalTabId)?._pinned).toBeUndefined();
  });
});

describe("TabsManager runtime safety", () => {
  it("uses a safe default storage outside browser environments", async () => {
    const tabsManager = createTabsManager({
      views: {
        modules: {},
      },
    });

    await tabsManager.openTab(TabViewUrl.createRelative("/home"), { _viewName: "首页" });

    expect(tabsManager.activeTab?.viewName).toBe("首页");
  });

  it("returns null for outside links when window is unavailable", async () => {
    const tabsManager = createTestTabsManager();

    await expect(tabsManager.openTab("https://example.com", { _viewOutside: true })).resolves.toBeNull();
  });

  it("stableStringify handles circular references", () => {
    const value: Record<string, unknown> = { name: "tab" };
    value.self = value;

    expect(stableStringify(value)).toBe('{"name":"tab","self":"[Circular]"}');
  });

  it("defers storage writes during batch close operations", async () => {
    const storageAdapter = new CountingStorageAdapter();
    const tabsManager = createTabsManager({
      views: {
        modules: {},
      },
      storage: {
        adapter: storageAdapter,
      },
    });

    await tabsManager.openTab(TabViewUrl.createRelative("/one"), { _viewName: "一" });
    await tabsManager.openTab(TabViewUrl.createRelative("/two"), { _viewName: "二" });
    await tabsManager.openTab(TabViewUrl.createRelative("/three"), { _viewName: "三" });
    storageAdapter.setCount = 0;

    await tabsManager.closeTabByAll();

    expect(tabsManager.tabs).toHaveLength(0);
    expect(storageAdapter.setCount).toBe(1);
  });

  it("awaits tabs:cleared hooks", async () => {
    const tabsManager = createTestTabsManager();
    const calls: string[] = [];

    tabsManager.hooks.on("tabs:cleared", async () => {
      await Promise.resolve();
      calls.push("cleared");
    });

    await tabsManager.clear();

    expect(calls).toEqual(["cleared"]);
  });
});

describe("TabsManager view meta", () => {
  it("uses view meta as default openTab options when explicit options are missing", async () => {
    const tabsManager = createMetaTabsManager();

    await tabsManager.openTab(TabViewUrl.createRelative("/practice"));

    expect(tabsManager.activeTab?.viewName).toBe("项目实践");
    expect(tabsManager.activeTab?.viewIcon).toBe("IconApps");
    expect(tabsManager.activeTab?._single).toBe(true);
    expect(tabsManager.activeTab?.viewProps).toEqual({ source: "view-meta" });
  });

  it("lets explicit openTab options override view meta defaults", async () => {
    const tabsManager = createMetaTabsManager();

    await tabsManager.openTab(TabViewUrl.createRelative("/practice"), {
      _viewName: "自定义标题",
      source: "manual",
    });

    expect(tabsManager.activeTab?.viewName).toBe("自定义标题");
    expect(tabsManager.activeTab?.viewIcon).toBe("IconApps");
    expect(tabsManager.activeTab?.viewProps).toEqual({ source: "manual" });
  });
});
