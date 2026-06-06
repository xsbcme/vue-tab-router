<template>
  <nav v-if="visibleItems.length" class="tab-breadcrumb" aria-label="标签页面包屑">
    <ol class="tab-breadcrumb__list">
      <li v-for="(item, index) in visibleItems" :key="item.key || index" class="tab-breadcrumb__item">
        <button
          v-if="item.clickable && index < visibleItems.length - 1"
          class="tab-breadcrumb__link"
          type="button"
          :title="item.title"
          @click="openBreadcrumb(item)"
        >
          <DynamicIcon v-if="showIcon && item.icon" width="14px" height="14px" :icon="item.icon" />
          <span>{{ item.title }}</span>
        </button>
        <span v-else class="tab-breadcrumb__current" :title="item.title">
          <DynamicIcon v-if="showIcon && item.icon" width="14px" height="14px" :icon="item.icon" />
          <span>{{ item.title }}</span>
        </span>
        <span v-if="index < visibleItems.length - 1" class="tab-breadcrumb__separator" aria-hidden="true">{{
          separator
        }}</span>
      </li>
    </ol>
  </nav>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import DynamicIcon from "../dynamic-icon.vue";
import { type TabBreadcrumbItem, type TabMenuItemLike, type UseTabMenuOptions, useTabMenu } from "../../use-tab-menu";

type BreadcrumbMenu = TabMenuItemLike;

const props = withDefaults(
  defineProps<{
    menus?: BreadcrumbMenu[];
    getChildren?: UseTabMenuOptions<BreadcrumbMenu>["getChildren"];
    getViewUrl?: UseTabMenuOptions<BreadcrumbMenu>["getViewUrl"];
    getViewName?: UseTabMenuOptions<BreadcrumbMenu>["getViewName"];
    getViewIcon?: UseTabMenuOptions<BreadcrumbMenu>["getViewIcon"];
    getViewProps?: UseTabMenuOptions<BreadcrumbMenu>["getViewProps"];
    getMenuKey?: UseTabMenuOptions<BreadcrumbMenu>["getMenuKey"];
    getTabKey?: UseTabMenuOptions<BreadcrumbMenu>["getTabKey"];
    separator?: string;
    showIcon?: boolean;
  }>(),
  {
    separator: "/",
    showIcon: true,
  }
);

const tabMenu = useTabMenu<BreadcrumbMenu>({
  menus: () => props.menus,
  getChildren: props.getChildren,
  getViewUrl: props.getViewUrl,
  getViewName: props.getViewName,
  getViewIcon: props.getViewIcon,
  getViewProps: props.getViewProps,
  getMenuKey: props.getMenuKey,
  getTabKey: props.getTabKey,
});

const visibleItems = computed(() => tabMenu.breadcrumbs.value.filter(item => item.title));

const openBreadcrumb = (item: TabBreadcrumbItem<BreadcrumbMenu>) => {
  if (item.menu) {
    return tabMenu.openMenu(item.menu);
  }

  if (item.viewUrl) {
    return tabMenu.tabsManager.openTab(item.viewUrl);
  }
};
</script>

<style lang="scss" scoped>
.tab-breadcrumb {
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;
  height: 32px;
  padding: 0 12px;
  color: var(--tab-color-text-secondary, #4e5969);
  font-size: var(--tab-font-size, 14px);
  background: var(--tab-color-bg-base, #fff);
}

.tab-breadcrumb__list {
  display: flex;
  align-items: center;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tab-breadcrumb__item {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  flex-shrink: 0;
}

.tab-breadcrumb__link,
.tab-breadcrumb__current {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 180px;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: 20px;
}

.tab-breadcrumb__link {
  cursor: pointer;

  &:hover {
    color: var(--tab-color-primary, #165dff);
  }
}

.tab-breadcrumb__current {
  color: var(--tab-color-text-primary, #1d2129);
  font-weight: 500;
}

.tab-breadcrumb__link span,
.tab-breadcrumb__current span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-breadcrumb__separator {
  flex-shrink: 0;
  margin: 0 8px;
  color: var(--tab-color-text-disabled, #86909c);
}
</style>
