import type { Tab } from "../tab";

export type CloseTabRange = "all" | "left" | "right" | "other";

function findTargetTab(tabs: Tab[], targetTabId: string | undefined, activeTabId: string | undefined) {
  const resolvedTabId = targetTabId || activeTabId;
  if (!resolvedTabId) return undefined;
  return tabs.find(tab => tab._id === resolvedTabId);
}

export function getCloseTabIds(tabs: Tab[], targetTabId: string | undefined, activeTabId: string | undefined, range: CloseTabRange) {
  if (range === "all") return tabs.map(tab => tab._id);

  const targetTab = findTargetTab(tabs, targetTabId, activeTabId);
  if (!targetTab) return [];

  const targetIndex = tabs.indexOf(targetTab);
  switch (range) {
    case "left":
      return tabs.slice(0, targetIndex).map(tab => tab._id);
    case "right":
      return tabs.slice(targetIndex + 1).map(tab => tab._id);
    case "other":
      return tabs.filter(tab => tab._id !== targetTab._id).map(tab => tab._id);
  }
}
