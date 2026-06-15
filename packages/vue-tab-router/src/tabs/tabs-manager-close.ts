import { EventManager } from "../shared";
import { Tab } from "./tab";
import { runTabGuard } from "./tab-guard";
import { TabsManagerHooks } from "./tabs-manager-plugin";
import type { CloseTabOptions, CloseTabsOptions, ITabsManagerOptions } from "../types";
import { clone } from "../shared";

type ClosedTabRecord = {
  tab: Tab;
  fallbackTab?: Tab;
};

export interface TabCloseRuntime {
  readonly tabs: Tab[];
  readonly activeTab: Tab | undefined;
  readonly detachedTab: Partial<Tab> | null;
  readonly options: ITabsManagerOptions;
  readonly hooks: TabsManagerHooks;
  readonly events: EventManager;
  setTabs(tabs: Tab[]): void;
  setActiveTabId(tabId: string | undefined): void;
  syncTabs(): void;
  getTabById(tabId: string | undefined): Tab | undefined;
  getNoCloseTabCloseHandler(): ((tab: Partial<Tab>) => boolean | Promise<boolean>) | undefined;
  runChangeActiveTabGuards(toTab: Partial<Tab>, fromTab?: Tab): Promise<void>;
  closeDetachedTab(): Promise<unknown>;
  persistTabs(): void;
}

function setTabsSourceIdById(tabs: Tab[], id: string, newId: string | undefined) {
  tabs.filter(item => item._sourceId == id).forEach(item => (item._sourceId = newId));
}

function offTabEvents(events: EventManager, tabId: string) {
  events.offByPrefix(`${tabId}_`);
}

function resolveRemainingSourceId(sourceId: string | undefined, closingSourceIds: Map<string, string | undefined>) {
  const seen = new Set<string>();
  let nextSourceId = sourceId;
  while (nextSourceId && closingSourceIds.has(nextSourceId) && !seen.has(nextSourceId)) {
    seen.add(nextSourceId);
    nextSourceId = closingSourceIds.get(nextSourceId);
  }
  return nextSourceId;
}

function getFallbackTabAfterBatchClose(
  tabs: Tab[],
  getTabById: (tabId: string | undefined) => Tab | undefined,
  closingTab: Tab,
  closingIds: Set<string>,
  closingSourceIds: Map<string, string | undefined>
) {
  const parentTab = getTabById(resolveRemainingSourceId(closingTab._sourceId, closingSourceIds));
  if (parentTab && !closingIds.has(parentTab._id)) return parentTab;

  const closingIndex = tabs.indexOf(closingTab);
  for (let index = closingIndex - 1; index >= 0; index--) {
    const tab = tabs[index];
    if (!closingIds.has(tab._id)) return tab;
  }
  for (let index = closingIndex + 1; index < tabs.length; index++) {
    const tab = tabs[index];
    if (!closingIds.has(tab._id)) return tab;
  }
}

async function collectTabsToClose(runtime: TabCloseRuntime, tabIds: string[], options: CloseTabsOptions) {
  const tabById = new Map(runtime.tabs.map(tab => [tab._id, tab]));
  const getTabById = (tabId: string | undefined) => (tabId ? tabById.get(tabId) : undefined);
  const closingTabs: Tab[] = [];
  const closingIds = new Set<string>();

  for (const tabId of tabIds) {
    const findTab = getTabById(tabId);
    if (!findTab || closingIds.has(findTab._id)) continue;

    if (!options.ignoreNoClose && findTab._noClose) {
      try {
        await runtime.getNoCloseTabCloseHandler()?.(clone(findTab));
      } catch (error) {
        if (!options.continueOnRejected) return Promise.reject(error);
      }
      continue;
    }

    if (!options.skipGuard) {
      try {
        const sourceTab = getTabById(findTab._sourceId);
        await runTabGuard(findTab._onBeforeTabClose, clone(findTab), clone(sourceTab));
        await runTabGuard(runtime.options?.onBeforeTabClose, clone(findTab), clone(sourceTab));
        await runtime.hooks.call("tab:before-close", clone(findTab), clone(sourceTab));
      } catch (error) {
        if (!options.continueOnRejected) return Promise.reject(error);
        continue;
      }
    }

    closingTabs.push(findTab);
    closingIds.add(findTab._id);
  }

  return closingTabs;
}

export async function closeTabsInBatch(runtime: TabCloseRuntime, tabIds: string[], options: CloseTabsOptions = {}) {
  const tabById = new Map(runtime.tabs.map(tab => [tab._id, tab]));
  const getTabById = (tabId: string | undefined) => (tabId ? tabById.get(tabId) : undefined);
  let closingTabs = await collectTabsToClose(runtime, tabIds, options);
  if (!closingTabs.length) return;

  let closingIds = new Set(closingTabs.map(tab => tab._id));
  let closingSourceIds = new Map(closingTabs.map(tab => [tab._id, tab._sourceId]));
  const activeTab = runtime.activeTab;
  const activeClosingTab = activeTab && closingIds.has(activeTab._id) ? activeTab : undefined;

  if (activeClosingTab && !options.skipGuard) {
    const fallbackTab = getFallbackTabAfterBatchClose(
      runtime.tabs,
      getTabById,
      activeClosingTab,
      closingIds,
      closingSourceIds
    );
    if (fallbackTab) {
      try {
        await runtime.runChangeActiveTabGuards(fallbackTab, activeClosingTab);
      } catch (error) {
        if (!options.continueOnRejected) return Promise.reject(error);
        closingTabs = closingTabs.filter(tab => tab._id !== activeClosingTab._id);
        closingIds = new Set(closingTabs.map(tab => tab._id));
        closingSourceIds = new Map(closingTabs.map(tab => [tab._id, tab._sourceId]));
      }
    }
  }

  if (!closingTabs.length) return;

  const fallbackCache = new Map<string, Tab | undefined>();
  const getCachedFallbackTab = (closingTab: Tab) => {
    if (!fallbackCache.has(closingTab._id)) {
      fallbackCache.set(
        closingTab._id,
        getFallbackTabAfterBatchClose(runtime.tabs, getTabById, closingTab, closingIds, closingSourceIds)
      );
    }
    return fallbackCache.get(closingTab._id);
  };
  const closedRecords: ClosedTabRecord[] = closingTabs.map(tab => ({
    tab,
    fallbackTab: getCachedFallbackTab(tab),
  }));
  const shouldCloseDetachedTab = Boolean(runtime.detachedTab && closingIds.has(runtime.detachedTab._id!));
  const fallbackTab = activeClosingTab ? getCachedFallbackTab(activeClosingTab) : undefined;

  closingIds.forEach(tabId => offTabEvents(runtime.events, tabId));
  runtime.tabs.forEach(tab => {
    if (closingIds.has(tab._id)) return;
    const sourceId = resolveRemainingSourceId(tab._sourceId, closingSourceIds);
    if (sourceId !== tab._sourceId) {
      tab._sourceId = sourceId;
    }
  });
  runtime.setTabs(runtime.tabs.filter(tab => !closingIds.has(tab._id)));

  if (activeClosingTab && closingIds.has(activeClosingTab._id)) {
    runtime.setActiveTabId(fallbackTab?._id);
    runtime.tabs.forEach(tab => {
      Object.assign<Tab, Partial<Tab>>(tab, {
        _isActive: fallbackTab && tab._id === fallbackTab._id ? true : undefined,
      });
    });
  }

  runtime.persistTabs();
  if (shouldCloseDetachedTab) {
    await runtime.closeDetachedTab();
  }
  for (const { tab, fallbackTab: recordFallbackTab } of closedRecords) {
    await runtime.hooks.call("tab:closed", clone(tab), clone(recordFallbackTab));
  }
}

export async function closeSingleTab(runtime: TabCloseRuntime, tabId: string | undefined, options: CloseTabOptions = {}) {
  const findTab = runtime.getTabById(tabId || runtime.activeTab?._id);
  if (!findTab) {
    return Promise.reject(new Error(`标签页不存在[${tabId || ""}]`));
  }
  const findTabIndex = runtime.tabs.indexOf(findTab);
  if (findTabIndex < 0) return;

  if (!options.ignoreNoClose && findTab._noClose) {
    if (await runtime.getNoCloseTabCloseHandler()?.(clone(findTab))) {
      return;
    }
    return;
  }

  if (!options.skipGuard) {
    try {
      const sourceTab = runtime.getTabById(findTab._sourceId);
      await runTabGuard(findTab._onBeforeTabClose, clone(findTab), clone(sourceTab));
      await runTabGuard(runtime.options?.onBeforeTabClose, clone(findTab), clone(sourceTab));
      await runtime.hooks.call("tab:before-close", clone(findTab), clone(sourceTab));
    } catch (error) {
      return Promise.reject(error);
    }
  }

  offTabEvents(runtime.events, findTab._id);

  const shouldActivateFallback = runtime.activeTab?._id === findTab._id;
  const parentTab = runtime.getTabById(findTab._sourceId);
  const fallbackTab = parentTab || runtime.tabs[findTabIndex - 1] || runtime.tabs[findTabIndex + 1];
  if (!options.skipGuard && shouldActivateFallback && fallbackTab) {
    try {
      await runtime.runChangeActiveTabGuards(fallbackTab, findTab);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  runtime.tabs.splice(findTabIndex, 1);
  setTabsSourceIdById(runtime.tabs, findTab._id, findTab._sourceId);
  runtime.syncTabs();
  if (shouldActivateFallback) {
    runtime.setActiveTabId(fallbackTab?._id);
    runtime.tabs.forEach(item => {
      Object.assign<Tab, Partial<Tab>>(item, {
        _isActive: fallbackTab && item._id === fallbackTab._id ? true : undefined,
      });
    });
  }

  runtime.persistTabs();
  if (runtime.detachedTab?._id === findTab._id) {
    await runtime.closeDetachedTab();
  }
  await runtime.hooks.call("tab:closed", clone(findTab), clone(fallbackTab));
}
