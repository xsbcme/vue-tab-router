// @vitest-environment jsdom

import { createApp, h, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { createTabsManager } from "../src/use-tabs-manager";
import type { Modules, TabViewMeta } from "../src/types";
import { useTabMenu } from "../src/use-tab-menu";
import { TabViewUrl } from "../src/utils";

type TestMenu = {
  id?: string;
  name: string;
  url?: string;
  props?: Record<string, unknown>;
  children?: TestMenu[];
};

const moduleComponent = { render: () => null };

const menus: TestMenu[] = [
  {
    name: "工作台",
    children: [
      {
        name: "列表",
        url: TabViewUrl.createRelative("/list"),
        props: { type: "table" },
      },
      {
        name: "项目实践",
        url: "/src/views/practice/test-table-detail/page-index.vue",
      },
      {
        name: "设置",
        url: TabViewUrl.createRelative("/settings"),
      },
    ],
  },
];

function mountWithTabMenu(modules: Modules = {}, meta: TabViewMeta[] = []) {
  const host = document.createElement("div");
  document.body.append(host);
  const tabsManager = createTabsManager({
    views: {
      modules,
      meta,
    },
    storage: {
      enabled: false,
    },
  });
  let tabMenu!: ReturnType<typeof useTabMenu<TestMenu>>;
  const app = createApp({
    setup() {
      tabMenu = useTabMenu<TestMenu>({ menus });
      return () => h("div");
    },
  });
  app.use(tabsManager);
  app.mount(host);
  return { app, host, tabsManager, tabMenu };
}

describe("useTabMenu breadcrumbs", () => {
  it("returns the active tab menu path and breadcrumbs", async () => {
    const { app, host, tabsManager, tabMenu } = mountWithTabMenu();

    await tabsManager.openTab(TabViewUrl.createRelative("/list"), {
      _viewName: "列表页",
      type: "table",
    });
    await nextTick();

    expect(tabMenu.activeMenuPath.value.map(menu => menu.name)).toEqual(["工作台", "列表"]);
    expect(tabMenu.breadcrumbs.value.map(item => item.title)).toEqual(["工作台", "列表"]);
    expect(tabMenu.breadcrumbs.value.map(item => item.clickable)).toEqual([false, true]);

    app.unmount();
    host.remove();
  });

  it("falls back to the active tab title when no menu matches", async () => {
    const { app, host, tabsManager, tabMenu } = mountWithTabMenu();

    await tabsManager.openTab(TabViewUrl.createRelative("/outside"), {
      _viewName: "外部打开",
    });
    await nextTick();

    expect(tabMenu.activeMenuPath.value).toEqual([]);
    expect(tabMenu.breadcrumbs.value).toMatchObject([{ title: "外部打开", clickable: false }]);

    app.unmount();
    host.remove();
  });

  it("infers breadcrumbs from parent view paths when the active tab is not in menus", async () => {
    const detailViewUrl = "/src/views/practice/test-table-detail/table-detail/page-index.vue";
    const { app, host, tabsManager, tabMenu } = mountWithTabMenu({
      "/src/views/practice/test-table-detail/page-index.vue": moduleComponent,
      [detailViewUrl]: moduleComponent,
    });

    await tabsManager.openTab(detailViewUrl, {
      _viewName: "项目详情",
      id: 1,
    });
    await nextTick();

    expect(tabMenu.activeMenuPath.value).toEqual([]);
    expect(tabMenu.breadcrumbs.value.map(item => item.title)).toEqual(["工作台", "项目实践", "项目详情"]);

    app.unmount();
    host.remove();
  });

  it("uses view meta path before menu and file path inference", async () => {
    const detailViewUrl = "/src/views/practice/test-table-detail/table-detail/page-index.vue";
    const { app, host, tabsManager, tabMenu } = mountWithTabMenu(
      {
        [detailViewUrl]: moduleComponent,
      },
      [
        {
          title: "视图元数据",
          children: [
            {
              title: "元数据项目实践",
              viewUrl: "/src/views/practice/test-table-detail/page-index.vue",
              children: [
                {
                  title: "元数据项目详情",
                  viewUrl: detailViewUrl,
                },
              ],
            },
          ],
        },
      ]
    );

    await tabsManager.openTab(detailViewUrl);
    await nextTick();

    expect(tabsManager.activeTab?.viewName).toBe("元数据项目详情");
    expect(tabMenu.breadcrumbs.value.map(item => item.title)).toEqual([
      "视图元数据",
      "元数据项目实践",
      "元数据项目详情",
    ]);

    app.unmount();
    host.remove();
  });
});
