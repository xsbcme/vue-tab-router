<template>
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
      <div ref="tabsNavRef" class="tabs-nav" :class="`tabs-nav--${type}`" :style="{ width: virtualTotalWidth + 'px' }">
        <tab-item
          v-for="virtualTab in virtualTabs"
          :key="virtualTab.tab._id"
          :ref="el => setTabItemRef(virtualTab.tab._id, el)"
          :data-tab-id="virtualTab.tab._id"
          class="tabs-nav__virtual-item"
          :class="{
            'is-dragging': draggingTabId === virtualTab.tab._id,
            'is-drop-target': dropTargetTabId === virtualTab.tab._id,
            'is-drop-before': dropTargetTabId === virtualTab.tab._id && dropPosition === 'before',
            'is-drop-after': dropTargetTabId === virtualTab.tab._id && dropPosition === 'after',
          }"
          :style="{ transform: `translateX(${virtualTab.offset}px)` }"
          :tab="virtualTab.tab"
          :is-active="virtualTab.tab._id === activeTabId"
          :show-icon="showIcon"
          :default-icon="defaultIcon"
          :max-title-length="titleMaxLength"
          :draggable="isTabDraggable(virtualTab.tab)"
          :show-divider="virtualTab.index > 0"
          @select="emit('select', $event)"
          @close="emit('close', $event)"
          @contextmenu="emit('contextmenu', $event, virtualTab.tab)"
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
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { Tab } from "@/tabs/tab";
import type { TabsManager } from "@/tabs/tabs-manager";
import type { TabsVirtualOptions } from "@/types";
import TabItem from "./tab-item.vue";
import { useTabDrag } from "./use-tab-drag";
import { useTabScroll } from "./use-tab-scroll";
import { useTabVirtualList } from "./use-tab-virtual-list";
import IconArrowLeft from "../icons/icon-arrow-left.vue";
import IconArrowRight from "../icons/icon-arrow-right.vue";

type TabsType = "text" | "line" | "card" | "rounded" | "capsule";

const props = defineProps<{
  tabs: Tab[];
  activeTabId?: string;
  tabsManager: TabsManager;
  type: TabsType;
  showIcon: boolean;
  defaultIcon?: string;
  titleMaxLength?: number;
  draggable: boolean;
  virtualOptions: Array<TabsVirtualOptions | undefined>;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "close", id: string): void;
  (e: "contextmenu", event: MouseEvent, tab: Tab): void;
}>();

const tabsViewportRef = ref<HTMLDivElement>();
const tabsNavRef = ref<HTMLDivElement>();
const viewportWidth = ref(0);
const scrollLeft = ref(0);
const tabsRef = computed(() => props.tabs);
const activeTabIdRef = computed(() => props.activeTabId);
const virtualOptionsRef = computed(() => props.virtualOptions);
const titleMaxLengthRef = computed(() => props.titleMaxLength);
const showIconRef = computed(() => props.showIcon);
const defaultIconRef = computed(() => props.defaultIcon);
const isCoarsePointer = ref(false);
let updateMeasuredScrollState: () => void = () => undefined;
let pointerMediaQuery: MediaQueryList | undefined;

const updatePointerType = () => {
  isCoarsePointer.value = Boolean(pointerMediaQuery?.matches);
};

onMounted(() => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
  pointerMediaQuery = window.matchMedia("(pointer: coarse)");
  updatePointerType();
  pointerMediaQuery.addEventListener?.("change", updatePointerType);
});

onBeforeUnmount(() => {
  pointerMediaQuery?.removeEventListener?.("change", updatePointerType);
});

const { resolvedVirtualOptions, setTabItemRef, virtualMetrics, virtualTabs, virtualTotalWidth } = useTabVirtualList({
  tabs: tabsRef,
  scrollLeft,
  viewportWidth,
  virtualOptions: virtualOptionsRef,
  maxTitleLength: titleMaxLengthRef,
  showIcon: showIconRef,
  defaultIcon: defaultIconRef,
  onMeasure: () => updateMeasuredScrollState(),
});

const { canScrollLeft, canScrollRight, handleWheel, isOverflowing, scrollTabs, updateScrollState } = useTabScroll({
  tabs: tabsRef,
  activeTabId: activeTabIdRef,
  tabsViewportRef,
  tabsNavRef,
  viewportWidth,
  scrollLeft,
  virtualMetrics,
  estimatedActiveWidth: computed(() => resolvedVirtualOptions.value.estimatedWidth),
});

updateMeasuredScrollState = updateScrollState;

const isTabDraggable = (tab: Tab) => props.draggable && !isCoarsePointer.value && !tab._isFirst && !tab._noDrag;
const { draggingTabId, dropPosition, dropTargetTabId, handleDragEnd, handleDragLeave, handleDragOver, handleDragStart, handleDrop } =
  useTabDrag({ tabsManager: props.tabsManager, isTabDraggable });
</script>

<style lang="scss" scoped>
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
  position: relative;
  width: max-content;
  min-width: 100%;
  height: 36px;

  :deep(.tabs-nav__virtual-item) {
    position: absolute;
    top: 2px;
    left: 0;
    will-change: transform;
  }

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

  &--card :deep(.tabs-nav__item) {
    border-radius: 8px 8px 0 0;

    &.is-active {
      background: var(--tab-color-bg-base, #fff);
    }
  }

  &--rounded :deep(.tabs-nav__item) {
    border-radius: var(--tab-radius-lg, 20px);
  }

  &--capsule :deep(.tabs-nav__item) {
    border-radius: var(--tab-radius-capsule, 16px);
    padding: 3px 12px;
  }
}
</style>