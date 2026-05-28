<template>
  <a-card :style="{ height: '100%' }">
    <div>
      <div>扫描页面结果：</div>
      <ul>
        <template v-for="path in tabsManager.registerTabPaths">
          <li>{{ path }}</li>
        </template>
      </ul>
    </div>
  </a-card>
</template>
<script lang="ts" setup>
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();
</script>
<style lang="scss" scoped></style>
