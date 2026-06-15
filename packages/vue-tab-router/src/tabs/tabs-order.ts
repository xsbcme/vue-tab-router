import { Tab } from "./tab";

export type MoveTabPosition = "before" | "after";

export function insertTab(tabs: Tab[], tab: Tab) {
  if (!tab._pinned) {
    tabs.push(tab);
    return;
  }
  const firstNormalIndex = tabs.findIndex(item => !item._isFirst && !item._pinned);
  if (firstNormalIndex >= 0) {
    tabs.splice(firstNormalIndex, 0, tab);
    return;
  }
  tabs.push(tab);
}

export function sortPinnedTabs(tabs: Tab[]) {
  const firstTabs: Tab[] = [];
  const pinnedTabs: Tab[] = [];
  const normalTabs: Tab[] = [];
  tabs.forEach(tab => {
    if (tab._isFirst) {
      firstTabs.push(tab);
    } else if (tab._pinned) {
      pinnedTabs.push(tab);
    } else {
      normalTabs.push(tab);
    }
  });
  return [...firstTabs, ...pinnedTabs, ...normalTabs];
}

export function getMoveTabState(
  tabs: Tab[],
  tabId: string | undefined,
  targetTabId: string | undefined,
  position: MoveTabPosition
) {
  if (!tabId || !targetTabId || tabId === targetTabId) return undefined;
  const movingIndex = tabs.findIndex(tab => tab._id === tabId);
  const targetIndex = tabs.findIndex(tab => tab._id === targetTabId);
  if (movingIndex < 0 || targetIndex < 0) return undefined;

  const movingTab = tabs[movingIndex];
  const targetTab = tabs[targetIndex];
  if (movingTab._isFirst || movingTab._noDrag || targetTab._isFirst || targetTab._noDrag) return undefined;
  if (Boolean(movingTab._pinned) !== Boolean(targetTab._pinned)) return undefined;

  const insertIndexBeforeRemoval = position === "after" ? targetIndex + 1 : targetIndex;
  const insertIndex = movingIndex < insertIndexBeforeRemoval ? insertIndexBeforeRemoval - 1 : insertIndexBeforeRemoval;
  if (insertIndex === movingIndex) return undefined;

  return { movingIndex, insertIndex, movingTab };
}

export function moveTab(tabs: Tab[], tabId: string, targetTabId: string, position: MoveTabPosition) {
  const moveState = getMoveTabState(tabs, tabId, targetTabId, position);
  if (!moveState) return false;

  const { movingIndex, insertIndex, movingTab } = moveState;
  tabs.splice(movingIndex, 1);
  tabs.splice(insertIndex, 0, movingTab);
  return true;
}

export function swapTabByIndex(tabs: Tab[], tabIndex1: number, tabIndex2: number) {
  if (tabIndex1 < 0 || tabIndex2 < 0) return false;
  const temp = tabs[tabIndex1];
  tabs[tabIndex1] = tabs[tabIndex2];
  tabs[tabIndex2] = temp;
  return true;
}
