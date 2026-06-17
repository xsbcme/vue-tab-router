<template>
  <div class="tabbar">
    <DynamicTabsComponent />
  </div>
</template>

<script setup lang="ts">
import { DynamicTabsComponent } from "@xsbcme/vue-router-tab";
</script>

<style scoped lang="scss">
.tabbar {
  width: 100%;
  background-color: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border);
}
</style>
