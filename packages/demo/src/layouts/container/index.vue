<template>
  <div class="container">
    <a-layout :style="{ height: '100%' }">
      <a-layout-header>
        <NavbarComponent :menu-collapsed="menuCollapsed" @toggle-menu="toggleMenu" />
      </a-layout-header>
      <a-layout class="container-body" :style="{ overflow: 'hidden' }">
        <template v-if="menuStore.getMenus.length > 0">
          <a-layout-sider
            :collapsed="siderCollapsed"
            :class="{
              'is-mobile-menu-open': isMobile && !menuCollapsed,
              'is-mobile-menu-closed': isMobile && menuCollapsed,
            }"
            collapsible
            :hide-trigger="true"
            :width="isMobile ? 240 : 260"
            :collapsed-width="48"
            @update:collapsed="handleSiderCollapsedChange"
          >
            <MenuComponent
              :menus="menuStore.getMenus"
              :selected-keys="tabMenu.selectedKeys.value"
              :get-menu-key="tabMenu.getMenuKey"
              @select-menu="handleSelectMenu"
            />
          </a-layout-sider>
          <div
            v-if="isMobile"
            class="container-menu-mask"
            :class="{ 'is-open': !menuCollapsed }"
            @click="menuCollapsed = true"
          />
        </template>
        <a-layout>
          <template v-if="tabsMangager.tabs.length > 0">
            <TabbarComponent />
          </template>
          <DynamicBreadcrumbComponent
            class="container-breadcrumb"
            :menus="menuStore.getMenus"
            :get-menu-key="tabMenu.getMenuKey"
            :show-icon="false"
          />
          <a-layout-content :style="{ overflow: 'hidden' }">
            <ContentComponent />
          </a-layout-content>
        </a-layout>
      </a-layout>
    </a-layout>
  </div>
</template>
<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useMenuStore } from "@/plugins/store";
import { DynamicBreadcrumbComponent, useTabMenu, useTabsManager } from "@xsbcme/vue-tab-router";
import { Menu } from "@/model/menu";
import { Message } from "@arco-design/web-vue";
import NavbarComponent from "./navbar.vue";
import MenuComponent from "./menu/index.vue";
import TabbarComponent from "./tabbar.vue";
import ContentComponent from "./content.vue";

const menuStore = useMenuStore();
const tabsMangager = useTabsManager();
const isMobileLayout = () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;
const isMobile = ref(isMobileLayout());
const menuCollapsed = ref(isMobile.value);
const siderCollapsed = computed(() => (isMobile.value ? false : menuCollapsed.value));
const tabMenu = useTabMenu<Menu>({
  menus: () => menuStore.getMenus,
});

const syncMobileLayout = () => {
  const nextMobile = isMobileLayout();
  isMobile.value = nextMobile;
  menuCollapsed.value = nextMobile;
};

onMounted(() => {
  window.addEventListener("resize", syncMobileLayout);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncMobileLayout);
});

const toggleMenu = () => {
  menuCollapsed.value = !menuCollapsed.value;
};

const handleSiderCollapsedChange = (collapsed: boolean) => {
  if (!isMobile.value) {
    menuCollapsed.value = collapsed;
  }
};

const handleSelectMenu = async (menuKey: string) => {
  tabMenu.handleMenuItemClick(menuKey).catch(err => {
    if (err) {
      Message.error(err.message);
    }
  });
  if (isMobileLayout()) {
    menuCollapsed.value = true;
  }
};
</script>
<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--color-fill-2);

  :deep(.arco-layout-sider) {
    position: relative;
    user-select: none;
    padding-bottom: 30px;

    &::after {
      position: absolute;
      top: 0;
      right: -1px;
      display: block;
      width: 1px;
      height: 100%;
      background-color: var(--color-border);
      content: "";
    }
  }

  :deep(.arco-layout-sider-trigger) {
    height: 30px;
  }

  :deep(.arco-layout-sider-children) {
    overflow: hidden;
  }

  .container-breadcrumb {
    border-bottom: 1px solid var(--color-border);
  }

  .container-body {
    position: relative;
  }

  .container-menu-mask {
    display: none;
  }

  @media (max-width: 768px) {
    :deep(.arco-layout-sider) {
      --mobile-menu-width: min(240px, 78vw);

      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 30;
      width: var(--mobile-menu-width) !important;
      min-width: var(--mobile-menu-width) !important;
      max-width: var(--mobile-menu-width) !important;
      overflow: hidden;
      background: var(--color-bg-2);
      border-right: 1px solid var(--color-border-2);
      box-shadow: none;
      transform: translateX(0);
      visibility: visible;
      transition:
        transform 0.24s ease,
        box-shadow 0.16s ease 0.08s,
        border-color 0.24s ease,
        visibility 0s linear 0s;
    }

    :deep(.arco-layout-sider.is-mobile-menu-open) {
      box-shadow: 4px 0 14px rgba(29, 33, 41, 0.08);
    }

    :deep(.arco-layout-sider.is-mobile-menu-closed) {
      width: var(--mobile-menu-width) !important;
      min-width: var(--mobile-menu-width) !important;
      max-width: var(--mobile-menu-width) !important;
      border-right-color: transparent;
      box-shadow: none;
      pointer-events: none;
      transform: translateX(calc(-100% - 2px));
      visibility: hidden;
      transition:
        transform 0.24s ease,
        box-shadow 0.16s ease,
        border-color 0.24s ease,
        visibility 0s linear 0.24s;
    }

    :deep(.arco-layout-sider.is-mobile-menu-closed::after) {
      background-color: transparent;
    }

    .container-menu-mask {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: min(240px, 78vw);
      z-index: 25;
      display: block;
      background: rgba(29, 33, 41, 0.12);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.24s ease;

      &.is-open {
        opacity: 1;
        pointer-events: auto;
      }
    }

    .container-breadcrumb {
      overflow-x: auto;
      white-space: nowrap;
    }
  }
}
</style>
