<template>
  <div class="menu">
    <a-menu :selected-keys="selectedKeys" auto-scroll-into-view>
      <RouterTabsLink v-for="item in routeMenus" :key="item.key" v-slot="{ navigate, href }" :to="item.to" custom>
        <a-menu-item :key="item.key" @click="handleMenuClick(navigate)">
          <template #icon>
            <IconHome v-if="item.icon === 'home'" />
            <IconStorage v-else-if="item.icon === 'storage'" />
            <IconApps v-else />
          </template>
          <a :href="href">{{ item.label }}</a>
        </a-menu-item>
      </RouterTabsLink>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
import { RouterTabsLink } from "@xsbcme/vue-router-tab";
import { routeMenus } from "../../model/route-menu";

defineProps<{
  selectedKeys: string[];
}>();

const emit = defineEmits<{
  (event: "select-menu"): void;
}>();

const handleMenuClick = (navigate: () => void) => {
  navigate();
  emit("select-menu");
};
</script>

<style scoped lang="scss">
.menu {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.menu :deep(.arco-menu-item a) {
  color: inherit;
}
</style>
