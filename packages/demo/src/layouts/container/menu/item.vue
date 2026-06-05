<template>
  <template v-for="menu in menus">
    <template v-if="Array.isArray(menu.children) && menu.children.length > 0">
      <a-sub-menu :key="getMenuKey(menu)">
        <template #icon v-if="menu.icon || defaultIcon">
          <DynamicIconComponent :icon="menu.icon || defaultIcon" />
        </template>
        <template #title>
          <span :title="menu.name">{{ menu.name }}</span>
        </template>
        <MenuItemComponent :menus="menu.children" :defaultIcon="defaultIcon" :get-menu-key="getMenuKey" />
      </a-sub-menu>
    </template>
    <template v-else>
      <a-menu-item :key="getMenuKey(menu)">
        <template #icon v-if="menu.icon || defaultIcon">
          <DynamicIconComponent :icon="menu.icon || defaultIcon" />
        </template>
        <span :title="menu.name">{{ menu.name }}</span>
      </a-menu-item>
    </template>
  </template>
</template>

<script setup lang="ts">
import { Menu } from "@/model/menu";
import { IconApps } from "@arco-design/web-vue/es/icon";
import { DynamicIconComponent } from "@xsbcme/vue-tab-router";
import MenuItemComponent from "./item.vue";

defineOptions({
  components: {
    IconApps,
  },
});

withDefaults(
  defineProps<{
    menus: Menu[];
    defaultIcon?: string;
    getMenuKey: (menu: Menu) => string;
  }>(),
  {
    defaultIcon: "IconApps",
  }
);
</script>

<style lang="less" scoped></style>
