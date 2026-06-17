import { EventManager } from "../shared";
import { Tab } from "./tab";
import type { CloseTabOptions, CloseTabsOptions } from "../types";
import { clone, createTabNotFoundError } from "../shared";
import { runBeforeCloseGuards } from "./guards";
import { getFallbackTabAfterBatchClose, getFallbackTabAfterSingleClose, resolveRemainingSourceId } from "./services";
import type { TabCloseRuntime } from "./runtime/types";

type ClosedTabRecord = {
  tab: Tab;
  fallbackTab?: Tab;
};

function offTabEvents(events: EventManager, tabId: string) {
  events.offByPrefix(`${tabId}_`);
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
        await runBeforeCloseGuards(runtime, findTab, sourceTab);
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
    return Promise.reject(createTabNotFoundError(tabId));
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
      await runBeforeCloseGuards(runtime, findTab, sourceTab);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  offTabEvents(runtime.events, findTab._id);

  const shouldActivateFallback = runtime.activeTab?._id === findTab._id;
  const fallbackTab = getFallbackTabAfterSingleClose(runtime.tabs, runtime.getTabById, findTab, findTabIndex);
  if (!options.skipGuard && shouldActivateFallback && fallbackTab) {
    try {
      await runtime.runChangeActiveTabGuards(fallbackTab, findTab);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  runtime.tabs.splice(findTabIndex, 1);
  runtime.tabs.filter(item => item._sourceId == findTab._id).forEach(item => (item._sourceId = findTab._sourceId));
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
