import { ref } from "vue";
import type { Tab } from "@/tabs/tab";
import type { TabsManager } from "@/tabs/tabs-manager";

type DropPosition = "before" | "after";

interface UseTabDragOptions {
  tabsManager: TabsManager;
  isTabDraggable: (tab: Tab) => boolean;
}

export function useTabDrag(options: UseTabDragOptions) {
  const draggingTabId = ref<string>();
  const dropTargetTabId = ref<string>();
  const dropPosition = ref<DropPosition>("before");

  const getDropPosition = (event: DragEvent) => {
    const targetElement = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
    if (!targetElement) return dropPosition.value;
    const rect = targetElement.getBoundingClientRect();
    return event.clientX > rect.left + rect.width / 2 ? "after" : "before";
  };

  const canDropTab = (sourceTab: Tab | undefined, targetTab: Tab, position: DropPosition) => {
    if (!sourceTab || !options.isTabDraggable(sourceTab) || !options.isTabDraggable(targetTab)) return false;
    return options.tabsManager.canMoveTab(sourceTab._id, targetTab._id, position);
  };

  const handleDragStart = (event: DragEvent, tab: Tab) => {
    if (!options.isTabDraggable(tab)) {
      event.preventDefault();
      return;
    }
    draggingTabId.value = tab._id;
    dropTargetTabId.value = undefined;
    event.dataTransfer?.setData("text/plain", tab._id);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragOver = (event: DragEvent, targetTab: Tab) => {
    const sourceTab = options.tabsManager.getTabById(draggingTabId.value);
    const nextDropPosition = getDropPosition(event);
    if (!canDropTab(sourceTab, targetTab, nextDropPosition)) {
      if (dropTargetTabId.value !== undefined) {
        dropTargetTabId.value = undefined;
      }
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "none";
      }
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
    if (dropPosition.value !== nextDropPosition) {
      dropPosition.value = nextDropPosition;
    }
    if (dropTargetTabId.value !== targetTab._id) {
      dropTargetTabId.value = targetTab._id;
    }
  };

  const handleDragLeave = (event: DragEvent, targetTab: Tab) => {
    const targetElement = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
    const relatedTarget = event.relatedTarget instanceof Node ? event.relatedTarget : undefined;
    if (targetElement && relatedTarget && targetElement.contains(relatedTarget)) return;
    if (dropTargetTabId.value === targetTab._id) {
      dropTargetTabId.value = undefined;
    }
  };

  const handleDrop = async (event: DragEvent, targetTab: Tab) => {
    event.preventDefault();
    const sourceTabId = draggingTabId.value || event.dataTransfer?.getData("text/plain");
    const sourceTab = options.tabsManager.getTabById(sourceTabId);
    const currentDropPosition = dropPosition.value;
    if (sourceTab && canDropTab(sourceTab, targetTab, currentDropPosition)) {
      await options.tabsManager.moveTab(sourceTab._id, targetTab._id, currentDropPosition);
    }
    handleDragEnd();
  };

  const handleDragEnd = () => {
    draggingTabId.value = undefined;
    dropTargetTabId.value = undefined;
    dropPosition.value = "before";
  };

  return {
    draggingTabId,
    dropPosition,
    dropTargetTabId,
    handleDragEnd,
    handleDragLeave,
    handleDragOver,
    handleDragStart,
    handleDrop,
  };
}