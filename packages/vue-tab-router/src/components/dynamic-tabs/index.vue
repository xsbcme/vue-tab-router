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
            :class="{
              'is-dragging': draggingTabId === tab._id,
              'is-drop-target': dropTargetTabId === tab._id,
              'is-drop-before': dropTargetTabId === tab._id && dropPosition === 'before',
              'is-drop-after': dropTargetTabId === tab._id && dropPosition === 'after',
            }"
            :tab="tab"
            :is-active="tab._id === tabsManager.activeTab?._id"
            :show-icon="resolvedShowIcon"
            :default-icon="defaultIcon"
            :max-name-length="tabsManager.options?.viewNameMaxLength"
            :draggable="isTabDraggable(tab)"
            @select="handleSelectTab"
            @close="handleCloseTab"
            @contextmenu="openContextMenu"
            @dragstart="handleDragStart"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
            @dragend="handleDragEnd"
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
      :tab="contextMenu.tab"
      @close="closeContextMenu"
      @action="contextAction"
    />

    <DetachedContainerComponent
      :visible="Boolean(tabsManager.detachedTab)"
      :tab="tabsManager.detachedTab"
      @close="tabsManager.closeDetachedTab()"
      @error="handleDetachedError"
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
import DetachedContainerComponent from "../detached-container/index.vue";

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
const draggingTabId = ref<string>();
const dropTargetTabId = ref<string>();
const dropPosition = ref<"before" | "after">("before");
let resizeObserver: ResizeObserver | undefined;
let scrollStateFrame = 0;

const displayTabs = computed(() => (props.hideFirst ? tabsManager.tabs.filter(t => !t._isFirst) : tabsManager.tabs));
const activeTabId = computed(() => tabsManager.activeTab?._id);
const tabsDraggable = computed(() => tabsManager.options.tabsDraggable !== false);
const resolvedShowIcon = computed(() => props.showIcon ?? tabsManager.options.tabsShowIcon !== false);

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

const isTabDraggable = (tab: Tab) => tabsDraggable.value && !tab._isFirst && !tab._noDrag;

const getDropPosition = (event: DragEvent) => {
  const targetElement = event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined;
  if (!targetElement) return dropPosition.value;
  const rect = targetElement.getBoundingClientRect();
  return event.clientX > rect.left + rect.width / 2 ? "after" : "before";
};

const canDropTab = (sourceTab: Tab | undefined, targetTab: Tab, position: "before" | "after") => {
  if (!sourceTab || !isTabDraggable(sourceTab) || !isTabDraggable(targetTab)) return false;
  return tabsManager.canMoveTab(sourceTab._id, targetTab._id, position);
};

const handleDragStart = (event: DragEvent, tab: Tab) => {
  if (!isTabDraggable(tab)) {
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
  const sourceTab = tabsManager.getTabById(draggingTabId.value);
  const nextDropPosition = getDropPosition(event);
  if (!canDropTab(sourceTab, targetTab, nextDropPosition)) {
    dropTargetTabId.value = undefined;
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "none";
    }
    return;
  }

  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
  dropPosition.value = nextDropPosition;
  dropTargetTabId.value = targetTab._id;
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
  const sourceTab = tabsManager.getTabById(sourceTabId);
  const currentDropPosition = dropPosition.value;
  if (sourceTab && canDropTab(sourceTab, targetTab, currentDropPosition)) {
    await tabsManager.moveTab(sourceTab._id, targetTab._id, currentDropPosition);
  }
  handleDragEnd();
};

const handleDragEnd = () => {
  draggingTabId.value = undefined;
  dropTargetTabId.value = undefined;
  dropPosition.value = "before";
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
