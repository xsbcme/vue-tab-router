<template>
  <div class="navbar">
    <div class="navbar-wrapper" @click.stop="tabsManager.activeFirstTab()">
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
import { useTabsManager } from "@xsbcme/vue-tab-router";
import UserComponent from "./user.vue";
import ThirdComponent from "./third.vue";

const tabsManager = useTabsManager();
const title = import.meta.env.VITE_SYSTEM_TITLE;
const pluginVersion = window.__PLUGIN_VERSION__;
</script>
<style lang="scss" scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid var(--color-border);
  padding: 8px 16px;
  gap: 8px;
  line-height: 40px;

  &-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }

  &-title {
    font-size: 22px;
    letter-spacing: 1px;
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
</style>
