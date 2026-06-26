<template>
  <div
    class="tabs-nav__item"
    :class="{ 'is-active': isActive, 'is-closable': !tab._noClose, 'is-pinned': tab._pinned }"
    :draggable="draggable"
    :title="tab._pinned ? '已置顶' : undefined"
    @click="emit('select', tab._id)"
    @contextmenu.prevent="e => emit('contextmenu', e, tab)"
    @dragstart="e => emit('dragstart', e, tab)"
    @dragover="e => emit('dragover', e, tab)"
    @dragleave="e => emit('dragleave', e, tab)"
    @drop="e => emit('drop', e, tab)"
    @dragend="emit('dragend')"
  >
    <div class="tabs-title">
      <IconPin v-if="tab._pinned" class="tabs-title__pin" size="13" aria-hidden="true" />
      <template v-if="showIcon && (tab.viewIcon || defaultIcon)">
        <dynamic-icon width="16px" height="16px" :icon="tab.viewIcon || defaultIcon" />
      </template>
      <TruncatedText :text="tab._loading ? '加载中...' : tab.viewName || '未命名'" :max-length="maxTitleLength" />
    </div>
    <span v-if="showDivider" class="tabs-nav__divider" />
    <button
      v-if="!tab._noClose"
      class="tabs-nav__close"
      type="button"
      aria-label="关闭标签页"
      @click.stop="emit('close', tab._id)"
    >
      <icon-close size="10" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { Tab } from "@/tabs/tab";
import TruncatedText from "./truncated-text.vue";
import DynamicIcon from "../dynamic-icon.vue";
import IconClose from "../icons/icon-close.vue";
import IconPin from "../icons/icon-pin.vue";

defineProps<{
  tab: Tab;
  isActive: boolean;
  showIcon: boolean;
  defaultIcon?: string;
  maxTitleLength?: number;
  draggable?: boolean;
  showDivider?: boolean;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "close", id: string): void;
  (e: "contextmenu", event: MouseEvent, tab: Tab): void;
  (e: "dragstart", event: DragEvent, tab: Tab): void;
  (e: "dragover", event: DragEvent, tab: Tab): void;
  (e: "dragleave", event: DragEvent, tab: Tab): void;
  (e: "drop", event: DragEvent, tab: Tab): void;
  (e: "dragend"): void;
}>();
</script>

<style lang="scss" scoped>
.tabs-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: 0;
  max-width: 220px;
  width: 100%;
}

.tabs-title__pin {
  flex-shrink: 0;
  color: var(--tab-color-primary, #165dff);
}

.tabs-nav__item {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  max-width: min(260px, calc(100vw - 96px));
  height: 34px;
  padding: 0 16px;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  white-space: nowrap;
  overflow: visible;
  transition:
    background var(--tab-transition-duration, 0.15s) var(--tab-transition-timing, ease),
    color var(--tab-transition-duration, 0.15s) var(--tab-transition-timing, ease),
    box-shadow var(--tab-transition-duration, 0.15s) var(--tab-transition-timing, ease);
  color: var(--tab-color-text-secondary, #4e5969);
  font-size: var(--tab-font-size, 14px);
  flex-shrink: 0;
  background: var(--tab-color-bg-base, #fff);

  &.is-closable {
    padding-right: 30px;
    padding-left: 24px;
  }

  &[draggable="true"] {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  &::before,
  &::after {
    content: "";
    position: absolute;
    pointer-events: none;
    transition: none;
  }

  &::before {
    left: -8px;
    bottom: 0;
    width: 8px;
    height: 8px;
    opacity: 0;
  }

  &::after {
    right: -8px;
    bottom: 0;
    width: 8px;
    height: 8px;
    opacity: 0;
  }

  &:hover {
    z-index: 1;
    background: var(--tab-color-bg-hover, #f5f6f8);
    color: var(--tab-color-text-primary, #1d2129);
  }

  &.is-dragging {
    opacity: 0.5;
  }

  &.is-drop-before {
    box-shadow: inset 2px 0 0 var(--tab-color-primary, #165dff);
  }

  &.is-drop-after {
    box-shadow: inset -2px 0 0 var(--tab-color-primary, #165dff);
  }

  &:hover::before,
  &:hover::after,
  &.is-active::before,
  &.is-active::after {
    background: transparent;
    opacity: 1;
  }

  &:hover::before {
    left: -8px;
    background: radial-gradient(circle at 0 0, transparent 0 8px, var(--tab-color-bg-hover, #f5f6f8) 8.5px);
  }

  &:hover::after {
    background: radial-gradient(circle at 100% 0, transparent 0 8px, var(--tab-color-bg-hover, #f5f6f8) 8.5px);
  }

  &.is-active {
    z-index: 2;
    background: var(--tab-color-bg-active, #e8ebef);
    color: var(--tab-color-text-primary, #1d2129);
    font-weight: 500;
    box-shadow:
      0 -1px 0 rgba(0, 0, 0, 0.02),
      0 1px 4px rgba(15, 23, 42, 0.08);
    &::before {
      left: -8px;
      background: radial-gradient(circle at 0 0, transparent 0 8px, var(--tab-color-bg-active, #e8ebef) 8.5px);
    }

    &::after {
      background: radial-gradient(circle at 100% 0, transparent 0 8px, var(--tab-color-bg-active, #e8ebef) 8.5px);
    }
  }

  &.is-pinned {
    color: var(--tab-color-text-primary, #1d2129);
    box-shadow: inset 0 2px 0 var(--tab-color-primary, #165dff);
  }

  &.is-pinned:not(.is-active) {
    background: var(--tab-color-bg-hover, #f5f6f8);
  }

  &:hover .tabs-nav__divider,
  &.is-active .tabs-nav__divider {
    opacity: 0;
  }

  &:hover + .tabs-nav__item .tabs-nav__divider,
  &.is-active + .tabs-nav__item .tabs-nav__divider {
    opacity: 0;
  }

  &:hover .tabs-nav__close,
  &:focus-within .tabs-nav__close {
    opacity: 1;
    pointer-events: auto;
  }
}

.tabs-nav__divider {
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: var(--tab-color-border, #d8dce3);
  opacity: 0.9;
  pointer-events: none;
  transition: opacity var(--tab-transition-duration, 0.15s) var(--tab-transition-timing, ease);
}

.tabs-nav__close {
  position: absolute;
  right: 8px;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--tab-color-text-disabled, #86909c);
  cursor: pointer;
  z-index: 3;
  opacity: 0;
  pointer-events: auto;
  transform: translateY(-50%);
  transition:
    opacity var(--tab-transition-duration, 0.15s) var(--tab-transition-timing, ease),
    background var(--tab-transition-duration, 0.15s) var(--tab-transition-timing, ease),
    color var(--tab-transition-duration, 0.15s) var(--tab-transition-timing, ease);

  &:hover {
    background: var(--tab-color-border, #d8dce3);
    color: var(--tab-color-text-primary, #1d2129);
    opacity: 1;
    pointer-events: auto;
  }

  &:focus-visible {
    opacity: 1;
    outline: 2px solid var(--tab-color-primary, #165dff);
    outline-offset: 1px;
  }
}

:deep(.truncated-text) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
