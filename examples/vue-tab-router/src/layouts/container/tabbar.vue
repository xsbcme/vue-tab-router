<template>
  <div class="tabbar">
    <DynamicTabsComponent />
  </div>
</template>
<script lang="ts" setup>
import { DynamicTabsComponent } from "@xsbcme/vue-tab-router";
</script>
<style lang="scss" scoped>
.tabbar {
  background-color: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border);
  width: 100%;
}
</style>
