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
      <div class="navbar-title">{{ title }} {{ pluginVersion ?? "" }}</div>
    </div>
    <div class="navbar-container">
      <ThirdComponent />
    </div>
    <div class="navbar-control">
      <UserComponent />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import { IconMenuFold, IconMenuUnfold } from "@arco-design/web-vue/es/icon";
import { useTabsManager } from "@xsbcme/vue-tab-router";
import UserComponent from "./user.vue";
import ThirdComponent from "./third.vue";

defineProps<{
  menuCollapsed: boolean;
}>();

const emit = defineEmits<{
  (event: "toggleMenu"): void;
}>();

const tabsManager = useTabsManager();
const title = import.meta.env.VITE_SYSTEM_TITLE;
const pluginVersion = window.__PLUGIN_VERSION__;
const systemTitle = computed(() => `${title} ${pluginVersion ?? ""}`.trim());
</script>
<style lang="scss" scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid var(--color-border);
  padding: 8px 16px;
  gap: 8px;
  line-height: 40px;

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
    font-size: 22px;
    letter-spacing: 1px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    // color: #fff;
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
    padding: 8px 10px;
    gap: 8px;
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

    &-control {
      order: 3;
      flex: 0 0 auto;
      margin-left: auto;
    }

    &-container {
      flex: 1 1 auto;
      min-width: 0;
      order: 2;
      overflow: hidden;
    }
  }
}
</style>
