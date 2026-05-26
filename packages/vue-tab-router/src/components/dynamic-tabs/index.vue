<template>
  <div class="tabs">
    <div class="tabs-nav" :class="`tabs-nav--${type}`">
      <tab-item
        v-for="tab in displayTabs"
        :key="tab._id"
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
import { reactive, computed } from "vue";
import { Tab } from "@/tab";
import TabItem from "./tab-item.vue";
import ContextMenu from "./context-menu.vue";
import { useTabsManager } from "@/use-tabs-manager";

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

const displayTabs = computed(() => (props.hideFirst ? tabsManager.tabs.filter(t => !t._isFirst) : tabsManager.tabs));

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
</script>

<style lang="scss" scoped>
.tabs {
  padding: var(--tab-spacing-xs, 4px);
  width: 100%;
  user-select: none;
}

.tabs-nav {
  display: flex;
  align-items: center;
  gap: var(--tab-spacing-xs, 2px);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;

  &::-webkit-scrollbar {
    height: var(--tab-spacing-xs, 4px);
  }

  &::-webkit-scrollbar-thumb {
    border-radius: var(--tab-radius-sm, 2px);
    background: rgba(0, 0, 0, 0.2);
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

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
    border: 1px solid transparent;
    border-radius: var(--tab-radius-sm, 4px) var(--tab-radius-sm, 4px) 0 0;

    &.is-active {
      border-color: var(--tab-color-border, #e5e6eb);
      border-bottom-color: transparent;
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
