import { computed, nextTick, onBeforeUnmount, onMounted, reactive, watch, type ComponentPublicInstance, type Ref } from "vue";
import type { Tab } from "@/tabs/tab";
import type { TabsVirtualOptions } from "@/types";

export interface VirtualTab {
  tab: Tab;
  offset: number;
}

export interface ResolvedTabsVirtualOptions {
  enabled: boolean;
  threshold: number;
  overscan: number;
  estimatedWidth: number;
  minWidth: number;
  maxWidth: number;
}

interface UseTabVirtualListOptions {
  tabs: Ref<Tab[]>;
  scrollLeft: Ref<number>;
  viewportWidth: Ref<number>;
  virtualOptions: Ref<Array<TabsVirtualOptions | undefined>>;
  maxTitleLength: Ref<number | undefined>;
  showIcon: Ref<boolean>;
  defaultIcon: Ref<string | undefined>;
  onMeasure?: () => void;
}

const TAB_GAP = 1;
const NAV_PADDING_LEFT = 8;
const NAV_PADDING_RIGHT = 10;
const DEFAULT_VIRTUAL_OPTIONS: ResolvedTabsVirtualOptions = {
  enabled: true,
  threshold: 30,
  overscan: 6,
  estimatedWidth: 148,
  minWidth: 72,
  maxWidth: 260,
};

const normalizePositiveNumber = (value: number | undefined, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;

const normalizeNonNegativeInteger = (value: number | undefined, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;

const findFirstVisibleIndex = (offsets: number[], widths: number[], visibleLeft: number) => {
  let low = 0;
  let high = offsets.length - 1;
  let result = offsets.length - 1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (offsets[middle] + widths[middle] >= visibleLeft) {
      result = middle;
      high = middle - 1;
    } else {
      low = middle + 1;
    }
  }

  return result;
};

const findLastVisibleIndex = (offsets: number[], visibleRight: number) => {
  let low = 0;
  let high = offsets.length - 1;
  let result = 0;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (offsets[middle] <= visibleRight) {
      result = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return result;
};

export function resolveTabsVirtualOptions(...optionsList: Array<TabsVirtualOptions | undefined>): ResolvedTabsVirtualOptions {
  return optionsList.reduce<ResolvedTabsVirtualOptions>((resolved, options) => {
    if (options === undefined) return resolved;
    if (typeof options === "boolean") {
      return { ...resolved, enabled: options };
    }
    return {
      enabled: options.enabled ?? resolved.enabled,
      threshold: normalizeNonNegativeInteger(options.threshold, resolved.threshold),
      overscan: normalizeNonNegativeInteger(options.overscan, resolved.overscan),
      estimatedWidth: normalizePositiveNumber(options.estimatedWidth, resolved.estimatedWidth),
      minWidth: normalizePositiveNumber(options.minWidth, resolved.minWidth),
      maxWidth: normalizePositiveNumber(options.maxWidth, resolved.maxWidth),
    };
  }, DEFAULT_VIRTUAL_OPTIONS);
}

export function useTabVirtualList(options: UseTabVirtualListOptions) {
  let tabResizeObserver: ResizeObserver | undefined;
  let syncMeasuredWidthsFrame = 0;
  const tabItemElements = new Map<string, HTMLElement>();
  const measuredTabWidths = reactive<Record<string, number>>({});

  const resolvedVirtualOptions = computed(() => {
    const resolved = resolveTabsVirtualOptions(...options.virtualOptions.value);
    return {
      ...resolved,
      maxWidth: Math.max(resolved.minWidth, resolved.maxWidth),
    };
  });

  const isVirtualEnabled = computed(
    () => resolvedVirtualOptions.value.enabled && options.tabs.value.length >= resolvedVirtualOptions.value.threshold
  );

  const getEstimatedTabWidth = (tab: Tab) => {
    const virtualOptions = resolvedVirtualOptions.value;
    const maxTitleLength = options.maxTitleLength.value ?? 20;
    const rawName = tab._loading ? "加载中..." : tab.viewName || "未命名";
    const nameLength = Math.min(rawName.length, maxTitleLength);
    const iconWidth = options.showIcon.value && (tab.viewIcon || options.defaultIcon.value) ? 22 : 0;
    const pinWidth = tab._pinned ? 19 : 0;
    const closeWidth = tab._noClose ? 32 : 56;
    return Math.min(
      virtualOptions.maxWidth,
      Math.max(virtualOptions.minWidth, nameLength * 14 + iconWidth + pinWidth + closeWidth)
    );
  };

  const getTabWidth = (tab: Tab) => measuredTabWidths[tab._id] || getEstimatedTabWidth(tab);

  const virtualMetrics = computed(() => {
    const tabs = options.tabs.value;
    const offsets: number[] = [];
    const widths: number[] = [];
    let cursor = NAV_PADDING_LEFT;

    tabs.forEach((tab, index) => {
      offsets[index] = cursor;
      const width = getTabWidth(tab);
      widths[index] = width;
      cursor += width + TAB_GAP;
    });

    const contentWidth = tabs.length > 0 ? cursor - TAB_GAP + NAV_PADDING_RIGHT : NAV_PADDING_LEFT + NAV_PADDING_RIGHT;
    return {
      offsets,
      widths,
      totalWidth: Math.max(contentWidth, options.viewportWidth.value),
    };
  });

  const virtualTotalWidth = computed(() => virtualMetrics.value.totalWidth);

  const virtualTabs = computed<VirtualTab[]>(() => {
    const tabs = options.tabs.value;
    if (!tabs.length) return [];
    if (!isVirtualEnabled.value) {
      return tabs.map((tab, index) => ({
        tab,
        offset: virtualMetrics.value.offsets[index],
      }));
    }

    const { offsets, widths } = virtualMetrics.value;
    const virtualOptions = resolvedVirtualOptions.value;
    const visibleLeft = Math.max(0, options.scrollLeft.value - virtualOptions.estimatedWidth * virtualOptions.overscan);
    const visibleRight =
      options.scrollLeft.value + options.viewportWidth.value + virtualOptions.estimatedWidth * virtualOptions.overscan;
    let startIndex = findFirstVisibleIndex(offsets, widths, visibleLeft);
    let endIndex = findLastVisibleIndex(offsets, visibleRight);

    startIndex = Math.max(0, startIndex - virtualOptions.overscan);
    endIndex = Math.min(tabs.length - 1, endIndex + virtualOptions.overscan);

    return tabs.slice(startIndex, endIndex + 1).map((tab, index) => {
      const tabIndex = startIndex + index;
      return {
        tab,
        offset: offsets[tabIndex],
      };
    });
  });

  const measureTabElement = (tabId: string, element: HTMLElement) => {
    const width = element.offsetWidth || element.getBoundingClientRect().width;
    if (width > 0 && Math.abs((measuredTabWidths[tabId] || 0) - width) > 0.5) {
      measuredTabWidths[tabId] = width;
    }
  };

  const syncMeasuredWidths = () => {
    if (syncMeasuredWidthsFrame) return;
    syncMeasuredWidthsFrame = window.requestAnimationFrame(() => {
      syncMeasuredWidthsFrame = 0;
      tabItemElements.forEach((element, tabId) => measureTabElement(tabId, element));
      options.onMeasure?.();
    });
  };

  const resolveElement = (el: Element | ComponentPublicInstance | null) => {
    if (el instanceof HTMLElement) return el;
    if (el && "$el" in el && el.$el instanceof HTMLElement) return el.$el;
    return undefined;
  };

  const setTabItemRef = (tabId: string, el: Element | ComponentPublicInstance | null) => {
    const previousElement = tabItemElements.get(tabId);
    const element = resolveElement(el);
    if (previousElement && previousElement === element) {
      measureTabElement(tabId, previousElement);
      return;
    }

    if (previousElement) {
      tabResizeObserver?.unobserve(previousElement);
      tabItemElements.delete(tabId);
    }

    if (!element) return;

    tabItemElements.set(tabId, element);
    tabResizeObserver?.observe(element);
    measureTabElement(tabId, element);
  };

  watch(
    options.tabs,
    tabs => {
      const currentIds = new Set(tabs.map(tab => tab._id));
      Object.keys(measuredTabWidths).forEach(tabId => {
        if (!currentIds.has(tabId)) delete measuredTabWidths[tabId];
      });
      Array.from(tabItemElements.entries()).forEach(([tabId, element]) => {
        if (!currentIds.has(tabId)) {
          tabResizeObserver?.unobserve(element);
          tabItemElements.delete(tabId);
        }
      });
      options.onMeasure?.();
    },
    { flush: "post" }
  );
  watch(virtualTabs, () => nextTick(syncMeasuredWidths), { flush: "post" });

  onMounted(() => {
    tabResizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const element = entry.target instanceof HTMLElement ? entry.target : undefined;
        const tabId = element?.dataset.tabId;
        if (!tabId) return;
        const width = entry.borderBoxSize?.[0]?.inlineSize || entry.contentRect.width;
        if (width > 0 && Math.abs((measuredTabWidths[tabId] || 0) - width) > 0.5) {
          measuredTabWidths[tabId] = width;
        }
      });
      options.onMeasure?.();
    });
    tabItemElements.forEach(element => tabResizeObserver?.observe(element));
    syncMeasuredWidths();
  });

  onBeforeUnmount(() => {
    tabResizeObserver?.disconnect();
    if (syncMeasuredWidthsFrame) window.cancelAnimationFrame(syncMeasuredWidthsFrame);
  });

  return {
    isVirtualEnabled,
    resolvedVirtualOptions,
    setTabItemRef,
    virtualMetrics,
    virtualTabs,
    virtualTotalWidth,
  };
}
