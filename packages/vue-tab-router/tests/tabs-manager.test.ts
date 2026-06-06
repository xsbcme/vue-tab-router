import { describe, expect, it } from "vitest";
import { createTabsManager } from "../src/use-tabs-manager";
import { TabViewUrl } from "../src/utils";

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
