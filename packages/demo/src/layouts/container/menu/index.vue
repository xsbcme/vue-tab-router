<template>
  <div class="menu">
    <a-menu :selected-keys="selectedKeys" @menu-item-click="handleMenuItemClick">
      <MenuItemComponent :menus="menus" />
    </a-menu>
  </div>
</template>
<script lang="ts" setup>
import { Menu } from "@/model/menu";
import { TreeUtil } from "@/utils";
import MenuItemComponent from "./item.vue";

const emit = defineEmits<{
  (event: "selectMenu", menu: Menu): void;
}>();

const props = defineProps<{
  menus: Menu[];
  selectedKeys?: string[];
}>();

const handleMenuItemClick = (menuUUID: string) => {
  const findMenu = TreeUtil.findTree<Menu>(props.menus, menu => menu.getUUID!() === menuUUID);
  findMenu && emit("selectMenu", findMenu);
};
</script>
<style lang="scss" scoped>
.menu {
  width: 100%;
  height: 100%;
  overflow: auto;
}
</style>
