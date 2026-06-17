import { Tab } from "./tab";
import { clone, createTabNotFoundError } from "../shared";
import { runBeforeActiveChangeGuards } from "./guards";
import type { TabActiveRuntime } from "./runtime/types";

export async function runChangeActiveTabGuards(
  runtime: TabActiveRuntime,
  toTab: Partial<Tab>,
  fromTab = runtime.activeTab
) {
  await runBeforeActiveChangeGuards(runtime, toTab, fromTab);
}

export async function changeActiveTab(runtime: TabActiveRuntime, tabId: string, triggerHook: boolean = true) {
  if (tabId === runtime.activeTab?._id) return tabId;
  const findTab = runtime.getTabById(tabId);
  if (!findTab) return Promise.reject(createTabNotFoundError(tabId));
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
