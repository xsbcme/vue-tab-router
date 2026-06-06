<template>
  <div class="container">
    <a-layout :style="{ height: '100%' }">
      <a-layout-header>
        <NavbarComponent />
      </a-layout-header>
      <a-layout :style="{ overflow: 'hidden' }">
        <template v-if="menuStore.getMenus.length > 0">
          <a-layout-sider collapsible breakpoint="xl" :width="260">
            <MenuComponent
              :menus="menuStore.getMenus"
              :selected-keys="tabMenu.selectedKeys.value"
              :get-menu-key="tabMenu.getMenuKey"
              @select-menu="handleSelectMenu"
            />
          </a-layout-sider>
        </template>
        <a-layout>
          <template v-if="tabsMangager.tabs.length > 0">
            <TabbarComponent />
          </template>
          <a-layout-content :style="{ overflow: 'hidden' }">
            <ContentComponent />
          </a-layout-content>
        </a-layout>
      </a-layout>
    </a-layout>
  </div>
</template>
<script lang="ts" setup>
import { useMenuStore } from "@/plugins/store";
import { useTabMenu, useTabsManager } from "@xsbcme/vue-tab-router";
import { Menu } from "@/model/menu";
import { Message } from "@arco-design/web-vue";
import NavbarComponent from "./navbar.vue";
import MenuComponent from "./menu/index.vue";
import TabbarComponent from "./tabbar.vue";
import ContentComponent from "./content.vue";

const menuStore = useMenuStore();
const tabsMangager = useTabsManager();
const tabMenu = useTabMenu<Menu>({
  menus: () => menuStore.getMenus,
});

const handleSelectMenu = async (menuKey: string) => {
  tabMenu.handleMenuItemClick(menuKey).catch(err => {
    if (err) {
      Message.error(err.message);
    }
  });
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
}
</style>
