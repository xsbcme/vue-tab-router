<template>
  <a-card :style="{ height: '100%' }">
    <div>离开标签页时触发回调，失败则无法离开</div>
  </a-card>
</template>
<script lang="ts" setup>
import { onBeforeTabLeave } from "@xsbcme/vue-tab-router";

onBeforeTabLeave(async () => {
  return new Promise((r, j) => {
    window.confirm("是否允许离开标签页") ? r() : j();
  });
});
</script>
<style lang="scss" scoped></style>
