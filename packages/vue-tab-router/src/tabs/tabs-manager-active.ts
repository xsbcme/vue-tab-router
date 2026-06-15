import { Tab } from "./tab";
import { runTabGuard } from "./tab-guard";
import { TabsManagerHooks } from "./tabs-manager-plugin";
import type { ITabsManagerOptions } from "../types";
import { clone } from "../shared";

export interface TabActiveRuntime {
  readonly tabs: Tab[];
  readonly activeTab: Tab | undefined;
  readonly options: ITabsManagerOptions;
  readonly hooks: TabsManagerHooks;
  getTabById(tabId: string | undefined): Tab | undefined;
  setActiveTabId(tabId: string | undefined): void;
  persistTabs(): void;
}

export async function runChangeActiveTabGuards(
  runtime: TabActiveRuntime,
  toTab: Partial<Tab>,
  fromTab = runtime.activeTab
) {
  if (fromTab) {
    await runTabGuard(runtime.options?.onBeforeTabLeave, clone(toTab), clone(fromTab));
    await runTabGuard(fromTab._onBeforeTabLeave, clone(toTab), clone(fromTab));
  }
  await runTabGuard(runtime.options?.onBeforeTabEnter, clone(toTab), clone(fromTab));
  await runTabGuard(toTab._onBeforeTabEnter, clone(toTab), clone(fromTab));
  await runtime.hooks.call("tab:before-active-change", clone(toTab), clone(fromTab));
}

export async function changeActiveTab(runtime: TabActiveRuntime, tabId: string, triggerHook: boolean = true) {
  if (tabId === runtime.activeTab?._id) return tabId;
  const findTab = runtime.getTabById(tabId);
  if (!findTab) return Promise.reject(new Error(`标签页不存在[${tabId}]`));
  const fromTab = runtime.activeTab;

  if (triggerHook) {
    try {
      await runChangeActiveTabGuards(runtime, findTab, fromTab);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  runtime.tabs.forEach(item => {
    if (item._id === tabId) {
      Object.assign<Tab, Partial<Tab>>(item, { _isActive: true });
    } else {
      Object.assign<Tab, Partial<Tab>>(item, { _isActive: undefined });
    }
  });
  runtime.setActiveTabId(tabId);
  runtime.persistTabs();
  await runtime.hooks.call("tab:active-changed", clone(findTab), clone(fromTab));

  return tabId;
}
