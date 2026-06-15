import { reactive } from "vue";
import type { Tab } from "@/tabs/tab";
import type { TabsManager } from "@/tabs/tabs-manager";

type TabContextAction =
  | "detach"
  | "refresh"
  | "toggle-pinned"
  | "close-left"
  | "close-right"
  | "close-other"
  | "close-all"
  | "refresh-all";

interface TabContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  tab: Tab | null;
}

export function useTabContextMenu(tabsManager: TabsManager) {
  const contextMenu = reactive<TabContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    tab: null,
  });

  const openContextMenu = (event: MouseEvent, tab: Tab) => {
    contextMenu.x = event.clientX;
    contextMenu.y = event.clientY;
    contextMenu.tab = tab;
    contextMenu.visible = true;
  };

  const closeContextMenu = () => {
    contextMenu.visible = false;
    contextMenu.tab = null;
  };

  const contextAction = (eventName: TabContextAction) => {
    const tab = contextMenu.tab;
    closeContextMenu();
    if (!tab) return;
    switch (eventName) {
      case "detach":
        tabsManager.openDetachedTab(tab._id);
        break;
      case "refresh":
        tabsManager.refreshTab(tab._id);
        break;
      case "toggle-pinned":
        tabsManager.updateTabOptions({ _viewPinned: !tab._pinned }, tab._id);
        break;
      case "close-left":
        tabsManager.closeTabsByLeft(tab._id);
        break;
      case "close-right":
        tabsManager.closeTabsByRight(tab._id);
        break;
      case "close-other":
        tabsManager.closeTabsByOther(tab._id);
        break;
      case "close-all":
        tabsManager.closeTabByAll();
        break;
      case "refresh-all":
        tabsManager.refreshTabAll();
        break;
    }
  };

  const handleDetachedError = (error: unknown) => {
    tabsManager.hooks.call("tab:detached-error", error).catch(() => undefined);
  };

  return {
    closeContextMenu,
    contextAction,
    contextMenu,
    handleDetachedError,
    openContextMenu,
  };
}