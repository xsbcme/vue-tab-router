import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";
import type { Tab } from "@/tabs/tab";

interface TabVirtualMetrics {
  offsets: number[];
  widths: number[];
}

interface UseTabScrollOptions {
  tabs: Ref<Tab[]>;
  activeTabId: Ref<string | undefined>;
  tabsViewportRef: Ref<HTMLDivElement | undefined>;
  tabsNavRef: Ref<HTMLDivElement | undefined>;
  viewportWidth: Ref<number>;
  scrollLeft: Ref<number>;
  virtualMetrics: Ref<TabVirtualMetrics>;
  estimatedActiveWidth: Ref<number>;
}

export function useTabScroll(options: UseTabScrollOptions) {
  const isOverflowing = ref(false);
  const canScrollLeft = ref(false);
  const canScrollRight = ref(false);
  let resizeObserver: ResizeObserver | undefined;
  let scrollStateFrame = 0;

  const findTabIndex = (tabId: string | undefined) => {
    if (!tabId) return -1;
    return options.tabs.value.findIndex(tab => tab._id === tabId);
  };

  const updateScrollState = () => {
    if (scrollStateFrame) return;
    scrollStateFrame = window.requestAnimationFrame(() => {
      scrollStateFrame = 0;
      const viewport = options.tabsViewportRef.value;
      if (!viewport) return;

      const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const currentScrollLeft = Math.min(viewport.scrollLeft, maxScrollLeft);
      const threshold = 1;

      options.viewportWidth.value = viewport.clientWidth;
      options.scrollLeft.value = currentScrollLeft;
      isOverflowing.value = maxScrollLeft > threshold;
      canScrollLeft.value = currentScrollLeft > threshold;
      canScrollRight.value = currentScrollLeft < maxScrollLeft - threshold;
    });
  };

  const scrollTabs = (direction: "left" | "right") => {
    const viewport = options.tabsViewportRef.value;
    if (!viewport) return;
    const distance = Math.max(viewport.clientWidth * 0.7, 120);
    viewport.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const handleWheel = (event: WheelEvent) => {
    const viewport = options.tabsViewportRef.value;
    if (!viewport || !isOverflowing.value) return;

    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const rawDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!rawDelta) return;

    const nextScrollLeft = Math.min(Math.max(0, viewport.scrollLeft + rawDelta), maxScrollLeft);
    if (nextScrollLeft === viewport.scrollLeft) return;

    event.preventDefault();
    viewport.scrollLeft = nextScrollLeft;
    updateScrollState();
  };

  const scrollActiveTabIntoView = () => {
    nextTick(() => {
      const viewport = options.tabsViewportRef.value;
      const activeIndex = findTabIndex(options.activeTabId.value);
      if (!viewport || activeIndex < 0) {
        updateScrollState();
        return;
      }

      const { offsets, widths } = options.virtualMetrics.value;
      const currentViewportWidth = viewport.clientWidth;
      const activeLeft = offsets[activeIndex] ?? 0;
      const activeWidth = widths[activeIndex] ?? options.estimatedActiveWidth.value;
      const activeRight = activeLeft + activeWidth;
      const edgePadding = Math.min(24, Math.max(8, currentViewportWidth / 12));
      const visibleLeft = viewport.scrollLeft + edgePadding;
      const visibleRight = viewport.scrollLeft + currentViewportWidth - edgePadding;
      const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      let nextScrollLeft: number | undefined;

      if (activeWidth + edgePadding * 2 >= currentViewportWidth) {
        if (activeLeft < viewport.scrollLeft) {
          nextScrollLeft = activeLeft;
        } else if (activeRight > viewport.scrollLeft + currentViewportWidth) {
          nextScrollLeft = activeRight - currentViewportWidth;
        }
      } else if (activeLeft < visibleLeft) {
        nextScrollLeft = activeLeft - edgePadding;
      } else if (activeRight > visibleRight) {
        nextScrollLeft = activeRight - currentViewportWidth + edgePadding;
      }

      if (nextScrollLeft !== undefined) {
        viewport.scrollTo({
          left: Math.min(Math.max(0, nextScrollLeft), maxScrollLeft),
          behavior: "smooth",
        });
      }

      updateScrollState();
    });
  };

  watch([options.activeTabId, options.tabs], () => scrollActiveTabIntoView(), { flush: "post" });

  onMounted(() => {
    resizeObserver = new ResizeObserver(() => {
      const viewport = options.tabsViewportRef.value;
      if (viewport) {
        options.viewportWidth.value = viewport.clientWidth;
        options.scrollLeft.value = viewport.scrollLeft;
      }
      updateScrollState();
      scrollActiveTabIntoView();
    });
    if (options.tabsViewportRef.value) resizeObserver.observe(options.tabsViewportRef.value);
    if (options.tabsNavRef.value) resizeObserver.observe(options.tabsNavRef.value);
    scrollActiveTabIntoView();
  });

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    if (scrollStateFrame) window.cancelAnimationFrame(scrollStateFrame);
  });

  return {
    canScrollLeft,
    canScrollRight,
    handleWheel,
    isOverflowing,
    scrollTabs,
    scrollActiveTabIntoView,
    updateScrollState,
  };
}