<template>
  <teleport to="body">
    <template v-if="visible">
      <div class="tabs-ctx-overlay" @click="emit('close')" @contextmenu.prevent="emit('close')" />
      <ul class="tabs-ctx-menu" :style="{ left: x + 'px', top: y + 'px' }">
        <template v-for="(group, groupIndex) in menuGroups" :key="groupIndex">
          <li
            v-for="item in group"
            :key="item.action"
            :class="{ 'is-disabled': item.disabled }"
            @click="!item.disabled && emit('action', item.action)"
          >
            <component :is="item.icon" size="14" />
            {{ item.label }}
          </li>
          <li v-if="groupIndex < menuGroups.length - 1" class="tabs-ctx-menu__divider" aria-hidden="true" />
        </template>
      </ul>
    </template>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, markRaw } from "vue";
import IconRefresh from "../icons/icon-refresh.vue";
import IconArrowLeft from "../icons/icon-arrow-left.vue";
import IconArrowRight from "../icons/icon-arrow-right.vue";
import IconClose from "../icons/icon-close.vue";
import IconFolderDelete from "../icons/icon-folder-delete.vue";
import IconExternal from "../icons/icon-external.vue";
import IconPin from "../icons/icon-pin.vue";
import type { Tab } from "../../tab";

const props = defineProps<{
  visible: boolean;
  x: number;
  y: number;
  tab?: Tab | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "action", action: string): void;
}>();

const menuGroups = computed(() => [
  [{ action: "detach", icon: markRaw(IconExternal), label: "弹窗显示" }],
  [
    {
      action: "toggle-pinned",
      icon: markRaw(IconPin),
      label: props.tab?._pinned ? "取消置顶" : "置顶",
      disabled: Boolean(props.tab?._isFirst),
    },
    { action: "refresh", icon: markRaw(IconRefresh), label: "刷新此页" },
  ],
  [
    { action: "close-left", icon: markRaw(IconArrowLeft), label: "关闭左侧" },
    { action: "close-right", icon: markRaw(IconArrowRight), label: "关闭右侧" },
    { action: "close-other", icon: markRaw(IconClose), label: "关闭其他" },
    { action: "close-all", icon: markRaw(IconFolderDelete), label: "全部关闭" },
  ],
  [{ action: "refresh-all", icon: markRaw(IconRefresh), label: "全部刷新" }],
]);
</script>

<style lang="scss" scoped>
.tabs-ctx-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
}

.tabs-ctx-menu {
  position: fixed;
  z-index: 9999;
  margin: 0;
  padding: var(--tab-spacing-xs, 4px) 0;
  list-style: none;
  background: var(--tab-color-bg-elevated, #fff);
  border: 1px solid var(--tab-color-border, #e5e6eb);
  border-radius: var(--tab-radius-md, 6px);
  box-shadow: var(--tab-shadow-medium, 0 4px 16px rgba(0, 0, 0, 0.12));
  min-width: 140px;

  li:not(.tabs-ctx-menu__divider) {
    display: flex;
    align-items: center;
    gap: var(--tab-spacing-md, 8px);
    padding: var(--tab-spacing-sm, 7px) var(--tab-spacing-lg, 16px);
    cursor: pointer;
    font-size: var(--tab-font-size, 14px);
    color: var(--tab-color-text-primary, #1d2129);
    transition: background var(--tab-transition-duration, 0.1s) var(--tab-transition-timing, ease);

    &:hover {
      background: var(--tab-color-bg-hover, #f2f3f5);
    }

    &.is-disabled {
      color: var(--tab-color-text-disabled, #86909c);
      cursor: not-allowed;
      opacity: 0.55;

      &:hover {
        background: transparent;
      }
    }
  }

  &__divider {
    height: 1px;
    margin: var(--tab-spacing-xs, 4px) 0;
    padding: 0;
    background: var(--tab-color-border, #e5e6eb);
    cursor: default;
  }
}
</style>
