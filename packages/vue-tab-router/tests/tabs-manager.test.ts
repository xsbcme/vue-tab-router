import { describe, expect, it } from "vitest";
import { AbstractStorageAdapter } from "../src/storage";
import { createTabsManager } from "../src/composables";
import { stableStringify, TabViewUrl } from "../src/shared";

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

describe("TabsManager tab moving", () => {
  it("moves normal tabs inside the normal group and keeps the active tab active", async () => {
    const tabsManager = createTestTabsManager();
    await tabsManager.openFirstTab(TabViewUrl.createRelative("/home"), { _viewName: "首页" });
    const firstTabId = await tabsManager.openTab(TabViewUrl.createRelative("/one"), { _viewName: "一" });
    const secondTabId = await tabsManager.openTab(TabViewUrl.createRelative("/two"), { _viewName: "二" });
    const thirdTabId = await tabsManager.openTab(TabViewUrl.createRelative("/three"), { _viewName: "三" });

    await tabsManager.changeActiveTab(secondTabId);

    await expect(tabsManager.moveTab(thirdTabId, firstTabId, "before")).resolves.toBe(true);

    expect(tabsManager.tabs.map(tab => tab.viewName)).toEqual(["首页", "三", "一", "二"]);
    expect(tabsManager.activeTab?._id).toBe(secondTabId);
  });

  it("moves pinned tabs only inside the pinned group", async () => {
    const tabsManager = createTestTabsManager();
    await tabsManager.openFirstTab(TabViewUrl.createRelative("/home"), { _viewName: "首页" });
    const pinnedOneId = await tabsManager.openTab(TabViewUrl.createRelative("/pinned-one"), {
      _viewName: "置顶一",
      _viewPinned: true,
    });
    const pinnedTwoId = await tabsManager.openTab(TabViewUrl.createRelative("/pinned-two"), {
      _viewName: "置顶二",
      _viewPinned: true,
    });
    const normalId = await tabsManager.openTab(TabViewUrl.createRelative("/normal"), { _viewName: "普通" });

    await expect(tabsManager.moveTab(pinnedTwoId, pinnedOneId, "before")).resolves.toBe(true);
    await expect(tabsManager.moveTab(pinnedOneId, normalId, "after")).resolves.toBe(false);
    await expect(tabsManager.moveTab(normalId, pinnedOneId, "before")).resolves.toBe(false);

    expect(tabsManager.tabs.map(tab => tab.viewName)).toEqual(["首页", "置顶二", "置顶一", "普通"]);
  });

  it("rejects first tabs, no-drag tabs, and no-op adjacent moves", async () => {
    const tabsManager = createTestTabsManager();
    const homeTabId = await tabsManager.openFirstTab(TabViewUrl.createRelative("/home"), { _viewName: "首页" });
    const firstTabId = await tabsManager.openTab(TabViewUrl.createRelative("/one"), { _viewName: "一" });
    const secondTabId = await tabsManager.openTab(TabViewUrl.createRelative("/two"), { _viewName: "二" });
    const noDragTabId = await tabsManager.openTab(TabViewUrl.createRelative("/locked"), {
      _viewName: "禁拖",
      _viewNoDrag: true,
    });

    expect(tabsManager.canMoveTab(firstTabId, secondTabId, "before")).toBe(false);
    expect(tabsManager.canMoveTab(secondTabId, firstTabId, "after")).toBe(false);

    await expect(tabsManager.moveTab(homeTabId, firstTabId, "after")).resolves.toBe(false);
    await expect(tabsManager.moveTab(firstTabId, homeTabId, "before")).resolves.toBe(false);
    await expect(tabsManager.moveTab(noDragTabId, firstTabId, "before")).resolves.toBe(false);
    await expect(tabsManager.moveTab(firstTabId, noDragTabId, "before")).resolves.toBe(false);

    expect(tabsManager.tabs.map(tab => tab.viewName)).toEqual(["首页", "一", "二", "禁拖"]);
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

  it("supports window.open options through _viewOutside", async () => {
    const tabsManager = createTestTabsManager();

    await expect(
      tabsManager.openTab("https://example.com", {
        _viewOutside: { target: "_blank", features: "noopener,noreferrer" },
      })
    ).resolves.toBeNull();
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

  it("keeps non-closable tabs and redirects source links during batch close", async () => {
    const tabsManager = createTestTabsManager();
    const homeTabId = await tabsManager.openFirstTab(TabViewUrl.createRelative("/home"), { _viewName: "首页" });
    const parentTabId = await tabsManager.openTab(TabViewUrl.createRelative("/parent"), { _viewName: "父标签" });
    const childTabId = await tabsManager.openTab(TabViewUrl.createRelative("/child"), { _viewName: "子标签" });
    const grandChildTabId = await tabsManager.openTab(TabViewUrl.createRelative("/grand-child"), { _viewName: "孙标签" });

    await tabsManager.closeTabsByOther(grandChildTabId);

    expect(tabsManager.tabs.map(tab => tab._id)).toEqual([homeTabId, grandChildTabId]);
    expect(tabsManager.getTabById(grandChildTabId)?._sourceId).toBe(homeTabId);
    expect(tabsManager.getTabById(homeTabId)?._noClose).toBe(true);
    expect(tabsManager.getTabById(parentTabId)).toBeUndefined();
    expect(tabsManager.getTabById(childTabId)).toBeUndefined();
  });

  it("runs tab:closed hooks for each tab after a batch close", async () => {
    const tabsManager = createTestTabsManager();
    await tabsManager.openTab(TabViewUrl.createRelative("/one"), { _viewName: "一" });
    await tabsManager.openTab(TabViewUrl.createRelative("/two"), { _viewName: "二" });
    await tabsManager.openTab(TabViewUrl.createRelative("/three"), { _viewName: "三" });
    const closedTabs: string[] = [];

    tabsManager.hooks.on("tab:closed", tab => {
      if (tab.viewName) closedTabs.push(tab.viewName);
    });

    await tabsManager.closeTabByAll();

    expect(closedTabs).toEqual(["一", "二", "三"]);
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

  it("closes detached view only when its owner tab is closed", async () => {
    const tabsManager = createTestTabsManager();
    const ownerTabId = await tabsManager.openTab(TabViewUrl.createRelative("/owner"), { _viewName: "宿主页" });
    const otherTabId = await tabsManager.openTab(TabViewUrl.createRelative("/other"), { _viewName: "其他页" });

    await tabsManager.openDetachedTab(ownerTabId);
    expect(tabsManager.detachedTab?.viewName).toBe("宿主页");

    await tabsManager.closeTab(otherTabId);
    expect(tabsManager.detachedTab?.viewName).toBe("宿主页");

    await tabsManager.closeTab(ownerTabId);
    expect(tabsManager.detachedTab).toBeNull();
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
