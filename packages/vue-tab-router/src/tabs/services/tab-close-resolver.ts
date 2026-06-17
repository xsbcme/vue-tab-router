import type { Tab } from "../tab";

export function resolveRemainingSourceId(sourceId: string | undefined, closingSourceIds: Map<string, string | undefined>) {
  const seen = new Set<string>();
  let nextSourceId = sourceId;
  while (nextSourceId && closingSourceIds.has(nextSourceId) && !seen.has(nextSourceId)) {
    seen.add(nextSourceId);
    nextSourceId = closingSourceIds.get(nextSourceId);
  }
  return nextSourceId;
}

export function getFallbackTabAfterBatchClose(
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

export function getFallbackTabAfterSingleClose(
  tabs: Tab[],
  getTabById: (tabId: string | undefined) => Tab | undefined,
  closingTab: Tab,
  closingIndex: number
) {
  const parentTab = getTabById(closingTab._sourceId);
  return parentTab || tabs[closingIndex - 1] || tabs[closingIndex + 1];
}
