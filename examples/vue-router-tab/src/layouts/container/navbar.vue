<template>
  <div class="navbar">
    <a-button
      class="navbar-menu"
      type="text"
      :title="menuCollapsed ? '展开左侧菜单' : '收起左侧菜单'"
      @click="emit('toggleMenu')"
    >
      <template #icon>
        <IconMenuUnfold v-if="menuCollapsed" />
        <IconMenuFold v-else />
      </template>
    </a-button>
    <div class="navbar-wrapper" :title="systemTitle" @click.stop="tabsManager.activeFirstTab()">
      <div class="navbar-title">{{ title }}</div>
    </div>
    <div class="navbar-container">
      <ThirdComponent />
    </div>
    <div class="navbar-control">
      <UserComponent @logout="emit('logout')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconMenuFold, IconMenuUnfold } from "@arco-design/web-vue/es/icon";
import { useTabsManager } from "@xsbcme/vue-router-tab";
import ThirdComponent from "./third.vue";
import UserComponent from "./user.vue";

defineProps<{
  menuCollapsed: boolean;
}>();

const emit = defineEmits<{
  (event: "toggleMenu"): void;
  (event: "logout"): void;
}>();

const tabsManager = useTabsManager();
const title = "Vue Router Tab";
const systemTitle = title;
</script>

<style scoped lang="scss">
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 16px;
  line-height: 40px;
  background-color: #fff;
  border-bottom: 1px solid var(--color-border);

  &-menu {
    flex: 0 0 auto;
  }

  &-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    cursor: pointer;
    user-select: none;
  }

  &-title {
    overflow: hidden;
    color: var(--color-text-1);
    font-size: 22px;
    letter-spacing: 1px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &-container {
    flex: 1;
    overflow: hidden;
  }

  &-control {
    display: flex;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .navbar {
    flex-wrap: nowrap;
    gap: 8px;
    padding: 8px 10px;
    line-height: 32px;

    &-menu {
      order: 1;
    }

    &-wrapper {
      display: none;
    }

    &-title {
      font-size: 17px;
    }

    &-container {
      order: 2;
      flex: 1 1 auto;
      min-width: 0;
      overflow: hidden;
    }

    &-control {
      order: 3;
      flex: 0 0 auto;
      margin-left: auto;
    }
  }
}
</style>
