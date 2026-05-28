<template>
  <a-card :style="{ height: '100%' }">
    <div>当标签页关闭时触发回调，失败则无法关闭</div>
  </a-card>
</template>
<script lang="ts" setup>
import { onBeforeTabClose } from "@xsbcme/vue-tab-router";

onBeforeTabClose(async () => {
  return new Promise((r, j) => {
    window.confirm("是否允许关闭标签页") ? r() : j();
  });
});
</script>
<style lang="scss" scoped></style>
