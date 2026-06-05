<template>
  <div class="tabs">
    <div class="tabs-scroll">
      <button
        v-if="isOverflowing"
        class="tabs-scroll__button"
        type="button"
        aria-label="向左滚动标签页"
        :disabled="!canScrollLeft"
        @click="scrollTabs('left')"
      >
        <icon-arrow-left size="16" />
      </button>

      <div ref="tabsViewportRef" class="tabs-scroll__viewport" @scroll="updateScrollState" @wheel="handleWheel">
        <div ref="tabsNavRef" class="tabs-nav" :class="`tabs-nav--${type}`">
          <tab-item
            v-for="tab in displayTabs"
            :key="tab._id"
            :data-tab-id="tab._id"
            :tab="tab"
            :is-active="tab._id === tabsManager.activeTab?._id"
            :show-icon="showIcon"
            :default-icon="defaultIcon"
            :max-name-length="tabsManager.options?.viewNameMaxLength"
            @select="handleSelectTab"
            @close="handleCloseTab"
            @contextmenu="openContextMenu"
          />
        </div>
      </div>

      <button
        v-if="isOverflowing"
        class="tabs-scroll__button"
        type="button"
        aria-label="向右滚动标签页"
        :disabled="!canScrollRight"
        @click="scrollTabs('right')"
      >
        <icon-arrow-right size="16" />
      </button>
    </div>

    <context-menu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      @close="closeContextMenu"
      @action="contextAction"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { Tab } from "@/tab";
import TabItem from "./tab-item.vue";
import ContextMenu from "./context-menu.vue";
import { useTabsManager } from "@/use-tabs-manager";
import IconArrowLeft from "../icons/icon-arrow-left.vue";
import IconArrowRight from "../icons/icon-arrow-right.vue";

type TabsType = "text" | "line" | "card" | "rounded" | "capsule";

const props = withDefaults(
  defineProps<{
    type?: TabsType;
    showIcon?: boolean;
    defaultIcon?: string;
    /** 隐藏 _isFirst 标记的首页标签（预览模式下使用）。 */
    hideFirst?: boolean;
  }>(),
  {
    type: "text",
    hideFirst: false,
  }
);

const tabsManager = useTabsManager();
const tabsViewportRef = ref<HTMLDivElement>();
const tabsNavRef = ref<HTMLDivElement>();
const isOverflowing = ref(false);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
let resizeObserver: ResizeObserver | undefined;
let scrollStateFrame = 0;

const displayTabs = computed(() => (props.hideFirst ? tabsManager.tabs.filter(t => !t._isFirst) : tabsManager.tabs));
const activeTabId = computed(() => tabsManager.activeTab?._id);

const updateScrollState = () => {
  if (scrollStateFrame) return;
  scrollStateFrame = window.requestAnimationFrame(() => {
    scrollStateFrame = 0;
    const viewport = tabsViewportRef.value;
    if (!viewport) return;

    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const currentScrollLeft = Math.min(viewport.scrollLeft, maxScrollLeft);
    const threshold = 1;

    isOverflowing.value = maxScrollLeft > threshold;
    canScrollLeft.value = currentScrollLeft > threshold;
    canScrollRight.value = currentScrollLeft < maxScrollLeft - threshold;
  });
};

const scrollTabs = (direction: "left" | "right") => {
  const viewport = tabsViewportRef.value;
  if (!viewport) return;
  const distance = Math.max(viewport.clientWidth * 0.7, 120);
  viewport.scrollBy({
    left: direction === "left" ? -distance : distance,
    behavior: "smooth",
  });
};

const handleWheel = (event: WheelEvent) => {
  const viewport = tabsViewportRef.value;
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
    const viewport = tabsViewportRef.value;
    const nav = tabsNavRef.value;
    const activeTabIdValue = activeTabId.value;
    if (!viewport || !nav || !activeTabIdValue) {
      updateScrollState();
      return;
    }

    const activeElement = nav.querySelector<HTMLElement>(`[data-tab-id="${activeTabIdValue}"]`);
    if (!activeElement) {
      updateScrollState();
      return;
    }

    const viewportRect = viewport.getBoundingClientRect();
    const activeRect = activeElement.getBoundingClientRect();
    const viewportWidth = viewportRect.width;
    const activeWidth = activeRect.width;
    const edgePadding = Math.min(24, Math.max(8, viewportWidth / 12));
    const visibleLeft = viewportRect.left + edgePadding;
    const visibleRight = viewportRect.right - edgePadding;
    const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    let nextScrollLeft: number | undefined;

    if (activeWidth + edgePadding * 2 >= viewportWidth) {
      if (activeRect.left < viewportRect.left) {
        nextScrollLeft = viewport.scrollLeft - (viewportRect.left - activeRect.left);
      } else if (activeRect.right > viewportRect.right) {
        nextScrollLeft = viewport.scrollLeft + (activeRect.right - viewportRect.right);
      }
    } else if (activeRect.left < visibleLeft) {
      nextScrollLeft = viewport.scrollLeft - (visibleLeft - activeRect.left);
    } else if (activeRect.right > visibleRight) {
      nextScrollLeft = viewport.scrollLeft + (activeRect.right - visibleRight);
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

const handleSelectTab = (key: string) => {
  tabsManager.changeActiveTab(key);
};

const handleCloseTab = (key: string) => {
  const tab = tabsManager.tabs.find(t => t._id === key);
  if (tab) tabsManager.closeTab(tab._id);
};

const contextMenu = reactive<{ visible: boolean; x: number; y: number; tab: Tab | null }>({
  visible: false,
  x: 0,
  y: 0,
  tab: null,
});

const openContextMenu = (e: MouseEvent, tab: Tab) => {
  contextMenu.x = e.clientX;
  contextMenu.y = e.clientY;
  contextMenu.tab = tab;
  contextMenu.visible = true;
};

const closeContextMenu = () => {
  contextMenu.visible = false;
  contextMenu.tab = null;
};

const contextAction = (eventName: string) => {
  const tab = contextMenu.tab;
  closeContextMenu();
  if (!tab) return;
  switch (eventName) {
    case "refresh":
      tabsManager.refreshTab(tab._id);
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

watch([activeTabId, displayTabs], () => scrollActiveTabIntoView(), { flush: "post" });

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    updateScrollState();
    scrollActiveTabIntoView();
  });
  if (tabsViewportRef.value) resizeObserver.observe(tabsViewportRef.value);
  if (tabsNavRef.value) resizeObserver.observe(tabsNavRef.value);
  scrollActiveTabIntoView();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  if (scrollStateFrame) window.cancelAnimationFrame(scrollStateFrame);
});
</script>

<style lang="scss" scoped>
.tabs {
  padding: 6px 6px 0;
  width: 100%;
  min-width: 0;
  user-select: none;
  background: var(--tab-color-bg-base, #fff);
}

.tabs-scroll {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  min-width: 0;
}

.tabs-scroll__viewport {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tabs-scroll__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--tab-color-text-secondary, #4e5969);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background var(--tab-transition-duration, 0.15s) var(--tab-transition-timing, ease),
    border-color var(--tab-transition-duration, 0.15s) var(--tab-transition-timing, ease),
    color var(--tab-transition-duration, 0.15s) var(--tab-transition-timing, ease);

  &:hover:not(:disabled) {
    background: var(--tab-color-bg-hover, #e8ebef);
    color: var(--tab-color-text-primary, #1d2129);
  }

  &:disabled {
    color: var(--tab-color-text-disabled, #86909c);
    background: transparent;
    cursor: not-allowed;
    opacity: 0.4;
  }
}

.tabs-nav {
  display: flex;
  align-items: center;
  gap: 1px;
  width: max-content;
  min-width: 100%;
  padding: 2px 10px 0 8px;

  // 风格变体：line
  &--line :deep(.tabs-nav__item) {
    border-radius: 0;
    border-bottom: 2px solid transparent;
    background: transparent !important;

    &.is-active {
      border-bottom-color: var(--tab-color-primary, #165dff);
      color: var(--tab-color-primary, #165dff);
      font-weight: 500;
    }
  }

  // 风格变体：card
  &--card :deep(.tabs-nav__item) {
    border-radius: 8px 8px 0 0;

    &.is-active {
      background: var(--tab-color-bg-base, #fff);
    }
  }

  // 风格变体：rounded
  &--rounded :deep(.tabs-nav__item) {
    border-radius: var(--tab-radius-lg, 20px);
  }

  // 风格变体：capsule
  &--capsule :deep(.tabs-nav__item) {
    border-radius: var(--tab-radius-capsule, 16px);
    padding: 3px 12px;
  }
}
</style>
