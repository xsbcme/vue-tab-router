<template>
  <div class="menu">
    <a-menu :selected-keys="selectedKeys" auto-scroll-into-view auto-open-selected @menu-item-click="handleMenuItemClick">
      <MenuItemComponent :menus="menus" :get-menu-key="getMenuKey" />
    </a-menu>
  </div>
</template>
<script lang="ts" setup>
import { Menu } from "@/model/menu";
import MenuItemComponent from "./item.vue";

const emit = defineEmits<{
  (event: "selectMenu", menuKey: string): void;
}>();

defineProps<{
  menus: Menu[];
  selectedKeys?: string[];
  getMenuKey: (menu: Menu) => string;
}>();

const handleMenuItemClick = (menuUUID: string) => {
  emit("selectMenu", menuUUID);
};
</script>
<style lang="scss" scoped>
.menu {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
