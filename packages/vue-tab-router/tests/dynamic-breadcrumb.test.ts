// @vitest-environment jsdom

import { createApp, h, nextTick } from "vue";
import { describe, expect, it, vi } from "vitest";
import DynamicBreadcrumbComponent from "../src/components/dynamic-breadcrumb.vue";
import { createTabsManager } from "../src/composables";
import { useTabsManager } from "../src/composables";
import type { TabsManager } from "../src/tabs";

const parentViewUrl = "/src/views/practice/test-table-detail/page-index.vue";
const detailViewUrl = "/src/views/practice/test-table-detail/table-detail/page-index.vue";
const moduleComponent = { render: () => null };

function mountBreadcrumb() {
  const host = document.createElement("div");
  document.body.append(host);
  const tabsManager = createTabsManager({
    views: {
      modules: {
        [parentViewUrl]: moduleComponent,
        [detailViewUrl]: moduleComponent,
      },
      meta: [
        {
          title: "测试工作台",
          children: [
            {
              title: "项目实践",
              viewUrl: parentViewUrl,
              children: [
                {
                  title: "项目详情",
                  viewUrl: detailViewUrl,
                },
              ],
            },
          ],
        },
      ],
    },
    storage: {
      enabled: false,
    },
  });
  let injectedTabsManager!: TabsManager;
  const app = createApp({
    setup() {
      injectedTabsManager = useTabsManager();
      return () => h(DynamicBreadcrumbComponent, { showIcon: false });
    },
  });
  app.use(tabsManager);
  app.mount(host);
  return { app, host, tabsManager: injectedTabsManager };
}

describe("DynamicBreadcrumbComponent", () => {
  it("opens a parent view meta breadcrumb by viewUrl", async () => {
    const { app, host, tabsManager } = mountBreadcrumb();

    await tabsManager.openTab(detailViewUrl);
    await nextTick();

    const buttons = host.querySelectorAll<HTMLButtonElement>(".tab-breadcrumb__link");
    expect(Array.from(buttons).map(button => button.textContent)).toEqual(["项目实践"]);

    buttons[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));

    await vi.waitFor(() => {
      expect(tabsManager.activeTab?.viewUrl).toBe(parentViewUrl);
    });

    app.unmount();
    host.remove();
  });
});
