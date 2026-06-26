import { nextTick, onBeforeUnmount, type ComputedRef, type Ref, watch } from "vue";
import type { TabsManager } from "@/tabs/tabs-manager";
import { shouldCacheComponentTab } from "./tab-cache";

interface ScrollSnapshotItem {
  path: number[];
  left: number;
  top: number;
}

interface ScrollSnapshot {
  layer: Omit<ScrollSnapshotItem, "path">;
  items: ScrollSnapshotItem[];
}

/**
 * 仅为开启缓存的组件标签页保存滚动位置。
 * 共享视图层和当前页面内部已滚动的子元素会一起恢复。
 */
export function useScrollRestore(
  tabsManager: TabsManager,
  activeTabId: ComputedRef<string | undefined>,
  viewLayerRef: Ref<HTMLElement | undefined>,
  waitForRenderReady?: () => Promise<void>
) {
  const scrollSnapshots = new Map<string, ScrollSnapshot>();

  const shouldRestoreScroll = (tabId: string | undefined) => {
    const tab = tabId ? tabsManager.getTabById(tabId) : undefined;
    return Boolean(tab && shouldCacheComponentTab(tab));
  };

  const getElementPath = (root: HTMLElement, target: HTMLElement) => {
    const path: number[] = [];
    let current: HTMLElement | null = target;

    while (current && current !== root) {
      const parent = current.parentElement;
      if (!parent) return [];
      path.unshift(Array.prototype.indexOf.call(parent.children, current));
      current = parent;
    }

    return current === root ? path : [];
  };

  const getElementByPath = (root: HTMLElement, path: number[]) => {
    let current: Element = root;

    for (const index of path) {
      const next = current.children.item(index);
      if (!(next instanceof HTMLElement)) return undefined;
      current = next;
    }

    return current instanceof HTMLElement ? current : undefined;
  };

  // 组件实例虽然被 keep-alive 缓存，但激活内容仍会在共享视图层内切换，
  // 因此内部滚动容器需要通过相对 DOM 路径匹配后再恢复。
  const getScrolledDescendants = (root: HTMLElement): ScrollSnapshotItem[] => {
    return Array.from(root.querySelectorAll<HTMLElement>("*"))
      .filter(element => element.scrollTop > 0 || element.scrollLeft > 0)
      .map(element => ({
        path: getElementPath(root, element),
        left: element.scrollLeft,
        top: element.scrollTop,
      }))
      .filter(item => item.path.length > 0);
  };

  const saveScrollPosition = (tabId: string | undefined) => {
    const viewLayer = viewLayerRef.value;
    if (!tabId || !viewLayer || !shouldRestoreScroll(tabId)) return;
    scrollSnapshots.set(tabId, {
      layer: {
        left: viewLayer.scrollLeft,
        top: viewLayer.scrollTop,
      },
      items: getScrolledDescendants(viewLayer),
    });
  };

  const getScrollSnapshot = (tabId: string | undefined) => {
    return tabId && shouldRestoreScroll(tabId) ? scrollSnapshots.get(tabId) : undefined;
  };

  const resetViewLayerScroll = () => {
    const viewLayer = viewLayerRef.value;
    if (!viewLayer) return;
    viewLayer.scrollLeft = 0;
    viewLayer.scrollTop = 0;
  };

  const restoreScrollPosition = async (tabId: string | undefined) => {
    const viewLayer = viewLayerRef.value;
    if (!tabId || !viewLayer) return;
    await nextTick();
    if (activeTabId.value !== tabId) return;

    const snapshot = getScrollSnapshot(tabId);
    if (!snapshot) resetViewLayerScroll();

    await waitForRenderReady?.();
    if (activeTabId.value !== tabId) return;

    if (!snapshot) {
      return;
    }

    viewLayer.scrollLeft = snapshot.layer.left;
    viewLayer.scrollTop = snapshot.layer.top;
    snapshot.items.forEach(item => {
      const element = getElementByPath(viewLayer, item.path);
      if (!element) return;
      element.scrollLeft = item.left;
      element.scrollTop = item.top;
    });
  };

  const cleanupScrollPosition = (tabId: string | undefined) => {
    if (!tabId) return;
    scrollSnapshots.delete(tabId);
  };

  const hookCleanups = [
    tabsManager.hooks.on("tab:before-refresh", tab => cleanupScrollPosition(tab._id)),
    tabsManager.hooks.on("tab:closed", tab => cleanupScrollPosition(tab._id)),
    tabsManager.hooks.on("tabs:cleared", () => scrollSnapshots.clear()),
  ];

  watch(
    activeTabId,
    (tabId, previousTabId) => {
      saveScrollPosition(previousTabId);
      if (!getScrollSnapshot(tabId)) resetViewLayerScroll();
      restoreScrollPosition(tabId);
    },
    { flush: "pre" }
  );

  onBeforeUnmount(() => {
    hookCleanups.forEach(cleanup => cleanup());
    scrollSnapshots.clear();
  });
}