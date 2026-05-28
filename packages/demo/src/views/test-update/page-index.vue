<template>
  <a-card :style="{ height: '100%' }">
    <div>
      <div>当前页面参数：{{ props }}</div>
      <div><button @click="handleUpdateParams">更新页面参数</button></div>
    </div>
  </a-card>
</template>
<script lang="ts" setup>
import { useTabsManager } from "@xsbcme/vue-tab-router";

const props = defineProps<{
  a?: string;
}>();

const tabsManager = useTabsManager();

const handleUpdateParams = () => {
  tabsManager.updateTabOptions({
    a: new Date().getTime().toString(),
  });
};
</script>
<style lang="scss" scoped></style>
