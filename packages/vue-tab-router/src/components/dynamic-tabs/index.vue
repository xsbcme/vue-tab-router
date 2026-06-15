<template>
  <div class="tabs">
    <tabs-nav
      :tabs="displayTabs"
      :active-tab-id="activeTabId"
      :tabs-manager="tabsManager"
      :type="type"
      :show-icon="resolvedShowIcon"
      :default-icon="defaultIcon"
      :title-max-length="resolvedTitleMaxLength"
      :draggable="tabsDraggable"
      :virtual-options="tabsVirtualOptions"
      @select="handleSelectTab"
      @close="handleCloseTab"
      @contextmenu="openContextMenu"
    />

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
import { computed } from "vue";
import ContextMenu from "./context-menu.vue";
import TabsNav from "./tabs-nav.vue";
import { useTabContextMenu } from "./use-tab-context-menu";
import { useTabsManager } from "@/use-tabs-manager";
import type { TabsVirtualOptions } from "@/types";
import DetachedContainerComponent from "../detached-container.vue";

type TabsType = "text" | "line" | "card" | "rounded" | "capsule";

const props = withDefaults(
  defineProps<{
    type?: TabsType;
    showIcon?: boolean;
    defaultIcon?: string;
    /** 标签标题最大显示长度。优先级高于全局 render.tabs.titleMaxLength。 */
    titleMaxLength?: number;
    /** 是否启用拖拽排序。优先级高于全局 render.tabs.draggable。 */
    draggable?: boolean;
    /** 内置标签栏虚拟滚动配置。优先级高于全局 render.tabs.virtual，默认启用。 */
    virtual?: TabsVirtualOptions;
    /** 隐藏 _isFirst 标记的首页标签（预览模式下使用）。 */
    hideFirst?: boolean;
  }>(),
  {
    type: "text",
    showIcon: undefined,
    draggable: undefined,
    virtual: undefined,
    hideFirst: false,
  }
);

const tabsManager = useTabsManager();

const displayTabs = computed(() => (props.hideFirst ? tabsManager.tabs.filter(t => !t._isFirst) : tabsManager.tabs));
const activeTabId = computed(() => tabsManager.activeTab?._id);
const tabsDraggable = computed(() => props.draggable ?? tabsManager.options.tabsDraggable !== false);
const resolvedShowIcon = computed(() => props.showIcon ?? tabsManager.options.tabsShowIcon !== false);
const resolvedTitleMaxLength = computed(() => props.titleMaxLength ?? tabsManager.options?.tabsTitleMaxLength);
const tabsVirtualOptions = computed(() => [tabsManager.options.tabsVirtual, props.virtual]);
const handleSelectTab = (key: string) => tabsManager.changeActiveTab(key);
const handleCloseTab = (key: string) => {
  const tab = tabsManager.tabs.find(t => t._id === key);
  if (tab) tabsManager.closeTab(tab._id);
};

const { closeContextMenu, contextAction, contextMenu, handleDetachedError, openContextMenu } = useTabContextMenu(tabsManager);
</script>

<style lang="scss" scoped>
.tabs {
  padding: 6px 6px 0;
  width: 100%;
  min-width: 0;
  user-select: none;
  background: var(--tab-color-bg-base, #fff);
}

</style>
